"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Mail,
  Building2,
  ArrowRight,
  Zap,
  Loader2,
} from "lucide-react";
import clsx from "clsx";

interface Milestone {
  id: string;
  project_id: string;
  name: string;
  status: string;
  order_index: number;
  created_at: string;
}

interface Project {
  id: string;
  name: string | null;
  service_type: string | null;
  status: string | null;
  deadline: string | null;
  start_date: string | null;
  assigned_pm: string | null;
  client_id: string | null;
}

interface Client {
  id: string;
  business_name: string | null;
  primary_email: string | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
}

export default function ClientDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [pmProfile, setPmProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Get the User
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setError("Please log in to view your dashboard.");
          setLoading(false);
          return;
        }

        setUserEmail(user.email || null);

        // Step 2: Get the Client Record (use maybeSingle to handle duplicates)
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("*")
          .eq("primary_email", user.email || "")
          .limit(1)
          .maybeSingle();

        console.log("Client Search Result:", { clientData, clientError, email: user.email });

        if (clientError) {
          console.error("Client fetch error:", clientError);
          setError(`Error fetching client: ${clientError.message}`);
          setLoading(false);
          return;
        }

        if (!clientData) {
          setError("No client account found for your email.");
          setLoading(false);
          return;
        }

        setClient(clientData);

        // Step 3: Get the Project (use maybeSingle to handle edge cases)
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("client_id", (clientData as any).id)
          .in("status", ["not_started", "in_progress"])
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        console.log("Project Search Result:", { projectData, projectError, clientId: (clientData as any).id });

        if (projectData) {
          setProject(projectData);

          // Step 4: Get Milestones
          const { data: milestonesData } = await supabase
            .from("project_milestones")
            .select("*")
            .eq("project_id", (projectData as any).id)
            .order("order_index", { ascending: true });

          setMilestones(milestonesData || []);

          // Step 5: Get PM Profile if assigned
          if ((projectData as any).assigned_pm) {
            const { data: pmData } = await supabase
              .from("profiles")
              .select("id, full_name, email")
              .eq("id", (projectData as any).assigned_pm)
              .single();

            setPmProfile(pmData);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An unexpected error occurred.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper functions
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "TBD";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatServiceType = (serviceType: string | null) => {
    if (!serviceType) return "Project";
    return serviceType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusConfig = (status: string | null) => {
    const configs: Record<string, { label: string; color: string; bg: string }> = {
      not_started: { label: "Kickoff Pending", color: "text-zinc-400", bg: "bg-zinc-800" },
      in_progress: { label: "In Progress", color: "text-blue-400", bg: "bg-blue-500/20" },
      completed: { label: "Completed", color: "text-[#42CA80]", bg: "bg-[#42CA80]/20" },
      on_hold: { label: "On Hold", color: "text-amber-400", bg: "bg-amber-500/20" },
    };
    return configs[status || "not_started"] || configs.not_started;
  };

  // Calculate progress
  const completedMilestones = milestones.filter(
    (m) => m.status === "completed" || m.status === "approved"
  ).length;
  const progressPercent =
    milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  // Find current milestone (first non-completed)
  const currentMilestoneIndex = milestones.findIndex(
    (m) => m.status !== "completed" && m.status !== "approved"
  );

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#42CA80] to-emerald-600 shadow-lg shadow-[#42CA80]/25">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-[#42CA80]" />
          <p className="text-sm text-zinc-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error State (not logged in)
  if (error && !client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#42CA80] to-emerald-600">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome to FortuneMarq</h1>
          <p className="mt-4 text-zinc-400">{error}</p>
          {userEmail && (
            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-800/50 p-4">
              <p className="text-sm text-zinc-500">Logged in as</p>
              <p className="mt-1 font-medium text-white">{userEmail}</p>
            </div>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Back to Login
            </Link>
            <a
              href="mailto:support@fortunemarq.com"
              className="inline-flex items-center gap-2 rounded-xl bg-[#42CA80] px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-[#3ab872]"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  // No Project State
  if (client && !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#42CA80] to-emerald-600">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome, {client.business_name}</h1>
          <p className="mt-4 text-zinc-400">
            You don&apos;t have any active projects at the moment. When a new project starts, you&apos;ll see your progress here.
          </p>
          <a
            href="mailto:support@fortunemarq.com"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            <Mail className="h-4 w-4" />
            Contact Your Account Manager
          </a>
        </div>
      </div>
    );
  }

  // Success State - Full Dashboard
  if (!client || !project) return null;

  const statusConfig = getStatusConfig(project.status);

  return (
    <div className="min-h-screen bg-zinc-900 px-4 py-8 md:px-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#42CA80] to-emerald-600 shadow-lg shadow-[#42CA80]/20">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Welcome back</p>
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              {client.business_name}
            </h1>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="space-y-6 lg:col-span-2">
            {/* Hero Card - Project Status */}
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
              {/* Status Banner */}
              <div className={clsx("px-6 py-4", statusConfig.bg)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Current Status
                    </p>
                    <p className={clsx("mt-1 text-xl font-bold", statusConfig.color)}>
                      {statusConfig.label}
                    </p>
                  </div>
                  <div className={clsx("rounded-full px-4 py-1.5 text-sm font-semibold", statusConfig.bg, statusConfig.color)}>
                    {formatServiceType(project.service_type)}
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-400">Overall Progress</span>
                  <span className="text-lg font-bold text-[#42CA80]">{progressPercent}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#42CA80] to-emerald-400 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  {completedMilestones} of {milestones.length} milestones completed
                </p>

                {/* Timeline */}
                <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-zinc-900/50 p-4">
                  <div>
                    <p className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                      <Calendar className="h-3 w-3" />
                      Start Date
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {formatDate(project.start_date)}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                      <Calendar className="h-3 w-3" />
                      Est. Launch
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {formatDate(project.deadline)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestone Roadmap */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="mb-6 text-lg font-semibold text-white">Project Roadmap</h2>

              {milestones.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center">
                  <Clock className="mx-auto h-8 w-8 text-zinc-600" />
                  <p className="mt-3 text-sm text-zinc-500">
                    Milestones will appear here once your project kicks off.
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-4 top-0 h-full w-px bg-zinc-800" />

                  <div className="space-y-6">
                    {milestones.map((milestone, index) => {
                      const isCompleted =
                        milestone.status === "completed" || milestone.status === "approved";
                      const isCurrent = index === currentMilestoneIndex;

                      return (
                        <div
                          key={milestone.id}
                          className={clsx(
                            "relative flex gap-4 pl-10",
                            isCompleted && "opacity-60"
                          )}
                        >
                          {/* Marker */}
                          <div
                            className={clsx(
                              "absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border-2",
                              isCompleted
                                ? "border-[#42CA80] bg-[#42CA80]/20"
                                : isCurrent
                                ? "border-blue-500 bg-blue-500/20"
                                : "border-zinc-700 bg-zinc-900"
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-[#42CA80]" />
                            ) : isCurrent ? (
                              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500" />
                            ) : (
                              <Circle className="h-3 w-3 text-zinc-600" />
                            )}
                          </div>

                          {/* Content */}
                          <div
                            className={clsx(
                              "flex-1 rounded-xl border p-4 transition-all",
                              isCurrent
                                ? "border-blue-500/30 bg-blue-500/5"
                                : "border-zinc-800 bg-zinc-900/50"
                            )}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3
                                  className={clsx(
                                    "font-medium",
                                    isCompleted
                                      ? "text-zinc-400 line-through"
                                      : isCurrent
                                      ? "text-white"
                                      : "text-zinc-300"
                                  )}
                                >
                                  {milestone.name}
                                </h3>
                                <p className="mt-1 text-xs text-zinc-500">
                                  Phase {index + 1} of {milestones.length}
                                </p>
                              </div>

                              {/* Status Badge */}
                              {isCompleted ? (
                                <span className="rounded-full bg-[#42CA80]/20 px-2.5 py-1 text-xs font-semibold text-[#42CA80]">
                                  Complete
                                </span>
                              ) : isCurrent ? (
                                <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-400">
                                  In Progress
                                </span>
                              ) : (
                                <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-500">
                                  Upcoming
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Project Manager Card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Your Project Manager
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 text-lg font-bold text-white">
                  {pmProfile?.full_name?.charAt(0) || "A"}
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {pmProfile?.full_name || "Agency Team"}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {pmProfile ? "Project Manager" : "We&apos;re here to help"}
                  </p>
                </div>
              </div>
              <a
                href={`mailto:${pmProfile?.email || "projects@fortunemarq.com"}`}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
              >
                <Mail className="h-4 w-4" />
                Email Project Manager
              </a>
            </div>

            {/* Quick Info Card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Project Details
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs text-zinc-500">Project Type</dt>
                  <dd className="mt-1 font-medium text-white">
                    {formatServiceType(project.service_type)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Project Name</dt>
                  <dd className="mt-1 font-medium text-white">
                    {project.name || `${formatServiceType(project.service_type)} Project`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Your Account</dt>
                  <dd className="mt-1 truncate text-sm text-zinc-400">{userEmail}</dd>
                </div>
              </dl>
            </div>

            {/* Support Card */}
            <div className="rounded-2xl border border-[#42CA80]/30 bg-[#42CA80]/5 p-6">
              <h3 className="mb-2 font-semibold text-[#42CA80]">Need Help?</h3>
              <p className="text-sm text-zinc-400">
                Have questions about your project? We&apos;re here to help.
              </p>
              <a
                href="mailto:support@fortunemarq.com"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#42CA80] hover:underline"
              >
                Contact Support
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
