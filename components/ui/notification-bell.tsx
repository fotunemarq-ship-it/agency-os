"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Bell, Check, ExternalLink } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();

        // Polling for now (Realtime subscription is better but requires setup)
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10);

        if (!error && data) {
            setNotifications(data);
            setUnreadCount(data.filter((n: any) => !n.is_read).length);
        }
    };

    const markRead = async (id: string) => {
        const supabase = createClient();
        await (supabase.from("notifications") as any)
            .update({ is_read: true })
            .eq("id", id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllRead = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await (supabase.from("notifications") as any)
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-zinc-400 hover:text-white transition-colors"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-[#09090b]"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#111] border border-[#222] rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-[#222] flex justify-between items-center bg-[#161616]">
                        <h3 className="text-sm font-bold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-[#42CA80] hover:underline">Mark all read</button>
                        )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-zinc-500 text-sm">No notifications</div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className={clsx("p-3 border-b border-[#222] hover:bg-[#1a1a1a] transition-colors relative group", !n.is_read ? "bg-zinc-900/30" : "")}>
                                    <h4 className="text-sm font-semibold text-white mb-1 pr-6">{n.title}</h4>
                                    <p className="text-xs text-zinc-400 mb-2 leading-relaxed">{n.body}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-zinc-600 font-mono">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {n.is_read && <span className="text-[10px] text-zinc-600">Read</span>}
                                    </div>

                                    {!n.is_read && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                                            className="absolute top-3 right-3 text-zinc-500 hover:text-[#42CA80] opacity-0 group-hover:opacity-100"
                                            title="Mark read"
                                        >
                                            <Check className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}
        </div>
    );
}
