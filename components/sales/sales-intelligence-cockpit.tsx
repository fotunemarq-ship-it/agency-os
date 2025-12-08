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

interface MarketInsight {
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
  const [queue, setQueue] = useState<Lead[]>(initialLeads);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [stats, setStats] = useState({ calls: 0, qualified: 0, contacted: 0 });
  const [copiedScript, setCopiedScript] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Filters
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [showIndustryMenu, setShowIndustryMenu] = useState(false);
  const [showCityMenu, setShowCityMenu] = useState(false);
  
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

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

  // Filter leads based on industry and city
  const getFilteredQueue = useCallback(() => {
    return initialLeads.filter((lead) => {
      const matchesIndustry =
        industryFilter === "all" ||
        lead.industry?.toLowerCase() === industryFilter.toLowerCase();
      const matchesCity =
        cityFilter === "all" ||
        lead.city?.toLowerCase() === cityFilter.toLowerCase();
      return matchesIndustry && matchesCity;
    });
  }, [initialLeads, industryFilter, cityFilter]);

  useEffect(() => {
    const filtered = getFilteredQueue();
    setQueue(filtered);
    setCurrentIndex(0);
  }, [industryFilter, cityFilter, getFilteredQueue]);

  const currentLead = queue[currentIndex] || null;

  // Get market insight for current lead
  const currentMarketInsight = currentLead
    ? initialMarketInsights.find(
        (mi) =>
          mi.industry?.toLowerCase() === currentLead.industry?.toLowerCase() &&
          mi.city?.toLowerCase() === currentLead.city?.toLowerCase()
      )
    : null;

  // Convert to pitch engine format
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

