"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { CHART_THEME } from "@/lib/design/chart-theme";
import type { CategoryCount } from "@/lib/types/episodes";

type TopTriggersProps = {
  data: CategoryCount[];
};

export function TopTriggers({ data }: TopTriggersProps) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold">Most common triggers</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Which triggers appear most often in the current filter window.
        </p>
      </div>

      {data.length ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke={CHART_THEME.grid} vertical={false} strokeDasharray="4 4" />
              <XAxis
                dataKey="label"
                angle={-20}
                textAnchor="end"
                height={70}
                interval={0}
                tick={{ fill: "#7a7190", fontSize: 11 }}
              />
              <YAxis allowDecimals={false} tick={{ fill: "#7a7190", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e8e2f0",
                  boxShadow: "0 4px 16px rgba(123, 82, 171, 0.1)",
                }}
              />
              <Bar dataKey="value" fill={CHART_THEME.primary} radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="rounded-2xl bg-[color:var(--accent)] px-4 py-3 text-sm text-[color:var(--muted)]">
          Add a few episode entries to see trigger patterns here.
        </p>
      )}
    </Card>
  );
}
