import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// Helper to calculate date range
function getDateRange(period: string) {
    const now = new Date();
    const today = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
    const end = today;
    let start = today;

    if (period === 'week') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        start = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    } else if (period === 'month') {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        start = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    }

    return { start, end };
}

export async function GET(req: NextRequest) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const startParam = url.searchParams.get('start');
    const endParam = url.searchParams.get('end');
    const period = url.searchParams.get('period') || 'today'; // today | week | month

    let { start, end } = getDateRange(period);
    if (startParam) start = startParam;
    if (endParam) end = endParam;

    try {
        // Use RPC function
        const { data: stats, error } = await (supabase.rpc('get_work_hours_report', {
            p_start_date: start,
            p_end_date: end,
            p_timezone: 'Asia/Kolkata'
        } as any) as any);

        if (error) throw error;

        // In a real app, we'd join with 'profiles' here using IDs.
        // For now, we return IDs. If needed, frontend can map known IDs or we fetch profile map.

        // Aggregate by user for "Totals" view
        const userTotals: any = {};

        (stats || []).forEach((row: any) => {
            if (!userTotals[row.user_id]) {
                userTotals[row.user_id] = {
                    user_id: row.user_id,
                    total_hours: 0,
                    days_present: 0,
                    sessions: 0
                };
            }
            userTotals[row.user_id].total_hours += parseFloat(row.total_hours);
            userTotals[row.user_id].days_present += 1;
            userTotals[row.user_id].sessions += parseInt(row.sessions_count);
        });

        // Compute Averages
        const aggregated = Object.values(userTotals).map((u: any) => ({
            ...u,
            total_hours: parseFloat(u.total_hours.toFixed(2)),
            avg_daily_hours: u.days_present > 0 ? parseFloat((u.total_hours / u.days_present).toFixed(2)) : 0
        }));

        return NextResponse.json({
            period,
            range: { start, end },
            daily_stats: stats,
            aggregated
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
