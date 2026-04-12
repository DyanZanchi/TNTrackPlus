"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  FACE_AREA_LABELS,
  FACE_AREA_OPTIONS,
  PAIN_TYPE_LABELS,
  PAIN_TYPE_OPTIONS,
} from "@/lib/constants/episode-options";
import { InlineTaxonomyPicker } from "@/components/inline-taxonomy-picker";
import type { EpisodeActionState } from "@/lib/episodes/actions";
import type { TaxonomyActionState } from "@/lib/taxonomy/server";
import type { TaxonomyOption } from "@/lib/types/episodes";
import { SubmitButton } from "@/components/ui/submit-button";

type EpisodeFormProps = {
  triggerOptions: TaxonomyOption[];
  medicationOptions: TaxonomyOption[];
  demoMode: boolean;
  addTriggerAction: (
    previousState: TaxonomyActionState | undefined,
    formData: FormData,
  ) => Promise<TaxonomyActionState>;
  addMedicationAction: (
    previousState: TaxonomyActionState | undefined,
    formData: FormData,
  ) => Promise<TaxonomyActionState>;
  hideTriggerAction: (formData: FormData) => Promise<TaxonomyActionState>;
  hideMedicationAction: (formData: FormData) => Promise<TaxonomyActionState>;
  action: (
    previousState: EpisodeActionState | undefined,
    formData: FormData,
  ) => Promise<EpisodeActionState>;
};

const INITIAL_STATE: EpisodeActionState = {};

function getDefaultOnsetAt() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function EpisodeForm({
  triggerOptions,
  medicationOptions,
  demoMode,
  addTriggerAction,
  addMedicationAction,
  hideTriggerAction,
  hideMedicationAction,
  action,
}: EpisodeFormProps) {
  const [state, formAction] = useActionState<EpisodeActionState, FormData>(action, INITIAL_STATE);
  const [severity, setSeverity] = useState(5);
  const [selectedFaceAreas, setSelectedFaceAreas] = useState<(typeof FACE_AREA_OPTIONS)[number][]>([]);
  const [selectedTriggerIds, setSelectedTriggerIds] = useState<string[]>([]);
  const [selectedMedicationIds, setSelectedMedicationIds] = useState<string[]>([]);

  function toggleFaceArea(value: (typeof FACE_AREA_OPTIONS)[number]) {
    setSelectedFaceAreas((current) =>
      current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value],
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm text-[color:var(--danger)]">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Facial pain type</span>
          <select
            name="pain_type"
            defaultValue=""
            required
            className="min-h-11 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2"
          >
            <option value="" disabled>
              Select one
            </option>
            {PAIN_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {PAIN_TYPE_LABELS[option]}
              </option>
            ))}
          </select>
        </label>

        <div className="block space-y-2">
          <span className="text-sm font-medium">Face area</span>
          <div className="grid gap-2 rounded-xl border border-[color:var(--border)] bg-white p-3 sm:grid-cols-2">
            {FACE_AREA_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleFaceArea(option)}
                className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm ${
                  selectedFaceAreas.includes(option)
                    ? "border-[color:var(--primary)] bg-[color:var(--accent)] text-[color:var(--primary)]"
                    : "border-[color:var(--border)]"
                }`}
                aria-pressed={selectedFaceAreas.includes(option)}
              >
                {FACE_AREA_LABELS[option]}
              </button>
            ))}
          </div>
          <span className="text-xs text-[color:var(--muted)]">
            Select every area involved in this episode.
          </span>
          {selectedFaceAreas.map((option) => (
            <input key={option} type="hidden" name="face_areas" value={option} />
          ))}
        </div>

        <label className="block space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Severity</span>
            <span className="rounded-full bg-[color:var(--accent)] px-2.5 py-1 text-sm font-semibold text-[color:var(--primary)]">
              {severity}/10
            </span>
          </div>
          <input
            type="range"
            name="severity"
            min="1"
            max="10"
            step="1"
            value={severity}
            required
            onChange={(event) => setSeverity(Number(event.target.value))}
            className="w-full accent-[color:var(--primary)]"
          />
          <div className="flex justify-between text-xs text-[color:var(--muted)]">
            <span>1</span>
            <span>10</span>
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Episode length</span>
          <input
            type="text"
            name="duration_hms"
            defaultValue="00:05:00"
            required
            inputMode="text"
            maxLength={8}
            className="min-h-11 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 font-mono"
            placeholder="00:05:00"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
          <span className="text-xs text-[color:var(--muted)]">
            Enter duration as `hh:mm:ss`, up to `23:59:59`.
          </span>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Onset time</span>
          <input
            type="datetime-local"
            name="onset_at"
            required
            defaultValue={getDefaultOnsetAt()}
            className="min-h-11 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2"
          />
        </label>

        <InlineTaxonomyPicker
          name="trigger_ids"
          title="Likely triggers"
          singularLabel="trigger"
          options={triggerOptions}
          selectedIds={selectedTriggerIds}
          onSelectionChange={setSelectedTriggerIds}
          addAction={addTriggerAction}
          hideAction={hideTriggerAction}
          demoMode={demoMode}
        />

        <InlineTaxonomyPicker
          name="medication_ids"
          title="Medications taken"
          singularLabel="medication"
          options={medicationOptions}
          selectedIds={selectedMedicationIds}
          onSelectionChange={setSelectedMedicationIds}
          addAction={addMedicationAction}
          hideAction={hideMedicationAction}
          helperText="Select all that apply. If you choose “No medication”, leave other medications unchecked."
          demoMode={demoMode}
        />
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Notes</span>
        <textarea
          name="notes"
          rows={4}
          maxLength={500}
          className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2"
          placeholder="Optional details about the episode, context, or anything unusual you noticed."
        />
      </label>

      {demoMode && (
        <p className="rounded-xl bg-[color:var(--accent)] px-4 py-3 text-sm text-[color:var(--muted)]">
          Demo mode lets you preview the multi-select layout, but entries are not saved yet.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <SubmitButton label="Save entry" pendingLabel="Saving entry..." />
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[color:var(--border)] px-4 py-2 font-semibold"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
