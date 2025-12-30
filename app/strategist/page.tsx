import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import StrategistPipeline from "@/components/strategist/strategist-pipeline";

export default async function StrategistDashboardPage() {
  const supabase = createServerClient();

  // Fetch leads in the strategist pipeline (active)
  const { data: activeLeads, error } = await supabase
    .from("leads")
    .select("*")
    .in("status", ["qualified", "strategy_booked", "strategy_completed"])
    .order("created_at", { ascending: false });

  // Fetch closed won leads
  const { data: closedWonLeads } = await supabase
    .from("leads")
    .select("*")
    .eq("status", "closed_won")
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch closed lost leads
  const { data: closedLostLeads } = await supabase
    .from("leads")
    .select("*")
    .eq("status", "closed_lost")
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch recent call activities for follow-up tracking
  const { data: activities } = await supabase
    .from("call_activities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4">
        <div className="text-center">
          <p className="text-red-500">Error loading leads: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Strategist Dashboard</h1>
          <Link
            href="/strategist/deals"
            className="px-4 py-2 bg-[#42CA80] text-black font-medium rounded-lg hover:bg-[#3ab872] transition-colors"
          >
            Manage All Deals
          </Link>
        </div>

        <StrategistPipeline
          initialLeads={activeLeads || []}
          closedWonLeads={closedWonLeads || []}
          closedLostLeads={closedLostLeads || []}
          callActivities={activities || []}
        />
      </div>
    </div>
  );
}
