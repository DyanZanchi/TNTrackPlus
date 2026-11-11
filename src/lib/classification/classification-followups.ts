export const CLASSIFICATION_YES_NO = ["yes", "no"] as const;

export type ClassificationYesNo = (typeof CLASSIFICATION_YES_NO)[number];

export type ClassificationFollowUp = {
  key: string;
  sourceQuestion: string;
  prompt: string;
  asksDetail: boolean;
  reviewerCodes: Array<{
    system: "ICOP" | "ICHD-3";
    code: string;
    label: string;
    versionNote: string;
  }>;
};

export const SHOCK_CAUSE_FOLLOWUPS: ClassificationFollowUp[] = [
  {
    key: "shock_cause_ms",
    sourceQuestion: "Q3A",
    prompt: "Multiple sclerosis?",
    asksDetail: false,
    reviewerCodes: [
      {
        system: "ICOP",
        code: "4.1.1.2.1",
        label: "TN attributed to multiple sclerosis",
        versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
      },
      {
        system: "ICHD-3",
        code: "13.1.1.2.1",
        label: "TN attributed to multiple sclerosis",
        versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
      },
    ],
  },
  {
    key: "shock_cause_space_occupying",
    sourceQuestion: "Q3B",
    prompt: "A tumor, abscess, or hematoma?",
    asksDetail: false,
    reviewerCodes: [
      {
        system: "ICOP",
        code: "4.1.1.2.2",
        label: "TN attributed to a space-occupying lesion",
        versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
      },
      {
        system: "ICHD-3",
        code: "13.1.1.2.2",
        label: "TN attributed to a space-occupying lesion",
        versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
      },
    ],
  },
  {
    key: "shock_cause_other_condition",
    sourceQuestion: "Q3C",
    prompt: "Another condition such as lupus, Sjogren’s, or a Chiari malformation?",
    asksDetail: false,
    reviewerCodes: [
      {
        system: "ICOP",
        code: "4.1.1.2.3",
        label: "TN attributed to another cause",
        versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
      },
      {
        system: "ICHD-3",
        code: "13.1.1.2.3",
        label: "TN attributed to another cause",
        versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
      },
    ],
  },
  {
    key: "shock_cause_vascular_compression",
    sourceQuestion: "Q3D",
    prompt:
      "A blood vessel pressing or pulsating against the trigeminal nerve in the brain?",
    asksDetail: false,
    // Source notes this option is not on the classification list; it is asked so
    // respondents do not mark “another cause” by default.
    reviewerCodes: [],
  },
];

export const NEUROPATHIC_CAUSE_FOLLOWUPS: ClassificationFollowUp[] = [
  {
    key: "neuropathic_after_injury",
    sourceQuestion: "Q5A",
    prompt: "An accident or injury?",
    asksDetail: false,
    reviewerCodes: [
      {
        system: "ICOP",
        code: "4.1.2.3",
        label: "Post-traumatic trigeminal neuropathic pain",
        versionNote: "Source breaks causes out for frequency tracking",
      },
      {
        system: "ICHD-3",
        code: "13.1.2.3",
        label: "Post-traumatic trigeminal neuropathic pain",
        versionNote: "Source breaks causes out for frequency tracking",
      },
    ],
  },
  {
    key: "neuropathic_after_dental",
    sourceQuestion: "Q5B",
    prompt: "A procedure such as a root canal, extraction, or placement of dental implants?",
    asksDetail: false,
    reviewerCodes: [
      {
        system: "ICOP",
        code: "4.1.2.3",
        label: "Post-traumatic trigeminal neuropathic pain",
        versionNote: "Source breaks causes out for frequency tracking",
      },
      {
        system: "ICHD-3",
        code: "13.1.2.3",
        label: "Post-traumatic trigeminal neuropathic pain",
        versionNote: "Source breaks causes out for frequency tracking",
      },
    ],
  },
  {
    key: "neuropathic_after_pain_procedure",
    sourceQuestion: "Q5C",
    prompt:
      "A procedure meant to eliminate facial pain, such as surgery, rhizotomy, balloon compression, gamma or cyber knife treatments, or radiofrequency ablation?",
    asksDetail: false,
    reviewerCodes: [
      {
        system: "ICOP",
        code: "4.1.2.3",
        label: "Post-traumatic trigeminal neuropathic pain",
        versionNote: "Source breaks causes out for frequency tracking",
      },
      {
        system: "ICHD-3",
        code: "13.1.2.3",
        label: "Post-traumatic trigeminal neuropathic pain",
        versionNote: "Source breaks causes out for frequency tracking",
      },
    ],
  },
];

