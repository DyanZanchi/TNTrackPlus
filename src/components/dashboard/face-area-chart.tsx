"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import type { CategoryCount } from "@/lib/types/episodes";

const COLORS = ["#3156d3", "#7b61ff", "#4ea8de", "#95d5b2", "#f4a261", "#ef476f", "#8d99ae"];

type FaceAreaChartProps = {
  data: CategoryCount[];
};

export function FaceAreaChart({ data }: FaceAreaChartProps) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Most affected face areas</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Relative distribution of where episodes were reported.
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
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="rounded-xl bg-[color:var(--accent)] px-4 py-3 text-sm text-[color:var(--muted)]">
          Add a few episode entries to see face-area patterns here.
        </p>
      )}
    </Card>
  );
}
