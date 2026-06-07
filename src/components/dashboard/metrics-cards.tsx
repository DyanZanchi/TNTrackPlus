import { Card } from "@/components/ui/card";
import { IconDuration, IconEpisodes, IconSeverity, IconTrigger } from "@/components/ui/icons";
import type { DashboardSummary } from "@/lib/types/episodes";
import { formatDurationSeconds } from "@/lib/utils";

type MetricsCardsProps = {
  summary: DashboardSummary;
};

const ICON_STYLES = [
  "bg-[color:var(--accent)] text-[color:var(--primary)]",
  "bg-[#e8f0fa] text-[#5b7eb8]",
  "bg-[#fdf0e8] text-[color:var(--severity-mid)]",
  "bg-[#f0e8fa] text-[color:var(--primary)]",
];

export function MetricsCards({ summary }: MetricsCardsProps) {
  const cards = [
    { label: "Episodes", value: summary.totalEpisodes.toString(), icon: IconEpisodes },
    {
      label: "Average duration",
      value: summary.averageDurationSeconds
        ? formatDurationSeconds(summary.averageDurationSeconds)
        : "0 sec",
      icon: IconDuration,
    },
    {
      label: "Average severity",
      value: summary.averageSeverity ? `${summary.averageSeverity} / 10` : "0 / 10",
      icon: IconSeverity,
    },
    { label: "Top trigger", value: summary.topTrigger, icon: IconTrigger },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card key={card.label} className="flex items-center gap-4 p-5">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ICON_STYLES[index]}`}
            >
              <Icon />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold tracking-tight">{card.value}</p>
              <p className="text-sm text-[color:var(--muted)]">{card.label}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
