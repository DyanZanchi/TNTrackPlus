"use server";

import { redirect } from "next/navigation";
import { hasSupabaseEnv, isAuthBypassed } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { backgroundPainCheckInSchema } from "@/lib/validation/background-check-in";

export type BackgroundCheckInActionState = {
  error?: string;
};

export async function createBackgroundCheckInAction(
  _previousState: BackgroundCheckInActionState | undefined,
  formData: FormData,
): Promise<BackgroundCheckInActionState> {
  const result = backgroundPainCheckInSchema.safeParse({
    recorded_at: formData.get("recorded_at"),
    severity: formData.get("severity"),
    functional_impact: formData.get("functional_impact"),
    pain_qualities: formData.getAll("pain_qualities"),
    pain_quality_other: formData.get("pain_quality_other"),
    face_points: formData.get("face_points"),
    notes: formData.get("notes"),
  });

  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? "Check the background pain details and try again.",
    };
  }

  if (isAuthBypassed()) {
    redirect("/dashboard?background_created=1&demo=1");
  }

  if (!hasSupabaseEnv()) {
    return { error: "Supabase is not configured yet. Add the environment variables first." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in to save a background pain check-in." };
  }

  const { error } = await supabase.rpc("create_background_pain_check_in", {
    check_in_recorded_at: result.data.recorded_at,
    check_in_severity: result.data.severity,
    check_in_functional_impact: result.data.functional_impact,
    check_in_pain_qualities: result.data.pain_qualities,
    check_in_pain_quality_other: result.data.pain_quality_other,
    check_in_notes: result.data.notes || null,
    check_in_face_points: result.data.face_points,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard?background_created=1");
}
