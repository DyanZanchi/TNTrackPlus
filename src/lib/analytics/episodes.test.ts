import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildFaceAreaCounts, buildMonthlyTrend, buildTriggerCounts, summarizeEpisodes } from "./episodes";
import type { EpisodeRecord } from "@/lib/types/episodes";

const episodes: EpisodeRecord[] = [
  {
    id: "1",
    user_id: "user-1",
    pain_type: "trigeminal_neuralgia",
    pain_pattern: "episodic_pulsing",
    pulse_duration_seconds: 2,
    face_areas: ["v2", "v3"],
    face_points: [
      { x: 280, y: 430, division: "v2", location: "right_cheek", label: "Right cheek" },
      { x: 280, y: 520, division: "v3", location: "right_jaw", label: "Right jaw" },
    ],
    severity: 8,
    duration_seconds: 930,
    onset_at: "2026-03-10T14:00:00.000Z",
    trigger_labels: ["Chewing", "Cold air"],
    medication_labels: ["Carbamazepine"],
    notes: null,
    treatment_history_changed: false,
    treatment_change_date: null,
    treatment_history_snapshot: null,
    created_at: "2026-03-10T14:05:00.000Z",
  },
  {
    id: "2",
    user_id: "user-1",
    pain_type: "trigeminal_neuralgia",
    pain_pattern: "episodic_pulsing",
    pulse_duration_seconds: 1,
    face_areas: ["v3"],
    face_points: [{ x: 280, y: 520, division: "v3", location: "right_jaw", label: "Right jaw" }],
    severity: 6,
    duration_seconds: 600,
    onset_at: "2026-03-22T09:00:00.000Z",
    trigger_labels: ["Chewing", "Flossing"],
    medication_labels: ["No medication"],
    notes: null,
    treatment_history_changed: false,
    treatment_change_date: null,
    treatment_history_snapshot: null,
    created_at: "2026-03-22T09:05:00.000Z",
  },
  {
    id: "3",
    user_id: "user-1",
    pain_type: "occipital_neuralgia",
    pain_pattern: "continuous",
    pulse_duration_seconds: null,
    face_areas: ["v2", "multiple_areas"],
    face_points: [{ x: 720, y: 430, division: "v2", location: "left_cheek", label: "Left cheek" }],
    severity: 9,
    duration_seconds: 1800,
    onset_at: "2026-04-05T20:00:00.000Z",
    trigger_labels: ["Cold air"],
    medication_labels: ["Baclofen", "Ibuprofen"],
    notes: null,
    treatment_history_changed: false,
    treatment_change_date: null,
    treatment_history_snapshot: null,
    created_at: "2026-04-05T20:05:00.000Z",
  },
];

describe("episode analytics", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-11T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("summarizes average duration, severity, and top trigger", () => {
    const summary = summarizeEpisodes(episodes);

    expect(summary.totalEpisodes).toBe(3);
    expect(summary.averageDurationSeconds).toBe(1110);
    expect(summary.averageSeverity).toBe(7.7);
    expect(summary.topTrigger).toBe("Chewing");
  });

  it("counts trigger usage by label", () => {
    const triggerCounts = buildTriggerCounts(episodes);

    expect(triggerCounts[0]).toEqual({ label: "Chewing", value: 2 });
    expect(triggerCounts[1]).toEqual({ label: "Cold air", value: 2 });
  });

  it("counts pain locations with their trigeminal division", () => {
    const faceAreaCounts = buildFaceAreaCounts(episodes);

    expect(faceAreaCounts).toEqual(
      expect.arrayContaining([
        { label: "Right jaw (V3)", value: 2 },
        { label: "Right cheek (V2)", value: 1 },
        { label: "Left cheek (V2)", value: 1 },
      ]),
    );
    expect(faceAreaCounts).toHaveLength(3);
  });

  it("builds a month-by-month trend series", () => {
    const trend = buildMonthlyTrend(episodes, 2);

    expect(trend).toEqual([
      { month: "Mar", episodes: 2, averageSeverity: 7 },
      { month: "Apr", episodes: 1, averageSeverity: 9 },
    ]);
  });
});
