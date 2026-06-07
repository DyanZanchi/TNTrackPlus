import { format } from "date-fns";
import { NextResponse } from "next/server";
import { PAIN_TYPE_LABELS, formatFaceAreaLabels } from "@/lib/constants/episode-options";
import { formatPainPatternDescription } from "@/lib/episodes/pain-pattern";
import { formatTreatmentHistoryChange } from "@/lib/profile/format-treatment-change";
import { formatFacePointLabels } from "@/lib/face-map/format";
import { buildFilterQuery } from "@/lib/analytics/episodes";
import { DEMO_EPISODES } from "@/lib/demo/episodes";
import { hasSupabaseEnv, isAuthBypassed } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getEpisodesForUser } from "@/lib/episodes/queries";
import type { DashboardFilters, EpisodeRecord, RangeKey } from "@/lib/types/episodes";
import { formatDurationHms } from "@/lib/utils";

const VALID_RANGES: RangeKey[] = ["30d", "90d", "month", "custom"];

function parseFilters(request: Request): DashboardFilters {
  const { searchParams } = new URL(request.url);
  const rangeParam = searchParams.get("range") ?? "30d";

  return {
    range: VALID_RANGES.includes(rangeParam as RangeKey) ? (rangeParam as RangeKey) : "30d",
    start: searchParams.get("start") ?? undefined,
    end: searchParams.get("end") ?? undefined,
  };
}

function toCsv(episodes: EpisodeRecord[]) {
  const header = [
    "onset_at",
    "pain_type",
    "face_areas",
    "pain_locations",
    "pain_pattern",
    "pulse_duration_hms",
    "severity",
    "duration_hms",
    "duration_seconds",
    "triggers",
    "medications",
    "notes",
  ];

  const rows = episodes.map((episode) => [
    format(new Date(episode.onset_at), "yyyy-MM-dd HH:mm"),
    PAIN_TYPE_LABELS[episode.pain_type],
    formatFaceAreaLabels(episode.face_areas),
    episode.face_points.length ? formatFacePointLabels(episode.face_points) : "",
    formatPainPatternDescription(episode.pain_pattern, episode.pulse_duration_seconds),
    episode.pulse_duration_seconds ? formatDurationHms(episode.pulse_duration_seconds) : "",
    String(episode.severity),
    formatDurationHms(episode.duration_seconds),
    String(episode.duration_seconds),
    episode.trigger_labels.join("; "),
    episode.medication_labels.join("; "),
    (episode.notes ?? "").replaceAll('"', '""'),
    episode.treatment_history_changed ? "yes" : "no",
    episode.treatment_change_date ?? "",
    episode.treatment_history_changed
      ? formatTreatmentHistoryChange(
          episode.treatment_history_snapshot,
          episode.treatment_change_date,
        )
      : "",
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
}

export async function GET(request: Request) {
  if (!isAuthBypassed() && !hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase environment variables are missing." },
      { status: 503 },
    );
  }

  const filters = parseFilters(request);
  const { startIso, endIso } = buildFilterQuery(filters);

  if (isAuthBypassed()) {
    const csv = toCsv(
      DEMO_EPISODES.filter((episode) => episode.onset_at >= startIso && episode.onset_at <= endIso),
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="tn-episodes-demo.csv"',
      },
    });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const csv = toCsv(await getEpisodesForUser(user.id, filters));

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="tn-episodes.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export episodes." },
      { status: 500 },
    );
  }
}
