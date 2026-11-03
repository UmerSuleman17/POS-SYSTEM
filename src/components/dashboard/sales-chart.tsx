"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesChartProps {
  data: { _id: string; revenue: number; count: number }[];
}

export function SalesChart({ data }: SalesChartProps) {
  const chartData = data.map((d) => ({
    date: d._id,
    revenue: d.revenue,
    sales: d.count,
  }));

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-[#17251F] dark:text-[#F4F6F2]">
          Sales Overview
        </CardTitle>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Daily revenue trend across unstitched fabric &amp; readymade sales
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fabricSalesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#245C43" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#245C43" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#71717A" }} />
            <YAxis tick={{ fontSize: 12, fill: "#71717A" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#17251F",
                borderColor: "#245C43",
                borderRadius: "8px",
                color: "#FFFFFF",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#245C43"
              strokeWidth={2.5}
              fill="url(#fabricSalesGradient)"
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
