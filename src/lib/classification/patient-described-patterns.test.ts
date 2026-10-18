import { describe, expect, it } from "vitest";
import {
  getReviewerClassificationMapping,
  PATIENT_DESCRIBED_PATTERNS,
} from "./patient-described-patterns";

describe("patient described patterns", () => {
  it("keeps reviewer codes off the patient-facing prompt", () => {
    for (const pattern of PATIENT_DESCRIBED_PATTERNS) {
      expect(pattern.prompt).not.toMatch(/ICOP|ICHD|13\.\d|4\.\d/);
    }
  });

  it("stores source-backed reviewer mappings without converting systems", () => {
    const mapping = getReviewerClassificationMapping();

    expect(mapping.length).toBe(PATIENT_DESCRIBED_PATTERNS.length);
    expect(mapping.some((entry) => entry.reviewerCodes.some((code) => code.system === "ICHD-3"))).toBe(
      true,
    );
    expect(mapping.every((entry) => entry.reviewerCodes.length > 0)).toBe(true);
  });
});
