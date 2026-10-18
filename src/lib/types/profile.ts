import {
  CLINICIAN_EVALUATION_OPTIONS,
  DIAGNOSIS_STATUS_OPTIONS,
  GENDER_OPTIONS,
  OTHER_THERAPY_OPTIONS,
  PATIENT_PAIN_PATTERN_OPTIONS,
  PRIOR_TREATMENT_OPTIONS,
  RELEVANT_HISTORY_OPTIONS,
} from "@/lib/constants/profile-options";
import type { DescribedPatternStatus } from "@/lib/classification/patient-described-patterns";
import type { HeadachePatternStatus } from "@/lib/classification/headache-patterns";
import type { YesNoUnsureOption } from "@/lib/types/episodes";
export type GenderOption = (typeof GENDER_OPTIONS)[number];
export type PatientPainPattern = (typeof PATIENT_PAIN_PATTERN_OPTIONS)[number];
export type PriorTreatmentOption = (typeof PRIOR_TREATMENT_OPTIONS)[number];
export type OtherTherapyOption = (typeof OTHER_THERAPY_OPTIONS)[number];
export type ClinicianEvaluationOption = (typeof CLINICIAN_EVALUATION_OPTIONS)[number];
export type DiagnosisStatusOption = (typeof DIAGNOSIS_STATUS_OPTIONS)[number];
export type RelevantHistoryOption = (typeof RELEVANT_HISTORY_OPTIONS)[number];

export type RelevantHistoryEvent = {
  event_type: RelevantHistoryOption;
  event_date: string | null;
  event_date_unknown: boolean;
  symptoms_began_afterward: YesNoUnsureOption | null;
  notes: string | null;
};

export type PriorTreatmentEntry = {
  treatment_type: PriorTreatmentOption;
  other_label: string | null;
};

export type OtherTherapyEntry = {
  therapy_type: OtherTherapyOption;
  other_label: string | null;
};

export type PatientProfile = {
  user_id: string;
  age: number | null;
  gender: GenderOption | null;
  gender_other: string | null;
  current_pain_pattern: PatientPainPattern | null;
  clinician_evaluation_status: ClinicianEvaluationOption | null;
  received_facial_pain_diagnosis: DiagnosisStatusOption | null;
  additional_undiagnosed_pain: DiagnosisStatusOption | null;
  pain_type_option_ids: string[];
  prior_treatments: PriorTreatmentEntry[];
  other_therapies: OtherTherapyEntry[];
  relevant_history_events: RelevantHistoryEvent[];
  described_patterns: Array<{
    pattern_key: string;
    status: DescribedPatternStatus;
  }>;
  headache_patterns: Array<{
    pattern_key: string;
    status: HeadachePatternStatus;
    long_course: "yes" | "no" | null;
    autonomic_symptoms: "yes" | "no" | null;
  }>;
  updated_at: string | null;
};
