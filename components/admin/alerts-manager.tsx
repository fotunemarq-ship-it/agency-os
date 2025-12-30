"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { CheckCircle2, AlertTriangle, Eye, XCircle, Search, Filter } from "lucide-react";
import clsx from "clsx";

interface Alert {
    id: string;
    severity: string;
    title: string;
    body: string;
    status: string;
    created_at: string;
    rule_id?: string;
}

export default function AlertsManager({ initialAlerts }: { initialAlerts: Alert[] }) {
    const [alerts, setAlerts] = useState(initialAlerts);
    const [filter, setFilter] = useState('open'); // open | resolved | all
    const supabase = createClient();

    const handleAction = async (id: string, action: 'resolve' | 'acknowledge') => {
        // Optimistic update
        const newStatus = action === 'resolve' ? 'resolved' : 'acknowledged';
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));

        try {
            const updates: any = {
                status: newStatus,
                [action === 'resolve' ? 'resolved_at' : 'acknowledged_at']: new Date().toISOString()
            };

            const { error } = await (supabase.from('alerts') as any)
                .update(updates)
                .eq('id', id);
            if (error) throw error;
        } catch (e) {
            console.error(e);
            alert("Failed to update alert");
        }
    };

    const filteredAlerts = alerts.filter(a => {
        if (filter === 'all') return true;
        if (filter === 'resolved') return a.status === 'resolved';
        return a.status !== 'resolved'; // open or acknowledged
    });

    return (
        <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-[#252525] flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex bg-[#0f0f0f] rounded-lg p-1 border border-[#252525]">
                    <button
                        onClick={() => setFilter('open')}
                        className={clsx("px-4 py-1.5 text-sm font-medium rounded-md transition-all", filter === 'open' ? "bg-[#252525] text-white shadow-sm" : "text-[#666] hover:text-white")}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilter('resolved')}
                        className={clsx("px-4 py-1.5 text-sm font-medium rounded-md transition-all", filter === 'resolved' ? "bg-[#252525] text-white shadow-sm" : "text-[#666] hover:text-white")}
                    >
                        Resolved
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={clsx("px-4 py-1.5 text-sm font-medium rounded-md transition-all", filter === 'all' ? "bg-[#252525] text-white shadow-sm" : "text-[#666] hover:text-white")}
                    >
                        All History
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-[#252525]">
                {filteredAlerts.length === 0 ? (
                    <div className="p-12 text-center text-[#666]">No alerts found in this view.</div>
                ) : (
                    filteredAlerts.map(alert => (
                        <div key={alert.id} className={clsx("p-4 flex items-start gap-4 hover:bg-[#222] transition-colors", alert.status === 'resolved' ? "opacity-50" : "")}>
                            <div className={clsx("mt-1 p-2 rounded-full flex-shrink-0",
                                alert.severity === 'high' ? "bg-red-500/10 text-red-500" :
                                    alert.severity === 'medium' ? "bg-amber-500/10 text-amber-500" :
                                        "bg-blue-500/10 text-blue-500"
                            )}>
                                <AlertTriangle className="h-5 w-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-white font-medium text-sm">{alert.title}</h3>
                                    <span className="text-xs text-[#666] whitespace-nowrap">{new Date(alert.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-zinc-400 text-sm mt-1">{alert.body}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={clsx("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                                        alert.severity === 'high' ? "bg-red-900/30 text-red-400" : "bg-zinc-800 text-zinc-400"
                                    )}>
                                        {alert.severity}
                                    </span>
                                    <span className="text-xs text-[#555]">• ID: {alert.id.slice(0, 6)}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                {alert.status !== 'resolved' && (
                                    <button
                                        onClick={() => handleAction(alert.id, 'resolve')}
                                        className="bg-[#252525] hover:bg-[#333] border border-[#333] text-zinc-300 px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center gap-2"
                                        title="Resolve Alert"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                                    </button>
                                )}
                                {alert.status === 'open' && (
                                    <button
                                        onClick={() => handleAction(alert.id, 'acknowledge')}
                                        className="text-[#666] hover:text-white text-xs px-2 py-1"
                                    >
                                        Acknowledge
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
