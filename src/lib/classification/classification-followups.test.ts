import { describe, expect, it } from "vitest";
import {
  ALL_CLASSIFICATION_FOLLOWUPS,
  getClassificationFollowUpReviewerMapping,
  idiopathicFollowUpApplies,
} from "./classification-followups";

describe("classification followups", () => {
  it("keeps reviewer codes off patient-facing prompts", () => {
    for (const item of ALL_CLASSIFICATION_FOLLOWUPS) {
      expect(item.prompt).not.toMatch(/ICOP|ICHD|13\.\d|4\.\d/);
    }
  });

  it("asks Q7 only when Q5 and Q6 name no cause", () => {
    expect(
      idiopathicFollowUpApplies({
        neuropathic_after_injury: "no",
        neuropathic_after_dental: "no",
        neuropathic_after_pain_procedure: "no",
        neuropathic_other_condition: "no",
      }),
    ).toBe(true);

    expect(
      idiopathicFollowUpApplies({
        neuropathic_after_injury: "yes",
        neuropathic_after_dental: "no",
        neuropathic_after_pain_procedure: "no",
        neuropathic_other_condition: "no",
      }),
    ).toBe(false);
  });

  it("exposes reviewer mappings without inventing ICD codes", () => {
    const mapping = getClassificationFollowUpReviewerMapping();
    expect(mapping.some((entry) => entry.answerKey === "shock_cause_ms")).toBe(true);
    expect(
      mapping.every((entry) =>
        entry.reviewerCodes.every((code) => code.system === "ICOP" || code.system === "ICHD-3"),
      ),
    ).toBe(true);
  });
});
