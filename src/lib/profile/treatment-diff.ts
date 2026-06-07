import type { OtherTherapyEntry, PriorTreatmentEntry } from "@/lib/types/profile";

function priorTreatmentKey(entry: PriorTreatmentEntry) {
  return entry.treatment_type === "other"
    ? `other:${(entry.other_label ?? "").trim().toLowerCase()}`
    : entry.treatment_type;
}

function otherTherapyKey(entry: OtherTherapyEntry) {
  return entry.therapy_type === "other"
    ? `other:${(entry.other_label ?? "").trim().toLowerCase()}`
    : entry.therapy_type;
}

export function diffAddedPriorTreatments(
  previous: PriorTreatmentEntry[],
  next: PriorTreatmentEntry[],
) {
  const previousKeys = new Set(previous.map(priorTreatmentKey));

  return next.filter((entry) => !previousKeys.has(priorTreatmentKey(entry)));
}

export function diffAddedOtherTherapies(previous: OtherTherapyEntry[], next: OtherTherapyEntry[]) {
  const previousKeys = new Set(previous.map(otherTherapyKey));

  return next.filter((entry) => !previousKeys.has(otherTherapyKey(entry)));
}
