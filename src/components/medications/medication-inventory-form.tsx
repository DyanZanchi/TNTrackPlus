"use client";

import { useActionState, useState } from "react";
import { FormInstructions } from "@/components/ui/form-instructions";
import { InjectableFollowUp } from "@/components/medications/injectable-follow-up";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  ADMINISTRATION_OPTIONS,
  ANSWER_CONFIDENCE,
  BUPROPION_FORM_OPTIONS,
  CANNABIS_RELIEF,
  COMPOUNDED_EFFECTS,
  COMPOUNDED_FORMS,
  COMPOUNDED_INGREDIENTS,
  COMPOUNDED_SOURCES,
  EXTENDED_RELEASE_OPTIONS,
  MEDICATIONS_IN_FRONT,
  OTC_FREQUENCY_FULL,
  OTC_FREQUENCY_WEEKLY,
  STOP_REASONS,
  TABLET_COUNTS,
  TABLET_LIQUID_OPTIONS,
  TIMES_PER_DAY,
  YES_NO_UNKNOWN,
  medicationsInContext,
  statusesForContext,
  type MedicationCatalogItem,
  type MedicationUseContext,
} from "@/lib/medications/catalog";
import {
  ADMINISTRATION_LABELS,
  ANSWER_CONFIDENCE_LABELS,
  BUPROPION_FORM_LABELS,
  CANNABIS_RELIEF_LABELS,
  COMPOUNDED_EFFECT_LABELS,
  COMPOUNDED_FORM_LABELS,
  COMPOUNDED_INGREDIENT_LABELS,
  COMPOUNDED_SOURCE_LABELS,
  EXTENDED_RELEASE_LABELS,
  MEDICATIONS_IN_FRONT_LABELS,
  OTC_FREQUENCY_LABELS,
  STOP_REASON_LABELS,
  TABLET_COUNT_LABELS,
  TABLET_LIQUID_LABELS,
  TIMES_PER_DAY_LABELS,
  YES_NO_UNKNOWN_LABELS,
  statusLabelsForContext,
} from "@/lib/medications/labels";
import type { saveMedicationInventoryAction } from "@/lib/medications/actions";
import type { SavedMedicationInventory, SavedMedicationUse } from "@/lib/medications/queries";
import {
  alertErrorClass,
  alertInfoClass,
  btnSecondaryClass,
  cardClass,
  hintClass,
  inputClass,
  selectionTileClass,
  surveyPromptClass,
} from "@/lib/design/ui-classes";
import { cn } from "@/lib/utils";
import Link from "next/link";

const tileClass = cn(
  selectionTileClass,
  "has-[:checked]:border-[color:var(--primary)] has-[:checked]:bg-[color:var(--accent)] has-[:checked]:text-[color:var(--primary)]",
);

const SECTIONS: { id: MedicationUseContext; title: string; intro: string }[] = [
  {
    id: "regular",
    title: "Regular medications",
    intro:
      "For each medicine, say whether you take it now, stopped it, or never took it. Rescue medicines for severe pain attacks are in a later section. If you use a medicine both ways, answer it in each section.",
  },
  {
    id: "brain_fog",
    title: "Brain fog medications",
    intro: "Medicines taken to manage brain fog. Choose one answer for each row.",
  },
  {
    id: "rescue",
    title: "Rescue medications",
    intro:
      "Fast-acting medicines used for severe pain that does not let up. Do not include your regular neuropathic facial pain medicine here.",
  },
  {
    id: "blood_pressure_rescue",
    title: "Blood pressure medicines used for pain attacks",
    intro:
      "Do not include your regular blood pressure medicine. These questions are about anti-hypertension medicines used for severe pain attacks.",
  },
  {
    id: "injectable",
    title: "Injected or IV medicines",
    intro:
      "Answer only about injected or intravenous forms. Do not include other forms of the same medicine.",
  },
  {
    id: "otc",
    title: "Nonprescription pain relievers",
    intro:
      "Think about the past week and medicines you bought without a prescription for facial pain. Regular strength, extra strength, and nighttime forms are separate.",
  },
  {
    id: "topical_otc",
    title: "Other nonprescription products",
    intro: "In the past week, did you use any of these products for facial pain?",
  },
];

