import type { DashboardFilters, RangeKey } from "@/lib/types/episodes";

const VALID_RANGES: RangeKey[] = ["30d", "90d", "month", "custom"];

export async function parseDashboardFilters(
  searchParams?: Promise<Record<string, string | string[] | undefined>>,
): Promise<DashboardFilters> {
  const params = searchParams ? await searchParams : {};
  const rangeParam = typeof params.range === "string" ? params.range : "30d";

  return {
    range: VALID_RANGES.includes(rangeParam as RangeKey) ? (rangeParam as RangeKey) : "30d",
    start: typeof params.start === "string" ? params.start : undefined,
    end: typeof params.end === "string" ? params.end : undefined,
  };
}
