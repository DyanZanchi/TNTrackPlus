import type { BackgroundPainCheckIn } from "@/lib/types/episodes";

function daysAgoIso(days: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export const DEMO_BACKGROUND_CHECK_INS: BackgroundPainCheckIn[] = [
  {
    id: "demo-background-1",
    user_id: "demo-user",
    recorded_at: daysAgoIso(1, 9),
    severity: 4,
    functional_impact: 3,
    pain_qualities: ["dull", "burning"],
    pain_quality_other: null,
    face_points: [],
    notes: "Steady background pain after waking.",
    created_at: daysAgoIso(1, 9),
  },
  {
    id: "demo-background-2",
    user_id: "demo-user",
    recorded_at: daysAgoIso(3, 18),
    severity: 6,
    functional_impact: 6,
    pain_qualities: ["burning"],
    pain_quality_other: null,
    face_points: [],
    notes: null,
    created_at: daysAgoIso(3, 18),
  },
  {
    id: "demo-background-3",
    user_id: "demo-user",
    recorded_at: daysAgoIso(6, 13),
    severity: 3,
    functional_impact: null,
    pain_qualities: ["dull"],
    pain_quality_other: null,
    face_points: [],
    notes: null,
    created_at: daysAgoIso(6, 13),
  },
];
