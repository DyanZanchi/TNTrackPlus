import { format } from "date-fns";
import {
  DURATION_STATUS_LABELS,
  formatFaceAreaLabels,
  formatPainQualityLabels,
  formatPainTypeLabels,
  formatThrobbingAssociationLabels,
  NUMBNESS_LABELS,
  NUMBNESS_TIMING_LABELS,
  YES_NO_UNSURE_LABELS,
} from "@/lib/constants/episode-options";
import { formatPainPatternDescription } from "@/lib/episodes/pain-pattern";
import { formatFacePointLabels } from "@/lib/face-map/format";
import { formatTreatmentHistoryUpdate } from "@/lib/profile/format-treatment-change";
import type { EpisodeRecord } from "@/lib/types/episodes";
import type { BackgroundPainCheckIn } from "@/lib/types/episodes";
import { formatDurationHms, formatEpisodeDurationHms } from "@/lib/utils";

export const EXPORT_SCHEMA_VERSION = "2026-10-17.2";

export const EPISODE_CSV_HEADERS = [
  "schema_version",
  "onset_at",
  "pain_type_labels",
  "pain_quality",
  "had_numbness",
  "numbness_location",
  "numbness_onset_date",
  "numbness_after_procedure",
  "numbness_timing",
  "throbbing_associations",
  "face_areas",
  "pain_locations",
  "pain_pattern",
  "pulse_duration_hms",
  "severity",
  "functional_impact",
  "background_severity_before",
  "duration_status",
  "duration_hms",
  "duration_seconds",
  "pain_changed_during",
  "pain_change_summary",
  "triggers",
  "medications",
  "notes",
  "treatment_history_changed",
  "treatment_change_date",
  "treatment_update",
] as const;

function escapeCsvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function buildEpisodeCsvRows(episodes: EpisodeRecord[]) {
  return episodes.map((episode) => [
    EXPORT_SCHEMA_VERSION,
    format(new Date(episode.onset_at), "yyyy-MM-dd HH:mm"),
    formatPainTypeLabels(episode.pain_type_labels),
    formatPainQualityLabels(episode.pain_qualities, episode.pain_quality_other),
    episode.had_numbness ? NUMBNESS_LABELS[episode.had_numbness] : "",
    episode.numbness_location ?? "",
    episode.numbness_onset_unknown ? "unknown" : (episode.numbness_onset_date ?? ""),
    episode.numbness_after_procedure
      ? YES_NO_UNSURE_LABELS[episode.numbness_after_procedure]
      : "",
    episode.numbness_timing ? NUMBNESS_TIMING_LABELS[episode.numbness_timing] : "",
    formatThrobbingAssociationLabels(episode.throbbing_associations),
    formatFaceAreaLabels(episode.face_areas),
    episode.face_points.length ? formatFacePointLabels(episode.face_points) : "",
    formatPainPatternDescription(episode.pain_pattern, episode.pulse_duration_seconds),
    episode.pulse_duration_seconds ? formatDurationHms(episode.pulse_duration_seconds) : "",
    String(episode.severity),
    episode.functional_impact === null ? "" : String(episode.functional_impact),
    episode.background_severity_before === null ? "" : String(episode.background_severity_before),
    DURATION_STATUS_LABELS[episode.duration_status],
    formatEpisodeDurationHms(episode.duration_seconds, episode.duration_status),
    episode.duration_seconds == null ? "" : String(episode.duration_seconds),
    episode.pain_changed_during ? YES_NO_UNSURE_LABELS[episode.pain_changed_during] : "",
    episode.pain_change_summary ?? "",
    episode.trigger_labels.join("; "),
    episode.medication_labels.join("; "),
    episode.notes ?? "",
    episode.treatment_history_changed ? "yes" : "no",
    episode.treatment_change_date ?? "",
    episode.treatment_history_changed
      ? formatTreatmentHistoryUpdate(episode.treatment_history_snapshot)
      : "",
  ]);
}

export function buildEpisodesCsv(episodes: EpisodeRecord[]) {
  return [EPISODE_CSV_HEADERS, ...buildEpisodeCsvRows(episodes)]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");
}

export const BACKGROUND_CHECK_IN_CSV_HEADERS = [
  "schema_version",
  "observation_type",
  "recorded_at",
  "severity",
  "functional_impact",
  "pain_quality",
  "pain_locations",
  "notes",
] as const;

export function buildBackgroundCheckInsCsv(checkIns: BackgroundPainCheckIn[]) {
  const rows = checkIns.map((checkIn) => [
    EXPORT_SCHEMA_VERSION,
    "background_check_in",
    format(new Date(checkIn.recorded_at), "yyyy-MM-dd HH:mm"),
    String(checkIn.severity),
    checkIn.functional_impact === null ? "" : String(checkIn.functional_impact),
    formatPainQualityLabels(checkIn.pain_qualities, checkIn.pain_quality_other),
    checkIn.face_points.length ? formatFacePointLabels(checkIn.face_points) : "",
    checkIn.notes ?? "",
  ]);

  return [BACKGROUND_CHECK_IN_CSV_HEADERS, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");
}
