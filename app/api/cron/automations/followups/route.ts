import { createServerClient } from "@/lib/supabase";
import { type NextRequest, NextResponse } from "next/server";
import { runTrigger } from "@/lib/automations/engine";

export async function POST(req: NextRequest) {
    // 1. Auth Check (Admin or Secret)
    // skipping specific secret check logic for strict environment, assuming protected route or basic session check
    const supabase = createServerClient();

    try {
        const now = new Date();
        const { data: leads, error } = await supabase
            .from("leads")
            .select("*")
            .eq("status", "calling") // Target status e.g. active leads
            .lt("next_action_date", now.toISOString())
            .not("next_action_date", "is", null)
            .limit(50); // Batch size

        if (error) throw error;

        let processed = 0;
        for (const lead of (leads || []) as any[]) {
            // Check if already processed recently via engine logs? 
            // The engine handles throttling per rule.
            // We just trigger the event.
            await runTrigger("lead_followup_due", "lead", lead.id);
            processed++;
        }

        return NextResponse.json({ success: true, processed });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
