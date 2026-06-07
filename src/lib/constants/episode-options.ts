export const FACE_AREA_OPTIONS = ["v1", "v2", "v3"] as const;

export const LEGACY_MULTIPLE_AREAS = "multiple_areas" as const;

export const BUILTIN_PAIN_TYPE_OPTIONS = [
  {
    id: "44444444-4444-4444-8444-000000000001",
    label: "Trigeminal Neuralgia",
    normalized_label: "trigeminal_neuralgia",
  },
  {
    id: "44444444-4444-4444-8444-000000000002",
    label: "Geniculate Neuralgia",
    normalized_label: "geniculate_neuralgia",
  },
  {
    id: "44444444-4444-4444-8444-000000000003",
    label: "Anesthesia Dolorosa",
    normalized_label: "anesthesia_dolorosa",
  },
  {
    id: "44444444-4444-4444-8444-000000000004",
    label: "Occipital Neuralgia",
    normalized_label: "occipital_neuralgia",
  },
] as const;

export const PAIN_PATTERN_OPTIONS = ["continuous", "episodic_pulsing"] as const;

export const DURATION_OPTIONS = [1, 2, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180] as const;

export const FACE_AREA_LABELS: Record<(typeof FACE_AREA_OPTIONS)[number], string> = {
  v1: "V1 — Ophthalmic",
  v2: "V2 — Maxillary",
  v3: "V3 — Mandibular",
};

const LEGACY_FACE_AREA_LABELS = {
  left_cheek: "Left cheek (legacy)",
  right_cheek: "Right cheek (legacy)",
  jaw: "Jaw (legacy)",
  upper_lip: "Upper lip (legacy)",
  lower_lip: "Lower lip (legacy)",
  eye_forehead: "Eye / forehead (legacy)",
} as const;

export const EPISODE_FACE_AREA_LABELS = {
  ...FACE_AREA_LABELS,
  ...LEGACY_FACE_AREA_LABELS,
  [LEGACY_MULTIPLE_AREAS]: "Multiple areas (legacy)",
} as const;

export const FACE_AREA_OPTION_IDS: Record<(typeof FACE_AREA_OPTIONS)[number], string> = {
  v1: "33333333-3333-4333-8333-000000000007",
  v2: "33333333-3333-4333-8333-000000000008",
  v3: "33333333-3333-4333-8333-000000000009",
};

export function formatPainTypeLabels(labels: string[]) {
  return labels.join(", ");
}

export const PAIN_PATTERN_LABELS: Record<(typeof PAIN_PATTERN_OPTIONS)[number], string> = {
  continuous: "Continuous",
  episodic_pulsing: "Episodic",
};


export function isEpisodeFaceArea(value: string): value is keyof typeof EPISODE_FACE_AREA_LABELS {
  return value in EPISODE_FACE_AREA_LABELS;
}

export function formatFaceAreaLabels(faceAreas: Array<keyof typeof EPISODE_FACE_AREA_LABELS>) {
  return faceAreas.map((area) => EPISODE_FACE_AREA_LABELS[area]).join(", ");
}

export const NO_MEDICATION_OPTION_ID = "22222222-2222-4222-8222-000000000001";

export const BUILTIN_TRIGGER_OPTIONS = [
  {
    id: "11111111-1111-4111-8111-000000000001",
    label: "Chewing",
    normalized_label: "chewing",
  },
  {
    id: "11111111-1111-4111-8111-000000000002",
    label: "Brushing teeth",
    normalized_label: "brushing_teeth",
  },
  {
    id: "11111111-1111-4111-8111-000000000003",
    label: "Talking",
    normalized_label: "talking",
  },
  {
    id: "11111111-1111-4111-8111-000000000004",
    label: "Touching face",
    normalized_label: "touching_face",
  },
  {
    id: "11111111-1111-4111-8111-000000000005",
    label: "Cold air",
    normalized_label: "cold_air",
  },
  {
    id: "11111111-1111-4111-8111-000000000006",
    label: "Washing face",
    normalized_label: "washing_face",
  },
  {
    id: "11111111-1111-4111-8111-000000000007",
    label: "Stress",
    normalized_label: "stress",
  },
  {
    id: "11111111-1111-4111-8111-000000000008",
    label: "Spontaneous / no clear trigger",
    normalized_label: "spontaneous",
  },
] as const;

export const BUILTIN_MEDICATION_OPTIONS = [
  {
    id: NO_MEDICATION_OPTION_ID,
    label: "No medication",
    normalized_label: "no_medication",
  },
  {
    id: "22222222-2222-4222-8222-000000000002",
    label: "Carbamazepine",
    normalized_label: "carbamazepine",
  },
  {
    id: "22222222-2222-4222-8222-000000000003",
    label: "Oxcarbazepine",
    normalized_label: "oxcarbazepine",
  },
  {
    id: "22222222-2222-4222-8222-000000000004",
    label: "Gabapentin",
    normalized_label: "gabapentin",
  },
  {
    id: "22222222-2222-4222-8222-000000000005",
    label: "Baclofen",
    normalized_label: "baclofen",
  },
  {
    id: "22222222-2222-4222-8222-000000000006",
    label: "Ibuprofen",
    normalized_label: "ibuprofen",
  },
  {
    id: "22222222-2222-4222-8222-000000000007",
    label: "Acetaminophen",
    normalized_label: "acetaminophen",
  },
  {
    id: "22222222-2222-4222-8222-000000000008",
    label: "Naproxen",
    normalized_label: "naproxen",
  },
  {
    id: "22222222-2222-4222-8222-000000000009",
    label: "Aspirin",
    normalized_label: "aspirin",
  },
] as const;

export const BUILTIN_TRIGGER_LABELS = Object.fromEntries(
  BUILTIN_TRIGGER_OPTIONS.map((option) => [option.id, option.label]),
);

export const BUILTIN_MEDICATION_LABELS = Object.fromEntries(
  BUILTIN_MEDICATION_OPTIONS.map((option) => [option.id, option.label]),
);

export const RANGE_OPTIONS = [
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom range" },
] as const;
