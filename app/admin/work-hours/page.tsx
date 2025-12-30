"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Download, Calendar, ArrowRight, User, Clock, Activity } from "lucide-react";
import clsx from "clsx";

export default function WorkHoursReportPage() {
    const [period, setPeriod] = useState('week'); // today, week, month
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, [period]);

    const fetchReport = async () => {
        setLoading(true);
        const res = await fetch(`/api/reports/work-hours?period=${period}`);
        const json = await res.json();
        setData(json);
        setLoading(false);
    };

    const downloadCsv = () => {
        window.open('/api/reports/sessions/export.csv', '_blank');
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] px-6 py-8 text-white">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                            Work Hours Analytics
                        </h1>
                        <p className="text-[#888] mt-2">Team time tracking and engagement reports</p>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex bg-[#1a1a1a] rounded-xl p-1 border border-[#333]">
                            {['today', 'week', 'month'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={clsx("px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                                        period === p ? "bg-[#333] text-white shadow-sm" : "text-[#888] hover:text-white"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={downloadCsv}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                        >
                            <Download className="h-4 w-4" /> Export Raw CSV
                        </button>
                    </div>
                </div>

                {/* KPI Strip */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-[#1a1a1a] border border-[#252525] p-6 rounded-2xl">
                        <div className="flex items-center gap-3 text-sm text-[#888] mb-2">
                            <Clock className="h-4 w-4" /> Total Hours
                        </div>
                        <div className="text-3xl font-bold text-white">
                            {data?.aggregated?.reduce((sum: number, u: any) => sum + u.total_hours, 0).toFixed(0) || 0}
                            <span className="text-lg text-[#666] font-normal ml-1">h</span>
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] border border-[#252525] p-6 rounded-2xl">
                        <div className="flex items-center gap-3 text-sm text-[#888] mb-2">
                            <Activity className="h-4 w-4" /> Avg Daily
                        </div>
                        <div className="text-3xl font-bold text-emerald-400">
                            {data?.aggregated?.length > 0 ?
                                (data.aggregated.reduce((sum: number, u: any) => sum + u.avg_daily_hours, 0) / data.aggregated.length).toFixed(1)
                                : 0}
                            <span className="text-lg text-emerald-500/50 font-normal ml-1">h/user</span>
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] border border-[#252525] p-6 rounded-2xl">
                        <div className="flex items-center gap-3 text-sm text-[#888] mb-2">
                            <User className="h-4 w-4" /> Active Users
                        </div>
                        <div className="text-3xl font-bold text-blue-400">
                            {data?.aggregated?.length || 0}
                        </div>
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl overflow-hidden shadow-xl">
                    <div className="px-6 py-4 border-b border-[#252525] bg-[#1f1f1f]">
                        <h3 className="font-bold text-lg">User Performance</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#222] text-[#888] font-medium uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">User ID / Name</th>
                                    <th className="px-6 py-4 text-right">Total Hours</th>
                                    <th className="px-6 py-4 text-right">Days Active</th>
                                    <th className="px-6 py-4 text-right">Avg Hrs/Day</th>
                                    <th className="px-6 py-4 text-right">Sessions</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#252525]">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-[#666]">Loading analytics...</td></tr>
                                ) : data?.aggregated?.map((u: any) => (
                                    <tr key={u.user_id} className="hover:bg-[#222] group transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                                                    {u.user_id.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-mono text-zinc-400">{u.user_id.slice(0, 8)}...</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-white">{u.total_hours}h</td>
                                        <td className="px-6 py-4 text-right text-zinc-300">{u.days_present}d</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={clsx("px-2 py-1 rounded",
                                                u.avg_daily_hours > 8 ? "bg-amber-500/10 text-amber-500" :
                                                    u.avg_daily_hours > 6 ? "bg-emerald-500/10 text-emerald-400" :
                                                        "text-zinc-500"
                                            )}>
                                                {u.avg_daily_hours}h
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-zinc-500">{u.sessions}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-indigo-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-end gap-1 ml-auto text-xs">
                                                Details <ArrowRight className="h-3 w-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && (!data?.aggregated || data.aggregated.length === 0) && (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-[#666]">No activity found for this period.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-[#555]">
                    * Analytics based on active session time. Cap of 16h/session applied to remove outliers.
                    <br />Timezone: Asia/Kolkata.
                </div>
            </div>
        </div>
    );
}
