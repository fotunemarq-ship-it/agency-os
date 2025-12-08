"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import LeadCallRow from "./lead-call-row";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

interface LeadsListProps {
  initialLeads: Lead[];
  industry: string;
  city: string;
  leadsError?: any;
}

export default function LeadsList({
  initialLeads,
  industry,
  city,
  leadsError,
}: LeadsListProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleCallOutcome = async () => {
    setIsRefreshing(true);
    try {
      // Refetch leads from Supabase
      const supabase = createClient();
      const { data: refreshedLeads, error } = await supabase
        .from("leads")
        .select("*")
        .eq("industry", industry)
        .eq("city", city)
        .order("created_at", { ascending: false });

      if (!error && refreshedLeads) {
        setLeads(refreshedLeads);
      }
      // Also refresh the page to ensure server state is updated
      router.refresh();
    } catch (error) {
      console.error("Error refreshing leads:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Update leads when initialLeads changes (after router.refresh())
  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  if (leadsError) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-center">
        <p className="text-sm text-red-500">
          Error loading leads: {leadsError.message}
        </p>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#1a1a1a] p-8 text-center">
        <p className="text-[#a1a1aa]">No leads found for this segment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <LeadCallRow
          key={lead.id}
          lead={lead}
          onCallOutcome={handleCallOutcome}
        />
      ))}
    </div>
  );
}

