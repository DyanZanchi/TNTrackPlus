import { PAIN_PATTERN_LABELS } from "@/lib/constants/episode-options";
import type { PainPatternOption } from "@/lib/types/episodes";
import { formatDurationHms } from "@/lib/utils";

export function formatPainPatternDescription(
  pattern: PainPatternOption,
  pulseDurationSeconds: number | null,
) {
  if (pattern === "continuous") {
    return PAIN_PATTERN_LABELS.continuous;
  }

  if (pulseDurationSeconds) {
    return `${PAIN_PATTERN_LABELS.episodic_pulsing} (${formatDurationHms(pulseDurationSeconds)} per pulse)`;
  }

  return PAIN_PATTERN_LABELS.episodic_pulsing;
}
