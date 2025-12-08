"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Briefcase,
  ChevronDown,
  ChevronUp,
  ListTodo,
  TrendingUp,
  User,
} from "lucide-react";
import clsx from "clsx";

interface Task {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  project_id: string;
  created_at: string;
  completed_at?: string | null;
}

interface Client {
  id: string;
  business_name: string;
  primary_email?: string | null;
}

interface Project {
  id: string;
  name?: string;
  service_type: string;
  status: string;
  deadline: string | null;
  client_id?: string | null;
  deal_id?: string | null;
  clients?: Client | null;
  tasks?: Task[];
}

interface PMDashboardProps {
  projects: Project[];
  tasks: Task[];
}

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "not_started", label: "Not Started" },
  { key: "in_progress", label: "In Progress" },
  { key: "on_hold", label: "On Hold" },
  { key: "completed", label: "Completed" },
  { key: "needs_attention", label: "Needs Attention" },
];

const statusLabels: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toISOString().split("T")[0];
}

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const today = new Date().toISOString().split("T")[0];
  return dateStr.split("T")[0] === today;
}

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateStr);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
}

function formatDisplayDate(dateStr: string | null): string {
  if (!dateStr) return "No deadline";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function PMDashboard({ projects, tasks }: PMDashboardProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showTeamDetails, setShowTeamDetails] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Dashboard metrics
  const metrics = useMemo(() => {
    const tasksDueToday = tasks.filter(
      (t) => t.due_date && t.due_date.split("T")[0] === today && t.status !== "completed"
    );

    const completedToday = tasks.filter(
      (t) =>
        t.status === "completed" &&
        ((t.completed_at && t.completed_at.split("T")[0] === today) ||
          (t.due_date && t.due_date.split("T")[0] === today))
    );

    const overdueTasks = tasks.filter(
      (t) => t.status !== "completed" && isOverdue(t.due_date)
    );

    // Group active tasks by assigned_to
    const teamWorkload: Record<string, { count: number; nextDeadline: string | null }> = {};
    tasks
      .filter((t) => t.status !== "completed" && t.assigned_to)
      .forEach((task) => {
        const member = task.assigned_to || "Unassigned";
        if (!teamWorkload[member]) {
          teamWorkload[member] = { count: 0, nextDeadline: null };
        }
        teamWorkload[member].count++;
        if (
          task.due_date &&
          (!teamWorkload[member].nextDeadline ||
            task.due_date < teamWorkload[member].nextDeadline!)
        ) {
          teamWorkload[member].nextDeadline = task.due_date;
        }
      });

    return {
      tasksDueToday: tasksDueToday.length,
      completedToday: completedToday.length,
      overdueTasks: overdueTasks.length,
      teamWorkload,
    };
  }, [tasks, today]);

  // Project metrics & filtering
  const projectsWithMetrics = useMemo(() => {
    return projects.map((project) => {
      const projectTasks = tasks.filter((t) => t.project_id === project.id);
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter((t) => t.status === "completed").length;
      const overdueTasks = projectTasks.filter(
        (t) => t.status !== "completed" && isOverdue(t.due_date)
      ).length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...project,
        totalTasks,
        completedTasks,
        overdueTasks,
        progress,
        needsAttention: overdueTasks > 0,
      };
    });
  }, [projects, tasks]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") return projectsWithMetrics;
    if (activeFilter === "needs_attention") {
      return projectsWithMetrics.filter((p) => p.needsAttention);
    }
    return projectsWithMetrics.filter((p) => p.status === activeFilter);
  }, [projectsWithMetrics, activeFilter]);

  // Count projects per filter
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: projectsWithMetrics.length,
      needs_attention: projectsWithMetrics.filter((p) => p.needsAttention).length,
    };
    projectsWithMetrics.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [projectsWithMetrics]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "not_started":
        return "bg-gray-600 text-gray-200";
      case "in_progress":
        return "bg-[#42CA80] text-white";
      case "on_hold":
        return "bg-yellow-600 text-white";
      case "completed":
        return "bg-blue-600 text-white";
      case "cancelled":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-gray-200";
    }
  };

  const formatServiceType = (serviceType: string) => {
    return serviceType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
          Projects Dashboard
        </h1>
        <p className="mt-1 text-xs text-[#a1a1aa] sm:text-sm">
          Manage all active projects and team workload
        </p>
      </div>

      {/* Team Pulse - Key Metrics */}
      <div className="mb-4 grid grid-cols-3 gap-3 sm:mb-6 sm:gap-4">
        {/* Tasks Due Today */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
            <span className="text-[10px] text-amber-300 sm:text-xs">Due Today</span>
          </div>
          <p className="mt-1 text-xl font-bold text-amber-400 sm:mt-2 sm:text-3xl">
            {metrics.tasksDueToday}
          </p>
        </div>

        {/* Completed Today */}
        <div className="rounded-xl border border-[#42CA80]/30 bg-[#42CA80]/10 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#42CA80] sm:h-5 sm:w-5" />
            <span className="text-[10px] text-[#42CA80]/80 sm:text-xs">Completed</span>
          </div>
          <p className="mt-1 text-xl font-bold text-[#42CA80] sm:mt-2 sm:text-3xl">
            {metrics.completedToday}
          </p>
        </div>

        {/* At Risk / Overdue */}
        <div className={clsx(
          "rounded-xl border p-3 sm:p-4",
          metrics.overdueTasks > 0
            ? "border-red-500/30 bg-red-500/10"
            : "border-[#1a1a1a] bg-[#1a1a1a]"
        )}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={clsx(
              "h-4 w-4 sm:h-5 sm:w-5",
              metrics.overdueTasks > 0 ? "text-red-400" : "text-[#666]"
            )} />
            <span className={clsx(
              "text-[10px] sm:text-xs",
              metrics.overdueTasks > 0 ? "text-red-300" : "text-[#666]"
            )}>At Risk</span>
          </div>
          <p className={clsx(
            "mt-1 text-xl font-bold sm:mt-2 sm:text-3xl",
            metrics.overdueTasks > 0 ? "text-red-400" : "text-[#666]"
          )}>
            {metrics.overdueTasks}
          </p>
        </div>
      </div>

      {/* Who is doing what? */}
      <div className="mb-4 rounded-xl border border-[#1a1a1a] bg-[#1a1a1a] sm:mb-6">
        <button
          onClick={() => setShowTeamDetails(!showTeamDetails)}
          className="flex w-full items-center justify-between p-3 sm:p-4"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 sm:h-10 sm:w-10">
              <Users className="h-4 w-4 text-indigo-400 sm:h-5 sm:w-5" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-semibold text-white sm:text-base">Team Workload</h3>
              <p className="text-[10px] text-[#666] sm:text-xs">
                {Object.keys(metrics.teamWorkload).length} team members with active tasks
              </p>
            </div>
          </div>
          {showTeamDetails ? (
            <ChevronUp className="h-5 w-5 text-[#666]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#666]" />
          )}
        </button>

        {showTeamDetails && (
          <div className="border-t border-[#252525] p-3 sm:p-4">
            {Object.keys(metrics.teamWorkload).length === 0 ? (
              <p className="text-center text-sm text-[#666]">No assigned tasks</p>
            ) : (
              <div className="space-y-2">
                {/* Header - Hidden on mobile */}
                <div className="hidden grid-cols-3 gap-4 border-b border-[#252525] pb-2 text-xs font-medium text-[#666] sm:grid">
                  <span>Team Member</span>
                  <span className="text-center">Tasks</span>
                  <span className="text-right">Next Deadline</span>
                </div>
                {/* Team rows */}
                {Object.entries(metrics.teamWorkload)
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([member, data]) => (
                    <div
                      key={member}
                      className="flex flex-col gap-1 rounded-lg bg-[#0f0f0f] p-3 sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:p-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-medium text-indigo-400">
                          {member.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-white">{member}</span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-center">
                        <span className="text-xs text-[#666] sm:hidden">Tasks:</span>
                        <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
                          {data.count}
                        </span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end">
                        <span className="text-xs text-[#666] sm:hidden">Next:</span>
                        <span className={clsx(
                          "text-xs",
                          data.nextDeadline && isOverdue(data.nextDeadline)
                            ? "font-medium text-red-400"
                            : data.nextDeadline && isToday(data.nextDeadline)
                            ? "font-medium text-amber-400"
                            : "text-[#a1a1aa]"
                        )}>
                          {data.nextDeadline
                            ? formatDisplayDate(data.nextDeadline)
                            : "No deadline"}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto pb-1 sm:mb-6 sm:gap-2">
        {STATUS_FILTERS.map((filter) => {
          const count = filterCounts[filter.key] || 0;
          const isActive = activeFilter === filter.key;
          const isNeedsAttention = filter.key === "needs_attention";

          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={clsx(
                "flex-shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                isActive
                  ? isNeedsAttention
                    ? "bg-red-500 text-white"
                    : "bg-white text-black"
                  : isNeedsAttention && count > 0
                  ? "bg-red-500/20 text-red-400 active:bg-red-500/30"
                  : "bg-[#1a1a1a] text-[#a1a1aa] active:bg-[#252525]"
              )}
            >
              {filter.label}
              {count > 0 && (
                <span className={clsx(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  isActive
                    ? "bg-black/20 text-inherit"
                    : isNeedsAttention && count > 0
                    ? "bg-red-500/30 text-red-300"
                    : "bg-[#333] text-[#a1a1aa]"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Project Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#333] p-8 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-[#666]" />
          <p className="mt-2 text-sm text-[#666]">No projects match this filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects.map((project) => {
            const clientName = project.clients?.business_name || "Unknown Client";

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={clsx(
                  "block rounded-xl border bg-[#1a1a1a] p-4 transition-all active:scale-[0.98] sm:p-5",
                  project.needsAttention
                    ? "border-red-500/50 hover:border-red-500"
                    : "border-[#1a1a1a] hover:border-[#42CA80]/50"
                )}
              >
                {/* Client Name */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-base font-bold text-white sm:text-lg">
                    {clientName}
                  </h3>
                  {project.needsAttention && (
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-400" />
                  )}
                </div>

                {/* Service Type & Status */}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-[#a1a1aa] sm:text-sm">
                    {formatServiceType(project.service_type || "")}
                  </span>
                  <span
                    className={clsx(
                      "flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium sm:px-2.5 sm:text-xs",
                      getStatusBadgeColor(project.status)
                    )}
                  >
                    {statusLabels[project.status] || project.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-[#666] sm:text-xs">
                    <span>Progress</span>
                    <span className="font-medium text-[#a1a1aa]">
                      {project.completedTasks}/{project.totalTasks} tasks
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#0f0f0f]">
                    <div
                      className={clsx(
                        "h-full rounded-full transition-all",
                        project.progress === 100
                          ? "bg-blue-500"
                          : project.needsAttention
                          ? "bg-red-500"
                          : "bg-[#42CA80]"
                      )}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Deadline & Overdue Count */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  {project.deadline && (
                    <div className={clsx(
                      "flex items-center gap-1",
                      isOverdue(project.deadline) ? "text-red-400" : "text-[#666]"
                    )}>
                      <Calendar className="h-3 w-3" />
                      <span>{formatDisplayDate(project.deadline)}</span>
                    </div>
                  )}
                  {project.overdueTasks > 0 && (
                    <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-400">
                      {project.overdueTasks} overdue
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

