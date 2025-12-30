"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";

export default function AdminAttendancePage() {
    const [summaries, setSummaries] = useState<any[]>([]);
    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
    const supabase = createClient();

    useEffect(() => {
        fetchDailyReport();
    }, [date]);

    const fetchDailyReport = async () => {
        // Need to join user details. 
        // NOTE: Standard supabase client might not let us join auth.users easily depending on config.
        // Assuming we have a 'public_users' view or 'staff' table or just using IDs for now.
        // Or fetch users separately.

        // 1. Fetch summaries
        const { data: sums } = await supabase.from('attendance_daily_summary')
            .select('*')
            .eq('day', date);

        // 2. Fetch User Map (simplified: assuming we can get email from somewhere, or just show ID)
        // Ideally: .select('*, user:users(id, email)') if FK exists to public users table.
        // Let's assume we have a `users` table mirror or just list IDs for v1.

        setSummaries(sums || []);
    };

    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] px-6 py-8 text-white">
            <div className="mx-auto max-w-6xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">Attendance Overview</h1>
                    <div className="flex items-center gap-4">
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white"
                        />
                        <button className="bg-indigo-600 px-4 py-2 rounded-lg font-medium text-sm">Export CSV</button>
                    </div>
                </div>

                <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#222] text-[#888] font-medium uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">User ID</th>
                                <th className="px-6 py-4">Sessions</th>
                                <th className="px-6 py-4">Gross</th>
                                <th className="px-6 py-4">Break</th>
                                <th className="px-6 py-4">Net Work</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#252525]">
                            {summaries.map(s => (
                                <tr key={s.id} className="hover:bg-[#222]">
                                    <td className="px-6 py-4 font-mono text-zinc-400">{s.user_id}</td>
                                    <td className="px-6 py-4">{s.sessions_count}</td>
                                    <td className="px-6 py-4">{formatTime(s.gross_minutes)}</td>
                                    <td className="px-6 py-4 text-amber-500">{formatTime(s.break_minutes)}</td>
                                    <td className="px-6 py-4 font-bold text-emerald-400">{formatTime(s.net_minutes)}</td>
                                    <td className="px-6 py-4">
                                        {s.flags?.missed_clockout ? (
                                            <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-xs">Flagged</span>
                                        ) : !s.is_complete ? (
                                            <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs">In Progress</span>
                                        ) : (
                                            <span className="bg-zinc-800 text-zinc-400 px-2 py-1 rounded text-xs">Complete</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {summaries.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-[#666]">No attendance records for {date}.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
