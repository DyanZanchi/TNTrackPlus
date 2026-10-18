import { z } from "zod";
import { FACE_AREA_OPTIONS, PAIN_QUALITY_OPTIONS } from "@/lib/constants/episode-options";
import { FACE_LOCATION_KEYS } from "@/lib/face-map/types";

const facePointSchema = z.object({
  x: z.coerce.number().min(0).max(1000),
  y: z.coerce.number().min(0).max(1000),
  division: z.enum(FACE_AREA_OPTIONS),
  location: z.enum(FACE_LOCATION_KEYS),
  label: z.string().min(1),
});

function parseFacePoints(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    return z.array(facePointSchema).parse(JSON.parse(value));
  } catch {
    return null;
  }
}

function nullishToString(value: unknown) {
  return value == null ? "" : String(value);
}

export const backgroundPainCheckInSchema = z
  .object({
    recorded_at: z
      .string()
      .min(1, "Provide the check-in time.")
      .transform((value) => new Date(value))
      .refine((value) => !Number.isNaN(value.getTime()), "Provide a valid check-in time.")
      .transform((value) => value.toISOString()),
    severity: z.coerce
      .number()
      .int()
      .min(1, "Intensity must be between 1 and 10.")
      .max(10, "Intensity must be between 1 and 10."),
    functional_impact: z.preprocess(
      (value) => (value == null || value === "" ? null : value),
      z.coerce
        .number()
        .int()
        .min(1, "Functional impact must be between 1 and 10.")
        .max(10, "Functional impact must be between 1 and 10.")
        .nullable(),
    ),
    pain_qualities: z.array(z.enum(PAIN_QUALITY_OPTIONS)).default([]),
    pain_quality_other: z.preprocess(
      nullishToString,
      z.string().trim().max(200, "Other pain description must be 200 characters or less."),
    ),
    face_points: z.preprocess(
      (value) => parseFacePoints(value as FormDataEntryValue | null),
      z.array(facePointSchema).or(z.literal(null)),
    ),
    notes: z.preprocess(
      nullishToString,
      z.string().trim().max(500, "Notes must be 500 characters or less."),
    ),
  })
  .superRefine((values, context) => {
    if (values.face_points === null) {
      context.addIssue({
        code: "custom",
        message: "Check the selected pain locations.",
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
  })
  .transform((values) => ({
    ...values,
    face_points: values.face_points ?? [],
    pain_quality_other: values.pain_qualities.includes("other")
      ? values.pain_quality_other
      : null,
  }));
