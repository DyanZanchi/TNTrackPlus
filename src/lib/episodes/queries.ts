import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  DashboardFilters,
  EpisodeRecord,
  EpisodeTreatmentHistorySnapshot,
  FaceAreaOption,
} from "@/lib/types/episodes";
import { buildFilterQuery } from "@/lib/analytics/episodes";
import {
  BUILTIN_PAIN_TYPE_OPTIONS,
  isDurationStatusOption,
  isEpisodeFaceArea,
  isNumbnessOption,
  isNumbnessTimingOption,
  isPainQualityOption,
  isThrobbingAssociationOption,
  isYesNoUnsureOption,
} from "@/lib/constants/episode-options";
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
  pain_qualities: string[] | null;
  pain_quality_other: string | null;
  had_numbness: string | null;
  numbness_location: string | null;
  numbness_onset_date: string | null;
  numbness_onset_unknown: boolean | null;
  numbness_after_procedure: string | null;
  numbness_procedure_note: string | null;
  numbness_timing: string | null;
  throbbing_associations: string[] | null;
  pain_pattern: EpisodeRecord["pain_pattern"];
  pulse_duration_seconds: number | null;
  face_area: string;
  severity: number;
  functional_impact: number | null;
  background_severity_before: number | null;
  duration_status: string | null;
  duration_seconds: number | null;
  pain_changed_during: string | null;
  pain_change_summary: string | null;
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
    pain_qualities: (row.pain_qualities ?? []).filter(isPainQualityOption),
    pain_quality_other: row.pain_quality_other,
    had_numbness: row.had_numbness && isNumbnessOption(row.had_numbness) ? row.had_numbness : null,
    numbness_location: row.numbness_location,
    numbness_onset_date: row.numbness_onset_date,
    numbness_onset_unknown: row.numbness_onset_unknown ?? false,
    numbness_after_procedure:
      row.numbness_after_procedure && isYesNoUnsureOption(row.numbness_after_procedure)
        ? row.numbness_after_procedure
        : null,
    numbness_procedure_note: row.numbness_procedure_note,
    numbness_timing:
      row.numbness_timing && isNumbnessTimingOption(row.numbness_timing)
        ? row.numbness_timing
        : null,
    throbbing_associations: (row.throbbing_associations ?? []).filter(isThrobbingAssociationOption),
    pain_pattern: row.pain_pattern ?? "continuous",
    pulse_duration_seconds: row.pulse_duration_seconds,
    face_areas: derivedFaceAreas,
    face_points: facePoints,
    severity: row.severity,
    functional_impact: row.functional_impact,
    background_severity_before: row.background_severity_before,
    duration_status:
      row.duration_status && isDurationStatusOption(row.duration_status)
        ? row.duration_status
        : "known",
    duration_seconds: row.duration_seconds,
    pain_changed_during:
      row.pain_changed_during && isYesNoUnsureOption(row.pain_changed_during)
        ? row.pain_changed_during
        : null,
    pain_change_summary: row.pain_change_summary,
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
        pain_qualities,
        pain_quality_other,
        had_numbness,
        numbness_location,
        numbness_onset_date,
        numbness_onset_unknown,
        numbness_after_procedure,
        numbness_procedure_note,
        numbness_timing,
        throbbing_associations,
        pain_pattern,
        pulse_duration_seconds,
        face_area,
        severity,
        functional_impact,
        background_severity_before,
        duration_status,
        duration_seconds,
        pain_changed_during,
        pain_change_summary,
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
