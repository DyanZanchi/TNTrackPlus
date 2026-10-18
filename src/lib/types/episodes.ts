import {
  BUILTIN_MEDICATION_OPTIONS,
  BUILTIN_TRIGGER_OPTIONS,
  EPISODE_FACE_AREA_LABELS,
  FACE_AREA_OPTIONS,
  BUILTIN_PAIN_TYPE_OPTIONS,
  NUMBNESS_OPTIONS,
  NUMBNESS_TIMING_OPTIONS,
  DURATION_STATUS_OPTIONS,
  DURATION_UNIT_OPTIONS,
  PAIN_PATTERN_OPTIONS,
  PAIN_QUALITY_OPTIONS,
  THROBBING_ASSOCIATION_OPTIONS,
  YES_NO_UNSURE_OPTIONS,
} from "@/lib/constants/episode-options";
import type { FaceMapPoint } from "@/lib/face-map/types";
import type { OtherTherapyEntry, PriorTreatmentEntry } from "@/lib/types/profile";

export type EpisodeTreatmentHistorySnapshot = {
  prior_treatments: PriorTreatmentEntry[];
  other_therapies: OtherTherapyEntry[];
  added_prior_treatments: PriorTreatmentEntry[];
  added_other_therapies: OtherTherapyEntry[];
};

export type BuiltinPainTypeOption = (typeof BUILTIN_PAIN_TYPE_OPTIONS)[number];
export type PainPatternOption = (typeof PAIN_PATTERN_OPTIONS)[number];
export type DurationUnitOption = (typeof DURATION_UNIT_OPTIONS)[number];
export type DurationStatusOption = (typeof DURATION_STATUS_OPTIONS)[number];
export type PainQualityOption = (typeof PAIN_QUALITY_OPTIONS)[number];
export type NumbnessOption = (typeof NUMBNESS_OPTIONS)[number];
export type NumbnessTimingOption = (typeof NUMBNESS_TIMING_OPTIONS)[number];
export type YesNoUnsureOption = (typeof YES_NO_UNSURE_OPTIONS)[number];
export type ThrobbingAssociationOption = (typeof THROBBING_ASSOCIATION_OPTIONS)[number];
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
  pain_type_labels: string[];
  pain_qualities: PainQualityOption[];
  pain_quality_other: string | null;
  had_numbness: NumbnessOption | null;
  numbness_location: string | null;
  numbness_onset_date: string | null;
  numbness_onset_unknown: boolean;
  numbness_after_procedure: YesNoUnsureOption | null;
  numbness_procedure_note: string | null;
  numbness_timing: NumbnessTimingOption | null;
  throbbing_associations: ThrobbingAssociationOption[];
  pain_pattern: PainPatternOption;
  pulse_duration_seconds: number | null;
  face_areas: EpisodeFaceArea[];
  face_points: FaceMapPoint[];
  severity: number;
  functional_impact: number | null;
  background_severity_before: number | null;
  duration_status: DurationStatusOption;
  duration_seconds: number | null;
  pain_changed_during: YesNoUnsureOption | null;
  pain_change_summary: string | null;
  onset_at: string;
  trigger_labels: string[];
  medication_labels: string[];
  notes: string | null;
  treatment_history_changed: boolean;
  treatment_change_date: string | null;
  treatment_history_snapshot: EpisodeTreatmentHistorySnapshot | null;
  created_at: string;
};

export type BackgroundPainCheckIn = {
  id: string;
  user_id: string;
  recorded_at: string;
  severity: number;
  functional_impact: number | null;
  pain_qualities: PainQualityOption[];
  pain_quality_other: string | null;
  face_points: FaceMapPoint[];
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
  averageSeverity: number | null;
};

export type DashboardSummary = {
  totalEpisodes: number;
  averageDurationSeconds: number;
  averageSeverity: number;
  topTrigger: string;
};
