import { describe, expect, it } from "vitest";
import { MEDICATION_CATALOG, MEDICATION_SOURCE } from "@/lib/medications/catalog";
import { buildMedicationInventoryCsv } from "@/lib/export/medication-csv";
import { HEADACHE_PATTERNS } from "@/lib/classification/headache-patterns";
import { parseMedicationInventory } from "@/lib/validation/medication-inventory";

function parse(values: Record<string, string | string[]>) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => formData.append(key, entry));
      return;
    }
    formData.set(key, value);
  });
  return parseMedicationInventory(formData);
}

describe("medication inventory", () => {
  it("keeps catalog keys unique and sourced", () => {
    const keys = MEDICATION_CATALOG.map((item) => item.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(MEDICATION_SOURCE.document).toContain("Medications Surveys");
    const carbamazepine = MEDICATION_CATALOG.find((item) => item.key === "carbamazepine");
    expect(carbamazepine).toMatchObject({ doseMin: 200, doseMax: 400, doseUnit: "mg" });
    expect(MEDICATION_CATALOG.some((item) => /protocol steps|administer/i.test(item.label))).toBe(
      false,
    );
  });

  it("stores 9999 as an unknown dose instead of a real amount", () => {
    const result = parse({
      med_carbamazepine_status: "taking_now",
      med_carbamazepine_dose: "9999",
      med_carbamazepine_times: "twice",
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data.uses[0]).toMatchObject({
      catalogKey: "carbamazepine",
      doseAmount: null,
      doseUnknown: true,
      timesPerDay: "twice",
    });
  });

  it("rejects a rescue answer on a regular medication", () => {
    const result = parse({ med_gabapentin_status: "used_past_year" });
    expect(result.success).toBe(false);
  });

  it("drops cannabis follow-ups when marijuana was not used", () => {
    const result = parse({
      cannabis_used: "no",
      cannabis_relief: "a_lot",
      cannabis_medical: "yes",
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data.context.cannabisRelief).toBeNull();
    expect(result.data.context.cannabisMedicalDispensary).toBeNull();
  });

  it("asks for the named emergency protocol only after an IV anticonvulsant report", () => {
    const hidden = parse({
      er_visited: "yes",
      er_sent_home: "yes",
      er_protocol: "yes",
    });
    expect(hidden.success).toBe(true);
    if (!hidden.success) {
      return;
    }
    expect(hidden.data.context.erAskedForNamedProtocol).toBeNull();

    const shown = parse({
      er_visited: "yes",
      er_sent_home: "no",
      er_iv: "yes",
      er_protocol: "yes",
    });
    expect(shown.success).toBe(true);
    if (!shown.success) {
      return;
    }
    expect(shown.data.context.erAskedForNamedProtocol).toBe("yes");
  });

  it("keeps an unanswered medication off the saved list", () => {
    const result = parse({ med_baclofen_dose: "10" });
    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data.uses).toEqual([]);
  });

  it("stores an injectable follow-up after past-year use", () => {
    const result = parse({
      med_erenumab_status: "used_past_year",
      med_erenumab_injector: "self",
      med_erenumab_schedule: "once_a_month",
      med_erenumab_monthly_dose: "standard",
      med_erenumab_still: "yes",
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data.uses[0]?.followUp).toMatchObject({
      kind: "cgrp",
      injector: "self",
      monthlyDose: "standard",
      stillUsing: "yes",
    });
  });

  it("exports the medication name and keeps headache prompts free of codes", () => {
    const result = parse({ med_baclofen_status: "never" });
    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(buildMedicationInventoryCsv(result.data)).toContain("Baclofen");
    for (const pattern of HEADACHE_PATTERNS) {
      expect(pattern.prompt).not.toMatch(/ICOP|ICHD/);
    }
    expect(HEADACHE_PATTERNS).toHaveLength(6);
  });
});
