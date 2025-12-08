"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ListTodo,
  Clock,
  Flag,
  TrendingUp,
  Calendar,
  Building2,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Filter,
} from "lucide-react";
import TaskExecutionModal from "./task-execution-modal";
import clsx from "clsx";

interface Task {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  priority?: string | null;
  sop_content?: string | null;
  submission_notes?: string | null;
  project_id: string;
  projects?: {
    service_type: string;
    clients?: {
      business_name: string;
    } | null;
  } | null;
}

interface StaffDashboardProps {
  tasks: Task[];
  staffName: string;
}

const SERVICE_FILTERS = [
  { key: "all", label: "All" },
  { key: "web_design", label: "Web Design" },
  { key: "seo", label: "SEO" },
  { key: "google_ads", label: "Google Ads" },
  { key: "social_media", label: "Social Media" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const STATUS_FILTERS = [
  { value: "all", label: "All Tasks" },
  { value: "not_started", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "needs_attention", label: "Needs Attention" },
];

const STATUS_GROUPS = [
  { key: "not_started", label: "To Do", icon: Circle, color: "text-gray-400" },
  { key: "in_progress", label: "In Progress", icon: Clock, color: "text-blue-400" },
  { key: "in_review", label: "In Review", icon: AlertTriangle, color: "text-purple-400" },
  { key: "needs_attention", label: "Needs Attention", icon: AlertTriangle, color: "text-amber-400" },
];

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high: { label: "High", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  medium: { label: "Med", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  low: { label: "Low", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
};

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
  if (!dateStr) return "No date";
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function StaffDashboard({ tasks, staffName }: StaffDashboardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceFilter, setServiceFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [localTasks, setLocalTasks] = useState(tasks);
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  // Personal Metrics
  const metrics = useMemo(() => {
    const activeTasks = localTasks.filter((t) => t.status !== "completed");
    const tasksDueToday = localTasks.filter(
      (t) => t.status !== "completed" && isToday(t.due_date)
    );
    const highPriorityTasks = localTasks.filter(
      (t) => t.status !== "completed" && t.priority === "high"
    );
    const completedToday = localTasks.filter(
      (t) => t.status === "completed" && isToday(t.due_date)
    );
    const dueTodayCount = tasksDueToday.length;
    const completionRate = dueTodayCount > 0
      ? Math.round((completedToday.length / dueTodayCount) * 100)
      : 100;

    return {
      activeCount: activeTasks.length,
      dueTodayCount: tasksDueToday.length,
      highPriorityCount: highPriorityTasks.length,
      completionRate,
    };
  }, [localTasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return localTasks.filter((task) => {
      // Exclude completed tasks (unless specifically filtered)
      if (statusFilter === "all" && task.status === "completed") return false;

      // Status filter
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }

      // Service filter
      if (serviceFilter !== "all") {
        const serviceType = task.projects?.service_type || "";
        if (!serviceType.includes(serviceFilter.replace("_", ""))) return false;
      }

      // Priority filter
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [localTasks, serviceFilter, priorityFilter, statusFilter]);

  // Group tasks by status
  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    STATUS_GROUPS.forEach((group) => {
      groups[group.key] = filteredTasks.filter((t) => t.status === group.key);
    });
    return groups;
  }, [filteredTasks]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleStatusChange = (taskId: string, newStatus: string, notes?: string) => {
    setLocalTasks(
      localTasks.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, submission_notes: notes || t.submission_notes }
          : t
      )
    );
    router.refresh();
  };

  const formatServiceType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
          Welcome back, {staffName}
        </h1>
        <p className="mt-1 text-xs text-[#a1a1aa] sm:text-sm">
          Here's your task overview for today
        </p>
      </div>

      {/* Personal Metrics */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:grid-cols-4 sm:gap-4">
        {/* My Load */}
        <div className="rounded-xl border border-[#1a1a1a] bg-[#1a1a1a] p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-indigo-400 sm:h-5 sm:w-5" />
            <span className="text-[10px] text-[#666] sm:text-xs">My Load</span>
          </div>
          <p className="mt-1 text-xl font-bold text-white sm:mt-2 sm:text-3xl">
            {metrics.activeCount}
          </p>
          <p className="text-[10px] text-[#666]">Active tasks</p>
        </div>

        {/* Due Today */}
        <div className={clsx(
          "rounded-xl border p-3 sm:p-4",
          metrics.dueTodayCount > 0
            ? "border-amber-500/30 bg-amber-500/10"
            : "border-[#1a1a1a] bg-[#1a1a1a]"
        )}>
          <div className="flex items-center gap-2">
            <Clock className={clsx(
              "h-4 w-4 sm:h-5 sm:w-5",
              metrics.dueTodayCount > 0 ? "text-amber-400" : "text-[#666]"
            )} />
            <span className={clsx(
              "text-[10px] sm:text-xs",
              metrics.dueTodayCount > 0 ? "text-amber-300" : "text-[#666]"
            )}>Due Today</span>
          </div>
          <p className={clsx(
            "mt-1 text-xl font-bold sm:mt-2 sm:text-3xl",
            metrics.dueTodayCount > 0 ? "text-amber-400" : "text-[#666]"
          )}>
            {metrics.dueTodayCount}
          </p>
          <p className="text-[10px] text-[#666]">Need attention</p>
        </div>

        {/* High Priority */}
        <div className={clsx(
          "rounded-xl border p-3 sm:p-4",
          metrics.highPriorityCount > 0
            ? "border-red-500/30 bg-red-500/10"
            : "border-[#1a1a1a] bg-[#1a1a1a]"
        )}>
          <div className="flex items-center gap-2">
            <Flag className={clsx(
              "h-4 w-4 sm:h-5 sm:w-5",
              metrics.highPriorityCount > 0 ? "text-red-400" : "text-[#666]"
            )} />
            <span className={clsx(
              "text-[10px] sm:text-xs",
              metrics.highPriorityCount > 0 ? "text-red-300" : "text-[#666]"
            )}>High Priority</span>
          </div>
          <p className={clsx(
            "mt-1 text-xl font-bold sm:mt-2 sm:text-3xl",
            metrics.highPriorityCount > 0 ? "text-red-400" : "text-[#666]"
          )}>
            {metrics.highPriorityCount}
          </p>
          <p className="text-[10px] text-[#666]">Urgent tasks</p>
        </div>

        {/* Completion Rate */}
        <div className="rounded-xl border border-[#42CA80]/30 bg-[#42CA80]/10 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#42CA80] sm:h-5 sm:w-5" />
            <span className="text-[10px] text-[#42CA80]/80 sm:text-xs">Today's Rate</span>
          </div>
          <p className="mt-1 text-xl font-bold text-[#42CA80] sm:mt-2 sm:text-3xl">
            {metrics.completionRate}%
          </p>
          <p className="text-[10px] text-[#666]">Completion</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto pb-1 sm:gap-2">
        {STATUS_FILTERS.map((filter) => {
          const count = localTasks.filter((t) => 
            filter.value === "all" 
              ? t.status !== "completed" 
              : t.status === filter.value
          ).length;
          
          return (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={clsx(
                "flex-shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                statusFilter === filter.value
                  ? filter.value === "in_progress"
                    ? "bg-blue-500 text-white"
                    : filter.value === "in_review"
                    ? "bg-purple-500 text-white"
                    : filter.value === "needs_attention"
                    ? "bg-amber-500 text-white"
                    : "bg-white text-black"
                  : "bg-[#1a1a1a] text-[#a1a1aa] hover:bg-[#252525]"
              )}
            >
              {filter.label}
              {count > 0 && (
                <span className={clsx(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  statusFilter === filter.value
                    ? "bg-black/20 text-inherit"
                    : "bg-[#333] text-[#a1a1aa]"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters Row */}
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Service Filter */}
        <div className="flex flex-wrap gap-2">
          {SERVICE_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setServiceFilter(filter.key)}
              className={clsx(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                serviceFilter === filter.key
                  ? "bg-indigo-500 text-white"
                  : "bg-[#1a1a1a] text-[#a1a1aa] hover:bg-[#252525]"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#666]" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-[#1a1a1a] bg-[#1a1a1a] px-3 py-1.5 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Groups or Filtered List */}
      <div className="space-y-6">
        {statusFilter === "all" ? (
          // Show grouped tasks when "All Tasks" is selected
          STATUS_GROUPS.map((group) => {
            const groupTasks = groupedTasks[group.key] || [];
            const Icon = group.icon;

            if (groupTasks.length === 0) return null;

            return (
              <div key={group.key}>
                {/* Group Header */}
                <div className="mb-3 flex items-center gap-2">
                  <Icon className={clsx("h-4 w-4", group.color)} />
                  <h2 className={clsx("text-sm font-semibold", group.color)}>
                    {group.label}
                  </h2>
                  <span className="rounded-full bg-[#1a1a1a] px-2 py-0.5 text-xs text-[#666]">
                    {groupTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {groupTasks.map((task) => {
                    const priority = PRIORITY_CONFIG[task.priority || "medium"] || PRIORITY_CONFIG.medium;
                    const clientName = task.projects?.clients?.business_name || "Unknown Client";
                    const taskOverdue = isOverdue(task.due_date);
                    const taskDueToday = isToday(task.due_date);

                    return (
                      <button
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className={clsx(
                          "group flex flex-col rounded-xl border bg-[#1a1a1a] p-4 text-left transition-all active:scale-[0.98]",
                          taskOverdue
                            ? "border-red-500/50 hover:border-red-500"
                            : taskDueToday
                            ? "border-amber-500/50 hover:border-amber-500"
                            : "border-[#1a1a1a] hover:border-indigo-500/50"
                        )}
                      >
                        {/* Title */}
                        <h3 className="font-semibold text-white group-hover:text-indigo-400">
                          {task.title}
                        </h3>

                        {/* Client & Service */}
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className="flex items-center gap-1 text-[#a1a1aa]">
                            <Building2 className="h-3 w-3" />
                            {clientName}
                          </span>
                        </div>

                        {/* Footer: Due Date & Priority */}
                        <div className="mt-3 flex items-center justify-between">
                          <span className={clsx(
                            "flex items-center gap-1 text-xs",
                            taskOverdue ? "text-red-400" : taskDueToday ? "text-amber-400" : "text-[#666]"
                          )}>
                            <Calendar className="h-3 w-3" />
                            {formatDisplayDate(task.due_date)}
                          </span>
                          <span className={clsx(
                            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                            priority.color
                          )}>
                            {priority.label}
                          </span>
                        </div>

                        {/* Open Task Hint */}
                        <div className="mt-3 flex items-center justify-end text-xs text-[#666] opacity-0 transition-opacity group-hover:opacity-100">
                          <span>Open Task</span>
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          // Show flat list when specific status is selected
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                {STATUS_FILTERS.find((f) => f.value === statusFilter)?.label}
              </span>
              <span className="rounded-full bg-[#1a1a1a] px-2 py-0.5 text-xs text-[#666]">
                {filteredTasks.length}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => {
                const priority = PRIORITY_CONFIG[task.priority || "medium"] || PRIORITY_CONFIG.medium;
                const clientName = task.projects?.clients?.business_name || "Unknown Client";
                const taskOverdue = isOverdue(task.due_date);
                const taskDueToday = isToday(task.due_date);

                return (
                  <button
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className={clsx(
                      "group flex flex-col rounded-xl border bg-[#1a1a1a] p-4 text-left transition-all active:scale-[0.98]",
                      taskOverdue
                        ? "border-red-500/50 hover:border-red-500"
                        : taskDueToday
                        ? "border-amber-500/50 hover:border-amber-500"
                        : "border-[#1a1a1a] hover:border-indigo-500/50"
                    )}
                  >
                    {/* Title */}
                    <h3 className="font-semibold text-white group-hover:text-indigo-400">
                      {task.title}
                    </h3>

                    {/* Client & Service */}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-[#a1a1aa]">
                        <Building2 className="h-3 w-3" />
                        {clientName}
                      </span>
                    </div>

                    {/* Footer: Due Date & Priority */}
                    <div className="mt-3 flex items-center justify-between">
                      <span className={clsx(
                        "flex items-center gap-1 text-xs",
                        taskOverdue ? "text-red-400" : taskDueToday ? "text-amber-400" : "text-[#666]"
                      )}>
                        <Calendar className="h-3 w-3" />
                        {formatDisplayDate(task.due_date)}
                      </span>
                      <span className={clsx(
                        "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        priority.color
                      )}>
                        {priority.label}
                      </span>
                    </div>

                    {/* Open Task Hint */}
                    <div className="mt-3 flex items-center justify-end text-xs text-[#666] opacity-0 transition-opacity group-hover:opacity-100">
                      <span>Open Task</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#333] p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#42CA80]" />
            <p className="mt-3 text-lg font-semibold text-white">All caught up!</p>
            <p className="mt-1 text-sm text-[#666]">
              {serviceFilter !== "all" || priorityFilter !== "all" || statusFilter !== "all"
                ? "No tasks match your filters"
                : "You have no active tasks"}
            </p>
          </div>
        )}
      </div>

      {/* Task Execution Modal */}
      {selectedTask && (
        <TaskExecutionModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}

