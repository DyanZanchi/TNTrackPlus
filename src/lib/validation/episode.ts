import { z } from "zod";
import { FACE_AREA_OPTIONS, PAIN_TYPE_OPTIONS } from "@/lib/constants/episode-options";

const durationPattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

function parseDurationToSeconds(value: string) {
  const match = durationPattern.exec(value);

  if (!match) {
    return null;
  }

  const [, hours, minutes, seconds] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

export const episodeSchema = z.object({
  pain_type: z.enum(PAIN_TYPE_OPTIONS, {
    error: "Select the facial pain type.",
  }),
  face_areas: z
    .array(z.enum(FACE_AREA_OPTIONS))
    .transform((values) => Array.from(new Set(values)))
    .refine((values) => values.length > 0, "Select at least one face area."),
  severity: z.coerce
    .number()
    .int()
    .min(1, "Severity must be between 1 and 10.")
    .max(10, "Severity must be between 1 and 10."),
  duration_hms: z
    .string()
    .trim()
    .regex(durationPattern, "Episode length must use hh:mm:ss format.")
    .transform((value) => parseDurationToSeconds(value))
    .refine((value) => value !== null && value > 0, "Episode length must be at least 00:00:01.")
    .refine((value) => value !== null && value <= 86399, "Episode length must be 23:59:59 or less.")
    .transform((value) => value as number),
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
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be 500 characters or less.")
    .optional()
    .transform((value) => (value ? value : "")),
});

export type EpisodeFormValues = z.input<typeof episodeSchema>;
export type EpisodeInsert = z.output<typeof episodeSchema>;
