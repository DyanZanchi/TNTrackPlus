export const MEDICATION_USE_CONTEXTS = [
  "regular",
  "brain_fog",
  "rescue",
  "blood_pressure_rescue",
  "injectable",
  "otc",
  "topical_otc",
] as const;

export type MedicationUseContext = (typeof MEDICATION_USE_CONTEXTS)[number];

export const REGULAR_STATUSES = ["taking_now", "stopped", "never"] as const;
export const RESCUE_STATUSES = ["used_past_year", "used_earlier", "never", "do_not_know"] as const;
export const OTC_STATUSES = ["used_past_week", "not_used", "do_not_know"] as const;

export const TIMES_PER_DAY = [
  "once",
  "twice",
  "three_times",
  "more_than_three",
  "not_every_day",
  "do_not_know",
] as const;

export const ADMINISTRATION_OPTIONS = ["swallow", "chew", "other", "do_not_know"] as const;

export const EXTENDED_RELEASE_OPTIONS = [
  "regular_tablet",
  "extended_release",
  "other",
  "do_not_know",
] as const;

export const BUPROPION_FORM_OPTIONS = ["sr_tablets", "xl_tablets", "other", "do_not_know"] as const;

export const TABLET_LIQUID_OPTIONS = ["tablets", "liquid", "other", "do_not_know"] as const;

export const STOP_REASONS = [
  "difficult_side_effects",
  "not_relieving_pain",
  "no_longer_needed",
  "too_expensive",
  "changed_drug",
  "other",
  "do_not_know",
] as const;

export const OTC_FREQUENCY_FULL = [
  "once_a_week",
  "two_or_three_a_week",
  "four_or_five_a_week",
  "six_a_week",
  "every_day",
  "two_or_three_a_day",
  "four_or_more_a_day",
  "do_not_know",
] as const;

export const OTC_FREQUENCY_WEEKLY = [
  "once_a_week",
  "two_or_three_a_week",
  "four_or_five_a_week",
  "six_a_week",
  "every_day",
  "do_not_know",
] as const;

export const TABLET_COUNTS = ["one", "two", "three", "four_or_more", "do_not_know"] as const;

export const YES_NO_UNKNOWN = ["yes", "no", "do_not_know"] as const;

export const COMPOUNDED_INGREDIENTS = [
  "carbamazepine",
  "oxcarbazepine",
  "clonazepam",
  "gabapentin",
  "ketamine",
  "rimegepant",
  "zavegepant",
  "lidocaine",
  "oxytocin",
  "other",
  "do_not_know",
] as const;

export const COMPOUNDED_FORMS = [
  "cream_ointment",
  "gel_jelly",
  "liquid",
  "pill",
  "lip_balm",
  "other",
  "do_not_know",
] as const;

export const COMPOUNDED_EFFECTS = [
  "excellent",
  "very_good",
  "good",
  "fair",
  "poor",
  "do_not_know",
] as const;

export const COMPOUNDED_SOURCES = [
  "accredited_compounding_pharmacy",
  "independent_pharmacy",
  "outsourcing_facility",
  "walgreens",
  "do_not_know",
] as const;

export const CANNABIS_RELIEF = ["a_lot", "quite_a_bit", "somewhat", "a_little", "not_at_all"] as const;

export const MEDICATIONS_IN_FRONT = ["yes", "no", "few_or_none"] as const;

export const ANSWER_CONFIDENCE = [
  "very",
  "somewhat",
  "quite_a_bit",
  "not_very",
  "not_at_all",
] as const;

export type FormulationKind = "extended_release" | "bupropion" | "tablet_or_liquid";
export type OtcFrequencyKind = "full" | "weekly";

export type InjectableFollowUpKind =
  | "cgrp"
  | "infusion_monthly"
  | "infusion_lidocaine"
  | "infusion_steroid"
  | "infusion_course"
  | "botox";

export type MedicationCatalogItem = {
  key: string;
  label: string;
  context: MedicationUseContext;
  doseMin?: number;
  doseMax?: number;
  doseUnit?: "mg" | "mg_or_ml";
  formulation?: FormulationKind;
  otcFrequency?: OtcFrequencyKind;
  asksStrength?: boolean;
  asksExtraAndNight?: boolean;
  asksOtherText?: boolean;
  followUp?: InjectableFollowUpKind;
  standardMonthlyMg?: number;
  placeSet?: "standard" | "phenytoin";
};

