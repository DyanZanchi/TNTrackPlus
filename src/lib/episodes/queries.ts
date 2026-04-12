import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DashboardFilters, EpisodeRecord } from "@/lib/types/episodes";
import { buildFilterQuery } from "@/lib/analytics/episodes";
import { isEpisodeFaceArea } from "@/lib/constants/episode-options";

type EpisodeRelationRow = {
  face_area_options?: { normalized_label?: string | null } | null;
  trigger_options?: { label?: string | null } | null;
  medication_options?: { label?: string | null } | null;
};

type EpisodeQueryRow = {
  id: string;
  user_id: string;
  pain_type: EpisodeRecord["pain_type"];
  face_area: string;
  severity: number;
  duration_seconds: number;
  onset_at: string;
  notes: string | null;
  created_at: string;
  episode_face_areas?: EpisodeRelationRow[] | null;
  episode_triggers?: EpisodeRelationRow[] | null;
  episode_medications?: EpisodeRelationRow[] | null;
};

function mapEpisodeRow(row: EpisodeQueryRow): EpisodeRecord {
  const faceAreas = (row.episode_face_areas ?? [])
    .map((item) => item.face_area_options?.normalized_label)
    .filter((label): label is string => Boolean(label))
    .filter(isEpisodeFaceArea);

  return {
    id: row.id,
    user_id: row.user_id,
    pain_type: row.pain_type,
    face_areas: faceAreas.length
      ? faceAreas
      : isEpisodeFaceArea(row.face_area)
        ? [row.face_area]
        : [],
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
        face_area,
        severity,
        duration_seconds,
        onset_at,
        notes,
        created_at,
        episode_face_areas (
          face_area_options (
            normalized_label
          )
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
