import { createServerClient } from "@/lib/supabase";
import {
  Phone,
  Users,
  TrendingUp,
  ArrowLeft,
  Target,
  Award,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import LeadStatusChart from "@/components/admin/lead-status-chart";
import FunnelChart from "@/components/admin/funnel-chart";

interface Lead {
  id: string;
  status: string | null;
  assigned_sales_exec: string | null;
}

interface CallActivity {
  id: string;
  created_by: string | null;
  lead_id: string | null;
  outcome: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
}

export default async function SalesPage() {
  const supabase = createServerClient();

  // Fetch data in parallel
  const [leadsResult, callsResult, profilesResult] = await Promise.all([
    supabase.from("leads").select("id, status, assigned_sales_exec"),
    supabase.from("call_activities").select("id, created_by, lead_id, outcome, created_at"),
    supabase.from("profiles").select("id, full_name, email"),
  ]);

  const leads: Lead[] = leadsResult.data || [];
  const calls: CallActivity[] = callsResult.data || [];
  const profiles: Profile[] = profilesResult.data || [];

  // Create lookup maps
  const profilesMap = new Map(profiles.map((p) => [p.id, p.full_name || p.email || "Unknown"]));

  // Calculate metrics
  const totalLeads = leads.length;
  const totalCalls = calls.length;

  // Strategy Sessions Booked (qualified or strategy_booked)
  const strategySessionsBooked = leads.filter(
    (l) => l.status === "qualified" || l.status === "strategy_booked"
  ).length;

  // Conversion Rate: Leads that received at least one call / Total Leads
  const leadsWithCalls = new Set(calls.map((c) => c.lead_id).filter(Boolean));
  const callConversionRate = totalLeads > 0 ? (leadsWithCalls.size / totalLeads) * 100 : 0;

  // Lead Status Distribution
  const leadsByStatus = leads.reduce((acc, l) => {
    const status = l.status || "new";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusOrder = [
    { key: "new", label: "New", color: "#6B7280" },
    { key: "first_call_pending", label: "1st Call Pending", color: "#9CA3AF" },
    { key: "calling", label: "Calling", color: "#60A5FA" },
    { key: "contacted", label: "Contacted", color: "#3B82F6" },
    { key: "qualified", label: "Qualified", color: "#8B5CF6" },
    { key: "strategy_booked", label: "Strategy Booked", color: "#A78BFA" },
    { key: "strategy_completed", label: "Strategy Done", color: "#F59E0B" },
    { key: "nurture", label: "Nurture", color: "#FBBF24" },
    { key: "closed_won", label: "Closed Won", color: "#42CA80" },
    { key: "closed_lost", label: "Closed Lost", color: "#EF4444" },
    { key: "disqualified", label: "Disqualified", color: "#DC2626" },
  ];

  const leadStatusChartData = statusOrder
    .map((s) => ({
      name: s.label,
      value: leadsByStatus[s.key] || 0,
      color: s.color,
    }))
    .filter((item) => item.value > 0);

  // Call Outcomes Funnel
  const connectedCalls = calls.filter((c) => 
    c.outcome && !["no_answer", "not_reachable", "busy"].includes(c.outcome)
  ).length;
  const interestedCalls = calls.filter((c) => 
    c.outcome && ["interested", "qualified", "strategy_booked"].includes(c.outcome)
  ).length;
  const sessionsBooked = calls.filter((c) => 
    c.outcome === "strategy_booked"
  ).length;

  const funnelData = [
    { name: "Total Calls", value: totalCalls, color: "#3B82F6" },
    { name: "Connected", value: connectedCalls, color: "#06B6D4" },
    { name: "Interested", value: interestedCalls, color: "#8B5CF6" },
    { name: "Session Booked", value: sessionsBooked, color: "#42CA80" },
  ];

  // Telecaller Leaderboard with Sessions Booked
  const telecallerStats = new Map<string, { calls: number; converted: number; sessions: number }>();

  // Count calls per user
  calls.forEach((call) => {
    const userId = call.created_by || "unknown";
    if (!telecallerStats.has(userId)) {
      telecallerStats.set(userId, { calls: 0, converted: 0, sessions: 0 });
    }
    telecallerStats.get(userId)!.calls += 1;
    if (call.outcome === "strategy_booked") {
      telecallerStats.get(userId)!.sessions += 1;
    }
  });

  // Count converted leads per assigned_sales_exec
  leads
    .filter((l) => l.status === "closed_won" && l.assigned_sales_exec)
    .forEach((lead) => {
      const userId = lead.assigned_sales_exec!;
      if (!telecallerStats.has(userId)) {
        telecallerStats.set(userId, { calls: 0, converted: 0, sessions: 0 });
      }
      telecallerStats.get(userId)!.converted += 1;
    });

  const telecallerLeaderboard = Array.from(telecallerStats.entries())
    .map(([userId, data]) => ({
      name: profilesMap.get(userId) || userId.slice(0, 8) + "...",
      calls: data.calls,
      converted: data.converted,
      sessions: data.sessions,
    }))
    .sort((a, b) => b.calls - a.calls || b.sessions - a.sessions)
    .slice(0, 10);

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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/20">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                Sales Force
              </h1>
              <p className="text-sm text-[#a1a1aa]">Telecaller performance & lead generation</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Leads */}
          <div className="group relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 transition-all hover:border-blue-500/30">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:bg-blue-500/20" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <p className="mt-4 text-sm font-medium uppercase tracking-wider text-[#a1a1aa]">
                Total Leads
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-400">
                {totalLeads.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-[#666]">in the system</p>
            </div>
          </div>

          {/* Calls Logged */}
          <div className="group relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 transition-all hover:border-cyan-500/30">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl transition-all group-hover:bg-cyan-500/20" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20">
                <Phone className="h-6 w-6 text-cyan-400" />
              </div>
              <p className="mt-4 text-sm font-medium uppercase tracking-wider text-[#a1a1aa]">
                Calls Logged
              </p>
              <p className="mt-2 text-3xl font-bold text-cyan-400">
                {totalCalls.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-[#666]">total call activities</p>
            </div>
          </div>

          {/* Strategy Sessions Booked */}
          <div className="group relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 transition-all hover:border-purple-500/30">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl transition-all group-hover:bg-purple-500/20" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
              <p className="mt-4 text-sm font-medium uppercase tracking-wider text-[#a1a1aa]">
                Sessions Booked
              </p>
              <p className="mt-2 text-3xl font-bold text-purple-400">
                {strategySessionsBooked}
              </p>
              <p className="mt-1 text-xs text-[#666]">qualified + booked</p>
            </div>
          </div>

          {/* Contact Rate */}
          <div className="group relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 transition-all hover:border-emerald-500/30">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/20" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
              <p className="mt-4 text-sm font-medium uppercase tracking-wider text-[#a1a1aa]">
                Contact Rate
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-400">
                {callConversionRate.toFixed(1)}%
              </p>
              <p className="mt-1 text-xs text-[#666]">
                {leadsWithCalls.size} leads contacted
              </p>
            </div>
          </div>
        </div>

        {/* Charts & Tables Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Call Outcomes Funnel */}
          <div className="rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Call Outcomes Funnel</h2>
                <p className="text-xs text-[#666]">From calls to sessions booked</p>
              </div>
            </div>
            <FunnelChart data={funnelData} />
          </div>

          {/* Lead Status Distribution */}
          <div className="rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Lead Status Distribution</h2>
                <p className="text-xs text-[#666]">Current pipeline breakdown</p>
              </div>
            </div>
            <LeadStatusChart data={leadStatusChartData} />
          </div>
        </div>

        {/* Telecaller Leaderboard */}
        <div className="mt-6 rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
              <Award className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Telecaller Leaderboard</h2>
              <p className="text-xs text-[#666]">Top performers by call volume & sessions booked</p>
            </div>
          </div>

          {telecallerLeaderboard.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-[#1a1a1a] bg-[#0f0f0f]/50">
              <p className="text-sm text-[#a1a1aa]">No call data yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-[#1a1a1a] bg-[#0f0f0f]">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                      Name
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                      Calls Made
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                      Sessions Booked
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                      Converted
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {telecallerLeaderboard.map((person, index) => (
                    <tr key={index} className="transition-colors hover:bg-[#1a1a1a]/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                              index === 0
                                ? "bg-gradient-to-br from-amber-400 to-yellow-500"
                                : index === 1
                                ? "bg-gradient-to-br from-gray-300 to-gray-400"
                                : index === 2
                                ? "bg-gradient-to-br from-amber-600 to-amber-700"
                                : "bg-[#1a1a1a]"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="font-medium text-white">{person.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-400">
                          <Phone className="h-3 w-3" />
                          {person.calls}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2.5 py-1 text-sm font-semibold text-purple-400">
                          <Calendar className="h-3 w-3" />
                          {person.sessions}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full bg-emerald-500/20 px-2 py-1 text-sm font-semibold text-emerald-400">
                          {person.converted}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
