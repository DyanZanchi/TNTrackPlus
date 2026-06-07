"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { CHART_THEME } from "@/lib/design/chart-theme";
import type { MonthlyTrendPoint } from "@/lib/types/episodes";

type TrendsChartProps = {
  data: MonthlyTrendPoint[];
};

export function TrendsChart({ data }: TrendsChartProps) {
  return (
    <Card className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Pain over time</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Episode counts and average severity across recent months.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke={CHART_THEME.grid} vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="month" tick={{ fill: "#7a7190", fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: "#7a7190", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e8e2f0",
                  boxShadow: "0 4px 16px rgba(123, 82, 171, 0.1)",
                }}
              />
              <Bar dataKey="episodes" fill={CHART_THEME.primary} radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke={CHART_THEME.grid} vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="month" tick={{ fill: "#7a7190", fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fill: "#7a7190", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e8e2f0",
                  boxShadow: "0 4px 16px rgba(123, 82, 171, 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="averageSeverity"
                stroke={CHART_THEME.secondary}
                strokeWidth={3}
                dot={{ fill: CHART_THEME.primary, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: CHART_THEME.primary }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
