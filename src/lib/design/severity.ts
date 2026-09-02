export type SeverityDisplay = {
  label: string;
  color: string;
};

export function getSeverityLabel(severity: number): string {
  if (severity === 0) {
    return "No pain";
  }

  if (severity <= 4) {
    return "Mild pain";
  }

  if (severity <= 7) {
    return "Moderate pain";
  }

  return "Severe pain";
}

function getSeverityColor(severity: number): string {
  if (severity === 0) {
    return "var(--muted)";
  }

  if (severity <= 4) {
    return "var(--severity-low)";
  }

  if (severity <= 7) {
    return "var(--severity-mid)";
  }

  return "var(--severity-severe)";
}

export function getSeverityDisplay(severity: number): SeverityDisplay {
  const clamped = Math.min(10, Math.max(1, Math.round(severity)));

  return {
    label: getSeverityLabel(clamped),
    color: getSeverityColor(clamped),
  };
}

export function getSeveritySliderPercent(severity: number) {
  return `${((severity - 1) / 9) * 100}%`;
}
