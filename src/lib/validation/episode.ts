import { z } from "zod";
import {
  DURATION_STATUS_OPTIONS,
  DURATION_UNIT_MAX,
  DURATION_UNIT_OPTIONS,
  DURATION_UNIT_SECONDS,
  FACE_AREA_OPTIONS,
  NO_MEDICATION_OPTION_ID,
  NUMBNESS_OPTIONS,
  NUMBNESS_TIMING_OPTIONS,
  PAIN_PATTERN_OPTIONS,
  PAIN_QUALITY_OPTIONS,
  THROBBING_ASSOCIATION_NONE,
  THROBBING_ASSOCIATION_OPTIONS,
  YES_NO_UNSURE_OPTIONS,
} from "@/lib/constants/episode-options";
import { getUniqueDivisions } from "@/lib/face-map/classify";
import { FACE_LOCATION_KEYS } from "@/lib/face-map/types";
import { hasExclusiveNoClearTrigger } from "@/lib/taxonomy/shared";

const durationPattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

function parseDurationToSeconds(value: string) {
  const match = durationPattern.exec(value);

  if (!match) {
    return null;
  }

  const [, hours, minutes, seconds] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

const facePointSchema = z.object({
  x: z.coerce.number().min(0).max(1000),
  y: z.coerce.number().min(0).max(1000),
  division: z.enum(FACE_AREA_OPTIONS),
  location: z.enum(FACE_LOCATION_KEYS),
  label: z.string().min(1),
});

function nullishToString(value: unknown) {
  return value == null ? "" : String(value);
}

function parseFacePoints(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return z.array(facePointSchema).parse(parsed);
  } catch {
    return null;
  }
}

function optionalEnum<T extends readonly [string, ...string[]]>(options: T) {
  return z.preprocess(
    (value) => (value == null || value === "" ? null : value),
    z.enum(options).nullable(),
  );
}

function checkboxToBoolean(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "1";
}

