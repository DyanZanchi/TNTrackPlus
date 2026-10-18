"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  CLINICIAN_EVALUATION_LABELS,
  CLINICIAN_EVALUATION_OPTIONS,
  DIAGNOSIS_STATUS_LABELS,
  DIAGNOSIS_STATUS_OPTIONS,
  GENDER_LABELS,
  GENDER_OPTIONS,
  PATIENT_PAIN_PATTERN_LABELS,
  PATIENT_PAIN_PATTERN_OPTIONS,
  RELEVANT_HISTORY_LABELS,
  RELEVANT_HISTORY_OPTIONS,
  isExclusiveHistoryOption,
} from "@/lib/constants/profile-options";
import { YES_NO_UNSURE_LABELS, YES_NO_UNSURE_OPTIONS } from "@/lib/constants/episode-options";
import {
  DESCRIBED_PATTERN_STATUS_LABELS,
  DESCRIBED_PATTERN_STATUS_OPTIONS,
  PATIENT_DESCRIBED_PATTERNS,
  type DescribedPatternStatus,
} from "@/lib/classification/patient-described-patterns";
import { FormInstructions } from "@/components/ui/form-instructions";
import {
  HEADACHE_PATTERN_STATUS_LABELS,
  HEADACHE_PATTERNS,
  headacheFollowUpApplies,
  type HeadachePatternStatus,
} from "@/lib/classification/headache-patterns";
import { InlineTaxonomyPicker } from "@/components/inline-taxonomy-picker";
import { TreatmentFields } from "@/components/profile/treatment-fields";
import type { TaxonomyActionState } from "@/lib/taxonomy/server";
import type { TaxonomyOption } from "@/lib/types/episodes";
import type { ProfileActionState } from "@/lib/profile/actions";
import type {
  ClinicianEvaluationOption,
  DiagnosisStatusOption,
  PatientPainPattern,
  PatientProfile,
  RelevantHistoryOption,
} from "@/lib/types/profile";
import type { YesNoUnsureOption } from "@/lib/types/episodes";
import {
  alertErrorClass,
  alertInfoClass,
  btnSecondaryClass,
  hintClass,
  inputClass,
  labelClass,
  selectionTileClass,
  selectionTileSelectedClass,
  surveyPromptClass,
} from "@/lib/design/ui-classes";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";

