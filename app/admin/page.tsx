import { createServerClient } from "@/lib/supabase";
import {
  DollarSign,
  Users,
  Target,
  Settings,
  ArrowRight,
  TrendingUp,
  Phone,
  FolderKanban,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default async function AdminCommandHub() {
  const supabase = createServerClient();

  // Fetch summary data in parallel
  const [dealsResult, leadsResult, callsResult, projectsResult, tasksResult] =
    await Promise.all([
      supabase.from("deals").select("id, deal_value, status"),
      supabase.from("leads").select("id, status"),
      supabase.from("call_activities").select("id, created_at"),
      supabase.from("projects").select("id, status, deadline"),
      supabase.from("tasks").select("id, status, due_date"),
    ]);

  const deals = dealsResult.data || [];
  const leads = leadsResult.data || [];
  const calls = callsResult.data || [];
  const projects = projectsResult.data || [];
  const tasks = tasksResult.data || [];

  // Calculate summary metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  // Financial metrics
  const totalRevenue = deals
    .filter((d: any) => d.status === "won" || d.status === "accepted")
    .reduce((sum: number, d: any) => sum + (d.deal_value || 0), 0);

  // Sales metrics
  const totalLeads = leads.length;
  const callsToday = calls.filter((c: any) => {
    if (!c.created_at) return false;
    return c.created_at.split("T")[0] === todayStr;
  }).length;

  // Strategy metrics
  const closedWon = leads.filter((l: any) => l.status === "closed_won").length;
  const closeRate = totalLeads > 0 ? (closedWon / totalLeads) * 100 : 0;

  // Operations metrics
  const activeProjects = projects.filter(
    (p: any) => p.status === "in_progress" || p.status === "not_started"
  ).length;
  const overdueTasks = tasks.filter((t: any) => {
    if (!t.due_date || t.status === "completed") return false;
    return t.due_date < todayStr;
  }).length;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const commandCards = [
    {
      title: "Financial Health",
      subtitle: "Revenue & profitability",
      href: "/admin/financials",
      icon: DollarSign,
      color: "from-emerald-500 to-green-600",
      bgGlow: "bg-emerald-500/20",
      metrics: [
        { label: "Total Revenue", value: formatCurrency(totalRevenue) },
      ],
    },
    {
      title: "Sales Force",
      subtitle: "Lead generation & calls",
      href: "/admin/sales",
      icon: Phone,
      color: "from-blue-500 to-cyan-600",
      bgGlow: "bg-blue-500/20",
      metrics: [
        { label: "Total Leads", value: totalLeads.toLocaleString() },
        { label: "Calls Today", value: callsToday.toLocaleString() },
      ],
    },
    {
      title: "Strategy Engine",
      subtitle: "Deal closing & conversions",
      href: "/admin/strategy",
      icon: Target,
      color: "from-purple-500 to-violet-600",
      bgGlow: "bg-purple-500/20",
      metrics: [
        { label: "Close Rate", value: `${closeRate.toFixed(1)}%` },
      ],
    },
    {
      title: "Operations Center",
      subtitle: "Project execution & tasks",
      href: "/admin/operations",
      icon: Settings,
      color: "from-orange-500 to-amber-600",
      bgGlow: "bg-orange-500/20",
      metrics: [
        { label: "Active Projects", value: activeProjects.toLocaleString() },
        { label: "Overdue Tasks", value: overdueTasks.toLocaleString(), isAlert: overdueTasks > 0 },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#42CA80] to-[#3ab872] shadow-lg shadow-[#42CA80]/20">
            <FolderKanban className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Command Hub
          </h1>
          <p className="mt-2 text-[#a1a1aa]">
            Executive summary of agency operations
          </p>
        </div>

        {/* Command Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {commandCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 transition-all duration-300 hover:border-[#333] hover:shadow-xl"
              >
                {/* Background Glow */}
                <div
                  className={`absolute -right-10 -top-10 h-40 w-40 rounded-full ${card.bgGlow} blur-3xl opacity-30 transition-opacity group-hover:opacity-50`}
                />

                {/* Content */}
                <div className="relative">
                  {/* Icon & Title */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[#a1a1aa] transition-colors group-hover:text-white">
                      <span>View Details</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="mt-5 text-xl font-bold text-white">
                    {card.title}
                  </h2>
                  <p className="mt-1 text-sm text-[#666]">{card.subtitle}</p>

                  {/* Metrics */}
                  <div className="mt-6 flex flex-wrap gap-6">
                    {card.metrics.map((metric, idx) => (
                      <div key={idx}>
                        <p className="text-xs font-medium uppercase tracking-wider text-[#666]">
                          {metric.label}
                        </p>
                        <p
                          className={`mt-1 text-2xl font-bold ${
                            metric.isAlert ? "text-red-400" : "text-white"
                          }`}
                        >
                          {metric.isAlert && (
                            <AlertTriangle className="mr-1 inline h-5 w-5" />
                          )}
                          {metric.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hover Border Effect */}
                <div
                  className={`absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-br ${card.color} opacity-0 transition-opacity group-hover:opacity-10`}
                />
              </Link>
            );
          })}
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-10 rounded-xl border border-[#1a1a1a] bg-zinc-900/50 p-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#42CA80]" />
              <span className="text-sm text-[#a1a1aa]">
                <span className="font-semibold text-white">{deals.length}</span> Total Deals
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-[#a1a1aa]">
                <span className="font-semibold text-white">{calls.length}</span> Calls Logged
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-[#a1a1aa]">
                <span className="font-semibold text-white">{projects.length}</span> Projects
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-400" />
              <span className="text-sm text-[#a1a1aa]">
                <span className="font-semibold text-white">{tasks.length}</span> Tasks
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/admin/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1a1a1a] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#252525]"
          >
            Upload Leads
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1a1a1a] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#252525]"
          >
            All Projects
          </Link>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1a1a1a] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#252525]"
          >
            Task Board
          </Link>
        </div>
      </div>
    </div>
  );
}
