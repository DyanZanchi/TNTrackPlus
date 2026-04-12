import { Card } from "@/components/ui/card";
import type { DashboardSummary } from "@/lib/types/episodes";
import { formatDurationSeconds } from "@/lib/utils";

type MetricsCardsProps = {
  summary: DashboardSummary;
};

export function MetricsCards({ summary }: MetricsCardsProps) {
  const cards = [
    { label: "Episodes", value: summary.totalEpisodes.toString() },
    {
      label: "Average duration",
      value: summary.averageDurationSeconds
        ? formatDurationSeconds(summary.averageDurationSeconds)
        : "0 sec",
    },
    { label: "Average severity", value: summary.averageSeverity ? `${summary.averageSeverity} / 10` : "0 / 10" },
    { label: "Top trigger", value: summary.topTrigger },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <p className="text-sm text-[color:var(--muted)]">{card.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{card.value}</p>
        </Card>
      ))}
    </div>
  );
}
