import { createServerClient } from "@/lib/supabase";

/**
 * Calculates and updates the daily summary for a user given a specific day.
 * Should be called after any Clock In, Clock Out, Break Start, or Break End.
 */
export async function updateDailySummary(userId: string, date: string) {
    const supabase = createServerClient() as any;

    // 1. Fetch all sessions for this user on this day
    const { data: sessions } = await supabase
        .from('attendance_sessions')
        .select(`
            id, 
            clock_in_at, 
            clock_out_at, 
            status,
            attendance_breaks ( break_start_at, break_end_at )
        `)
        .eq('user_id', userId)
        .eq('session_date', date);

    if (!sessions || sessions.length === 0) return;

    let grossMs = 0;
    let breakMs = 0;
    let isComplete = true;
    const flags: any = {};

    // 2. Calculate Durations
    for (const session of sessions) {
        const start = new Date(session.clock_in_at).getTime();
        const end = session.clock_out_at ? new Date(session.clock_out_at).getTime() : Date.now();

        if (!session.clock_out_at) {
            isComplete = false;
            flags.open_session = true;
        }

        if (session.status === 'flagged') {
            flags.missed_clockout = true;
        }

        grossMs += (end - start);

        // Breaks
        if (session.attendance_breaks) {
            for (const brk of session.attendance_breaks) { // Fixed: using any for now as types might lag
                const bStart = new Date(brk.break_start_at).getTime();
                const bEnd = brk.break_end_at ? new Date(brk.break_end_at).getTime() : Date.now();

                const duration = bEnd - bStart;
                breakMs += duration;

                if (duration > 90 * 60 * 1000) { // Example: Flag long breaks > 90m
                    flags.long_break = true;
                }
            }
        }
    }

    const grossMinutes = Math.floor(grossMs / 60000);
    const breakMinutes = Math.floor(breakMs / 60000);
    let netMinutes = grossMinutes - breakMinutes;
    if (netMinutes < 0) netMinutes = 0;

    // 3. Upsert Summary
    await supabase.from('attendance_daily_summary').upsert({
        user_id: userId,
        day: date,
        gross_minutes: grossMinutes,
        break_minutes: breakMinutes,
        net_minutes: netMinutes,
        sessions_count: sessions.length,
        is_complete: isComplete,
        flags: flags
    }, { onConflict: 'user_id, day' });
}

/**
 * Helper to get current Date in Asia/Kolkata format YYYY-MM-DD
 */
export function getLocalISODate() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    // en-CA is YYYY-MM-DD
}
