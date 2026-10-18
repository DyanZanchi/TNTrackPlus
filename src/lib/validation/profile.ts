import { z } from "zod";
import {
  CLINICIAN_EVALUATION_OPTIONS,
  DIAGNOSIS_STATUS_OPTIONS,
  GENDER_OPTIONS,
  OTHER_THERAPY_OPTIONS,
  PATIENT_PAIN_PATTERN_OPTIONS,
  PRIOR_TREATMENT_OPTIONS,
  RELEVANT_HISTORY_OPTIONS,
  isExclusiveHistoryOption,
} from "@/lib/constants/profile-options";
import { YES_NO_UNSURE_OPTIONS } from "@/lib/constants/episode-options";
import {
  DESCRIBED_PATTERN_KEYS,
  DESCRIBED_PATTERN_STATUS_OPTIONS,
} from "@/lib/classification/patient-described-patterns";
import {
  HEADACHE_PATTERN_KEYS,
  HEADACHE_PATTERN_STATUSES,
  headacheFollowUpApplies,
} from "@/lib/classification/headache-patterns";

function parseCheckboxList(values: FormDataEntryValue | FormDataEntryValue[] | null) {
  if (!values) {
    return [];
  }

  return (Array.isArray(values) ? values : [values]).map(String);
}

function emptyToUndefined(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function emptyToNull(value: unknown) {
  if (value == null || value === "") {
    return null;
  }

  return value;
}

function checkboxToBoolean(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "1";
}

const relevantHistoryEventSchema = z.object({
  event_type: z.enum(RELEVANT_HISTORY_OPTIONS),
  event_date: z.preprocess(emptyToNull, z.string().nullable()),
  event_date_unknown: z.preprocess(checkboxToBoolean, z.boolean()),
  symptoms_began_afterward: z.preprocess(
    emptyToNull,
    z.enum(YES_NO_UNSURE_OPTIONS).nullable(),
  ),
  notes: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.string().max(300, "History notes must be 300 characters or less."),
  ),
});

export const profileSchema = z
  .object({
    age: z.coerce
      .number()
      .int("Enter your age.")
      .min(1, "Age must be between 1 and 120.")
      .max(120, "Age must be between 1 and 120."),
    gender: z.enum(GENDER_OPTIONS, { error: "Select a gender option." }),
    pain_pattern: z.preprocess(
      (value) => (value == null || value === "" ? undefined : value),
      z.enum(PATIENT_PAIN_PATTERN_OPTIONS).optional(),
    ),
    clinician_evaluation_status: z.preprocess(
      emptyToNull,
      z.enum(CLINICIAN_EVALUATION_OPTIONS).nullable(),
    ),
    received_facial_pain_diagnosis: z.preprocess(
      emptyToNull,
      z.enum(DIAGNOSIS_STATUS_OPTIONS).nullable(),
    ),
    additional_undiagnosed_pain: z.preprocess(
      emptyToNull,
      z.enum(DIAGNOSIS_STATUS_OPTIONS).nullable(),
    ),
    pain_type_ids: z
      .array(z.string().min(1))
      .min(1, "Select at least one facial pain type."),
    gender_other: z
      .string()
      .trim()
      .optional()
      .transform((value) => value ?? ""),
    prior_treatments: z.array(z.enum(PRIOR_TREATMENT_OPTIONS)).default([]),
    prior_treatment_other: z
      .string()
      .trim()
      .optional()
      .transform((value) => value ?? ""),
    other_therapies: z.array(z.enum(OTHER_THERAPY_OPTIONS)).default([]),
    other_therapy_other: z
      .string()
      .trim()
      .optional()
      .transform((value) => value ?? ""),
    relevant_history_events: z.array(relevantHistoryEventSchema).default([]),
    described_patterns: z
      .array(
        z.object({
          pattern_key: z.enum(DESCRIBED_PATTERN_KEYS),
          status: z.enum(DESCRIBED_PATTERN_STATUS_OPTIONS),
        }),
      )
      .default([]),
    headache_patterns: z
      .array(
        z.object({
          pattern_key: z.enum(HEADACHE_PATTERN_KEYS),
          status: z.enum(HEADACHE_PATTERN_STATUSES),
          long_course: z.enum(["yes", "no"]).nullable(),
          autonomic_symptoms: z.enum(["yes", "no"]).nullable(),
        }),
      )
      .default([]),
  })
  .superRefine((values, context) => {
    if (values.gender === "other" && !values.gender_other) {
      context.addIssue({
        code: "custom",
        message: "Describe your gender when selecting Other.",
        path: ["gender_other"],
      });
    }

    if (values.prior_treatments.includes("other") && !values.prior_treatment_other) {
      context.addIssue({
        code: "custom",
        message: "Describe the other prior treatment.",
        path: ["prior_treatment_other"],
      });
    }

    if (values.other_therapies.includes("other") && !values.other_therapy_other) {
      context.addIssue({
        code: "custom",
        message: "Describe the other therapy.",
        path: ["other_therapy_other"],
      });
    }

    const exclusiveHistory = values.relevant_history_events.filter((event) =>
      isExclusiveHistoryOption(event.event_type),
    );

    if (exclusiveHistory.length && values.relevant_history_events.length > 1) {
      context.addIssue({
        code: "custom",
        message: "Choose No known precipitating event or Not sure by itself.",
        path: ["relevant_history_events"],
      });
    }

    values.relevant_history_events.forEach((event, index) => {
      if (event.event_date && !event.event_date_unknown) {
        const eventDate = new Date(`${event.event_date}T12:00:00`);

        if (Number.isNaN(eventDate.getTime())) {
          context.addIssue({
            code: "custom",
            message: "Enter a valid history date.",
            path: ["relevant_history_events", index, "event_date"],
          });
        }
      }
    });
  })
  .transform((values) => ({
    age: values.age,
    gender: values.gender,
    gender_other: values.gender === "other" ? values.gender_other : "",
    pain_pattern: values.pain_pattern ?? null,
    clinician_evaluation_status: values.clinician_evaluation_status,
    received_facial_pain_diagnosis:
      values.clinician_evaluation_status === "yes"
        ? values.received_facial_pain_diagnosis
        : null,
    additional_undiagnosed_pain:
      values.clinician_evaluation_status === "yes" &&
      values.received_facial_pain_diagnosis === "yes"
        ? values.additional_undiagnosed_pain
        : null,
    pain_type_ids: values.pain_type_ids,
    prior_treatments: values.prior_treatments.map((treatment) => ({
      treatment_type: treatment,
      other_label: treatment === "other" ? values.prior_treatment_other : null,
    })),
    other_therapies: values.other_therapies.map((therapy) => ({
      therapy_type: therapy,
      other_label: therapy === "other" ? values.other_therapy_other : null,
    })),
    described_patterns: values.described_patterns,
    headache_patterns: values.headache_patterns,
    relevant_history_events: values.relevant_history_events.map((event) => ({
      event_type: event.event_type,
      event_date:
        isExclusiveHistoryOption(event.event_type) || event.event_date_unknown
          ? null
          : event.event_date,
      event_date_unknown: isExclusiveHistoryOption(event.event_type)
        ? false
        : event.event_date_unknown,
      symptoms_began_afterward: isExclusiveHistoryOption(event.event_type)
        ? null
        : event.symptoms_began_afterward,
      notes: event.notes || null,
    })),
  }));

