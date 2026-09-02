"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  formatPainTypeLabels,
  NO_MEDICATION_OPTION_ID,
  PAIN_PATTERN_LABELS,
  PAIN_PATTERN_OPTIONS,
} from "@/lib/constants/episode-options";
import { FaceMapSelector } from "@/components/face-map-selector";
import { InlineTaxonomyPicker } from "@/components/inline-taxonomy-picker";
import { TreatmentFields } from "@/components/profile/treatment-fields";
import { IconTrigger } from "@/components/ui/icons";
import { SeverityCard } from "@/components/ui/severity-card";
import type { EpisodeActionState } from "@/lib/episodes/actions";
import type { TaxonomyActionState } from "@/lib/taxonomy/server";
import type { PainPatternOption, TaxonomyOption } from "@/lib/types/episodes";
import type { FaceMapPoint } from "@/lib/face-map/types";
import type { PatientProfile } from "@/lib/types/profile";
import {
  alertErrorClass,
  alertInfoClass,
  btnSecondaryClass,
  hintClass,
  inputClass,
  inputMonoClass,
  surveyPromptClass,
  selectionTileClass,
  selectionTileSelectedClass,
} from "@/lib/design/ui-classes";
import { cn } from "@/lib/utils";
import { SubmitButton } from "@/components/ui/submit-button";

