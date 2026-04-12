"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasSupabaseEnv, isAuthBypassed } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
};

function getCredential(formData: FormData, field: "email" | "password") {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

async function getEmailConfirmationRedirectUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (siteUrl) {
    return new URL("/auth/confirm", siteUrl).toString();
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return new URL("/auth/confirm", origin).toString();
  }

  const forwardedHost = headerStore.get("x-forwarded-host");
  const forwardedProto = headerStore.get("x-forwarded-proto") ?? "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}/auth/confirm`;
  }

  return "http://localhost:3000/auth/confirm";
}

export async function signInAction(
  _previousState: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  if (isAuthBypassed()) {
    redirect("/dashboard?demo=1");
  }

  const email = getCredential(formData, "email");
  const password = getCredential(formData, "password");

  if (!email || !password) {
    return { error: "Enter both email and password." };
  }

  if (!hasSupabaseEnv()) {
    return { error: "Supabase is not configured yet. Add the environment variables first." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signUpAction(
  _previousState: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  if (isAuthBypassed()) {
    redirect("/dashboard?demo=1");
  }

  const email = getCredential(formData, "email");
  const password = getCredential(formData, "password");

  if (!email || !password) {
    return { error: "Enter both email and password." };
  }

  if (!hasSupabaseEnv()) {
    return { error: "Supabase is not configured yet. Add the environment variables first." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: await getEmailConfirmationRedirectUrl(),
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  redirect(
    "/login?message=Check%20your%20email%20for%20the%20confirmation%20link%20to%20finish%20creating%20your%20account.",
  );
}

export async function signOutAction() {
  if (isAuthBypassed()) {
    redirect("/");
  }

  if (!hasSupabaseEnv()) {
    redirect("/");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
