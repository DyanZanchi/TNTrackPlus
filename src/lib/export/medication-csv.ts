import { getMedicationCatalogItem } from "@/lib/medications/catalog";
import type { MedicationInventoryInput } from "@/lib/validation/medication-inventory";
import { EXPORT_SCHEMA_VERSION } from "@/lib/export/episodes-csv";

export const MEDICATION_CSV_HEADERS = [
  "schema_version",
  "record_type",
  "name",
  "context",
  "status",
  "times_per_day",
  "dose_amount",
  "dose_unknown",
  "administration",
  "formulation",
  "stop_reasons",
  "otc_frequency",
  "tablets_at_once",
  "strength_mg",
  "follow_up",
  "details",
] as const;

function escapeCsvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function cell(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  return String(value);
}

export function buildMedicationInventoryCsv(inventory: MedicationInventoryInput) {
  const rows: string[][] = inventory.uses.map((use) => {
    const item = getMedicationCatalogItem(use.catalogKey);
    return [
      EXPORT_SCHEMA_VERSION,
      "medication",
      item?.label ?? use.catalogKey,
      use.useContext,
      use.status,
      cell(use.timesPerDay),
      cell(use.doseAmount),
      use.doseUnknown ? "yes" : "",
      cell(use.administration),
      cell(use.formulation),
      use.stopReasons.join("; "),
      cell(use.otcFrequency),
      cell(use.tabletsAtOnce),
      cell(use.strengthMg),
      use.followUp ? JSON.stringify(use.followUp) : "",
      cell(use.otherText),
    ];
  });

  inventory.compounded.forEach((item) => {
    rows.push([
      EXPORT_SCHEMA_VERSION,
      "compounded",
      item.name,
      "compounded",
      cell(item.stillUsing),
      "",
      "",
      "",
      "",
      cell(item.form),
      "",
      "",
      "",
      "",
      "",
      [item.ingredients.join("; "), item.effect, item.pharmacyType].filter(Boolean).join(" | "),
    ]);
  });

  const context = inventory.context;
  rows.push([
    EXPORT_SCHEMA_VERSION,
    "context",
    "Medication survey context",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    [
      context.compoundedUsed ? `compounded=${context.compoundedUsed}` : "",
      context.cannabisUsed ? `marijuana=${context.cannabisUsed}` : "",
      context.cannabisRelief ? `marijuana_relief=${context.cannabisRelief}` : "",
      context.erVisited ? `emergency_visit=${context.erVisited}` : "",
      context.erAskedForNamedProtocol
        ? `asked_for_linskey_zakrzewska_protocol=${context.erAskedForNamedProtocol}`
        : "",
      context.answerConfidence ? `confidence=${context.answerConfidence}` : "",
    ]
      .filter(Boolean)
      .join("; "),
  ]);

  return [MEDICATION_CSV_HEADERS, ...rows]
    .map((row) => row.map((value) => escapeCsvCell(String(value))).join(","))
    .join("\n");
}
