import { MedicationInventoryForm } from "@/components/medications/medication-inventory-form";
import { saveMedicationInventoryAction } from "@/lib/medications/actions";
import { getMedicationInventory } from "@/lib/medications/queries";
import { isAuthBypassed } from "@/lib/supabase/env";

type MedicationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MedicationsPage({ searchParams }: MedicationsPageProps) {
  const params = (await searchParams) ?? {};
  const saved = params.saved === "1";
  const inventory = await getMedicationInventory();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Medications</h1>
        <p className="text-[color:var(--muted)]">
          This list is what you report taking. It includes regular prescriptions, rescue medicines,
          compounded medicines, and medicines bought without a prescription. “You” means the person
          with facial pain. It does not recommend a dose or a treatment, and it is separate from
          the question about medicine taken in the past 24 hours on an episode log.
        </p>
      </div>
      <MedicationInventoryForm
        action={saveMedicationInventoryAction}
        inventory={inventory}
        demoMode={isAuthBypassed()}
        saved={saved}
      />
    </div>
  );
}
