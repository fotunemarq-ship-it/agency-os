"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ServiceDistributionChartProps {
  data: { name: string; value: number; color: string }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] p-3 shadow-xl">
        <p className="text-sm font-medium text-white">{payload[0].name}</p>
        <p className="text-lg font-bold" style={{ color: payload[0].payload.color }}>
          {payload[0].value} projects
        </p>
      </div>
    );
  }
  return null;
};

export default function ServiceDistributionChart({ data }: ServiceDistributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center rounded-xl border border-dashed border-[#1a1a1a] bg-[#0f0f0f]/50">
        <p className="text-sm text-[#a1a1aa]">No project data</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col items-center">
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-[#a1a1aa]">
              {item.name} ({((item.value / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

