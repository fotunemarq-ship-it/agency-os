"use client";

import { useState } from "react";
import { X, Calendar, Clock, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";
import clsx from "clsx";

interface StrategyBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirm: (dateTime: string, topic: string) => Promise<void>;
  leadName?: string;
}

const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export default function StrategyBookingModal({
  isOpen,
  onClose,
  onBookingConfirm,
  leadName,
}: StrategyBookingModalProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setError("Please select both date and time");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const dateTime = `${selectedDate}T${selectedTime}:00`;
      await onBookingConfirm(dateTime, topic);
      handleClose();
    } catch (err) {
      setError("Failed to book session. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedDate("");
    setSelectedTime("");
    setTopic("");
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1a1a1a] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/30">
              <Calendar className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Book Strategy Session</h2>
              <p className="text-xs text-[#a1a1aa]">{leadName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Date Picker */}
          <div className="mb-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              <Calendar className="h-4 w-4 text-indigo-400" />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              className="w-full rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-3 text-white focus:border-indigo-500/50 focus:outline-none"
              disabled={isSubmitting}
            />
            {selectedDate && (
              <p className="mt-1.5 text-sm text-indigo-400">
                {formatDisplayDate(selectedDate)}
              </p>
            )}
          </div>

          {/* Time Picker */}
          <div className="mb-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              <Clock className="h-4 w-4 text-indigo-400" />
              Select Time
            </label>
            <div className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-3">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  disabled={isSubmitting}
                  className={clsx(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    selectedTime === time
                      ? "bg-indigo-500 text-white"
                      : "bg-[#1a1a1a] text-[#a1a1aa] hover:bg-[#252525] hover:text-white"
                  )}
                >
                  {formatTime(time)}
                </button>
              ))}
            </div>
          </div>

          {/* Topic (Optional) */}
          <div className="mb-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              Topic to Discuss
              <span className="text-xs text-[#666]">(Optional)</span>
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., SEO strategy, website redesign, marketing audit..."
              className="h-20 w-full resize-none rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder-[#666] focus:border-indigo-500/50 focus:outline-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Summary */}
          {selectedDate && selectedTime && (
            <div className="mb-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                Booking Summary
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatDisplayDate(selectedDate)}
              </p>
              <p className="text-indigo-300">at {formatTime(selectedTime)}</p>
              {topic && (
                <p className="mt-2 text-sm text-[#a1a1aa]">Topic: {topic}</p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-[#1a1a1a] bg-[#0a0a0a] px-5 py-4">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-[#333] bg-[#1a1a1a] px-4 py-3 font-medium text-white transition-colors hover:bg-[#252525] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedDate || !selectedTime}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 font-semibold text-white transition-all hover:from-indigo-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirm Booking
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

