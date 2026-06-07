import type { SupabaseClient } from "@supabase/supabase-js";
import type { PatientProfile } from "@/lib/types/profile";

export const ONBOARDING_PATH = "/onboarding";

export function isProfileComplete(profile: PatientProfile): boolean {
  return profile.age !== null && profile.gender !== null && profile.pain_type_option_ids.length > 0;
}

export async function isUserProfileComplete(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const [profileResult, painTypesResult] = await Promise.all([
    supabase.from("patient_profiles").select("age, gender").eq("user_id", userId).maybeSingle(),
    supabase.from("patient_pain_types").select("pain_type_option_id").eq("user_id", userId).limit(1),
  ]);

  if (profileResult.error || painTypesResult.error) {
    return false;
  }

  const profile = profileResult.data;

  return Boolean(profile?.age && profile?.gender && (painTypesResult.data?.length ?? 0) > 0);
}

function isSafeRedirectPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}

export function getProfileRedirectPath(formData: FormData) {
  const redirectTo = formData.get("redirect_to");

  if (typeof redirectTo === "string" && isSafeRedirectPath(redirectTo)) {
    return redirectTo;
  }

  return "/settings?saved=1";
}
