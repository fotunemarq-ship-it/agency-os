"use client";

import clsx from "clsx";

interface FunnelChartProps {
  data: { name: string; value: number; color: string }[];
}

export default function FunnelChart({ data }: FunnelChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-[#1a1a1a] bg-[#0f0f0f]/50">
        <p className="text-sm text-[#a1a1aa]">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const widthPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const isFirst = index === 0;
        const isLast = index === data.length - 1;

        return (
          <div key={item.name} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-white">{item.name}</span>
              <span className="text-sm font-bold" style={{ color: item.color }}>
                {item.value.toLocaleString()}
              </span>
            </div>
            <div className="relative h-10 w-full">
              <div
                className={clsx(
                  "absolute inset-y-0 left-0 flex items-center justify-end pr-3 transition-all",
                  isFirst ? "rounded-lg" : isLast ? "rounded-lg" : "rounded-lg"
                )}
                style={{
                  width: `${Math.max(widthPercent, 10)}%`,
                  backgroundColor: `${item.color}20`,
                  borderLeft: `4px solid ${item.color}`,
                }}
              >
                {widthPercent > 30 && (
                  <span className="text-xs font-semibold" style={{ color: item.color }}>
                    {((item.value / (data[0]?.value || 1)) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            {index < data.length - 1 && (
              <div className="ml-4 mt-1 flex items-center gap-2">
                <div className="h-4 w-px bg-[#333]" />
                <span className="text-[10px] text-[#666]">
                  {data[index + 1] && data[index].value > 0
                    ? `${((data[index + 1].value / data[index].value) * 100).toFixed(0)}% conversion`
                    : ""}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

