"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Flag, CheckCircle2, XCircle, Clock, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { logActivity } from "@/lib/audit";

interface Milestone {
    id: string;
    title: string;
    description?: string;
    due_date?: string;
    status: string; // pending, active, completed, approved, rejected
    approvals?: any[];
}

export default function MilestoneManager({ projectId, initialMilestones, isClientView = false }: { projectId: string, initialMilestones: Milestone[], isClientView?: boolean }) {
    const [milestones, setMilestones] = useState(initialMilestones);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const requestApproval = async (milestoneId: string) => {
        setLoading(true);
        try {
            // 1. Create approval request
            await (supabase.from("milestone_approvals") as any).insert({
                milestone_id: milestoneId,
                status: 'pending'
            });
            // 2. Update milestone status to 'in_review' or keep current? 
            // Let's set to 'pending_approval'
            await (supabase.from("project_milestones") as any).update({ status: 'pending_approval' }).eq("id", milestoneId);

            // 3. Log
            await logActivity({
                entity_type: 'milestone',
                entity_id: milestoneId,
                event_type: 'approval_requested',
                title: 'Client Approval Requested',
            });

            // Update local state
            setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, status: 'pending_approval' } : m));
            alert("Approval requested from client.");

        } catch (e) {
            console.error(e);
            alert("Error requesting approval");
        } finally {
            setLoading(false);
        }
    };

    const handleDecision = async (milestoneId: string, decision: 'approved' | 'rejected', feedback?: string) => {
        if (!confirm(`Are you sure you want to ${decision} this milestone?`)) return;
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Update pending permission logic: find the pending approval row?
            // Or just insert a new decision row if multiple rounds?
            // Let's assume one active round. Update the latest 'pending' one.
            const { data: approval } = await (supabase.from("milestone_approvals") as any)
                .select("id")
                .eq("milestone_id", milestoneId)
                .eq("status", "pending")
                .order("requested_at", { ascending: false })
                .limit(1)
                .single();

            if (approval) {
                await (supabase.from("milestone_approvals") as any).update({
                    status: decision,
                    approved_by: user?.id,
                    approved_at: new Date().toISOString(),
                    feedback: feedback
                }).eq("id", approval.id);
            } else {
                // Fallback if no pending row found (force decision)
                await (supabase.from("milestone_approvals") as any).insert({
                    milestone_id: milestoneId,
                    status: decision,
                    approved_by: user?.id,
                    approved_at: new Date().toISOString(),
                    feedback: feedback
                });
            }

            // Update milestone status
            const newStatus = decision === 'approved' ? 'approved' : 'changes_requested';
            await (supabase.from("project_milestones") as any).update({ status: newStatus }).eq("id", milestoneId);

            setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, status: newStatus } : m));

            await logActivity({
                entity_type: 'milestone',
                entity_id: milestoneId,
                event_type: decision === 'approved' ? 'milestone_approved' : 'milestone_rejected',
                title: `Milestone ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
                metadata: { feedback }
            });

        } catch (e) {
            console.error(e);
            alert("Error recording decision");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Milestones & Approvals</h2>

            <div className="grid gap-4">
                {milestones.map(milestone => (
                    <div key={milestone.id} className="bg-[#111] border border-[#222] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Flag className={clsx("h-4 w-4", milestone.status === 'approved' ? "text-[#42CA80]" : "text-white")} />
                                <h3 className="font-bold text-white text-lg">{milestone.title}</h3>
                                <StatusBadge status={milestone.status} />
                            </div>
                            <p className="text-sm text-[#888]">{milestone.description}</p>
                            {milestone.due_date && <p className="text-xs text-[#666] mt-2 flex items-center gap-1"><Clock className="h-3 w-3" /> Due: {new Date(milestone.due_date).toLocaleDateString()}</p>}
                        </div>

                        <div className="flex items-center gap-3">
                            {/* PM View: Request Approval */}
                            {!isClientView && milestone.status !== 'approved' && milestone.status !== 'pending_approval' && (
                                <button
                                    onClick={() => requestApproval(milestone.id)}
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Request Approval
                                </button>
                            )}

                            {/* Client View: Approve/Reject */}
                            {(isClientView || !isClientView) && milestone.status === 'pending_approval' && (
                                <div className="flex items-center gap-2">
                                    {isClientView && (
                                        <>
                                            <button
                                                onClick={() => handleDecision(milestone.id, 'rejected', prompt("Feedback/Reason for rejection:") || "")}
                                                disabled={loading}
                                                className="px-3 py-2 border border-red-900 bg-red-500/10 text-red-500 text-sm font-medium rounded-lg hover:bg-red-500/20"
                                            >
                                                Request Changes
                                            </button>
                                            <button
                                                onClick={() => handleDecision(milestone.id, 'approved')}
                                                disabled={loading}
                                                className="px-4 py-2 bg-[#42CA80] text-black text-sm font-bold rounded-lg hover:bg-[#3ab872]"
                                            >
                                                Approve Milestone
                                            </button>
                                        </>
                                    )}
                                    {!isClientView && <span className="text-sm text-yellow-500 italic">Waiting for client...</span>}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        pending: "bg-gray-800 text-gray-400",
        active: "bg-blue-900/30 text-blue-400",
        completed: "bg-green-900/30 text-green-400",
        pending_approval: "bg-yellow-900/30 text-yellow-400",
        approved: "bg-[#42CA80]/20 text-[#42CA80]",
        changes_requested: "bg-red-900/30 text-red-400"
    };
    const labels: any = {
        pending: "Pending",
        active: "Active",
        completed: "Completed",
        pending_approval: "Approval Pending",
        approved: "Approved",
        changes_requested: "Changes Requested"
    };
    return (
        <span className={clsx("px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider", styles[status] || styles.pending)}>
            {labels[status] || status}
        </span>
    );
}
