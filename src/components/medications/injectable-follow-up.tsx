"use client";

import { useState } from "react";
import type { MedicationCatalogItem } from "@/lib/medications/catalog";
import type { MedicationFollowUp } from "@/lib/validation/medication-inventory";
import { STOP_REASON_LABELS } from "@/lib/medications/labels";
import { STOP_REASONS } from "@/lib/medications/catalog";
import { hintClass, inputClass, selectionTileClass } from "@/lib/design/ui-classes";
import { cn } from "@/lib/utils";

const tileClass = cn(
  selectionTileClass,
  "has-[:checked]:border-[color:var(--primary)] has-[:checked]:bg-[color:var(--accent)] has-[:checked]:text-[color:var(--primary)]",
);

const INJECTORS = [
  ["self", "Self-inject"],
  ["family", "With help from family or friends"],
  ["medical", "Medical professional"],
] as const;

const MONTHLY = [
  ["once_a_month", "Once a month"],
  ["more_often", "More often than once a month"],
  ["less_often", "Less often than once a month"],
] as const;

const WEEKLY = [
  ["once_a_week", "Once a week"],
  ["every_other_week", "Every other week"],
  ["once_a_month", "Once a month"],
  ["other", "Other schedule"],
] as const;

const STANDARD_PLACES = [
  ["hospital_outpatient", "Hospital or emergency department, as an outpatient"],
  ["hospital_admitted", "Hospital with an overnight stay"],
  ["clinic", "Clinic or doctor's office"],
  ["infusion_center", "Specialized infusion center"],
  ["mobile_iv", "Mobile IV service at home"],
  ["other", "Other"],
] as const;

const PHENYTOIN_PLACES = [
  ["hospital_not_ed", "Hospital, not in the emergency department"],
  ["hospital_admitted", "Hospital with an overnight stay"],
  ["clinic", "Clinic or doctor's office"],
  ["infusion_center", "Specialized infusion center"],
  ["mobile_iv", "Mobile IV service at home"],
  ["other", "Other"],
] as const;

const STEROID_DAYS = [
  ["three", "Three"],
  ["four", "Four"],
  ["five", "Five"],
  ["other", "Other"],
] as const;

const COURSE_DAYS = [
  ["one", "One"],
  ["two", "Two"],
  ["three", "Three"],
  ["four", "Four"],
  ["five", "Five"],
  ["other", "Other"],
  ["do_not_know", "Do not know"],
] as const;

const BOTOX_SITES = [
  ["temples_one", "Around the temples, one side"],
  ["temples_both", "Around the temples, both sides"],
  ["forehead_one", "Around the forehead, one side"],
  ["forehead_both", "Around the forehead, both sides"],
  ["cheeks_one", "Around the cheeks, one side"],
  ["cheeks_both", "Around the cheeks, both sides"],
  ["jaw_one", "Around the chin or jaw, one side"],
  ["jaw_both", "Around the chin or jaw, both sides"],
  ["do_not_know", "Do not know"],
] as const;

const STILL = [
  ["yes", "Yes"],
  ["no", "No"],
  ["do_not_know", "Do not know or not sure"],
] as const;

