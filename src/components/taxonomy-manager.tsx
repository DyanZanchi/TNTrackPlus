"use client";

import { useActionState } from "react";
import type { TaxonomyActionState } from "@/lib/taxonomy/server";
import type { TaxonomyOption } from "@/lib/types/episodes";
import { SubmitButton } from "@/components/ui/submit-button";

type TaxonomyManagerProps = {
  title: string;
  singularLabel: string;
  options: TaxonomyOption[];
  addAction: (
    previousState: TaxonomyActionState | undefined,
    formData: FormData,
  ) => Promise<TaxonomyActionState>;
  hideAction: (formData: FormData) => Promise<void>;
  demoMode: boolean;
};

const INITIAL_STATE: TaxonomyActionState = {};

export function TaxonomyManager({
  title,
  singularLabel,
  options,
  addAction,
  hideAction,
  demoMode,
}: TaxonomyManagerProps) {
  const [state, formAction] = useActionState<TaxonomyActionState, FormData>(addAction, INITIAL_STATE);

  return (
    <div className="space-y-4 rounded-2xl border border-[color:var(--border)] bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Add a custom {singularLabel} for your account or hide one you no longer need in future entries.
        </p>
      </div>

      {demoMode ? (
        <p className="rounded-xl bg-[color:var(--accent)] px-4 py-3 text-sm text-[color:var(--muted)]">
          Custom {title.toLowerCase()} are disabled in demo mode.
        </p>
      ) : (
        <form action={formAction} className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="flex-1 space-y-2">
            <span className="text-sm font-medium">New {singularLabel}</span>
            <input
              type="text"
              name="label"
              className="min-h-11 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2"
              placeholder={`Add a custom ${singularLabel}`}
            />
          </label>
          <SubmitButton label="Add option" pendingLabel="Adding..." className="md:min-w-32" />
        </form>
      )}

      {state.error && (
        <p className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm text-[color:var(--danger)]">{state.error}</p>
      )}

      {state.success && (
        <p className="rounded-xl bg-[color:var(--accent)] px-4 py-3 text-sm text-[color:var(--foreground)]">
          {state.success}
        </p>
      )}

      {options.length ? (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <form key={option.id} action={hideAction} className="inline-flex">
              <input type="hidden" name="option_id" value={option.id} />
              <button
                type="submit"
                disabled={demoMode}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{option.label}</span>
                <span className="text-[color:var(--muted)]">Hide</span>
              </button>
            </form>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[color:var(--muted)]">No custom {title.toLowerCase()} yet.</p>
      )}
    </div>
  );
}
