"use client";

import { useState } from "react";
import {
  X,
  PhoneMissed,
  CalendarClock,
  FileText,
  FileSignature,
  Trophy,
  XCircle,
  MessageSquare,
  Target,
  Percent,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import clsx from "clsx";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

interface StrategySessionModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (leadId: string, newStatus: string, updates?: any) => void;
  onCloseDeal: (lead: Lead) => void;
}

type InterestLevel = "low" | "medium" | "high" | "hot";

const INTEREST_LEVELS: { value: InterestLevel; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-gray-500" },
  { value: "medium", label: "Med", color: "bg-amber-500" },
  { value: "high", label: "High", color: "bg-blue-500" },
  { value: "hot", label: "🔥", color: "bg-[#42CA80]" },
];

export default function StrategySessionModal({
  lead,
  isOpen,
  onClose,
  onStatusChange,
  onCloseDeal,
}: StrategySessionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Deal Intelligence State
  const [interestLevel, setInterestLevel] = useState<InterestLevel>("medium");
  const [dealProbability, setDealProbability] = useState(50);
  const [meetingNotes, setMeetingNotes] = useState("");

  // Reschedule State
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  // Proposal State
  const [showProposalInput, setShowProposalInput] = useState(false);
  const [proposalLink, setProposalLink] = useState("");

  if (!isOpen) return null;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleAction = async (action: string) => {
    setIsProcessing(true);
    setActiveAction(action);

    try {
      const supabase = createClient();
      const now = new Date().toISOString();

      let updates: any = {};
      let activityOutcome = action;
      let activityNotes = meetingNotes;

      switch (action) {
        case "no_show":
          activityOutcome = "no_show";
          activityNotes = meetingNotes || "No show / No answer on strategy call";
          showToast("Logged as No Show");
          break;

        case "reschedule":
          if (!rescheduleDate || !rescheduleTime) {
            showToast("Select date and time");
            setIsProcessing(false);
            setActiveAction(null);
            return;
          }
          const newDateTime = `${rescheduleDate}T${rescheduleTime}:00`;
          updates = { next_action_date: rescheduleDate };
          activityOutcome = "rescheduled";
          activityNotes = `Rescheduled to ${new Date(newDateTime).toLocaleString()}. ${meetingNotes}`;
          showToast("Session Rescheduled!");
          break;

        case "proposal_sent":
          updates = { status: "strategy_completed" };
          activityOutcome = "proposal_sent";
          activityNotes = proposalLink
            ? `[PROPOSAL SENT] Link: ${proposalLink}. ${meetingNotes}`
            : `[PROPOSAL SENT] ${meetingNotes}`;
          showToast("Proposal Sent");
          break;

        case "contract_sent":
          updates = { status: "strategy_completed" };
          activityOutcome = "contract_sent";
          activityNotes = `[CONTRACT PENDING] ${meetingNotes || "Contract sent, awaiting signature"}`;
          showToast("Contract Pending");
          break;

        case "closed_lost":
          updates = { status: "closed_lost" };
          activityOutcome = "closed_lost";
          activityNotes = meetingNotes || "Not interested / Deal lost";
          showToast("Marked as Lost");
          break;
      }

      // Save deal intelligence to notes
      const intelligenceNote = `[Interest: ${interestLevel.toUpperCase()}, Prob: ${dealProbability}%]`;
      const fullNotes = activityNotes
        ? `${intelligenceNote} ${activityNotes}`
        : intelligenceNote;

      // Update lead if there are updates
      if (Object.keys(updates).length > 0) {
        const { error: leadError } = await supabase
          .from("leads")
          .update({
            ...updates,
            notes: lead.notes ? `${lead.notes}\n${fullNotes}` : fullNotes,
          })
          .eq("id", lead.id);

        if (leadError) throw leadError;
      }

      // Log call activity
      await supabase.from("call_activities").insert({
        lead_id: lead.id,
        outcome: activityOutcome,
        notes: fullNotes,
        created_at: now,
      });

      // Notify parent of status change
      if (updates.status) {
        onStatusChange(lead.id, updates.status, updates);
      }

      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      showToast("Error occurred");
    } finally {
      setIsProcessing(false);
      setActiveAction(null);
    }
  };

  const handleCloseDealClick = () => {
    onClose();
    onCloseDeal(lead);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl border border-[#1a1a1a] bg-[#0f0f0f] shadow-2xl sm:max-w-lg sm:rounded-2xl">
        {/* Toast */}
        {toast && (
          <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg bg-[#42CA80] px-4 py-2 text-sm font-semibold text-white shadow-lg">
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1a1a1a] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-white sm:text-xl">{lead.company_name}</h2>
            <p className="text-xs text-[#a1a1aa] sm:text-sm">Strategy Session</p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="ml-2 flex-shrink-0 rounded-lg p-2 text-[#666] transition-colors active:bg-[#1a1a1a] active:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Section 1: Call Outcome */}
          <div className="mb-4 sm:mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#666]">
              Call Outcome
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* No Show */}
              <button
                onClick={() => handleAction("no_show")}
                disabled={isProcessing}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 transition-all active:scale-[0.98] sm:gap-2 sm:p-4",
                  "border-amber-500/30 bg-amber-500/10 active:border-amber-500 active:bg-amber-500/20",
                  isProcessing && "opacity-50"
                )}
              >
                <PhoneMissed className="h-5 w-5 text-amber-400 sm:h-6 sm:w-6" />
                <span className="text-[10px] font-semibold text-amber-400 sm:text-xs">No Show</span>
              </button>

              {/* Reschedule */}
              <button
                onClick={() => setShowReschedule(!showReschedule)}
                disabled={isProcessing}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 transition-all active:scale-[0.98] sm:gap-2 sm:p-4",
                  showReschedule
                    ? "border-blue-500 bg-blue-500/20"
                    : "border-blue-500/30 bg-blue-500/10 active:border-blue-500 active:bg-blue-500/20",
                  isProcessing && "opacity-50"
                )}
              >
                <CalendarClock className="h-5 w-5 text-blue-400 sm:h-6 sm:w-6" />
                <span className="text-[10px] font-semibold text-blue-400 sm:text-xs">Reschedule</span>
              </button>

              {/* Send Proposal */}
              <button
                onClick={() => setShowProposalInput(!showProposalInput)}
                disabled={isProcessing}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 transition-all active:scale-[0.98] sm:gap-2 sm:p-4",
                  showProposalInput
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-purple-500/30 bg-purple-500/10 active:border-purple-500 active:bg-purple-500/20",
                  isProcessing && "opacity-50"
                )}
              >
                <FileText className="h-5 w-5 text-purple-400 sm:h-6 sm:w-6" />
                <span className="text-[10px] font-semibold text-purple-400 sm:text-xs">Proposal</span>
              </button>

              {/* Contract Pending */}
              <button
                onClick={() => handleAction("contract_sent")}
                disabled={isProcessing}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 transition-all active:scale-[0.98] sm:gap-2 sm:p-4",
                  "border-indigo-500/30 bg-indigo-500/10 active:border-indigo-500 active:bg-indigo-500/20",
                  isProcessing && activeAction === "contract_sent" && "opacity-50"
                )}
              >
                {activeAction === "contract_sent" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-400 sm:h-6 sm:w-6" />
                ) : (
                  <FileSignature className="h-5 w-5 text-indigo-400 sm:h-6 sm:w-6" />
                )}
                <span className="text-[10px] font-semibold text-indigo-400 sm:text-xs">Contract</span>
              </button>

              {/* Deal Won */}
              <button
                onClick={handleCloseDealClick}
                disabled={isProcessing}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 transition-all active:scale-[0.98] sm:gap-2 sm:p-4",
                  "border-[#42CA80]/30 bg-[#42CA80]/10 active:border-[#42CA80] active:bg-[#42CA80]/20",
                  isProcessing && "opacity-50"
                )}
              >
                <Trophy className="h-5 w-5 text-[#42CA80] sm:h-6 sm:w-6" />
                <span className="text-[10px] font-semibold text-[#42CA80] sm:text-xs">Won!</span>
              </button>

              {/* Not Interested / Lost */}
              <button
                onClick={() => handleAction("closed_lost")}
                disabled={isProcessing}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 transition-all active:scale-[0.98] sm:gap-2 sm:p-4",
                  "border-red-500/30 bg-red-500/10 active:border-red-500 active:bg-red-500/20",
                  isProcessing && activeAction === "closed_lost" && "opacity-50"
                )}
              >
                {activeAction === "closed_lost" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-red-400 sm:h-6 sm:w-6" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400 sm:h-6 sm:w-6" />
                )}
                <span className="text-[10px] font-semibold text-red-400 sm:text-xs">Lost</span>
              </button>
            </div>

            {/* Reschedule Picker */}
            {showReschedule && (
              <div className="mt-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 sm:mt-4 sm:p-4">
                <p className="mb-2 text-xs font-medium text-blue-400 sm:mb-3 sm:text-sm">New Date & Time</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    min={today}
                    className="flex-1 rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none"
                  />
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="flex-1 rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none"
                  />
                  <button
                    onClick={() => handleAction("reschedule")}
                    disabled={isProcessing || !rescheduleDate || !rescheduleTime}
                    className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors active:bg-blue-600 disabled:opacity-50"
                  >
                    {activeAction === "reschedule" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Proposal Link Input */}
            {showProposalInput && (
              <div className="mt-3 rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 sm:mt-4 sm:p-4">
                <p className="mb-2 text-xs font-medium text-purple-400 sm:mb-3 sm:text-sm">
                  Proposal Link (Optional)
                </p>
                <div className="flex gap-2 sm:gap-3">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
                    <input
                      type="url"
                      value={proposalLink}
                      onChange={(e) => setProposalLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] py-2 pl-10 pr-3 text-sm text-white placeholder-[#666] focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleAction("proposal_sent")}
                    disabled={isProcessing}
                    className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition-colors active:bg-purple-600 disabled:opacity-50"
                  >
                    {activeAction === "proposal_sent" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Send"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Deal Intelligence */}
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-3 sm:p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#666] sm:mb-4">
              Deal Intelligence
            </h3>

            {/* Interest Level */}
            <div className="mb-3 sm:mb-4">
              <label className="mb-2 flex items-center gap-2 text-xs font-medium text-white sm:text-sm">
                <Target className="h-3.5 w-3.5 text-indigo-400 sm:h-4 sm:w-4" />
                Interest
              </label>
              <div className="flex gap-1.5 sm:gap-2">
                {INTEREST_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setInterestLevel(level.value)}
                    className={clsx(
                      "flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition-all sm:px-3 sm:text-sm",
                      interestLevel === level.value
                        ? `${level.color} text-white`
                        : "bg-[#1a1a1a] text-[#a1a1aa] active:bg-[#252525]"
                    )}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Deal Probability */}
            <div className="mb-3 sm:mb-4">
              <label className="mb-2 flex items-center justify-between text-xs font-medium text-white sm:text-sm">
                <span className="flex items-center gap-2">
                  <Percent className="h-3.5 w-3.5 text-indigo-400 sm:h-4 sm:w-4" />
                  Probability
                </span>
                <span className="text-base font-bold text-indigo-400 sm:text-lg">{dealProbability}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={dealProbability}
                onChange={(e) => setDealProbability(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Meeting Notes */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-medium text-white sm:text-sm">
                <MessageSquare className="h-3.5 w-3.5 text-indigo-400 sm:h-4 sm:w-4" />
                Notes
              </label>
              <textarea
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                placeholder="Key points, budget, timeline..."
                className="h-20 w-full resize-none rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] px-3 py-2 text-sm text-white placeholder-[#666] focus:border-indigo-500/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#1a1a1a] bg-[#0a0a0a] px-4 py-3 sm:px-6 sm:py-4">
          <p className="text-[10px] text-[#666] sm:text-xs">
            Status: <span className="font-medium text-[#a1a1aa]">{lead.status}</span>
          </p>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-lg border border-[#333] bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white transition-colors active:bg-[#252525] disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
