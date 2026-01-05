"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  XCircle,
  CheckCircle,
  FileText,
  Clock,
  Phone,
  Building2,
  User,
  ChevronLeft,
  ChevronRight,
  PhoneMissed,
  CalendarClock,
  Bell,
  LayoutGrid,
  List,
  Trophy,
  FileSignature,
  Send,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import CloseDealModal from "./close-deal-modal";
import StrategySessionModal from "./strategy-session-modal";
import clsx from "clsx";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

interface CallActivity {
  id: string;
  lead_id: string;
  outcome: string;
  notes: string | null;
  created_at: string;
}

interface StrategistPipelineProps {
  initialLeads: Lead[];
  closedWonLeads?: Lead[];
  closedLostLeads?: Lead[];
  callActivities?: CallActivity[];
}

// Status configuration with labels and colors
const STATUS_CONFIG: Record<string, { label: string; bgColor: string; textColor: string; icon: any }> = {
  qualified: {
    label: "Qualified",
    bgColor: "bg-indigo-500/20",
    textColor: "text-indigo-400",
    icon: CheckCircle,
  },
  strategy_booked: {
    label: "Session Booked",
    bgColor: "bg-purple-500/20",
    textColor: "text-purple-400",
    icon: Calendar,
  },
  strategy_completed: {
    label: "Strategy Done",
    bgColor: "bg-amber-500/20",
    textColor: "text-amber-400",
    icon: FileText,
  },
  proposal_requested: {
    label: "Proposal Req",
    bgColor: "bg-blue-500/20",
    textColor: "text-blue-400",
    icon: FileText,
  },
  proposal_sent: {
    label: "Proposal Sent",
    bgColor: "bg-orange-500/20",
    textColor: "text-orange-400",
    icon: Send,
  },
  contract_signed: {
    label: "Contract Signed",
    bgColor: "bg-green-500/20",
    textColor: "text-green-400",
    icon: FileSignature,
  },
};

// Group leads by status for the pipeline view
const PIPELINE_STAGES = [
  { key: "qualified", title: "Qualified" },
  { key: "strategy_booked", title: "Sessions" },
  { key: "strategy_completed", title: "Closing" },
  { key: "proposal_requested", title: "Proposal Req" },
  { key: "proposal_sent", title: "Proposals" },
  { key: "contract_signed", title: "Contracts" },
];

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function isToday(dateStr: string): boolean {
  const today = formatDate(new Date());
  return dateStr === today;
}

