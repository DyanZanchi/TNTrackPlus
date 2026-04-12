"use client";

import { useMemo, useState, useTransition } from "react";
import type { TaxonomyActionState } from "@/lib/taxonomy/server";
import type { TaxonomyOption } from "@/lib/types/episodes";

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
    <div className="space-y-2">
      <span className="text-sm font-medium">{title}</span>
      <div className="space-y-3 rounded-xl border border-[color:var(--border)] bg-white p-3">
        <div className="grid gap-2">
          {options.map((option) => {
            const isSelected = selectedIdSet.has(option.id);
            const isCustom = option.user_id !== null;

            return (
              <div key={option.id} className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggleOption(option.id)}
                  className={`flex min-h-11 flex-1 items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm ${
                    isSelected
                      ? "border-[color:var(--primary)] bg-[color:var(--accent)] text-[color:var(--primary)]"
                      : "border-[color:var(--border)]"
                  }`}
                  aria-pressed={isSelected}
                >
                  <span
                    className={`h-4 w-4 rounded border ${
                      isSelected
                        ? "border-[color:var(--primary)] bg-[color:var(--primary)]"
                        : "border-[color:var(--border)]"
                    }`}
                    aria-hidden="true"
                  />
                  <span>{option.label}</span>
                </button>

                {isCustom && !demoMode ? (
                  <button
                    type="button"
                    onClick={() => handleHide(option.id)}
                    className="text-xs font-medium text-[color:var(--muted)]"
                  >
                    Hide
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-[color:var(--border)] pt-3 md:flex-row md:items-end">
          <label className="flex-1 space-y-2">
            <span className="text-sm font-medium">Add custom {singularLabel}</span>
            <input
              type="text"
              value={draftLabel}
              onChange={(event) => setDraftLabel(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2"
              placeholder={`Type a custom ${singularLabel}`}
              disabled={demoMode || isPending}
            />
          </label>
          <button
            type="button"
            onClick={handleAdd}
            disabled={demoMode || isPending || !draftLabel.trim()}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[color:var(--primary)] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 md:min-w-32"
          >
            {isPending ? "Saving..." : "Add option"}
          </button>
        </div>
      </div>

      {helperText ? <span className="text-xs text-[color:var(--muted)]">{helperText}</span> : null}

      {demoMode ? (
        <p className="rounded-xl bg-[color:var(--accent)] px-4 py-3 text-sm text-[color:var(--muted)]">
          Custom {title.toLowerCase()} are disabled in demo mode.
        </p>
      ) : null}

      {message.error ? (
        <p className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm text-[color:var(--danger)]">
          {message.error}
        </p>
      ) : null}

      {!message.error && message.success ? (
        <p className="rounded-xl bg-[color:var(--accent)] px-4 py-3 text-sm text-[color:var(--foreground)]">
          {message.success}
        </p>
      ) : null}

      {selectedIds.map((id) => (
        <input key={`${name}-${id}`} type="hidden" name={name} value={id} />
      ))}
    </div>
  );
}
