import { createServerClient } from "@/lib/supabase";
import SalesPageClient from "./sales-page-client";

// Revalidate this page every 30 seconds to show fresh leads
export const revalidate = 30;

export default async function SalesPage() {
  const supabase = createServerClient();

  // Fetch all leads not closed (in parallel with market insights)
  const [leadsResult, marketInsightsResult, userResult] = await Promise.all([
    supabase
      .from("leads")
      .select("*")
      .not("status", "eq", "closed_won")
      .not("status", "eq", "closed_lost"),
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
    lead_type: lead.lead_type || "outbound",
    source: lead.source || null,
    has_website: lead.has_website,
    website_link: lead.website_link,
  }));

  // Calculate new inbound leads count
  const newInboundCount = processedLeads.filter(
    (l) => l.lead_type === "inbound" && (l.status === "new" || !l.status)
  ).length;

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
    <SalesPageClient
      initialLeads={processedLeads}
      initialMarketInsights={processedMarketInsights}
      userId={user?.id || null}
      newInboundCount={newInboundCount}
    />
  );
}
