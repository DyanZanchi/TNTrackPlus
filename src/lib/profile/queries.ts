import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  GenderOption,
  OtherTherapyEntry,
  OtherTherapyOption,
  PatientProfile,
  PriorTreatmentEntry,
  PriorTreatmentOption,
} from "@/lib/types/profile";

type ProfileRow = {
  user_id: string;
  age: number | null;
  gender: GenderOption | null;
  gender_other: string | null;
  updated_at: string;
};

type PatientPainTypeRow = {
  pain_type_option_id: string;
};

type PriorTreatmentRow = {
  treatment_type: PriorTreatmentOption;
  other_label: string | null;
};

type OtherTherapyRow = {
  therapy_type: OtherTherapyOption;
  other_label: string | null;
};

const EMPTY_PROFILE: PatientProfile = {
  user_id: "",
  age: null,
  gender: null,
  gender_other: null,
  pain_type_option_ids: [],
  prior_treatments: [],
  other_therapies: [],
  updated_at: null,
};

export async function getProfileForUser(userId: string): Promise<PatientProfile> {
  const supabase = await createSupabaseServerClient();

  const [profileResult, priorTreatmentsResult, otherTherapiesResult, painTypesResult] =
    await Promise.all([
      supabase
        .from("patient_profiles")
        .select("user_id, age, gender, gender_other, updated_at")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("patient_prior_treatments")
        .select("treatment_type, other_label")
        .eq("user_id", userId),
      supabase
        .from("patient_other_therapies")
        .select("therapy_type, other_label")
        .eq("user_id", userId),
      supabase.from("patient_pain_types").select("pain_type_option_id").eq("user_id", userId),
    ]);

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  if (priorTreatmentsResult.error) {
    throw new Error(priorTreatmentsResult.error.message);
  }

  if (otherTherapiesResult.error) {
    throw new Error(otherTherapiesResult.error.message);
  }

  if (painTypesResult.error) {
    throw new Error(painTypesResult.error.message);
  }

  const profile = profileResult.data as ProfileRow | null;

  if (!profile) {
    return { ...EMPTY_PROFILE, user_id: userId };
  }

  return {
    user_id: profile.user_id,
    age: profile.age,
    gender: profile.gender,
    gender_other: profile.gender_other,
    pain_type_option_ids: ((painTypesResult.data ?? []) as PatientPainTypeRow[]).map(
      (entry) => entry.pain_type_option_id,
    ),
    prior_treatments: ((priorTreatmentsResult.data ?? []) as PriorTreatmentRow[]).map((entry) => ({
      treatment_type: entry.treatment_type,
      other_label: entry.other_label,
    })),
    other_therapies: ((otherTherapiesResult.data ?? []) as OtherTherapyRow[]).map((entry) => ({
      therapy_type: entry.therapy_type,
      other_label: entry.other_label,
    })),
    updated_at: profile.updated_at,
  };
}
