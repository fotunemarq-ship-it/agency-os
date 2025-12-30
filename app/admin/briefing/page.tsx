import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { AlertTriangle, CheckSquare, Phone, Flag, Activity, ArrowRight, Flame } from "lucide-react";
import clsx from "clsx";

export default async function AdminBriefingPage() {
    const supabase = createServerClient();
    const today = new Date().toISOString().split('T')[0];

    // 1. Top 5 Fires (High Alerts)
    const { data: fires } = await (supabase as any)
        .from('alerts')
        .select('*')
        .eq('severity', 'high')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(5);

    // 2. Today's Focus
    // Sales: Followups
    const { data: followups } = await (supabase as any)
        .from('leads')
        .select('id, first_name, last_name, company, next_action_date')
        .gte('next_action_date', today)
        .lt('next_action_date', new Date(Date.now() + 86400000).toISOString())
        .limit(5);

    // Delivery: Tasks Due
    const { data: tasksDue } = await (supabase as any)
        .from('tasks')
        .select('id, title, project_id')
        .gte('due_date', today)
        .lt('due_date', new Date(Date.now() + 86400000).toISOString())
        .neq('status', 'completed')
        .limit(5);

    // Strategy: Pending Approvals
    const { data: approvals } = await (supabase as any)
        .from('milestone_approvals')
        .select('id, status, milestone_id') // Join milestone title if possible
        .eq('status', 'pending')
        .limit(5);

    // 3. New Activity
    const { data: activity } = await (supabase as any)
        .from('activity_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    return (
        <div className="min-h-screen bg-[#0f0f0f] p-6 text-white">
            <div className="mx-auto max-w-5xl space-y-8">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <span className="text-2xl">☕️</span> Good Morning, Admin
                        </h1>
                        <p className="text-[#666] mt-1">Here is your daily briefing for {new Date().toLocaleDateString()}.</p>
                    </div>
                    <Link href="/admin" className="text-indigo-400 text-sm hover:underline flex items-center gap-1">
                        Go to Command Hub <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* Section 1: Top Fires */}
                {fires && fires.length > 0 && (
                    <section className="animate-in fade-in slide-in-from-bottom-2">
                        <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                            <Flame className="h-5 w-5" /> Top Fires (Action Required)
                        </h2>
                        <div className="grid gap-3">
                            {fires.map((alert: any) => (
                                <div key={alert.id} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-red-200">{alert.title}</h3>
                                        <p className="text-sm text-red-300/70">{alert.body}</p>
                                    </div>
                                    <Link href="/admin/alerts" className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs rounded-lg transition-colors">
                                        Resolve
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Section 2: Today's Focus Grid */}
                <section>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <CheckSquare className="h-5 w-5 text-indigo-400" /> Today's Focus
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Sales Focus */}
                        <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-zinc-200 flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-blue-400" /> Sales Calls
                                </h3>
                                <span className="bg-[#222] text-xs px-2 py-0.5 rounded text-[#888]">{followups?.length} Due</span>
                            </div>
                            <div className="space-y-3">
                                {followups?.map((lead: any) => (
                                    <div key={lead.id} className="flex justify-between items-center text-sm border-b border-[#222] pb-2 last:border-0 last:pb-0">
                                        <span className="truncate max-w-[120px] text-zinc-400">{lead.company || lead.first_name}</span>
                                        <Link href={`/sales/leads/${lead.id}`} className="text-blue-400 hover:text-blue-300 text-xs text-right">Call</Link>
                                    </div>
                                ))}
                                {followups?.length === 0 && <p className="text-xs text-[#666] italic">No urgent follow-ups.</p>}
                            </div>
                        </div>

                        {/* Delivery Focus */}
                        <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-zinc-200 flex items-center gap-2">
                                    <CheckSquare className="h-4 w-4 text-green-400" /> Tasks Due
                                </h3>
                                <span className="bg-[#222] text-xs px-2 py-0.5 rounded text-[#888]">{tasksDue?.length} Due</span>
                            </div>
                            <div className="space-y-3">
                                {tasksDue?.map((task: any) => (
                                    <div key={task.id} className="flex justify-between items-center text-sm border-b border-[#222] pb-2 last:border-0 last:pb-0">
                                        <span className="truncate max-w-[150px] text-zinc-400">{task.title}</span>
                                        <Link href={`/projects/${task.project_id}`} className="text-green-400 hover:text-green-300 text-xs">View</Link>
                                    </div>
                                ))}
                                {tasksDue?.length === 0 && <p className="text-xs text-[#666] italic">No tasks due today.</p>}
                            </div>
                        </div>

                        {/* Approvals Focus */}
                        <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-zinc-200 flex items-center gap-2">
                                    <Flag className="h-4 w-4 text-amber-400" /> Approvals
                                </h3>
                                <span className="bg-[#222] text-xs px-2 py-0.5 rounded text-[#888]">{approvals?.length} Pending</span>
                            </div>
                            <div className="space-y-3">
                                {approvals?.map((app: any) => (
                                    <div key={app.id} className="flex justify-between items-center text-sm border-b border-[#222] pb-2 last:border-0 last:pb-0">
                                        <span className="text-zinc-400">Milestone Decision</span>
                                        <span className="text-amber-500 text-xs font-medium">Pending</span>
                                    </div>
                                ))}
                                {approvals?.length === 0 && <p className="text-xs text-[#666] italic">All caught up.</p>}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Live Activity Feed */}
                <section>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-400" /> Live Activity
                    </h2>
                    <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden text-sm">
                        {activity?.map((event: any, i: number) => (
                            <div key={event.id} className={clsx("p-3 flex gap-3 items-start border-b border-[#252525]", i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#151515]")}>
                                <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></div>
                                <div>
                                    <p className="text-zinc-300">
                                        <span className="font-bold text-zinc-200">{event.title}</span>
                                        <span className="text-[#666]"> - {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </p>
                                    <p className="text-zinc-500 text-xs mt-0.5">
                                        User: {event.actor_id ? "System/User" : "System"} • Entity: {event.entity_type}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
