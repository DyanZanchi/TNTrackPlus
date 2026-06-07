import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { IconUser } from "@/components/ui/icons";
import { btnGhostClass, btnPrimaryClass, navLinkClass } from "@/lib/design/ui-classes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv, isAuthBypassed } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TN Track+",
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
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body>
        <div className="min-h-screen">
          <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
              <div>
                <Link href={user ? "/dashboard" : "/"} className="group inline-block">
                  <p className="font-display text-xl font-bold tracking-tight text-[color:var(--foreground)] transition-colors group-hover:text-[color:var(--primary)]">
                    TN Track+
                  </p>
                  <p className="text-xs text-[color:var(--muted)]">
                    Facial Pain Tracker
                  </p>
                </Link>
              </div>

              <nav className="flex items-center gap-1 text-sm">
                {user ? (
                  <>
                    <Link href="/dashboard" className={cn(navLinkClass, "hidden sm:inline-flex")}>
                      Dashboard
                    </Link>
                    <Link href="/episodes/new" className={cn(navLinkClass, "hidden sm:inline-flex")}>
                      New entry
                    </Link>
                    <Link
                      href="/settings"
                      className={cn(btnGhostClass, "hidden h-10 min-h-0 w-10 rounded-full p-0 sm:inline-flex")}
                      aria-label="Profile settings"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--accent)] text-[color:var(--primary)]">
                        <IconUser className="h-4 w-4" />
                      </span>
                    </Link>
                    {demoMode ? (
                      <span className={cn(navLinkClass, "cursor-default text-xs")}>Demo</span>
                    ) : (
                      <SignOutButton />
                    )}
                    <Link
                      href="/episodes/new"
                      className={cn(btnPrimaryClass, "ml-1 hidden min-h-10 px-4 sm:inline-flex")}
                    >
                      + Log entry
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className={navLinkClass}>
                      Log in
                    </Link>
                    <Link href="/signup" className={cn(btnPrimaryClass, "ml-1 min-h-10 px-4")}>
                      Create account
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-6 py-8 md:py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
