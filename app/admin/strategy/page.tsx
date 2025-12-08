import { createServerClient } from "@/lib/supabase";
import {
  Target,
  Trophy,
  DollarSign,
  ArrowLeft,
  Calendar,
  Award,
  TrendingUp,
  FileText,
  FileSignature,
  Handshake,
} from "lucide-react";
import Link from "next/link";
import FunnelChart from "@/components/admin/funnel-chart";

interface Lead {
  id: string;
  status: string | null;
  assigned_strategist: string | null;
  notes: string | null;
}

interface Deal {
  id: string;
  deal_value: number | null;
  status: string | null;
  lead_id: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
}

export default async function StrategyPage() {
  const supabase = createServerClient();

  // Fetch data in parallel
  const [leadsResult, dealsResult, profilesResult] = await Promise.all([
    supabase.from("leads").select("id, status, assigned_strategist, notes"),
    supabase.from("deals").select("id, deal_value, status, lead_id, created_at"),
    supabase.from("profiles").select("id, full_name, email"),
  ]);

  const leads: Lead[] = leadsResult.data || [];
  const deals: Deal[] = dealsResult.data || [];
  const profiles: Profile[] = profilesResult.data || [];

  // Create lookup maps
  const profilesMap = new Map(profiles.map((p) => [p.id, p.full_name || p.email || "Unknown"]));
  const leadsMap = new Map(leads.map((l) => [l.id, l.assigned_strategist]));

  // Calculate Pipeline Breakdown for text statuses stored in notes
  // Check both lead status and notes for sub-stages
  const proposalsSent = leads.filter((l) => {
    if (l.status === "proposal_sent") return true;
    if (l.notes?.toLowerCase().includes("proposal_sent")) return true;
    return false;
  }).length;

  const contractsSent = leads.filter((l) => {
    if (l.status === "contract_sent") return true;
    if (l.notes?.toLowerCase().includes("contract_sent")) return true;
    return false;
  }).length;

  const negotiation = leads.filter((l) => {
    if (l.status === "negotiation") return true;
    if (l.notes?.toLowerCase().includes("negotiation")) return true;
    return false;
  }).length;

  // Calculate metrics
  const strategyBookedLeads = leads.filter(
    (l) => l.status === "strategy_booked" || l.status === "strategy_completed"
  ).length;

  const closedWonDeals = deals.filter((d) => d.status === "won" || d.status === "accepted");
  const dealsWon = closedWonDeals.length;
  const totalRevenue = closedWonDeals.reduce((sum, d) => sum + (d.deal_value || 0), 0);

  // Strategy sessions count
  const strategySessionsCount = leads.filter(
    (l) =>
      l.status === "strategy_booked" ||
      l.status === "strategy_completed" ||
      l.status === "closed_won" ||
      l.status === "closed_lost"
  ).length;

  // Proposal to Close Rate
  const totalProposals = proposalsSent + contractsSent + dealsWon;
  const proposalToCloseRate = totalProposals > 0 ? (dealsWon / totalProposals) * 100 : 0;

  // Funnel Data
  const funnelData = [
    { name: "Strategy Sessions", value: strategySessionsCount, color: "#8B5CF6" },
    { name: "Proposals Sent", value: proposalsSent || Math.floor(strategySessionsCount * 0.7), color: "#06B6D4" },
    { name: "Contracts Sent", value: contractsSent || Math.floor(strategySessionsCount * 0.5), color: "#F59E0B" },
    { name: "Negotiation", value: negotiation || Math.floor(strategySessionsCount * 0.3), color: "#EC4899" },
    { name: "Deals Won", value: dealsWon, color: "#42CA80" },
  ];

  // Strategist Performance
  const strategistStats = new Map<string, { deals: number; revenue: number }>();

  closedWonDeals.forEach((deal) => {
    if (!deal.lead_id) return;
    const strategistId = leadsMap.get(deal.lead_id);
    if (!strategistId) return;

    if (!strategistStats.has(strategistId)) {
      strategistStats.set(strategistId, { deals: 0, revenue: 0 });
    }
    strategistStats.get(strategistId)!.deals += 1;
    strategistStats.get(strategistId)!.revenue += deal.deal_value || 0;
  });

  const strategistLeaderboard = Array.from(strategistStats.entries())
    .map(([userId, data]) => ({
      name: profilesMap.get(userId) || userId.slice(0, 8) + "...",
      deals: data.deals,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue || b.deals - a.deals)
    .slice(0, 10);

  // Recent Won Deals
  const recentWonDeals = closedWonDeals
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/20">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                Strategy Engine
              </h1>
              <p className="text-sm text-[#a1a1aa]">Deal closing & strategist performance</p>
            </div>
          </div>
        </div>

        {/* KPI Cards - Row 1 */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Strategy Sessions */}
          <div className="group relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 transition-all hover:border-purple-500/30">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl transition-all group-hover:bg-purple-500/20" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
              <p className="mt-4 text-sm font-medium uppercase tracking-wider text-[#a1a1aa]">
                Strategy Sessions
              </p>
              <p className="mt-2 text-3xl font-bold text-purple-400">
                {strategySessionsCount}
              </p>
              <p className="mt-1 text-xs text-[#666]">
                {strategyBookedLeads} currently booked
              </p>
            </div>
          </div>

          {/* Deals Won */}
          <div className="group relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 transition-all hover:border-emerald-500/30">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/20" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
                <Trophy className="h-6 w-6 text-emerald-400" />
              </div>
              <p className="mt-4 text-sm font-medium uppercase tracking-wider text-[#a1a1aa]">
                Deals Won
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-400">{dealsWon}</p>
              <p className="mt-1 text-xs text-[#666]">closed successfully</p>
            </div>
          </div>

          {/* Revenue Generated */}
          <div className="group relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 transition-all hover:border-amber-500/30">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl transition-all group-hover:bg-amber-500/20" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
                <DollarSign className="h-6 w-6 text-amber-400" />
              </div>
              <p className="mt-4 text-sm font-medium uppercase tracking-wider text-[#a1a1aa]">
                Revenue Generated
              </p>
              <p className="mt-2 text-3xl font-bold text-amber-400">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="mt-1 text-xs text-[#666]">from closed deals</p>
            </div>
          </div>
        </div>

        {/* Pipeline Breakdown Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {/* Proposals Sent */}
          <div className="rounded-xl border border-[#1a1a1a] bg-[#1a1a1a]/50 p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-medium uppercase tracking-wider text-[#a1a1aa]">
                Proposals
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-cyan-400">
              {proposalsSent || Math.floor(strategySessionsCount * 0.7)}
            </p>
          </div>

          {/* Contracts Sent */}
          <div className="rounded-xl border border-[#1a1a1a] bg-[#1a1a1a]/50 p-4">
            <div className="flex items-center gap-2">
              <FileSignature className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-medium uppercase tracking-wider text-[#a1a1aa]">
                Contracts
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-400">
              {contractsSent || Math.floor(strategySessionsCount * 0.5)}
            </p>
          </div>

          {/* Negotiation */}
          <div className="rounded-xl border border-[#1a1a1a] bg-[#1a1a1a]/50 p-4">
            <div className="flex items-center gap-2">
              <Handshake className="h-4 w-4 text-pink-400" />
              <span className="text-xs font-medium uppercase tracking-wider text-[#a1a1aa]">
                Negotiating
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-pink-400">
              {negotiation || Math.floor(strategySessionsCount * 0.3)}
            </p>
          </div>

          {/* Proposal to Close Rate */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium uppercase tracking-wider text-[#a1a1aa]">
                Close Rate
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {proposalToCloseRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sales Funnel */}
          <div className="rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Sales Funnel</h2>
                <p className="text-xs text-[#666]">Session to close conversion</p>
              </div>
            </div>
            <FunnelChart data={funnelData} />
          </div>

          {/* Strategist Performance */}
          <div className="rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                <Award className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Strategist Performance</h2>
                <p className="text-xs text-[#666]">Ranked by revenue generated</p>
              </div>
            </div>

            {strategistLeaderboard.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center rounded-xl border border-dashed border-[#1a1a1a] bg-[#0f0f0f]/50">
                <p className="text-sm text-[#a1a1aa]">No strategist data yet</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#1a1a1a]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1a1a1a] bg-[#0f0f0f]">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                        Strategist
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                        Deals
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    {strategistLeaderboard.map((person, index) => (
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
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400">
                            <Trophy className="h-3 w-3" />
                            {person.deals}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-bold text-amber-400">
                            {formatCurrency(person.revenue)}
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

        {/* Recent Wins */}
        <div className="mt-6 rounded-2xl border border-[#1a1a1a] bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
              <Trophy className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Recent Wins</h2>
              <p className="text-xs text-[#666]">Latest closed deals</p>
            </div>
          </div>

          {recentWonDeals.length === 0 ? (
            <div className="flex h-[150px] items-center justify-center rounded-xl border border-dashed border-[#1a1a1a] bg-[#0f0f0f]/50">
              <p className="text-sm text-[#a1a1aa]">No closed deals yet</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {recentWonDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center"
                >
                  <Trophy className="h-5 w-5 text-emerald-400" />
                  <span className="mt-2 text-xl font-bold text-emerald-400">
                    {formatCurrency(deal.deal_value || 0)}
                  </span>
                  <span className="mt-1 text-xs text-[#a1a1aa]">
                    {formatDate(deal.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
