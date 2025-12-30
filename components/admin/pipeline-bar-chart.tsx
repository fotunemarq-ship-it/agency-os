"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface PipelineData {
  name: string;
  value: number;
  fullName: string;
}

interface PipelineBarChartProps {
  data: PipelineData[];
}

const STAGE_COLORS: Record<string, string> = {
  new: "#6B7280",           // Gray
  first_call_pending: "#9CA3AF", // Light Gray
  calling: "#60A5FA",       // Light Blue
  contacted: "#3B82F6",     // Blue
  qualified: "#8B5CF6",     // Purple
  strategy_booked: "#A78BFA", // Light Purple
  strategy_completed: "#F59E0B", // Amber
  nurture: "#FBBF24",       // Yellow
  closed_won: "#42CA80",    // Green
  closed_lost: "#EF4444",   // Red
  disqualified: "#DC2626",  // Dark Red
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] px-3 py-2 shadow-xl">
        <p className="font-medium text-white">{payload[0].payload.fullName}</p>
        <p className="text-sm text-[#42CA80]">{payload[0].value} leads</p>
      </div>
    );
  }
  return null;
};

export default function PipelineBarChart({ data }: PipelineBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-[#a1a1aa]">No pipeline data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data as any}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis
          type="number"
          stroke="#a1a1aa"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: "#1a1a1a" }}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#a1a1aa"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: "#1a1a1a" }}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1a1a1a" }} />
        <Bar
          dataKey="value"
          radius={[0, 4, 4, 0]}
          maxBarSize={30}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={STAGE_COLORS[entry.name.toLowerCase().replace(/ /g, "_")] || "#42CA80"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

