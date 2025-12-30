"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Phone,
  MessageCircle,
  Calendar,
  MapPin,
  Building2,
  User,
  Flame,
  PhoneOff,
  PhoneMissed,
  XCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  BarChart3,
  CheckCircle2,
  Target,
  Users,
  Globe,
  Lightbulb,
  Copy,
  Sparkles,
  Search,
  Clock,
  Ban,
  AlertCircle,
  CalendarCheck,
  ListTodo,
  Info,
  ExternalLink
} from "lucide-react";
import StrategyBookingModal from "./strategy-booking-modal";
import { createClient } from "@/lib/supabase";
import {
  generateSmartPitch,
  calculateLeadScore,
  type Lead as PitchLead,
  type MarketData,
  type PitchResult,
} from "@/lib/pitch-engine";
import { useLeadType } from "./sales-lead-type-switcher";
import clsx from "clsx";
import ActivityTimeline from "@/components/ActivityTimeline";
import SalesOutcomeModal, { OutcomeData } from "./SalesOutcomeModal";
import ScriptObjectionPanel from "./ScriptObjectionPanel";
import { logFullAction } from "@/lib/audit";

export interface Lead {
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
  lead_type?: string | null;
  source?: string | null;
  last_contacted_at?: string | null;
  stale_flag?: boolean;
  has_website?: boolean | null;
  website_link?: string | null;
}

export interface MarketInsight {
  id: string;
  industry: string;
  city: string;
  search_volume: string | null;
  market_difficulty: string | null;
  top_competitors: string[] | null;
  pitch_angle: string | null;
}

interface SalesIntelligenceCockpitProps {
  initialLeads: Lead[];
  initialMarketInsights: MarketInsight[];
  userId: string | null;
}

