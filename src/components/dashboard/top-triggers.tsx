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
import type { CategoryCount } from "@/lib/types/episodes";

type TopTriggersProps = {
  data: CategoryCount[];
};

export function TopTriggers({ data }: TopTriggersProps) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Most common triggers</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Which triggers appear most often in the current filter window.
        </p>
      </div>

      {data.length ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="#e5eaf5" vertical={false} />
              <XAxis dataKey="label" angle={-20} textAnchor="end" height={70} interval={0} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3156d3" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="rounded-xl bg-[color:var(--accent)] px-4 py-3 text-sm text-[color:var(--muted)]">
          Add a few episode entries to see trigger patterns here.
        </p>
      )}
    </Card>
  );
}
