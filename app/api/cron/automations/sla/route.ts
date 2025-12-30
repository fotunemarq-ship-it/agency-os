import { createServerClient } from "@/lib/supabase";
import { type NextRequest, NextResponse } from "next/server";
import { runTrigger } from "@/lib/automations/engine";

export async function POST(req: NextRequest) {
    const supabase = createServerClient();
    try {
        const now = new Date();
        // Combined SLA Logic: Inbound (30m) & Outbound (24h)
        // We use the same thresholds as before but delegate action execution to the Rules Engine

        // 1. Inbound > 30m, uncontacted
        const inboundThreshold = new Date(now.getTime() - 30 * 60000);
        const { data: inboundMissed } = await supabase
            .from("leads")
            .select("id")
            .eq("lead_type", "inbound")
            .is("last_contacted_at", null)
            .lt("created_at", inboundThreshold.toISOString())
            .eq("stale_flag", false) // Prevent re-triggering constantly if rules engine flags heavily
            .limit(50);

        if (inboundMissed) {
            for (const lead of (inboundMissed || []) as any[]) {
                // We rely on the rule engine to mark it stale, notify logic, etc
                // BUT we need to ensure we don't spam.
                // Engine has throttling. But if the rule action doesn't mark it stale, this query finds it again.
                // Users must ensure rules handle state change (e.g. mark stale) or throttle is long enough.
                await runTrigger("lead_sla_missed", "lead", lead.id);
            }
        }

        // 2. Outbound > 24h, uncontacted
        const outboundThreshold = new Date(now.getTime() - 24 * 60 * 60000);
        const { data: outboundMissed } = await supabase
            .from("leads")
            .select("id")
            .is("lead_type", null) // defaulting null/outbound logic
            // .eq("lead_type", "outbound") // strict check if needed
            .is("last_contacted_at", null)
            .lt("created_at", outboundThreshold.toISOString())
            .eq("stale_flag", false)
            .limit(50);

        if (outboundMissed) {
            for (const lead of (outboundMissed || []) as any[]) {
                await runTrigger("lead_sla_missed", "lead", lead.id);
            }
        }

        return NextResponse.json({ success: true, processed_inbound: inboundMissed?.length, processed_outbound: outboundMissed?.length });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
