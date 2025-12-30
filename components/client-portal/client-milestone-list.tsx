"use client";

import { useState } from "react";
import { Check, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import clsx from "clsx";

interface Milestone {
  id: string;
  project_id: string;
  name: string;
  status: string;
  order_index: number;
  created_at: string;
}

interface ClientMilestoneListProps {
  initialMilestones: Milestone[];
  projectId: string;
  milestonesError: any;
}

type MilestoneStatus = "not_started" | "in_progress" | "ready_for_approval" | "approved";

const statusConfig: Record<MilestoneStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  not_started: {
    label: "Upcoming",
    color: "text-gray-400",
    bgColor: "bg-gray-500/20 border-gray-500/30",
    icon: <Clock className="h-4 w-4" />,
  },
  in_progress: {
    label: "In Progress",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20 border-blue-500/30",
    icon: <Clock className="h-4 w-4 animate-pulse" />,
  },
  ready_for_approval: {
    label: "Needs Approval",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20 border-orange-500/30",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  approved: {
    label: "Approved",
    color: "text-[#42CA80]",
    bgColor: "bg-[#42CA80]/20 border-[#42CA80]/30",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
};

export default function ClientMilestoneList({
  initialMilestones,
  projectId,
  milestonesError,
}: ClientMilestoneListProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const handleApprove = async (milestoneId: string) => {
    setApprovingId(milestoneId);

    try {
      const supabase = createClient();

      const query = (supabase
        .from("project_milestones") as any)
        .update({ status: "approved" })
        .eq("id", milestoneId);
      const { error } = await query;

      if (error) {
        console.error("Error approving milestone:", error);
        alert("Failed to approve milestone. Please try again.");
        return;
      }

      // Update local state
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === milestoneId ? { ...m, status: "approved" } : m
        )
      );
    } catch (error) {
      console.error("Error approving milestone:", error);
      alert("Failed to approve milestone. Please try again.");
    } finally {
      setApprovingId(null);
    }
  };

  if (milestonesError) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-red-400">
          Error loading milestones: {milestonesError.message}
        </p>
      </div>
    );
  }

  if (!milestones || milestones.length === 0) {
    return (
      <div className="rounded-xl border border-[#1a1a1a] bg-zinc-900/50 p-8 text-center">
        <p className="text-[#a1a1aa]">No milestones found for this project.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {milestones.map((milestone, index) => {
        const status = (milestone.status as MilestoneStatus) || "not_started";
        const config = statusConfig[status] || statusConfig.not_started;
        const isApproving = approvingId === milestone.id;
        const isLastItem = index === milestones.length - 1;

        return (
          <div key={milestone.id} className="relative">
            {/* Timeline connector */}
            {!isLastItem && (
              <div
                className={clsx(
                  "absolute left-6 top-16 h-full w-0.5",
                  status === "approved" ? "bg-[#42CA80]/50" : "bg-[#1a1a1a]"
                )}
              />
            )}

            {/* Milestone Card */}
            <div
              className={clsx(
                "relative flex items-center gap-4 rounded-xl border p-4 transition-all",
                status === "approved"
                  ? "border-[#42CA80]/30 bg-[#42CA80]/5"
                  : "border-[#1a1a1a] bg-zinc-900/50 hover:border-[#1a1a1a]/80"
              )}
            >
              {/* Order Number Circle */}
              <div
                className={clsx(
                  "relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 text-lg font-bold",
                  status === "approved"
                    ? "border-[#42CA80] bg-[#42CA80] text-white"
                    : status === "in_progress"
                    ? "border-blue-500 bg-blue-500/20 text-blue-400"
                    : status === "ready_for_approval"
                    ? "border-orange-500 bg-orange-500/20 text-orange-400"
                    : "border-[#1a1a1a] bg-[#0f0f0f] text-[#a1a1aa]"
                )}
              >
                {status === "approved" ? (
                  <Check className="h-6 w-6" />
                ) : (
                  milestone.order_index || index + 1
                )}
              </div>

              {/* Milestone Info */}
              <div className="min-w-0 flex-1">
                <h3
                  className={clsx(
                    "font-semibold",
                    status === "approved" ? "text-[#42CA80]" : "text-white"
                  )}
                >
                  {milestone.name}
                </h3>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={config.color}>{config.icon}</span>
                  <span className={clsx("text-sm font-medium", config.color)}>
                    {config.label}
                  </span>
                </div>
              </div>

              {/* Status Badge / Approve Button */}
              <div className="flex-shrink-0">
                {status === "ready_for_approval" ? (
                  <button
                    onClick={() => handleApprove(milestone.id)}
                    disabled={isApproving}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#42CA80] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#3ab872] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Approve ${milestone.name}`}
                  >
                    {isApproving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Approve
                      </>
                    )}
                  </button>
                ) : (
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                      config.bgColor,
                      config.color
                    )}
                  >
                    {config.icon}
                    {config.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

