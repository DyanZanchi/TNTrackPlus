"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { FaceMapSelector } from "@/components/face-map-selector";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormInstructions } from "@/components/ui/form-instructions";
import { SeverityCard } from "@/components/ui/severity-card";
import { FunctionalImpactField } from "@/components/ui/functional-impact-field";
import {
  PAIN_QUALITY_LABELS,
  PAIN_QUALITY_OPTIONS,
} from "@/lib/constants/episode-options";
import {
  alertErrorClass,
  alertInfoClass,
  btnSecondaryClass,
  hintClass,
  inputClass,
  selectionTileClass,
  selectionTileSelectedClass,
  surveyPromptClass,
} from "@/lib/design/ui-classes";
import type { BackgroundCheckInActionState } from "@/lib/background-check-ins/actions";
import type { FaceMapPoint } from "@/lib/face-map/types";
import type { PainQualityOption } from "@/lib/types/episodes";
import { cn } from "@/lib/utils";

type BackgroundCheckInFormProps = {
  demoMode: boolean;
  action: (
    previousState: BackgroundCheckInActionState | undefined,
    formData: FormData,
  ) => Promise<BackgroundCheckInActionState>;
};

function getDefaultRecordedAt() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function BackgroundCheckInForm({ demoMode, action }: BackgroundCheckInFormProps) {
  const [state, formAction] = useActionState<BackgroundCheckInActionState, FormData>(action, {});
  const [severity, setSeverity] = useState(5);
  const [painQualities, setPainQualities] = useState<PainQualityOption[]>([]);
  const [facePoints, setFacePoints] = useState<FaceMapPoint[]>([]);

  return (
    <form action={formAction} className="space-y-8">
      <FormInstructions />
      {state.error ? (
        <p role="alert" className={alertErrorClass}>
          {state.error}
        </p>
      ) : null}

      <label className="block max-w-xs space-y-2">
        <span className={surveyPromptClass}>When are you checking in?</span>
        <input
          type="datetime-local"
          name="recorded_at"
          required
          defaultValue={getDefaultRecordedAt()}
          className={inputClass}
        />
      </label>

      <SeverityCard
        severity={severity}
        onChange={setSeverity}
        prompt="How intense is your background pain right now?"
      />
      <FunctionalImpactField subject="background pain" />

      <fieldset className="space-y-3">
        <legend className={surveyPromptClass}>How would you describe the background pain?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {PAIN_QUALITY_OPTIONS.map((option) => {
            const selected = painQualities.includes(option);

            return (
              <label
                key={option}
                className={cn(selectionTileClass, selected && selectionTileSelectedClass)}
              >
                <input
                  type="checkbox"
                  name="pain_qualities"
                  value={option}
                  checked={selected}
                  onChange={() =>
                    setPainQualities((current) =>
                      selected
                        ? current.filter((entry) => entry !== option)
                        : [...current, option],
                    )
                  }
                  className="sr-only"
                />
                {PAIN_QUALITY_LABELS[option]}
              </label>
            );
          })}
        </div>
        <p className={hintClass}>Optional. Select all that apply.</p>

        {painQualities.includes("other") ? (
          <label className="block max-w-lg space-y-2">
            <span className={surveyPromptClass}>Describe the pain in your own words</span>
            <input
              type="text"
              name="pain_quality_other"
              required
              maxLength={200}
              className={inputClass}
            />
          </label>
        ) : null}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className={surveyPromptClass}>Where do you feel the background pain?</legend>
        <FaceMapSelector points={facePoints} onChange={setFacePoints} />
        <input type="hidden" name="face_points" value={JSON.stringify(facePoints)} />
        <p className={hintClass}>Optional. Leave the map blank if you do not want to add a location.</p>
      </fieldset>

      <label className="block space-y-2">
        <span className={surveyPromptClass}>Is there anything else you want to record?</span>
        <textarea
          name="notes"
          rows={4}
          maxLength={500}
          className={inputClass}
          placeholder="Optional notes about your background pain right now."
        />
      </label>

      {demoMode ? (
        <p className={alertInfoClass}>
          Demo mode lets you preview this check-in, but it will not be saved.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <SubmitButton label="Save background check-in" pendingLabel="Saving check-in..." />
        <Link href="/dashboard" className={btnSecondaryClass}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
