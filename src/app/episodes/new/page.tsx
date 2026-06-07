import Link from "next/link";
import { EpisodeForm } from "@/components/episode-form";
import { Card } from "@/components/ui/card";
import { DEMO_PROFILE } from "@/lib/demo/profile";
import { createEpisodeAction } from "@/lib/episodes/actions";
import { isProfileComplete } from "@/lib/profile/is-complete";
import { getProfileForUser } from "@/lib/profile/queries";
import { isAuthBypassed } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createCustomMedicationAction,
  createCustomPainTypeAction,
  createCustomTriggerAction,
  getTaxonomyOptionsForUser,
  hideCustomMedicationAction,
  hideCustomPainTypeAction,
  hideCustomTriggerAction,
} from "@/lib/taxonomy/server";
import { getDemoTaxonomyOptions } from "@/lib/taxonomy/shared";
import { redirect } from "next/navigation";

export default async function NewEpisodePage() {
  const demoMode = isAuthBypassed();
  let triggerOptions = getDemoTaxonomyOptions("trigger");
  let medicationOptions = getDemoTaxonomyOptions("medication");
  let painTypeOptions = getDemoTaxonomyOptions("pain_type");
  let profile = DEMO_PROFILE;

  if (!demoMode) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const [allTriggers, allMedications, allPainTypes, userProfile] = await Promise.all([
      getTaxonomyOptionsForUser(user.id, "trigger"),
      getTaxonomyOptionsForUser(user.id, "medication"),
      getTaxonomyOptionsForUser(user.id, "pain_type"),
      getProfileForUser(user.id),
    ]);

    triggerOptions = allTriggers;
    medicationOptions = allMedications;
    painTypeOptions = allPainTypes;
    if (!isProfileComplete(userProfile)) {
      redirect("/onboarding");
    }

    profile = userProfile;
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
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Log new attack</h1>
        <p className="text-[color:var(--muted)]">
          Capture the details of this episode so your dashboard can spot patterns over time.
        </p>
      </div>

      <Card elevated className="p-6 md:p-8">
        <EpisodeForm
          profile={profile}
          triggerOptions={triggerOptions}
          medicationOptions={medicationOptions}
          painTypeOptions={painTypeOptions}
          demoMode={demoMode}
          addTriggerAction={createCustomTriggerAction}
          addMedicationAction={createCustomMedicationAction}
          addPainTypeAction={createCustomPainTypeAction}
          hideTriggerAction={hideCustomTriggerAction}
          hideMedicationAction={hideCustomMedicationAction}
          hidePainTypeAction={hideCustomPainTypeAction}
          action={createEpisodeAction}
        />
      </Card>
    </div>
  );
}
