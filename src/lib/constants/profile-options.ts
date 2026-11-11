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
    "Episodes of pain with no background pain between them.",
  continuous_background:
    "Continuous pain most or all of the time.",
  continuous_with_episodes: "Continuous pain with episodes of worse pain.",
  varies_unsure: "Varies / not sure.",
};

/** First step of the pain-pattern question: continuous vs episodic. */
export const PAIN_OCCURRENCE_OPTIONS = [
  "continuous",
  "episodic",
  "both",
  "varies",
] as const;

export type PainOccurrenceOption = (typeof PAIN_OCCURRENCE_OPTIONS)[number];

export const PAIN_OCCURRENCE_LABELS: Record<PainOccurrenceOption, string> = {
  continuous: "Continuous pain most or all of the time",
  episodic: "Episodes of pain that come and go",
  both: "Both continuous pain and episodes",
  varies: "Varies / not sure",
};

/** Second step: background pain between episodes (only after episodic). */
export const BACKGROUND_PAIN_OPTIONS = [
  "no_background",
  "has_background",
  "not_sure",
] as const;

export type BackgroundPainOption = (typeof BACKGROUND_PAIN_OPTIONS)[number];

export const BACKGROUND_PAIN_LABELS: Record<BackgroundPainOption, string> = {
  no_background: "No background pain — pain-free periods between episodes",
  has_background: "Yes — background pain between episodes",
  not_sure: "Not sure",
};

export function painPatternFromOccurrence(
  occurrence: PainOccurrenceOption | "",
  background: BackgroundPainOption | "",
): (typeof PATIENT_PAIN_PATTERN_OPTIONS)[number] | null {
  if (occurrence === "continuous") {
    return "continuous_background";
  }
  if (occurrence === "both") {
    return "continuous_with_episodes";
  }
  if (occurrence === "varies") {
    return "varies_unsure";
  }
  if (occurrence === "episodic") {
    if (background === "no_background") {
      return "episodes_with_pain_free_periods";
    }
    if (background === "has_background") {
      return "continuous_with_episodes";
    }
    if (background === "not_sure") {
      return "varies_unsure";
    }
  }
  return null;
}

export function occurrenceFromPainPattern(
  pattern: (typeof PATIENT_PAIN_PATTERN_OPTIONS)[number] | null | "",
): { occurrence: PainOccurrenceOption | ""; background: BackgroundPainOption | "" } {
  switch (pattern) {
    case "continuous_background":
      return { occurrence: "continuous", background: "" };
    case "episodes_with_pain_free_periods":
      return { occurrence: "episodic", background: "no_background" };
    case "continuous_with_episodes":
      return { occurrence: "both", background: "" };
    case "varies_unsure":
      return { occurrence: "varies", background: "" };
    default:
      return { occurrence: "", background: "" };
  }
}

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
