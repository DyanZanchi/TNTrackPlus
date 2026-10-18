import type { BackgroundPainCheckIn } from "@/lib/types/episodes";

export type BackgroundPainSummary = {
  recordedCheckIns: number;
  averageSeverity: number | null;
  medianSeverity: number | null;
  peakSeverity: number | null;
};

export function summarizeBackgroundPain(
  checkIns: BackgroundPainCheckIn[],
): BackgroundPainSummary {
  if (!checkIns.length) {
    return {
      recordedCheckIns: 0,
      averageSeverity: null,
      medianSeverity: null,
      peakSeverity: null,
    };
  }

  const severities = checkIns.map((checkIn) => checkIn.severity).sort((a, b) => a - b);
  const middle = Math.floor(severities.length / 2);
  const median =
    severities.length % 2 === 0
      ? (severities[middle - 1] + severities[middle]) / 2
      : severities[middle];

  return {
    recordedCheckIns: checkIns.length,
    averageSeverity:
      Math.round(
        (severities.reduce((total, severity) => total + severity, 0) / severities.length) * 10,
      ) / 10,
    medianSeverity: median,
    peakSeverity: Math.max(...severities),
  };
}
