import type { SupabaseClient } from "@supabase/supabase-js";
import type { OtherTherapyEntry, PriorTreatmentEntry } from "@/lib/types/profile";

type SavePatientTreatmentsInput = {
  prior_treatments: PriorTreatmentEntry[];
  other_therapies: OtherTherapyEntry[];
};

export async function savePatientTreatments(
  supabase: SupabaseClient,
  userId: string,
  data: SavePatientTreatmentsInput,
): Promise<{ error?: string }> {
  const now = new Date().toISOString();

  await supabase.from("patient_profiles").update({ updated_at: now }).eq("user_id", userId);

  const { error: deletePriorError } = await supabase
    .from("patient_prior_treatments")
    .delete()
    .eq("user_id", userId);

  if (deletePriorError) {
    return { error: deletePriorError.message };
  }

  if (data.prior_treatments.length) {
    const { error: priorError } = await supabase.from("patient_prior_treatments").insert(
      data.prior_treatments.map((entry) => ({
        user_id: userId,
        treatment_type: entry.treatment_type,
        other_label: entry.other_label,
      })),
    );

    if (priorError) {
      return { error: priorError.message };
    }
  }

  const { error: deleteTherapyError } = await supabase
    .from("patient_other_therapies")
    .delete()
    .eq("user_id", userId);

  if (deleteTherapyError) {
    return { error: deleteTherapyError.message };
  }

  if (data.other_therapies.length) {
    const { error: therapyError } = await supabase.from("patient_other_therapies").insert(
      data.other_therapies.map((entry) => ({
        user_id: userId,
        therapy_type: entry.therapy_type,
        other_label: entry.other_label,
      })),
    );

    if (therapyError) {
      return { error: therapyError.message };
    }
  }

  return {};
}
