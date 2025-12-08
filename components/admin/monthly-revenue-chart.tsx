"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthlyData {
  name: string;
  value: number;
  fullName: string;
}

interface MonthlyRevenueChartProps {
  data: MonthlyData[];
}

const formatCurrency = (value: number) => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] px-3 py-2 shadow-xl">
        <p className="font-medium text-white">{payload[0].payload.fullName}</p>
        <p className="text-sm text-emerald-400">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  if (!data || data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-[#a1a1aa]">No revenue data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <XAxis
          dataKey="name"
          stroke="#a1a1aa"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: "#1a1a1a" }}
        />
        <YAxis
          stroke="#a1a1aa"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: "#1a1a1a" }}
          tickFormatter={formatCurrency}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1a1a1a" }} />
        <Bar
          dataKey="value"
          fill="url(#revenueGradient)"
          radius={[6, 6, 0, 0]}
          maxBarSize={50}
        />
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#42CA80" />
            <stop offset="100%" stopColor="#3ab872" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}

