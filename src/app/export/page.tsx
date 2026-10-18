import Link from "next/link";
import { ExportButton } from "@/components/dashboard/export-button";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { parseDashboardFilters } from "@/lib/analytics/filters";
import { EXPORT_SCHEMA_VERSION } from "@/lib/export/episodes-csv";
import { btnSecondaryClass, cardClass } from "@/lib/design/ui-classes";
import { cn } from "@/lib/utils";

type ExportPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExportPage({ searchParams }: ExportPageProps) {
  const filters = await parseDashboardFilters(searchParams);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Export data</h1>
        <p className="max-w-2xl text-[color:var(--muted)]">
          Choose a date range, then download your episode records as a CSV file for personal use or
          a clinic visit.
        </p>
      </div>

      <FilterBar filters={filters} />

      <section className={cn(cardClass, "space-y-4 p-5")}>
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold">Episode CSV</h2>
          <p className="text-sm text-[color:var(--muted)]">
            Schema version {EXPORT_SCHEMA_VERSION}. Times are stored in UTC and shown as
            local-formatted timestamps. Duration is in hours:minutes:seconds when known; unknown or
            ongoing lengths are blank, not zero. Multi-select values are separated with semicolons.
            The medications file is the current medication list and is not limited by the date range.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ExportButton filters={filters} />
          <ExportButton filters={filters} kind="background" />
          <ExportButton filters={filters} kind="medications" />
          <Link href="/dashboard" className={btnSecondaryClass}>
            Back to dashboard
          </Link>
        </div>
      </section>

      <p className="text-xs text-[color:var(--muted)]">
        This export contains sensitive health information. Store and share it carefully.
      </p>
    </div>
  );
}
