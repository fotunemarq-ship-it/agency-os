"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { AlertTriangle, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import clsx from "clsx";

interface ChangeRequest {
    id: string;
    title: string;
    description: string;
    status: string; // requested, reviewing, approved, rejected, implemented
    priority?: string;
    impact_cost?: number;
    impact_timeline_days?: number;
    created_at: string;
    decision_note?: string;
}

export default function ChangeRequestBoard({ projectId, initialRequests, isClientView = false }: { projectId: string, initialRequests: ChangeRequest[], isClientView?: boolean }) {
    const [requests, setRequests] = useState(initialRequests);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ title: "", description: "", priority: "medium" });
    const supabase = createClient();

    const addRequest = async () => {
        if (!newItem.title) return;
        try {
            const { data, error } = await (supabase.from("change_requests") as any).insert({
                project_id: projectId,
                title: newItem.title,
                description: newItem.description,
                priority: newItem.priority,
                status: 'requested'
            }).select().single();

            if (error) throw error;
            if (data) setRequests([data as any, ...requests]);
            setIsAdding(false);
            setNewItem({ title: "", description: "", priority: "medium" });
            alert("Change request submitted.");
        } catch (e) {
            console.error(e);
            alert("Error submitting request");
        }
    };

    const updateStatus = async (id: string, status: string, note?: string) => {
        // Only PM can do this usually
        try {
            const updates: any = { status };
            if (note) updates.decision_note = note;

            await (supabase.from("change_requests") as any).update(updates).eq("id", id);
            setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
        } catch (e) { console.error(e); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Change Requests (Scope)</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg text-sm"
                >
                    Request Change
                </button>
            </div>

            {isAdding && (
                <div className="bg-[#111] border border-[#333] p-4 rounded-xl mb-6">
                    <h3 className="text-white font-bold mb-3">Submit Change Request</h3>
                    <div className="space-y-3">
                        <input type="text" placeholder="Summary of change" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} className="w-full bg-[#0a0a0a] border border-[#222] rounded p-2 text-white text-sm" />
                        <textarea placeholder="Detailed description and rationale..." value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="w-full h-24 bg-[#0a0a0a] border border-[#222] rounded p-2 text-white text-sm"></textarea>
                        <select value={newItem.priority} onChange={e => setNewItem({ ...newItem, priority: e.target.value })} className="bg-[#0a0a0a] border border-[#222] rounded p-2 text-white text-sm">
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                        <div className="flex gap-2 pt-2">
                            <button onClick={addRequest} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold">Submit Request</button>
                            <button onClick={() => setIsAdding(false)} className="text-[#666] px-4 py-2 text-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {requests.map(req => (
                    <div key={req.id} className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <span className={clsx("px-2 py-0.5 rounded text-[10px] uppercase font-bold", req.status === 'approved' ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500")}>
                                    {req.status}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-zinc-500 bg-[#222] px-2 py-0.5 rounded">{req.priority}</span>
                                <h3 className="font-bold text-white text-lg">{req.title}</h3>
                            </div>
                            <p className="text-sm text-[#888] mb-2">{req.description}</p>
                            {(req.impact_cost || req.impact_timeline_days) && (
                                <div className="flex gap-4 text-xs text-[#a1a1aa] mt-2 bg-[#111] p-2 rounded inline-flex">
                                    {req.impact_cost && <span>💰 Cost Impact: ${req.impact_cost}</span>}
                                    {req.impact_timeline_days && <span>⏱ Timeline: +{req.impact_timeline_days} days</span>}
                                </div>
                            )}
                        </div>

                        {!isClientView && req.status === 'requested' && (
                            <div className="flex items-center gap-2 self-start md:self-center">
                                <button onClick={() => updateStatus(req.id, 'reviewing')} className="px-3 py-1.5 bg-zinc-800 text-white text-xs rounded hover:bg-zinc-700">Mark Reviewing</button>
                            </div>
                        )}
                        {!isClientView && req.status === 'reviewing' && (
                            <div className="flex items-center gap-2 self-start md:self-center">
                                <button onClick={() => updateStatus(req.id, 'rejected', prompt("Reason?") || "Policy")} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20" title="Reject"><XCircle className="h-5 w-5" /></button>
                                <button onClick={() => updateStatus(req.id, 'approved', prompt("Approval Note?") || "Approved")} className="p-2 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20" title="Approve"><CheckCircle2 className="h-5 w-5" /></button>
                            </div>
                        )}
                    </div>
                ))}

                {requests.length === 0 && (
                    <div className="text-center py-8 text-[#666] italic">No change requests active.</div>
                )}
            </div>
        </div>
    );
}
