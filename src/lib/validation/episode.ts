import { z } from "zod";
import {
  DURATION_UNIT_MAX,
  DURATION_UNIT_OPTIONS,
  DURATION_UNIT_SECONDS,
  FACE_AREA_OPTIONS,
  NO_MEDICATION_OPTION_ID,
  NUMBNESS_OPTIONS,
  PAIN_PATTERN_OPTIONS,
  PAIN_QUALITY_OPTIONS,
  THROBBING_ASSOCIATION_NONE,
  THROBBING_ASSOCIATION_OPTIONS,
} from "@/lib/constants/episode-options";
import { getUniqueDivisions } from "@/lib/face-map/classify";
import { FACE_LOCATION_KEYS } from "@/lib/face-map/types";

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

export const episodeSchema = z
  .object({
    pain_qualities: z
      .array(
        z.enum(PAIN_QUALITY_OPTIONS, {
          error: "Select a valid pain type.",
        }),
      )
      .min(1, "Select at least one pain type."),
    pain_quality_other: z.preprocess(
      nullishToString,
      z.string().trim().max(200, "Other pain description must be 200 characters or less."),
    ),
    had_numbness: z.enum(NUMBNESS_OPTIONS, {
      error: "Indicate whether you had numbness.",
    }),
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
    duration_unit: z.enum(DURATION_UNIT_OPTIONS, {
      error: "Choose whether the episode lasted minutes, hours, or days.",
    }),
    duration_amount: z.preprocess(
      (value) => (value == null || value === "" ? undefined : value),
      z.coerce
        .number({ error: "Enter how long the episode lasted." })
        .int("Enter a whole number.")
        .min(1, "Enter at least 1."),
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
    medication_within_24h: z.enum(["yes", "no"], {
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
        message: "Describe the other pain type.",
        path: ["pain_quality_other"],
      });
    }

    if (values.pain_qualities.includes("throbbing")) {
      if (!values.throbbing_associations.length) {
        context.addIssue({
          code: "custom",
          message: "Indicate whether the throbbing pain was associated with any of these symptoms.",
          path: ["throbbing_associations"],
        });
      } else if (
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

    const durationMax = DURATION_UNIT_MAX[values.duration_unit];

    if (values.duration_amount > durationMax) {
      context.addIssue({
        code: "custom",
        message: `Enter ${durationMax} ${values.duration_unit} or fewer.`,
        path: ["duration_amount"],
      });
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

    return {
      ...values,
      face_points: facePoints,
      face_areas: getUniqueDivisions(facePoints),
      pulse_duration_seconds: pulseDurationSeconds,
      duration_hms: values.duration_amount * DURATION_UNIT_SECONDS[values.duration_unit],
      medication_ids:
        values.medication_within_24h === "no"
          ? [NO_MEDICATION_OPTION_ID]
          : values.medication_ids,
      pain_quality_other: values.pain_qualities.includes("other")
        ? values.pain_quality_other
        : null,
      throbbing_associations: values.pain_qualities.includes("throbbing")
        ? values.throbbing_associations
        : [],
      treatment_change_date: values.treatment_history_changed
        ? values.treatment_change_date
        : null,
    };
  });

export type EpisodeFormValues = z.input<typeof episodeSchema>;
export type EpisodeInsert = z.output<typeof episodeSchema>;
