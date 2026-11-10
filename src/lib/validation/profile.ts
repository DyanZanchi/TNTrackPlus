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
  CLASSIFICATION_FOLLOWUP_KEYS,
  CLASSIFICATION_YES_NO,
  idiopathicFollowUpApplies,
  OTHER_NEUROPATHIC_FOLLOWUP,
  IDIOPATHIC_LEARNED_CAUSE_FOLLOWUP,
  NEUROPATHIC_CAUSE_FOLLOWUPS,
  SHOCK_CAUSE_FOLLOWUPS,
} from "@/lib/classification/classification-followups";
import {
  DESCRIBED_PATTERN_KEYS,
  DESCRIBED_PATTERN_STATUS_OPTIONS,
  shockLikeFollowUpsApply,
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
    classification_followups: z
      .array(
        z.object({
          answer_key: z.enum(CLASSIFICATION_FOLLOWUP_KEYS),
          answer: z.enum(CLASSIFICATION_YES_NO),
          detail_text: z
            .string()
            .trim()
            .max(500, "Cause details must be 500 characters or less.")
            .nullable(),
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

    values.classification_followups.forEach((entry, index) => {
      if (entry.answer === "yes" && (entry.answer_key === "neuropathic_other_condition" || entry.answer_key === "learned_cause_atypical") && !entry.detail_text) {
        context.addIssue({
          code: "custom",
          message: "Describe the cause of your pain.",
          path: ["classification_followups", index, "detail_text"],
        });
      }
    });
  })
  .transform((values) => {
    const shockStatus = values.described_patterns.find(
      (pattern) => pattern.pattern_key === "shock_like_paroxysmal",
    )?.status;
    const describedPatterns = values.described_patterns.filter((pattern) => {
      if (pattern.pattern_key === "background_between_shocks") {
        return shockLikeFollowUpsApply(shockStatus);
      }
      return true;
    });

    const followUpByKey = Object.fromEntries(
      values.classification_followups.map((entry) => [entry.answer_key, entry]),
    );
    const classificationFollowups = values.classification_followups.filter((entry) => {
      if (SHOCK_CAUSE_FOLLOWUPS.some((item) => item.key === entry.answer_key)) {
        return shockLikeFollowUpsApply(shockStatus);
      }
      if (entry.answer_key === IDIOPATHIC_LEARNED_CAUSE_FOLLOWUP.key) {
        return idiopathicFollowUpApplies({
          neuropathic_after_injury: followUpByKey.neuropathic_after_injury?.answer ?? "",
          neuropathic_after_dental: followUpByKey.neuropathic_after_dental?.answer ?? "",
          neuropathic_after_pain_procedure:
            followUpByKey.neuropathic_after_pain_procedure?.answer ?? "",
          neuropathic_other_condition: followUpByKey.neuropathic_other_condition?.answer ?? "",
        });
      }
      return true;
    });

    return {
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
      described_patterns: describedPatterns,
      classification_followups: classificationFollowups.map((entry) => ({
        answer_key: entry.answer_key,
        answer: entry.answer,
        detail_text:
          entry.answer === "yes" &&
          (entry.answer_key === OTHER_NEUROPATHIC_FOLLOWUP.key ||
            entry.answer_key === IDIOPATHIC_LEARNED_CAUSE_FOLLOWUP.key)
            ? entry.detail_text
            : null,
      })),
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
    };
  });

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

export function parseClassificationFollowups(formData: FormData) {
  const keys = [
    ...SHOCK_CAUSE_FOLLOWUPS.map((item) => item.key),
    ...NEUROPATHIC_CAUSE_FOLLOWUPS.map((item) => item.key),
    OTHER_NEUROPATHIC_FOLLOWUP.key,
    IDIOPATHIC_LEARNED_CAUSE_FOLLOWUP.key,
  ];

  return keys.flatMap((answerKey) => {
    const answer = formData.get(`classification_${answerKey}`);
    if (answer !== "yes" && answer !== "no") {
      return [];
    }

    const detailRaw = formData.get(`classification_${answerKey}_detail`);
    const detailText =
      typeof detailRaw === "string" && detailRaw.trim() ? detailRaw.trim() : null;

    return [
      {
        answer_key: answerKey,
        answer,
        detail_text: detailText,
      },
    ];
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
    classification_followups: parseClassificationFollowups(formData),
    headache_patterns: parseHeadachePatterns(formData),
  });
}
