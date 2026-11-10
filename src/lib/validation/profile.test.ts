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

  it("keeps shock-cause follow-ups only when shock-like pain is present", () => {
    const withShock = parseProfile({
      age: "54",
      gender: "female",
      gender_other: "",
      pain_type_ids: ["44444444-4444-4444-8444-000000000001"],
      described_pattern_shock_like_paroxysmal: "have_now",
      described_pattern_background_between_shocks: "have_now",
      classification_shock_cause_ms: "yes",
      classification_shock_cause_space_occupying: "no",
      classification_shock_cause_other_condition: "no",
      classification_shock_cause_vascular_compression: "yes",
      classification_neuropathic_after_injury: "no",
      classification_neuropathic_after_dental: "no",
      classification_neuropathic_after_pain_procedure: "no",
      classification_neuropathic_other_condition: "no",
      classification_learned_cause_atypical: "no",
      described_pattern_glossopharyngeal_neuropathic: "never",
      described_pattern_raeder_eye_pain: "had_past",
    });

    expect(withShock.success).toBe(true);
    if (withShock.success) {
      expect(withShock.data.classification_followups).toEqual(
        expect.arrayContaining([
          {
            answer_key: "shock_cause_ms",
            answer: "yes",
            detail_text: null,
          },
          {
            answer_key: "learned_cause_atypical",
            answer: "no",
            detail_text: null,
          },
        ]),
      );
      expect(
        withShock.data.described_patterns.some(
          (pattern) => pattern.pattern_key === "glossopharyngeal_neuropathic",
        ),
      ).toBe(true);
    }

    const withoutShock = parseProfile({
      age: "54",
      gender: "female",
      gender_other: "",
      pain_type_ids: ["44444444-4444-4444-8444-000000000001"],
      described_pattern_shock_like_paroxysmal: "never",
      described_pattern_background_between_shocks: "have_now",
      classification_shock_cause_ms: "yes",
      classification_neuropathic_after_injury: "yes",
      classification_neuropathic_other_condition: "no",
      classification_learned_cause_atypical: "yes",
      classification_learned_cause_atypical_detail: "unknown label",
    });

    expect(withoutShock.success).toBe(true);
    if (withoutShock.success) {
      expect(
        withoutShock.data.described_patterns.some(
          (pattern) => pattern.pattern_key === "background_between_shocks",
        ),
      ).toBe(false);
      expect(
        withoutShock.data.classification_followups.some((entry) =>
          entry.answer_key.startsWith("shock_cause_"),
        ),
      ).toBe(false);
      expect(
        withoutShock.data.classification_followups.some(
          (entry) => entry.answer_key === "learned_cause_atypical",
        ),
      ).toBe(false);
    }
  });
});
