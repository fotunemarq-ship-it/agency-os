import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getLocalISODate, updateDailySummary } from "@/lib/attendance/calc";

export async function POST(req: NextRequest) {
    const supabase = createServerClient() as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // 1. Find Open Session
        const { data: session } = await supabase.from('attendance_sessions')
            .select('id, session_date')
            .eq('user_id', user.id)
            .eq('status', 'open')
            .single();

        if (!session) {
            return NextResponse.json({ error: "No open session found." }, { status: 400 });
        }

        const now = new Date().toISOString();

        // 2. Close any open breaks first
        await supabase.from('attendance_breaks')
            .update({ break_end_at: now })
            .eq('session_id', session.id)
            .is('break_end_at', null);

        // 3. Close Session
        const { error } = await supabase.from('attendance_sessions')
            .update({
                clock_out_at: now,
                status: 'closed'
            })
            .eq('id', session.id);

        if (error) throw error;

        // 4. Update Summary
        await updateDailySummary(user.id, session.session_date);

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
