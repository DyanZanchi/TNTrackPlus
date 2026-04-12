import Link from "next/link";
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
    <Link
      href={`/dashboard/export?${params.toString()}`}
      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[color:var(--border)] bg-white px-4 py-2 font-semibold"
    >
      Export CSV
    </Link>
  );
}
