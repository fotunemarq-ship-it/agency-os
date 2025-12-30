import { createServerClient } from "@/lib/supabase";
import { type NextRequest, NextResponse } from "next/server";
import { logActivity } from "@/lib/audit";

export async function GET(req: NextRequest) {
    // In production, verify a CRON_SECRET header to prevent public access
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return new NextResponse('Unauthorized', { status: 401 });

    const supabase = createServerClient();
    const now = new Date();

    // Define SLA Thresholds
    const INBOUND_SLA_MINUTES = 30;
    const OUTBOUND_SLA_HOURS = 24;

    const inboundThreshold = new Date(now.getTime() - INBOUND_SLA_MINUTES * 60000);
    const outboundThreshold = new Date(now.getTime() - OUTBOUND_SLA_HOURS * 3600000);

    let updatedCount = 0;

    try {
        // 1. Check Inbound Leads (created > 30mins ago, never contacted, not already stale)
        const { data: staleInbound, error: inboundError } = await (supabase.from("leads") as any)
            .select("*")
            .eq("lead_type", "inbound")
            .is("last_contacted_at", null)
            .lt("created_at", inboundThreshold.toISOString())
            .eq("stale_flag", false) // only process if not yet flagged
            .limit(100);

        if (inboundError) throw inboundError;

        if (staleInbound && staleInbound.length > 0) {
            for (const lead of staleInbound) {
                // Update lead
                await (supabase.from("leads") as any).update({
                    stale_flag: true,
                    stale_reason: "SLA Missed: Inbound not contacted within 30 mins"
                }).eq("id", lead.id);

                // Log Event (Activity Only, System Action)
                await logActivity({
                    entity_type: "lead",
                    entity_id: lead.id,
                    event_type: "sla_missed",
                    title: "SLA Missed (Inbound)",
                    body: "Lead was not contacted within 30 minutes of creation.",
                    metadata: { sla_limit: "30m", minutes_overdue: Math.round((now.getTime() - new Date(lead.created_at).getTime()) / 60000) }
                });

                updatedCount++;
            }
        }

        // 2. Check Outbound Leads (created > 24h ago, never contacted, not stale)
        const { data: staleOutbound, error: outboundError } = await (supabase.from("leads") as any)
            .select("*")
            .or("lead_type.eq.outbound,lead_type.is.null")
            .is("last_contacted_at", null)
            .lt("created_at", outboundThreshold.toISOString())
            .eq("stale_flag", false)
            .limit(100);

        if (outboundError) throw outboundError;

        if (staleOutbound && staleOutbound.length > 0) {
            for (const lead of staleOutbound) {
                await (supabase.from("leads") as any).update({
                    stale_flag: true,
                    stale_reason: "SLA Missed: Outbound not contacted within 24 hours"
                }).eq("id", lead.id);

                await logActivity({
                    entity_type: "lead",
                    entity_id: lead.id,
                    event_type: "sla_missed",
                    title: "SLA Missed (Outbound)",
                    body: "Lead was not contacted within 24 hours of assignment.",
                    metadata: { sla_limit: "24h", hours_overdue: Math.round((now.getTime() - new Date(lead.created_at).getTime()) / 3600000) }
                });

                updatedCount++;
            }
        }

        return NextResponse.json({ success: true, leads_flagged: updatedCount, message: "SLA Check Complete" });
    } catch (err: any) {
        console.error("SLA Cron Error", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
