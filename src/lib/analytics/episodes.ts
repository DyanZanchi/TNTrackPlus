import {
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { EPISODE_FACE_AREA_LABELS } from "@/lib/constants/episode-options";
import type {
  CategoryCount,
  DashboardFilters,
  DashboardSummary,
  EpisodeRecord,
  MonthlyTrendPoint,
} from "@/lib/types/episodes";

type DateRange = {
  start: Date;
  end: Date;
};

export function resolveDateRange(filters: DashboardFilters): DateRange {
  const now = new Date();
  const range = filters.range;

  if (range === "90d") {
    return { start: subDays(now, 89), end: now };
  }

  if (range === "month") {
    return { start: startOfMonth(now), end: endOfMonth(now) };
  }

  if (range === "custom" && filters.start && filters.end) {
    return {
      start: new Date(`${filters.start}T00:00:00`),
      end: new Date(`${filters.end}T23:59:59`),
    };
  }

  return { start: subDays(now, 29), end: now };
}

export function buildFilterQuery(filters: DashboardFilters) {
  const { start, end } = resolveDateRange(filters);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

export function summarizeEpisodes(episodes: EpisodeRecord[]): DashboardSummary {
  if (!episodes.length) {
    return {
      totalEpisodes: 0,
      averageDurationSeconds: 0,
      averageSeverity: 0,
      topTrigger: "No entries yet",
    };
  }

  const durationTotal = episodes.reduce((total, episode) => total + episode.duration_seconds, 0);
  const severityTotal = episodes.reduce((total, episode) => total + episode.severity, 0);
  const triggerCounts = countByLabel(episodes.flatMap((episode) => episode.trigger_labels));

  return {
    totalEpisodes: episodes.length,
    averageDurationSeconds: Math.round(durationTotal / episodes.length),
    averageSeverity: Number((severityTotal / episodes.length).toFixed(1)),
    topTrigger: triggerCounts[0]?.label ?? "No entries yet",
  };
}

export function buildMonthlyTrend(episodes: EpisodeRecord[], months = 6): MonthlyTrendPoint[] {
  const monthKeys = Array.from({ length: months }, (_, index) => {
    const month = subMonths(startOfMonth(new Date()), months - index - 1);
    return format(month, "yyyy-MM");
  });

  return monthKeys.map((monthKey) => {
    const matches = episodes.filter((episode) => format(parseISO(episode.onset_at), "yyyy-MM") === monthKey);
    const avgSeverity = matches.length
      ? matches.reduce((total, episode) => total + episode.severity, 0) / matches.length
      : 0;

    return {
      month: format(parseISO(`${monthKey}-01`), "MMM"),
      episodes: matches.length,
      averageSeverity: Number(avgSeverity.toFixed(1)),
    };
  });
}

export function buildTriggerCounts(episodes: EpisodeRecord[]): CategoryCount[] {
  return countByLabel(episodes.flatMap((episode) => episode.trigger_labels));
}

export function buildFaceAreaCounts(episodes: EpisodeRecord[]): CategoryCount[] {
  return countByLabel(
    episodes.flatMap((episode) =>
      episode.face_areas.map((faceArea) => EPISODE_FACE_AREA_LABELS[faceArea]),
    ),
  );
}

export function buildMedicationCounts(episodes: EpisodeRecord[]): CategoryCount[] {
  return countByLabel(episodes.flatMap((episode) => episode.medication_labels));
}

function countByLabel(values: string[]): CategoryCount[] {
  const counts = values.reduce<Record<string, number>>((accumulator, value) => {
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value);
}
