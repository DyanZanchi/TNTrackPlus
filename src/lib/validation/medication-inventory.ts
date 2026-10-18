import { z } from "zod";
import {
  ADMINISTRATION_OPTIONS,
  ANSWER_CONFIDENCE,
  BUPROPION_FORM_OPTIONS,
  CANNABIS_RELIEF,
  COMPOUNDED_EFFECTS,
  COMPOUNDED_FORMS,
  COMPOUNDED_INGREDIENTS,
  COMPOUNDED_SOURCES,
  EXTENDED_RELEASE_OPTIONS,
  getMedicationCatalogItem,
  MEDICATION_CATALOG,
  MEDICATIONS_IN_FRONT,
  OTC_FREQUENCY_FULL,
  OTC_FREQUENCY_WEEKLY,
  statusesForContext,
  STOP_REASONS,
  TABLET_COUNTS,
  TABLET_LIQUID_OPTIONS,
  TIMES_PER_DAY,
  YES_NO_UNKNOWN,
  type MedicationCatalogItem,
} from "@/lib/medications/catalog";

const optionalText = z.string().trim().max(300);

const yesNoUnknownSchema = z.enum(YES_NO_UNKNOWN).nullable();

const yesNoContinue = z.enum(["yes", "no", "do_not_know"]);

const followUpSchema = z.object({
  kind: z.enum([
    "cgrp",
    "infusion_monthly",
    "infusion_lidocaine",
    "infusion_steroid",
    "infusion_course",
    "botox",
  ]),
  injector: z.enum(["self", "family", "medical"]).nullable(),
  schedule: z.string().nullable(),
  scheduleOther: optionalText.nullable(),
  monthlyDose: z.enum(["standard", "different", "do_not_know"]).nullable(),
  differentDoseMg: z.number().positive().nullable(),
  differentFrequency: optionalText.nullable(),
  place: z.string().nullable(),
  placeOther: optionalText.nullable(),
  consecutiveDays: z.string().nullable(),
  consecutiveDaysOther: optionalText.nullable(),
  ecgBefore: yesNoContinue.nullable(),
  stillUsing: yesNoContinue.nullable(),
  botoxSites: z.array(z.string()),
});

export type MedicationFollowUp = z.infer<typeof followUpSchema>;

const useSchema = z.object({
  catalogKey: z.string(),
  status: z.string(),
  timesPerDay: z.enum(TIMES_PER_DAY).nullable(),
  doseAmount: z.number().positive().nullable(),
  doseUnknown: z.boolean(),
  administration: z.enum(ADMINISTRATION_OPTIONS).nullable(),
  administrationOther: optionalText.nullable(),
  formulation: z.string().nullable(),
  formulationOther: optionalText.nullable(),
  stopReasons: z.array(z.enum(STOP_REASONS)),
  stopReasonOther: optionalText.nullable(),
  otcFrequency: z.string().nullable(),
  tabletsAtOnce: z.enum(TABLET_COUNTS).nullable(),
  strengthMg: z.number().positive().nullable(),
  strengthUnknown: z.boolean(),
  extraStrength: yesNoUnknownSchema,
  nighttime: yesNoUnknownSchema,
  otherText: optionalText.nullable(),
  followUp: followUpSchema.nullable(),
});

const compoundedSchema = z.object({
  position: z.number().int().min(1).max(3),
  name: z.string().trim().min(1).max(200),
  ingredients: z.array(z.enum(COMPOUNDED_INGREDIENTS)),
  ingredientOther: optionalText.nullable(),
  form: z.enum(COMPOUNDED_FORMS).nullable(),
  formOther: optionalText.nullable(),
  effect: z.enum(COMPOUNDED_EFFECTS).nullable(),
  stillUsing: yesNoUnknownSchema,
  pharmacyType: z.enum(COMPOUNDED_SOURCES).nullable(),
});

