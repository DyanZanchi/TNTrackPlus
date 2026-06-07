import Link from "next/link";
import { btnSecondaryClass } from "@/lib/design/ui-classes";
import type { DashboardFilters } from "@/lib/types/episodes";

type ExportButtonProps = {
  filters: DashboardFilters;
};

export function ExportButton({ filters }: ExportButtonProps) {
  const params = new URLSearchParams();
  params.set("range", filters.range);

  if (filters.start) {
    params.set("start", filters.start);
  }

  if (filters.end) {
    params.set("end", filters.end);
  }

  return (
    <Link href={`/dashboard/export?${params.toString()}`} className={btnSecondaryClass}>
      Export CSV
    </Link>
  );
}
