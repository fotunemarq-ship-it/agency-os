"use client";

import { useState } from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface CallOutcomeModalProps {
  leadId: string;
  leadCompanyName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type OutcomeType =
  | "no_answer"
  | "callback_scheduled"
  | "not_interested"
  | "wrong_number"
  | "qualified_pass_to_strategist";

interface OutcomeConfig {
  type: OutcomeType;
  label: string;
  status: "calling" | "contacted" | "disqualified" | "qualified";
  color: string;
  needsDateTime: boolean;
}

const outcomes: OutcomeConfig[] = [
  {
    type: "no_answer",
    label: "No Answer",
    status: "calling",
    color: "bg-gray-600 hover:bg-gray-700",
    needsDateTime: false,
  },
  {
    type: "callback_scheduled",
    label: "Callback / Interested",
    status: "contacted",
    color: "bg-blue-600 hover:bg-blue-700",
    needsDateTime: true,
  },
  {
    type: "not_interested",
    label: "Not Interested",
    status: "disqualified",
    color: "bg-red-600 hover:bg-red-700",
    needsDateTime: false,
  },
  {
    type: "wrong_number",
    label: "Wrong Number",
    status: "disqualified",
    color: "bg-red-600 hover:bg-red-700",
    needsDateTime: false,
  },
  {
    type: "qualified_pass_to_strategist",
    label: "Qualified!",
    status: "qualified",
    color: "bg-[#42CA80] hover:bg-[#42CA80]/90",
    needsDateTime: false,
  },
];

export default function CallOutcomeModal({
  leadId,
  leadCompanyName,
  isOpen,
  onClose,
  onSuccess,
}: CallOutcomeModalProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeConfig | null>(
    null
  );
  const [callbackDateTime, setCallbackDateTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen) return null;


  const handleOutcomeSelect = (outcome: OutcomeConfig) => {
    setSelectedOutcome(outcome);
    setMessage(null);
    if (!outcome.needsDateTime) {
      handleSubmit(outcome, null);
    }
  };

  const handleSubmit = async (
    outcome: OutcomeConfig,
    dateTime: string | null
  ) => {
    if (outcome.needsDateTime && !dateTime) {
      setMessage({
        type: "error",
        text: "Please select a date and time for the callback.",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const supabase = createClient();

      // Calculate next_action_date
      let nextActionDate: string | null = null;
      if (outcome.needsDateTime && dateTime) {
        // Convert datetime-local to ISO string
        nextActionDate = new Date(dateTime).toISOString();
      } else if (outcome.type === "no_answer") {
        // For "no_answer", set date only (not datetime) +2 days
        const date = new Date();
        date.setDate(date.getDate() + 2);
        nextActionDate = date.toISOString().split("T")[0]; // YYYY-MM-DD format
      }

      // Update the lead
      const { error: leadError } = await supabase
        .from("leads")
        .update({
          status: outcome.status,
          next_action_date: nextActionDate,
        })
        .eq("id", leadId);

      if (leadError) throw leadError;

      // Insert call activity (assuming call_activities table exists)
      // If the table doesn't exist yet, this will fail gracefully
      const callActivityData: any = {
        lead_id: leadId,
        outcome: outcome.type,
        created_at: new Date().toISOString(),
      };

      if (outcome.needsDateTime && dateTime) {
        callActivityData.callback_datetime = new Date(dateTime).toISOString();
      }

      // Try to insert call activity, but don't fail if table doesn't exist
      try {
        await supabase.from("call_activities").insert(callActivityData);
      } catch (err) {
        // Silently fail if call_activities table doesn't exist
        console.warn("call_activities table may not exist:", err);
      }

      setMessage({
        type: "success",
        text: `Call outcome recorded: ${outcome.label}`,
      });

      // Close modal after a brief delay
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1000);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to save call outcome. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedOutcome(null);
    setCallbackDateTime("");
    setMessage(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleDateTimeSubmit = () => {
    if (selectedOutcome && callbackDateTime) {
      handleSubmit(selectedOutcome, callbackDateTime);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl border border-[#1a1a1a] bg-[#1a1a1a] shadow-xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#0f0f0f] p-4 sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-white">How did the call go?</h2>
            <p className="mt-1 text-sm text-[#a1a1aa]">{leadCompanyName}</p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-[#a1a1aa] transition-colors hover:bg-[#0f0f0f] hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {selectedOutcome?.needsDateTime ? (
            /* DateTime Picker for Callback */
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="callback-datetime"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Select Callback Date & Time
                </label>
                <input
                  id="callback-datetime"
                  type="datetime-local"
                  value={callbackDateTime}
                  onChange={(e) => setCallbackDateTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full rounded-lg border border-[#0f0f0f] bg-[#0f0f0f] px-4 py-3 text-white focus:border-[#42CA80] focus:outline-none"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDateTimeSubmit}
                  disabled={!callbackDateTime || isSubmitting}
                  className="flex-1 rounded-lg bg-[#42CA80] px-4 py-3 font-medium text-white transition-colors hover:bg-[#42CA80]/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Schedule Callback"}
                </button>
                <button
                  onClick={() => setSelectedOutcome(null)}
                  disabled={isSubmitting}
                  className="rounded-lg border border-[#0f0f0f] bg-[#0f0f0f] px-4 py-3 font-medium text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            /* Outcome Buttons Grid */
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {outcomes.map((outcome) => (
                <button
                  key={outcome.type}
                  onClick={() => handleOutcomeSelect(outcome)}
                  disabled={isSubmitting}
                  className={`flex min-h-[60px] items-center justify-center rounded-lg px-4 py-4 font-medium text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${outcome.color}`}
                >
                  {outcome.label}
                </button>
              ))}
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-3 ${
                message.type === "success"
                  ? "border-[#42CA80]/50 bg-[#42CA80]/10 text-[#42CA80]"
                  : "border-red-500/50 bg-red-500/10 text-red-500"
              }`}
              role="alert"
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

