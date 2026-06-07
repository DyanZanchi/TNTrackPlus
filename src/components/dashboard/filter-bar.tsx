import { RANGE_OPTIONS } from "@/lib/constants/episode-options";
import { btnPrimaryClass, cardClass, inputClass, labelClass } from "@/lib/design/ui-classes";
import type { DashboardFilters } from "@/lib/types/episodes";
import { cn } from "@/lib/utils";

type FilterBarProps = {
  filters: DashboardFilters;
};

export function FilterBar({ filters }: FilterBarProps) {
  return (
    <form
      className={cn(
        cardClass,
        "grid gap-4 p-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end",
      )}
    >
      <label className="space-y-2">
        <span className={labelClass}>Range</span>
        <select name="range" defaultValue={filters.range} className={inputClass}>
          {RANGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span className={labelClass}>Start date</span>
        <input type="date" name="start" defaultValue={filters.start} className={inputClass} />
      </label>

      <label className="space-y-2">
        <span className={labelClass}>End date</span>
        <input type="date" name="end" defaultValue={filters.end} className={inputClass} />
      </label>

      <button type="submit" className={btnPrimaryClass}>
        Apply filters
      </button>
    </form>
  );
}
