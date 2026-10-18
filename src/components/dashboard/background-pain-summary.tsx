import { format } from "date-fns";
import Link from "next/link";
import { formatPainQualityLabels } from "@/lib/constants/episode-options";
import type { BackgroundPainSummary } from "@/lib/analytics/background-pain";
import type { BackgroundPainCheckIn } from "@/lib/types/episodes";
import { btnSecondaryClass, cardClass } from "@/lib/design/ui-classes";
import { cn } from "@/lib/utils";

type BackgroundPainSummaryProps = {
  summary: BackgroundPainSummary;
  checkIns: BackgroundPainCheckIn[];
};

function formatSeverity(value: number | null) {
  return value === null ? "Not enough data" : `${value} / 10`;
}

export function BackgroundPainSummaryPanel({
  summary,
  checkIns,
}: BackgroundPainSummaryProps) {
  return (
    <section className={cn(cardClass, "space-y-5 p-5 md:p-6")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Background pain check-ins</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            These values summarize recorded check-ins only. Missing days are not counted as zero
            pain.
          </p>
        </div>
        <Link href="/check-ins/new" className={btnSecondaryClass}>
          Add check-in
        </Link>
      </div>

      <dl className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-[color:var(--accent)] p-4">
          <dt className="text-xs font-semibold text-[color:var(--muted)]">Recorded check-ins</dt>
          <dd className="mt-1 text-2xl font-bold">{summary.recordedCheckIns}</dd>
        </div>
        <div className="rounded-2xl bg-[color:var(--accent)] p-4">
          <dt className="text-xs font-semibold text-[color:var(--muted)]">Average intensity</dt>
          <dd className="mt-1 text-lg font-bold">{formatSeverity(summary.averageSeverity)}</dd>
        </div>
        <div className="rounded-2xl bg-[color:var(--accent)] p-4">
          <dt className="text-xs font-semibold text-[color:var(--muted)]">Median intensity</dt>
          <dd className="mt-1 text-lg font-bold">{formatSeverity(summary.medianSeverity)}</dd>
        </div>
        <div className="rounded-2xl bg-[color:var(--accent)] p-4">
          <dt className="text-xs font-semibold text-[color:var(--muted)]">Peak intensity</dt>
          <dd className="mt-1 text-lg font-bold">{formatSeverity(summary.peakSeverity)}</dd>
        </div>
      </dl>

      {checkIns.length ? (
        <div>
          <h3 className="text-sm font-semibold">Recent recorded check-ins</h3>
          <ul className="mt-2 divide-y divide-[color:var(--border)]">
            {checkIns.slice(0, 3).map((checkIn) => (
              <li key={checkIn.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <span>{format(new Date(checkIn.recorded_at), "PPp")}</span>
                <span className="font-semibold">{checkIn.severity} / 10</span>
                <span className="w-full text-[color:var(--muted)]">
                  {formatPainQualityLabels(
                    checkIn.pain_qualities,
                    checkIn.pain_quality_other,
                  ) || "No pain description recorded"}
                  {checkIn.functional_impact === null
                    ? ""
                    : ` · Activity impact ${checkIn.functional_impact} / 10`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-[color:var(--muted)]">
          No background pain check-ins were recorded in this date range.
        </p>
      )}
    </section>
  );
}