const contextSchema = z.object({
  compoundedUsed: yesNoUnknownSchema,
  compoundedCount: z.number().int().min(0).max(99).nullable(),
  cannabisUsed: yesNoUnknownSchema,
  cannabisMedicalDispensary: yesNoUnknownSchema,
  cannabisOpenDispensary: yesNoUnknownSchema,
  cannabisOtherPlace: yesNoUnknownSchema,
  cannabisRelief: z.enum(CANNABIS_RELIEF).nullable(),
  erVisited: yesNoUnknownSchema,
  erVisitCount: z.number().int().min(0).max(366).nullable(),
  erSentHomeNoTreatment: yesNoUnknownSchema,
  erGivenOpiate: yesNoUnknownSchema,
  erGivenIvAnticonvulsant: yesNoUnknownSchema,
  erAskedForNamedProtocol: yesNoUnknownSchema,
  erOtherMedication: yesNoUnknownSchema,
  erAdmitted: yesNoUnknownSchema,
  erFeltHeard: yesNoUnknownSchema,
  erTreatedAsDrugSeeking: yesNoUnknownSchema,
  medicationsInFront: z.enum(MEDICATIONS_IN_FRONT).nullable(),
  answerConfidence: z.enum(ANSWER_CONFIDENCE).nullable(),
});

export type MedicationUseInput = z.infer<typeof useSchema> & {
  useContext: MedicationCatalogItem["context"];
};
export type CompoundedMedicationInput = z.infer<typeof compoundedSchema>;
export type MedicationContextInput = z.infer<typeof contextSchema>;

export type MedicationInventoryInput = {
  uses: MedicationUseInput[];
  compounded: CompoundedMedicationInput[];
  context: MedicationContextInput;
};

function emptyToNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function readTriState(formData: FormData, name: string) {
  const value = emptyToNull(formData.get(name));
  const parsed = yesNoUnknownSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function readEnum<T extends readonly [string, ...string[]]>(
  formData: FormData,
  name: string,
  values: T,
) {
  const value = emptyToNull(formData.get(name));
  if (!value) {
    return null;
  }

  return (values as readonly string[]).includes(value) ? value : value;
}

function readDose(formData: FormData, amountName: string, unknownName: string) {
  const unknown = formData.get(unknownName) === "1";
  const raw = emptyToNull(formData.get(amountName));

  if (unknown || raw === "9999") {
    return { amount: null, unknown: true };
  }

  if (!raw) {
    return { amount: null, unknown: false };
  }

  const amount = Number(raw);
  return { amount, unknown: false };
}

function formulationValues(item: MedicationCatalogItem) {
  if (item.formulation === "extended_release") {
    return EXTENDED_RELEASE_OPTIONS;
  }

  if (item.formulation === "bupropion") {
    return BUPROPION_FORM_OPTIONS;
  }

  if (item.formulation === "tablet_or_liquid") {
    return TABLET_LIQUID_OPTIONS;
  }

  return null;
}

function frequencyValues(item: MedicationCatalogItem) {
  if (item.otcFrequency === "weekly") {
    return OTC_FREQUENCY_WEEKLY;
  }

  if (item.otcFrequency === "full") {
    return OTC_FREQUENCY_FULL;
  }

  return null;
}

function oneOf(value: string | null, allowed: readonly string[]) {
  return value && allowed.includes(value) ? value : null;
}

const MONTHLY_SCHEDULE = ["once_a_month", "more_often", "less_often"] as const;
const WEEKLY_SCHEDULE = ["once_a_week", "every_other_week", "once_a_month", "other"] as const;
const STANDARD_PLACES = [
  "hospital_outpatient",
  "hospital_admitted",
  "clinic",
  "infusion_center",
  "mobile_iv",
  "other",
] as const;
const PHENYTOIN_PLACES = [
  "hospital_not_ed",
  "hospital_admitted",
  "clinic",
  "infusion_center",
  "mobile_iv",
  "other",
] as const;
const STEROID_DAYS = ["three", "four", "five", "other"] as const;
const COURSE_DAYS = ["one", "two", "three", "four", "five", "other", "do_not_know"] as const;
const BOTOX_SITES = [
  "temples_one",
  "temples_both",
  "forehead_one",
  "forehead_both",
  "cheeks_one",
  "cheeks_both",
  "jaw_one",
  "jaw_both",
  "do_not_know",
] as const;

function readFollowUp(item: MedicationCatalogItem, formData: FormData): MedicationFollowUp | null {
  if (!item.followUp) {
    return null;
  }

  const prefix = `med_${item.key}`;
  const scheduleAllowed = item.followUp === "infusion_lidocaine" || item.followUp === "infusion_steroid"
    ? WEEKLY_SCHEDULE
    : MONTHLY_SCHEDULE;
  const places = item.placeSet === "phenytoin" ? PHENYTOIN_PLACES : STANDARD_PLACES;
  const schedule = oneOf(emptyToNull(formData.get(`${prefix}_schedule`)), scheduleAllowed);
  const place = oneOf(emptyToNull(formData.get(`${prefix}_place`)), places);
  const daysAllowed = item.followUp === "infusion_steroid" ? STEROID_DAYS : COURSE_DAYS;
  const consecutiveDays = oneOf(emptyToNull(formData.get(`${prefix}_days`)), daysAllowed);
  const monthlyDose = oneOf(emptyToNull(formData.get(`${prefix}_monthly_dose`)), [
    "standard",
    "different",
    "do_not_know",
  ]);
  const dose = readDose(formData, `${prefix}_different_dose`, `${prefix}_different_unknown`);
  const stillUsing = oneOf(emptyToNull(formData.get(`${prefix}_still`)), ["yes", "no", "do_not_know"]);

  return {
    kind: item.followUp,
    injector:
      item.followUp === "cgrp"
        ? (oneOf(emptyToNull(formData.get(`${prefix}_injector`)), ["self", "family", "medical"]) as
            | MedicationFollowUp["injector"]
            | null)
        : null,
    schedule,
    scheduleOther: schedule === "other" ? emptyToNull(formData.get(`${prefix}_schedule_other`)) : null,
    monthlyDose: item.followUp === "cgrp" ? (monthlyDose as MedicationFollowUp["monthlyDose"]) : null,
    differentDoseMg:
      monthlyDose === "different" && !dose.unknown && dose.amount !== null && dose.amount > 0
        ? dose.amount
        : null,
    differentFrequency:
      monthlyDose === "different" ? emptyToNull(formData.get(`${prefix}_different_frequency`)) : null,
    place: item.followUp === "cgrp" ? null : place,
    placeOther: place === "other" ? emptyToNull(formData.get(`${prefix}_place_other`)) : null,
    consecutiveDays:
      item.followUp === "infusion_steroid" || item.followUp === "infusion_course" ? consecutiveDays : null,
    consecutiveDaysOther:
      consecutiveDays === "other" ? emptyToNull(formData.get(`${prefix}_days_other`)) : null,
    ecgBefore:
      item.followUp === "infusion_lidocaine"
        ? (oneOf(emptyToNull(formData.get(`${prefix}_ecg`)), ["yes", "no", "do_not_know"]) as
            | MedicationFollowUp["ecgBefore"]
            | null)
        : null,
    stillUsing: stillUsing as MedicationFollowUp["stillUsing"],
    botoxSites:
      item.followUp === "botox"
        ? [
            ...new Set(
              formData
                .getAll(`${prefix}_sites`)
                .map((value) => String(value))
                .filter((value) => (BOTOX_SITES as readonly string[]).includes(value)),
            ),
          ]
        : [],
  };
}

function readStopReasons(formData: FormData, key: string) {
  const reasons = formData
    .getAll(`med_${key}_stop`)
    .map((value) => String(value))
    .filter((value) => (STOP_REASONS as readonly string[]).includes(value));
  return [...new Set(reasons)] as MedicationUseInput["stopReasons"];
}

function blankUse(item: MedicationCatalogItem, status: string): MedicationUseInput {
  return {
    catalogKey: item.key,
    useContext: item.context,
    status,
    timesPerDay: null,
    doseAmount: null,
    doseUnknown: false,
    administration: null,
    administrationOther: null,
    formulation: null,
    formulationOther: null,
    stopReasons: [],
    stopReasonOther: null,
    otcFrequency: null,
    tabletsAtOnce: null,
    strengthMg: null,
    strengthUnknown: false,
    extraStrength: null,
    nighttime: null,
    otherText: null,
    followUp: null,
  };
}

export function parseMedicationInventory(formData: FormData) {
  const uses: MedicationUseInput[] = [];

  for (const item of MEDICATION_CATALOG) {
    const status = emptyToNull(formData.get(`med_${item.key}_status`));
    if (!status) {
      continue;
    }

    const allowed = statusesForContext(item.context) as readonly string[];
    if (!allowed.includes(status)) {
      return {
        success: false as const,
        error: { issues: [{ message: `Choose a listed answer for ${item.label}.` }] },
      };
    }

    const entry = blankUse(item, status);
    const currentRegular = status === "taking_now";
    const stopped = status === "stopped";
    const usedThisWeek = status === "used_past_week";

    if (currentRegular && (item.context === "regular" || item.context === "brain_fog")) {
      const times = readEnum(formData, `med_${item.key}_times`, TIMES_PER_DAY);
      if (times && !TIMES_PER_DAY.includes(times as (typeof TIMES_PER_DAY)[number])) {
        return {
          success: false as const,
          error: { issues: [{ message: `Choose a listed schedule for ${item.label}.` }] },
        };
      }
      entry.timesPerDay = times as MedicationUseInput["timesPerDay"];

      const dose = readDose(formData, `med_${item.key}_dose`, `med_${item.key}_dose_unknown`);
      if (dose.amount !== null && !Number.isFinite(dose.amount)) {
        return {
          success: false as const,
          error: { issues: [{ message: `Enter a number for the ${item.label} amount, or choose I don't know.` }] },
        };
      }
      if (dose.amount !== null && !(dose.amount > 0)) {
        return {
          success: false as const,
          error: { issues: [{ message: `Enter the amount of ${item.label} you take, or choose I don't know.` }] },
        };
      }
      entry.doseAmount = dose.unknown ? null : dose.amount;
      entry.doseUnknown = dose.unknown;

      const administration = readEnum(
        formData,
        `med_${item.key}_administration`,
        ADMINISTRATION_OPTIONS,
      );
      if (
        administration &&
        !ADMINISTRATION_OPTIONS.includes(administration as (typeof ADMINISTRATION_OPTIONS)[number])
      ) {
        return {
          success: false as const,
          error: { issues: [{ message: `Choose how you take ${item.label}.` }] },
        };
      }
      entry.administration = administration as MedicationUseInput["administration"];
      entry.administrationOther =
        entry.administration === "other"
          ? emptyToNull(formData.get(`med_${item.key}_administration_other`))
          : null;

      const forms = formulationValues(item);
      if (forms) {
        const formulation = emptyToNull(formData.get(`med_${item.key}_formulation`));
        if (formulation && !(forms as readonly string[]).includes(formulation)) {
          return {
            success: false as const,
            error: { issues: [{ message: `Choose a listed form for ${item.label}.` }] },
          };
        }
        entry.formulation = formulation;
        entry.formulationOther =
          formulation === "other"
            ? emptyToNull(formData.get(`med_${item.key}_formulation_other`))
            : null;
      }
    }

    if (status === "used_past_year" && item.followUp) {
      entry.followUp = readFollowUp(item, formData);
    }

    if (stopped || entry.followUp?.stillUsing === "no") {
      entry.stopReasons = readStopReasons(formData, item.key);
      entry.stopReasonOther = entry.stopReasons.includes("other")
        ? emptyToNull(formData.get(`med_${item.key}_stop_other`))
        : null;
    }

    if (usedThisWeek && item.context === "otc") {
      const frequencies = frequencyValues(item);
      const frequency = emptyToNull(formData.get(`med_${item.key}_frequency`));
      if (frequency && frequencies && !(frequencies as readonly string[]).includes(frequency)) {
        return {
          success: false as const,
          error: { issues: [{ message: `Choose how often you used ${item.label}.` }] },
        };
      }
      entry.otcFrequency = frequency;

      const tablets = readEnum(formData, `med_${item.key}_tablets`, TABLET_COUNTS);
      if (tablets && !TABLET_COUNTS.includes(tablets as (typeof TABLET_COUNTS)[number])) {
        return {
          success: false as const,
          error: { issues: [{ message: `Choose how many ${item.label} you took at one time.` }] },
        };
      }
      entry.tabletsAtOnce = tablets as MedicationUseInput["tabletsAtOnce"];

      if (item.asksStrength) {
        const strength = readDose(
          formData,
          `med_${item.key}_strength`,
          `med_${item.key}_strength_unknown`,
        );
        if (strength.amount !== null && !(strength.amount > 0)) {
          return {
            success: false as const,
            error: { issues: [{ message: `Enter the strength of ${item.label} in milligrams, or choose I don't know.` }] },
          };
        }
        entry.strengthMg = strength.unknown ? null : strength.amount;
        entry.strengthUnknown = strength.unknown;
      }

      if (item.asksExtraAndNight) {
        entry.extraStrength = readTriState(formData, `med_${item.key}_extra`);
        entry.nighttime = readTriState(formData, `med_${item.key}_night`);
      }
    }

    if (usedThisWeek && item.asksOtherText) {
      entry.otherText = emptyToNull(formData.get(`med_${item.key}_other`));
    }

    const parsed = useSchema.safeParse(entry);
    if (!parsed.success) {
      return {
        success: false as const,
        error: { issues: [{ message: parsed.error.issues[0]?.message ?? "Check the medication answers." }] },
      };
    }

    uses.push({ ...parsed.data, useContext: item.context });
  }

  const compoundedUsed = readTriState(formData, "compounded_used");
  const compoundedCountRaw = emptyToNull(formData.get("compounded_count"));
  let compoundedCount: number | null = null;
  if (compoundedUsed === "yes") {
    if (!compoundedCountRaw || !/^\d+$/.test(compoundedCountRaw)) {
      return {
        success: false as const,
        error: {
          issues: [
            {
              message:
                "Enter how many different compounded medications you used in the past year, not counting low-dose naltrexone.",
            },
          ],
        },
      };
    }
    compoundedCount = Number(compoundedCountRaw);
  }

  const compounded: CompoundedMedicationInput[] = [];
  const detailCount = compoundedUsed === "yes" ? Math.min(compoundedCount ?? 0, 3) : 0;
  for (let position = 1; position <= detailCount; position += 1) {
    const prefix = `compound_${position}`;
    const name = emptyToNull(formData.get(`${prefix}_name`)) ?? "";
    const ingredients = [
      ...new Set(
        formData
          .getAll(`${prefix}_ingredients`)
          .map((value) => String(value))
          .filter((value) => (COMPOUNDED_INGREDIENTS as readonly string[]).includes(value)),
      ),
    ];
    const form = emptyToNull(formData.get(`${prefix}_form`));
    const effect = emptyToNull(formData.get(`${prefix}_effect`));
    const pharmacy = emptyToNull(formData.get(`${prefix}_pharmacy`));
    const parsed = compoundedSchema.safeParse({
      position,
      name,
      ingredients,
      ingredientOther: ingredients.includes("other")
        ? emptyToNull(formData.get(`${prefix}_ingredient_other`))
        : null,
      form: form && (COMPOUNDED_FORMS as readonly string[]).includes(form) ? form : null,
      formOther: form === "other" ? emptyToNull(formData.get(`${prefix}_form_other`)) : null,
      effect: effect && (COMPOUNDED_EFFECTS as readonly string[]).includes(effect) ? effect : null,
      stillUsing: readTriState(formData, `${prefix}_still`),
      pharmacyType:
        pharmacy && (COMPOUNDED_SOURCES as readonly string[]).includes(pharmacy) ? pharmacy : null,
    });

    if (!parsed.success) {
      return {
        success: false as const,
        error: {
          issues: [
            {
              message:
                parsed.error.issues[0]?.message ??
                `Enter a name for compounded medication ${position}.`,
            },
          ],
        },
      };
    }

    if (form && !(COMPOUNDED_FORMS as readonly string[]).includes(form)) {
      return {
        success: false as const,
        error: { issues: [{ message: "Choose a listed compounded medication form." }] },
      };
    }

    compounded.push(parsed.data);
  }

  const cannabisUsed = readTriState(formData, "cannabis_used");
  const erVisited = readTriState(formData, "er_visited");
  const sentHome = erVisited === "yes" ? readTriState(formData, "er_sent_home") : null;
  const givenIv = sentHome === "no" ? readTriState(formData, "er_iv") : null;
  const visitCountRaw = emptyToNull(formData.get("er_visit_count"));
  let erVisitCount: number | null = null;
  if (erVisited === "yes" && visitCountRaw) {
    if (!/^\d+$/.test(visitCountRaw)) {
      return {
        success: false as const,
        error: { issues: [{ message: "Enter the number of emergency department visits as a whole number." }] },
      };
    }
    erVisitCount = Number(visitCountRaw);
  }

  const contextCandidate = {
    compoundedUsed,
    compoundedCount,
    cannabisUsed,
    cannabisMedicalDispensary:
      cannabisUsed === "yes" ? readTriState(formData, "cannabis_medical") : null,
    cannabisOpenDispensary: cannabisUsed === "yes" ? readTriState(formData, "cannabis_open") : null,
    cannabisOtherPlace: cannabisUsed === "yes" ? readTriState(formData, "cannabis_other") : null,
    cannabisRelief:
      cannabisUsed === "yes" &&
      (CANNABIS_RELIEF as readonly string[]).includes(String(formData.get("cannabis_relief") ?? ""))
        ? (String(formData.get("cannabis_relief")) as MedicationContextInput["cannabisRelief"])
        : null,
    erVisited,
    erVisitCount,
    erSentHomeNoTreatment: sentHome,
    erGivenOpiate: sentHome === "no" ? readTriState(formData, "er_opiate") : null,
    erGivenIvAnticonvulsant: givenIv,
    erAskedForNamedProtocol: givenIv === "yes" ? readTriState(formData, "er_protocol") : null,
    erOtherMedication: sentHome === "no" ? readTriState(formData, "er_other_med") : null,
    erAdmitted: erVisited === "yes" ? readTriState(formData, "er_admitted") : null,
    erFeltHeard: erVisited === "yes" ? readTriState(formData, "er_heard") : null,
    erTreatedAsDrugSeeking: erVisited === "yes" ? readTriState(formData, "er_drug_seeking") : null,
    medicationsInFront: (MEDICATIONS_IN_FRONT as readonly string[]).includes(
      String(formData.get("medications_in_front") ?? ""),
    )
      ? (String(formData.get("medications_in_front")) as MedicationContextInput["medicationsInFront"])
      : null,
    answerConfidence: (ANSWER_CONFIDENCE as readonly string[]).includes(
      String(formData.get("answer_confidence") ?? ""),
    )
      ? (String(formData.get("answer_confidence")) as MedicationContextInput["answerConfidence"])
      : null,
  };

  const context = contextSchema.safeParse(contextCandidate);
  if (!context.success) {
    return {
      success: false as const,
      error: { issues: [{ message: context.error.issues[0]?.message ?? "Check the medication answers." }] },
    };
  }

  if (uses.some((use) => !getMedicationCatalogItem(use.catalogKey))) {
    return {
      success: false as const,
      error: { issues: [{ message: "One of the medications is not in the survey list." }] },
    };
  }

  return {
    success: true as const,
    data: {
      uses,
      compounded,
      context: context.data,
    } satisfies MedicationInventoryInput,
  };
}