type RegularSpec = {
  key: string;
  label: string;
  min: number;
  max: number;
  unit?: "mg" | "mg_or_ml";
  formulation?: FormulationKind;
};

function regularMedication(spec: RegularSpec): MedicationCatalogItem {
  return {
    key: spec.key,
    label: spec.label,
    context: "regular",
    doseMin: spec.min,
    doseMax: spec.max,
    doseUnit: spec.unit ?? "mg",
    formulation: spec.formulation,
  };
}

function namedMedication(
  context: MedicationUseContext,
  key: string,
  label: string,
  extras: Partial<MedicationCatalogItem> = {},
): MedicationCatalogItem {
  return { key, label, context, ...extras };
}

export const MEDICATION_CATALOG: MedicationCatalogItem[] = [
  regularMedication({
    key: "carbamazepine",
    label: "Carbamazepine (Tegretol)",
    min: 200,
    max: 400,
    formulation: "extended_release",
  }),
  regularMedication({
    key: "oxcarbazepine",
    label: "Oxcarbazepine (Oxtellar/Trileptal)",
    min: 150,
    max: 600,
    formulation: "extended_release",
  }),
  regularMedication({ key: "eslicarbazepine", label: "Eslicarbazepine (Aptiom)", min: 200, max: 800 }),
  regularMedication({ key: "lacosamide", label: "Lacosamide (Vimpat)", min: 50, max: 200 }),
  regularMedication({ key: "zonisamide", label: "Zonisamide (Zonegran)", min: 25, max: 100 }),
  regularMedication({
    key: "gabapentin",
    label: "Gabapentin (Neurontin)",
    min: 300,
    max: 800,
    formulation: "extended_release",
  }),
  regularMedication({
    key: "pregabalin",
    label: "Pregabalin (Lyrica)",
    min: 25,
    max: 300,
    formulation: "extended_release",
  }),
  regularMedication({ key: "lamotrigine", label: "Lamotrigine (Lamictal)", min: 25, max: 200 }),
  regularMedication({ key: "baclofen", label: "Baclofen", min: 5, max: 20 }),
  regularMedication({ key: "duloxetine", label: "Duloxetine (Cymbalta)", min: 5, max: 60 }),
  regularMedication({
    key: "venlafaxine",
    label: "Venlafaxine (Effexor)",
    min: 25,
    max: 100,
    formulation: "extended_release",
  }),
  regularMedication({
    key: "vortioxetine",
    label: "Vortioxetine (Brintellix/Trintellix)",
    min: 5,
    max: 20,
  }),
  regularMedication({ key: "mirtazapine", label: "Mirtazapine (Remeron)", min: 15, max: 45 }),
  regularMedication({ key: "milnacipran", label: "Milnacipran (Savella)", min: 12.5, max: 100 }),
  regularMedication({
    key: "bupropion",
    label: "Bupropion (Wellbutrin)",
    min: 100,
    max: 300,
    formulation: "bupropion",
  }),
  regularMedication({ key: "dronabinol", label: "Dronabinol (Marinol)", min: 2.5, max: 10 }),
  regularMedication({
    key: "indomethacin",
    label: "Indomethacin (Tivorbex/Indocin)",
    min: 25,
    max: 75,
    formulation: "extended_release",
  }),
  regularMedication({ key: "meloxicam", label: "Meloxicam (Mobic)", min: 7.5, max: 15 }),
  regularMedication({ key: "low_dose_naltrexone", label: "Low-dose naltrexone", min: 0.5, max: 6 }),
  regularMedication({ key: "hydrocodone", label: "Hydrocodone (Vicodin)", min: 5, max: 10 }),
  regularMedication({ key: "oxycodone", label: "Oxycodone (OxyContin)", min: 5, max: 30 }),
  regularMedication({ key: "tramadol", label: "Tramadol (Ultram)", min: 50, max: 100 }),
  regularMedication({
    key: "methadone",
    label: "Methadone (Dolophine)",
    min: 5,
    max: 10,
    unit: "mg_or_ml",
    formulation: "tablet_or_liquid",
  }),
  regularMedication({
    key: "morphine",
    label: "Morphine (Kadian, MS Contin)",
    min: 10,
    max: 100,
    unit: "mg_or_ml",
    formulation: "tablet_or_liquid",
  }),
  regularMedication({
    key: "levorphanol",
    label: "Levorphanol (Levo-Dromoran)",
    min: 1,
    max: 3,
    unit: "mg_or_ml",
    formulation: "tablet_or_liquid",
  }),
  namedMedication("brain_fog", "memantine", "Memantine (Namenda)", { doseMin: 5, doseMax: 10, doseUnit: "mg" }),
  namedMedication("brain_fog", "modafinil", "Modafinil (Provigil)", {
    doseMin: 100,
    doseMax: 200,
    doseUnit: "mg",
  }),
  namedMedication("brain_fog", "methylphenidate", "Methylphenidate (Ritalin)", {
    doseMin: 5,
    doseMax: 20,
    doseUnit: "mg",
  }),
  namedMedication("rescue", "carbamazepine_chewable", "Carbamazepine (Tegretol) chewable"),
  namedMedication("rescue", "carbamazepine_liquid", "Carbamazepine (Tegretol) liquid"),
  namedMedication("rescue", "oxcarbazepine_chewable", "Oxcarbazepine (Oxtellar/Trileptal) chewable"),
  namedMedication(
    "rescue",
    "oxcarbazepine_swish",
    "Oxcarbazepine (Oxtellar/Trileptal) liquid swish and spit",
  ),
  namedMedication("rescue", "clonazepam_odt", "Clonazepam (Klonopin) orally dissolving tablet"),
  namedMedication("rescue", "gabapentin_liquid", "Gabapentin (Neurontin) liquid"),
  namedMedication("rescue", "ketamine_nasal", "Ketamine nasal spray"),
  namedMedication(
    "rescue",
    "esketamine_nasal",
    "S-ketamine or esketamine (Spravato) nasal spray",
  ),
  namedMedication("rescue", "rimegepant_odt", "Rimegepant (Nurtec ODT) orally dissolving tablets"),
  namedMedication("rescue", "zavegepant_nasal", "Zavegepant (Zavzpret) nasal spray"),
  namedMedication("rescue", "lidocaine_jelly", "Lidocaine jelly"),
  namedMedication("rescue", "lidocaine_spray_rescue", "Lidocaine spray"),
  namedMedication("rescue", "oxytocin_nasal", "Oxytocin nasal spray"),
  namedMedication("rescue", "sumatriptan_nasal", "Sumatriptan (Imitrex) nasal spray"),
  namedMedication("rescue", "sumatriptan_injection", "Sumatriptan (Imitrex) injection"),
  namedMedication("blood_pressure_rescue", "captopril", "Captopril (Capoten) tablets"),
  namedMedication("blood_pressure_rescue", "clonidine", "Clonidine (Catapres) tablets"),
  namedMedication(
    "blood_pressure_rescue",
    "clonazepam_odt_bp",
    "Clonazepam (Klonopin) orally dissolving tablets",
  ),
  namedMedication("blood_pressure_rescue", "lorazepam_liquid", "Lorazepam (Ativan) liquid"),
  namedMedication("injectable", "erenumab", "Erenumab (Aimovig)", {
    followUp: "cgrp",
    standardMonthlyMg: 140,
  }),
  namedMedication("injectable", "galcanezumab", "Galcanezumab (Emgality)", {
    followUp: "cgrp",
    standardMonthlyMg: 120,
  }),
  namedMedication("injectable", "fremanezumab", "Fremanezumab (Ajovy)", {
    followUp: "cgrp",
    standardMonthlyMg: 225,
  }),
  namedMedication("injectable", "eptinezumab", "Eptinezumab (Vyepti)", { followUp: "infusion_monthly" }),
  namedMedication("injectable", "lidocaine_iv", "Lidocaine", { followUp: "infusion_lidocaine" }),
  namedMedication("injectable", "methylprednisolone", "Methylprednisolone (A-Methapred)", {
    followUp: "infusion_steroid",
  }),
  namedMedication("injectable", "meloxicam_iv", "Meloxicam (Anjeso)", { followUp: "infusion_monthly" }),
  namedMedication("injectable", "ketorolac", "Ketorolac (Toradol)", { followUp: "infusion_course" }),
  namedMedication("injectable", "lacosamide_iv", "Lacosamide", { followUp: "infusion_monthly" }),
  namedMedication("injectable", "ketamine_iv", "Ketamine", { followUp: "infusion_course" }),
  namedMedication(
    "injectable",
    "phenytoin_non_ed",
    "Phenytoin (Dilantin) in a setting other than a hospital emergency department",
    { followUp: "infusion_course", placeSet: "phenytoin" },
  ),
  namedMedication("injectable", "botox", "Botox", { followUp: "botox" }),
  namedMedication("otc", "acetaminophen_regular", "Acetaminophen/paracetamol (Tylenol) regular strength (325 mg)", {
    otcFrequency: "full",
  }),
  namedMedication("otc", "acetaminophen_extra", "Acetaminophen/paracetamol (Tylenol) extra strength (500 mg)", {
    otcFrequency: "full",
  }),
  namedMedication("otc", "ibuprofen_regular", "Regular strength ibuprofen such as Advil or Motrin (200 mg)", {
    otcFrequency: "full",
  }),
  namedMedication("otc", "ibuprofen_extra", "Extra strength ibuprofen such as Advil or Motrin (400 mg)", {
    otcFrequency: "full",
  }),
  namedMedication(
    "otc",
    "acetaminophen_ibuprofen_combo",
    "Combination with acetaminophen (250 mg) and ibuprofen (125 mg)",
    { otcFrequency: "full" },
  ),
  namedMedication(
    "otc",
    "acetaminophen_ibuprofen_night",
    "Nighttime formulation of acetaminophen and/or ibuprofen",
    { otcFrequency: "weekly" },
  ),
  namedMedication("otc", "naproxen_regular", "Regular strength naproxen such as Aleve (220 mg)", {
    otcFrequency: "full",
  }),
  namedMedication("otc", "naproxen_night", "Naproxen nighttime such as Aleve PM", { otcFrequency: "weekly" }),
  namedMedication("otc", "aspirin", "Aspirin, including generic brands", {
    otcFrequency: "full",
    asksStrength: true,
    asksExtraAndNight: true,
  }),
  namedMedication(
    "otc",
    "excedrin",
    "Excedrin, generic Excedrin, or another acetaminophen, aspirin, and caffeine combination",
    { otcFrequency: "full", asksStrength: true, asksExtraAndNight: true },
  ),
  namedMedication("topical_otc", "lidocaine_cream", "Lidocaine cream or gel"),
  namedMedication("topical_otc", "lidocaine_spray_otc", "Lidocaine spray"),
  namedMedication("topical_otc", "lidocaine_patch", "Lidocaine patch"),
  namedMedication("topical_otc", "capsaicin_cream", "Capsaicin cream, ointment, or gel"),
  namedMedication("topical_otc", "capsaicin_patch", "Capsaicin patch"),
  namedMedication("topical_otc", "menthol", "Menthol cream, gel, or spray"),
  namedMedication("topical_otc", "cbd_oil", "CBD oil or cream (without THC)"),
  namedMedication("topical_otc", "cbd_tincture", "CBD oral tinctures (without THC)"),
  namedMedication("topical_otc", "cbd_capsules", "CBD capsules (without THC)"),
  namedMedication("topical_otc", "cbd_edibles", "CBD edibles (without THC)"),
  namedMedication("topical_otc", "cbd_inhalable", "CBD inhalable formulations (without THC)"),
  namedMedication("topical_otc", "topical_other", "Anything else bought without a prescription", {
    asksOtherText: true,
  }),
];

const catalogByKey = new Map(MEDICATION_CATALOG.map((item) => [item.key, item]));

export function getMedicationCatalogItem(key: string) {
  return catalogByKey.get(key);
}

export function medicationsInContext(context: MedicationUseContext) {
  return MEDICATION_CATALOG.filter((item) => item.context === context);
}

export function statusesForContext(context: MedicationUseContext) {
  if (context === "regular" || context === "brain_fog") {
    return REGULAR_STATUSES;
  }

  if (context === "otc" || context === "topical_otc") {
    return OTC_STATUSES;
  }

  return RESCUE_STATUSES;
}

export const MEDICATION_SOURCE = {
  document: "20260817 Medications Surveys_Facial Pain_Clean.docx",
  reviewedOn: "2026-10-17",
} as const;
