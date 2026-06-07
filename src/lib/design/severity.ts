export type SeverityDisplay = {
  label: string;
  color: string;
};

export function getSeverityDisplay(severity: number): SeverityDisplay {
  if (severity <= 3) {
    return { label: "Uncomfortable", color: "var(--severity-low)" };
  }

  if (severity <= 5) {
    return { label: "Distracting", color: "var(--severity-mid)" };
  }

  if (severity <= 7) {
    return { label: "Painful", color: "var(--severity-high)" };
  }

  if (severity <= 9) {
    return { label: "Severe", color: "var(--severity-severe)" };
  }

  return { label: "Unbearable", color: "var(--severity-unbearable)" };
}

export function getSeveritySliderPercent(severity: number) {
  return `${((severity - 1) / 9) * 100}%`;
}
