import { describe, expect, it } from "vitest";
import { parseProfileFormData } from "./profile";

function parseProfile(values: Record<string, unknown>) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => formData.append(key, String(entry)));
      return;
    }

    if (value !== undefined && value !== null) {
      formData.set(key, String(value));
    }
  });

  return parseProfileFormData(formData);
}

describe("profileSchema", () => {
  it("accepts a complete patient profile", () => {
    const result = parseProfile({
      age: "54",
      gender: "female",
      gender_other: "",
      pain_type_ids: ["44444444-4444-4444-8444-000000000001"],
      prior_treatments: ["mvd", "gamma_knife"],
      prior_treatment_other: "",
      other_therapies: ["acupuncture"],
      other_therapy_other: "",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.age).toBe(54);
      expect(result.data.prior_treatments).toHaveLength(2);
    }
  });

  it("requires details when other prior treatment is selected", () => {
    const result = parseProfile({
      age: "54",
      gender: "female",
      gender_other: "",
      pain_type_ids: ["44444444-4444-4444-8444-000000000001"],
      prior_treatments: ["other"],
      prior_treatment_other: "",
      other_therapies: [],
      other_therapy_other: "",
    });

    expect(result.success).toBe(false);
  });
});
