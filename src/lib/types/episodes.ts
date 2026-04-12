import {
  BUILTIN_MEDICATION_OPTIONS,
  BUILTIN_TRIGGER_OPTIONS,
  EPISODE_FACE_AREA_LABELS,
  FACE_AREA_OPTIONS,
  PAIN_TYPE_OPTIONS,
} from "@/lib/constants/episode-options";

export type PainTypeOption = (typeof PAIN_TYPE_OPTIONS)[number];
export type FaceAreaOption = (typeof FACE_AREA_OPTIONS)[number];
export type EpisodeFaceArea = keyof typeof EPISODE_FACE_AREA_LABELS;
export type BuiltinTriggerOption = (typeof BUILTIN_TRIGGER_OPTIONS)[number];
export type BuiltinMedicationOption = (typeof BUILTIN_MEDICATION_OPTIONS)[number];

export type TaxonomyOption = {
  id: string;
  user_id: string | null;
  label: string;
  normalized_label: string;
  is_active: boolean;
  created_at?: string;
};

export type EpisodeRecord = {
  id: string;
  user_id: string;
  pain_type: PainTypeOption;
  face_areas: EpisodeFaceArea[];
  severity: number;
  duration_seconds: number;
  onset_at: string;
  trigger_labels: string[];
  medication_labels: string[];
  notes: string | null;
  created_at: string;
};

export type RangeKey = "30d" | "90d" | "month" | "custom";

export type DashboardFilters = {
  range: RangeKey;
  start?: string;
  end?: string;
};

export type CategoryCount = {
  label: string;
  value: number;
};

export type MonthlyTrendPoint = {
  month: string;
  episodes: number;
  averageSeverity: number;
};

export type DashboardSummary = {
  totalEpisodes: number;
  averageDurationSeconds: number;
  averageSeverity: number;
  topTrigger: string;
};
