import { describe, expect, it } from "vitest";
import { episodeSchema } from "./episode";

describe("episodeSchema", () => {
  it("accepts a valid structured episode entry", () => {
    const result = episodeSchema.safeParse({
      pain_type: "trigeminal_neuralgia",
      face_areas: ["left_cheek", "jaw"],
      severity: "8",
      duration_hms: "00:15:30",
      onset_at: "2026-04-11T14:30",
      trigger_ids: ["11111111-1111-4111-8111-000000000001"],
      medication_ids: ["22222222-2222-4222-8222-000000000002"],
      notes: "Pain started after lunch.",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.severity).toBe(8);
      expect(result.data.duration_hms).toBe(930);
      expect(result.data.onset_at).toContain("2026-04-11T");
      expect(result.data.face_areas).toEqual(["left_cheek", "jaw"]);
      expect(result.data.trigger_ids).toHaveLength(1);
    }
  });

  it("rejects entries without a trigger selection", () => {
    const result = episodeSchema.safeParse({
      pain_type: "trigeminal_neuralgia",
      face_areas: ["left_cheek"],
      severity: "7",
      duration_hms: "00:10:00",
      onset_at: "2026-04-11T14:30",
      trigger_ids: [],
      medication_ids: [],
      notes: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Select at least one trigger.");
    }
  });

  it("requires a facial pain type", () => {
    const result = episodeSchema.safeParse({
      face_areas: ["left_cheek"],
      severity: "6",
      duration_hms: "00:10:00",
      onset_at: "2026-04-11T14:30",
      trigger_ids: ["11111111-1111-4111-8111-000000000001"],
      medication_ids: [],
      notes: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Select the facial pain type.");
    }
  });

  it("rejects durations outside hh:mm:ss format or above 23:59:59", () => {
    const result = episodeSchema.safeParse({
      pain_type: "trigeminal_neuralgia",
      face_areas: ["left_cheek"],
      severity: "6",
      duration_hms: "24:00:00",
      onset_at: "2026-04-11T14:30",
      trigger_ids: ["11111111-1111-4111-8111-000000000001"],
      medication_ids: [],
      notes: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Episode length must use hh:mm:ss format.");
    }
  });

  it("requires at least one selected face area", () => {
    const result = episodeSchema.safeParse({
      pain_type: "trigeminal_neuralgia",
      face_areas: [],
      severity: "6",
      duration_hms: "00:10:00",
      onset_at: "2026-04-11T14:30",
      trigger_ids: ["11111111-1111-4111-8111-000000000001"],
      medication_ids: [],
      notes: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Select at least one face area.");
    }
  });
});
