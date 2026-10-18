import Link from "next/link";
import { redirect } from "next/navigation";
import { BackgroundCheckInForm } from "@/components/background-check-in-form";
import { Card } from "@/components/ui/card";
import { createBackgroundCheckInAction } from "@/lib/background-check-ins/actions";
import { hasSupabaseEnv, isAuthBypassed } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NewBackgroundCheckInPage() {
  const demoMode = isAuthBypassed();

  if (!demoMode) {
    if (!hasSupabaseEnv()) {
      redirect("/dashboard");
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-[color:var(--primary)] hover:text-[color:var(--primary-hover)]"
        >
          ← Back to dashboard
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Background pain check-in
        </h1>
        <p className="text-[color:var(--muted)]">
          Record how your ongoing pain feels right now. This is kept separate from pain episodes.
        </p>
      </div>

      <Card elevated className="p-6 md:p-8">
        <BackgroundCheckInForm demoMode={demoMode} action={createBackgroundCheckInAction} />
      </Card>
    </div>
  );
}
