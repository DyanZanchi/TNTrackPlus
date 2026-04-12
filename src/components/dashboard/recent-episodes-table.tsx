import { format } from "date-fns";
import {
  PAIN_TYPE_LABELS,
  formatFaceAreaLabels,
} from "@/lib/constants/episode-options";
import type { EpisodeRecord } from "@/lib/types/episodes";
import { formatDurationHms, formatDurationSeconds } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type RecentEpisodesTableProps = {
  episodes: EpisodeRecord[];
};

export function RecentEpisodesTable({ episodes }: RecentEpisodesTableProps) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Recent episodes</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Filtered records listed from newest to oldest.
        </p>
      </div>

      {episodes.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[color:var(--border)] text-left text-sm">
            <thead className="text-[color:var(--muted)]">
              <tr>
                <th className="px-2 py-3 font-medium">Onset</th>
                <th className="px-2 py-3 font-medium">Pain type</th>
                <th className="px-2 py-3 font-medium">Area</th>
                <th className="px-2 py-3 font-medium">Severity</th>
                <th className="px-2 py-3 font-medium">Duration</th>
                <th className="px-2 py-3 font-medium">Trigger</th>
                <th className="px-2 py-3 font-medium">Medication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {episodes.map((episode) => (
                <tr key={episode.id}>
                  <td className="px-2 py-3">{format(new Date(episode.onset_at), "PPp")}</td>
                  <td className="px-2 py-3">{PAIN_TYPE_LABELS[episode.pain_type]}</td>
                  <td className="px-2 py-3">{formatFaceAreaLabels(episode.face_areas)}</td>
                  <td className="px-2 py-3">{episode.severity}/10</td>
                  <td className="px-2 py-3">
                    <div>{formatDurationHms(episode.duration_seconds)}</div>
                    <div className="text-xs text-[color:var(--muted)]">
                      {formatDurationSeconds(episode.duration_seconds)}
                    </div>
                  </td>
                  <td className="px-2 py-3">{episode.trigger_labels.join(", ")}</td>
                  <td className="px-2 py-3">{episode.medication_labels.join(", ") || "None recorded"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-xl bg-[color:var(--accent)] px-4 py-3 text-sm text-[color:var(--muted)]">
          No episodes found for this date range yet.
        </p>
      )}
    </Card>
  );
}
