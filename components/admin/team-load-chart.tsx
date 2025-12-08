"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface TeamLoadChartProps {
  data: { name: string; tasks: number }[];
}

const COLORS = ["#42CA80", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899", "#10B981"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] p-3 shadow-xl">
        <p className="text-sm font-medium text-white">{payload[0].payload.name}</p>
        <p className="text-lg font-bold text-blue-400">
          {payload[0].value} tasks
        </p>
      </div>
    );
  }
  return null;
};

export default function TeamLoadChart({ data }: TeamLoadChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-[#1a1a1a] bg-[#0f0f0f]/50">
        <p className="text-sm text-[#a1a1aa]">No task assignment data</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            axisLine={{ stroke: "#1a1a1a" }}
            tickLine={{ stroke: "#1a1a1a" }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            axisLine={{ stroke: "#1a1a1a" }}
            tickLine={{ stroke: "#1a1a1a" }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59, 130, 246, 0.1)" }} />
          <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