  const handleOutcome = async (
    newStatus: string,
    options?: { moveToEnd?: boolean; nextActionDays?: number; logReason?: string }
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

      const updateData: any = {
        status: newStatus,
        notes: note ? `${note}${options?.logReason ? ` | ${options.logReason}` : ""}` : currentLead.notes,
      };
      if (nextActionDate) {
        updateData.next_action_date = nextActionDate;
      }

      const { error: leadError } = await supabase
        .from("leads")
        .update(updateData)
        .eq("id", currentLead.id);

      if (leadError) {
        console.error("Error updating lead:", leadError);
        showToast("Error saving. Try again.");
        setIsProcessing(false);
        return;
      }

      const { error: activityError } = await supabase.from("call_activities").insert({
        lead_id: currentLead.id,
        created_by: userId,
        outcome: options?.logReason || newStatus,
        notes: note || null,
        created_at: now.toISOString(),
      });

      if (activityError) {
        console.warn("Could not log call activity:", activityError);
      }

      setStats((prev) => ({
        calls: prev.calls + 1,
        qualified: newStatus === "qualified" ? prev.qualified + 1 : prev.qualified,
        contacted: newStatus === "contacted" ? prev.contacted + 1 : prev.contacted,
      }));

      setNote("");

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

  // Handle strategy booking
  const handleStrategyBooking = async (dateTime: string, topic: string) => {
    if (!currentLead || isProcessing) return;

    const supabase = createClient();
    const now = new Date();

    // Update lead with strategy session details
    const updateData: any = {
      status: "qualified",
      notes: topic
        ? `Strategy session booked. Topic: ${topic}`
        : "Strategy session booked",
      next_action_date: dateTime.split("T")[0],
    };

    const { error: leadError } = await supabase
      .from("leads")
      .update(updateData)
      .eq("id", currentLead.id);

    if (leadError) {
      throw new Error("Failed to update lead");
    }

    // Log call activity
    await supabase.from("call_activities").insert({
      lead_id: currentLead.id,
      created_by: userId,
      outcome: "strategy_booked",
      notes: `Session scheduled for ${new Date(dateTime).toLocaleString()}${topic ? `. Topic: ${topic}` : ""}`,
      created_at: now.toISOString(),
    });

    // Update stats
    setStats((prev) => ({
      calls: prev.calls + 1,
      qualified: prev.qualified + 1,
      contacted: prev.contacted,
    }));

    // Format date for toast
    const bookingDate = new Date(dateTime);
    const displayDate = bookingDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    showToast(`🎉 Meeting Booked for ${displayDate}!`);

    // Move to next lead
    setNote("");
    const newQueue = queue.filter((_, i) => i !== currentIndex);
    setQueue(newQueue);
    if (currentIndex >= newQueue.length && newQueue.length > 0) {
      setCurrentIndex(newQueue.length - 1);
    }
  };

  const goNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setNote("");
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setNote("");
    }
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
          handleOutcome("calling", { moveToEnd: true, logReason: "no_answer" });
          break;
        case "4":
          handleOutcome("calling", { moveToEnd: true, logReason: "not_reachable" });
          break;
        case "5":
          handleOutcome("disqualified");
          break;
        case "w":
        case "W":
          openWhatsApp();
          break;
        case "n":
        case "N":
        case "ArrowRight":
          goNext();
          break;
        case "p":
        case "P":
        case "ArrowLeft":
          goPrev();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLead, isProcessing, queue, currentIndex, note, userId]);

  if (!currentLead) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#42CA80]/20">
            <CheckCircle2 className="h-8 w-8 text-[#42CA80]" />
          </div>
          <h2 className="text-xl font-bold text-white">Queue Complete!</h2>
          <p className="mt-2 text-[#666]">
            {industryFilter !== "all" || cityFilter !== "all"
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
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-lg bg-[#42CA80] px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Top Bar - Navigation */}
      <div className="flex flex-col gap-2 border-b border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
        <div className="flex items-center gap-3">
          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="rounded-lg bg-[#1a1a1a] p-2 text-[#666] transition-colors hover:bg-[#252525] hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-sm text-[#666]">
              <span className="font-mono text-white">{currentIndex + 1}</span>
              <span className="mx-1">/</span>
              <span className="font-mono text-white">{queue.length}</span>
            </span>
            <button
              onClick={goNext}
              disabled={currentIndex >= queue.length - 1}
              className="rounded-lg bg-[#1a1a1a] p-2 text-[#666] transition-colors hover:bg-[#252525] hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Lead Score & Shortcuts */}
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              "flex items-center gap-2 rounded-full px-3 py-1",
              leadScore >= 80
                ? "bg-[#42CA80]/20 text-[#42CA80]"
                : leadScore >= 60
                ? "bg-blue-500/20 text-blue-400"
                : "bg-[#1a1a1a] text-[#666]"
            )}
          >
            <Target className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">Score: {leadScore}</span>
          </div>
          <div className="hidden items-center gap-1.5 text-xs text-[#666] md:flex">
            <Zap className="h-3.5 w-3.5" />
            Keys: 1-5, W, ←→
          </div>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        {/* Left Panel: Intelligence Cheat Sheet (65%) */}
        <div className="flex w-full flex-col bg-[#0a0a0a] md:w-[65%] md:overflow-y-auto md:border-r md:border-[#1a1a1a]">
          {/* Sticky Filter Bar */}
          <div className="sticky top-0 z-10 border-b border-[#1a1a1a] bg-[#0a0a0a]/95 p-3 backdrop-blur sm:p-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Industry Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowIndustryMenu(!showIndustryMenu);
                    setShowCityMenu(false);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-3 py-2 text-xs text-white transition-colors hover:bg-[#252525] sm:text-sm"
                >
                  <Building2 className="h-3.5 w-3.5 text-purple-400" />
                  <span className="max-w-[100px] truncate sm:max-w-[140px]">
                    {industryFilter === "all" ? "All Industries" : industryFilter}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#666]" />
                </button>
                {showIndustryMenu && (
                  <div className="absolute left-0 top-full z-30 mt-1 max-h-60 w-52 overflow-y-auto rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] py-1 shadow-xl">
                    <button
                      onClick={() => {
                        setIndustryFilter("all");
                        setShowIndustryMenu(false);
                      }}
                      className={clsx(
                        "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[#1a1a1a]",
                        industryFilter === "all" ? "text-[#42CA80]" : "text-white"
                      )}
                    >
                      All Industries
                    </button>
                    {uniqueIndustries.map((industry) => (
                      <button
                        key={industry}
                        onClick={() => {
                          setIndustryFilter(industry);
                          setShowIndustryMenu(false);
                        }}
                        className={clsx(
                          "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[#1a1a1a]",
                          industryFilter === industry ? "text-[#42CA80]" : "text-white"
                        )}
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* City Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowCityMenu(!showCityMenu);
                    setShowIndustryMenu(false);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-3 py-2 text-xs text-white transition-colors hover:bg-[#252525] sm:text-sm"
                >
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="max-w-[100px] truncate sm:max-w-[140px]">
                    {cityFilter === "all" ? "All Cities" : cityFilter}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#666]" />
                </button>
                {showCityMenu && (
                  <div className="absolute left-0 top-full z-30 mt-1 max-h-60 w-52 overflow-y-auto rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] py-1 shadow-xl">
                    <button
                      onClick={() => {
                        setCityFilter("all");
                        setShowCityMenu(false);
                      }}
                      className={clsx(
                        "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[#1a1a1a]",
                        cityFilter === "all" ? "text-[#42CA80]" : "text-white"
                      )}
                    >
                      All Cities
                    </button>
                    {uniqueCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setCityFilter(city);
                          setShowCityMenu(false);
                        }}
                        className={clsx(
                          "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[#1a1a1a]",
                          cityFilter === city ? "text-[#42CA80]" : "text-white"
                        )}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear Filters */}
              {(industryFilter !== "all" || cityFilter !== "all") && (
                <button
                  onClick={() => {
                    setIndustryFilter("all");
                    setCityFilter("all");
                  }}
                  className="rounded-lg bg-red-500/20 px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
                >
                  Clear
                </button>
              )}

              {/* Filter summary */}
              <span className="ml-auto text-xs text-[#666]">
                {queue.length} leads
              </span>
            </div>
          </div>

          {/* Lead Header */}
          <div className="border-b border-[#1a1a1a] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-xl font-bold text-white sm:text-2xl">
                  {currentLead.company_name || "Unknown Company"}
                </h1>
                <div className="mt-1.5 flex items-center gap-2 text-[#a1a1aa]">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-sm">
                    {currentLead.contact_person || "No contact name"}
                  </span>
                </div>
              </div>
              <span
                className={clsx(
                  "flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium",
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

            {/* Massive Phone Button */}
            <a
              href={`tel:${currentLead.phone}`}
              className="mt-4 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#42CA80] to-[#3ab872] p-4 transition-all hover:shadow-lg hover:shadow-[#42CA80]/20 active:scale-[0.98] sm:gap-4 sm:p-5"
            >
              <Phone className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              <span className="text-xl font-bold tracking-wider text-white sm:text-2xl">
                {currentLead.phone || "No phone"}
              </span>
            </a>
          </div>

          {/* Context Badges */}
          <div className="border-b border-[#1a1a1a] p-3 sm:p-4">
            <div className="flex flex-wrap gap-2">
              {currentLead.industry && (
                <div className="flex items-center gap-1.5 rounded-lg bg-purple-500/20 px-3 py-1.5">
                  <Building2 className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">
                    {currentLead.industry}
                  </span>
                </div>
              )}
              {currentLead.city && (
                <div className="flex items-center gap-1.5 rounded-lg bg-blue-500/20 px-3 py-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">{currentLead.city}</span>
                </div>
              )}
              {marketData?.search_volume && (
                <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5">
                  <Search className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-medium text-amber-400">
                    {marketData.search_volume.toLocaleString()} searches/mo
                  </span>
                </div>
              )}
              {!currentLead.email && (
                <div className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5">
                  <Globe className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-medium text-red-400">No Website</span>
                </div>
              )}
            </div>
          </div>

          {/* Smart Pitch Card */}
          {pitch && (
            <div className="border-b border-[#1a1a1a] p-4 sm:p-5">
              <div className="rounded-xl border border-[#42CA80]/30 bg-gradient-to-br from-[#42CA80]/10 to-transparent p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#42CA80]" />
                    <span className="text-sm font-semibold text-white">AI-Powered Pitch</span>
                  </div>
                  <span className="rounded-full bg-[#42CA80] px-3 py-1 text-xs font-bold text-black">
                    {pitch.recommended_service}
                  </span>
                </div>

                <div className="relative">
                  <p className="pr-10 text-sm leading-relaxed text-[#e0e0e0] sm:text-base">
                    {pitch.script}
                  </p>
                  <button
                    onClick={copyScript}
                    className="absolute right-0 top-0 rounded-lg bg-[#1a1a1a] p-2 text-[#666] transition-colors hover:bg-[#252525] hover:text-white"
                    title="Copy script"
                  >
                    {copiedScript ? (
                      <CheckCircle2 className="h-4 w-4 text-[#42CA80]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#0f0f0f]/50 p-3">
                  <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[#666]">
                      Key Insight
                    </p>
                    <p className="mt-0.5 text-sm text-amber-200">{pitch.key_insight}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Market Intelligence */}
          {currentMarketInsight && (
            <div className="border-b border-[#1a1a1a] p-4 sm:p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                Market Intelligence
              </h3>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {currentMarketInsight.search_volume && (
                  <div className="rounded-lg bg-[#1a1a1a] p-3">
                    <p className="text-xs text-[#666]">Monthly Searches</p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {currentMarketInsight.search_volume}
                    </p>
                  </div>
                )}
                {currentMarketInsight.market_difficulty && (
                  <div className="rounded-lg bg-[#1a1a1a] p-3">
                    <p className="text-xs text-[#666]">Competition</p>
                    <p
                      className={clsx(
                        "mt-1 text-lg font-bold capitalize",
                        currentMarketInsight.market_difficulty === "high"
                          ? "text-red-400"
                          : currentMarketInsight.market_difficulty === "medium"
                          ? "text-amber-400"
                          : "text-[#42CA80]"
                      )}
                    >
                      {currentMarketInsight.market_difficulty}
                    </p>
                  </div>
                )}
                {currentMarketInsight.top_competitors &&
                  currentMarketInsight.top_competitors.length > 0 && (
                    <div className="col-span-2 rounded-lg bg-[#1a1a1a] p-3 sm:col-span-1">
                      <p className="text-xs text-[#666]">Top Rivals</p>
                      <p className="mt-1 truncate text-sm font-medium text-white">
                        {currentMarketInsight.top_competitors.slice(0, 2).join(", ")}
                      </p>
                    </div>
                  )}
              </div>

              {currentMarketInsight.top_competitors &&
                currentMarketInsight.top_competitors.length > 0 && (
                  <div className="mt-3 rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] p-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-400" />
                      <span className="text-xs font-medium text-[#a1a1aa]">
                        Competitors in {currentLead.city}:
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {currentMarketInsight.top_competitors.map((comp, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-purple-500/20 px-2.5 py-1 text-xs font-medium text-purple-300"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Previous Notes */}
          {currentLead.notes && (
            <div className="p-4 sm:p-5">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-[#666]">
                Previous Notes
              </h3>
              <p className="text-sm text-[#a1a1aa]">{currentLead.notes}</p>
            </div>
          )}
        </div>

        {/* Right Panel: Quick Actions (35%) */}
        <div className="flex w-full flex-col bg-[#0f0f0f] p-4 sm:p-5 md:w-[35%] md:overflow-y-auto">
          {/* Navigation Bar - Prominent */}
          <div className="mb-4 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-3">
            <div className="flex items-center justify-between gap-2">
              {/* Prev Button */}
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 rounded-lg border border-[#333] bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-[#a1a1aa] transition-all hover:border-[#444] hover:bg-[#252525] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Counter */}
              <div className="text-center">
                <p className="text-xs text-[#666]">Lead</p>
                <p className="text-lg font-bold text-white">
                  {currentIndex + 1}
                  <span className="mx-1 text-[#666]">/</span>
                  {queue.length}
                </p>
              </div>

              {/* Next Button - Primary */}
              <button
                onClick={goNext}
                disabled={currentIndex >= queue.length - 1}
                className="flex items-center gap-1.5 rounded-lg bg-[#42CA80] px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-[#3ab872] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            {/* Keyboard hint */}
            <p className="mt-2 text-center text-[10px] text-[#555]">
              Press <kbd className="rounded bg-[#1a1a1a] px-1 py-0.5 font-mono">N</kbd> or <kbd className="rounded bg-[#1a1a1a] px-1 py-0.5 font-mono">→</kbd> for Next, <kbd className="rounded bg-[#1a1a1a] px-1 py-0.5 font-mono">P</kbd> or <kbd className="rounded bg-[#1a1a1a] px-1 py-0.5 font-mono">←</kbd> for Prev
            </p>
          </div>

          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#666]">
            Call Outcome
          </h2>

          {/* Book Strategy Call - Primary Success Action */}
          <button
            onClick={() => setShowBookingModal(true)}
            disabled={isProcessing}
            className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-indigo-500/50 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-4 transition-all hover:border-indigo-500 hover:from-indigo-500/30 hover:to-purple-500/30 active:scale-[0.98] disabled:opacity-50"
          >
            <CalendarCheck className="h-6 w-6 text-indigo-400" />
            <span className="text-base font-bold text-indigo-300">Book Strategy Call</span>
          </button>

          {/* 9-Button Action Grid - 3 columns */}
          <div className="grid grid-cols-3 gap-2">
            {/* Row 1: Positive Actions (Green) */}
            <button
              onClick={() => handleOutcome("qualified")}
              disabled={isProcessing}
              className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-[#42CA80]/30 bg-[#42CA80]/10 p-3 transition-all hover:border-[#42CA80] hover:bg-[#42CA80]/20 active:scale-[0.98] disabled:opacity-50"
            >
              <Flame className="h-5 w-5 text-[#42CA80] sm:h-6 sm:w-6" />
              <span className="mt-1 text-[10px] font-semibold text-[#42CA80] sm:text-xs">Interested</span>
              <kbd className="absolute right-1 top-1 hidden rounded bg-[#42CA80]/20 px-1 py-0.5 text-[8px] font-mono text-[#42CA80] sm:block">
                1
              </kbd>
            </button>

            <button
              onClick={() => handleOutcome("contacted", { nextActionDays: 1 })}
              disabled={isProcessing}
              className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-[#42CA80]/30 bg-[#42CA80]/10 p-3 transition-all hover:border-[#42CA80] hover:bg-[#42CA80]/20 active:scale-[0.98] disabled:opacity-50"
            >
              <Calendar className="h-5 w-5 text-[#42CA80] sm:h-6 sm:w-6" />
              <span className="mt-1 text-[10px] font-semibold text-[#42CA80] sm:text-xs">Follow-up</span>
              <kbd className="absolute right-1 top-1 hidden rounded bg-[#42CA80]/20 px-1 py-0.5 text-[8px] font-mono text-[#42CA80] sm:block">
                2
              </kbd>
            </button>

            {/* Placeholder for alignment */}
            <div className="hidden sm:block" />

            {/* Row 2: Retry / No Connect (Amber/Yellow) */}
            <button
              onClick={() => handleOutcome("calling", { moveToEnd: true, logReason: "no_answer" })}
              disabled={isProcessing}
              className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-amber-500/30 bg-amber-500/10 p-3 transition-all hover:border-amber-500 hover:bg-amber-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              <PhoneMissed className="h-5 w-5 text-amber-400 sm:h-6 sm:w-6" />
              <span className="mt-1 text-[10px] font-semibold text-amber-400 sm:text-xs">No Answer</span>
              <kbd className="absolute right-1 top-1 hidden rounded bg-amber-500/20 px-1 py-0.5 text-[8px] font-mono text-amber-400 sm:block">
                3
              </kbd>
            </button>

            <button
              onClick={() => handleOutcome("calling", { moveToEnd: true, logReason: "not_reachable" })}
              disabled={isProcessing}
              className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-amber-500/30 bg-amber-500/10 p-3 transition-all hover:border-amber-500 hover:bg-amber-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              <AlertCircle className="h-5 w-5 text-amber-400 sm:h-6 sm:w-6" />
              <span className="mt-1 text-[10px] font-semibold text-amber-400 sm:text-xs">Not Reachable</span>
              <kbd className="absolute right-1 top-1 hidden rounded bg-amber-500/20 px-1 py-0.5 text-[8px] font-mono text-amber-400 sm:block">
                4
              </kbd>
            </button>

            <button
              onClick={() => handleOutcome("calling", { moveToEnd: true, logReason: "busy" })}
              disabled={isProcessing}
              className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-amber-500/30 bg-amber-500/10 p-3 transition-all hover:border-amber-500 hover:bg-amber-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              <Clock className="h-5 w-5 text-amber-400 sm:h-6 sm:w-6" />
              <span className="mt-1 text-[10px] font-semibold text-amber-400 sm:text-xs">Busy</span>
            </button>

            {/* Row 3: Negative Actions (Red/Gray) */}
            <button
              onClick={() => handleOutcome("disqualified")}
              disabled={isProcessing}
              className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-red-500/30 bg-red-500/10 p-3 transition-all hover:border-red-500 hover:bg-red-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              <XCircle className="h-5 w-5 text-red-400 sm:h-6 sm:w-6" />
              <span className="mt-1 text-[10px] font-semibold text-red-400 sm:text-xs">Not Interested</span>
              <kbd className="absolute right-1 top-1 hidden rounded bg-red-500/20 px-1 py-0.5 text-[8px] font-mono text-red-400 sm:block">
                5
              </kbd>
            </button>

            <button
              onClick={() => handleOutcome("disqualified", { logReason: "wrong_number" })}
              disabled={isProcessing}
              className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-red-500/30 bg-red-500/10 p-3 transition-all hover:border-red-500 hover:bg-red-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              <PhoneOff className="h-5 w-5 text-red-400 sm:h-6 sm:w-6" />
              <span className="mt-1 text-[10px] font-semibold text-red-400 sm:text-xs">Wrong #</span>
            </button>

            <button
              onClick={() => handleOutcome("disqualified", { logReason: "invalid_number" })}
              disabled={isProcessing}
              className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-[#333]/50 bg-[#1a1a1a]/50 p-3 transition-all hover:border-[#444] hover:bg-[#1a1a1a] active:scale-[0.98] disabled:opacity-50"
            >
              <Ban className="h-5 w-5 text-[#666] sm:h-6 sm:w-6" />
              <span className="mt-1 text-[10px] font-semibold text-[#888] sm:text-xs">Invalid #</span>
            </button>
          </div>

          {/* WhatsApp Button - Full Width */}
          <button
            onClick={openWhatsApp}
            disabled={!currentLead.phone}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl border-2 border-green-500/30 bg-green-500/10 p-3 transition-all hover:border-green-500 hover:bg-green-500/20 active:scale-[0.98] disabled:opacity-50"
          >
            <MessageCircle className="h-5 w-5 text-green-400" />
            <span className="font-semibold text-green-400">Send WhatsApp</span>
            <kbd className="ml-auto hidden rounded bg-green-500/20 px-1.5 py-0.5 text-[10px] font-mono text-green-400 sm:block">
              W
            </kbd>
          </button>

          {/* Notes Section */}
          <div className="mt-4">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#666]">
              Call Notes
            </label>
            <textarea
              ref={noteInputRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What happened on this call?"
              className="h-20 w-full resize-none rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder-[#666] focus:border-[#42CA80]/50 focus:outline-none sm:h-24"
            />
          </div>

          {/* Session Stats */}
          <div className="mt-auto pt-4">
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#666]">
                Session Stats
              </p>
              <div className="mt-2 flex justify-between">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{stats.calls}</p>
                  <p className="text-[9px] text-[#666]">Calls</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#42CA80]">{stats.qualified}</p>
                  <p className="text-[9px] text-[#666]">Hot</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-400">{stats.contacted}</p>
                  <p className="text-[9px] text-[#666]">Follow-up</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Booking Modal */}
      <StrategyBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onConfirm={handleStrategyBooking}
        leadName={currentLead?.company_name || "Unknown Company"}
      />
    </div>
  );
}
