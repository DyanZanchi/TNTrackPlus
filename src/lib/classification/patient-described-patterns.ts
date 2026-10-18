export const DESCRIBED_PATTERN_STATUS_OPTIONS = [
  "have_now",
  "had_past",
  "never",
] as const;

export const DESCRIBED_PATTERN_STATUS_LABELS: Record<
  (typeof DESCRIBED_PATTERN_STATUS_OPTIONS)[number],
  string
> = {
  have_now: "I have this now",
  had_past: "I had this in the past, but not now",
  never: "I have never had this",
};

export type DescribedPatternStatus = (typeof DESCRIBED_PATTERN_STATUS_OPTIONS)[number];

export type ReviewerClassificationCode = {
  system: "ICOP" | "ICHD-3";
  code: string;
  label: string;
  versionNote: string;
};

export type PatientDescribedPattern = {
  key: string;
  prompt: string;
  reviewerCodes: ReviewerClassificationCode[];
  sourceQuestion: string;
};

/**
 * Patient-facing descriptions from the FPA classification-by-symptoms draft.
 * Reviewer ICOP/ICHD codes must never appear in the patient UI or be assigned
 * automatically as diagnoses.
 */
export const PATIENT_DESCRIBED_PATTERNS: PatientDescribedPattern[] = [
  {
    key: "shock_like_paroxysmal",
    prompt:
      "Extreme, sudden burning or shock-like pain that comes and goes, usually on one side of the face.",
    sourceQuestion: "Q1",
    reviewerCodes: [
      {
        system: "ICOP",
        code: "4.1.1.1.1",
        label: "Classic trigeminal neuralgia, purely paroxysmal",
        versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
      },
      {
        system: "ICHD-3",
        code: "13.1.1.1.1",
        label: "Classic trigeminal neuralgia, purely paroxysmal",
        versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
      },
    ],
  },
  {
    key: "background_between_shocks",
    prompt: "When that shock-like pain happens, there is also background pain between the shocks.",
    sourceQuestion: "Q2",
    reviewerCodes: [
      {
        system: "ICOP",
        code: "4.1.1.1.2",
        label: "Classic trigeminal neuralgia, with concomitant continuous pain",
        versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
      },
      {
        system: "ICHD-3",
        code: "13.1.1.1.2",
        label: "Classic trigeminal neuralgia, with concomitant continuous pain",
        versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
      },
    ],
  },
  {
    key: "postherpetic_neuropathic",
    prompt:
      "Facial neuropathic pain after herpes zoster, including burning or shock-like pain and/or numbness, pricking, tingling, creeping, or pins and needles. This can occur months or years after the rash has cleared.",
    sourceQuestion: "Q4",
    reviewerCodes: [
      {
        system: "ICOP",
        code: "4.1.2.1 / 4.1.2.2",
        label: "Trigeminal neuropathic pain attributed to herpes zoster / postherpetic neuralgia",
        versionNote: "Source combines these two codes and cannot distinguish them",
      },
      {
        system: "ICHD-3",
        code: "13.1.2.1 / 13.1.2.2",
        label: "Trigeminal neuropathic pain attributed to herpes zoster / postherpetic neuralgia",
        versionNote: "Source combines these two codes and cannot distinguish them",
      },
    ],
  },
  {
    key: "glossopharyngeal_sharp",
    prompt:
      "Sharp pain in the throat, back of the nose, tongue, or tonsils that comes and goes in repeated bouts.",
    sourceQuestion: "Q8A",
    reviewerCodes: [
      {
        system: "ICOP",
        code: "4.2.1",
        label: "Glossopharyngeal neuralgia",
        versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
      },
      {
        system: "ICHD-3",
        code: "13.2.1",
        label: "Glossopharyngeal neuralgia",
        versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
      },
    ],
  },
  {
    key: "geniculate_sharp",
    prompt:
      "Sharp pain deep in the ear canal or in and around the ear that comes and goes in repeated bouts.",
    sourceQuestion: "Q9A",
    reviewerCodes: [
      {
        system: "ICHD-3",
        code: "13.3.1",
        label: "Nervus intermedius neuralgia",
        versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
      },
    ],
  },
  {
    key: "occipital_shooting",
    prompt:
      "Shooting or stabbing pain along the back of the head, neck, and scalp, typically on one side.",
    sourceQuestion: "Q10A",
    reviewerCodes: [
      {
        system: "ICHD-3",
        code: "13.4",
        label: "Occipital neuralgia",
        versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
      },
    ],
  },
  {
    key: "burning_mouth",
    prompt:
      "A burning, scalding, or tingling feeling in the mouth that may occur every day for months or longer. Dry mouth or an altered taste may accompany it.",
    sourceQuestion: "Q10D",
    reviewerCodes: [
      {
        system: "ICHD-3",
        code: "13.11",
        label: "Burning mouth syndrome (BMS)",
        versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
      },
    ],
  },
  {
    key: "persistent_idiopathic_facial",
    prompt:
      "A constant pain of the face and mouth that can be dull, nagging, or achy. It can affect a small part or the entire face, on one or both sides, and can change with stress or tiredness.",
    sourceQuestion: "Q10E",
    reviewerCodes: [
      {
        system: "ICHD-3",
        code: "13.12",
        label: "Persistent idiopathic facial pain (PIFP)",
        versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
      },
    ],
  },
];

export const DESCRIBED_PATTERN_KEYS = [
  "shock_like_paroxysmal",
  "background_between_shocks",
  "postherpetic_neuropathic",
  "glossopharyngeal_sharp",
  "geniculate_sharp",
  "occipital_shooting",
  "burning_mouth",
  "persistent_idiopathic_facial",
] as const;

export function getReviewerClassificationMapping() {
  return PATIENT_DESCRIBED_PATTERNS.map((pattern) => ({
    patternKey: pattern.key,
    sourceQuestion: pattern.sourceQuestion,
    reviewerCodes: pattern.reviewerCodes,
  }));
}

export function isDescribedPatternKey(value: string): value is (typeof DESCRIBED_PATTERN_KEYS)[number] {
  return (DESCRIBED_PATTERN_KEYS as readonly string[]).includes(value);
}

export function isDescribedPatternStatus(value: string): value is DescribedPatternStatus {
  return (DESCRIBED_PATTERN_STATUS_OPTIONS as readonly string[]).includes(value);
}
