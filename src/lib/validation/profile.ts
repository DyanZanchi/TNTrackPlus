import { z } from "zod";
import {
  GENDER_OPTIONS,
  OTHER_THERAPY_OPTIONS,
  PRIOR_TREATMENT_OPTIONS,
} from "@/lib/constants/profile-options";

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

export const profileSchema = z
  .object({
    age: z.coerce
      .number()
      .int("Enter your age.")
      .min(1, "Age must be between 1 and 120.")
      .max(120, "Age must be between 1 and 120."),
    gender: z.enum(GENDER_OPTIONS, { error: "Select a gender option." }),
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
  })
  .transform((values) => ({
    age: values.age,
    gender: values.gender,
    gender_other: values.gender === "other" ? values.gender_other : "",
    prior_treatments: values.prior_treatments.map((treatment) => ({
      treatment_type: treatment,
      other_label: treatment === "other" ? values.prior_treatment_other : null,
    })),
    other_therapies: values.other_therapies.map((therapy) => ({
      therapy_type: therapy,
      other_label: therapy === "other" ? values.other_therapy_other : null,
    })),
  }));

export function parseProfileFormData(formData: FormData) {
  return profileSchema.safeParse({
    age: formData.get("age"),
    gender: formData.get("gender"),
    gender_other: formData.get("gender_other"),
    prior_treatments: parseCheckboxList(formData.getAll("prior_treatments")),
    prior_treatment_other: emptyToUndefined(formData.get("prior_treatment_other")),
    other_therapies: parseCheckboxList(formData.getAll("other_therapies")),
    other_therapy_other: emptyToUndefined(formData.get("other_therapy_other")),
  });
}
