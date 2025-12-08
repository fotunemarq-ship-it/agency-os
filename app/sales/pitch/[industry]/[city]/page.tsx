import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MarketInsightCard from "@/components/sales/market-insight-card";
import LeadsList from "@/components/sales/leads-list";

interface PitchPageProps {
  params: Promise<{
    industry: string;
    city: string;
  }>;
}

export default async function PitchPage({ params }: PitchPageProps) {
  const { industry, city } = await params;
  const decodedIndustry = decodeURIComponent(industry);
  const decodedCity = decodeURIComponent(city);

  const supabase = createServerClient();

  // Fetch market insights for this industry/city
  const { data: marketInsight } = await supabase
    .from("market_insights")
    .select("*")
    .eq("industry", decodedIndustry)
    .eq("city", decodedCity)
    .single();

  // Fetch leads for this industry/city
  // For now, fetch all leads (will filter by status later)
  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("*")
    .eq("industry", decodedIndustry)
    .eq("city", decodedCity)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/sales"
            className="inline-flex items-center gap-2 text-sm text-[#a1a1aa] transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white md:text-3xl">
            {decodedIndustry} in {decodedCity}
          </h1>
          {leads && (
            <p className="mt-2 text-sm text-[#a1a1aa] md:text-base">
              {leads.length} Lead{leads.length !== 1 ? "s" : ""} to call
            </p>
          )}
        </div>

        {/* Market Insight Card */}
        <div className="mb-6">
          <MarketInsightCard
            industry={decodedIndustry}
            city={decodedCity}
            data={marketInsight || null}
          />
        </div>

        {/* Leads List */}
        <LeadsList
          initialLeads={leads || []}
          industry={decodedIndustry}
          city={decodedCity}
          leadsError={leadsError}
        />
      </div>
    </div>
  );
}