type ProfileFormProps = {
  profile: PatientProfile;
  painTypeOptions: TaxonomyOption[];
  demoMode: boolean;
  variant?: "settings" | "onboarding";
  redirectTo?: string;
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
  variant = "settings",
  redirectTo,
  addPainTypeAction,
  hidePainTypeAction,
  action,
}: ProfileFormProps) {
  const [state, formAction] = useActionState<ProfileActionState, FormData>(action, INITIAL_STATE);
  const [gender, setGender] = useState(profile.gender ?? "");
  const [painPattern, setPainPattern] = useState<PatientPainPattern | "">(
    profile.current_pain_pattern ?? "",
  );
  const [clinicianEvaluation, setClinicianEvaluation] = useState<ClinicianEvaluationOption | "">(
    profile.clinician_evaluation_status ?? "",
  );
  const [receivedDiagnosis, setReceivedDiagnosis] = useState<DiagnosisStatusOption | "">(
    profile.received_facial_pain_diagnosis ?? "",
  );
  const [additionalUndiagnosedPain, setAdditionalUndiagnosedPain] = useState<
    DiagnosisStatusOption | ""
  >(profile.additional_undiagnosed_pain ?? "");
  const [historyTypes, setHistoryTypes] = useState<RelevantHistoryOption[]>(
    profile.relevant_history_events.map((event) => event.event_type),
  );
  const [historyDateUnknown, setHistoryDateUnknown] = useState<Record<string, boolean>>(
    Object.fromEntries(
      profile.relevant_history_events.map((event) => [event.event_type, event.event_date_unknown]),
    ),
  );
  const [describedPatterns, setDescribedPatterns] = useState<
    Partial<Record<string, DescribedPatternStatus>>
  >(
    Object.fromEntries(
      profile.described_patterns.map((pattern) => [pattern.pattern_key, pattern.status]),
    ),
  );
  const [headachePatterns, setHeadachePatterns] = useState<
    Partial<Record<string, { status?: HeadachePatternStatus; longCourse?: "yes" | "no" | null }>>
  >(
    Object.fromEntries(
      profile.headache_patterns.map((pattern) => [
        pattern.pattern_key,
        { status: pattern.status, longCourse: pattern.long_course },
      ]),
    ),
  );
  const [historySymptoms, setHistorySymptoms] = useState<
    Partial<Record<RelevantHistoryOption, YesNoUnsureOption | "">>
  >(
    Object.fromEntries(
      profile.relevant_history_events.map((event) => [
        event.event_type,
        event.symptoms_began_afterward ?? "",
      ]),
    ),
  );
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
      {redirectTo ? <input type="hidden" name="redirect_to" value={redirectTo} /> : null}
      <FormInstructions />
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

        <fieldset className="space-y-3 md:col-span-2">
          <legend className={surveyPromptClass}>Which best describes your facial pain?</legend>
          <div className="grid gap-2">
            {PATIENT_PAIN_PATTERN_OPTIONS.map((option) => (
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
                  required={variant === "onboarding"}
                  checked={painPattern === option}
                  onChange={() => setPainPattern(option)}
                  className="sr-only"
                />
                {PATIENT_PAIN_PATTERN_LABELS[option]}
              </label>
            ))}
          </div>
          <div className="space-y-1 text-xs text-[color:var(--muted)]">
            <p>
              <strong>Episode:</strong> a period when pain starts or intensifies and then settles.
            </p>
            <p>
              <strong>Background pain:</strong> pain that persists between episodes and may change
              in intensity.
            </p>
            <p>This describes your experience; it is not a diagnosis.</p>
          </div>
        </fieldset>

        <fieldset className="space-y-3 md:col-span-2">
          <legend className={surveyPromptClass}>
            Has a clinician evaluated you for facial pain?
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {CLINICIAN_EVALUATION_OPTIONS.map((option) => (
              <label
                key={option}
                className={cn(
                  selectionTileClass,
                  clinicianEvaluation === option && selectionTileSelectedClass,
                )}
              >
                <input
                  type="radio"
                  name="clinician_evaluation_status"
                  value={option}
                  checked={clinicianEvaluation === option}
                  onChange={() => setClinicianEvaluation(option)}
                  className="sr-only"
                />
                {CLINICIAN_EVALUATION_LABELS[option]}
              </label>
            ))}
          </div>
          <p className={hintClass}>Optional. This is not a diagnosis and is not inferred from your pain type.</p>
        </fieldset>

        {clinicianEvaluation === "yes" ? (
          <fieldset className="space-y-3 md:col-span-2">
            <legend className={surveyPromptClass}>
              Have you received a facial pain diagnosis?
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {DIAGNOSIS_STATUS_OPTIONS.map((option) => (
                <label
                  key={option}
                  className={cn(
                    selectionTileClass,
                    receivedDiagnosis === option && selectionTileSelectedClass,
                  )}
                >
                  <input
                    type="radio"
                    name="received_facial_pain_diagnosis"
                    value={option}
                    checked={receivedDiagnosis === option}
                    onChange={() => setReceivedDiagnosis(option)}
                    className="sr-only"
                  />
                  {DIAGNOSIS_STATUS_LABELS[option]}
                </label>
              ))}
            </div>
            {receivedDiagnosis === "yes" ? (
              <fieldset className="space-y-3">
                <legend className={surveyPromptClass}>
                  Do you also have facial pain that has not been diagnosed?
                </legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {DIAGNOSIS_STATUS_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className={cn(
                        selectionTileClass,
                        additionalUndiagnosedPain === option && selectionTileSelectedClass,
                      )}
                    >
                      <input
                        type="radio"
                        name="additional_undiagnosed_pain"
                        value={option}
                        checked={additionalUndiagnosedPain === option}
                        onChange={() => setAdditionalUndiagnosedPain(option)}
                        className="sr-only"
                      />
                      {DIAGNOSIS_STATUS_LABELS[option]}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}
          </fieldset>
        ) : null}

        <fieldset className="space-y-4 md:col-span-2">
          <legend className={surveyPromptClass}>
            Do any of these descriptions match pain you have now or had in the past?
          </legend>
          <p className={hintClass}>
            Optional. These are descriptions of how pain can feel, not a diagnosis from the app.
            Classification codes are not shown here and are not assigned automatically.
          </p>
          {PATIENT_DESCRIBED_PATTERNS.map((pattern) => (
            <fieldset key={pattern.key} className="space-y-2 rounded-3xl border border-[color:var(--border)] p-4">
              <legend className="text-sm font-medium">{pattern.prompt}</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {DESCRIBED_PATTERN_STATUS_OPTIONS.map((status) => (
                  <label
                    key={status}
                    className={cn(
                      selectionTileClass,
                      describedPatterns[pattern.key] === status && selectionTileSelectedClass,
                    )}
                  >
                    <input
                      type="radio"
                      name={`described_pattern_${pattern.key}`}
                      value={status}
                      checked={describedPatterns[pattern.key] === status}
                      onChange={() =>
                        setDescribedPatterns((current) => ({
                          ...current,
                          [pattern.key]: status,
                        }))
                      }
                      className="sr-only"
                    />
                    {DESCRIBED_PATTERN_STATUS_LABELS[status]}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </fieldset>

        <fieldset className="space-y-4 md:col-span-2">
          <legend className={surveyPromptClass}>
            Do any of these headache-like descriptions match what you have now or had in the past?
          </legend>
          <p className={hintClass}>
            Optional. Read each description slowly. These questions describe symptoms. They do not
            assign a headache diagnosis.
          </p>
          {HEADACHE_PATTERNS.map((pattern) => {
            const current = headachePatterns[pattern.key];
            const saved = profile.headache_patterns.find((entry) => entry.pattern_key === pattern.key);
            return (
              <fieldset key={pattern.key} className="space-y-3 rounded-3xl border border-[color:var(--border)] p-4">
                <legend className="text-sm font-medium">{pattern.prompt}</legend>
                <div className="grid gap-2">
                  {(
                    Object.entries(HEADACHE_PATTERN_STATUS_LABELS) as Array<
                      [HeadachePatternStatus, string]
                    >
                  ).map(([status, label]) => (
                    <label
                      key={status}
                      className={cn(
                        selectionTileClass,
                        current?.status === status && selectionTileSelectedClass,
                      )}
                    >
                      <input
                        type="radio"
                        name={`headache_${pattern.key}_status`}
                        value={status}
                        checked={current?.status === status}
                        onChange={() =>
                          setHeadachePatterns((existing) => ({
                            ...existing,
                            [pattern.key]: { ...existing[pattern.key], status },
                          }))
                        }
                        className="sr-only"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {current?.status && headacheFollowUpApplies(current.status) ? (
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-semibold">{pattern.followUpPrompt}</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(["yes", "no"] as const).map((answer) => (
                        <label
                          key={answer}
                          className={cn(
                            selectionTileClass,
                            current.longCourse === answer && selectionTileSelectedClass,
                          )}
                        >
                          <input
                            type="radio"
                            name={`headache_${pattern.key}_long`}
                            value={answer}
                            checked={current.longCourse === answer}
                            onChange={() =>
                              setHeadachePatterns((existing) => ({
                                ...existing,
                                [pattern.key]: { ...existing[pattern.key], longCourse: answer },
                              }))
                            }
                            className="sr-only"
                          />
                          {answer === "yes" ? "Yes" : "No"}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : null}
                {pattern.autonomicPrompt && current?.longCourse === "yes" ? (
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-semibold">{pattern.autonomicPrompt}</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(["yes", "no"] as const).map((answer) => (
                        <label
                          key={answer}
                          className={cn(
                            selectionTileClass,
                            saved?.autonomic_symptoms === answer && selectionTileSelectedClass,
                          )}
                        >
                          <input
                            type="radio"
                            name={`headache_${pattern.key}_autonomic`}
                            value={answer}
                            defaultChecked={saved?.autonomic_symptoms === answer}
                            className="sr-only"
                          />
                          {answer === "yes" ? "Yes" : "No"}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : null}
              </fieldset>
            );
          })}
        </fieldset>

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
            helperText="Select the labels you use. Existing selections stay unspecified unless you add clinician details above. This is not automatically treated as a confirmed diagnosis."
            demoMode={demoMode}
            grid
          />
        </div>

        <fieldset className="space-y-3 md:col-span-2">
          <legend className={surveyPromptClass}>
            Before your facial pain began, was there a relevant injury, dental visit, or procedure?
          </legend>
          <div className="grid gap-2">
            {RELEVANT_HISTORY_OPTIONS.map((option) => (
              <label
                key={option}
                className={cn(
                  selectionTileClass,
                  historyTypes.includes(option) && selectionTileSelectedClass,
                )}
              >
                <input
                  type="checkbox"
                  name="relevant_history_types"
                  value={option}
                  checked={historyTypes.includes(option)}
                  onChange={() => {
                    setHistoryTypes((current) => {
                      if (current.includes(option)) {
                        return current.filter((entry) => entry !== option);
                      }

                      if (isExclusiveHistoryOption(option)) {
                        return [option];
                      }

                      return [...current.filter((entry) => !isExclusiveHistoryOption(entry)), option];
                    });
                  }}
                  className="sr-only"
                />
                {RELEVANT_HISTORY_LABELS[option]}
              </label>
            ))}
          </div>
          <p className={hintClass}>
            Optional. Selecting an event does not mean it caused your pain. Choose No known
            precipitating event or Not sure by itself.
          </p>
          {historyTypes
            .filter((option) => !isExclusiveHistoryOption(option))
            .map((option) => {
              const existing = profile.relevant_history_events.find(
                (event) => event.event_type === option,
              );

              return (
                <div
                  key={option}
                  className="space-y-3 rounded-3xl border border-[color:var(--border)] bg-[color:var(--accent)]/60 p-4"
                >
                  <p className="text-sm font-semibold">{RELEVANT_HISTORY_LABELS[option]}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block space-y-2">
                      <span className={labelClass}>Approximate date</span>
                      <input
                        type="date"
                        name={`history_date_${option}`}
                        defaultValue={existing?.event_date ?? ""}
                        disabled={Boolean(historyDateUnknown[option])}
                        max={new Date().toISOString().slice(0, 10)}
                        className={inputClass}
                      />
                    </label>
                    <label className="flex items-center gap-2 self-end pb-2 text-sm">
                      <input
                        type="checkbox"
                        name={`history_date_unknown_${option}`}
                        value="true"
                        checked={Boolean(historyDateUnknown[option])}
                        onChange={(event) =>
                          setHistoryDateUnknown((current) => ({
                            ...current,
                            [option]: event.target.checked,
                          }))
                        }
                      />
                      I don&apos;t know the date
                    </label>
                  </div>
                  <fieldset className="space-y-2">
                    <legend className={labelClass}>Did symptoms begin afterward?</legend>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {YES_NO_UNSURE_OPTIONS.map((answer) => (
                        <label
                          key={answer}
                          className={cn(
                            selectionTileClass,
                            historySymptoms[option] === answer && selectionTileSelectedClass,
                          )}
                        >
                          <input
                            type="radio"
                            name={`history_symptoms_${option}`}
                            value={answer}
                            checked={historySymptoms[option] === answer}
                            onChange={() =>
                              setHistorySymptoms((current) => ({
                                ...current,
                                [option]: answer,
                              }))
                            }
                            className="sr-only"
                          />
                          {YES_NO_UNSURE_LABELS[answer]}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <label className="block space-y-2">
                    <span className={labelClass}>Notes</span>
                    <input
                      type="text"
                      name={`history_notes_${option}`}
                      defaultValue={existing?.notes ?? ""}
                      maxLength={300}
                      className={inputClass}
                      placeholder="Optional details"
                    />
                  </label>
                </div>
              );
            })}
        </fieldset>

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
        <SubmitButton
          label={variant === "onboarding" ? "Save and continue" : "Save profile"}
          pendingLabel={variant === "onboarding" ? "Continuing..." : "Saving profile..."}
        />
        {variant === "settings" ? (
          <Link href="/dashboard" className={btnSecondaryClass}>
            Back to dashboard
          </Link>
        ) : null}
      </div>
    </form>
  );
}
