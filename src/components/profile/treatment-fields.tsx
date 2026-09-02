"use client";

import {
  OTHER_THERAPY_LABELS,
  OTHER_THERAPY_OPTIONS,
  PRIOR_TREATMENT_LABELS,
  PRIOR_TREATMENT_OPTIONS,
} from "@/lib/constants/profile-options";
import {
  inputClass,
  labelClass,
  selectionTileClass,
  selectionTileSelectedClass,
} from "@/lib/design/ui-classes";
import type { OtherTherapyOption, PriorTreatmentOption } from "@/lib/types/profile";
import { cn } from "@/lib/utils";

type TreatmentFieldsProps = {
  priorTreatments: PriorTreatmentOption[];
  otherTherapies: OtherTherapyOption[];
  onPriorTreatmentsChange: (next: PriorTreatmentOption[]) => void;
  onOtherTherapiesChange: (next: OtherTherapyOption[]) => void;
  priorTreatmentOther: string;
  otherTherapyOther: string;
  promptClass?: string;
};

function isSelected<T extends string>(values: T[], value: T) {
  return values.includes(value);
}

function toggleValue<T extends string>(current: T[], value: T, onChange: (next: T[]) => void) {
  onChange(current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]);
}

export function TreatmentFields({
  priorTreatments,
  otherTherapies,
  onPriorTreatmentsChange,
  onOtherTherapiesChange,
  priorTreatmentOther,
  otherTherapyOther,
  promptClass = labelClass,
}: TreatmentFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <fieldset className="block space-y-2 md:col-span-2">
        <legend className={promptClass}>Prior surgeries / procedures</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {PRIOR_TREATMENT_OPTIONS.map((option) => (
            <label
              key={option}
              className={cn(
                selectionTileClass,
                isSelected(priorTreatments, option) && selectionTileSelectedClass,
              )}
            >
              <input
                type="checkbox"
                name="prior_treatments"
                value={option}
                checked={isSelected(priorTreatments, option)}
                onChange={() => toggleValue(priorTreatments, option, onPriorTreatmentsChange)}
                className="sr-only"
              />
              {PRIOR_TREATMENT_LABELS[option]}
            </label>
          ))}
        </div>
      </fieldset>

      {priorTreatments.includes("other") ? (
        <label className="block space-y-2 md:col-span-2">
          <span className={promptClass}>Other prior treatment</span>
          <input
            type="text"
            name="prior_treatment_other"
            defaultValue={priorTreatmentOther}
            required
            maxLength={200}
            className={inputClass}
          />
        </label>
      ) : (
        <input type="hidden" name="prior_treatment_other" value="" />
      )}

      <fieldset className="block space-y-2 md:col-span-2">
        <legend className={promptClass}>Other therapies</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {OTHER_THERAPY_OPTIONS.map((option) => (
            <label
              key={option}
              className={cn(
                selectionTileClass,
                isSelected(otherTherapies, option) && selectionTileSelectedClass,
              )}
            >
              <input
                type="checkbox"
                name="other_therapies"
                value={option}
                checked={isSelected(otherTherapies, option)}
                onChange={() => toggleValue(otherTherapies, option, onOtherTherapiesChange)}
                className="sr-only"
              />
              {OTHER_THERAPY_LABELS[option]}
            </label>
          ))}
        </div>
      </fieldset>

      {otherTherapies.includes("other") ? (
        <label className="block space-y-2 md:col-span-2">
          <span className={promptClass}>Other therapy</span>
          <input
            type="text"
            name="other_therapy_other"
            defaultValue={otherTherapyOther}
            required
            maxLength={200}
            className={inputClass}
          />
        </label>
      ) : (
        <input type="hidden" name="other_therapy_other" value="" />
      )}
    </div>
  );
}
