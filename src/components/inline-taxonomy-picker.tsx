"use client";

import { useMemo, useState, useTransition } from "react";
import { IconTag, type IconProps } from "@/components/ui/icons";
import {
  alertErrorClass,
  alertInfoClass,
  alertSuccessClass,
  btnPrimaryClass,
  cardClass,
  hintClass,
  inputClass,
  labelClass,
  selectionGridTileClass,
  selectionTileClass,
  selectionTileSelectedClass,
} from "@/lib/design/ui-classes";
import type { TaxonomyActionState } from "@/lib/taxonomy/server";
import type { TaxonomyOption } from "@/lib/types/episodes";
import { cn } from "@/lib/utils";

type InlineTaxonomyPickerProps = {
  name: string;
  title: string;
  singularLabel: string;
  options: TaxonomyOption[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  addAction: (
    previousState: TaxonomyActionState | undefined,
    formData: FormData,
  ) => Promise<TaxonomyActionState>;
  hideAction: (formData: FormData) => Promise<TaxonomyActionState>;
  helperText?: string;
  demoMode: boolean;
  grid?: boolean;
  tileIcon?: React.ComponentType<IconProps>;
};

function sortOptions(options: TaxonomyOption[]) {
  return [...options].sort((left, right) => {
    if (left.user_id === null && right.user_id !== null) {
      return -1;
    }

    if (left.user_id !== null && right.user_id === null) {
      return 1;
    }

    return left.label.localeCompare(right.label);
  });
}

export function InlineTaxonomyPicker({
  name,
  title,
  singularLabel,
  options: initialOptions,
  selectedIds,
  onSelectionChange,
  addAction,
  hideAction,
  helperText,
  demoMode,
  grid = false,
  tileIcon: TileIcon = IconTag,
}: InlineTaxonomyPickerProps) {
  const [options, setOptions] = useState(() => sortOptions(initialOptions));
  const [draftLabel, setDraftLabel] = useState("");
  const [message, setMessage] = useState<TaxonomyActionState>({});
  const [isPending, startTransition] = useTransition();

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  function toggleOption(id: string) {
    onSelectionChange(
      selectedIdSet.has(id) ? selectedIds.filter((value) => value !== id) : [...selectedIds, id],
    );
  }

  function upsertOption(option: TaxonomyOption) {
    setOptions((current) => {
      const next = current.some((entry) => entry.id === option.id)
        ? current.map((entry) => (entry.id === option.id ? option : entry))
        : [...current, option];

      return sortOptions(next);
    });
  }

  function handleAdd() {
    if (!draftLabel.trim() || demoMode) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("label", draftLabel);
      const result = await addAction(undefined, formData);

      setMessage(result);

      if (result.option) {
        upsertOption(result.option);

        if (!selectedIdSet.has(result.option.id)) {
          onSelectionChange([...selectedIds, result.option.id]);
        }
      }

      if (!result.error) {
        setDraftLabel("");
      }
    });
  }

  function handleHide(optionId: string) {
    if (demoMode) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("option_id", optionId);
      const result = await hideAction(formData);

      setMessage(result);

      if (result.hiddenOptionId) {
        setOptions((current) => current.filter((option) => option.id !== result.hiddenOptionId));
        onSelectionChange(selectedIds.filter((value) => value !== result.hiddenOptionId));
      }
    });
  }

  return (
    <div className="space-y-3">
      <span className={labelClass}>{title}</span>

      <div className={cn(grid ? "grid gap-2 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-2")}>
        {options.map((option) => {
          const isSelected = selectedIdSet.has(option.id);
          const isCustom = option.user_id !== null;

          return (
            <div key={option.id} className={cn("group relative", grid && "min-h-[5.5rem]")}>
              <button
                type="button"
                onClick={() => toggleOption(option.id)}
                className={cn(
                  selectionTileClass,
                  "h-full w-full",
                  grid && selectionGridTileClass,
                  isSelected && selectionTileSelectedClass,
                )}
                aria-pressed={isSelected}
              >
                {grid ? (
                  <span className="text-[color:var(--primary)]">
                    <TileIcon className="mx-auto h-5 w-5" />
                  </span>
                ) : (
                  <span
                    className={cn(
                      "h-4 w-4 shrink-0 rounded border",
                      isSelected
                        ? "border-[color:var(--primary)] bg-[color:var(--primary)]"
                        : "border-[color:var(--border)]",
                    )}
                    aria-hidden="true"
                  />
                )}
                <span className={cn(grid && "text-xs leading-tight")}>{option.label}</span>
              </button>

              {isCustom && !demoMode ? (
                <button
                  type="button"
                  onClick={() => handleHide(option.id)}
                  className="absolute right-2 top-2 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--muted)] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[color:var(--accent)] hover:text-[color:var(--primary)]"
                >
                  Hide
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className={cn(cardClass, "flex flex-col gap-3 p-4 md:flex-row md:items-end")}>
        <label className="flex-1 space-y-2">
          <span className="text-sm font-medium text-[color:var(--muted)]">
            Add custom {singularLabel}
          </span>
          <input
            type="text"
            value={draftLabel}
            onChange={(event) => setDraftLabel(event.target.value)}
            className={inputClass}
            placeholder={`Type a custom ${singularLabel}`}
            disabled={demoMode || isPending}
          />
        </label>
        <button
          type="button"
          onClick={handleAdd}
          disabled={demoMode || isPending || !draftLabel.trim()}
          className={cn(btnPrimaryClass, "md:min-w-32")}
        >
          {isPending ? "Saving..." : "Add option"}
        </button>
      </div>

      {helperText ? <p className={hintClass}>{helperText}</p> : null}

      {demoMode ? (
        <p className={alertInfoClass}>Custom {title.toLowerCase()} are disabled in demo mode.</p>
      ) : null}

      {message.error ? <p className={alertErrorClass}>{message.error}</p> : null}

      {!message.error && message.success ? (
        <p className={alertSuccessClass}>{message.success}</p>
      ) : null}

      {selectedIds.map((id) => (
        <input key={`${name}-${id}`} type="hidden" name={name} value={id} />
      ))}
    </div>
  );
}