export default function SalesIntelligenceCockpit({
  initialLeads,
  initialMarketInsights,
  userId,
}: SalesIntelligenceCockpitProps) {
  const { activeLeadType } = useLeadType();
  const [queue, setQueue] = useState<Lead[]>(initialLeads);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [stats, setStats] = useState({ calls: 0, qualified: 0, contacted: 0 });
  const [copiedScript, setCopiedScript] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // New states for V2 features
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [pendingOutcome, setPendingOutcome] = useState<string | null>(null);
  const [queueTab, setQueueTab] = useState<"calls" | "followups">("calls");
  const [showStaleOnly, setShowStaleOnly] = useState(false);
  const [outcomeCategory, setOutcomeCategory] = useState<"connected" | "not_connected" | null>(null);


  // Filters
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [showIndustryMenu, setShowIndustryMenu] = useState(false);
  const [showCityMenu, setShowCityMenu] = useState(false);

  // Get unique industries and cities from leads
  const uniqueIndustries = useMemo(() => {
    const industries = new Set<string>();
    initialLeads.forEach((lead) => {
      if (lead.industry) industries.add(lead.industry);
    });
    return Array.from(industries).sort();
  }, [initialLeads]);

  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    initialLeads.forEach((lead) => {
      if (lead.city) cities.add(lead.city);
    });
    return Array.from(cities).sort();
  }, [initialLeads]);

  // Updated Queue Logic
  const getFilteredQueue = useCallback(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const startOfToday = new Date(todayStr);
    const endOfToday = new Date(todayStr);
    endOfToday.setHours(23, 59, 59, 999);

    let baseList = initialLeads.filter(l => (l.lead_type || "outbound") === activeLeadType);

    if (queueTab === "followups") {
      baseList = baseList.filter(l => {
        if (!l.next_action_date) return false;
        // Simple check for "due today or earlier"
        // We assume next_action_date is ISO string
        const due = new Date(l.next_action_date);
        return due <= endOfToday;
      });
      // Sort by due date
      baseList.sort((a, b) => new Date(a.next_action_date!).getTime() - new Date(b.next_action_date!).getTime());
    } else {
      // Today's Calls (New/Calling/Contacted)
      // Exclude scheduled followups unless it's just 'calling' bucket general
      // Usually 'Calls' means prioritized list + new leads
      // Filter out closed/qualified/disqualified
      baseList = baseList.filter(l => !["qualified", "closed_won", "closed_lost", "disqualified", "strategy_booked"].includes(l.status || ""));

      // Sort: Stale first, then priority/score (mock), then created_at
      baseList.sort((a, b) => {
        if (a.stale_flag && !b.stale_flag) return -1;
        if (!a.stale_flag && b.stale_flag) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    // Apply filters
    return baseList.filter(lead => {
      const filtersMatch = (industryFilter === "all" || lead.industry === industryFilter) &&
        (cityFilter === "all" || lead.city === cityFilter);
      const staleMatch = !showStaleOnly || lead.stale_flag;
      return filtersMatch && staleMatch;
    });

  }, [initialLeads, activeLeadType, queueTab, industryFilter, cityFilter, showStaleOnly]);

  useEffect(() => {
    const filtered = getFilteredQueue();
    setQueue(filtered);
    setCurrentIndex(0);
  }, [getFilteredQueue]);

  const currentLead = queue[currentIndex] || null;



  // Market Insight & Pitch
  const currentMarketInsight = currentLead
    ? initialMarketInsights.find(
      (mi) =>
        mi.industry?.toLowerCase() === currentLead.industry?.toLowerCase() &&
        mi.city?.toLowerCase() === currentLead.city?.toLowerCase()
    )
    : null;

  const pitchLead: PitchLead | null = currentLead
    ? {
      company_name: currentLead.company_name,
      industry: currentLead.industry,
      city: currentLead.city,
      has_website: currentLead.email ? true : false,
    }
    : null;

  const marketData: MarketData | null = currentMarketInsight
    ? {
      search_volume: currentMarketInsight.search_volume
        ? parseInt(currentMarketInsight.search_volume.replace(/[^0-9]/g, "")) || null
        : null,
      ad_density: (currentMarketInsight.market_difficulty as "low" | "medium" | "high") || null,
      competitor_names: currentMarketInsight.top_competitors || [],
    }
    : null;

  const pitch: PitchResult | null =
    pitchLead && marketData ? generateSmartPitch(pitchLead, marketData) : null;

  const leadScore = pitchLead ? calculateLeadScore(pitchLead, marketData) : 0;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  // Outcome Handling with Modal
  const initiateOutcome = (outcome: string) => {
    setPendingOutcome(outcome);
    setShowOutcomeModal(true);
  };

  const handleSaveOutcome = async (data: OutcomeData) => {
    if (!currentLead || isProcessing) return;
    setIsProcessing(true);

    try {
      const supabase = createClient();
      const now = new Date();

      // Determine new status if simplified
      let newStatus = data.outcome;
      if (data.outcome === "follow_up" || data.outcome === "no_answer" || data.outcome === "busy") newStatus = "calling"; // or keep previous
      if (data.outcome === "not_interested" || data.outcome === "wrong_number" || data.outcome === "invalid_number") newStatus = "disqualified";
      if (data.outcome === "interested") newStatus = "qualified";

      const updates: any = {
        status: newStatus,
        last_contacted_at: now.toISOString(),
        last_outcome: data.outcome,
        next_action_date: data.next_action_date || null, // Clear if not set
        stale_flag: false, // Reset stale on contact
      };

      // Insert to lead_outcomes
      const { error: outcomesError } = await (supabase.from("lead_outcomes") as any).insert({
        lead_id: currentLead.id,
        actor_id: userId,
        outcome: data.outcome,
        reason_code: data.reason_code,
        reason_note: data.notes, // using reason_note for generic notes from modal
        next_action_date: data.next_action_date,
      });

      if (outcomesError) throw outcomesError;

      // Update lead
      const { error: leadError } = await (supabase.from("leads") as any).update(updates).eq("id", currentLead.id);
      if (leadError) throw leadError;

      // Audit Log
      await logFullAction(
        {
          entity_type: "lead",
          entity_id: currentLead.id,
          event_type: "call_outcome",
          title: `Call Outcome: ${data.outcome}`,
          body: `Reason: ${data.reason_code || 'N/A'}. Notes: ${data.notes || ''}`,
          metadata: { outcome: data.outcome, reason: data.reason_code, next_action: data.next_action_date },
        },
        {
          entity_type: "lead",
          entity_id: currentLead.id,
          action: "UPDATE",
          before_data: currentLead,
          after_data: { ...currentLead, ...updates },
        }
      );

      // Update Stats
      setStats((prev) => ({
        calls: prev.calls + 1,
        qualified: newStatus === "qualified" ? prev.qualified + 1 : prev.qualified,
        contacted: prev.contacted + 1,
      }));

      // Next Lead
      const newQueue = queue.filter((_, i) => i !== currentIndex);
      setQueue(newQueue);
      if (currentIndex >= newQueue.length && newQueue.length > 0) {
        setCurrentIndex(newQueue.length - 1);
      }
      showToast("Outcome Saved!");

    } catch (e) {
      console.error(e);
      showToast("Error saving outcome");
    } finally {
      setIsProcessing(false);
    }
  };

  const openWhatsApp = () => {
    if (!currentLead?.phone) return;
    const phone = currentLead.phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      pitch?.script ||
      `Hi ${currentLead.contact_person || "there"}, I'm reaching out from FortuneMarq regarding ${currentLead.company_name || "your business"}. Would you have a few minutes to discuss how we can help grow your business?`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const copyScript = () => {
    if (pitch?.script) {
      navigator.clipboard.writeText(pitch.script);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
  };

  // Keyboard Shortcuts update
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showOutcomeModal || showBookingModal) return;
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (!currentLead) return;

      switch (e.key) {
        case "1": initiateOutcome("interested"); break;
        case "2": initiateOutcome("follow_up"); break;
        case "3": initiateOutcome("no_answer"); break;
        case "4": initiateOutcome("not_reachable"); break;
        case "5": initiateOutcome("not_interested"); break;
        case "ArrowRight": if (currentIndex < queue.length - 1) setCurrentIndex(currentIndex + 1); break;
        case "ArrowLeft": if (currentIndex > 0) setCurrentIndex(currentIndex - 1); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentLead, showOutcomeModal, showBookingModal, currentIndex, queue.length]);

  if (!currentLead) {
    return (
      <div className="flex h-screen items-center justify-center flex-col text-center p-8">
        <h2 className="text-2xl font-bold text-white mb-2">You're all caught up!</h2>
        <p className="text-[#666]">No more leads in "{queueTab}" queue matching your filters.</p>
        <div className="mt-6 flex gap-8">
          <div><p className="text-3xl font-bold text-white">{stats.calls}</p><p className="text-xs text-[#666]">Calls Today</p></div>
          <div><p className="text-3xl font-bold text-[#42CA80]">{stats.qualified}</p><p className="text-xs text-[#666]">Qualified</p></div>
        </div>
        <button onClick={() => { setIndustryFilter("all"); setCityFilter("all"); setShowStaleOnly(false); }} className="mt-8 text-[#42CA80] hover:underline">Clear Filters</button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col">
      {/* Outcome Modal */}
      <SalesOutcomeModal
        isOpen={showOutcomeModal}
        onClose={() => setShowOutcomeModal(false)}
        onSave={handleSaveOutcome}
        outcome={pendingOutcome || "follow_up"}
        leadName={currentLead.company_name || "Unknown"}

      />

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-lg bg-[#42CA80] px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Top Bar: Tabs & Nav */}
      <div className="flex flex-col gap-3 border-b border-[#1a1a1a] bg-[#0a0a0a] px-3 py-3 md:flex-row md:items-center md:justify-between sm:px-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Queue Tabs */}
          <div className="flex bg-[#1a1a1a] p-1 rounded-lg">
            <button
              onClick={() => setQueueTab("calls")}
              className={clsx("px-3 py-1.5 rounded-md text-sm font-medium transition-colors", queueTab === "calls" ? "bg-[#252525] text-white shadow-sm" : "text-[#666] hover:text-[#a1a1aa]")}
            >
              Priority Calls
            </button>
            <button
              onClick={() => setQueueTab("followups")}
              className={clsx("px-3 py-1.5 rounded-md text-sm font-medium transition-colors", queueTab === "followups" ? "bg-[#252525] text-white shadow-sm" : "text-[#666] hover:text-[#a1a1aa]")}
            >
              Follow-ups
            </button>
          </div>

          {/* Stale Toggle */}
          {/* Stale Toggle */}
          <button
            onClick={() => setShowStaleOnly(!showStaleOnly)}
            className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border", showStaleOnly ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-transparent border-[#2a2a2a] text-[#666]")}
          >
            <AlertCircle className="h-3 w-3" />
            Stale Only
          </button>

          {/* Industry Filter */}
          <div className="relative">
            <button
              onClick={() => { setShowIndustryMenu(!showIndustryMenu); setShowCityMenu(false); }}
              className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", industryFilter !== "all" ? "bg-[#42CA80]/10 border-[#42CA80]/30 text-[#42CA80]" : "bg-transparent border-[#2a2a2a] text-[#666] hover:text-[#ccc]")}
            >
              <Building2 className="h-3 w-3" />
              {industryFilter === "all" ? "All Industries" : industryFilter}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showIndustryMenu && (
              <div className="absolute top-full left-0 z-50 mt-2 w-48 rounded-xl border border-[#2a2a2a] bg-[#111] shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => { setIndustryFilter("all"); setShowIndustryMenu(false); }}
                  className={clsx("w-full px-4 py-2 text-left text-xs hover:bg-[#252525]", industryFilter === "all" ? "text-[#42CA80] font-bold" : "text-[#aaa]")}
                >
                  All Industries
                </button>
                {uniqueIndustries.map(ind => (
                  <button
                    key={ind}
                    onClick={() => { setIndustryFilter(ind); setShowIndustryMenu(false); }}
                    className={clsx("w-full px-4 py-2 text-left text-xs hover:bg-[#252525]", industryFilter === ind ? "text-[#42CA80] font-bold" : "text-[#aaa]")}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* City Filter */}
          <div className="relative">
            <button
              onClick={() => { setShowCityMenu(!showCityMenu); setShowIndustryMenu(false); }}
              className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", cityFilter !== "all" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-transparent border-[#2a2a2a] text-[#666] hover:text-[#ccc]")}
            >
              <MapPin className="h-3 w-3" />
              {cityFilter === "all" ? "All Cities" : cityFilter}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showCityMenu && (
              <div className="absolute top-full left-0 z-50 mt-2 w-48 rounded-xl border border-[#2a2a2a] bg-[#111] shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => { setCityFilter("all"); setShowCityMenu(false); }}
                  className={clsx("w-full px-4 py-2 text-left text-xs hover:bg-[#252525]", cityFilter === "all" ? "text-blue-400 font-bold" : "text-[#aaa]")}
                >
                  All Cities
                </button>
                {uniqueCities.map(city => (
                  <button
                    key={city}
                    onClick={() => { setCityFilter(city); setShowCityMenu(false); }}
                    className={clsx("w-full px-4 py-2 text-left text-xs hover:bg-[#252525]", cityFilter === city ? "text-blue-400 font-bold" : "text-[#aaa]")}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mini Stats */}
          <div className="hidden lg:flex items-center gap-4 pr-4 border-r border-[#1a1a1a] mr-1">
            <div className="text-right">
              <p className="text-[10px] text-[#666]">Calls</p>
              <p className="text-xs font-bold text-white">{stats.calls}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#666]">Follow-ups</p>
              <p className="text-xs font-bold text-blue-400">{stats.contacted}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#666]">Hot</p>
              <p className="text-xs font-bold text-[#42CA80]">{stats.qualified}</p>
            </div>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-1 ml-auto md:ml-0">
            <button onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)} disabled={currentIndex === 0} className="p-1.5 rounded hover:bg-[#252525] text-[#666] disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-sm font-mono text-[#666]"><span className="text-white">{currentIndex + 1}</span>/{queue.length}</span>
            <button onClick={() => currentIndex < queue.length - 1 && setCurrentIndex(currentIndex + 1)} disabled={currentIndex >= queue.length - 1} className="p-1.5 rounded hover:bg-[#252525] text-[#666] disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        {/* Lead Info & Intelligence (Full Width) */}
        <div className="flex w-full flex-col bg-[#0a0a0a] overflow-y-auto">

          {/* Lead Header */}
          <div className="border-b border-[#1a1a1a] p-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-white truncate">{currentLead.company_name}</h1>
                  {currentLead.stale_flag && <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Stale Lead</span>}
                </div>
                {currentLead.contact_person && (
                  <div className="flex items-center gap-2 text-[#a1a1aa] text-sm">
                    <User className="h-4 w-4" /> {currentLead.contact_person}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {currentLead.website_link ? (
                    <>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252525] border border-[#2a2a2a] text-xs font-medium text-white max-w-[200px]">
                        <Globe className="h-3.5 w-3.5 text-[#42CA80] shrink-0" />
                        <span className="truncate">
                          {currentLead.website_link.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                        </span>
                      </div>
                      <a
                        href={currentLead.website_link.startsWith('http') ? currentLead.website_link : `https://${currentLead.website_link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-[#252525] hover:bg-[#333] border border-[#2a2a2a] text-[#42CA80] hover:text-white transition-all shrink-0"
                        title="Visit Website"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#222] text-xs text-[#666]">
                      <Globe className="h-3.5 w-3.5 opacity-50" />
                      No Website
                    </div>
                  )}

                  {/* Always show Search Profile button */}
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(currentLead.company_name || "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#252525] hover:bg-[#333] border border-[#2a2a2a] text-[#aaa] hover:text-white transition-all shrink-0"
                    title="Search Business Profile"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#252525] text-white text-xs font-medium uppercase">{currentLead.status || "New"}</span>
            </div>

            <a href={`tel:${currentLead.phone}`} className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-[#42CA80] to-[#3ab872] p-3 sm:p-4 rounded-xl shadow-lg hover:shadow-[#42CA80]/20 transition-all active:scale-[0.98]">
              <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              <span className="text-lg sm:text-2xl font-bold text-white tracking-widest">{currentLead.phone || "No Phone"}</span>
            </a>

            {/* Quick Actions Grid */}
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOutcomeCategory(outcomeCategory === "connected" ? null : "connected")}
                  className={clsx(
                    "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                    outcomeCategory === "connected"
                      ? "bg-[#42CA80] border-[#42CA80] text-white shadow-lg shadow-[#42CA80]/20"
                      : "bg-[#1a1a1a] border-[#2a2a2a] text-[#aaa] hover:bg-[#252525] hover:text-white"
                  )}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-semibold text-sm">Connected</span>
                </button>

                <button
                  onClick={() => setOutcomeCategory(outcomeCategory === "not_connected" ? null : "not_connected")}
                  className={clsx(
                    "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                    outcomeCategory === "not_connected"
                      ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20"
                      : "bg-[#1a1a1a] border-[#2a2a2a] text-[#aaa] hover:bg-[#252525] hover:text-white"
                  )}
                >
                  <PhoneMissed className="h-4 w-4" />
                  <span className="font-semibold text-sm">Not Connected</span>
                </button>

                <button
                  onClick={() => setShowBookingModal(true)}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 transition-all"
                >
                  <CalendarCheck className="h-4 w-4" />
                  <span className="font-semibold text-sm">Book Strategy</span>
                </button>

                <button
                  onClick={openWhatsApp}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/20 transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="font-semibold text-sm">WhatsApp</span>
                </button>
              </div>

              {/* Sub Options for Connected */}
              {outcomeCategory === "connected" && (
                <div className="grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button onClick={() => initiateOutcome("interested")} className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 transition-all">
                    <Target className="h-4 w-4" />
                    <span className="text-xs font-medium">Interested</span>
                  </button>
                  <button onClick={() => initiateOutcome("follow_up")} className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-400 transition-all">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium">Follow Up</span>
                  </button>
                  <button onClick={() => initiateOutcome("not_interested")} className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 transition-all">
                    <Ban className="h-4 w-4" />
                    <span className="text-xs font-medium">Not Interested</span>
                  </button>
                </div>
              )}

              {/* Sub Options for Not Connected */}
              {outcomeCategory === "not_connected" && (
                <div className="grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button onClick={() => initiateOutcome("no_answer")} className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-[#252525] border border-[#333] hover:bg-[#333] text-[#aaa] transition-all">
                    <PhoneMissed className="h-4 w-4" />
                    <span className="text-xs font-medium">No Answer</span>
                  </button>
                  <button onClick={() => initiateOutcome("busy")} className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-[#252525] border border-[#333] hover:bg-[#333] text-[#aaa] transition-all">
                    <PhoneOff className="h-4 w-4" />
                    <span className="text-xs font-medium">Busy</span>
                  </button>
                  <button onClick={() => initiateOutcome("not_reachable")} className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-[#252525] border border-[#333] hover:bg-[#333] text-[#aaa] transition-all">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Bad Number</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {currentLead.industry && <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20">{currentLead.industry}</span>}
              {currentLead.city && <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">{currentLead.city}</span>}
              <span className="px-2 py-1 rounded bg-[#1a1a1a] text-[#666] text-xs border border-[#2a2a2a]">Score: {leadScore}</span>
            </div>
          </div>

          {/* Tabs for Scripts / Pitch / Timeline */}
          <div className="flex-1 p-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              {/* Column 1: Pitch & Script */}
              <div className="space-y-4 flex flex-col">
                {/* Context Card */}
                <div className="bg-[#111] border border-[#222] rounded-xl p-4">
                  <h3 className="text-xs font-bold text-[#666] uppercase tracking-wider mb-2">Market Intel</h3>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-[#aaa]">Competitors</span>
                    <span className="text-white">{marketData?.competitor_names?.length || 0} Identified</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#aaa]">Search Vol</span>
                    <span className="text-white">{marketData?.search_volume || "Unknown"}</span>
                  </div>
                </div>

                {/* Smart Pitch */}
                {pitch && (
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#222] border border-[#333] rounded-xl p-4 relative flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#42CA80]" /><span className="text-sm font-bold text-white">Smart Pitch</span></div>
                      <button onClick={copyScript} className="text-[#666] hover:text-white"><Copy className="h-4 w-4" /></button>
                    </div>
                    <p className="text-sm text-[#ccc] leading-relaxed whitespace-pre-wrap">{pitch.script}</p>
                  </div>
                )}
              </div>

              {/* Column 2: Library & Timeline */}
              <div className="flex flex-col gap-4 h-[500px] lg:h-auto">
                <ScriptObjectionPanel leadIndustry={currentLead.industry} leadCity={currentLead.city} />
                <div className="flex-1 bg-[#111] border border-[#222] rounded-xl overflow-hidden flex flex-col">
                  <div className="p-3 border-b border-[#222] bg-[#161616]"><h3 className="text-xs font-bold text-[#666] uppercase">Activity History</h3></div>
                  <div className="flex-1 overflow-y-auto p-3">
                    <ActivityTimeline entityId={currentLead.id} entityType="lead" limit={5} compact />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>

      {showBookingModal && (
        <StrategyBookingModal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} onBookingConfirm={async (dt, topic) => { await handleStrategyBooking(dt, topic); setShowBookingModal(false); }} />
      )}
    </div>
  );

  async function handleStrategyBooking(dateTime: string, topic: string) {
    if (!currentLead) return;
    const supabase = createClient();

    const updateData = {
      status: "strategy_booked",
      next_action_date: dateTime.split("T")[0],
      notes: `Strategy Session booked: ${dateTime}. Topic: ${topic}`
    };

    await (supabase.from("leads") as any).update(updateData).eq("id", currentLead.id);

    // Audit
    await logFullAction({
      entity_type: "lead", entity_id: currentLead.id, event_type: "strategy_booked", title: "Strategy Booked", body: `Scheduled for ${dateTime}`, metadata: { scheduled_at: dateTime, topic }
    }, {
      entity_type: "lead", entity_id: currentLead.id, action: "UPDATE", before_data: currentLead, after_data: { ...currentLead, ...updateData }
    });

    // Update lead_outcomes for redundancy
    await (supabase.from("lead_outcomes") as any).insert({
      lead_id: currentLead.id, actor_id: userId, outcome: "strategy_booked", next_action_date: dateTime
    });

    setStats(prev => ({ ...prev, qualified: prev.qualified + 1 }));
    showToast("Strategy Session Booked!");

    // Next
    const newQueue = queue.filter((_, i) => i !== currentIndex);
    setQueue(newQueue);
    if (currentIndex >= newQueue.length && newQueue.length > 0) setCurrentIndex(newQueue.length - 1);
  }
}