export default function StrategistPipeline({
  initialLeads,
  closedWonLeads = [],
  closedLostLeads = [],
  callActivities = [],
}: StrategistPipelineProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isCloseDealModalOpen, setIsCloseDealModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeStage, setActiveStage] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"pipeline" | "dashboard">("pipeline");
  const [showClosedDeals, setShowClosedDeals] = useState(false);
  const [showLostLeads, setShowLostLeads] = useState(false);
  const router = useRouter();

  // Dashboard metrics
  const dashboardMetrics = useMemo(() => {
    // Count proposals and contracts from notes
    const proposalsSent = callActivities.filter(a => a.outcome === "proposal_sent").length;
    const contractsSent = callActivities.filter(a => a.outcome === "contract_sent").length;

    // Leads needing proposals (strategy_booked without proposal sent)
    const leadsWithProposals = new Set(
      callActivities
        .filter(a => a.outcome === "proposal_sent")
        .map(a => a.lead_id)
    );
    const needsProposal = leads.filter(
      l => l.status === "strategy_booked" && !leadsWithProposals.has(l.id)
    );

    // Leads needing contracts (proposal sent but no contract)
    const leadsWithContracts = new Set(
      callActivities
        .filter(a => a.outcome === "contract_sent")
        .map(a => a.lead_id)
    );
    const needsContract = leads.filter(
      l => leadsWithProposals.has(l.id) && !leadsWithContracts.has(l.id)
    );

    // Get loss reasons from activities
    const lossReasons: Record<string, number> = {};
    callActivities
      .filter(a => a.outcome === "closed_lost")
      .forEach(a => {
        const reason = a.notes?.match(/\[REASON: ([^\]]+)\]/)?.[1] ||
          a.notes?.split(" ").slice(0, 3).join(" ") ||
          "Not specified";
        lossReasons[reason] = (lossReasons[reason] || 0) + 1;
      });

    return {
      proposalsSent,
      contractsSent,
      needsProposal,
      needsContract,
      closedWon: closedWonLeads.length,
      closedLost: closedLostLeads.length,
      lossReasons,
    };
  }, [leads, callActivities, closedWonLeads, closedLostLeads]);

  // Get leads with sessions scheduled for selected date
  const sessionsForDate = useMemo(() => {
    const dateStr = formatDate(selectedDate);
    return leads.filter((lead) => {
      if (!lead.next_action_date) return false;
      return lead.next_action_date === dateStr && lead.status === "strategy_booked";
    });
  }, [leads, selectedDate]);

  // Get follow-ups needed today
  const followUpsToday = useMemo(() => {
    const today = formatDate(new Date());

    const followUpLeadIds = new Set<string>();
    const followUpReasons: Record<string, string[]> = {};

    callActivities.forEach((activity) => {
      const lead = leads.find((l) => l.id === activity.lead_id);
      if (!lead) return;

      const isFollowUpDue = lead.next_action_date === today;
      const activityDate = activity.created_at.split("T")[0];
      const isRecentActivity = activityDate === today || isFollowUpDue;

      if (isRecentActivity && ["no_show", "rescheduled", "callback_requested", "no_answer"].includes(activity.outcome)) {
        followUpLeadIds.add(activity.lead_id);
        if (!followUpReasons[activity.lead_id]) {
          followUpReasons[activity.lead_id] = [];
        }
        followUpReasons[activity.lead_id].push(activity.outcome);
      }
    });

    leads.forEach((lead) => {
      if (lead.next_action_date === today && !followUpLeadIds.has(lead.id)) {
        followUpLeadIds.add(lead.id);
        followUpReasons[lead.id] = ["scheduled_followup"];
      }
    });

    return leads
      .filter((lead) => followUpLeadIds.has(lead.id))
      .map((lead) => ({
        ...lead,
        reasons: followUpReasons[lead.id] || [],
      }));
  }, [leads, callActivities]);

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleCardClick = (lead: Lead) => {
    if (["strategy_booked", "strategy_completed"].includes(lead.status || "")) {
      setSelectedLead(lead);
      setIsSessionModalOpen(true);
    }
  };

  const handleBookSession = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(leadId);
    try {
      const supabase = createClient();
      const updateQuery = (supabase.from("leads") as any)
        .update({ status: "strategy_booked" })
        .eq("id", leadId);
      const { error } = await updateQuery;

      if (error) throw error;

      setLeads(
        leads.map((lead) =>
          lead.id === leadId ? { ...lead, status: "strategy_booked" } : lead
        )
      );
      router.refresh();
    } catch (error: any) {
      console.error("Error booking session:", error);
      alert("Failed to book session. Please try again.");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleCloseDeal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsCloseDealModalOpen(true);
  };

  const handleCloseDealModalClose = () => {
    setIsCloseDealModalOpen(false);
    setSelectedLead(null);
  };

  const handleSessionModalClose = () => {
    setIsSessionModalOpen(false);
    setSelectedLead(null);
  };

  const handleModalSuccess = () => {
    if (selectedLead) {
      setLeads(leads.filter((lead) => lead.id !== selectedLead.id));
    }
    router.refresh();
    setTimeout(() => {
      router.refresh();
    }, 500);
  };

  const handleStatusChange = (leadId: string, newStatus: string, updates?: any) => {
    if (newStatus === "closed_lost") {
      setLeads(leads.filter((lead) => lead.id !== leadId));
    } else {
      setLeads(
        leads.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus, ...updates } : lead
        )
      );
    }
    router.refresh();
  };

  const handleNotFit = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Mark this lead as 'Not Fit'?")) return;

    setIsUpdating(leadId);
    try {
      const supabase = createClient();
      const updateQuery2 = (supabase.from("leads") as any)
        .update({ status: "closed_lost" })
        .eq("id", leadId);
      const { error } = await updateQuery2;

      if (error) throw error;

      setLeads(leads.filter((lead) => lead.id !== leadId));
      router.refresh();
    } catch (error: any) {
      console.error("Error marking as not fit:", error);
      alert("Failed to update lead. Please try again.");
    } finally {
      setIsUpdating(null);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsUpdating(leadId);
    try {
      const supabase = createClient();
      const { error } = await (supabase.from("leads") as any)
        .update({ status: newStatus })
        .eq("id", leadId);

      if (error) throw error;

      setLeads(
        leads.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus as any } : lead
        )
      );
      router.refresh();
    } catch (error: any) {
      console.error(`Error updating status to ${newStatus}:`, error);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(null);
    }
  };

  // Group leads by status
  const leadsByStatus = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.key] = leads.filter((lead) => lead.status === stage.key);
    return acc;
  }, {} as Record<string, Lead[]>);

  // Get filtered leads for mobile view
  const filteredLeads = activeStage === "all"
    ? leads
    : leads.filter((lead) => lead.status === activeStage);

  const totalLeads = leads.length;

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case "no_show": return "No Show";
      case "rescheduled": return "Reschedule";
      case "callback_requested": return "Callback";
      case "no_answer": return "No Answer";
      case "scheduled_followup": return "Scheduled";
      default: return reason;
    }
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case "no_show": return PhoneMissed;
      case "rescheduled": return CalendarClock;
      case "callback_requested": return Phone;
      case "no_answer": return PhoneMissed;
      default: return Clock;
    }
  };

  // Mobile card component
  const LeadCard = ({ lead, stage }: { lead: Lead; stage: typeof PIPELINE_STAGES[0] }) => {
    const config = STATUS_CONFIG[stage.key];
    const Icon = config.icon;

    return (
      <div
        onClick={() => handleCardClick(lead)}
        className={clsx(
          "cursor-pointer rounded-xl border border-[#1a1a1a] bg-[#1a1a1a] p-4 transition-all active:scale-[0.98]",
          ["strategy_booked", "strategy_completed"].includes(lead.status || "") &&
          "hover:border-indigo-500/50"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-white">
              {lead.company_name}
            </h3>
            {lead.contact_person && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[#a1a1aa]">
                <User className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{lead.contact_person}</span>
              </p>
            )}
          </div>
          <span
            className={clsx(
              "flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
              config.bgColor,
              config.textColor
            )}
          >
            {config.label}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 rounded-lg bg-[#252525] px-2.5 py-1.5 text-xs text-[#a1a1aa] active:bg-[#333]"
            >
              <Phone className="h-3.5 w-3.5" />
              {lead.phone}
            </a>
          )}
          {lead.industry && (
            <span className="flex items-center gap-1 text-xs text-[#666]">
              <Building2 className="h-3 w-3" />
              {lead.industry}
            </span>
          )}
        </div>

        {lead.next_action_date && (
          <div className={clsx(
            "mt-3 flex items-center gap-1.5 text-xs",
            isToday(lead.next_action_date) ? "text-amber-400" : "text-[#666]"
          )}>
            <Clock className="h-3.5 w-3.5" />
            {isToday(lead.next_action_date) ? (
              <span className="font-medium">Follow-up Today</span>
            ) : (
              <span>
                {new Date(lead.next_action_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          {stage.key === "qualified" && (
            <button
              onClick={(e) => handleBookSession(lead.id, e)}
              disabled={isUpdating === lead.id}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-purple-600 bg-purple-600/10 px-3 py-2.5 text-sm font-medium text-purple-400 transition-colors active:bg-purple-600/20 disabled:opacity-50"
            >
              <Calendar className="h-4 w-4" />
              {isUpdating === lead.id ? "..." : "Book"}
            </button>
          )}

          {["strategy_booked", "strategy_completed"].includes(stage.key) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseDeal(lead);
              }}
              disabled={isUpdating === lead.id}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#42CA80] px-3 py-2.5 text-sm font-semibold text-black transition-colors active:bg-[#3ab872] disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Close Deal
            </button>
          )}

          {stage.key === "strategy_completed" && (
            <button
              onClick={(e) => updateLeadStatus(lead.id, "proposal_requested", e)}
              disabled={isUpdating === lead.id}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600/10 border border-blue-600 px-3 py-2.5 text-sm font-medium text-blue-400 transition-colors active:bg-blue-600/20 disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              Req Prop
            </button>
          )}

          {stage.key === "proposal_requested" && (
            <button
              onClick={(e) => updateLeadStatus(lead.id, "proposal_sent", e)}
              disabled={isUpdating === lead.id}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange-600/10 border border-orange-600 px-3 py-2.5 text-sm font-medium text-orange-400 transition-colors active:bg-orange-600/20 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Sent
            </button>
          )}

          {stage.key === "proposal_sent" && (
            <button
              onClick={(e) => updateLeadStatus(lead.id, "contract_signed", e)}
              disabled={isUpdating === lead.id}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-600/10 border border-green-600 px-3 py-2.5 text-sm font-medium text-green-400 transition-colors active:bg-green-600/20 disabled:opacity-50"
            >
              <FileSignature className="h-4 w-4" />
              Signed
            </button>
          )}

          {stage.key === "contract_signed" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseDeal(lead);
              }}
              disabled={isUpdating === lead.id}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#42CA80] px-3 py-2.5 text-sm font-semibold text-black transition-colors active:bg-[#3ab872] disabled:opacity-50"
            >
              <Trophy className="h-4 w-4" />
              Won
            </button>
          )}

          <button
            onClick={(e) => handleNotFit(lead.id, e)}
            disabled={isUpdating === lead.id}
            className="flex items-center justify-center rounded-lg border border-[#333] px-3 py-2.5 text-[#666] transition-colors active:border-red-600/50 active:text-red-400 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
          Strategist Dashboard
        </h1>
        <p className="mt-1 text-xs text-[#a1a1aa] sm:text-sm">
          Manage qualified leads and close deals
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="mb-4 flex gap-2 sm:mb-6">
        <button
          onClick={() => setActiveTab("pipeline")}
          className={clsx(
            "flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-colors sm:flex-none sm:px-6",
            activeTab === "pipeline"
              ? "bg-white text-black"
              : "bg-[#1a1a1a] text-[#a1a1aa] active:bg-[#252525]"
          )}
        >
          Pipeline
        </button>
        <button
          onClick={() => setActiveTab("dashboard")}
          className={clsx(
            "flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-colors sm:flex-none sm:px-6",
            activeTab === "dashboard"
              ? "bg-white text-black"
              : "bg-[#1a1a1a] text-[#a1a1aa] active:bg-[#252525]"
          )}
        >
          Dashboard
        </button>
      </div>

      {activeTab === "dashboard" ? (
        /* Dashboard View */
        <div className="space-y-4 sm:space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {/* Proposals Needed */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-purple-300">Needs Proposal</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-purple-400 sm:text-3xl">
                {dashboardMetrics.needsProposal.length}
              </p>
            </div>

            {/* Proposals Sent */}
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                <span className="text-xs text-indigo-300">Proposals Sent</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-indigo-400 sm:text-3xl">
                {dashboardMetrics.proposalsSent}
              </p>
            </div>

            {/* Contracts Needed */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-amber-400" />
                <span className="text-xs text-amber-300">Needs Contract</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-amber-400 sm:text-3xl">
                {dashboardMetrics.needsContract.length}
              </p>
            </div>

            {/* Contracts Sent */}
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
              <div className="flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-blue-300">Contracts Sent</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-blue-400 sm:text-3xl">
                {dashboardMetrics.contractsSent}
              </p>
            </div>
          </div>

          {/* Action Items - Proposals & Contracts Needed */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Proposals Needed List */}
            <div className="rounded-xl border border-[#1a1a1a] bg-[#1a1a1a] p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Send className="h-4 w-4 text-purple-400" />
                Proposals to Send ({dashboardMetrics.needsProposal.length})
              </h3>
              {dashboardMetrics.needsProposal.length === 0 ? (
                <p className="text-center text-sm text-[#666]">All caught up! ✨</p>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {dashboardMetrics.needsProposal.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => handleCardClick(lead)}
                      className="flex w-full items-center justify-between rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 text-left transition-colors active:bg-purple-500/10"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{lead.company_name}</p>
                        <p className="text-xs text-[#666]">{lead.contact_person}</p>
                      </div>
                      <Send className="h-4 w-4 flex-shrink-0 text-purple-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Contracts Needed List */}
            <div className="rounded-xl border border-[#1a1a1a] bg-[#1a1a1a] p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <FileSignature className="h-4 w-4 text-amber-400" />
                Contracts to Send ({dashboardMetrics.needsContract.length})
              </h3>
              {dashboardMetrics.needsContract.length === 0 ? (
                <p className="text-center text-sm text-[#666]">No pending contracts</p>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {dashboardMetrics.needsContract.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => handleCardClick(lead)}
                      className="flex w-full items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-left transition-colors active:bg-amber-500/10"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{lead.company_name}</p>
                        <p className="text-xs text-[#666]">{lead.contact_person}</p>
                      </div>
                      <FileSignature className="h-4 w-4 flex-shrink-0 text-amber-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Closed Deals Section */}
          <div className="rounded-xl border border-[#1a1a1a] bg-[#1a1a1a]">
            <button
              onClick={() => setShowClosedDeals(!showClosedDeals)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#42CA80]/20">
                  <Trophy className="h-5 w-5 text-[#42CA80]" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-white sm:text-base">Closed Deals</h3>
                  <p className="text-xs text-[#666]">{closedWonLeads.length} total wins</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-[#42CA80] sm:text-2xl">
                  {closedWonLeads.length}
                </span>
                {showClosedDeals ? (
                  <ChevronUp className="h-5 w-5 text-[#666]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[#666]" />
                )}
              </div>
            </button>

            {showClosedDeals && (
              <div className="border-t border-[#252525] p-4">
                {closedWonLeads.length === 0 ? (
                  <p className="text-center text-sm text-[#666]">No closed deals yet</p>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {closedWonLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between rounded-lg bg-[#42CA80]/5 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">{lead.company_name}</p>
                          <p className="text-xs text-[#666]">
                            {lead.industry} • {lead.city}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-[#42CA80]" />
                          <span className="text-xs font-medium text-[#42CA80]">Won</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lost Leads Section */}
          <div className="rounded-xl border border-[#1a1a1a] bg-[#1a1a1a]">
            <button
              onClick={() => setShowLostLeads(!showLostLeads)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-white sm:text-base">Lost Leads</h3>
                  <p className="text-xs text-[#666]">{closedLostLeads.length} total lost</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-red-400 sm:text-2xl">
                  {closedLostLeads.length}
                </span>
                {showLostLeads ? (
                  <ChevronUp className="h-5 w-5 text-[#666]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[#666]" />
                )}
              </div>
            </button>

            {showLostLeads && (
              <div className="border-t border-[#252525] p-4">
                {/* Loss Reasons Summary */}
                {Object.keys(dashboardMetrics.lossReasons).length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#666]">
                      Loss Reasons
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(dashboardMetrics.lossReasons).map(([reason, count]) => (
                        <span
                          key={reason}
                          className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-300"
                        >
                          {reason}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {closedLostLeads.length === 0 ? (
                  <p className="text-center text-sm text-[#666]">No lost leads</p>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {closedLostLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between rounded-lg bg-red-500/5 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{lead.company_name}</p>
                          <p className="text-xs text-[#666]">
                            {lead.industry} • {lead.city}
                          </p>
                          {lead.notes && (
                            <p className="mt-1 truncate text-xs text-red-300/70">
                              {lead.notes.slice(0, 50)}...
                            </p>
                          )}
                        </div>
                        <AlertCircle className="ml-2 h-4 w-4 flex-shrink-0 text-red-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Pipeline View */
        <>
          {/* Date Selector & Follow-ups - Stacked on mobile */}
          <div className="mb-4 space-y-3 sm:mb-6 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {/* Date Picker Card */}
            <div className="rounded-xl border border-[#1a1a1a] bg-[#1a1a1a] p-3 sm:p-4">
              {/* Date Navigation */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/20 sm:h-10 sm:w-10">
                    <Calendar className="h-4 w-4 text-purple-400 sm:h-5 sm:w-5" />
                  </div>
                  <div className="relative">
                    <p className="text-[10px] text-[#666] sm:text-xs">Sessions</p>
                    <label className="cursor-pointer">
                      <p className="flex items-center gap-1.5 text-sm font-bold text-white transition-colors hover:text-purple-400 sm:text-lg">
                        {isToday(formatDate(selectedDate)) ? "Today" : formatDisplayDate(selectedDate)}
                        <Calendar className="h-3.5 w-3.5 text-purple-400 sm:h-4 sm:w-4" />
                      </p>
                      <input
                        type="date"
                        value={formatDate(selectedDate)}
                        onChange={(e) => setSelectedDate(new Date(e.target.value + "T00:00:00"))}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => handleDateChange(-1)}
                    className="rounded-lg border border-[#333] bg-[#0f0f0f] p-2 text-[#a1a1aa] transition-colors active:bg-[#252525]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className={clsx(
                      "rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:py-2",
                      isToday(formatDate(selectedDate))
                        ? "border-purple-500 bg-purple-500/20 text-purple-400"
                        : "border-[#333] bg-[#0f0f0f] text-[#a1a1aa] active:bg-[#252525]"
                    )}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleDateChange(1)}
                    className="rounded-lg border border-[#333] bg-[#0f0f0f] p-2 text-[#a1a1aa] transition-colors active:bg-[#252525]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Sessions List */}
              <div className="mt-3">
                {sessionsForDate.length === 0 ? (
                  <p className="text-center text-xs text-[#666] sm:text-sm">No sessions for this date</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {sessionsForDate.map((lead) => (
                      <button
                        key={lead.id}
                        onClick={() => handleCardClick(lead)}
                        className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1.5 text-xs text-purple-300 transition-colors active:border-purple-500 active:bg-purple-500/20 sm:px-3 sm:py-2 sm:text-sm"
                      >
                        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="max-w-[120px] truncate">{lead.company_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Follow-ups Required Today */}
            <div className="rounded-xl border border-[#1a1a1a] bg-[#1a1a1a] p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={clsx(
                    "flex h-9 w-9 items-center justify-center rounded-lg sm:h-10 sm:w-10",
                    followUpsToday.length > 0 ? "bg-amber-500/20" : "bg-[#252525]"
                  )}>
                    <Bell className={clsx(
                      "h-4 w-4 sm:h-5 sm:w-5",
                      followUpsToday.length > 0 ? "text-amber-400" : "text-[#666]"
                    )} />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#666] sm:text-xs">Follow-ups</p>
                    <p className={clsx(
                      "text-sm font-bold sm:text-lg",
                      followUpsToday.length > 0 ? "text-amber-400" : "text-[#666]"
                    )}>
                      {followUpsToday.length} Today
                    </p>
                  </div>
                </div>
                {followUpsToday.length > 0 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black sm:h-7 sm:w-7">
                    {followUpsToday.length}
                  </div>
                )}
              </div>

              {/* Follow-up List */}
              <div className="mt-3 max-h-32 space-y-2 overflow-y-auto sm:max-h-40">
                {followUpsToday.length === 0 ? (
                  <p className="text-center text-xs text-[#666] sm:text-sm">All caught up! 🎉</p>
                ) : (
                  followUpsToday.map((lead) => {
                    const ReasonIcon = getReasonIcon(lead.reasons[0]);
                    return (
                      <button
                        key={lead.id}
                        onClick={() => handleCardClick(lead)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-2 text-left transition-colors active:border-amber-500 active:bg-amber-500/20 sm:px-3"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <ReasonIcon className="h-3.5 w-3.5 flex-shrink-0 text-amber-400 sm:h-4 sm:w-4" />
                          <span className="truncate text-xs font-medium text-white sm:text-sm">
                            {lead.company_name}
                          </span>
                        </div>
                        <span className="flex-shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                          {getReasonLabel(lead.reasons[0])}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Mobile Stage Filter & View Toggle */}
          <div className="mb-4 flex items-center justify-between gap-2 sm:mb-6">
            {/* Stage Filter Tabs - Scrollable on mobile */}
            <div className="flex flex-1 gap-1 overflow-x-auto pb-1 sm:gap-2">
              <button
                onClick={() => setActiveStage("all")}
                className={clsx(
                  "flex-shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                  activeStage === "all"
                    ? "bg-white text-black"
                    : "bg-[#1a1a1a] text-[#a1a1aa] active:bg-[#252525]"
                )}
              >
                All ({totalLeads})
              </button>
              {PIPELINE_STAGES.map((stage) => {
                const config = STATUS_CONFIG[stage.key];
                const count = leadsByStatus[stage.key]?.length || 0;
                return (
                  <button
                    key={stage.key}
                    onClick={() => setActiveStage(stage.key)}
                    className={clsx(
                      "flex-shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                      activeStage === stage.key
                        ? `${config.bgColor} ${config.textColor}`
                        : "bg-[#1a1a1a] text-[#a1a1aa] active:bg-[#252525]"
                    )}
                  >
                    {stage.title} ({count})
                  </button>
                );
              })}
            </div>

            {/* View Toggle - Hidden on mobile */}
            <div className="hidden items-center gap-1 rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] p-1 sm:flex">
              <button
                onClick={() => setViewMode("grid")}
                className={clsx(
                  "rounded-md p-2 transition-colors",
                  viewMode === "grid" ? "bg-[#1a1a1a] text-white" : "text-[#666] hover:text-white"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={clsx(
                  "rounded-md p-2 transition-colors",
                  viewMode === "list" ? "bg-[#1a1a1a] text-white" : "text-[#666] hover:text-white"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {totalLeads === 0 ? (
            <div className="rounded-xl border border-[#1a1a1a] bg-[#1a1a1a] p-8 text-center">
              <p className="text-sm text-[#a1a1aa]">
                No qualified leads in the pipeline yet.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile List View (default on mobile) */}
              <div className="space-y-3 sm:hidden">
                {filteredLeads.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#333] p-6 text-center">
                    <p className="text-sm text-[#666]">No leads in this stage</p>
                  </div>
                ) : (
                  filteredLeads.map((lead) => {
                    const stage = PIPELINE_STAGES.find((s) => s.key === lead.status) || PIPELINE_STAGES[0];
                    return <LeadCard key={lead.id} lead={lead} stage={stage} />;
                  })
                )}
              </div>

              {/* Desktop Grid/Kanban View */}
              <div className="hidden sm:block">
                {viewMode === "grid" ? (
                  /* Kanban Columns */
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {PIPELINE_STAGES.map((stage) => {
                      const stageLeads = leadsByStatus[stage.key] || [];
                      const config = STATUS_CONFIG[stage.key];
                      const Icon = config.icon;

                      return (
                        <div key={stage.key} className="flex flex-col">
                          {/* Column Header */}
                          <div className={clsx(
                            "mb-3 flex items-center justify-between rounded-lg p-3",
                            config.bgColor
                          )}>
                            <div className="flex items-center gap-2">
                              <Icon className={clsx("h-4 w-4", config.textColor)} />
                              <span className={clsx("text-sm font-semibold", config.textColor)}>
                                {stage.title}
                              </span>
                            </div>
                            <span className={clsx(
                              "rounded-full px-2 py-0.5 text-xs font-bold",
                              config.bgColor,
                              config.textColor
                            )}>
                              {stageLeads.length}
                            </span>
                          </div>

                          {/* Cards */}
                          <div className="flex flex-col gap-3">
                            {stageLeads.length === 0 ? (
                              <div className="rounded-lg border border-dashed border-[#1a1a1a] p-4 text-center">
                                <p className="text-xs text-[#666]">No leads</p>
                              </div>
                            ) : (
                              stageLeads.map((lead) => (
                                <LeadCard key={lead.id} lead={lead} stage={stage} />
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* List View */
                  <div className="space-y-3">
                    {filteredLeads.map((lead) => {
                      const stage = PIPELINE_STAGES.find((s) => s.key === lead.status) || PIPELINE_STAGES[0];
                      return <LeadCard key={lead.id} lead={lead} stage={stage} />;
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Strategy Session Modal */}
      {selectedLead && (
        <StrategySessionModal
          lead={selectedLead}
          isOpen={isSessionModalOpen}
          onClose={handleSessionModalClose}
          onStatusChange={handleStatusChange}
          onCloseDeal={handleCloseDeal}
        />
      )}

      {/* Close Deal Modal */}
      {selectedLead && (
        <CloseDealModal
          lead={selectedLead}
          isOpen={isCloseDealModalOpen}
          onClose={handleCloseDealModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
}
