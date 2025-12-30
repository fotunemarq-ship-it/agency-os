"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { format } from "date-fns";
import { Clock, Coffee, Play, Square, AlertCircle } from "lucide-react";
import clsx from "clsx";

interface AttendanceBreak {
    break_end_at: string | null;
}

interface AttendanceSession {
    clock_in_at: string;
    attendance_breaks: AttendanceBreak[];
}

interface AttendanceSummaryFlags {
    missed_clockout?: boolean;
}

interface AttendanceSummary {
    gross_minutes: number | null;
    break_minutes: number | null;
    net_minutes: number | null;
    flags?: AttendanceSummaryFlags | null;
}

export default function MyAttendancePage() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<"out" | "in" | "break">("out");
    const [session, setSession] = useState<AttendanceSession | null>(null);
    const [summary, setSummary] = useState<AttendanceSummary | null>(null);

    // For timer
    const [now, setNow] = useState(new Date());

    const supabase = createClient();

    const fetchState = useCallback(async () => {
        setLoading(true);
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Get Open Session
        const { data: sess } = await supabase
            .from("attendance_sessions")
            .select(`*, attendance_breaks(*)`)
            .eq("user_id", user.id)
            .eq("status", "open")
            .single<AttendanceSession>();

        if (sess) {
            setSession(sess);
            // Check break
            const activeBreak = sess.attendance_breaks.find(
                (b) => !b.break_end_at,
            );
            setStatus(activeBreak ? "break" : "in");
        } else {
            setSession(null);
            setStatus("out");
        }

        // 2. Get Today's Summary
        const today = new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
        });
        const { data: sum } = await supabase
            .from("attendance_daily_summary")
            .select("*")
            .eq("user_id", user.id)
            .eq("day", today)
            .single<AttendanceSummary>();

        setSummary(sum);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchState();
        return () => clearInterval(interval);
    }, [fetchState]);

    const handleClockIn = async () => {
        await fetch('/api/attendance/clock-in', { method: 'POST' });
        fetchState();
    };

    const handleClockOut = async () => {
        if (!confirm("Are you sure you want to clock out?")) return;
        await fetch('/api/attendance/clock-out', { method: 'POST' });
        fetchState();
    };

    const handleBreak = async (action: 'start' | 'end') => {
        await fetch(`/api/attendance/break?action=${action}`, { method: 'POST' });
        fetchState();
    };

    // Calculate current live duration if clocked in
    const getLiveDuration = () => {
        if (!session) return "00:00:00";
        const start = new Date(session.clock_in_at).getTime();
        const diff = now.getTime() - start;
        // Basic format HH:MM:SS
        return new Date(diff).toISOString().slice(11, 19);
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] px-4 py-8 text-white">
            <div className="mx-auto max-w-md space-y-8">
                <header className="text-center">
                    <h1 className="text-2xl font-bold">Attendance</h1>
                    <p className="text-[#888]">{format(now, "EEEE, MMMM d, yyyy")}</p>
                    <p className="text-4xl font-mono mt-4 font-bold tracking-widest text-[#42CA80]">
                        {format(now, "HH:mm:ss")}
                    </p>
                </header>

                {/* Main Card */}
                <div className="bg-[#1a1a1a] border border-[#252525] rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden">
                    {/* Status Ring */}
                    <div className={clsx("w-40 h-40 rounded-full border-4 flex items-center justify-center relative",
                        status === 'in' ? "border-[#42CA80] text-[#42CA80]" :
                            status === 'break' ? "border-amber-500 text-amber-500" :
                                "border-[#333] text-[#666]"
                    )}>
                        <div className="text-center">
                            <div className="text-sm uppercase font-bold tracking-wider mb-1">
                                {status === 'in' ? 'Working' : status === 'break' ? 'On Break' : 'Clocked Out'}
                            </div>
                            {status !== 'out' && <div className="text-xl font-mono">{getLiveDuration()}</div>}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {status === 'out' ? (
                            <button onClick={handleClockIn} className="col-span-2 bg-[#42CA80] hover:bg-[#3ab872] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-lg transition-transform active:scale-95">
                                <Play className="fill-current" /> Clock In
                            </button>
                        ) : (
                            <>
                                {status === 'in' ? (
                                    <button onClick={() => handleBreak('start')} className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95">
                                        <Coffee /> Break
                                    </button>
                                ) : (
                                    <button onClick={() => handleBreak('end')} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95">
                                        <Play /> Resume
                                    </button>
                                )}

                                <button onClick={handleClockOut} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95">
                                    <Square className="fill-current" /> Clock Out
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#252525]">
                        <div className="text-xs text-[#666] uppercase mb-1">Gross</div>
                        <div className="text-xl font-bold">{summary?.gross_minutes || 0}<span className="text-xs font-normal text-[#666]">m</span></div>
                    </div>
                    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#252525]">
                        <div className="text-xs text-[#666] uppercase mb-1">Break</div>
                        <div className="text-xl font-bold text-amber-500">{summary?.break_minutes || 0}<span className="text-xs font-normal text-[#666]">m</span></div>
                    </div>
                    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#252525]">
                        <div className="text-xs text-[#666] uppercase mb-1">Net</div>
                        <div className="text-xl font-bold text-[#42CA80]">{summary?.net_minutes || 0}<span className="text-xs font-normal text-[#666]">m</span></div>
                    </div>
                </div>

                {summary?.flags?.missed_clockout && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                        <div className="text-sm text-red-200">
                            <strong>Missed Clock Out Detected</strong><br />
                            Your last session was auto-closed. Please contact admin to adjust hours if needed.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
