import { describe, expect, it } from "vitest";
import { backgroundPainCheckInSchema } from "./background-check-in";

const baseCheckIn = {
  recorded_at: "2026-10-17T09:30",
  severity: "5",
  pain_qualities: [],
  pain_quality_other: "",
  face_points: "[]",
  notes: "",
};

describe("backgroundPainCheckInSchema", () => {
  it("accepts a short check-in without optional details", () => {
    const result = backgroundPainCheckInSchema.safeParse(baseCheckIn);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.severity).toBe(5);
      expect(result.data.pain_qualities).toEqual([]);
      expect(result.data.face_points).toEqual([]);
    }
  });

  it("does not require an artificial duration", () => {
    const result = backgroundPainCheckInSchema.safeParse(baseCheckIn);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("duration_seconds");
    }
  });

  it("requires details when Other is selected", () => {
    const result = backgroundPainCheckInSchema.safeParse({
      ...baseCheckIn,
      pain_qualities: ["other"],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Describe the pain in your own words.");
    }
  });

  it("accepts optional face points", () => {
    const result = backgroundPainCheckInSchema.safeParse({
      ...baseCheckIn,
      face_points: JSON.stringify([
        {
          x: 280,
          y: 430,
          division: "v2",
          location: "right_cheek",
          label: "Right cheek",
        },
      ]),
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.face_points[0]?.location).toBe("right_cheek");
    }
  });
});
