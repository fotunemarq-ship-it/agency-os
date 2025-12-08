"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface RevenueBySourceChartProps {
  data: { name: string; value: number; color: string }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] p-3 shadow-xl">
        <p className="text-sm font-medium text-white">{payload[0].payload.name}</p>
        <p className="text-lg font-bold text-emerald-400">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueBySourceChart({ data }: RevenueBySourceChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-[#1a1a1a] bg-[#0f0f0f]/50">
        <p className="text-sm text-[#a1a1aa]">No revenue data available</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            axisLine={{ stroke: "#1a1a1a" }}
            tickLine={{ stroke: "#1a1a1a" }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            axisLine={{ stroke: "#1a1a1a" }}
            tickLine={{ stroke: "#1a1a1a" }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(66, 202, 128, 0.1)" }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

