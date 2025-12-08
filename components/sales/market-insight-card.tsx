import type { Database } from "@/types/database.types";

type MarketInsight = Database["public"]["Tables"]["market_insights"]["Row"];

interface MarketInsightCardProps {
  industry: string;
  city: string;
  data?: MarketInsight | null;
}

export default function MarketInsightCard({
  industry,
  city,
  data,
}: MarketInsightCardProps) {
  return (
    <div className="w-full rounded-lg border-l-4 border-[#42CA80] bg-[#1a1a1a] p-4 shadow-sm">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[#a1a1aa]">Industry</p>
          <p className="text-base font-semibold text-white">{industry}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-[#a1a1aa]">City</p>
          <p className="text-base font-semibold text-white">{city}</p>
        </div>

        {data ? (
          <>
            {data.search_volume && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#a1a1aa]">Search Volume</p>
                <p className="text-base text-white">{data.search_volume}</p>
              </div>
            )}

            {data.market_difficulty && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#a1a1aa]">Competition</p>
                <p className="text-base text-white">{data.market_difficulty}</p>
              </div>
            )}

            {data.pitch_angle && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#a1a1aa]">Pitch Tip</p>
                <p className="text-base text-white">{data.pitch_angle}</p>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-md bg-[#0f0f0f] p-3">
            <p className="text-sm text-[#a1a1aa]">
              No market data available for this segment yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

