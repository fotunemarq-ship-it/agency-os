import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { updateDailySummary } from "@/lib/attendance/calc";

export async function POST(req: NextRequest) {
    const supabase = createServerClient() as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const action = req.nextUrl.searchParams.get('action'); // start | end

    try {
        // Find Open Session
        const { data: session } = await supabase.from('attendance_sessions')
            .select('id, session_date')
            .eq('user_id', user.id)
            .eq('status', 'open')
            .single();

        if (!session) return NextResponse.json({ error: "No open session." }, { status: 400 });

        if (action === 'start') {
            // Check if already on break
            const { count } = await supabase.from('attendance_breaks')
                .select('*', { count: 'exact', head: true })
                .eq('session_id', session.id)
                .is('break_end_at', null);

            if (count && count > 0) return NextResponse.json({ error: "Break already active." }, { status: 400 });

            await supabase.from('attendance_breaks').insert({
                session_id: session.id,
                break_start_at: new Date().toISOString()
            });

        } else if (action === 'end') {
            // Find open break
            const { data: brk } = await supabase.from('attendance_breaks')
                .select('id')
                .eq('session_id', session.id)
                .is('break_end_at', null)
                .single();

            if (!brk) return NextResponse.json({ error: "No active break." }, { status: 400 });

            await supabase.from('attendance_breaks').update({
                break_end_at: new Date().toISOString()
            }).eq('id', brk.id);

        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        await updateDailySummary(user.id, session.session_date);

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
