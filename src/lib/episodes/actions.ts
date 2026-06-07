"use server";

import { redirect } from "next/navigation";
import { FACE_AREA_OPTION_IDS, LEGACY_MULTIPLE_AREAS } from "@/lib/constants/episode-options";
import { getProfileForUser } from "@/lib/profile/queries";
import { savePatientTreatments } from "@/lib/profile/save-treatments";
import { parseTreatmentFormData, type TreatmentFieldsData } from "@/lib/validation/treatment";
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
    face_points: formData.get("face_points"),
    pain_pattern: formData.get("pain_pattern"),
    pulse_duration_hms: formData.get("pulse_duration_hms"),
    severity: formData.get("severity"),
    duration_hms: formData.get("duration_hms"),
    onset_at: formData.get("onset_at"),
    trigger_ids: formData.getAll("trigger_ids"),
    medication_ids: formData.getAll("medication_ids"),
    notes: formData.get("notes"),
    treatment_history_changed: formData.get("treatment_history_changed"),
  };

  const result = episodeSchema.safeParse(values);

  if (!result.success) {
    const [issue] = result.error.issues;
    return { error: issue?.message ?? "Check the episode details and try again." };
  }

  let treatmentUpdate: TreatmentFieldsData | undefined;

  if (result.data.treatment_history_changed) {
    const treatmentResult = parseTreatmentFormData(formData);

    if (!treatmentResult.success) {
      const [issue] = treatmentResult.error.issues;
      return { error: issue?.message ?? "Check the treatment details and try again." };
    }

    treatmentUpdate = treatmentResult.data;
  }

  if (isAuthBypassed()) {
    const demoParams = new URLSearchParams({ created: "1", demo: "1" });

    if (result.data.treatment_history_changed) {
      demoParams.set("treatment_changed", "1");
    }

    redirect(`/dashboard?${demoParams.toString()}`);
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
      pain_pattern: result.data.pain_pattern,
      pulse_duration_seconds: result.data.pulse_duration_seconds,
      face_area:
        result.data.face_areas.length === 1 ? result.data.face_areas[0] : LEGACY_MULTIPLE_AREAS,
      severity: result.data.severity,
      duration_minutes: Math.max(1, Math.ceil(result.data.duration_hms / 60)),
      duration_seconds: result.data.duration_hms,
      onset_at: result.data.onset_at,
      notes: result.data.notes || null,
      treatment_history_changed: result.data.treatment_history_changed,
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

  if (result.data.face_points.length) {
    const { error: facePointError } = await supabase.from("episode_face_points").insert(
      result.data.face_points.map((point) => ({
        episode_id: episodeId,
        x: point.x,
        y: point.y,
        division: point.division,
        location_key: point.location,
        location_label: point.label,
      })),
    );

    if (facePointError) {
      return { error: facePointError.message };
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

  if (result.data.treatment_history_changed && treatmentUpdate) {
    const treatmentSaveResult = await savePatientTreatments(supabase, user.id, treatmentUpdate);

    if (treatmentSaveResult.error) {
      return { error: treatmentSaveResult.error };
    }

    const profile = await getProfileForUser(user.id);

    const { error: revisionError } = await supabase.from("patient_profile_revisions").insert({
      user_id: user.id,
      age: profile.age,
      gender: profile.gender,
      gender_other: profile.gender_other,
      prior_treatments: treatmentUpdate.prior_treatments,
      other_therapies: treatmentUpdate.other_therapies,
      treatment_history_changed: true,
      source: "episode",
    });

    if (revisionError) {
      return { error: revisionError.message };
    }
  }

  const redirectParams = new URLSearchParams({ created: "1" });

  if (result.data.treatment_history_changed) {
    redirectParams.set("treatment_changed", "1");
  }

  redirect(`/dashboard?${redirectParams.toString()}`);
}
