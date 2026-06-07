"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { CHART_THEME } from "@/lib/design/chart-theme";
import type { CategoryCount } from "@/lib/types/episodes";

type FaceAreaChartProps = {
  data: CategoryCount[];
};

export function FaceAreaChart({ data }: FaceAreaChartProps) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold">Pain locations on face</h2>
        <p className="text-sm text-[color:var(--muted)]">
          How often each area was reported, with the relevant trigeminal division (V1, V2, or V3).
        </p>
      </div>

      {data.length ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.label} fill={CHART_THEME.palette[index % CHART_THEME.palette.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e8e2f0",
                  boxShadow: "0 4px 16px rgba(123, 82, 171, 0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="rounded-2xl bg-[color:var(--accent)] px-4 py-3 text-sm text-[color:var(--muted)]">
          Add a few episode entries to see face-area patterns here.
        </p>
      )}
    </Card>
  );
}
