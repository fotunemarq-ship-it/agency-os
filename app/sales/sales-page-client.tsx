"use client";

import { useState } from "react";
import SalesIntelligenceCockpit, {
  type Lead,
  type MarketInsight,
} from "@/components/sales/sales-intelligence-cockpit";
import SalesLeadTypeSwitcher, {
  LeadTypeContext,
  type LeadType,
} from "@/components/sales/sales-lead-type-switcher";

interface SalesPageClientProps {
  initialLeads: Lead[];
  initialMarketInsights: MarketInsight[];
  userId: string | null;
  newInboundCount: number;
}

export default function SalesPageClient({
  initialLeads,
  initialMarketInsights,
  userId,
  newInboundCount,
}: SalesPageClientProps) {
  const [activeLeadType, setActiveLeadType] = useState<LeadType>("outbound");

  return (
    <LeadTypeContext.Provider value={{ activeLeadType, setActiveLeadType }}>
      <div className="min-h-screen bg-[#0f0f0f]">
        {/* Header with Lead Type Switcher */}
        <SalesLeadTypeSwitcher
          newInboundCount={newInboundCount}
          activeLeadType={activeLeadType}
          setActiveLeadType={setActiveLeadType}
        />

        {/* Sales Intelligence Cockpit */}
        <SalesIntelligenceCockpit
          initialLeads={initialLeads}
          initialMarketInsights={initialMarketInsights}
          userId={userId}
        />
      </div>
    </LeadTypeContext.Provider>
  );
}
