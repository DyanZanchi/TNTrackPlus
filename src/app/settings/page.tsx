import Link from "next/link";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card } from "@/components/ui/card";
import { DEMO_PROFILE } from "@/lib/demo/profile";
import { saveProfileAction } from "@/lib/profile/actions";
import { getProfileForUser } from "@/lib/profile/queries";
import { alertSuccessClass } from "@/lib/design/ui-classes";
import { isAuthBypassed } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type SettingsPageProps = {
  searchParams: Promise<{
    saved?: string;
    demo?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const demoMode = isAuthBypassed();
  let profile = DEMO_PROFILE;

  if (!demoMode) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    profile = await getProfileForUser(user.id);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-[color:var(--primary)] hover:text-[color:var(--primary-hover)]"
        >
          ← Back to dashboard
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Patient information</h1>
        <p className="text-[color:var(--muted)]">
          Store general details and treatment history linked to your account.
        </p>
      </div>

      {params.saved ? (
        <p className={alertSuccessClass}>
          Profile saved successfully.
          {params.demo ? " Demo mode did not persist these changes." : ""}
        </p>
      ) : null}

      <Card elevated className="p-6 md:p-8">
        <ProfileForm profile={profile} demoMode={demoMode} action={saveProfileAction} />
      </Card>
    </div>
  );
}