type EpisodeFormProps = {
  profile: PatientProfile;
  triggerOptions: TaxonomyOption[];
  medicationOptions: TaxonomyOption[];
  painTypeOptions: TaxonomyOption[];
  demoMode: boolean;
  addTriggerAction: (
    previousState: TaxonomyActionState | undefined,
    formData: FormData,
  ) => Promise<TaxonomyActionState>;
  addMedicationAction: (
    previousState: TaxonomyActionState | undefined,
    formData: FormData,
  ) => Promise<TaxonomyActionState>;
  addPainTypeAction: (
    previousState: TaxonomyActionState | undefined,
    formData: FormData,
  ) => Promise<TaxonomyActionState>;
  hideTriggerAction: (formData: FormData) => Promise<TaxonomyActionState>;
  hideMedicationAction: (formData: FormData) => Promise<TaxonomyActionState>;
  hidePainTypeAction: (formData: FormData) => Promise<TaxonomyActionState>;
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

function resolvePainTypeLabels(optionIds: string[], options: TaxonomyOption[]) {
  return optionIds
    .map((id) => options.find((option) => option.id === id)?.label)
    .filter((label): label is string => Boolean(label));
}

export function EpisodeForm({
  profile,
  triggerOptions,
  medicationOptions,
  painTypeOptions,
  demoMode,
  addTriggerAction,
  addMedicationAction,
  addPainTypeAction,
  hideTriggerAction,
  hideMedicationAction,
  hidePainTypeAction,
  action,
}: EpisodeFormProps) {
  const [state, formAction] = useActionState<EpisodeActionState, FormData>(action, INITIAL_STATE);
  const [severity, setSeverity] = useState(5);
  const [painPattern, setPainPattern] = useState<PainPatternOption | "">("");
  const [facePoints, setFacePoints] = useState<FaceMapPoint[]>([]);
  const [selectedTriggerIds, setSelectedTriggerIds] = useState<string[]>([]);
  const [selectedMedicationIds, setSelectedMedicationIds] = useState<string[]>([]);
  const [medicationWithin24h, setMedicationWithin24h] = useState<"yes" | "no" | "">("");
  const [treatmentHistoryChanged, setTreatmentHistoryChanged] = useState<"yes" | "no" | "">("");
  const selectableMedicationOptions = medicationOptions.filter(
    (option) => option.id !== NO_MEDICATION_OPTION_ID,
  );
  const [selectedPainTypeIds, setSelectedPainTypeIds] = useState(profile.pain_type_option_ids);
  const profilePainTypeLabels = resolvePainTypeLabels(
    profile.pain_type_option_ids,
    painTypeOptions,
  );
  const [priorTreatments, setPriorTreatments] = useState(
    profile.prior_treatments.map((entry) => entry.treatment_type),
  );
  const [otherTherapies, setOtherTherapies] = useState(
    profile.other_therapies.map((entry) => entry.therapy_type),
  );

  const priorTreatmentOther =
    profile.prior_treatments.find((entry) => entry.treatment_type === "other")?.other_label ?? "";
  const otherTherapyOther =
    profile.other_therapies.find((entry) => entry.therapy_type === "other")?.other_label ?? "";

  return (
    <form action={formAction} className="space-y-8">
      {state.error ? <p className={alertErrorClass}>{state.error}</p> : null}

      <section className="space-y-4">
        <label className="block space-y-2">
          <span className={surveyPromptClass}>Time of attack</span>
          <input
            type="datetime-local"
            name="onset_at"
            required
            defaultValue={getDefaultOnsetAt()}
            className={cn(inputClass, "max-w-xs")}
          />
        </label>

        <SeverityCard severity={severity} onChange={setSeverity} />
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <span className={surveyPromptClass}>Pain location on face</span>
          <FaceMapSelector points={facePoints} onChange={setFacePoints} />
          <input type="hidden" name="face_points" value={JSON.stringify(facePoints)} />
        </div>
      </section>

      <section className="space-y-4">
        <fieldset className="space-y-3">
          <legend className={surveyPromptClass}>Pain pattern</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {PAIN_PATTERN_OPTIONS.map((option) => (
              <label
                key={option}
                className={cn(
                  selectionTileClass,
                  painPattern === option && selectionTileSelectedClass,
                )}
              >
                <input
                  type="radio"
                  name="pain_pattern"
                  value={option}
                  required
                  checked={painPattern === option}
                  onChange={() => setPainPattern(option)}
                  className="sr-only"
                />
                {PAIN_PATTERN_LABELS[option]}
              </label>
            ))}
          </div>
          <p className={hintClass}>Choose whether the pain felt steady or came in short bursts.</p>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          {painPattern === "episodic_pulsing" ? (
            <label className="block space-y-2 sm:col-span-2">
              <span className={surveyPromptClass}>Length of each pulse</span>
              <input
                type="text"
                name="pulse_duration_hms"
                defaultValue="00:00:02"
                required
                inputMode="text"
                maxLength={8}
                className={cn(inputMonoClass, "max-w-xs")}
                placeholder="00:00:02"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
              />
              <p className={hintClass}>Enter how long each individual pulse lasted, using hh:mm:ss.</p>
            </label>
          ) : null}

          <label className="block space-y-2">
            <span className={surveyPromptClass}>Episode length</span>
            <input
              type="text"
              name="duration_hms"
              defaultValue="00:05:00"
              required
              inputMode="text"
              maxLength={8}
              className={inputMonoClass}
              placeholder="00:05:00"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
            />
            <p className={hintClass}>Enter duration as hh:mm:ss, up to 23:59:59.</p>
          </label>
        </div>
      </section>

      <section className="space-y-6">
        <InlineTaxonomyPicker
          name="trigger_ids"
          title="What prompted the attack?"
          titleClass={surveyPromptClass}
          singularLabel="trigger"
          options={triggerOptions}
          selectedIds={selectedTriggerIds}
          onSelectionChange={setSelectedTriggerIds}
          addAction={addTriggerAction}
          hideAction={hideTriggerAction}
          demoMode={demoMode}
          grid
          tileIcon={IconTrigger}
        />

        <fieldset className="space-y-3">
          <legend className={surveyPromptClass}>
            Did you take any medication in the past 24 hours?
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["no", "yes"] as const).map((option) => (
              <label
                key={option}
                className={cn(
                  selectionTileClass,
                  medicationWithin24h === option && selectionTileSelectedClass,
                )}
              >
                <input
                  type="radio"
                  name="medication_within_24h"
                  value={option}
                  required
                  checked={medicationWithin24h === option}
                  onChange={() => {
                    setMedicationWithin24h(option);
                    if (option === "no") {
                      setSelectedMedicationIds([]);
                    }
                  }}
                  className="sr-only"
                />
                {option === "yes" ? "Yes" : "No"}
              </label>
            ))}
          </div>
          {medicationWithin24h === "yes" ? (
            <InlineTaxonomyPicker
              name="medication_ids"
              title="Which medications?"
              titleClass={surveyPromptClass}
              singularLabel="medication"
              options={selectableMedicationOptions}
              selectedIds={selectedMedicationIds}
              onSelectionChange={setSelectedMedicationIds}
              addAction={addMedicationAction}
              hideAction={hideMedicationAction}
              helperText="Select all medications taken in the past 24 hours."
              demoMode={demoMode}
            />
          ) : null}
        </fieldset>
      </section>

      <section className="space-y-3">
        <fieldset className="space-y-3">
          <legend className={surveyPromptClass}>
            Has anything changed about your pain type, surgeries, procedures, or other therapies
            since your last entry?
          </legend>
          <p className={hintClass}>
            Facial pain type is saved on your profile
            {profilePainTypeLabels.length ? (
              <>
                {" "}
                (currently <strong>{formatPainTypeLabels(profilePainTypeLabels)}</strong>)
              </>
            ) : (
              <>
                {" "}
                —{" "}
                <Link href="/settings" className="font-medium text-[color:var(--primary)]">
                  set it in Profile settings
                </Link>{" "}
                before logging an entry
              </>
            )}
            .
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["no", "yes"] as const).map((option) => (
              <label
                key={option}
                className={cn(
                  selectionTileClass,
                  treatmentHistoryChanged === option && selectionTileSelectedClass,
                )}
              >
                <input
                  type="radio"
                  name="treatment_history_changed"
                  value={option}
                  required
                  checked={treatmentHistoryChanged === option}
                  onChange={() => setTreatmentHistoryChanged(option)}
                  className="sr-only"
                />
                {option === "yes" ? "Something Has Changed" : "No Changes"}
              </label>
            ))}
          </div>
          {treatmentHistoryChanged === "yes" ? (
            <div className="space-y-4 rounded-3xl border border-[color:var(--border)] bg-[color:var(--accent)]/60 p-4">
              <label className="block space-y-2">
                <span className={surveyPromptClass}>When did this change occur?</span>
                <input
                  type="date"
                  name="treatment_change_date"
                  required
                  max={new Date().toISOString().slice(0, 10)}
                  className={cn(inputClass, "max-w-xs")}
                />
                <p className={hintClass}>
                  For example, the date of a new procedure or when a therapy started.
                </p>
              </label>
              <InlineTaxonomyPicker
                name="pain_type_ids"
                title="Facial pain type"
                titleClass={surveyPromptClass}
                singularLabel="pain type"
                options={painTypeOptions}
                selectedIds={selectedPainTypeIds}
                onSelectionChange={setSelectedPainTypeIds}
                addAction={addPainTypeAction}
                hideAction={hidePainTypeAction}
                helperText="Select all that apply. Add a custom pain type if yours is not listed."
                demoMode={demoMode}
                grid
              />
              <p className="text-sm text-[color:var(--muted)]">
                Update your facial pain type, surgeries, procedures, and other therapies below. This
                update will be saved with this entry and applied to your overall profile.
              </p>
              <TreatmentFields
                promptClass={surveyPromptClass}
                priorTreatments={priorTreatments}
                otherTherapies={otherTherapies}
                onPriorTreatmentsChange={setPriorTreatments}
                onOtherTherapiesChange={setOtherTherapies}
                priorTreatmentOther={priorTreatmentOther}
                otherTherapyOther={otherTherapyOther}
              />
            </div>
          ) : null}
        </fieldset>
      </section>

      <section className="space-y-2">
        <label className="block space-y-2">
          <span className={surveyPromptClass}>Notes</span>
          <textarea
            name="notes"
            rows={4}
            maxLength={500}
            className={cn(inputClass, "resize-y")}
            placeholder="Optional details about the episode, context, or anything unusual you noticed."
          />
        </label>
      </section>

      {demoMode ? (
        <p className={alertInfoClass}>
          Demo mode lets you preview the multi-select layout, but entries are not saved yet.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <SubmitButton label="Save entry" pendingLabel="Saving entry..." className="min-w-36" />
        <Link href="/dashboard" className={btnSecondaryClass}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
