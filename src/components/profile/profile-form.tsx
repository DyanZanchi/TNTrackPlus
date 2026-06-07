"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { GENDER_LABELS, GENDER_OPTIONS } from "@/lib/constants/profile-options";
import { InlineTaxonomyPicker } from "@/components/inline-taxonomy-picker";
import { TreatmentFields } from "@/components/profile/treatment-fields";
import type { TaxonomyActionState } from "@/lib/taxonomy/server";
import type { TaxonomyOption } from "@/lib/types/episodes";
import type { ProfileActionState } from "@/lib/profile/actions";
import type { PatientProfile } from "@/lib/types/profile";
import {
  alertErrorClass,
  alertInfoClass,
  btnSecondaryClass,
  inputClass,
  labelClass,
} from "@/lib/design/ui-classes";
import { SubmitButton } from "@/components/ui/submit-button";

type ProfileFormProps = {
  profile: PatientProfile;
  painTypeOptions: TaxonomyOption[];
  demoMode: boolean;
  addPainTypeAction: (
    previousState: TaxonomyActionState | undefined,
    formData: FormData,
  ) => Promise<TaxonomyActionState>;
  hidePainTypeAction: (formData: FormData) => Promise<TaxonomyActionState>;
  action: (
    previousState: ProfileActionState | undefined,
    formData: FormData,
  ) => Promise<ProfileActionState>;
};

const INITIAL_STATE: ProfileActionState = {};

export function ProfileForm({
  profile,
  painTypeOptions,
  demoMode,
  addPainTypeAction,
  hidePainTypeAction,
  action,
}: ProfileFormProps) {
  const [state, formAction] = useActionState<ProfileActionState, FormData>(action, INITIAL_STATE);
  const [gender, setGender] = useState(profile.gender ?? "");
  const [priorTreatments, setPriorTreatments] = useState(
    profile.prior_treatments.map((entry) => entry.treatment_type),
  );
  const [otherTherapies, setOtherTherapies] = useState(
    profile.other_therapies.map((entry) => entry.therapy_type),
  );
  const [selectedPainTypeIds, setSelectedPainTypeIds] = useState(profile.pain_type_option_ids);
  const priorTreatmentOther =
    profile.prior_treatments.find((entry) => entry.treatment_type === "other")?.other_label ?? "";
  const otherTherapyOther =
    profile.other_therapies.find((entry) => entry.therapy_type === "other")?.other_label ?? "";

  return (
    <form action={formAction} className="space-y-8">
      {state.error ? <p className={alertErrorClass}>{state.error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className={labelClass}>Age</span>
          <input
            type="number"
            name="age"
            min="1"
            max="120"
            required
            defaultValue={profile.age ?? ""}
            className={inputClass}
          />
        </label>

        <label className="block space-y-2">
          <span className={labelClass}>Gender</span>
          <select
            name="gender"
            required
            value={gender}
            onChange={(event) => setGender(event.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Select one
            </option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {GENDER_LABELS[option]}
              </option>
            ))}
          </select>
        </label>

        {gender === "other" ? (
          <label className="block space-y-2 md:col-span-2">
            <span className={labelClass}>Describe gender</span>
            <input
              type="text"
              name="gender_other"
              defaultValue={profile.gender_other ?? ""}
              required
              maxLength={100}
              className={inputClass}
            />
          </label>
        ) : (
          <input type="hidden" name="gender_other" value="" />
        )}

        <div className="md:col-span-2">
          <InlineTaxonomyPicker
            name="pain_type_ids"
            title="Facial pain type"
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
        </div>

        <TreatmentFields
          priorTreatments={priorTreatments}
          otherTherapies={otherTherapies}
          onPriorTreatmentsChange={setPriorTreatments}
          onOtherTherapiesChange={setOtherTherapies}
          priorTreatmentOther={priorTreatmentOther}
          otherTherapyOther={otherTherapyOther}
        />
      </div>

      {demoMode ? (
        <p className={alertInfoClass}>
          Demo mode previews the profile form, but changes are not saved.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <SubmitButton label="Save profile" pendingLabel="Saving profile..." />
        <Link href="/dashboard" className={btnSecondaryClass}>
          Back to dashboard
        </Link>
      </div>
    </form>
  );
}
