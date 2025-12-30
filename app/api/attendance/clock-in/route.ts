import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getLocalISODate, updateDailySummary } from "@/lib/attendance/calc";
import { logActivity } from "@/lib/audit"; // Assuming this exists from prompt context

export async function POST(req: NextRequest) {
    const supabase = createServerClient() as any;

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // 2. Check for existing open session
        const { count } = await supabase.from('attendance_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'open');

        if (count && count > 0) {
            return NextResponse.json({ error: "You are already clocked in." }, { status: 400 });
        }

        // 3. Create Session
        const today = getLocalISODate();
        const { data: session, error } = await supabase.from('attendance_sessions').insert({
            user_id: user.id,
            session_date: today,
            clock_in_at: new Date().toISOString(),
            status: 'open'
        }).select().single();

        if (error) throw error;

        // 4. Update Summary & Audit
        await updateDailySummary(user.id, today);
        // Assuming activity log utils exist
        // await logActivity({ ... }) 

        return NextResponse.json({ success: true, session });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
