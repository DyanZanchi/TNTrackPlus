import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildFaceAreaCounts, buildMonthlyTrend, buildTriggerCounts, summarizeEpisodes } from "./episodes";
import type { EpisodeRecord } from "@/lib/types/episodes";

const episodes: EpisodeRecord[] = [
  {
    id: "1",
    user_id: "user-1",
    pain_type: "trigeminal_neuralgia",
    face_areas: ["left_cheek", "jaw"],
    severity: 8,
    duration_seconds: 930,
    onset_at: "2026-03-10T14:00:00.000Z",
    trigger_labels: ["Chewing", "Cold air"],
    medication_labels: ["Carbamazepine"],
    notes: null,
    created_at: "2026-03-10T14:05:00.000Z",
  },
  {
    id: "2",
    user_id: "user-1",
    pain_type: "trigeminal_neuralgia",
    face_areas: ["jaw"],
    severity: 6,
    duration_seconds: 600,
    onset_at: "2026-03-22T09:00:00.000Z",
    trigger_labels: ["Chewing", "Flossing"],
    medication_labels: ["No medication"],
    notes: null,
    created_at: "2026-03-22T09:05:00.000Z",
  },
  {
    id: "3",
    user_id: "user-1",
    pain_type: "occipital_neuralgia",
    face_areas: ["right_cheek", "multiple_areas"],
    severity: 9,
    duration_seconds: 1800,
    onset_at: "2026-04-05T20:00:00.000Z",
    trigger_labels: ["Cold air"],
    medication_labels: ["Baclofen", "Ibuprofen"],
    notes: null,
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

  it("counts every selected face area across episodes", () => {
    const faceAreaCounts = buildFaceAreaCounts(episodes);

    expect(faceAreaCounts).toEqual([
      { label: "Jaw", value: 2 },
      { label: "Left cheek", value: 1 },
      { label: "Right cheek", value: 1 },
      { label: "Multiple areas (legacy)", value: 1 },
    ]);
  });

  it("builds a month-by-month trend series", () => {
    const trend = buildMonthlyTrend(episodes, 2);

    expect(trend).toEqual([
      { month: "Mar", episodes: 2, averageSeverity: 7 },
      { month: "Apr", episodes: 1, averageSeverity: 9 },
    ]);
  });
});
