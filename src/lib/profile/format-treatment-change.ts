import { format } from "date-fns";
import {
  formatOtherTherapyLabel,
  formatPriorTreatmentLabel,
} from "@/lib/constants/profile-options";
import type { EpisodeTreatmentHistorySnapshot } from "@/lib/types/episodes";

function formatAddedItems(snapshot: EpisodeTreatmentHistorySnapshot) {
  const added = [
    ...snapshot.added_prior_treatments.map((entry) =>
      formatPriorTreatmentLabel(entry.treatment_type, entry.other_label),
    ),
    ...snapshot.added_other_therapies.map((entry) =>
      formatOtherTherapyLabel(entry.therapy_type, entry.other_label),
    ),
  ];

  if (added.length) {
    return added.join(", ");
  }

  const full = [
    ...snapshot.prior_treatments.map((entry) =>
      formatPriorTreatmentLabel(entry.treatment_type, entry.other_label),
    ),
    ...snapshot.other_therapies.map((entry) =>
      formatOtherTherapyLabel(entry.therapy_type, entry.other_label),
    ),
  ];

  return full.length ? full.join(", ") : "Updated treatment history";
}

export function formatTreatmentChangeDate(changeDate: string | null) {
  if (!changeDate) {
    return "";
  }

  return format(new Date(`${changeDate}T12:00:00`), "MMM d, yyyy");
}

export function formatTreatmentHistoryUpdate(snapshot: EpisodeTreatmentHistorySnapshot | null) {
  if (!snapshot) {
    return "";
  }

  return formatAddedItems(snapshot);
}
