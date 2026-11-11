"use client";

import Image from "next/image";
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
  titleClass?: string;
  demoMode: boolean;
  grid?: boolean;
  presentation?: "default" | "circles";
  optionImages?: Partial<Record<string, string>>;
  tileIcon?: React.ComponentType<IconProps>;
  exclusiveOptionId?: string;
  exclusiveOptionIds?: string[];
};

function sortOptions(options: TaxonomyOption[], priorityIds: string[] = []) {
  const priorityIndex = new Map(priorityIds.map((id, index) => [id, index]));

  return [...options].sort((left, right) => {
    const leftPriority = priorityIndex.has(left.id)
      ? priorityIndex.get(left.id)!
      : Number.POSITIVE_INFINITY;
    const rightPriority = priorityIndex.has(right.id)
      ? priorityIndex.get(right.id)!
      : Number.POSITIVE_INFINITY;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

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
  titleClass = labelClass,
  demoMode,
  grid = false,
  presentation = "default",
  optionImages,
  tileIcon: TileIcon = IconTag,
  exclusiveOptionId,
  exclusiveOptionIds,
}: InlineTaxonomyPickerProps) {
  const exclusiveIds = exclusiveOptionIds ?? (exclusiveOptionId ? [exclusiveOptionId] : []);
  const [options, setOptions] = useState(() => sortOptions(initialOptions, exclusiveIds));
  const [draftLabel, setDraftLabel] = useState("");
  const [message, setMessage] = useState<TaxonomyActionState>({});
  const [isPending, startTransition] = useTransition();

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const circles = presentation === "circles";

  function toggleOption(id: string) {
    if (exclusiveIds.includes(id)) {
      onSelectionChange(selectedIdSet.has(id) ? [] : [id]);
      return;
    }

    const withoutExclusive = exclusiveIds.length
      ? selectedIds.filter((value) => !exclusiveIds.includes(value))
      : selectedIds;

    onSelectionChange(
      selectedIdSet.has(id)
        ? withoutExclusive.filter((value) => value !== id)
        : [...withoutExclusive, id],
    );
  }

  function upsertOption(option: TaxonomyOption) {
    setOptions((current) => {
      const next = current.some((entry) => entry.id === option.id)
        ? current.map((entry) => (entry.id === option.id ? option : entry))
        : [...current, option];

      return sortOptions(next, exclusiveIds);
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
          const nextIds = exclusiveIds.length
            ? selectedIds.filter((value) => !exclusiveIds.includes(value))
            : selectedIds;
          onSelectionChange([...nextIds, result.option.id]);
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
      <span className={titleClass}>{title}</span>

      <div
        className={cn(
          circles
            ? "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
            : grid
              ? "grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
              : "grid gap-2",
        )}
      >
        {options.map((option) => {
          const isSelected = selectedIdSet.has(option.id);
          const isCustom = option.user_id !== null;
          const optionImage = optionImages?.[option.normalized_label];

          return (
            <div
              key={option.id}
              className={cn(
                "group relative",
                grid && !circles && "min-h-[5.5rem]",
                circles && "min-h-[6.5rem]",
              )}
            >
              <button
                type="button"
                onClick={() => toggleOption(option.id)}
                className={cn(
                  circles
                    ? "flex h-full w-full flex-col items-center justify-start gap-2 rounded-2xl px-2 py-2 text-center text-sm font-medium text-[color:var(--foreground)] transition-all duration-200 hover:bg-[color:var(--accent)]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/30 active:scale-[0.98]"
                    : selectionTileClass,
                  !circles && "h-full w-full",
                  grid && !circles && selectionGridTileClass,
                  isSelected &&
                    (circles
                      ? "bg-[color:var(--accent)]/60 text-[color:var(--primary)]"
                      : selectionTileSelectedClass),
                )}
                aria-pressed={isSelected}
              >
                {circles ? (
                  <span
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[color:var(--border)] bg-white text-[color:var(--primary)] shadow-sm transition-all duration-200 group-hover:border-[color:var(--accent-strong)] group-hover:shadow-md",
                      isSelected &&
                        "!border-[color:var(--primary)] !bg-[color:var(--primary)] !text-white shadow-[0_6px_18px_rgba(123,82,171,0.28)]",
                    )}
                  >
                    {optionImage ? (
                      <Image
                        src={optionImage}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <TileIcon className="h-5 w-5" />
                    )}
                  </span>
                ) : grid ? (
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
                <span
                  className={cn(
                    grid && !circles && "text-xs leading-tight",
                    circles && "max-w-[9rem] text-xs leading-snug sm:text-sm",
                  )}
                >
                  {option.label}
                </span>
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
