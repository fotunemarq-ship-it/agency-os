"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { CheckSquare, Square, Plus, Trash2, GripVertical } from "lucide-react";
import { logActivity } from "@/lib/audit";

interface ChecklistItem {
    id: string;
    title: string;
    is_done: boolean;
    sort_order: number;
}

interface TaskChecklistProps {
    taskId: string;
    initialItems: ChecklistItem[];
}

export default function TaskChecklist({ taskId, initialItems }: TaskChecklistProps) {
    const [items, setItems] = useState<ChecklistItem[]>(initialItems.sort((a, b) => a.sort_order - b.sort_order));
    const [newItemTitle, setNewItemTitle] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const supabase = createClient();

    const addItem = async () => {
        if (!newItemTitle.trim()) return;
        setIsAdding(true);
        const nextOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) + 1 : 0;

        try {
            const { data, error } = await (supabase.from("task_checklist_items") as any).insert({
                task_id: taskId,
                title: newItemTitle.trim(),
                sort_order: nextOrder
            }).select().single();

            if (error) throw error;
            if (data) setItems([...items, data]);
            setNewItemTitle("");

            // Log activity? Prompt says "log activity_event" on completion toggle, maybe add too.
        } catch (e) {
            console.error(e);
        } finally {
            setIsAdding(false);
        }
    };

    const toggleItem = async (item: ChecklistItem) => {
        // Optimistic update
        const newStatus = !item.is_done;
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_done: newStatus } : i));

        try {
            const updates: any = {
                is_done: newStatus,
                completed_at: newStatus ? new Date().toISOString() : null
            };
            // completed_by should ideally be set here using session, but RLS/DB trigger or client session fetch needed.
            // Supabase 'auth.uid()' default in RLS is for policies, for insert/update columns we usually pass explicitly if needed OR use database trigger.
            // We'll skip completed_by for brevity or fetch user. 
            const { data: { user } } = await supabase.auth.getUser();
            if (newStatus && user) updates.completed_by = user.id;

            await (supabase.from("task_checklist_items") as any).update(updates).eq("id", item.id);

            if (newStatus) {
                await logActivity({
                    entity_type: 'task',
                    entity_id: taskId,
                    event_type: 'checklist_completed',
                    title: 'Checklist Item Done',
                    metadata: { item_title: item.title }
                });
            }

        } catch (e) {
            console.error(e);
            // Revert
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_done: !newStatus } : i));
        }
    };

    const deleteItem = async (id: string) => {
        if (!confirm("Delete item?")) return;
        setItems(prev => prev.filter(i => i.id !== id));
        await (supabase.from("task_checklist_items") as any).delete().eq("id", id);
    };

    const progress = items.length > 0 ? Math.round((items.filter(i => i.is_done).length / items.length) * 100) : 0;

    return (
        <div className="mt-6 border-t border-[#1a1a1a] pt-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-[#42CA80]" />
                    Checklist
                </h3>
                <span className="text-xs text-[#666]">{progress}% Complete</span>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-[#1a1a1a] rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-[#42CA80] transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="space-y-2 mb-4">
                {items.map(item => (
                    <div key={item.id} className="flex items-start gap-2 group hover:bg-[#1a1a1a] p-2 rounded transition-colors">
                        <div className="mt-0.5 cursor-move text-[#333] opacity-0 group-hover:opacity-100">
                            <GripVertical className="h-4 w-4" />
                        </div>
                        <button onClick={() => toggleItem(item)} className="mt-0.5 text-[#666] hover:text-white transition-colors">
                            {item.is_done ? <CheckSquare className="h-4 w-4 text-[#42CA80]" /> : <Square className="h-4 w-4" />}
                        </button>
                        <span className={item.is_done ? "text-[#666] line-through flex-1 text-sm" : "text-zinc-300 flex-1 text-sm"}>
                            {item.title}
                        </span>
                        <button onClick={() => deleteItem(item.id)} className="text-[#666] opacity-0 group-hover:opacity-100 hover:text-red-400">
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={newItemTitle}
                    onChange={e => setNewItemTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addItem()}
                    placeholder="Add subtask..."
                    className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#333]"
                />
                <button onClick={addItem} disabled={isAdding} className="bg-[#1a1a1a] border border-[#333] text-white px-3 py-1.5 rounded hover:bg-[#252525]">
                    <Plus className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
