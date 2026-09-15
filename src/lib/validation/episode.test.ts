import { describe, expect, it } from "vitest";
import { episodeSchema } from "./episode";

const sampleFacePoints = JSON.stringify([
  { x: 280, y: 430, division: "v2", location: "right_cheek", label: "Right cheek" },
  { x: 500, y: 540, division: "v3", location: "chin", label: "Chin" },
]);

const baseEpisode = {
  face_points: sampleFacePoints,
  pain_qualities: ["sharp_stabbing", "electrical"],
  pain_quality_other: "",
  had_numbness: "no",
  throbbing_associations: [],
  pain_pattern: "continuous",
  pulse_duration_hms: "",
  severity: "8",
  duration_unit: "minutes",
  duration_amount: "15",
  onset_at: "2026-04-11T14:30",
  trigger_ids: ["11111111-1111-4111-8111-000000000001"],
  medication_within_24h: "yes",
  medication_ids: ["22222222-2222-4222-8222-000000000002"],
  notes: "Pain started after lunch.",
  treatment_history_changed: "no",
  treatment_change_date: "",
};

describe("episodeSchema", () => {
  it("accepts a valid continuous episode entry", () => {
    const result = episodeSchema.safeParse(baseEpisode);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.severity).toBe(8);
      expect(result.data.duration_hms).toBe(900);
      expect(result.data.pain_qualities).toEqual(["sharp_stabbing", "electrical"]);
      expect(result.data.pain_quality_other).toBeNull();
      expect(result.data.pain_pattern).toBe("continuous");
      expect(result.data.pulse_duration_seconds).toBeNull();
      expect(result.data.face_areas).toEqual(["v2", "v3"]);
    }
  });

  it("requires at least one pain quality", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      pain_qualities: [],
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Select at least one pain type.");
    }
  });

  it("requires a description when other pain type is selected", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      pain_qualities: ["other"],
      pain_quality_other: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Describe the other pain type.");
    }
  });

  it("keeps a custom description for other pain type", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      pain_qualities: ["burning", "other"],
      pain_quality_other: "Deep ache",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.pain_qualities).toEqual(["burning", "other"]);
      expect(result.data.pain_quality_other).toBe("Deep ache");
    }
  });

  it("requires a numbness answer", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      had_numbness: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Indicate whether you had numbness.");
    }
  });

  it("requires associated symptoms when throbbing is selected", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      pain_qualities: ["throbbing"],
      throbbing_associations: [],
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Indicate whether the throbbing pain was associated with any of these symptoms.",
      );
    }
  });

  it("accepts throbbing with associated headache and migraine aura", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      pain_qualities: ["throbbing"],
      throbbing_associations: ["headache", "migraine_aura"],
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.throbbing_associations).toEqual(["headache", "migraine_aura"]);
    }
  });

  it("rejects combining No with other throbbing associations", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      pain_qualities: ["throbbing"],
      throbbing_associations: ["none", "headache"],
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Choose No, or select the associated symptoms, not both.",
      );
    }
  });

  it("clears throbbing associations when throbbing is not selected", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      pain_qualities: ["burning"],
      throbbing_associations: ["headache"],
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.throbbing_associations).toEqual([]);
    }
  });

  it("accepts continuous pain when pulse duration is omitted from the form", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      pain_pattern: "continuous",
      pulse_duration_hms: null,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.pulse_duration_seconds).toBeNull();
    }
  });

  it("accepts episodic pain with a pulse length", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      pain_pattern: "episodic_pulsing",
      pulse_duration_hms: "00:00:02",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.pain_pattern).toBe("episodic_pulsing");
      expect(result.data.pulse_duration_seconds).toBe(2);
    }
  });

  it("requires pulse length for episodic pain", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      pain_pattern: "episodic_pulsing",
      pulse_duration_hms: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Enter the length of each pulse.");
    }
  });

  it("rejects entries without a trigger selection", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      pain_pattern: "continuous",
      trigger_ids: [],
      medication_within_24h: "no",
      medication_ids: [],
      notes: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Select at least one trigger.");
    }
  });

  it("rejects an episode length of 0", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      duration_amount: "0",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Enter at least 1.");
    }
  });

  it("accepts an episode length in hours", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      duration_unit: "hours",
      duration_amount: "2",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.duration_hms).toBe(7200);
    }
  });

  it("accepts an episode length in days", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      duration_unit: "days",
      duration_amount: "3",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.duration_hms).toBe(259200);
    }
  });

  it("rejects an episode length above the unit maximum", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      duration_unit: "days",
      duration_amount: "15",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Enter 14 days or fewer.");
    }
  });

  it("requires a treatment change date when treatment history changed", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      treatment_history_changed: "yes",
      treatment_change_date: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Enter when the treatment history changed.");
    }
  });

  it("accepts treatment history changes with a change date", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      treatment_history_changed: "yes",
      treatment_change_date: "2026-03-15",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.treatment_change_date).toBe("2026-03-15");
    }
  });

  it("records no medication when none were taken in the past 24 hours", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      medication_within_24h: "no",
      medication_ids: [],
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.medication_ids).toEqual(["22222222-2222-4222-8222-000000000001"]);
    }
  });

  it("requires medication selections when medication was taken in the past 24 hours", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      medication_within_24h: "yes",
      medication_ids: [],
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Select at least one medication taken in the past 24 hours.",
      );
    }
  });

  it("requires at least one face point", () => {
    const result = episodeSchema.safeParse({
      ...baseEpisode,
      pain_pattern: "continuous",
      face_points: "[]",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Tap at least one point on the face.");
    }
  });
});
