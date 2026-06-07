import {
  GENDER_OPTIONS,
  OTHER_THERAPY_OPTIONS,
  PRIOR_TREATMENT_OPTIONS,
} from "@/lib/constants/profile-options";
export type GenderOption = (typeof GENDER_OPTIONS)[number];
export type PriorTreatmentOption = (typeof PRIOR_TREATMENT_OPTIONS)[number];
export type OtherTherapyOption = (typeof OTHER_THERAPY_OPTIONS)[number];

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
  pain_type_option_ids: string[];
  prior_treatments: PriorTreatmentEntry[];
  other_therapies: OtherTherapyEntry[];
  updated_at: string | null;
};
