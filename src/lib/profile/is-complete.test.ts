import { describe, expect, it } from "vitest";
import { isProfileComplete } from "./is-complete";
import type { PatientProfile } from "@/lib/types/profile";

const emptyProfile: PatientProfile = {
  user_id: "user-1",
  age: null,
  gender: null,
  gender_other: null,
  pain_type_option_ids: [],
  prior_treatments: [],
  other_therapies: [],
  updated_at: null,
};

describe("isProfileComplete", () => {
  it("requires age, gender, and at least one pain type", () => {
    expect(isProfileComplete(emptyProfile)).toBe(false);
    expect(
      isProfileComplete({
        ...emptyProfile,
        age: 42,
        gender: "female",
        pain_type_option_ids: ["44444444-4444-4444-8444-000000000001"],
      }),
    ).toBe(true);
  });
});
