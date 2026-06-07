import {
  BUILTIN_MEDICATION_OPTIONS,
  BUILTIN_PAIN_TYPE_OPTIONS,
  BUILTIN_TRIGGER_OPTIONS,
  NO_MEDICATION_OPTION_ID,
} from "@/lib/constants/episode-options";
import type { TaxonomyOption } from "@/lib/types/episodes";

export type TaxonomyKind = "trigger" | "medication" | "pain_type";

export function normalizeTaxonomyLabel(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function getDemoTaxonomyOptions(kind: TaxonomyKind): TaxonomyOption[] {
  const options =
    kind === "trigger"
      ? BUILTIN_TRIGGER_OPTIONS
      : kind === "medication"
        ? BUILTIN_MEDICATION_OPTIONS
        : BUILTIN_PAIN_TYPE_OPTIONS;

  return options.map((option) => ({
    ...option,
    user_id: null,
    is_active: true,
  }));
}

export function hasExclusiveNoMedication(ids: string[]) {
  return ids.includes(NO_MEDICATION_OPTION_ID) && ids.length > 1;
}