type MedicationInventoryFormProps = {
  action: typeof saveMedicationInventoryAction;
  inventory: SavedMedicationInventory;
  demoMode: boolean;
  saved: boolean;
};

function RadioChoices({
  name,
  legend,
  options,
  defaultValue,
  onChange,
}: {
  name: string;
  legend: string;
  options: { value: string; label: string }[];
  defaultValue?: string | null;
  onChange?: (value: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option.value} className={tileClass}>
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={defaultValue === option.value}
              onChange={() => onChange?.(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function doseHint(item: MedicationCatalogItem) {
  if (item.doseMin === undefined || item.doseMax === undefined) {
    return null;
  }

  const unit = item.doseUnit === "mg_or_ml" ? "milligrams or milliliters" : "milligrams";
  return `The registry survey asked for one amount between ${item.doseMin} and ${item.doseMax} ${unit}. Enter the amount you take at one time, or choose I do not know. This is not a recommended dose.`;
}

function formulationOptions(item: MedicationCatalogItem) {
  if (item.formulation === "extended_release") {
    return EXTENDED_RELEASE_OPTIONS.map((value) => ({ value, label: EXTENDED_RELEASE_LABELS[value] }));
  }
  if (item.formulation === "bupropion") {
    return BUPROPION_FORM_OPTIONS.map((value) => ({ value, label: BUPROPION_FORM_LABELS[value] }));
  }
  if (item.formulation === "tablet_or_liquid") {
    return TABLET_LIQUID_OPTIONS.map((value) => ({ value, label: TABLET_LIQUID_LABELS[value] }));
  }
  return [];
}

function MedicationRow({
  item,
  saved,
  status,
  onStatus,
}: {
  item: MedicationCatalogItem;
  saved?: SavedMedicationUse;
  status: string;
  onStatus: (value: string) => void;
}) {
  const labels = statusLabelsForContext(item.context);
  const options = statusesForContext(item.context).map((value) => ({
    value,
    label: labels[value as keyof typeof labels],
  }));
  const frequencies =
    item.otcFrequency === "weekly" ? OTC_FREQUENCY_WEEKLY : item.otcFrequency === "full" ? OTC_FREQUENCY_FULL : [];

  return (
    <div className="space-y-3 border-t border-[color:var(--border)] pt-4">
      <RadioChoices
        name={`med_${item.key}_status`}
        legend={item.label}
        options={options}
        defaultValue={status}
        onChange={onStatus}
      />
      {status === "taking_now" ? (
        <div className="space-y-3 pl-1 sm:pl-4">
          <RadioChoices
            name={`med_${item.key}_times`}
            legend="How many times per day do you take it?"
            options={TIMES_PER_DAY.map((value) => ({ value, label: TIMES_PER_DAY_LABELS[value] }))}
            defaultValue={saved?.timesPerDay}
          />
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor={`med_${item.key}_dose`}>
              How much do you usually take at one time?
            </label>
            <input
              id={`med_${item.key}_dose`}
              name={`med_${item.key}_dose`}
              inputMode="decimal"
              defaultValue={saved?.doseAmount ?? ""}
              className={inputClass}
            />
            <label className={tileClass}>
              <input
                type="checkbox"
                name={`med_${item.key}_dose_unknown`}
                value="1"
                defaultChecked={saved?.doseUnknown}
                className="sr-only"
              />
              I do not know
            </label>
            {doseHint(item) ? <p className={hintClass}>{doseHint(item)}</p> : null}
          </div>
          <RadioChoices
            name={`med_${item.key}_administration`}
            legend="Do you..."
            options={ADMINISTRATION_OPTIONS.map((value) => ({
              value,
              label: ADMINISTRATION_LABELS[value],
            }))}
            defaultValue={saved?.administration}
          />
          <input
            name={`med_${item.key}_administration_other`}
            defaultValue={saved?.administrationOther ?? ""}
            placeholder="If other, please explain"
            className={inputClass}
          />
          {item.formulation ? (
            <>
              <RadioChoices
                name={`med_${item.key}_formulation`}
                legend="Do you take..."
                options={formulationOptions(item)}
                defaultValue={saved?.formulation}
              />
              <input
                name={`med_${item.key}_formulation_other`}
                defaultValue={saved?.formulationOther ?? ""}
                placeholder="If other, please explain"
                className={inputClass}
              />
            </>
          ) : null}
        </div>
      ) : null}
      {status === "stopped" ? (
        <fieldset className="space-y-2 pl-1 sm:pl-4">
          <legend className="text-sm font-semibold">
            Why did you stop? Select all that apply.
          </legend>
          <div className="grid gap-2">
            {STOP_REASONS.map((reason) => (
              <label key={reason} className={tileClass}>
                <input
                  type="checkbox"
                  name={`med_${item.key}_stop`}
                  value={reason}
                  defaultChecked={saved?.stopReasons.includes(reason)}
                  className="sr-only"
                />
                {STOP_REASON_LABELS[reason]}
              </label>
            ))}
          </div>
          <input
            name={`med_${item.key}_stop_other`}
            defaultValue={saved?.stopReasonOther ?? ""}
            placeholder="If another reason, please explain"
            className={inputClass}
          />
        </fieldset>
      ) : null}
      {status === "used_past_week" && item.context === "otc" ? (
        <div className="space-y-3 pl-1 sm:pl-4">
          <RadioChoices
            name={`med_${item.key}_frequency`}
            legend="How often did you use it in the past week?"
            options={frequencies.map((value) => ({ value, label: OTC_FREQUENCY_LABELS[value] }))}
            defaultValue={saved?.otcFrequency}
          />
          <RadioChoices
            name={`med_${item.key}_tablets`}
            legend="How many tablets or capsules did you take at one time?"
            options={TABLET_COUNTS.map((value) => ({ value, label: TABLET_COUNT_LABELS[value] }))}
            defaultValue={saved?.tabletsAtOnce}
          />
          {item.asksStrength ? (
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor={`med_${item.key}_strength`}>
                What strength did you take, in milligrams?
              </label>
              <input
                id={`med_${item.key}_strength`}
                name={`med_${item.key}_strength`}
                inputMode="decimal"
                defaultValue={saved?.strengthMg ?? ""}
                className={inputClass}
              />
              <label className={tileClass}>
                <input
                  type="checkbox"
                  name={`med_${item.key}_strength_unknown`}
                  value="1"
                  defaultChecked={saved?.strengthUnknown}
                  className="sr-only"
                />
                I do not know
              </label>
            </div>
          ) : null}
          {item.asksExtraAndNight ? (
            <>
              <RadioChoices
                name={`med_${item.key}_extra`}
                legend="Was any of it extra strength?"
                options={YES_NO_UNKNOWN.map((value) => ({ value, label: YES_NO_UNKNOWN_LABELS[value] }))}
                defaultValue={saved?.extraStrength}
              />
              <RadioChoices
                name={`med_${item.key}_night`}
                legend="Was any of it a nighttime form?"
                options={YES_NO_UNKNOWN.map((value) => ({ value, label: YES_NO_UNKNOWN_LABELS[value] }))}
                defaultValue={saved?.nighttime}
              />
            </>
          ) : null}
        </div>
      ) : null}
      {status === "used_past_year" && item.followUp ? (
        <InjectableFollowUp
          item={item}
          saved={saved?.followUp}
          stopReasons={saved?.stopReasons}
          stopReasonOther={saved?.stopReasonOther}
        />
      ) : null}
      {status === "used_past_week" && item.asksOtherText ? (
        <input
          name={`med_${item.key}_other`}
          defaultValue={saved?.otherText ?? ""}
          placeholder="If anything else, please explain"
          className={cn(inputClass, "ml-1 sm:ml-4")}
        />
      ) : null}
    </div>
  );
}

export function MedicationInventoryForm({
  action,
  inventory,
  demoMode,
  saved,
}: MedicationInventoryFormProps) {
  const [state, formAction] = useActionState(action, {});
  const [statuses, setStatuses] = useState<Record<string, string>>(() =>
    Object.fromEntries(inventory.uses.map((use) => [use.catalogKey, use.status])),
  );
  const [compoundedUsed, setCompoundedUsed] = useState(inventory.context.compoundedUsed ?? "");
  const [compoundedCount, setCompoundedCount] = useState(
    inventory.context.compoundedCount?.toString() ?? "",
  );
  const [cannabisUsed, setCannabisUsed] = useState(inventory.context.cannabisUsed ?? "");
  const [erVisited, setErVisited] = useState(inventory.context.erVisited ?? "");
  const [erSentHome, setErSentHome] = useState(inventory.context.erSentHomeNoTreatment ?? "");
  const [erIv, setErIv] = useState(inventory.context.erGivenIvAnticonvulsant ?? "");
  const savedByKey = new Map(inventory.uses.map((use) => [use.catalogKey, use]));
  const detailCount =
    compoundedUsed === "yes" ? Math.min(Number.parseInt(compoundedCount || "0", 10) || 0, 3) : 0;

  return (
    <form action={formAction} className="space-y-6">
      <FormInstructions />
      {demoMode ? (
        <p className={alertInfoClass}>
          Demo mode shows this form and does not store medication answers.
        </p>
      ) : null}
      {saved && !demoMode ? <p className={alertInfoClass}>Medication answers saved.</p> : null}
      {state.error ? <p className={alertErrorClass}>{state.error}</p> : null}

      {SECTIONS.map((section) => (
        <details key={section.id} open={section.id === "regular"} className={cn(cardClass, "p-5")}>
          <summary className={cn(surveyPromptClass, "cursor-pointer")}>{section.title}</summary>
          <p className={cn(hintClass, "mt-3")}>{section.intro}</p>
          <div className="mt-4 space-y-4">
            {medicationsInContext(section.id).map((item) => (
              <MedicationRow
                key={item.key}
                item={item}
                saved={savedByKey.get(item.key)}
                status={statuses[item.key] ?? ""}
                onStatus={(value) => setStatuses((current) => ({ ...current, [item.key]: value }))}
              />
            ))}
          </div>
        </details>
      ))}

      <section className={cn(cardClass, "space-y-4 p-5")}>
        <h2 className={surveyPromptClass}>Compounded medications</h2>
        <p className={hintClass}>
          A compounded medication is customized for you and is not a standard product from a
          pharmaceutical company. Think about the past year. Do not count low-dose naltrexone,
          which is in the regular list.
        </p>
        <RadioChoices
          name="compounded_used"
          legend="In the past year, have you used any compounded medications for neuropathic facial pain in addition to low-dose naltrexone?"
          options={YES_NO_UNKNOWN.map((value) => ({ value, label: YES_NO_UNKNOWN_LABELS[value] }))}
          defaultValue={compoundedUsed}
          onChange={setCompoundedUsed}
        />
        {compoundedUsed === "yes" ? (
          <>
            <label className="block space-y-2 text-sm font-semibold" htmlFor="compounded_count">
              How many different compounded medications did you use? Count medicines, not refills.
              <input
                id="compounded_count"
                name="compounded_count"
                inputMode="numeric"
                value={compoundedCount}
                onChange={(event) => setCompoundedCount(event.target.value)}
                className={inputClass}
              />
            </label>
            {Number.parseInt(compoundedCount || "0", 10) > 3 ? (
              <p className={hintClass}>
                Enter details for the three compounded medications you took most recently.
              </p>
            ) : null}
            {Array.from({ length: detailCount }, (_, index) => {
              const position = index + 1;
              const saved = inventory.compounded.find((item) => item.position === position);
              return (
                <fieldset key={position} className="space-y-3 border-t border-[color:var(--border)] pt-4">
                  <legend className="text-sm font-semibold">Compounded medication {position}</legend>
                  <input
                    name={`compound_${position}_name`}
                    defaultValue={saved?.name ?? ""}
                    placeholder="What do you call it?"
                    className={inputClass}
                  />
                  <div className="grid gap-2">
                    {COMPOUNDED_INGREDIENTS.map((ingredient) => (
                      <label key={ingredient} className={tileClass}>
                        <input
                          type="checkbox"
                          name={`compound_${position}_ingredients`}
                          value={ingredient}
                          defaultChecked={saved?.ingredients.includes(ingredient)}
                          className="sr-only"
                        />
                        {COMPOUNDED_INGREDIENT_LABELS[ingredient]}
                      </label>
                    ))}
                  </div>
                  <input
                    name={`compound_${position}_ingredient_other`}
                    defaultValue={saved?.ingredientOther ?? ""}
                    placeholder="If another ingredient, please explain"
                    className={inputClass}
                  />
                  <RadioChoices
                    name={`compound_${position}_form`}
                    legend="Is this compounded medication..."
                    options={COMPOUNDED_FORMS.map((value) => ({
                      value,
                      label: COMPOUNDED_FORM_LABELS[value],
                    }))}
                    defaultValue={saved?.form}
                  />
                  <input
                    name={`compound_${position}_form_other`}
                    defaultValue={saved?.formOther ?? ""}
                    placeholder="If another form, please explain"
                    className={inputClass}
                  />
                  <RadioChoices
                    name={`compound_${position}_effect`}
                    legend="How well did this medication work at alleviating your pain?"
                    options={COMPOUNDED_EFFECTS.map((value) => ({
                      value,
                      label: COMPOUNDED_EFFECT_LABELS[value],
                    }))}
                    defaultValue={saved?.effect}
                  />
                  <RadioChoices
                    name={`compound_${position}_still`}
                    legend="Are you still using this medication?"
                    options={YES_NO_UNKNOWN.map((value) => ({
                      value,
                      label: YES_NO_UNKNOWN_LABELS[value],
                    }))}
                    defaultValue={saved?.stillUsing}
                  />
                  <RadioChoices
                    name={`compound_${position}_pharmacy`}
                    legend="Which kind of place compounded it?"
                    options={COMPOUNDED_SOURCES.map((value) => ({
                      value,
                      label: COMPOUNDED_SOURCE_LABELS[value],
                    }))}
                    defaultValue={saved?.pharmacyType}
                  />
                </fieldset>
              );
            })}
          </>
        ) : null}
      </section>

      <section className={cn(cardClass, "space-y-4 p-5")}>
        <h2 className={surveyPromptClass}>Emergency department</h2>
        <RadioChoices
          name="er_visited"
          legend="In the past year, have you visited an emergency room or emergency department because of your facial pain? Do not count urgent care centers."
          options={YES_NO_UNKNOWN.map((value) => ({ value, label: YES_NO_UNKNOWN_LABELS[value] }))}
          defaultValue={erVisited}
          onChange={setErVisited}
        />
        {erVisited === "yes" ? (
          <>
            <label className="block space-y-2 text-sm font-semibold" htmlFor="er_visit_count">
              How many different times did you visit in the past year?
              <input
                id="er_visit_count"
                name="er_visit_count"
                inputMode="numeric"
                defaultValue={inventory.context.erVisitCount ?? ""}
                className={inputClass}
              />
            </label>
            <RadioChoices
              name="er_sent_home"
              legend="You were sent home with no treatment?"
              options={YES_NO_UNKNOWN.map((value) => ({ value, label: YES_NO_UNKNOWN_LABELS[value] }))}
              defaultValue={erSentHome}
              onChange={setErSentHome}
            />
            {erSentHome === "no" ? (
              <>
                <RadioChoices
                  name="er_opiate"
                  legend="You were given an opiate or narcotic, or a prescription for one, such as fentanyl, codeine, oxycodone, or Dilaudid?"
                  options={YES_NO_UNKNOWN.map((value) => ({
                    value,
                    label: YES_NO_UNKNOWN_LABELS[value],
                  }))}
                  defaultValue={inventory.context.erGivenOpiate}
                />
                <RadioChoices
                  name="er_iv"
                  legend="You were given an intravenous infusion of an anti-convulsant such as phenytoin (Dilantin), levetiracetam (Keppra), lacosamide (Vimpat), or fosphenytoin (Cerebyx)?"
                  options={YES_NO_UNKNOWN.map((value) => ({
                    value,
                    label: YES_NO_UNKNOWN_LABELS[value],
                  }))}
                  defaultValue={erIv}
                  onChange={setErIv}
                />
                {erIv === "yes" ? (
                  <RadioChoices
                    name="er_protocol"
                    legend="You needed to show the staff the ER Protocol by Drs. Linskey and Zakrzewska, or specifically ask for that protocol?"
                    options={YES_NO_UNKNOWN.map((value) => ({
                      value,
                      label: YES_NO_UNKNOWN_LABELS[value],
                    }))}
                    defaultValue={inventory.context.erAskedForNamedProtocol}
                  />
                ) : null}
                <RadioChoices
                  name="er_other_med"
                  legend="You were given or prescribed some other type of medication?"
                  options={YES_NO_UNKNOWN.map((value) => ({
                    value,
                    label: YES_NO_UNKNOWN_LABELS[value],
                  }))}
                  defaultValue={inventory.context.erOtherMedication}
                />
              </>
            ) : null}
            <RadioChoices
              name="er_admitted"
              legend="You were admitted to the hospital from the emergency room?"
              options={YES_NO_UNKNOWN.map((value) => ({ value, label: YES_NO_UNKNOWN_LABELS[value] }))}
              defaultValue={inventory.context.erAdmitted}
            />
            <RadioChoices
              name="er_heard"
              legend="You felt heard and respected?"
              options={YES_NO_UNKNOWN.map((value) => ({ value, label: YES_NO_UNKNOWN_LABELS[value] }))}
              defaultValue={inventory.context.erFeltHeard}
            />
            <RadioChoices
              name="er_drug_seeking"
              legend="You were treated like someone seeking drugs?"
              options={YES_NO_UNKNOWN.map((value) => ({ value, label: YES_NO_UNKNOWN_LABELS[value] }))}
              defaultValue={inventory.context.erTreatedAsDrugSeeking}
            />
          </>
        ) : null}
        <p className={hintClass}>
          The protocol question records whether you asked for a named emergency-care plan. It does
          not list treatment steps.
        </p>
      </section>

      <section className={cn(cardClass, "space-y-4 p-5")}>
        <h2 className={surveyPromptClass}>Marijuana</h2>
        <RadioChoices
          name="cannabis_used"
          legend="Thinking about the past year, have you used marijuana for your facial pain?"
          options={YES_NO_UNKNOWN.map((value) => ({ value, label: YES_NO_UNKNOWN_LABELS[value] }))}
          defaultValue={cannabisUsed}
          onChange={setCannabisUsed}
        />
        {cannabisUsed === "yes" ? (
          <>
            <RadioChoices
              name="cannabis_medical"
              legend="Did you obtain it from a medical marijuana dispensary?"
              options={YES_NO_UNKNOWN.map((value) => ({ value, label: YES_NO_UNKNOWN_LABELS[value] }))}
              defaultValue={inventory.context.cannabisMedicalDispensary}
            />
            <RadioChoices
              name="cannabis_open"
              legend="Did you obtain it from a dispensary open to people with or without a medical card?"
              options={YES_NO_UNKNOWN.map((value) => ({ value, label: YES_NO_UNKNOWN_LABELS[value] }))}
              defaultValue={inventory.context.cannabisOpenDispensary}
            />
            <RadioChoices
              name="cannabis_other"
              legend="Did you obtain it from someplace else?"
              options={YES_NO_UNKNOWN.map((value) => ({ value, label: YES_NO_UNKNOWN_LABELS[value] }))}
              defaultValue={inventory.context.cannabisOtherPlace}
            />
            <RadioChoices
              name="cannabis_relief"
              legend="In the past year, how much did marijuana alleviate your facial pain?"
              options={CANNABIS_RELIEF.map((value) => ({ value, label: CANNABIS_RELIEF_LABELS[value] }))}
              defaultValue={inventory.context.cannabisRelief}
            />
          </>
        ) : null}
      </section>

      <section className={cn(cardClass, "space-y-4 p-5")}>
        <h2 className={surveyPromptClass}>How you answered</h2>
        <RadioChoices
          name="medications_in_front"
          legend="Did you have your medications in front of you when you answered these questions?"
          options={MEDICATIONS_IN_FRONT.map((value) => ({
            value,
            label: MEDICATIONS_IN_FRONT_LABELS[value],
          }))}
          defaultValue={inventory.context.medicationsInFront}
        />
        <RadioChoices
          name="answer_confidence"
          legend="How confident are you with the answers you provided about your medications?"
          options={ANSWER_CONFIDENCE.map((value) => ({ value, label: ANSWER_CONFIDENCE_LABELS[value] }))}
          defaultValue={inventory.context.answerConfidence}
        />
      </section>

      <div className="flex flex-wrap gap-3">
        <SubmitButton label="Save medications" />
        <Link href="/dashboard" className={btnSecondaryClass}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
