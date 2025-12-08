import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Calendar, Users, Briefcase, Clock } from "lucide-react";
import TaskManager from "@/components/projects/task-manager";
import clsx from "clsx";

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;

  const supabase = createServerClient();

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  // Fetch client if client_id exists
  let clientData = null;
  if (project?.client_id) {
    const { data: client } = await supabase
      .from("clients")
      .select("id, business_name, primary_email")
      .eq("id", project.client_id)
      .single();
    clientData = client;
  }

  // Fetch tasks
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", id)
    .order("due_date", { ascending: true, nullsFirst: false });

  // Merge client data
  const projectWithClient = project
    ? {
        ...project,
        clients: clientData,
      }
    : null;

  if (projectError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4">
        <div className="text-center">
          <p className="text-red-500">
            Error loading project: {projectError.message}
          </p>
          <Link
            href="/projects"
            className="mt-4 inline-block text-[#42CA80] hover:underline"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (!projectWithClient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4">
        <div className="text-center">
          <p className="text-[#a1a1aa]">Project not found.</p>
          <Link
            href="/projects"
            className="mt-4 inline-block text-[#42CA80] hover:underline"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const formatServiceType = (serviceType: string) => {
    return serviceType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle both array and object formats for clients
  const client = Array.isArray(projectWithClient.clients)
    ? projectWithClient.clients[0]
    : projectWithClient.clients;
  const clientName =
    client?.business_name || 
    projectWithClient.client_id || 
    "Unknown Client";

  // Calculate progress
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((t: any) => t.status === "completed").length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Status config
  const statusConfig: Record<string, { label: string; color: string }> = {
    not_started: { label: "Not Started", color: "bg-gray-600 text-gray-200" },
    in_progress: { label: "In Progress", color: "bg-[#42CA80] text-white" },
    on_hold: { label: "On Hold", color: "bg-yellow-600 text-white" },
    completed: { label: "Completed", color: "bg-blue-600 text-white" },
    cancelled: { label: "Cancelled", color: "bg-red-600 text-white" },
  };

  const status = projectWithClient.status || "not_started";
  const statusInfo = statusConfig[status] || statusConfig.not_started;

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-[#a1a1aa] transition-colors hover:text-[#42CA80]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Projects</span>
          </Link>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
                {clientName}
              </h1>
              <p className="mt-1 text-sm text-[#a1a1aa] sm:text-base">
                {formatServiceType(projectWithClient.service_type || "")}
              </p>
            </div>
            <span
              className={clsx(
                "self-start rounded-full px-3 py-1 text-sm font-medium",
                statusInfo.color
              )}
            >
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Project Info Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {/* Start Date */}
          <div className="rounded-xl border border-[#1a1a1a] bg-[#1a1a1a] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[#666]">
              <Calendar className="h-4 w-4" />
              <span className="text-[10px] uppercase tracking-wider sm:text-xs">Start</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-white sm:text-base">
              {formatDate(projectWithClient.start_date)}
            </p>
          </div>

          {/* Deadline */}
          <div className="rounded-xl border border-[#1a1a1a] bg-[#1a1a1a] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[#666]">
              <Clock className="h-4 w-4" />
              <span className="text-[10px] uppercase tracking-wider sm:text-xs">Deadline</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-white sm:text-base">
              {formatDate(projectWithClient.deadline)}
            </p>
          </div>

          {/* Tasks Progress */}
          <div className="rounded-xl border border-[#1a1a1a] bg-[#1a1a1a] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[#666]">
              <Briefcase className="h-4 w-4" />
              <span className="text-[10px] uppercase tracking-wider sm:text-xs">Progress</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-white sm:text-base">
              {completedTasks}/{totalTasks} tasks
            </p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#0f0f0f]">
              <div
                className={clsx(
                  "h-full rounded-full transition-all",
                  progress === 100 ? "bg-blue-500" : "bg-[#42CA80]"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Client Email */}
          <div className="rounded-xl border border-[#1a1a1a] bg-[#1a1a1a] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[#666]">
              <Users className="h-4 w-4" />
              <span className="text-[10px] uppercase tracking-wider sm:text-xs">Client</span>
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-white sm:text-base">
              {client?.primary_email || "No email"}
            </p>
          </div>
        </div>

        {/* Task Manager */}
        <TaskManager
          initialTasks={tasks || []}
          projectId={id}
          tasksError={tasksError}
        />
      </div>
    </div>
  );
}
