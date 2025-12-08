import { createServerClient } from "@/lib/supabase";
import SalesIntelligenceCockpit from "@/components/sales/sales-intelligence-cockpit";
import { Zap } from "lucide-react";

export default async function SalesPage() {
  const supabase = createServerClient();

  // Fetch all leads not closed (in parallel with market insights)
  const [leadsResult, marketInsightsResult, userResult] = await Promise.all([
    supabase
      .from("leads")
      .select("*")
      .not("status", "eq", "closed_won")
      .not("status", "eq", "closed_lost")
      .order("created_at", { ascending: false }),
    supabase.from("market_insights").select("*"),
    supabase.auth.getUser(),
  ]);

  const leads = leadsResult.data || [];
  const marketInsights = marketInsightsResult.data || [];
  const user = userResult.data?.user;

  if (leadsResult.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4">
        <div className="text-center">
          <p className="text-red-500">Error loading leads: {leadsResult.error.message}</p>
        </div>
      </div>
    );
  }

  // Transform leads to ensure type safety
  const processedLeads = leads.map((lead: any) => ({
    id: lead.id,
    company_name: lead.company_name,
    contact_person: lead.contact_person,
    phone: lead.phone,
    email: lead.email,
    industry: lead.industry,
    city: lead.city,
    status: lead.status,
    notes: lead.notes,
    next_action_date: lead.next_action_date,
    created_at: lead.created_at,
  }));

  // Transform market insights
  const processedMarketInsights = marketInsights.map((mi: any) => ({
    id: mi.id,
    industry: mi.industry,
    city: mi.city,
    search_volume: mi.search_volume,
    market_difficulty: mi.market_difficulty,
    top_competitors: mi.top_competitors,
    pitch_angle: mi.pitch_angle,
  }));

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <div className="border-b border-[#1a1a1a] bg-[#0a0a0a] px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#42CA80] to-[#3ab872] shadow-lg shadow-[#42CA80]/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white sm:text-xl">Sales Intelligence</h1>
              <p className="text-xs text-[#666]">Data-Driven Selling</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-[#1a1a1a] px-3 py-1 text-xs text-[#a1a1aa] sm:inline-flex">
              {processedLeads.length} leads in queue
            </span>
            <span className="rounded-full bg-[#42CA80]/20 px-3 py-1 text-xs font-medium text-[#42CA80]">
              {processedMarketInsights.length} markets analyzed
            </span>
          </div>
        </div>
      </div>

      {/* Sales Intelligence Cockpit */}
      <SalesIntelligenceCockpit
        initialLeads={processedLeads}
        initialMarketInsights={processedMarketInsights}
        userId={user?.id || null}
      />
    </div>
  );
}
