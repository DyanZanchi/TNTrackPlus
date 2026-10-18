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
      pain_pattern: "continuous_with_episodes",
      pain_type_ids: ["44444444-4444-4444-8444-000000000001"],
      prior_treatments: ["mvd", "gamma_knife"],
      prior_treatment_other: "",
      other_therapies: ["acupuncture"],
      other_therapy_other: "",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.age).toBe(54);
      expect(result.data.pain_pattern).toBe("continuous_with_episodes");
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

  it("accepts optional clinician and history details", () => {
    const result = parseProfile({
      age: "54",
      gender: "female",
      gender_other: "",
      pain_type_ids: ["44444444-4444-4444-8444-000000000001"],
      clinician_evaluation_status: "yes",
      received_facial_pain_diagnosis: "yes",
      additional_undiagnosed_pain: "no",
      relevant_history_types: ["dental_work"],
      history_date_dental_work: "2024-11-02",
      history_symptoms_dental_work: "not_sure",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.clinician_evaluation_status).toBe("yes");
      expect(result.data.received_facial_pain_diagnosis).toBe("yes");
      expect(result.data.relevant_history_events).toEqual([
        {
          event_type: "dental_work",
          event_date: "2024-11-02",
          event_date_unknown: false,
          symptoms_began_afterward: "not_sure",
          notes: null,
        },
      ]);
    }
  });

  it("rejects combining exclusive history options with other events", () => {
    const result = parseProfile({
      age: "54",
      gender: "female",
      pain_type_ids: ["44444444-4444-4444-8444-000000000001"],
      relevant_history_types: ["dental_work", "no_known_event"],
    });

    expect(result.success).toBe(false);
  });
});
