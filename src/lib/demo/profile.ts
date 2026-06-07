import { BUILTIN_PAIN_TYPE_OPTIONS } from "@/lib/constants/episode-options";
import type { PatientProfile } from "@/lib/types/profile";

export const DEMO_PROFILE: PatientProfile = {
  user_id: "demo-user",
  age: 54,
  gender: "female",
  gender_other: null,
  pain_type_option_ids: [BUILTIN_PAIN_TYPE_OPTIONS[0].id],
  prior_treatments: [{ treatment_type: "mvd", other_label: null }],
  other_therapies: [{ therapy_type: "acupuncture", other_label: null }],
  updated_at: "2026-04-01T12:00:00.000Z",
};