export const episodeSchema = z
  .object({
    pain_qualities: z
      .array(
        z.enum(PAIN_QUALITY_OPTIONS, {
          error: "Select a valid pain description.",
        }),
      )
      .min(1, "Select at least one pain description."),
    pain_quality_other: z.preprocess(
      nullishToString,
      z.string().trim().max(200, "Other pain description must be 200 characters or less."),
    ),
    had_numbness: z.enum(NUMBNESS_OPTIONS, {
      error: "Indicate whether you had numbness.",
    }),
    numbness_location: z.preprocess(
      nullishToString,
      z.string().trim().max(200, "Numbness location must be 200 characters or less."),
    ),
    numbness_onset_date: z.preprocess(nullishToString, z.string().trim()),
    numbness_onset_unknown: z.preprocess(checkboxToBoolean, z.boolean()),
    numbness_after_procedure: optionalEnum(YES_NO_UNSURE_OPTIONS),
    numbness_procedure_note: z.preprocess(
      nullishToString,
      z.string().trim().max(200, "Procedure note must be 200 characters or less."),
    ),
    numbness_timing: optionalEnum(NUMBNESS_TIMING_OPTIONS),
    throbbing_associations: z
      .array(
        z.enum(THROBBING_ASSOCIATION_OPTIONS, {
          error: "Select a valid associated symptom.",
        }),
      )
      .default([]),
    pain_pattern: z.enum(PAIN_PATTERN_OPTIONS, {
      error: "Select whether the pain was continuous or episodic.",
    }),
    pulse_duration_hms: z.preprocess(nullishToString, z.string().trim()),
    face_points: z.preprocess(
      (value) => parseFacePoints(value as FormDataEntryValue | null),
      z
        .array(facePointSchema)
        .min(1, "Tap at least one point on the face.")
        .or(z.literal(null)),
    ),
    severity: z.coerce
      .number()
      .int()
      .min(1, "Severity must be between 1 and 10.")
      .max(10, "Severity must be between 1 and 10."),
    functional_impact: z.preprocess(
      (value) => (value == null || value === "" ? null : value),
      z.coerce
        .number()
        .int()
        .min(1, "Functional impact must be between 1 and 10.")
        .max(10, "Functional impact must be between 1 and 10.")
        .nullable(),
    ),
    background_severity_before: z.preprocess(
      (value) => (value == null || value === "" ? null : value),
      z.coerce
        .number()
        .int()
        .min(1, "Background intensity must be between 1 and 10.")
        .max(10, "Background intensity must be between 1 and 10.")
        .nullable(),
    ),
    duration_status: z.preprocess(
      (value) => (value == null || value === "" ? "known" : value),
      z.enum(DURATION_STATUS_OPTIONS, {
        error: "Indicate whether you know how long the episode lasted.",
      }),
    ),
    duration_unit: z.preprocess(
      (value) => (value == null || value === "" ? undefined : value),
      z.enum(DURATION_UNIT_OPTIONS).optional(),
    ),
    duration_amount: z.preprocess(
      (value) => (value == null || value === "" ? undefined : value),
      z.coerce
        .number({ error: "Enter how long the episode lasted." })
        .int("Enter a whole number.")
        .min(1, "Enter at least 1.")
        .optional(),
    ),
    pain_changed_during: optionalEnum(YES_NO_UNSURE_OPTIONS),
    pain_change_summary: z.preprocess(
      nullishToString,
      z.string().trim().max(300, "Pain-change summary must be 300 characters or less."),
    ),
    onset_at: z
      .string()
      .min(1, "Provide the onset time.")
      .transform((value) => new Date(value))
      .refine((value) => !Number.isNaN(value.getTime()), "Provide a valid onset time.")
      .transform((value) => value.toISOString()),
    trigger_ids: z
      .array(z.string().uuid("Select a valid trigger option."))
      .min(1, "Select at least one trigger."),
    medication_within_24h: z.enum(["yes", "no", "not_sure"], {
      error: "Indicate whether you took medication within the past 24 hours.",
    }),
    medication_ids: z.array(z.string().uuid("Select a valid medication option.")).default([]),
    notes: z.preprocess(
      nullishToString,
      z.string().trim().max(500, "Notes must be 500 characters or less."),
    ),
    treatment_history_changed: z
      .enum(["yes", "no"], {
        error: "Indicate whether your treatment history has changed since your last entry.",
      })
      .transform((value) => value === "yes"),
    treatment_change_date: z.preprocess(nullishToString, z.string().trim()),
  })
  .superRefine((values, context) => {
    if (values.face_points === null) {
      context.addIssue({
        code: "custom",
        message: "Tap at least one point on the face.",
        path: ["face_points"],
      });
    }

    if (values.pain_qualities.includes("other") && !values.pain_quality_other) {
      context.addIssue({
        code: "custom",
        message: "Describe the pain in your own words.",
        path: ["pain_quality_other"],
      });
    }

    if (values.pain_qualities.includes("throbbing")) {
      if (
        values.throbbing_associations.includes(THROBBING_ASSOCIATION_NONE) &&
        values.throbbing_associations.length > 1
      ) {
        context.addIssue({
          code: "custom",
          message: "Choose No, or select the associated symptoms, not both.",
          path: ["throbbing_associations"],
        });
      }
    }

    if (values.had_numbness === "yes" && values.numbness_onset_date) {
      const onsetDate = new Date(`${values.numbness_onset_date}T12:00:00`);

      if (Number.isNaN(onsetDate.getTime())) {
        context.addIssue({
          code: "custom",
          message: "Enter a valid numbness onset date.",
          path: ["numbness_onset_date"],
        });
      }
    }

    if (values.duration_status === "known") {
      if (!values.duration_unit) {
        context.addIssue({
          code: "custom",
          message: "Choose whether the episode lasted minutes, hours, or days.",
          path: ["duration_unit"],
        });
      }

      if (values.duration_amount == null) {
        context.addIssue({
          code: "custom",
          message: "Enter how long the episode lasted.",
          path: ["duration_amount"],
        });
      } else if (values.duration_unit) {
        const durationMax = DURATION_UNIT_MAX[values.duration_unit];

        if (values.duration_amount > durationMax) {
          context.addIssue({
            code: "custom",
            message: `Enter ${durationMax} ${values.duration_unit} or fewer.`,
            path: ["duration_amount"],
          });
        }
      }
    }

    if (values.pain_pattern === "episodic_pulsing") {
      if (!values.pulse_duration_hms) {
        context.addIssue({
          code: "custom",
          message: "Enter the length of each pulse.",
          path: ["pulse_duration_hms"],
        });
        return;
      }

      const pulseSeconds = parseDurationToSeconds(values.pulse_duration_hms);

      if (pulseSeconds === null) {
        context.addIssue({
          code: "custom",
          message: "Pulse length must use hh:mm:ss format.",
          path: ["pulse_duration_hms"],
        });
        return;
      }

      if (pulseSeconds <= 0) {
        context.addIssue({
          code: "custom",
          message: "Pulse length must be at least 00:00:01.",
          path: ["pulse_duration_hms"],
        });
        return;
      }

      if (pulseSeconds > 86399) {
        context.addIssue({
          code: "custom",
          message: "Pulse length must be 23:59:59 or less.",
          path: ["pulse_duration_hms"],
        });
      }
    }

    if (hasExclusiveNoClearTrigger(values.trigger_ids)) {
      context.addIssue({
        code: "custom",
        message:
          "Choose Spontaneous / no clear trigger or Not sure by itself, or select the triggers that applied.",
        path: ["trigger_ids"],
      });
    }

    if (values.medication_within_24h === "yes") {
      if (!values.medication_ids.length) {
        context.addIssue({
          code: "custom",
          message: "Select at least one medication taken in the past 24 hours.",
          path: ["medication_ids"],
        });
      } else if (values.medication_ids.includes(NO_MEDICATION_OPTION_ID)) {
        context.addIssue({
          code: "custom",
          message: "Select the medications you took, or choose No if you did not take any.",
          path: ["medication_ids"],
        });
      }
    }

    if (values.treatment_history_changed) {
      if (!values.treatment_change_date) {
        context.addIssue({
          code: "custom",
          message: "Enter when the treatment history changed.",
          path: ["treatment_change_date"],
        });
        return;
      }

      const changeDate = new Date(`${values.treatment_change_date}T12:00:00`);

      if (Number.isNaN(changeDate.getTime())) {
        context.addIssue({
          code: "custom",
          message: "Enter a valid change date.",
          path: ["treatment_change_date"],
        });
      }
    }
  })
  .transform((values) => {
    const facePoints = values.face_points === null ? [] : values.face_points;
    const pulseDurationSeconds =
      values.pain_pattern === "episodic_pulsing"
        ? parseDurationToSeconds(values.pulse_duration_hms)
        : null;
    const recordedNumbness = values.had_numbness === "yes";
    const durationSeconds =
      values.duration_status === "known" && values.duration_unit && values.duration_amount != null
        ? values.duration_amount * DURATION_UNIT_SECONDS[values.duration_unit]
        : null;

    return {
      ...values,
      face_points: facePoints,
      face_areas: getUniqueDivisions(facePoints),
      pulse_duration_seconds: pulseDurationSeconds,
      duration_hms: durationSeconds,
      medication_ids:
        values.medication_within_24h === "no"
          ? [NO_MEDICATION_OPTION_ID]
          : values.medication_within_24h === "not_sure"
            ? []
            : values.medication_ids,
      pain_quality_other: values.pain_qualities.includes("other")
        ? values.pain_quality_other
        : null,
      throbbing_associations: values.pain_qualities.includes("throbbing")
        ? values.throbbing_associations
        : [],
      numbness_location: recordedNumbness && values.numbness_location ? values.numbness_location : null,
      numbness_onset_date:
        recordedNumbness && !values.numbness_onset_unknown && values.numbness_onset_date
          ? values.numbness_onset_date
          : null,
      numbness_onset_unknown: recordedNumbness ? values.numbness_onset_unknown : false,
      numbness_after_procedure: recordedNumbness ? values.numbness_after_procedure : null,
      numbness_procedure_note:
        recordedNumbness && values.numbness_after_procedure === "yes" && values.numbness_procedure_note
          ? values.numbness_procedure_note
          : null,
      numbness_timing: recordedNumbness ? values.numbness_timing : null,
      pain_change_summary:
        values.pain_changed_during === "yes" && values.pain_change_summary
          ? values.pain_change_summary
          : null,
      treatment_change_date: values.treatment_history_changed
        ? values.treatment_change_date
        : null,
    };
  });

export type EpisodeFormValues = z.input<typeof episodeSchema>;
export type EpisodeInsert = z.output<typeof episodeSchema>;