export const OTHER_NEUROPATHIC_FOLLOWUP: ClassificationFollowUp = {
  key: "neuropathic_other_condition",
  sourceQuestion: "Q6",
  prompt:
    "Do you or did you have facial pain that includes numbness, pricking, tingling, creeping, or pins and needles that was due to another condition or disease?",
  asksDetail: true,
  reviewerCodes: [
    {
      system: "ICOP",
      code: "4.1.2.4",
      label: "Trigeminal neuropathic pain associated with other disorder",
      versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
    },
    {
      system: "ICHD-3",
      code: "13.1.2.4",
      label: "Trigeminal neuropathic pain associated with other disorder",
      versionNote: "Classificationofpainbysymptomsmodule.docx reviewer box",
    },
  ],
};

export const IDIOPATHIC_LEARNED_CAUSE_FOLLOWUP: ClassificationFollowUp = {
  key: "learned_cause_atypical",
  sourceQuestion: "Q7",
  prompt:
    "Did you learn the cause of your facial pain? Facial pain with an unknown cause is sometimes called atypical facial pain.",
  asksDetail: true,
  reviewerCodes: [
    {
      system: "ICOP",
      code: "4.1.2.5",
      label: "Idiopathic trigeminal neuropathic pain",
      versionNote: "Asked only when Q5 and Q6 name no cause",
    },
    {
      system: "ICHD-3",
      code: "13.1.2.5",
      label: "Idiopathic trigeminal neuropathic pain",
      versionNote: "Asked only when Q5 and Q6 name no cause",
    },
  ],
};

export const CLASSIFICATION_FOLLOWUP_KEYS = [
  ...SHOCK_CAUSE_FOLLOWUPS.map((item) => item.key),
  ...NEUROPATHIC_CAUSE_FOLLOWUPS.map((item) => item.key),
  OTHER_NEUROPATHIC_FOLLOWUP.key,
  IDIOPATHIC_LEARNED_CAUSE_FOLLOWUP.key,
] as const;

export type ClassificationFollowUpKey = (typeof CLASSIFICATION_FOLLOWUP_KEYS)[number];

export const ALL_CLASSIFICATION_FOLLOWUPS: ClassificationFollowUp[] = [
  ...SHOCK_CAUSE_FOLLOWUPS,
  ...NEUROPATHIC_CAUSE_FOLLOWUPS,
  OTHER_NEUROPATHIC_FOLLOWUP,
  IDIOPATHIC_LEARNED_CAUSE_FOLLOWUP,
];

export function isClassificationFollowUpKey(
  value: string,
): value is ClassificationFollowUpKey {
  return (CLASSIFICATION_FOLLOWUP_KEYS as readonly string[]).includes(value);
}

export function isClassificationYesNo(value: string): value is ClassificationYesNo {
  return (CLASSIFICATION_YES_NO as readonly string[]).includes(value);
}

export function idiopathicFollowUpApplies(answers: Record<string, ClassificationYesNo | "">) {
  return (
    answers.neuropathic_after_injury === "no" &&
    answers.neuropathic_after_dental === "no" &&
    answers.neuropathic_after_pain_procedure === "no" &&
    answers.neuropathic_other_condition === "no"
  );
}

export function getClassificationFollowUpReviewerMapping() {
  return ALL_CLASSIFICATION_FOLLOWUPS.map((item) => ({
    answerKey: item.key,
    sourceQuestion: item.sourceQuestion,
    reviewerCodes: item.reviewerCodes,
  }));
}
