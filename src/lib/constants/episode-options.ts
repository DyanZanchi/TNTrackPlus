export const FACE_AREA_OPTIONS = [
  "left_cheek",
  "right_cheek",
  "jaw",
  "upper_lip",
  "lower_lip",
  "eye_forehead",
] as const;

export const LEGACY_MULTIPLE_AREAS = "multiple_areas" as const;

export const PAIN_TYPE_OPTIONS = [
  "trigeminal_neuralgia",
  "geniculate_neuralgia",
  "anesthesia_dolorosa",
  "occipital_neuralgia",
] as const;

export const DURATION_OPTIONS = [1, 2, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180] as const;

export const FACE_AREA_LABELS: Record<(typeof FACE_AREA_OPTIONS)[number], string> = {
  left_cheek: "Left cheek",
  right_cheek: "Right cheek",
  jaw: "Jaw",
  upper_lip: "Upper lip",
  lower_lip: "Lower lip",
  eye_forehead: "Eye / forehead",
};

export const EPISODE_FACE_AREA_LABELS = {
  ...FACE_AREA_LABELS,
  [LEGACY_MULTIPLE_AREAS]: "Multiple areas (legacy)",
} as const;

export const FACE_AREA_OPTION_IDS: Record<(typeof FACE_AREA_OPTIONS)[number], string> = {
  left_cheek: "33333333-3333-4333-8333-000000000001",
  right_cheek: "33333333-3333-4333-8333-000000000002",
  jaw: "33333333-3333-4333-8333-000000000003",
  upper_lip: "33333333-3333-4333-8333-000000000004",
  lower_lip: "33333333-3333-4333-8333-000000000005",
  eye_forehead: "33333333-3333-4333-8333-000000000006",
};

export const PAIN_TYPE_LABELS: Record<(typeof PAIN_TYPE_OPTIONS)[number], string> = {
  trigeminal_neuralgia: "Trigeminal Neuralgia",
  geniculate_neuralgia: "Geniculate Neuralgia",
  anesthesia_dolorosa: "Anesthesia Dolorosa",
  occipital_neuralgia: "Occipital Neuralgia",
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
