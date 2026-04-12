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
import type { MonthlyTrendPoint } from "@/lib/types/episodes";

type TrendsChartProps = {
  data: MonthlyTrendPoint[];
};

export function TrendsChart({ data }: TrendsChartProps) {
  return (
    <Card className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Monthly trends</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Episode counts and average severity across recent months.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="#e5eaf5" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="episodes" fill="#3156d3" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#e5eaf5" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line type="monotone" dataKey="averageSeverity" stroke="#7b61ff" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
