import { RANGE_OPTIONS } from "@/lib/constants/episode-options";
import type { DashboardFilters } from "@/lib/types/episodes";

type FilterBarProps = {
  filters: DashboardFilters;
};

export function FilterBar({ filters }: FilterBarProps) {
  return (
    <form className="grid gap-4 rounded-2xl border border-[color:var(--border)] bg-white p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
      <label className="space-y-2">
        <span className="text-sm font-medium">Range</span>
        <select
          name="range"
          defaultValue={filters.range}
          className="min-h-11 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2"
        >
          {RANGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium">Start date</span>
        <input
          type="date"
          name="start"
          defaultValue={filters.start}
          className="min-h-11 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium">End date</span>
        <input
          type="date"
          name="end"
          defaultValue={filters.end}
          className="min-h-11 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2"
        />
      </label>

      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[color:var(--primary)] px-4 py-2 font-semibold text-[color:var(--primary-foreground)]"
      >
        Apply filters
      </button>
    </form>
  );
}
