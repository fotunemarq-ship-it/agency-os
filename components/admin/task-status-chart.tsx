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

interface TaskStatusData {
  name: string;
  value: number;
  color: string;
}

interface TaskStatusChartProps {
  data: TaskStatusData[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] px-3 py-2 shadow-xl">
        <p className="font-medium text-white">{payload[0].payload.name}</p>
        <p className="text-sm" style={{ color: payload[0].payload.color }}>
          {payload[0].value} tasks
        </p>
      </div>
    );
  }
  return null;
};

export default function TaskStatusChart({ data }: TaskStatusChartProps) {
  if (!data || data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="flex h-[250px] items-center justify-center">
        <p className="text-sm text-[#a1a1aa]">No task data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={data as any}
        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
      >
        <XAxis
          dataKey="name"
          stroke="#a1a1aa"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: "#1a1a1a" }}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={50}
        />
        <YAxis
          stroke="#a1a1aa"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: "#1a1a1a" }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1a1a1a" }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

