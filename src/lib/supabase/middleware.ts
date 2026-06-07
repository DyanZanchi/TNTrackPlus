import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseEnv, hasSupabaseEnv, isAuthBypassed } from "@/lib/supabase/env";

const PROTECTED_PATHS = ["/dashboard", "/episodes", "/settings"];

export async function updateSession(request: NextRequest) {
  if (isAuthBypassed() || !hasSupabaseEnv()) {
    return NextResponse.next({
      request,
    });
  }

  const response = NextResponse.next({
    request,
  });

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedPath = PROTECTED_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));

  if (!user && isProtectedPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("message", "Please sign in to continue.");
    return NextResponse.redirect(loginUrl);
  }

  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
