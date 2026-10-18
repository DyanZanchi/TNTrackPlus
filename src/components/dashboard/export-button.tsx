import Link from "next/link";
import { btnSecondaryClass } from "@/lib/design/ui-classes";
import type { DashboardFilters } from "@/lib/types/episodes";

type ExportButtonProps = {
  filters: DashboardFilters;
  kind?: "episodes" | "background" | "medications";
};

export function ExportButton({ filters, kind = "episodes" }: ExportButtonProps) {
  const params = new URLSearchParams();
  params.set("range", filters.range);

  if (filters.start) {
    params.set("start", filters.start);
  }

  if (filters.end) {
    params.set("end", filters.end);
  }

  if (kind !== "episodes") {
    params.set("kind", kind);
  }

  const label =
    kind === "background"
      ? "background check-ins"
      : kind === "medications"
        ? "medications"
        : "episodes";

  return (
    <Link href={`/dashboard/export?${params.toString()}`} className={btnSecondaryClass}>
      Download {label} CSV
    </Link>
  );
}
