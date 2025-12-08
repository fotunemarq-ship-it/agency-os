import { createServerClient } from "@/lib/supabase";
import {
  Settings,
  FolderKanban,
  ListTodo,
  Clock,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Users,
  PauseCircle,
} from "lucide-react";
import Link from "next/link";
import ServiceDistributionChart from "@/components/admin/service-distribution-chart";
import TeamLoadChart from "@/components/admin/team-load-chart";

interface Project {
  id: string;
  status: string | null;
  deadline: string | null;
  client_id: string | null;
  service_type: string | null;
}

interface Task {
  id: string;
  title: string | null;
  status: string | null;
  due_date: string | null;
  project_id: string | null;
  assigned_to: string | null;
  updated_at: string | null;
}

interface Client {
  id: string;
  business_name: string | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
}

export default async function OperationsPage() {
  const supabase = createServerClient();

  // Fetch all data in parallel
  const [projectsResult, tasksResult, clientsResult, profilesResult] = await Promise.all([
    supabase.from("projects").select("id, status, deadline, client_id, service_type"),
    supabase.from("tasks").select("id, title, status, due_date, project_id, assigned_to, updated_at"),
    supabase.from("clients").select("id, business_name"),
    supabase.from("profiles").select("id, full_name, email"),
  ]);

  const projects: Project[] = projectsResult.data || [];
  const tasks: Task[] = tasksResult.data || [];
  const clients: Client[] = clientsResult.data || [];
  const profiles: Profile[] = profilesResult.data || [];

  // Create lookup maps
  const clientsMap = new Map(clients.map((c) => [c.id, c.business_name || "Unknown"]));
  const profilesMap = new Map(profiles.map((p) => [p.id, p.full_name || p.email || "Unknown"]));

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Calculate metrics
  const activeProjects = projects.filter(
    (p) => p.status === "in_progress" || p.status === "not_started"
  ).length;

  const totalTasks = tasks.length;
  const tasksDueToday = tasks.filter((t) => t.due_date === todayStr).length;

  const overdueTasks = tasks.filter((t) => {
    if (!t.due_date || t.status === "completed") return false;
    return t.due_date < todayStr;
  });
  const overdueCount = overdueTasks.length;

  const completedTasks = tasks.filter((t) => t.status === "completed").length;

  // Service Distribution - Active Projects by service_type
  const serviceTypes: Record<string, { name: string; color: string }> = {
    web_dev: { name: "Web Development", color: "#3B82F6" },
    web_design: { name: "Web Design", color: "#8B5CF6" },
    seo: { name: "SEO", color: "#42CA80" },
    ads: { name: "Paid Ads", color: "#F59E0B" },
    social_media: { name: "Social Media", color: "#EC4899" },
    branding: { name: "Branding", color: "#06B6D4" },
    other: { name: "Other", color: "#6B7280" },
  };

  const activeProjectsList = projects.filter(
    (p) => p.status === "in_progress" || p.status === "not_started"
  );

  const serviceDistribution = activeProjectsList.reduce((acc, p) => {
    const service = p.service_type || "other";
    acc[service] = (acc[service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const serviceDistributionData = Object.entries(serviceDistribution)
    .map(([key, value]) => ({
      name: serviceTypes[key]?.name || key,
      value,
      color: serviceTypes[key]?.color || "#6B7280",
    }))
    .sort((a, b) => b.value - a.value);

  // Team Load - Active tasks per user
  const activeTasks = tasks.filter(
    (t) => t.status !== "completed" && t.status !== "cancelled"
  );

  const tasksByUser = activeTasks.reduce((acc, t) => {
    const userId = t.assigned_to || "unassigned";
    acc[userId] = (acc[userId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const teamLoadData = Object.entries(tasksByUser)
    .map(([userId, tasks]) => ({
      name: userId === "unassigned" ? "Unassigned" : profilesMap.get(userId) || userId.slice(0, 8),
      tasks,
    }))
    .sort((a, b) => b.tasks - a.tasks)
    .slice(0, 8);

  // Stalled Projects: Projects in progress but 0 tasks completed in last 7 days
  const tasksByProject = tasks.reduce((acc, t) => {
    if (!t.project_id) return acc;
    if (!acc[t.project_id]) {
      acc[t.project_id] = { total: 0, completed: 0, recentlyCompleted: 0 };
    }
    acc[t.project_id].total += 1;
    if (t.status === "completed") {
      acc[t.project_id].completed += 1;
      if (t.updated_at) {
        const updatedDate = new Date(t.updated_at);
        if (updatedDate >= sevenDaysAgo) {
          acc[t.project_id].recentlyCompleted += 1;
        }
      }
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number; recentlyCompleted: number }>);

  const stalledProjects = projects
    .filter((p) => {
      if (p.status !== "in_progress") return false;
      const projectTasks = tasksByProject[p.id];
      if (!projectTasks || projectTasks.total === 0) return false;
      return projectTasks.recentlyCompleted === 0 && projectTasks.completed < projectTasks.total;
    })
    .map((p) => {
      const clientName = p.client_id ? clientsMap.get(p.client_id) || "Unknown" : "Unknown";
      const projectTaskData = tasksByProject[p.id] || { total: 0, completed: 0 };
      return {
        id: p.id,
        clientName,
        serviceType: formatServiceType(p.service_type || ""),
        deadline: p.deadline,
        tasksTotal: projectTaskData.total,
        tasksCompleted: projectTaskData.completed,
      };
    })
    .slice(0, 5);

  // At-Risk Projects (overdue)
  const overdueTasksByProject = overdueTasks.reduce((acc, t) => {
    if (t.project_id) {
      acc[t.project_id] = (acc[t.project_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const atRiskProjects = projects
    .filter((p) => {
      const deadlineOverdue =
        p.deadline && p.deadline < todayStr && p.status !== "completed" && p.status !== "cancelled";
      const hasOverdueTasks = overdueTasksByProject[p.id] > 0;
      return deadlineOverdue || hasOverdueTasks;
    })
    .map((p) => {
      const clientName = p.client_id ? clientsMap.get(p.client_id) || "Unknown" : "Unknown";
      const overdueTaskCount = overdueTasksByProject[p.id] || 0;
      const deadlineOverdue = p.deadline && p.deadline < todayStr;
      return {
        id: p.id,
        clientName,
        serviceType: formatServiceType(p.service_type || ""),
        deadline: p.deadline,
        overdueTaskCount,
        deadlineOverdue,
      };
    })
    .sort((a, b) => b.overdueTaskCount - a.overdueTaskCount)
    .slice(0, 5);

  function formatServiceType(serviceType: string) {
    return serviceType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="mb-4 inline-flex items-center gap-2 text-sm text-[#a1a1aa] transition-colors hover:text-[#42CA80]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Command Hub
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/20">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                Operations Center
              </h1>
              <p className="text-sm text-[#a1a1aa]">Project execution & task management</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Active Projects */}
          <div className="group relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 transition-all hover:border-orange-500/30">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl transition-all group-hover:bg-orange-500/20" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
                <FolderKanban className="h-6 w-6 text-orange-400" />
              </div>
              <p className="mt-4 text-sm font-medium uppercase tracking-wider text-[#a1a1aa]">
                Active Projects
              </p>
              <p className="mt-2 text-3xl font-bold text-orange-400">{activeProjects}</p>
              <p className="mt-1 text-xs text-[#666]">in progress</p>
            </div>
          </div>

          {/* Total Tasks */}
          <div className="group relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 transition-all hover:border-blue-500/30">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:bg-blue-500/20" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                <ListTodo className="h-6 w-6 text-blue-400" />
              </div>
              <p className="mt-4 text-sm font-medium uppercase tracking-wider text-[#a1a1aa]">
                Total Tasks
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-400">{totalTasks}</p>
              <p className="mt-1 text-xs text-[#666]">
                {completedTasks} completed
              </p>
            </div>
          </div>

          {/* Due Today */}
          <div className="group relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 transition-all hover:border-cyan-500/30">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl transition-all group-hover:bg-cyan-500/20" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20">
                <Clock className="h-6 w-6 text-cyan-400" />
              </div>
              <p className="mt-4 text-sm font-medium uppercase tracking-wider text-[#a1a1aa]">
                Due Today
              </p>
              <p className="mt-2 text-3xl font-bold text-cyan-400">{tasksDueToday}</p>
              <p className="mt-1 text-xs text-[#666]">tasks to complete</p>
            </div>
          </div>

          {/* Critical Overdue */}
          <div
            className={`group relative overflow-hidden rounded-2xl border p-6 transition-all ${
              overdueCount > 0
                ? "border-red-500/30 bg-gradient-to-br from-red-950/50 to-zinc-900/50 hover:border-red-500/50"
                : "border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 hover:border-emerald-500/30"
            }`}
          >
            <div
              className={`absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl transition-all ${
                overdueCount > 0
                  ? "bg-red-500/20 group-hover:bg-red-500/30"
                  : "bg-emerald-500/10 group-hover:bg-emerald-500/20"
              }`}
            />
            <div className="relative">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  overdueCount > 0 ? "bg-red-500/20" : "bg-emerald-500/20"
                }`}
              >
                {overdueCount > 0 ? (
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                )}
              </div>
              <p className="mt-4 text-sm font-medium uppercase tracking-wider text-[#a1a1aa]">
                Critical Overdue
              </p>
              <p
                className={`mt-2 text-3xl font-bold ${
                  overdueCount > 0 ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {overdueCount}
              </p>
              <p className="mt-1 text-xs text-[#666]">
                {overdueCount > 0 ? "needs attention" : "all on track!"}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Service Distribution */}
          <div className="rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                <FolderKanban className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Service Distribution</h2>
                <p className="text-xs text-[#666]">Active projects by service type</p>
              </div>
            </div>
            <ServiceDistributionChart data={serviceDistributionData} />
          </div>

          {/* Team Load */}
          <div className="rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Team Load</h2>
                <p className="text-xs text-[#666]">Active tasks per team member</p>
              </div>
            </div>
            <TeamLoadChart data={teamLoadData} />
          </div>
        </div>

        {/* Projects Section */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Stalled Projects */}
          <div className="rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                <PauseCircle className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Stalled Projects</h2>
                <p className="text-xs text-[#666]">No tasks completed in 7 days</p>
              </div>
            </div>

            {stalledProjects.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5">
                <div className="text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
                  <p className="mt-2 text-sm font-medium text-emerald-400">All projects moving!</p>
                  <p className="mt-1 text-xs text-[#666]">Great momentum</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {stalledProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="group flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 transition-all hover:border-amber-500/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white group-hover:text-amber-400">
                        {project.clientName}
                      </p>
                      <p className="mt-1 text-xs text-[#a1a1aa]">{project.serviceType}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <span className="text-xs text-amber-400">
                        {project.tasksCompleted}/{project.tasksTotal} tasks
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* At-Risk Projects */}
          <div className="rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">At-Risk Projects</h2>
                <p className="text-xs text-[#666]">Projects with overdue items</p>
              </div>
            </div>

            {atRiskProjects.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5">
                <div className="text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
                  <p className="mt-2 text-sm font-medium text-emerald-400">All projects healthy!</p>
                  <p className="mt-1 text-xs text-[#666]">No at-risk projects</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {atRiskProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="group flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 p-4 transition-all hover:border-red-500/40 hover:bg-red-500/10"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white group-hover:text-red-400">
                        {project.clientName}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#a1a1aa]">
                        <span>{project.serviceType}</span>
                        {project.deadline && (
                          <>
                            <span className="text-red-500">•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(project.deadline)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-1">
                      {project.deadlineOverdue && (
                        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">
                          Overdue
                        </span>
                      )}
                      {project.overdueTaskCount > 0 && (
                        <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-400">
                          {project.overdueTaskCount} tasks late
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500/20 px-5 py-2.5 text-sm font-medium text-orange-400 transition-all hover:bg-orange-500/30"
          >
            <FolderKanban className="h-4 w-4" />
            View All Projects
          </Link>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500/20 px-5 py-2.5 text-sm font-medium text-blue-400 transition-all hover:bg-blue-500/30"
          >
            <ListTodo className="h-4 w-4" />
            Task Board
          </Link>
        </div>
      </div>
    </div>
  );
}
