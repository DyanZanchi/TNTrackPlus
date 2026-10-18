import type { MedicationUseContext } from "@/lib/medications/catalog";

export const REGULAR_STATUS_LABELS = {
  taking_now: "Taking it now",
  stopped: "Used to take it, but stopped",
  never: "Never took this medication",
} as const;

export const RESCUE_STATUS_LABELS = {
  used_past_year: "Used in the past year",
  used_earlier: "Used, but not in the past year",
  never: "Never used",
  do_not_know: "Do not know",
} as const;

export const OTC_STATUS_LABELS = {
  used_past_week: "Yes",
  not_used: "No",
  do_not_know: "Do not know",
} as const;

export const TIMES_PER_DAY_LABELS = {
  once: "Once",
  twice: "Twice",
  three_times: "Three times",
  more_than_three: "More than three times per day",
  not_every_day: "I do not take this medication every day",
  do_not_know: "Do not know",
} as const;

export const ADMINISTRATION_LABELS = {
  swallow: "Swallow it",
  chew: "Chew it",
  other: "Other",
  do_not_know: "Do not know",
} as const;

export const EXTENDED_RELEASE_LABELS = {
  regular_tablet: "A regular tablet",
  extended_release: "The extended-release form",
  other: "Other",
  do_not_know: "Do not know",
} as const;

export const BUPROPION_FORM_LABELS = {
  sr_tablets: "SR tablets",
  xl_tablets: "XL tablets",
  other: "Other",
  do_not_know: "Do not know",
} as const;

export const TABLET_LIQUID_LABELS = {
  tablets: "Tablets",
  liquid: "Liquid",
  other: "Other",
  do_not_know: "Do not know",
} as const;

export const STOP_REASON_LABELS = {
  difficult_side_effects: "Difficult side effects",
  not_relieving_pain: "Not relieving pain",
  no_longer_needed: "No longer needed",
  too_expensive: "Too expensive or not covered by health insurance",
  changed_drug: "Changed to a different drug",
  other: "Other reason",
  do_not_know: "Do not know",
} as const;

export const OTC_FREQUENCY_LABELS = {
  once_a_week: "Once a week",
  two_or_three_a_week: "Two or three times a week",
  four_or_five_a_week: "Four or five times a week",
  six_a_week: "Six times a week",
  every_day: "Every day",
  two_or_three_a_day: "Two or three times a day",
  four_or_more_a_day: "Four or more times a day",
  do_not_know: "Do not know",
} as const;

export const TABLET_COUNT_LABELS = {
  one: "One",
  two: "Two",
  three: "Three",
  four_or_more: "Four or more",
  do_not_know: "Do not know",
} as const;

export const YES_NO_UNKNOWN_LABELS = {
  yes: "Yes",
  no: "No",
  do_not_know: "Do not know",
} as const;

export const COMPOUNDED_INGREDIENT_LABELS = {
  carbamazepine: "Carbamazepine (Tegretol)",
  oxcarbazepine: "Oxcarbazepine (Oxtellar/Trileptal)",
  clonazepam: "Clonazepam (Klonopin)",
  gabapentin: "Gabapentin (Neurontin)",
  ketamine: "Ketamine",
  rimegepant: "Rimegepant (Nurtec)",
  zavegepant: "Zavegepant",
  lidocaine: "Lidocaine",
  oxytocin: "Oxytocin",
  other: "Other",
  do_not_know: "Do not know",
} as const;

export const COMPOUNDED_FORM_LABELS = {
  cream_ointment: "A cream or ointment",
  gel_jelly: "A gel or jelly",
  liquid: "A liquid",
  pill: "A pill, tablet, or capsule",
  lip_balm: "A lip balm",
  other: "Other",
  do_not_know: "Do not know",
} as const;

export const COMPOUNDED_EFFECT_LABELS = {
  excellent: "Excellent",
  very_good: "Very good",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
  do_not_know: "Do not know",
} as const;

export const COMPOUNDED_SOURCE_LABELS = {
  accredited_compounding_pharmacy:
    "A specialized, accredited compounding pharmacy",
  independent_pharmacy: "An independent pharmacy with some compounding services",
  outsourcing_facility: "An outsourcing facility that sells compounded drugs to medical offices and hospitals",
  walgreens: "Walgreens",
  do_not_know: "Do not know",
} as const;

export const CANNABIS_RELIEF_LABELS = {
  a_lot: "A lot",
  quite_a_bit: "Quite a bit",
  somewhat: "Somewhat",
  a_little: "A little",
  not_at_all: "Not at all",
} as const;

export const MEDICATIONS_IN_FRONT_LABELS = {
  yes: "Yes",
  no: "No",
  few_or_none: "I do not take medications, or I only take one or two",
} as const;

export const ANSWER_CONFIDENCE_LABELS = {
  very: "Very confident",
  somewhat: "Somewhat confident",
  quite_a_bit: "Quite a bit confident",
  not_very: "Not very confident",
  not_at_all: "Not at all confident",
} as const;

export function statusLabelsForContext(context: MedicationUseContext) {
  if (context === "regular" || context === "brain_fog") {
    return REGULAR_STATUS_LABELS;
  }

  if (context === "otc" || context === "topical_otc") {
    return OTC_STATUS_LABELS;
  }

  return RESCUE_STATUS_LABELS;
}
