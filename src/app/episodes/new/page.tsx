import Link from "next/link";
import { EpisodeForm } from "@/components/episode-form";
import { Card } from "@/components/ui/card";
import { createEpisodeAction } from "@/lib/episodes/actions";
import { isAuthBypassed } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createCustomMedicationAction,
  createCustomTriggerAction,
  getTaxonomyOptionsForUser,
  hideCustomMedicationAction,
  hideCustomTriggerAction,
} from "@/lib/taxonomy/server";
import { getDemoTaxonomyOptions } from "@/lib/taxonomy/shared";
import { redirect } from "next/navigation";

export default async function NewEpisodePage() {
  const demoMode = isAuthBypassed();
  let triggerOptions = getDemoTaxonomyOptions("trigger");
  let medicationOptions = getDemoTaxonomyOptions("medication");

  if (!demoMode) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const [allTriggers, allMedications] = await Promise.all([
      getTaxonomyOptionsForUser(user.id, "trigger"),
      getTaxonomyOptionsForUser(user.id, "medication"),
    ]);

    triggerOptions = allTriggers;
    medicationOptions = allMedications;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link href="/dashboard" className="text-sm font-medium text-[color:var(--primary)]">
          Back to dashboard
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">New pain episode entry</h1>
        <p className="text-[color:var(--muted)]">
          Use structured fields so your dashboard can summarize patterns accurately.
        </p>
      </div>

      <Card>
        <EpisodeForm
          triggerOptions={triggerOptions}
          medicationOptions={medicationOptions}
          demoMode={demoMode}
          addTriggerAction={createCustomTriggerAction}
          addMedicationAction={createCustomMedicationAction}
          hideTriggerAction={hideCustomTriggerAction}
          hideMedicationAction={hideCustomMedicationAction}
          action={createEpisodeAction}
        />
      </Card>
    </div>
  );
}
