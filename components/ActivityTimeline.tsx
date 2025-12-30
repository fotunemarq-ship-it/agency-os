"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { format } from "date-fns";
import {
    Activity,
    MessageSquare,
    Phone,
    Calendar,
    CheckCircle2,
    FileText,
    BadgeCheck,
    User,
    Clock,
    ArrowRight,
    Flame,
    Zap,
} from "lucide-react";
import clsx from "clsx";

interface ActivityEvent {
    id: string;
    event_type: string;
    title: string;
    body: string | null;
    metadata: any;
    created_at: string;
    created_by: string; // uuid
    profiles?: { full_name: string; email: string }; // joined
}

interface ActivityTimelineProps {
    entityType: string;
    entityId: string;
    className?: string;
    limit?: number;
    compact?: boolean;
}

const EVENT_ICONS: Record<string, any> = {
    status_changed: Activity,
    lead_qualified: Flame,
    strategy_booked: Calendar,
    note_added: FileText,
    call_logged: Phone,
    followup_set: Clock,
    deal_won: BadgeCheck,
    deal_lost: Activity,
    task_completed: CheckCircle2,
    milestone_approved: BadgeCheck,
    sla_missed: Zap,
    default: MessageSquare,
};

export default function ActivityTimeline({
    entityType,
    entityId,
    className,
    limit = 10,
    compact = false,
}: ActivityTimelineProps) {
    const [events, setEvents] = useState<ActivityEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = limit;

    useEffect(() => {
        fetchEvents(0, true);
    }, [entityId, entityType]);

    const fetchEvents = async (pageIdx: number, reset = false) => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("activity_events")
                .select(`
          *,
          profiles:created_by (full_name, email)
        `)
                .eq("entity_type", entityType)
                .eq("entity_id", entityId)
                .order("created_at", { ascending: false })
                .range(pageIdx * pageSize, (pageIdx + 1) * pageSize - 1);

            if (error) throw error;

            if (reset) {
                setEvents(data || []);
            } else {
                setEvents((prev) => [...prev, ...(data || [])]);
            }

            if ((data || []).length < pageSize) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        } catch (err) {
            console.error("Error fetching activity:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchEvents(nextPage);
    };

    if (loading && events.length === 0) {
        return <div className="p-4 text-center text-zinc-500 text-sm">Loading...</div>;
    }

    if (events.length === 0) {
        return (
            <div className={clsx("flex flex-col items-center justify-center text-zinc-500 border rounded-xl border-dashed border-zinc-800 bg-zinc-900/30", compact ? "py-4" : "py-8")}>
                <Activity className="mb-2 h-6 w-6 opacity-20" />
                <p className="text-sm">No activity yet</p>
            </div>
        );
    }

    return (
        <div className={clsx("space-y-6", className)}>
            <div className={clsx("relative border-l border-zinc-800 ml-3", compact ? "space-y-4 pb-2" : "space-y-8 pb-4")}>
                {events.map((event) => {
                    const Icon = EVENT_ICONS[event.event_type] || EVENT_ICONS.default;

                    return (
                        <div key={event.id} className="relative pl-6">
                            {/* Timeline Dot */}
                            <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#0f0f0f] border border-zinc-700 shadow-sm z-10">
                                <Icon className="h-3 w-3 text-zinc-400" />
                            </div>

                            {/* Content */}
                            <div className="flex flex-col gap-1 -mt-1">
                                <div className="flex items-center justify-between gap-2">
                                    <span className={clsx("font-medium text-white", compact ? "text-xs" : "text-sm")}>
                                        {event.title}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 whitespace-nowrap font-mono">
                                        {format(new Date(event.created_at), compact ? "MMM d" : "MMM d, h:mm a")}
                                    </span>
                                </div>

                                {event.body && (
                                    <p className={clsx("text-zinc-400 leading-relaxed", compact ? "text-xs" : "text-sm bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/50")}>
                                        {event.body}
                                    </p>
                                )}

                                {/* Metadata Viewer (Compact) */}
                                {event.metadata && Object.keys(event.metadata).length > 0 && (
                                    <div className="mt-0.5">
                                        {/* Simplified metadata view - e.g. status changes */}
                                        {event.metadata.from_status && event.metadata.to_status && (
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                                    {event.metadata.from_status}
                                                </span>
                                                <ArrowRight className="h-3 w-3" />
                                                <span className="px-1.5 py-0.5 rounded bg-[#42CA80]/10 text-[#42CA80]">
                                                    {event.metadata.to_status}
                                                </span>
                                            </div>
                                        )}
                                        {/* SLA Missed metadata */}
                                        {event.event_type === 'sla_missed' && event.metadata.minutes_overdue && (
                                            <div className="text-[10px] text-red-500">
                                                Overdue by {event.metadata.minutes_overdue}m
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">
                                        {event.profiles?.full_name || "Unknown"} as {event.event_type === 'sla_missed' ? 'System' : 'User'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {hasMore && (
                <button
                    onClick={loadMore}
                    className="w-full py-2 text-xs text-zinc-500 hover:text-white transition-colors border-t border-zinc-800"
                >
                    Load older...
                </button>
            )}
        </div>
    );
}
