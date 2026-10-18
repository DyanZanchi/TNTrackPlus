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
    clinician_evaluation_status: data.clinician_evaluation_status,
    received_facial_pain_diagnosis: data.received_facial_pain_diagnosis,
    additional_undiagnosed_pain: data.additional_undiagnosed_pain,
    updated_at: now,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  if (data.pain_pattern) {
    const { error: painPatternError } = await supabase.rpc("set_current_pain_pattern", {
      requested_pattern_type: data.pain_pattern,
      requested_effective_from: new Date().toISOString().slice(0, 10),
    });

    if (painPatternError) {
      return { error: painPatternError.message };
    }
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

  const { error: historyDeleteError } = await supabase
    .from("relevant_history_events")
    .delete()
    .eq("user_id", user.id);

  if (historyDeleteError) {
    return { error: historyDeleteError.message };
  }

  const { error: describedDeleteError } = await supabase
    .from("patient_described_patterns")
    .delete()
    .eq("user_id", user.id);

  if (describedDeleteError) {
    return { error: describedDeleteError.message };
  }

  if (data.described_patterns.length) {
    const { error: describedInsertError } = await supabase.from("patient_described_patterns").insert(
      data.described_patterns.map((pattern) => ({
        user_id: user.id,
        pattern_key: pattern.pattern_key,
        status: pattern.status,
      })),
    );

    if (describedInsertError) {
      return { error: describedInsertError.message };
    }
  }

  const { error: headacheDeleteError } = await supabase
    .from("patient_headache_patterns")
    .delete()
    .eq("user_id", user.id);

  if (headacheDeleteError) {
    return { error: headacheDeleteError.message };
  }

  if (data.headache_patterns.length) {
    const { error: headacheInsertError } = await supabase.from("patient_headache_patterns").insert(
      data.headache_patterns.map((pattern) => ({
        user_id: user.id,
        pattern_key: pattern.pattern_key,
        status: pattern.status,
        long_course: pattern.long_course,
        autonomic_symptoms: pattern.autonomic_symptoms,
        updated_at: now,
      })),
    );

    if (headacheInsertError) {
      return { error: headacheInsertError.message };
    }
  }

  if (data.relevant_history_events.length) {
    const { error: historyInsertError } = await supabase.from("relevant_history_events").insert(
      data.relevant_history_events.map((event) => ({
        user_id: user.id,
        event_type: event.event_type,
        event_date: event.event_date,
        event_date_unknown: event.event_date_unknown,
        symptoms_began_afterward: event.symptoms_began_afterward,
        notes: event.notes,
      })),
    );

    if (historyInsertError) {
      return { error: historyInsertError.message };
    }
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
