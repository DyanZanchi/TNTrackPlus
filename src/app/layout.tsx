import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv, isAuthBypassed } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "TN Tracker",
  description: "Track trigeminal neuralgia pain episodes and review symptom trends.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user: { id: string } | null = null;
  const demoMode = isAuthBypassed();

  if (demoMode) {
    user = { id: "demo-user" };
  } else if (hasSupabaseEnv()) {
    const supabase = await createSupabaseServerClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
  }

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-[color:var(--border)] bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
              <div>
                <Link href="/" className="text-lg font-semibold tracking-tight">
                  TN Tracker
                </Link>
                <p className="text-sm text-[color:var(--muted)]">
                  Episode logging and trend review for facial pain.
                </p>
              </div>

              <nav className="flex items-center gap-3 text-sm">
                {user ? (
                  <>
                    <Link href="/dashboard" className="rounded-xl px-3 py-2 transition hover:bg-[color:var(--accent)]">
                      Dashboard
                    </Link>
                    <Link href="/episodes/new" className="rounded-xl px-3 py-2 transition hover:bg-[color:var(--accent)]">
                      New entry
                    </Link>
                    {demoMode ? (
                      <span className="rounded-xl border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--muted)]">
                        Demo mode
                      </span>
                    ) : (
                      <SignOutButton />
                    )}
                  </>
                ) : (
                  <>
                    <Link href="/login" className="rounded-xl px-3 py-2 transition hover:bg-[color:var(--accent)]">
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-xl bg-[color:var(--primary)] px-4 py-2 font-semibold text-[color:var(--primary-foreground)]"
                    >
                      Create account
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
