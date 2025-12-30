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
  Flame,
  Coffee,
  CheckSquare,
  Activity
} from "lucide-react";
import Link from "next/link";
import { generateDailySnapshot } from "@/lib/admin/kpi-logic";

export default async function AdminCommandHub() {
  const supabase = createServerClient();

  // 1. Fetch Alerts
  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  // 2. Fetch/Calculate KPIs
  // In a real high-traffic app, we'd read from 'admin_kpi_snapshots' for today.
  // If missing, generate. For simplicity and freshness, we calculate on load here since traffic is low.
  const kpis: any = await generateDailySnapshot();

  const highAlerts = alerts?.filter((a: any) => a.severity === 'high') || [];
  const otherAlerts = alerts?.filter((a: any) => a.severity !== 'high') || [];

  // Scorecard Config
  const scorecards = [
    {
      title: "Sales Engine",
      icon: Phone,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      href: "/admin/sales",
      metrics: [
        { label: "New Inbound", value: kpis.inbound_new_today },
        { label: "Calls Logged", value: kpis.calls_logged_today },
        { label: "Connected", value: kpis.connected_today },
        { label: "Follow-ups Due", value: kpis.followups_due_today, alert: kpis.followups_missed_today > 0 },
      ]
    },
    {
      title: "Strategy Pipeline",
      icon: Target,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
      href: "/admin/strategy",
      metrics: [
        { label: "Sessions Booked", value: kpis.strategy_booked_today },
        { label: "Deals Won (7d)", value: kpis.deals_won_7d },
        { label: "Win Rate (30d)", value: `${kpis.win_rate_30d}%` },
        { label: "Pipeline Value", value: `₹${(kpis.pipeline_value_open / 100000).toFixed(1)}L` },
      ]
    },
    {
      title: "Delivery Ops",
      icon: Settings,
      color: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
      href: "/admin/operations",
      metrics: [
        { label: "Active Projects", value: kpis.active_projects },
        { label: "Tasks Due Today", value: kpis.tasks_due_today },
        { label: "Overdue Tasks", value: kpis.tasks_overdue, alert: kpis.tasks_overdue > 20 },
        { label: "Stalled Projects", value: kpis.stalled_projects, alert: kpis.stalled_projects > 0 },
      ]
    },
    {
      title: "Client Health",
      icon: Users,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      href: "/admin/delivery", // or specific client page
      metrics: [
        { label: "Pending Approvals", value: kpis.approvals_pending },
        { label: "Approvals Overdue", value: kpis.approvals_overdue, alert: kpis.approvals_overdue > 0 },
        { label: "Change Requests", value: kpis.change_requests_open },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-8">
      <div className="mx-auto max-w-7xl">

        {/* Header & Briefing CTA */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FolderKanban className="h-8 w-8 text-[#42CA80]" />
              Command Hub
            </h1>
            <p className="text-[#a1a1aa] mt-1">Enterprise Operations Center</p>
          </div>
          <Link href="/admin/briefing" className="group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20">
            <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
              <Coffee className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Start Here</p>
              <p className="text-sm font-bold">Daily Briefing</p>
            </div>
            <ArrowRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Alerts Panel */}
        {highAlerts.length > 0 && (
          <div className="mb-8 bg-red-950/20 border border-red-500/20 rounded-2xl p-4 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-2 mb-3 text-red-400 font-bold">
              <Flame className="h-5 w-5" />
              <span>Critical Alerts ({highAlerts.length})</span>
            </div>
            <div className="grid gap-2">
              {highAlerts.map((alert: any) => (
                <div key={alert.id} className="flex items-center justify-between bg-red-900/10 p-3 rounded-lg border border-red-500/10">
                  <span className="text-red-200 text-sm font-medium">{alert.title}: {alert.body}</span>
                  <Link href="/admin/alerts" className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-2 py-1 rounded transition-colors">Resolve</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scorecards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {scorecards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className={`rounded-2xl p-5 border transition-all hover:bg-opacity-20 ${card.bg} flex flex-col h-full`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg bg-[#0f0f0f]/50 ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Link href={card.href} className="text-[#666] hover:text-white transition-colors">
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <h3 className="text-lg font-bold text-white mb-4">{card.title}</h3>
                <div className="space-y-4 flex-1">
                  {card.metrics.map((metric, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm text-[#888]">{metric.label}</span>
                      <span className={`font-mono font-medium ${metric.alert ? "text-red-400" : "text-zinc-200"}`}>
                        {metric.value}
                        {metric.alert && <AlertTriangle className="inline h-3 w-3 ml-1" />}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Secondary Alerts & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent System Alerts */}
          <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#252525] rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#666]" /> System Monitory
              </h2>
              <Link href="/admin/alerts" className="text-sm text-indigo-400 hover:text-indigo-300">View All Alerts</Link>
            </div>
            <div className="space-y-3">
              {otherAlerts.slice(0, 5).map((alert: any) => (
                <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#222] transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <div className="flex-1">
                    <p className="text-sm text-zinc-300 font-medium">{alert.title}</p>
                    <p className="text-xs text-[#666]">{alert.body}</p>
                  </div>
                  <span className="text-xs text-[#666]">{new Date(alert.created_at).toLocaleDateString()}</span>
                </div>
              ))}
              {otherAlerts.length === 0 && <p className="text-sm text-[#666] italic">System operating normally. No warnings.</p>}
            </div>
          </div>

          {/* Admin Quick Actions */}
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-[#666] uppercase tracking-wider mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/admin/upload" className="block w-full text-left p-3 rounded-lg bg-[#0f0f0f] border border-[#252525] text-sm text-zinc-300 hover:border-[#444] transition-colors">
                  📂  Upload Leads CSV
                </Link>
                <Link href="/admin/duplicates" className="block w-full text-left p-3 rounded-lg bg-[#0f0f0f] border border-[#252525] text-sm text-zinc-300 hover:border-[#444] transition-colors">
                  🧹  Clean Duplicates
                </Link>
                <Link href="/admin/automations" className="block w-full text-left p-3 rounded-lg bg-[#0f0f0f] border border-[#252525] text-sm text-zinc-300 hover:border-[#444] transition-colors">
                  ⚡️  Configure Automations
                </Link>
                <Link href="/admin/users" className="block w-full text-left p-3 rounded-lg bg-[#0f0f0f] border border-[#252525] text-sm text-zinc-300 hover:border-[#444] transition-colors">
                  👥  Manage Users
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
