import { buildFilterQuery } from "@/lib/analytics/episodes";
import { isPainQualityOption } from "@/lib/constants/episode-options";
import type { FaceLocationKey } from "@/lib/face-map/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  BackgroundPainCheckIn,
  DashboardFilters,
  FaceAreaOption,
} from "@/lib/types/episodes";

type BackgroundFacePointRow = {
  x: number;
  y: number;
  division: FaceAreaOption;
  location_key: FaceLocationKey;
  location_label: string;
};

type BackgroundCheckInRow = {
  id: string;
  user_id: string;
  recorded_at: string;
  severity: number;
  functional_impact: number | null;
  pain_qualities: string[] | null;
  pain_quality_other: string | null;
  notes: string | null;
  created_at: string;
  background_pain_check_in_face_points?: BackgroundFacePointRow[] | null;
};

export async function getBackgroundPainCheckInsForUser(
  userId: string,
  filters: DashboardFilters,
): Promise<BackgroundPainCheckIn[]> {
  const { startIso, endIso } = buildFilterQuery(filters);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("background_pain_check_ins")
    .select(
      `
        id,
        user_id,
        recorded_at,
        severity,
        functional_impact,
        pain_qualities,
        pain_quality_other,
        notes,
        created_at,
        background_pain_check_in_face_points (
          x,
          y,
          division,
          location_key,
          location_label
        )
      `,
    )
    .eq("user_id", userId)
    .gte("recorded_at", startIso)
    .lte("recorded_at", endIso)
    .order("recorded_at", { ascending: false });

  if (error) {
    const message = error.message ?? "";
    const missingTable =
      error.code === "PGRST205" ||
      error.code === "42P01" ||
      /schema cache|does not exist|could not find the table/i.test(message);
    if (missingTable) {
      return [];
    }
    throw new Error(error.message);
  }

  return ((data ?? []) as BackgroundCheckInRow[]).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    recorded_at: row.recorded_at,
    severity: row.severity,
    functional_impact: row.functional_impact,
    pain_qualities: (row.pain_qualities ?? []).filter(isPainQualityOption),
    pain_quality_other: row.pain_quality_other,
    face_points: (row.background_pain_check_in_face_points ?? []).map((point) => ({
      x: Number(point.x),
      y: Number(point.y),
      division: point.division,
      location: point.location_key,
      label: point.location_label,
    })),
    notes: row.notes,
    created_at: row.created_at,
  }));
}
