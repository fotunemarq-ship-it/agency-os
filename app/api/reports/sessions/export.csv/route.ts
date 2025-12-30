import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { data: sessions, error } = await supabase
            .from('user_sessions_clamped') // use view
            .select('user_id, login_at, logout_at, last_seen_at, duration_hours_clamped, ip_address, user_agent, ended_reason')
            .order('login_at', { ascending: false })
            .limit(1000); // safety limit

        if (error) throw error;

        // CSV Header
        const header = "User ID,Login Time,Logout Time,Last Seen,Duration (Hours),Ended Reason,IP Address,Device\n";

        // CSV Rows
        const rows = (sessions || []).map((s: any) => {
            const login = new Date(s.login_at).toLocaleString();
            const logout = s.logout_at ? new Date(s.logout_at).toLocaleString() : "";
            const lastSeen = new Date(s.last_seen_at).toLocaleString();

            // Clean strings
            const reason = s.ended_reason || (s.logout_at ? "Unknown" : "Active/Timeout Pending");
            const device = (s.user_agent || "").replace(/,/g, ";"); // basic escape

            return `${s.user_id},${login},${logout},${lastSeen},${s.duration_hours_clamped},${reason},${s.ip_address},"${device}"`;
        }).join("\n");

        return new NextResponse(header + rows, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="sessions_export_${new Date().toISOString().slice(0, 10)}.csv"`
            }
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
