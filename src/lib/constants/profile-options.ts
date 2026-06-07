export const GENDER_OPTIONS = [
  "female",
  "male",
  "non_binary",
  "prefer_not_to_say",
  "other",
] as const;

export const PRIOR_TREATMENT_OPTIONS = [
  "mvd",
  "glycerin_rhizotomy",
  "radiofrequency",
  "balloon_rhizotomy",
  "gamma_knife",
  "cyberknife",
  "other",
] as const;

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
