"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { Zap, Flame, RefreshCw } from "lucide-react";
import clsx from "clsx";

export type LeadType = "outbound" | "inbound";

export const LeadTypeContext = createContext<{
  activeLeadType: LeadType;
  setActiveLeadType: (type: LeadType) => void;
}>({
  activeLeadType: "outbound",
  setActiveLeadType: () => {},
});

export const useLeadType = () => useContext(LeadTypeContext);

interface SalesLeadTypeSwitcherProps {
  newInboundCount: number;
  activeLeadType: LeadType;
  setActiveLeadType: (type: LeadType) => void;
}

export default function SalesLeadTypeSwitcher({
  newInboundCount,
  activeLeadType,
  setActiveLeadType,
}: SalesLeadTypeSwitcherProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
      {/* Tab Switcher */}
      <div className="px-4 pt-3 pb-2 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveLeadType("outbound")}
            className={clsx(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
              activeLeadType === "outbound"
                ? "bg-[#1a1a1a] text-white shadow-md"
                : "text-[#666] hover:text-white hover:bg-[#0f0f0f]"
            )}
          >
            <Zap className="h-4 w-4" />
            <span>Outbound / Cold</span>
          </button>
          <button
            onClick={() => setActiveLeadType("inbound")}
            className={clsx(
              "relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
              activeLeadType === "inbound"
                ? "bg-[#1a1a1a] text-white shadow-md"
                : "text-[#666] hover:text-white hover:bg-[#0f0f0f]"
            )}
          >
            <Flame className="h-4 w-4" />
            <span>Inbound / Hot</span>
            {newInboundCount > 0 && (
              <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                {newInboundCount > 99 ? "99+" : newInboundCount}
              </span>
              )}
            </button>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded-lg border border-[#1a1a1a] bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-[#a1a1aa] transition-colors hover:border-[#42CA80]/50 hover:bg-[#1a1a1a] hover:text-white"
            title="Refresh leads"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="px-4 pb-3 sm:px-6 sm:pb-4">
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
        </div>
      </div>
    </div>
  );
}
