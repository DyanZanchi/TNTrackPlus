export const GENDER_OPTIONS = [
  "female",
  "male",
  "non_binary",
  "prefer_not_to_say",
  "other",
] as const;

export const PATIENT_PAIN_PATTERN_OPTIONS = [
  "episodes_with_pain_free_periods",
  "continuous_background",
  "continuous_with_episodes",
  "varies_unsure",
] as const;

export const PATIENT_PAIN_PATTERN_LABELS: Record<
  (typeof PATIENT_PAIN_PATTERN_OPTIONS)[number],
  string
> = {
  episodes_with_pain_free_periods:
    "I have episodes of pain with pain-free periods between them.",
  continuous_background:
    "I have continuous/background pain that is present most or all of the time.",
  continuous_with_episodes: "I have continuous/background pain with episodes of worse pain.",
  varies_unsure: "My pain pattern varies / I'm not sure.",
};

export const PRIOR_TREATMENT_OPTIONS = [
  "mvd",
  "glycerin_rhizotomy",
  "radiofrequency",
  "balloon_rhizotomy",
  "gamma_knife",
  "cyberknife",
  "other",
] as const;

export const CLINICIAN_EVALUATION_OPTIONS = [
  "yes",
  "no",
  "prefer_not_to_say",
  "not_sure",
] as const;

export const CLINICIAN_EVALUATION_LABELS: Record<
  (typeof CLINICIAN_EVALUATION_OPTIONS)[number],
  string
> = {
  yes: "Yes",
  no: "No",
  prefer_not_to_say: "Prefer not to say",
  not_sure: "Not sure",
};

export const DIAGNOSIS_STATUS_OPTIONS = ["yes", "no", "not_sure"] as const;

export const DIAGNOSIS_STATUS_LABELS: Record<(typeof DIAGNOSIS_STATUS_OPTIONS)[number], string> = {
  yes: "Yes",
  no: "No",
  not_sure: "Not sure",
};

export const RELEVANT_HISTORY_OPTIONS = [
  "accident_injury",
  "dental_work",
  "facial_pain_procedure",
  "other_procedure",
  "no_known_event",
  "not_sure",
] as const;

export const RELEVANT_HISTORY_LABELS: Record<(typeof RELEVANT_HISTORY_OPTIONS)[number], string> = {
  accident_injury: "Accident, injury, or trauma",
  dental_work: "Dental work, such as an extraction, root canal, or implant",
  facial_pain_procedure: "A procedure or surgery for facial pain",
  other_procedure: "Another relevant procedure",
  no_known_event: "No known precipitating event",
  not_sure: "Not sure",
};

export const EXCLUSIVE_HISTORY_OPTIONS = ["no_known_event", "not_sure"] as const;

export function isExclusiveHistoryOption(
  value: string,
): value is (typeof EXCLUSIVE_HISTORY_OPTIONS)[number] {
  return (EXCLUSIVE_HISTORY_OPTIONS as readonly string[]).includes(value);
}

export const OTHER_THERAPY_OPTIONS = [
  "holistic_therapy",
  "acupuncture",
  "meditation",
  "other",
] as const;

export const GENDER_LABELS: Record<(typeof GENDER_OPTIONS)[number], string> = {
  female: "Female",
  male: "Male",
  non_binary: "Non-binary",
  prefer_not_to_say: "Prefer not to say",
  other: "Other",
};

export const PRIOR_TREATMENT_LABELS: Record<(typeof PRIOR_TREATMENT_OPTIONS)[number], string> = {
  mvd: "MVD (microvascular decompression)",
  glycerin_rhizotomy: "Glycerin rhizotomy",
  radiofrequency: "Radiofrequency ablation",
  balloon_rhizotomy: "Balloon rhizotomy",
  gamma_knife: "Gamma Knife (GK)",
  cyberknife: "CyberKnife (CK)",
  other: "Other",
};

export const OTHER_THERAPY_LABELS: Record<(typeof OTHER_THERAPY_OPTIONS)[number], string> = {
  holistic_therapy: "Holistic therapy",
  acupuncture: "Acupuncture",
  meditation: "Meditation",
  other: "Other",
};

export function formatPriorTreatmentLabel(
  treatment: (typeof PRIOR_TREATMENT_OPTIONS)[number],
  otherLabel?: string | null,
) {
  if (treatment === "other" && otherLabel?.trim()) {
    return otherLabel.trim();
  }

  return PRIOR_TREATMENT_LABELS[treatment];
}

export function formatOtherTherapyLabel(
  therapy: (typeof OTHER_THERAPY_OPTIONS)[number],
  otherLabel?: string | null,
) {
  if (therapy === "other" && otherLabel?.trim()) {
    return otherLabel.trim();
  }

  return OTHER_THERAPY_LABELS[therapy];
}
