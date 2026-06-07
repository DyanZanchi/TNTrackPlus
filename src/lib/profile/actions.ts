"use server";

import { redirect } from "next/navigation";
import { hasSupabaseEnv, isAuthBypassed } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { savePatientPainTypes } from "@/lib/profile/save-pain-types";
import { savePatientTreatments } from "@/lib/profile/save-treatments";
import { resolveSelectedTaxonomyOptions } from "@/lib/taxonomy/server";
import { getProfileRedirectPath } from "@/lib/profile/is-complete";
import { parseProfileFormData } from "@/lib/validation/profile";

export type ProfileActionState = {
  error?: string;
  success?: string;
};

export async function saveProfileAction(
  _previousState: ProfileActionState | undefined,
  formData: FormData,
): Promise<ProfileActionState> {
  const result = parseProfileFormData(formData);

  if (!result.success) {
    const [issue] = result.error.issues;
    return { error: issue?.message ?? "Check the profile details and try again." };
  }

  if (isAuthBypassed()) {
    const redirectTo = getProfileRedirectPath(formData);
    const separator = redirectTo.includes("?") ? "&" : "?";
    redirect(`${redirectTo}${separator}demo=1`);
  }

  if (!hasSupabaseEnv()) {
    return { error: "Supabase is not configured yet. Add the environment variables first." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in to save your profile." };
  }

  const data = result.data;
  const painTypeOptions = await resolveSelectedTaxonomyOptions(
    user.id,
    "pain_type",
    data.pain_type_ids,
  );

  if (painTypeOptions.length !== new Set(data.pain_type_ids).size) {
    return { error: "One or more selected facial pain types are unavailable." };
  }

  const now = new Date().toISOString();

  const { error: profileError } = await supabase.from("patient_profiles").upsert({
    user_id: user.id,
    age: data.age,
    gender: data.gender,
    gender_other: data.gender_other || null,
    updated_at: now,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  const [painTypesResult, treatmentResult] = await Promise.all([
    savePatientPainTypes(supabase, user.id, data.pain_type_ids),
    savePatientTreatments(supabase, user.id, {
      prior_treatments: data.prior_treatments,
      other_therapies: data.other_therapies,
    }),
  ]);

  if (painTypesResult.error) {
    return { error: painTypesResult.error };
  }

  if (treatmentResult.error) {
    return { error: treatmentResult.error };
  }

  const { error: revisionError } = await supabase.from("patient_profile_revisions").insert({
    user_id: user.id,
    age: data.age,
    gender: data.gender,
    gender_other: data.gender_other || null,
    pain_types: painTypeOptions.map((option) => option.label),
    prior_treatments: data.prior_treatments,
    other_therapies: data.other_therapies,
    treatment_history_changed: false,
    source: "profile",
  });

  if (revisionError) {
    return { error: revisionError.message };
  }

  redirect(getProfileRedirectPath(formData));
}