function Choices({
  name,
  legend,
  options,
  defaultValue,
  onChange,
}: {
  name: string;
  legend: string;
  options: readonly (readonly [string, string])[];
  defaultValue?: string | null;
  onChange?: (value: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map(([value, label]) => (
          <label key={value} className={tileClass}>
            <input
              type="radio"
              name={name}
              value={value}
              defaultChecked={defaultValue === value}
              onChange={() => onChange?.(value)}
              className="sr-only"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function InjectableFollowUp({
  item,
  saved,
  stopReasons = [],
  stopReasonOther = "",
}: {
  item: MedicationCatalogItem;
  saved?: MedicationFollowUp | null;
  stopReasons?: string[];
  stopReasonOther?: string | null;
}) {
  const prefix = `med_${item.key}`;
  const [monthlyDose, setMonthlyDose] = useState(saved?.monthlyDose ?? "");
  const [schedule, setSchedule] = useState(saved?.schedule ?? "");
  const [place, setPlace] = useState(saved?.place ?? "");
  const [days, setDays] = useState(saved?.consecutiveDays ?? "");
  const [stillUsing, setStillUsing] = useState(saved?.stillUsing ?? "");
  const weekly = item.followUp === "infusion_lidocaine" || item.followUp === "infusion_steroid";
  const places = item.placeSet === "phenytoin" ? PHENYTOIN_PLACES : STANDARD_PLACES;
  const placeLegend =
    item.followUp === "botox" ? "Where do or did you go for the injections?" : "Where do or did you go for the infusions?";

  return (
    <div className="space-y-3 pl-1 sm:pl-4">
      {item.followUp === "cgrp" ? (
        <>
          <Choices
            name={`${prefix}_injector`}
            legend="Who injects it?"
            options={INJECTORS}
            defaultValue={saved?.injector}
          />
          <Choices
            name={`${prefix}_schedule`}
            legend="How often do or did you use it?"
            options={MONTHLY}
            defaultValue={saved?.schedule}
          />
          <Choices
            name={`${prefix}_monthly_dose`}
            legend={`Altogether, how much do or did you use each month? The survey lists ${item.standardMonthlyMg} mg as the monthly amount.`}
            options={[
              ["standard", `${item.standardMonthlyMg} mg`],
              ["different", "A different dose"],
              ["do_not_know", "Do not know"],
            ]}
            defaultValue={saved?.monthlyDose}
            onChange={setMonthlyDose}
          />
          {monthlyDose === "different" ? (
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor={`${prefix}_different_dose`}>
                Dose, in milligrams
              </label>
              <input
                id={`${prefix}_different_dose`}
                name={`${prefix}_different_dose`}
                inputMode="decimal"
                defaultValue={saved?.differentDoseMg ?? ""}
                className={inputClass}
              />
              <input
                name={`${prefix}_different_frequency`}
                defaultValue={saved?.differentFrequency ?? ""}
                placeholder="How often, if it is not monthly"
                className={inputClass}
              />
              <p className={hintClass}>This records the amount you report. It is not a recommended dose.</p>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <Choices
            name={`${prefix}_place`}
            legend={placeLegend}
            options={places}
            defaultValue={saved?.place}
            onChange={setPlace}
          />
          {place === "other" ? (
            <input
              name={`${prefix}_place_other`}
              defaultValue={saved?.placeOther ?? ""}
              placeholder="If other, please explain"
              className={inputClass}
            />
          ) : null}
          <Choices
            name={`${prefix}_schedule`}
            legend={item.followUp === "botox" ? "How often do or did you get the injections?" : "How often do or did you get the infusions?"}
            options={weekly ? WEEKLY : MONTHLY}
            defaultValue={saved?.schedule}
            onChange={setSchedule}
          />
          {schedule === "other" ? (
            <input
              name={`${prefix}_schedule_other`}
              defaultValue={saved?.scheduleOther ?? ""}
              placeholder="If another schedule, please explain"
              className={inputClass}
            />
          ) : null}
        </>
      )}
      {item.followUp === "infusion_lidocaine" ? (
        <Choices
          name={`${prefix}_ecg`}
          legend="Did you have an electrocardiogram (ECG) before a lidocaine infusion?"
          options={STILL}
          defaultValue={saved?.ecgBefore}
        />
      ) : null}
      {item.followUp === "infusion_steroid" || item.followUp === "infusion_course" ? (
        <>
          <Choices
            name={`${prefix}_days`}
            legend="For how many days in a row do or did you get the infusions?"
            options={item.followUp === "infusion_steroid" ? STEROID_DAYS : COURSE_DAYS}
            defaultValue={saved?.consecutiveDays}
            onChange={setDays}
          />
          {days === "other" ? (
            <input
              name={`${prefix}_days_other`}
              defaultValue={saved?.consecutiveDaysOther ?? ""}
              placeholder="If another number of days, please explain"
              className={inputClass}
            />
          ) : null}
        </>
      ) : null}
      {item.followUp === "botox" ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Where are the injections given? Select all that apply.</legend>
          <div className="grid gap-2">
            {BOTOX_SITES.map(([value, label]) => (
              <label key={value} className={tileClass}>
                <input
                  type="checkbox"
                  name={`${prefix}_sites`}
                  value={value}
                  defaultChecked={saved?.botoxSites.includes(value)}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      <Choices
        name={`${prefix}_still`}
        legend="Will you continue to use it?"
        options={STILL}
        defaultValue={saved?.stillUsing}
        onChange={setStillUsing}
      />
      {stillUsing === "no" ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Why will you stop? Select all that apply.</legend>
          <div className="grid gap-2">
            {STOP_REASONS.map((reason) => (
              <label key={reason} className={tileClass}>
                <input
                  type="checkbox"
                  name={`${prefix}_stop`}
                  value={reason}
                  defaultChecked={stopReasons.includes(reason)}
                  className="sr-only"
                />
                {STOP_REASON_LABELS[reason]}
              </label>
            ))}
          </div>
          <input
            name={`${prefix}_stop_other`}
            defaultValue={stopReasonOther ?? ""}
            placeholder="If another reason, please explain"
            className={inputClass}
          />
        </fieldset>
      ) : null}
    </div>
  );
}