export function parseHeadachePatterns(formData: FormData) {
  return HEADACHE_PATTERN_KEYS.flatMap((patternKey) => {
    const status = formData.get(`headache_${patternKey}_status`);
    if (typeof status !== "string" || !status) {
      return [];
    }

    const longValue = formData.get(`headache_${patternKey}_long`);
    const longCourse =
      headacheFollowUpApplies(status) && (longValue === "yes" || longValue === "no") ? longValue : null;
    const autonomicValue = formData.get(`headache_${patternKey}_autonomic`);
    const autonomicSymptoms =
      patternKey === "hemicrania_continua" && longCourse === "yes" && (autonomicValue === "yes" || autonomicValue === "no")
        ? autonomicValue
        : null;

    return [
      {
        pattern_key: patternKey,
        status,
        long_course: longCourse,
        autonomic_symptoms: autonomicSymptoms,
      },
    ];
  });
}

export function parseDescribedPatterns(formData: FormData) {
  return DESCRIBED_PATTERN_KEYS.flatMap((patternKey) => {
    const status = formData.get(`described_pattern_${patternKey}`);

    if (typeof status !== "string" || !status) {
      return [];
    }

    return [{ pattern_key: patternKey, status }];
  });
}

export function parseRelevantHistoryEvents(formData: FormData) {
  return parseCheckboxList(formData.getAll("relevant_history_types")).map((eventType) => ({
    event_type: eventType,
    event_date: formData.get(`history_date_${eventType}`),
    event_date_unknown: formData.get(`history_date_unknown_${eventType}`),
    symptoms_began_afterward: formData.get(`history_symptoms_${eventType}`),
    notes: formData.get(`history_notes_${eventType}`),
  }));
}

export function parseProfileFormData(formData: FormData) {
  return profileSchema.safeParse({
    age: formData.get("age"),
    gender: formData.get("gender"),
    pain_pattern: formData.get("pain_pattern"),
    clinician_evaluation_status: formData.get("clinician_evaluation_status"),
    received_facial_pain_diagnosis: formData.get("received_facial_pain_diagnosis"),
    additional_undiagnosed_pain: formData.get("additional_undiagnosed_pain"),
    gender_other: formData.get("gender_other"),
    pain_type_ids: parseCheckboxList(formData.getAll("pain_type_ids")),
    prior_treatments: parseCheckboxList(formData.getAll("prior_treatments")),
    prior_treatment_other: emptyToUndefined(formData.get("prior_treatment_other")),
    other_therapies: parseCheckboxList(formData.getAll("other_therapies")),
    other_therapy_other: emptyToUndefined(formData.get("other_therapy_other")),
    relevant_history_events: parseRelevantHistoryEvents(formData),
    described_patterns: parseDescribedPatterns(formData),
    headache_patterns: parseHeadachePatterns(formData),
  });
}
