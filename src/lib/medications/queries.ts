import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAuthBypassed } from "@/lib/supabase/env";
import type { MedicationInventoryInput, MedicationUseInput } from "@/lib/validation/medication-inventory";

export type SavedMedicationUse = MedicationUseInput;

export type SavedMedicationInventory = MedicationInventoryInput;

const EMPTY_INVENTORY: SavedMedicationInventory = {
  uses: [],
  compounded: [],
  context: {
    compoundedUsed: null,
    compoundedCount: null,
    cannabisUsed: null,
    cannabisMedicalDispensary: null,
    cannabisOpenDispensary: null,
    cannabisOtherPlace: null,
    cannabisRelief: null,
    erVisited: null,
    erVisitCount: null,
    erSentHomeNoTreatment: null,
    erGivenOpiate: null,
    erGivenIvAnticonvulsant: null,
    erAskedForNamedProtocol: null,
    erOtherMedication: null,
    erAdmitted: null,
    erFeltHeard: null,
    erTreatedAsDrugSeeking: null,
    medicationsInFront: null,
    answerConfidence: null,
  },
};

type UseRow = {
  catalog_key: string;
  use_context: MedicationUseInput["useContext"];
  status: string;
  times_per_day: string | null;
  dose_amount: number | null;
  dose_unknown: boolean;
  administration: string | null;
  administration_other: string | null;
  formulation: string | null;
  formulation_other: string | null;
  stop_reasons: string[] | null;
  stop_reason_other: string | null;
  otc_frequency: string | null;
  tablets_at_once: string | null;
  strength_mg: number | null;
  strength_unknown: boolean;
  extra_strength: string | null;
  nighttime: string | null;
  other_text: string | null;
  follow_up: MedicationUseInput["followUp"];
};

function mapUse(row: UseRow): SavedMedicationUse {
  return {
    catalogKey: row.catalog_key,
    useContext: row.use_context,
    status: row.status,
    timesPerDay: row.times_per_day as SavedMedicationUse["timesPerDay"],
    doseAmount: row.dose_amount,
    doseUnknown: row.dose_unknown,
    administration: row.administration as SavedMedicationUse["administration"],
    administrationOther: row.administration_other,
    formulation: row.formulation,
    formulationOther: row.formulation_other,
    stopReasons: (row.stop_reasons ?? []) as SavedMedicationUse["stopReasons"],
    stopReasonOther: row.stop_reason_other,
    otcFrequency: row.otc_frequency,
    tabletsAtOnce: row.tablets_at_once as SavedMedicationUse["tabletsAtOnce"],
    strengthMg: row.strength_mg,
    strengthUnknown: row.strength_unknown,
    extraStrength: row.extra_strength as SavedMedicationUse["extraStrength"],
    nighttime: row.nighttime as SavedMedicationUse["nighttime"],
    otherText: row.other_text,
    followUp: row.follow_up ?? null,
  };
}

export async function getMedicationInventory(): Promise<SavedMedicationInventory> {
  if (isAuthBypassed()) {
    return EMPTY_INVENTORY;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return EMPTY_INVENTORY;
  }

  const [usesResult, compoundedResult, contextResult] = await Promise.all([
    supabase.from("patient_medication_uses").select("*").eq("user_id", user.id),
    supabase
      .from("patient_compounded_medications")
      .select("*")
      .eq("user_id", user.id)
      .order("position"),
    supabase.from("patient_medication_context").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  if (usesResult.error || compoundedResult.error || contextResult.error) {
    return EMPTY_INVENTORY;
  }

  const context = contextResult.data;

  return {
    uses: ((usesResult.data ?? []) as UseRow[]).map(mapUse),
    compounded: (compoundedResult.data ?? []).map((row) => ({
      position: row.position,
      name: row.name,
      ingredients: row.ingredients ?? [],
      ingredientOther: row.ingredient_other,
      form: row.form,
      formOther: row.form_other,
      effect: row.effect,
      stillUsing: row.still_using,
      pharmacyType: row.pharmacy_type,
    })),
    context: context
      ? {
          compoundedUsed: context.compounded_used,
          compoundedCount: context.compounded_count,
          cannabisUsed: context.cannabis_used,
          cannabisMedicalDispensary: context.cannabis_medical_dispensary,
          cannabisOpenDispensary: context.cannabis_open_dispensary,
          cannabisOtherPlace: context.cannabis_other_place,
          cannabisRelief: context.cannabis_relief,
          erVisited: context.er_visited,
          erVisitCount: context.er_visit_count,
          erSentHomeNoTreatment: context.er_sent_home_no_treatment,
          erGivenOpiate: context.er_given_opiate,
          erGivenIvAnticonvulsant: context.er_given_iv_anticonvulsant,
          erAskedForNamedProtocol: context.er_asked_for_named_protocol,
          erOtherMedication: context.er_other_medication,
          erAdmitted: context.er_admitted,
          erFeltHeard: context.er_felt_heard,
          erTreatedAsDrugSeeking: context.er_treated_as_drug_seeking,
          medicationsInFront: context.medications_in_front,
          answerConfidence: context.answer_confidence,
        }
      : EMPTY_INVENTORY.context,
  };
}
