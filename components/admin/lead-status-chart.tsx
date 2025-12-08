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

interface LeadStatusData {
  name: string;
  value: number;
  color: string;
}

interface LeadStatusChartProps {
  data: LeadStatusData[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] px-3 py-2 shadow-xl">
        <p className="font-medium text-white">{payload[0].payload.name}</p>
        <p className="text-sm" style={{ color: payload[0].payload.color }}>
          {payload[0].value} leads
        </p>
      </div>
    );
  }
  return null;
};

export default function LeadStatusChart({ data }: LeadStatusChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-[#a1a1aa]">No lead data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
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
          fontSize={10}
          tickLine={false}
          axisLine={{ stroke: "#1a1a1a" }}
          width={100}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1a1a1a" }} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={25}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

