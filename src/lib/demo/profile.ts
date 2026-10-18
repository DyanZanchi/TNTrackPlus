import { BUILTIN_PAIN_TYPE_OPTIONS } from "@/lib/constants/episode-options";
import type { PatientProfile } from "@/lib/types/profile";

export const DEMO_PROFILE: PatientProfile = {
  user_id: "demo-user",
  age: 54,
  gender: "female",
  gender_other: null,
  current_pain_pattern: "continuous_with_episodes",
  clinician_evaluation_status: "yes",
  received_facial_pain_diagnosis: "yes",
  additional_undiagnosed_pain: "no",
  pain_type_option_ids: [BUILTIN_PAIN_TYPE_OPTIONS[0].id],
  prior_treatments: [{ treatment_type: "mvd", other_label: null }],
  other_therapies: [{ therapy_type: "acupuncture", other_label: null }],
  described_patterns: [
    { pattern_key: "shock_like_paroxysmal", status: "have_now" },
    { pattern_key: "background_between_shocks", status: "have_now" },
  ],
  headache_patterns: [],
  relevant_history_events: [
    {
      event_type: "dental_work",
      event_date: "2024-11-02",
      event_date_unknown: false,
      symptoms_began_afterward: "not_sure",
      notes: null,
    },
  ],
  updated_at: "2026-04-01T12:00:00.000Z",
};
