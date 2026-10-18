"use server";

import { redirect } from "next/navigation";
import { hasSupabaseEnv, isAuthBypassed } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseMedicationInventory } from "@/lib/validation/medication-inventory";

export type MedicationActionState = {
  error?: string;
  success?: string;
};

export async function saveMedicationInventoryAction(
  _previousState: MedicationActionState | undefined,
  formData: FormData,
): Promise<MedicationActionState> {
  const result = parseMedicationInventory(formData);

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Check the medication answers and try again." };
  }

  if (isAuthBypassed()) {
    redirect("/medications?demo=1");
  }

  if (!hasSupabaseEnv()) {
    return { error: "Supabase is not configured yet. Add the environment variables first." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in to save medication answers." };
  }

  const now = new Date().toISOString();
  const data = result.data;

  if (data.uses.length > 0) {
    const { error: upsertUsesError } = await supabase.from("patient_medication_uses").upsert(
      data.uses.map((use) => ({
        user_id: user.id,
        catalog_key: use.catalogKey,
        use_context: use.useContext,
        status: use.status,
        times_per_day: use.timesPerDay,
        dose_amount: use.doseAmount,
        dose_unknown: use.doseUnknown,
        administration: use.administration,
        administration_other: use.administrationOther,
        formulation: use.formulation,
        formulation_other: use.formulationOther,
        stop_reasons: use.stopReasons,
        stop_reason_other: use.stopReasonOther,
        otc_frequency: use.otcFrequency,
        tablets_at_once: use.tabletsAtOnce,
        strength_mg: use.strengthMg,
        strength_unknown: use.strengthUnknown,
        extra_strength: use.extraStrength,
        nighttime: use.nighttime,
        other_text: use.otherText,
        follow_up: use.followUp,
        updated_at: now,
      })),
      { onConflict: "user_id,catalog_key" },
    );

    if (upsertUsesError) {
      return { error: upsertUsesError.message };
    }
  }

  const savedKeys = data.uses.map((use) => use.catalogKey);
  const deleteUses = supabase.from("patient_medication_uses").delete().eq("user_id", user.id);
  const { error: deleteUsesError } =
    savedKeys.length === 0
      ? await deleteUses
      : await deleteUses.not("catalog_key", "in", `(${savedKeys.join(",")})`);

  if (deleteUsesError) {
    return { error: deleteUsesError.message };
  }

  if (data.compounded.length > 0) {
    const { error: upsertCompoundedError } = await supabase
      .from("patient_compounded_medications")
      .upsert(
        data.compounded.map((item) => ({
          user_id: user.id,
          position: item.position,
          name: item.name,
          ingredients: item.ingredients,
          ingredient_other: item.ingredientOther,
          form: item.form,
          form_other: item.formOther,
          effect: item.effect,
          still_using: item.stillUsing,
          pharmacy_type: item.pharmacyType,
          updated_at: now,
        })),
        { onConflict: "user_id,position" },
      );

    if (upsertCompoundedError) {
      return { error: upsertCompoundedError.message };
    }
  }

  const savedPositions = data.compounded.map((item) => item.position);
  const deleteCompounded = supabase
    .from("patient_compounded_medications")
    .delete()
    .eq("user_id", user.id);
  const { error: deleteCompoundedError } =
    savedPositions.length === 0
      ? await deleteCompounded
      : await deleteCompounded.not("position", "in", `(${savedPositions.join(",")})`);

  if (deleteCompoundedError) {
    return { error: deleteCompoundedError.message };
  }

  const context = data.context;
  const { error: contextError } = await supabase.from("patient_medication_context").upsert({
    user_id: user.id,
    compounded_used: context.compoundedUsed,
    compounded_count: context.compoundedCount,
    cannabis_used: context.cannabisUsed,
    cannabis_medical_dispensary: context.cannabisMedicalDispensary,
    cannabis_open_dispensary: context.cannabisOpenDispensary,
    cannabis_other_place: context.cannabisOtherPlace,
    cannabis_relief: context.cannabisRelief,
    er_visited: context.erVisited,
    er_visit_count: context.erVisitCount,
    er_sent_home_no_treatment: context.erSentHomeNoTreatment,
    er_given_opiate: context.erGivenOpiate,
    er_given_iv_anticonvulsant: context.erGivenIvAnticonvulsant,
    er_asked_for_named_protocol: context.erAskedForNamedProtocol,
    er_other_medication: context.erOtherMedication,
    er_admitted: context.erAdmitted,
    er_felt_heard: context.erFeltHeard,
    er_treated_as_drug_seeking: context.erTreatedAsDrugSeeking,
    medications_in_front: context.medicationsInFront,
    answer_confidence: context.answerConfidence,
    updated_at: now,
  });

  if (contextError) {
    return { error: contextError.message };
  }

  redirect("/medications?saved=1");
}
