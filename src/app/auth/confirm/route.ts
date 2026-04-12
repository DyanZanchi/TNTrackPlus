import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";

function buildErrorRedirect(request: NextRequest, message: string) {
  const errorUrl = new URL("/auth/error", request.url);
  errorUrl.searchParams.set("message", message);
  return NextResponse.redirect(errorUrl);
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return buildErrorRedirect(request, "Supabase is not configured yet.");
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  if (!code) {
    const providerMessage =
      requestUrl.searchParams.get("error_description") ??
      requestUrl.searchParams.get("error") ??
      "The confirmation link is missing the authorization code.";

    return buildErrorRedirect(request, providerMessage);
  }

  const redirectUrl = new URL(safeNext, request.url);
  const response = NextResponse.redirect(redirectUrl);
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return buildErrorRedirect(request, error.message);
  }

  return response;
}
