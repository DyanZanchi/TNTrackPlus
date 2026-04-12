"use server";

import { redirect } from "next/navigation";
import { FACE_AREA_OPTION_IDS, LEGACY_MULTIPLE_AREAS } from "@/lib/constants/episode-options";
import { isAuthBypassed, hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveSelectedTaxonomyOptions } from "@/lib/taxonomy/server";
import { hasExclusiveNoMedication } from "@/lib/taxonomy/shared";
import { episodeSchema } from "@/lib/validation/episode";

export type EpisodeActionState = {
  error?: string;
  success?: string;
};

export async function createEpisodeAction(
  _previousState: EpisodeActionState | undefined,
  formData: FormData,
): Promise<EpisodeActionState> {
  const values = {
    pain_type: formData.get("pain_type"),
    face_areas: formData.getAll("face_areas"),
    severity: formData.get("severity"),
    duration_hms: formData.get("duration_hms"),
    onset_at: formData.get("onset_at"),
    trigger_ids: formData.getAll("trigger_ids"),
    medication_ids: formData.getAll("medication_ids"),
    notes: formData.get("notes"),
  };

  const result = episodeSchema.safeParse(values);

  if (!result.success) {
    const [issue] = result.error.issues;
    return { error: issue?.message ?? "Check the episode details and try again." };
  }

  if (isAuthBypassed()) {
    redirect("/dashboard?created=1&demo=1");
  }

  if (!hasSupabaseEnv()) {
    return { error: "Supabase is not configured yet. Add the environment variables first." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in to save an episode." };
  }

  if (hasExclusiveNoMedication(result.data.medication_ids)) {
    return { error: "Choose either 'No medication' or one or more medications, not both." };
  }

  const [triggerOptions, medicationOptions] = await Promise.all([
    resolveSelectedTaxonomyOptions(user.id, "trigger", result.data.trigger_ids),
    resolveSelectedTaxonomyOptions(user.id, "medication", result.data.medication_ids),
  ]);

  if (triggerOptions.length !== new Set(result.data.trigger_ids).size) {
    return { error: "One or more selected triggers are unavailable." };
  }

  if (medicationOptions.length !== new Set(result.data.medication_ids).size) {
    return { error: "One or more selected medications are unavailable." };
  }

  const { data: episode, error } = await supabase
    .from("episodes")
    .insert({
      user_id: user.id,
      pain_type: result.data.pain_type,
      face_area:
        result.data.face_areas.length === 1 ? result.data.face_areas[0] : LEGACY_MULTIPLE_AREAS,
      severity: result.data.severity,
      duration_minutes: Math.max(1, Math.ceil(result.data.duration_hms / 60)),
      duration_seconds: result.data.duration_hms,
      onset_at: result.data.onset_at,
      notes: result.data.notes || null,
      trigger_name: null,
      medication_taken: null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  const episodeId = episode.id;

  if (triggerOptions.length) {
    const { error: triggerError } = await supabase.from("episode_triggers").insert(
      triggerOptions.map((option) => ({
        episode_id: episodeId,
        trigger_option_id: option.id,
      })),
    );

    if (triggerError) {
      return { error: triggerError.message };
    }
  }

  if (result.data.face_areas.length) {
    const { error: faceAreaError } = await supabase.from("episode_face_areas").insert(
      result.data.face_areas.map((faceArea) => ({
        episode_id: episodeId,
        face_area_option_id: FACE_AREA_OPTION_IDS[faceArea],
      })),
    );

    if (faceAreaError) {
      return { error: faceAreaError.message };
    }
  }

  if (medicationOptions.length) {
    const { error: medicationError } = await supabase.from("episode_medications").insert(
      medicationOptions.map((option) => ({
        episode_id: episodeId,
        medication_option_id: option.id,
      })),
    );

    if (medicationError) {
      return { error: medicationError.message };
    }
  }

  redirect("/dashboard?created=1");
}
