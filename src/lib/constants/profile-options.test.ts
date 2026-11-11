import { describe, expect, it } from "vitest";
import {
  occurrenceFromPainPattern,
  painPatternFromOccurrence,
} from "./profile-options";

describe("pain pattern occurrence mapping", () => {
  it("puts background pain after continuous and episodic choices", () => {
    expect(painPatternFromOccurrence("continuous", "")).toBe("continuous_background");
    expect(painPatternFromOccurrence("both", "")).toBe("continuous_with_episodes");
    expect(painPatternFromOccurrence("varies", "")).toBe("varies_unsure");
  });

  it("treats no background pain as its own episodic category", () => {
    expect(painPatternFromOccurrence("episodic", "no_background")).toBe(
      "episodes_with_pain_free_periods",
    );
    expect(painPatternFromOccurrence("episodic", "has_background")).toBe(
      "continuous_with_episodes",
    );
    expect(painPatternFromOccurrence("episodic", "not_sure")).toBe("varies_unsure");
    expect(painPatternFromOccurrence("episodic", "")).toBeNull();
  });

  it("restores occurrence choices from a saved pattern", () => {
    expect(occurrenceFromPainPattern("episodes_with_pain_free_periods")).toEqual({
      occurrence: "episodic",
      background: "no_background",
    });
    expect(occurrenceFromPainPattern("continuous_background")).toEqual({
      occurrence: "continuous",
      background: "",
    });
  });
});
