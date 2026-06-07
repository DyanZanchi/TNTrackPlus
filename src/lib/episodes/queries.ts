import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  DashboardFilters,
  EpisodeRecord,
  EpisodeTreatmentHistorySnapshot,
  FaceAreaOption,
} from "@/lib/types/episodes";
import { buildFilterQuery } from "@/lib/analytics/episodes";
import { BUILTIN_PAIN_TYPE_OPTIONS, isEpisodeFaceArea } from "@/lib/constants/episode-options";
import type { FaceLocationKey, FaceMapPoint } from "@/lib/face-map/types";

type EpisodeRelationRow = {
  face_area_options?: { normalized_label?: string | null } | null;
  trigger_options?: { label?: string | null } | null;
  medication_options?: { label?: string | null } | null;
};

type EpisodePainTypeRow = {
  pain_type_options?: { label?: string | null } | null;
};

type EpisodeFacePointRow = {
  x: number;
  y: number;
  division: FaceAreaOption;
  location_key: FaceLocationKey;
  location_label: string;
};

type EpisodeQueryRow = {
  id: string;
  user_id: string;
  pain_type: string;
  pain_pattern: EpisodeRecord["pain_pattern"];
  pulse_duration_seconds: number | null;
  face_area: string;
  severity: number;
  duration_seconds: number;
  onset_at: string;
  notes: string | null;
  treatment_history_changed: boolean | null;
  treatment_change_date: string | null;
  treatment_history_snapshot: EpisodeTreatmentHistorySnapshot | null;
  created_at: string;
  episode_face_areas?: EpisodeRelationRow[] | null;
  episode_face_points?: EpisodeFacePointRow[] | null;
  episode_triggers?: EpisodeRelationRow[] | null;
  episode_medications?: EpisodeRelationRow[] | null;
  episode_pain_types?: EpisodePainTypeRow[] | null;
};

function mapEpisodeRow(row: EpisodeQueryRow): EpisodeRecord {
  const facePoints: FaceMapPoint[] = (row.episode_face_points ?? []).map((point) => ({
    x: Number(point.x),
    y: Number(point.y),
    division: point.division,
    location: point.location_key,
    label: point.location_label,
  }));

  const faceAreas = (row.episode_face_areas ?? [])
    .map((item) => item.face_area_options?.normalized_label)
    .filter((label): label is string => Boolean(label))
    .filter(isEpisodeFaceArea);

  const derivedFaceAreas = facePoints.length
    ? Array.from(new Set(facePoints.map((point) => point.division)))
    : faceAreas.length
      ? faceAreas
      : isEpisodeFaceArea(row.face_area)
        ? [row.face_area]
        : [];

  const painTypeLabels = (row.episode_pain_types ?? [])
    .map((item) => item.pain_type_options?.label)
    .filter((label): label is string => Boolean(label));

  const legacyPainTypeLabel =
    BUILTIN_PAIN_TYPE_OPTIONS.find((option) => option.normalized_label === row.pain_type)?.label ??
    row.pain_type;

  return {
    id: row.id,
    user_id: row.user_id,
    pain_type_labels: painTypeLabels.length ? painTypeLabels : [legacyPainTypeLabel],
    pain_pattern: row.pain_pattern ?? "continuous",
    pulse_duration_seconds: row.pulse_duration_seconds,
    face_areas: derivedFaceAreas,
    face_points: facePoints,
    severity: row.severity,
    duration_seconds: row.duration_seconds,
    onset_at: row.onset_at,
    trigger_labels: (row.episode_triggers ?? [])
      .map((item) => item.trigger_options?.label)
      .filter((label): label is string => Boolean(label)),
    medication_labels: (row.episode_medications ?? [])
      .map((item) => item.medication_options?.label)
      .filter((label): label is string => Boolean(label)),
    notes: row.notes,
    treatment_history_changed: row.treatment_history_changed ?? false,
    treatment_change_date: row.treatment_change_date,
    treatment_history_snapshot: row.treatment_history_snapshot,
    created_at: row.created_at,
  };
}

export async function getEpisodesForUser(userId: string, filters: DashboardFilters) {
  const { startIso, endIso } = buildFilterQuery(filters);
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("episodes")
    .select(
      `
        id,
        user_id,
        pain_type,
        pain_pattern,
        pulse_duration_seconds,
        face_area,
        severity,
        duration_seconds,
        onset_at,
        notes,
        treatment_history_changed,
        treatment_change_date,
        treatment_history_snapshot,
        created_at,
        episode_face_areas (
          face_area_options (
            normalized_label
          )
        ),
        episode_face_points (
          x,
          y,
          division,
          location_key,
          location_label
        ),
        episode_triggers (
          trigger_options (
            label
          )
        ),
        episode_medications (
          medication_options (
            label
          )
        ),
        episode_pain_types (
          pain_type_options (
            label
          )
        )
      `,
    )
    .eq("user_id", userId)
    .gte("onset_at", startIso)
    .lte("onset_at", endIso)
    .order("onset_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as EpisodeQueryRow[]).map(mapEpisodeRow);
}
