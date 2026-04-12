"use server";

import { z } from "zod";
import { isAuthBypassed } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TaxonomyOption } from "@/lib/types/episodes";
import { normalizeTaxonomyLabel } from "@/lib/taxonomy/shared";
import type { TaxonomyKind } from "@/lib/taxonomy/shared";

export type TaxonomyActionState = {
  error?: string;
  success?: string;
  option?: TaxonomyOption;
  hiddenOptionId?: string;
};

const labelSchema = z
  .string()
  .trim()
  .min(2, "Enter at least 2 characters.")
  .max(50, "Keep custom entries to 50 characters or less.");

const TABLES: Record<TaxonomyKind, "trigger_options" | "medication_options"> = {
  trigger: "trigger_options",
  medication: "medication_options",
};

export async function getTaxonomyOptionsForUser(userId: string, kind: TaxonomyKind) {
  const supabase = await createSupabaseServerClient();
  const table = TABLES[kind];

  const { data, error } = await supabase
    .from(table)
    .select("id, user_id, label, normalized_label, is_active, created_at")
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .eq("is_active", true)
    .order("user_id", { ascending: true })
    .order("label", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as TaxonomyOption[];
}

export async function getCustomTaxonomyOptionsForUser(userId: string, kind: TaxonomyKind) {
  const supabase = await createSupabaseServerClient();
  const table = TABLES[kind];

  const { data, error } = await supabase
    .from(table)
    .select("id, user_id, label, normalized_label, is_active, created_at")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("label", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as TaxonomyOption[];
}

export async function resolveSelectedTaxonomyOptions(
  userId: string,
  kind: TaxonomyKind,
  ids: string[],
) {
  const uniqueIds = Array.from(new Set(ids));

  if (!uniqueIds.length) {
    return [] as TaxonomyOption[];
  }

  const supabase = await createSupabaseServerClient();
  const table = TABLES[kind];

  const { data, error } = await supabase
    .from(table)
    .select("id, user_id, label, normalized_label, is_active, created_at")
    .in("id", uniqueIds)
    .eq("is_active", true)
    .or(`user_id.is.null,user_id.eq.${userId}`);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as TaxonomyOption[];
}

async function upsertCustomOption(kind: TaxonomyKind, label: string): Promise<TaxonomyActionState> {
  if (isAuthBypassed()) {
    return { error: "Custom options are disabled in demo mode." };
  }

  const parsed = labelSchema.safeParse(label);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid label." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in to manage custom options." };
  }

  const table = TABLES[kind];
  const normalizedLabel = normalizeTaxonomyLabel(parsed.data);

  const { data: existingRows, error: existingError } = await supabase
    .from(table)
    .select("id, user_id, label, normalized_label, is_active, created_at")
    .eq("normalized_label", normalizedLabel)
    .or(`user_id.is.null,user_id.eq.${user.id}`);

  if (existingError) {
    return { error: existingError.message };
  }

  const existing = (existingRows ?? []) as TaxonomyOption[];
  const globalMatch = existing.find((row) => row.user_id === null);

  if (globalMatch) {
    return {
      success: "That option already exists and has been selected.",
      option: globalMatch,
    };
  }

  const userMatch = existing.find((row) => row.user_id === user.id);

  if (userMatch) {
    if (userMatch.is_active) {
      return {
        success: "That option already exists and has been selected.",
        option: userMatch,
      };
    }

    const { error } = await supabase
      .from(table)
      .update({ label: parsed.data, is_active: true })
      .eq("id", userMatch.id)
      .eq("user_id", user.id);

    if (error) {
      return { error: error.message };
    }

    return {
      success: "Option restored and selected.",
      option: {
        ...userMatch,
        label: parsed.data,
        is_active: true,
      },
    };
  }

  const { data, error } = await supabase
    .from(table)
    .insert({
      user_id: user.id,
      label: parsed.data,
      normalized_label: normalizedLabel,
      is_active: true,
    })
    .select("id, user_id, label, normalized_label, is_active, created_at")
    .single();

  if (error) {
    return { error: error.message };
  }

  return {
    success: "Option added and selected.",
    option: data as TaxonomyOption,
  };
}

async function hideCustomOption(kind: TaxonomyKind, formData: FormData): Promise<TaxonomyActionState> {
  if (isAuthBypassed()) {
    return { error: "Custom options are disabled in demo mode." };
  }

  const optionId = formData.get("option_id");

  if (typeof optionId !== "string" || !optionId) {
    return { error: "Choose a valid custom option to hide." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in to manage custom options." };
  }

  const table = TABLES[kind];
  const { error } = await supabase
    .from(table)
    .update({ is_active: false })
    .eq("id", optionId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return {
    success: "Option hidden.",
    hiddenOptionId: optionId,
  };
}

export async function createCustomTriggerAction(
  _previousState: TaxonomyActionState | undefined,
  formData: FormData,
): Promise<TaxonomyActionState> {
  const label = formData.get("label");
  return upsertCustomOption("trigger", typeof label === "string" ? label : "");
}

export async function createCustomMedicationAction(
  _previousState: TaxonomyActionState | undefined,
  formData: FormData,
): Promise<TaxonomyActionState> {
  const label = formData.get("label");
  return upsertCustomOption("medication", typeof label === "string" ? label : "");
}

export async function hideCustomTriggerAction(formData: FormData) {
  return hideCustomOption("trigger", formData);
}

export async function hideCustomMedicationAction(formData: FormData) {
  return hideCustomOption("medication", formData);
}
