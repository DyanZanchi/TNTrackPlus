import { ProfileForm } from "@/components/profile/profile-form";
import { Card } from "@/components/ui/card";
import { DEMO_PROFILE } from "@/lib/demo/profile";
import { saveProfileAction } from "@/lib/profile/actions";
import { isProfileComplete } from "@/lib/profile/is-complete";
import { getProfileForUser } from "@/lib/profile/queries";
import { isAuthBypassed } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createCustomPainTypeAction,
  getTaxonomyOptionsForUser,
  hideCustomPainTypeAction,
} from "@/lib/taxonomy/server";
import { getDemoTaxonomyOptions } from "@/lib/taxonomy/shared";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const demoMode = isAuthBypassed();
  let profile = DEMO_PROFILE;
  let painTypeOptions = getDemoTaxonomyOptions("pain_type");

  if (!demoMode) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const [userProfile, allPainTypes] = await Promise.all([
      getProfileForUser(user.id),
      getTaxonomyOptionsForUser(user.id, "pain_type"),
    ]);

    if (isProfileComplete(userProfile)) {
      redirect("/dashboard");
    }

    profile = userProfile;
    painTypeOptions = allPainTypes;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Set up your profile
        </h1>
        <p className="text-[color:var(--muted)]">
          Before logging your first entry, tell us a bit about yourself and your facial pain history.
          You can update this anytime in Profile settings.
        </p>
      </div>

      <Card elevated className="p-6 md:p-8">
        <ProfileForm
          profile={profile}
          painTypeOptions={painTypeOptions}
          demoMode={demoMode}
          variant="onboarding"
          redirectTo="/dashboard?welcome=1"
          addPainTypeAction={createCustomPainTypeAction}
          hidePainTypeAction={hideCustomPainTypeAction}
          action={saveProfileAction}
        />
      </Card>
    </div>
  );
}
