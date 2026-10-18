import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  isDescribedPatternKey,
  isDescribedPatternStatus,
  type DescribedPatternStatus,
} from "@/lib/classification/patient-described-patterns";
import {
  isHeadachePatternKey,
  isHeadachePatternStatus,
  type HeadachePatternStatus,
} from "@/lib/classification/headache-patterns";
import type {
  ClinicianEvaluationOption,
  DiagnosisStatusOption,
  GenderOption,
  OtherTherapyOption,
  PatientProfile,
  PatientPainPattern,
  PriorTreatmentOption,
  RelevantHistoryEvent,
} from "@/lib/types/profile";

type ProfileRow = {
  user_id: string;
  age: number | null;
  gender: GenderOption | null;
  gender_other: string | null;
  clinician_evaluation_status: ClinicianEvaluationOption | null;
  received_facial_pain_diagnosis: DiagnosisStatusOption | null;
  additional_undiagnosed_pain: DiagnosisStatusOption | null;
  updated_at: string;
};

type PatientPainTypeRow = {
  pain_type_option_id: string;
};

type PatientPainPatternRow = {
  pattern_type: PatientPainPattern;
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
  current_pain_pattern: null,
  clinician_evaluation_status: null,
  received_facial_pain_diagnosis: null,
  additional_undiagnosed_pain: null,
  pain_type_option_ids: [],
  prior_treatments: [],
  other_therapies: [],
  relevant_history_events: [],
  described_patterns: [],
  headache_patterns: [],
  updated_at: null,
};

export async function getProfileForUser(userId: string): Promise<PatientProfile> {
  const supabase = await createSupabaseServerClient();

  const [
    profileResult,
    priorTreatmentsResult,
    otherTherapiesResult,
    painTypesResult,
    painPatternResult,
    historyResult,
    describedPatternsResult,
    headachePatternsResult,
  ] =
    await Promise.all([
      supabase
        .from("patient_profiles")
        .select(
          "user_id, age, gender, gender_other, clinician_evaluation_status, received_facial_pain_diagnosis, additional_undiagnosed_pain, updated_at",
        )
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
      supabase
        .from("patient_pain_pattern_history")
        .select("pattern_type")
        .eq("user_id", userId)
        .is("effective_to", null)
        .maybeSingle(),
      supabase
        .from("relevant_history_events")
        .select("event_type, event_date, event_date_unknown, symptoms_began_afterward, notes")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
      supabase.from("patient_described_patterns").select("pattern_key, status").eq("user_id", userId),
      supabase
        .from("patient_headache_patterns")
        .select("pattern_key, status, long_course, autonomic_symptoms")
        .eq("user_id", userId),
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

  if (painPatternResult.error) {
    throw new Error(painPatternResult.error.message);
  }

  if (historyResult.error) {
    throw new Error(historyResult.error.message);
  }

  if (describedPatternsResult.error) {
    throw new Error(describedPatternsResult.error.message);
  }

  if (headachePatternsResult.error) {
    throw new Error(headachePatternsResult.error.message);
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
    current_pain_pattern:
      (painPatternResult.data as PatientPainPatternRow | null)?.pattern_type ?? null,
    clinician_evaluation_status: profile.clinician_evaluation_status,
    received_facial_pain_diagnosis: profile.received_facial_pain_diagnosis,
    additional_undiagnosed_pain: profile.additional_undiagnosed_pain,
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
    relevant_history_events: ((historyResult.data ?? []) as RelevantHistoryEvent[]).map((entry) => ({
      event_type: entry.event_type,
      event_date: entry.event_date,
      event_date_unknown: entry.event_date_unknown,
      symptoms_began_afterward: entry.symptoms_began_afterward,
      notes: entry.notes,
    })),
    described_patterns: ((describedPatternsResult.data ?? []) as Array<{
      pattern_key: string;
      status: string;
    }>)
      .filter(
        (entry) =>
          isDescribedPatternKey(entry.pattern_key) && isDescribedPatternStatus(entry.status),
      )
      .map((entry) => ({
        pattern_key: entry.pattern_key,
        status: entry.status as DescribedPatternStatus,
      })),
    headache_patterns: ((headachePatternsResult.data ?? []) as Array<{
      pattern_key: string;
      status: string;
      long_course: "yes" | "no" | null;
      autonomic_symptoms: "yes" | "no" | null;
    }>)
      .filter(
        (entry) => isHeadachePatternKey(entry.pattern_key) && isHeadachePatternStatus(entry.status),
      )
      .map((entry) => ({
        pattern_key: entry.pattern_key,
        status: entry.status as HeadachePatternStatus,
        long_course: entry.long_course,
        autonomic_symptoms: entry.autonomic_symptoms,
      })),
    updated_at: profile.updated_at,
  };
}
