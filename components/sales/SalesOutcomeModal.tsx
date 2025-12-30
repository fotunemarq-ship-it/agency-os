"use client";

import { useState, useEffect } from "react";
import {
    X,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    MessageSquare,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import clsx from "clsx";
import { format, addDays, addHours, setHours, setMinutes } from "date-fns";

interface SalesOutcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: OutcomeData) => Promise<void>;
    outcome: string; // 'interested', 'follow_up', etc.
    leadName: string;
    initialNotes?: string;
}

export interface OutcomeData {
    outcome: string;
    reason_code?: string;
    notes?: string;
    next_action_date?: string | null;
}

// Reason codes mapping (this should ideally come from DB, but hardcoding map for speed if needed, or fetch)
// For now, I'll fetch or pass them, but let's assume we fetch them inside for simplicity
interface ReasonCode {
    code: string;
    label: string;
}

export default function SalesOutcomeModal({
    isOpen,
    onClose,
    onSave,
    outcome,
    leadName,
    initialNotes
}: SalesOutcomeModalProps) {
    const [reasonCodes, setReasonCodes] = useState<ReasonCode[]>([]);
    const [formData, setFormData] = useState<OutcomeData>({
        outcome,
        reason_code: "",
        notes: initialNotes || "",
        next_action_date: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customDate, setCustomDate] = useState("");
    const [customTime, setCustomTime] = useState("10:00");

    useEffect(() => {
        if (isOpen) {
            setFormData({
                outcome,
                reason_code: "",
                notes: initialNotes || "",
                next_action_date: null,
            });
            fetchReasonCodes(outcome);
        }
    }, [isOpen, outcome, initialNotes]);

    const fetchReasonCodes = async (outcomeType: string) => {
        const supabase = createClient();
        const { data } = await supabase
            .from("lead_reason_codes")
            .select("code, label")
            .eq("outcome", outcomeType)
            .eq("is_active", true)
            .order("sort_order");
        setReasonCodes(data || []);
    };

    const handleSave = async () => {
        // Validation
        if (requiresReason && !formData.reason_code) {
            alert("Please select a reason.");
            return;
        }
        if (requiresNotes && (!formData.notes || formData.notes.length < 5)) {
            alert("Please add notes (min 5 chars).");
            return;
        }
        if (requiresFollowUp && !formData.next_action_date) {
            alert("Please schedule a follow-up.");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (e) {
            console.error(e);
            alert("Failed to save outcome.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const setFollowUpPreset = (type: string) => {
        const now = new Date();
        let date = now;

        switch (type) {
            case "today_4pm":
                date = setMinutes(setHours(now, 16), 0);
                if (date < now) date = addDays(date, 1); // If past 4pm, set for tomorrow? Or just force it.
                break;
            case "today_6pm":
                date = setMinutes(setHours(now, 18), 0);
                break;
            case "tomorrow_11am":
                date = setMinutes(setHours(addDays(now, 1), 11), 0);
                break;
            case "tomorrow_4pm":
                date = setMinutes(setHours(addDays(now, 1), 16), 0);
                break;
            case "in_2_days":
                date = setMinutes(setHours(addDays(now, 2), 11), 0);
                break;
            case "in_1_week":
                date = setMinutes(setHours(addDays(now, 7), 11), 0);
                break;
            default:
                return;
        }
        setFormData({ ...formData, next_action_date: date.toISOString() });
    };

    const handleCustomDateChange = () => {
        if (customDate && customTime) {
            const date = new Date(`${customDate}T${customTime}`);
            setFormData({ ...formData, next_action_date: date.toISOString() });
        }
    };

    if (!isOpen) return null;

    const requiresReason = ["not_interested", "follow_up", "wrong_number", "invalid_number"].includes(outcome);
    const requiresNotes = ["not_interested", "interested", "follow_up"].includes(outcome);
    const requiresFollowUp = ["follow_up", "busy", "no_answer", "interested"].includes(outcome);

    const outcomeLabels: Record<string, string> = {
        interested: "Positive / Interested",
        follow_up: "Follow Up Required",
        not_interested: "Not Interested",
        no_answer: "No Answer",
        busy: "Busy",
        wrong_number: "Wrong Number",
        invalid_number: "Invalid Number",
        strategy_booked: "Strategy Booked",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#2a2a2a] px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">Log Call Outcome</h2>
                        <p className="text-sm text-[#a1a1aa]">Lead: {leadName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-[#666] hover:bg-[#252525] hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Selected Outcome Display */}
                    <div className="flex items-center gap-3 rounded-lg bg-[#252525] p-3 border border-[#333]">
                        <div className="flex-1">
                            <p className="text-xs text-[#a1a1aa] uppercase tracking-wider font-semibold">Selected Outcome</p>
                            <p className="text-lg font-bold text-white">{outcomeLabels[outcome] || outcome}</p>
                        </div>
                        <CheckCircle2 className="h-6 w-6 text-[#42CA80]" />
                    </div>

                    {/* Reason Code */}
                    {reasonCodes.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                                Reason <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.reason_code}
                                onChange={(e) => setFormData({ ...formData, reason_code: e.target.value })}
                                className="w-full rounded-lg border border-[#333] bg-[#0f0f0f] px-3 py-2.5 text-white focus:border-[#42CA80] focus:outline-none"
                            >
                                <option value="">Select a reason...</option>
                                {reasonCodes.map((rc) => (
                                    <option key={rc.code} value={rc.code}>
                                        {rc.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                            Call Notes {requiresNotes && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder={requiresNotes ? "Enter details about the call..." : "Optional notes..."}
                            className="w-full h-24 rounded-lg border border-[#333] bg-[#0f0f0f] px-3 py-2.5 text-white placeholder-[#666] resize-none focus:border-[#42CA80] focus:outline-none"
                        />
                    </div>

                    {/* Follow-up Scheduler */}
                    {requiresFollowUp && (
                        <div>
                            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                                Schedule Follow-up <span className="text-red-500">*</span>
                            </label>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <button onClick={() => setFollowUpPreset("today_4pm")} className="px-3 py-2 rounded bg-[#252525] hover:bg-[#333] text-xs text-white border border-[#333]">Today 4 PM</button>
                                <button onClick={() => setFollowUpPreset("tomorrow_11am")} className="px-3 py-2 rounded bg-[#252525] hover:bg-[#333] text-xs text-white border border-[#333]">Tom 11 AM</button>
                                <button onClick={() => setFollowUpPreset("in_2_days")} className="px-3 py-2 rounded bg-[#252525] hover:bg-[#333] text-xs text-white border border-[#333]">+2 Days</button>
                                <button onClick={() => setFollowUpPreset("in_1_week")} className="px-3 py-2 rounded bg-[#252525] hover:bg-[#333] text-xs text-white border border-[#333]">+1 Week</button>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={customDate}
                                    onChange={(e) => { setCustomDate(e.target.value); handleCustomDateChange(); }}
                                    className="flex-1 rounded-lg border border-[#333] bg-[#0f0f0f] px-3 py-2 text-white text-sm"
                                />
                                <input
                                    type="time"
                                    value={customTime}
                                    onChange={(e) => { setCustomTime(e.target.value); handleCustomDateChange(); }}
                                    className="w-24 rounded-lg border border-[#333] bg-[#0f0f0f] px-3 py-2 text-white text-sm"
                                />
                            </div>

                            {formData.next_action_date && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-[#42CA80]">
                                    <Clock className="h-4 w-4" />
                                    <span>Scheduled for: {format(new Date(formData.next_action_date), "MMM d, h:mm a")}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-[#2a2a2a] px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-sm text-[#a1a1aa] hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="rounded-lg bg-[#42CA80] px-6 py-2 text-sm font-bold text-black hover:bg-[#3ab872] disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : "Save Outcome"}
                    </button>
                </div>
            </div>
        </div>
    );
}
