import { describe, expect, it } from "vitest";
import { diffAddedOtherTherapies, diffAddedPriorTreatments } from "@/lib/profile/treatment-diff";

describe("treatment diff", () => {
  it("detects newly added prior treatments", () => {
    const added = diffAddedPriorTreatments(
      [{ treatment_type: "mvd", other_label: null }],
      [
        { treatment_type: "mvd", other_label: null },
        { treatment_type: "gamma_knife", other_label: null },
      ],
    );

    expect(added).toEqual([{ treatment_type: "gamma_knife", other_label: null }]);
  });

  it("detects newly added other therapies", () => {
    const added = diffAddedOtherTherapies(
      [],
      [{ therapy_type: "acupuncture", other_label: null }],
    );

    expect(added).toEqual([{ therapy_type: "acupuncture", other_label: null }]);
  });
});
