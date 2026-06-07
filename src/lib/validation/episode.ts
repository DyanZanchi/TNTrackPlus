import { z } from "zod";
import { FACE_AREA_OPTIONS, PAIN_PATTERN_OPTIONS } from "@/lib/constants/episode-options";
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

function durationHmsSchema(message: string) {
  return z
    .string()
    .trim()
    .regex(durationPattern, message)
    .transform((value) => parseDurationToSeconds(value))
    .refine((value) => value !== null && value > 0, "Duration must be at least 00:00:01.")
    .refine((value) => value !== null && value <= 86399, "Duration must be 23:59:59 or less.")
    .transform((value) => value as number);
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
    duration_hms: durationHmsSchema("Episode length must use hh:mm:ss format."),
    onset_at: z
      .string()
      .min(1, "Provide the onset time.")
      .transform((value) => new Date(value))
      .refine((value) => !Number.isNaN(value.getTime()), "Provide a valid onset time.")
      .transform((value) => value.toISOString()),
    trigger_ids: z
      .array(z.string().uuid("Select a valid trigger option."))
      .min(1, "Select at least one trigger."),
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
      treatment_change_date: values.treatment_history_changed
        ? values.treatment_change_date
        : null,
    };
  });

export type EpisodeFormValues = z.input<typeof episodeSchema>;
export type EpisodeInsert = z.output<typeof episodeSchema>;
