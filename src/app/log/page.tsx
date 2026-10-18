import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { IconPlus } from "@/components/ui/icons";
import { DEMO_PROFILE } from "@/lib/demo/profile";
import { btnPrimaryClass, btnSecondaryClass } from "@/lib/design/ui-classes";
import { getProfileForUser } from "@/lib/profile/queries";
import { hasSupabaseEnv, isAuthBypassed } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PatientPainPattern } from "@/lib/types/profile";
import { cn } from "@/lib/utils";

export default async function LogPainPage() {
  const demoMode = isAuthBypassed();
  let painPattern: PatientPainPattern | null = DEMO_PROFILE.current_pain_pattern;

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

    painPattern = (await getProfileForUser(user.id)).current_pain_pattern;
  }

  const showEpisode = painPattern !== "continuous_background";
  const showBackground =
    painPattern === "continuous_background" ||
    painPattern === "continuous_with_episodes" ||
    painPattern === "varies_unsure";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Log pain</h1>
        <p className="text-[color:var(--muted)]">
          Choose what you want to record. Background check-ins and episodes stay separate in your
          summaries.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {showEpisode ? (
          <Card elevated className="space-y-4 p-6">
            <div>
              <h2 className="font-display text-xl font-bold">Pain episode</h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Record a period when pain started or became worse and then settled.
              </p>
            </div>
            <Link href="/episodes/new" className={cn(btnPrimaryClass, "w-full")}>
              <IconPlus className="h-5 w-5" />
              Log new episode
            </Link>
          </Card>
        ) : null}

        {showBackground ? (
          <Card elevated className="space-y-4 p-6">
            <div>
              <h2 className="font-display text-xl font-bold">Background pain</h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Record how persistent pain feels at this moment.
              </p>
            </div>
            <Link
              href="/check-ins/new"
              className={cn(showEpisode ? btnSecondaryClass : btnPrimaryClass, "w-full")}
            >
              <IconPlus className="h-5 w-5" />
              Check in background pain
            </Link>
          </Card>
        ) : null}
      </div>

      {!painPattern ? (
        <p className="text-sm text-[color:var(--muted)]">
          Your pain pattern has not been set yet. Episode logging remains available, and you can
          update the pattern in{" "}
          <Link href="/settings" className="font-semibold text-[color:var(--primary)]">
            Profile
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
