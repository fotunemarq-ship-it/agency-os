"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Phone,
  MessageCircle,
  Calendar,
  MapPin,
  Building2,
  User,
  Tag,
  Clock,
  Flame,
  PhoneOff,
  PhoneForwarded,
  XCircle,
  ChevronDown,
  Zap,
  History,
  BarChart3,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import clsx from "clsx";

interface Lead {
  id: string;
  company_name: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  industry: string | null;
  city: string | null;
  status: string | null;
  notes: string | null;
  next_action_date: string | null;
  created_at: string;
}

interface PowerDialerProps {
  initialLeads: Lead[];
  userId: string | null;
}

type FilterType = "all" | "newest" | "warm" | "followups_today";
type TabType = "queue" | "followups" | "performance";

const QUICK_TAGS = [
  "Asked for brochure",
  "Switched Off",
  "Busy - Call back",
  "Voicemail left",
  "Wrong number",
];

export default function PowerDialer({ initialLeads, userId }: PowerDialerProps) {
  const [queue, setQueue] = useState<Lead[]>(initialLeads);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("queue");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [stats, setStats] = useState({ calls: 0, qualified: 0, contacted: 0 });
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  const currentLead = queue[currentIndex] || null;

  // Filter leads based on selected filter
  const getFilteredQueue = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];

    switch (filter) {
      case "newest":
        return [...initialLeads].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "warm":
        return initialLeads.filter(
          (l) => l.status === "contacted" || l.status === "qualified"
        );
      case "followups_today":
        return initialLeads.filter((l) => l.next_action_date === today);
      default:
        return initialLeads;
    }
  }, [initialLeads, filter]);

  useEffect(() => {
    setQueue(getFilteredQueue());
    setCurrentIndex(0);
  }, [filter, getFilteredQueue]);

  // Show toast notification
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  // Handle outcome action
  const handleOutcome = async (
    newStatus: string,
    options?: { moveToEnd?: boolean; nextActionDays?: number }
  ) => {
    if (!currentLead || isProcessing) return;
    setIsProcessing(true);

    try {
      const supabase = createClient();
      const now = new Date();
      let nextActionDate = null;

      if (options?.nextActionDays) {
        const future = new Date(now);
        future.setDate(future.getDate() + options.nextActionDays);
        nextActionDate = future.toISOString().split("T")[0];
      }

      // Update lead
      const updateData: any = {
        status: newStatus,
        notes: note || currentLead.notes,
      };
      if (nextActionDate) {
        updateData.next_action_date = nextActionDate;
      }

      const leadUpdateQuery = (supabase.from("leads") as any)
        .update(updateData)
        .eq("id", currentLead.id);
      const { error: leadError } = await leadUpdateQuery;

      if (leadError) {
        console.error("Error updating lead:", leadError);
        showToast("Error saving. Try again.");
        setIsProcessing(false);
        return;
      }

      // Log call activity
      const activityInsertQuery = (supabase.from("call_activities") as any).insert({
        lead_id: currentLead.id,
        created_by: userId,
        outcome: newStatus,
        notes: note || null,
        created_at: now.toISOString(),
      });
      const { error: activityError } = await activityInsertQuery;

      if (activityError) {
        console.warn("Could not log call activity:", activityError);
      }

      // Update stats
      setStats((prev) => ({
        calls: prev.calls + 1,
        qualified: newStatus === "qualified" ? prev.qualified + 1 : prev.qualified,
        contacted: newStatus === "contacted" ? prev.contacted + 1 : prev.contacted,
      }));

      // Clear note
      setNote("");

      // Advance to next or move to end
      if (options?.moveToEnd) {
        const newQueue = [...queue];
        const [moved] = newQueue.splice(currentIndex, 1);
        newQueue.push(moved);
        setQueue(newQueue);
      } else {
        const newQueue = queue.filter((_, i) => i !== currentIndex);
        setQueue(newQueue);
        if (currentIndex >= newQueue.length && newQueue.length > 0) {
          setCurrentIndex(newQueue.length - 1);
        }
      }

      showToast("✓ Saved & Next");
    } catch (error) {
      console.error("Error:", error);
      showToast("Error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  // Open WhatsApp
  const openWhatsApp = () => {
    if (!currentLead?.phone) return;
    const phone = currentLead.phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hi ${currentLead.contact_person || "there"}, I'm reaching out from FortuneMarq regarding ${currentLead.company_name || "your business"}. Would you have a few minutes to discuss how we can help grow your business?`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (isProcessing || !currentLead) return;

      switch (e.key) {
        case "1":
          handleOutcome("qualified");
          break;
        case "2":
          handleOutcome("contacted", { nextActionDays: 1 });
          break;
        case "3":
          handleOutcome("disqualified");
          break;
        case "4":
          handleOutcome("calling", { moveToEnd: true });
          break;
        case "5":
          handleOutcome("disqualified");
          break;
        case "w":
        case "W":
          openWhatsApp();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLead, isProcessing, queue, currentIndex, note, userId]);

  // Add quick tag to note
  const addQuickTag = (tag: string) => {
    setNote((prev) => (prev ? `${prev} | ${tag}` : tag));
    noteInputRef.current?.focus();
  };

  const filterLabels: Record<FilterType, string> = {
    all: "All Leads",
    newest: "Newest Uploads",
    warm: "Warm Leads",
    followups_today: "Follow-ups Today",
  };

  if (activeTab === "performance") {
    return (
      <div className="flex min-h-[calc(100vh-120px)] flex-col md:h-[calc(100vh-120px)]">
        <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#42CA80]/20">
              <BarChart3 className="h-10 w-10 text-[#42CA80]" />
            </div>
            <h2 className="text-2xl font-bold text-white">Session Stats</h2>
            <div className="mt-8 flex gap-6 sm:gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-white sm:text-4xl">{stats.calls}</p>
                <p className="mt-1 text-xs text-[#666] sm:text-sm">Calls Made</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#42CA80] sm:text-4xl">{stats.qualified}</p>
                <p className="mt-1 text-xs text-[#666] sm:text-sm">Qualified</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400 sm:text-4xl">{stats.contacted}</p>
                <p className="mt-1 text-xs text-[#666] sm:text-sm">Follow-ups</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentLead) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] flex-col md:h-[calc(100vh-120px)]">
        <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#42CA80]/20">
              <CheckCircle2 className="h-8 w-8 text-[#42CA80]" />
            </div>
            <h2 className="text-xl font-bold text-white">Queue Complete!</h2>
            <p className="mt-2 text-[#666]">
              {filter !== "all"
                ? "Try changing filters to see more leads"
                : "No more leads to call right now"}
            </p>
            {stats.calls > 0 && (
              <div className="mt-6 flex justify-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stats.calls}</p>
                  <p className="text-xs text-[#666]">Calls</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#42CA80]">{stats.qualified}</p>
                  <p className="text-xs text-[#666]">Hot</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col md:h-[calc(100vh-120px)] md:overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-lg bg-[#42CA80] px-4 py-2 text-sm font-semibold text-white shadow-lg md:top-4">
          {toast}
        </div>
      )}

      {/* Top Nav */}
      <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Filter Bar */}
      <div className="flex flex-col gap-2 border-b border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-xs text-[#666] sm:text-sm">
            Lead <span className="font-mono text-white">{currentIndex + 1}</span> of{" "}
            <span className="font-mono text-white">{queue.length}</span>
          </span>
          <div className="hidden h-4 w-px bg-[#1a1a1a] sm:block" />
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-2.5 py-1.5 text-xs text-white transition-colors hover:bg-[#252525] sm:gap-2 sm:px-3 sm:text-sm"
            >
              <Filter className="h-3 w-3 text-[#666] sm:h-3.5 sm:w-3.5" />
              <span className="max-w-[100px] truncate sm:max-w-none">{filterLabels[filter]}</span>
              <ChevronDown className="h-3 w-3 text-[#666] sm:h-3.5 sm:w-3.5" />
            </button>
            {showFilterMenu && (
              <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] py-1 shadow-xl sm:w-48">
                {(Object.keys(filterLabels) as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilter(f);
                      setShowFilterMenu(false);
                    }}
                    className={clsx(
                      "w-full px-3 py-2 text-left text-xs transition-colors hover:bg-[#1a1a1a] sm:text-sm",
                      filter === f ? "text-[#42CA80]" : "text-white"
                    )}
                  >
                    {filterLabels[f]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="hidden items-center gap-2 text-xs text-[#666] md:flex">
          <Zap className="h-3.5 w-3.5" />
          Press 1-5 or W for quick actions
        </div>
      </div>

      {/* Main Split View - Vertical on mobile, Horizontal on desktop */}
      <div className="flex flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        {/* Left Panel: Lead Viewer */}
        <div className="flex w-full flex-col bg-[#0a0a0a] md:w-3/5 md:border-r md:border-[#1a1a1a]">
          {/* Lead Header */}
          <div className="border-b border-[#1a1a1a] p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-xl font-bold text-white sm:text-2xl">
                  {currentLead.company_name || "Unknown Company"}
                </h1>
                <div className="mt-1.5 flex items-center gap-2 text-[#a1a1aa] sm:mt-2">
                  <User className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                  <span className="truncate text-sm">{currentLead.contact_person || "No contact name"}</span>
                </div>
              </div>
              <span
                className={clsx(
                  "flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium sm:px-3",
                  currentLead.status === "qualified"
                    ? "bg-[#42CA80]/20 text-[#42CA80]"
                    : currentLead.status === "contacted"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-[#1a1a1a] text-[#666]"
                )}
              >
                {currentLead.status || "new"}
              </span>
            </div>
          </div>

          {/* The Phone Number - HUGE on mobile */}
          <div className="flex-shrink-0 border-b border-[#1a1a1a] p-4 sm:p-6">
            <a
              href={`tel:${currentLead.phone}`}
              className="group flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#42CA80] to-[#3ab872] p-5 transition-all hover:shadow-lg hover:shadow-[#42CA80]/20 active:scale-[0.98] sm:gap-4 sm:p-6"
            >
              <Phone className="h-7 w-7 text-white sm:h-8 sm:w-8" />
              <span className="text-2xl font-bold tracking-wider text-white sm:text-3xl">
                {currentLead.phone || "No phone"}
              </span>
            </a>
          </div>

          {/* Context Info */}
          <div className="flex-shrink-0 border-b border-[#1a1a1a] p-3 sm:p-4">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {currentLead.industry && (
                <div className="flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-2.5 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
                  <Building2 className="h-3.5 w-3.5 text-purple-400 sm:h-4 sm:w-4" />
                  <span className="text-xs text-white sm:text-sm">{currentLead.industry}</span>
                </div>
              )}
              {currentLead.city && (
                <div className="flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-2.5 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400 sm:h-4 sm:w-4" />
                  <span className="text-xs text-white sm:text-sm">{currentLead.city}</span>
                </div>
              )}
              {currentLead.email && (
                <div className="flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-2.5 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
                  <Tag className="h-3.5 w-3.5 text-amber-400 sm:h-4 sm:w-4" />
                  <span className="max-w-[150px] truncate text-xs text-white sm:max-w-none sm:text-sm">
                    {currentLead.email}
                  </span>
                </div>
              )}
              {currentLead.next_action_date && (
                <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-2.5 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
                  <Clock className="h-3.5 w-3.5 text-amber-400 sm:h-4 sm:w-4" />
                  <span className="text-xs text-amber-400 sm:text-sm">
                    Follow-up: {currentLead.next_action_date}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* History / Notes */}
          {currentLead.notes && (
            <div className="flex-shrink-0 border-b border-[#1a1a1a] p-3 sm:p-4">
              <div className="flex items-start gap-2">
                <History className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#666] sm:h-4 sm:w-4" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#666] sm:text-xs">
                    Previous Notes
                  </p>
                  <p className="mt-1 text-xs text-[#a1a1aa] sm:text-sm">{currentLead.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Notes Input - Hidden on mobile by default, shown in action panel */}
          <div className="hidden flex-1 p-4 md:block">
            <textarea
              ref={noteInputRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add notes for this call..."
              className="h-20 w-full resize-none rounded-xl border border-[#1a1a1a] bg-[#0f0f0f] px-4 py-3 text-sm text-white placeholder-[#666] focus:border-[#42CA80]/50 focus:outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => addQuickTag(tag)}
                  className="rounded-full border border-[#1a1a1a] bg-[#0f0f0f] px-3 py-1 text-xs text-[#a1a1aa] transition-colors hover:border-[#42CA80]/50 hover:text-white"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Action Center */}
        <div className="flex w-full flex-col bg-[#0f0f0f] p-4 sm:p-6 md:w-2/5">
          {/* Notes input on mobile */}
          <div className="mb-4 md:hidden">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add notes..."
              className="h-16 w-full resize-none rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder-[#666] focus:border-[#42CA80]/50 focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_TAGS.slice(0, 3).map((tag) => (
                <button
                  key={tag}
                  onClick={() => addQuickTag(tag)}
                  className="rounded-full border border-[#1a1a1a] bg-[#0a0a0a] px-2 py-0.5 text-[10px] text-[#a1a1aa] transition-colors hover:border-[#42CA80]/50 hover:text-white"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#666] sm:mb-4 sm:text-sm">
            Call Outcome
          </h2>

          {/* Action Buttons Grid - 2 columns */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Interested (Hot) */}
            <button
              onClick={() => handleOutcome("qualified")}
              disabled={isProcessing}
              className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-[#42CA80]/30 bg-[#42CA80]/10 p-3 transition-all hover:border-[#42CA80] hover:bg-[#42CA80]/20 active:scale-[0.98] disabled:opacity-50 sm:p-5"
            >
              <Flame className="h-6 w-6 text-[#42CA80] sm:h-8 sm:w-8" />
              <span className="mt-1.5 text-sm font-semibold text-[#42CA80] sm:mt-2">Interested</span>
              <span className="mt-0.5 text-[10px] text-[#42CA80]/70 sm:mt-1 sm:text-xs">Hot Lead</span>
              <kbd className="absolute right-1.5 top-1.5 hidden rounded bg-[#42CA80]/20 px-1.5 py-0.5 text-[10px] font-mono text-[#42CA80] sm:block sm:right-2 sm:top-2">
                1
              </kbd>
            </button>

            {/* Follow-up */}
            <button
              onClick={() => handleOutcome("contacted", { nextActionDays: 1 })}
              disabled={isProcessing}
              className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-blue-500/30 bg-blue-500/10 p-3 transition-all hover:border-blue-500 hover:bg-blue-500/20 active:scale-[0.98] disabled:opacity-50 sm:p-5"
            >
              <Calendar className="h-6 w-6 text-blue-400 sm:h-8 sm:w-8" />
              <span className="mt-1.5 text-sm font-semibold text-blue-400 sm:mt-2">Follow-up</span>
              <span className="mt-0.5 text-[10px] text-blue-400/70 sm:mt-1 sm:text-xs">Tomorrow</span>
              <kbd className="absolute right-1.5 top-1.5 hidden rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-mono text-blue-400 sm:block sm:right-2 sm:top-2">
                2
              </kbd>
            </button>

            {/* Not Interested */}
            <button
              onClick={() => handleOutcome("disqualified")}
              disabled={isProcessing}
              className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-red-500/30 bg-red-500/10 p-3 transition-all hover:border-red-500 hover:bg-red-500/20 active:scale-[0.98] disabled:opacity-50 sm:p-5"
            >
              <XCircle className="h-6 w-6 text-red-400 sm:h-8 sm:w-8" />
              <span className="mt-1.5 text-sm font-semibold text-red-400 sm:mt-2">Not Interested</span>
              <span className="mt-0.5 text-[10px] text-red-400/70 sm:mt-1 sm:text-xs">Disqualify</span>
              <kbd className="absolute right-1.5 top-1.5 hidden rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-mono text-red-400 sm:block sm:right-2 sm:top-2">
                3
              </kbd>
            </button>

            {/* Call Later / Busy */}
            <button
              onClick={() => handleOutcome("calling", { moveToEnd: true })}
              disabled={isProcessing}
              className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-amber-500/30 bg-amber-500/10 p-3 transition-all hover:border-amber-500 hover:bg-amber-500/20 active:scale-[0.98] disabled:opacity-50 sm:p-5"
            >
              <PhoneForwarded className="h-6 w-6 text-amber-400 sm:h-8 sm:w-8" />
              <span className="mt-1.5 text-sm font-semibold text-amber-400 sm:mt-2">Call Later</span>
              <span className="mt-0.5 text-[10px] text-amber-400/70 sm:mt-1 sm:text-xs">Busy</span>
              <kbd className="absolute right-1.5 top-1.5 hidden rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-mono text-amber-400 sm:block sm:right-2 sm:top-2">
                4
              </kbd>
            </button>

            {/* Wrong Number */}
            <button
              onClick={() => handleOutcome("disqualified")}
              disabled={isProcessing}
              className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-[#1a1a1a] bg-[#1a1a1a]/50 p-3 transition-all hover:border-[#333] hover:bg-[#1a1a1a] active:scale-[0.98] disabled:opacity-50 sm:p-5"
            >
              <PhoneOff className="h-6 w-6 text-[#666] sm:h-8 sm:w-8" />
              <span className="mt-1.5 text-sm font-semibold text-[#a1a1aa] sm:mt-2">Wrong #</span>
              <span className="mt-0.5 text-[10px] text-[#666] sm:mt-1 sm:text-xs">Invalid</span>
              <kbd className="absolute right-1.5 top-1.5 hidden rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[10px] font-mono text-[#666] sm:block sm:right-2 sm:top-2">
                5
              </kbd>
            </button>

            {/* WhatsApp */}
            <button
              onClick={openWhatsApp}
              disabled={!currentLead.phone}
              className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-green-500/30 bg-green-500/10 p-3 transition-all hover:border-green-500 hover:bg-green-500/20 active:scale-[0.98] disabled:opacity-50 sm:p-5"
            >
              <MessageCircle className="h-6 w-6 text-green-400 sm:h-8 sm:w-8" />
              <span className="mt-1.5 text-sm font-semibold text-green-400 sm:mt-2">WhatsApp</span>
              <span className="mt-0.5 text-[10px] text-green-400/70 sm:mt-1 sm:text-xs">Message</span>
              <kbd className="absolute right-1.5 top-1.5 hidden rounded bg-green-500/20 px-1.5 py-0.5 text-[10px] font-mono text-green-400 sm:block sm:right-2 sm:top-2">
                W
              </kbd>
            </button>
          </div>

          {/* Session Stats */}
          <div className="mt-4 sm:mt-auto sm:pt-6">
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-3 sm:p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#666] sm:text-xs">
                Session Stats
              </p>
              <div className="mt-2 flex justify-between sm:mt-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-white sm:text-xl">{stats.calls}</p>
                  <p className="text-[9px] text-[#666] sm:text-[10px]">Calls</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#42CA80] sm:text-xl">{stats.qualified}</p>
                  <p className="text-[9px] text-[#666] sm:text-[10px]">Hot</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-400 sm:text-xl">{stats.contacted}</p>
                  <p className="text-[9px] text-[#666] sm:text-[10px]">Follow-up</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Top Navigation Component
function TopNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}) {
  const tabs: { key: TabType; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    { key: "queue", label: "Call Queue", shortLabel: "Queue", icon: <Phone className="h-4 w-4" /> },
    { key: "followups", label: "My Follow-ups", shortLabel: "Follow-ups", icon: <Calendar className="h-4 w-4" /> },
    { key: "performance", label: "My Performance", shortLabel: "Stats", icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <div className="flex items-center gap-0.5 overflow-x-auto border-b border-[#1a1a1a] bg-[#0f0f0f] px-2 sm:gap-1 sm:px-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={clsx(
            "flex flex-shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-xs font-medium transition-colors sm:gap-2 sm:px-4 sm:py-3 sm:text-sm",
            activeTab === tab.key
              ? "border-[#42CA80] text-[#42CA80]"
              : "border-transparent text-[#666] hover:text-white"
          )}
        >
          {tab.icon}
          <span className="sm:hidden">{tab.shortLabel}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
