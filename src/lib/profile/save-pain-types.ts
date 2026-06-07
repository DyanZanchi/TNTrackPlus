import type { SupabaseClient } from "@supabase/supabase-js";

export async function savePatientPainTypes(
  supabase: SupabaseClient,
  userId: string,
  painTypeOptionIds: string[],
): Promise<{ error?: string }> {
  const now = new Date().toISOString();

  await supabase.from("patient_profiles").update({ updated_at: now }).eq("user_id", userId);

  const { error: deleteError } = await supabase
    .from("patient_pain_types")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (!painTypeOptionIds.length) {
    return {};
  }

  const { error: insertError } = await supabase.from("patient_pain_types").insert(
    painTypeOptionIds.map((painTypeOptionId) => ({
      user_id: userId,
      pain_type_option_id: painTypeOptionId,
    })),
  );

  if (insertError) {
    return { error: insertError.message };
  }

  return {};
}
