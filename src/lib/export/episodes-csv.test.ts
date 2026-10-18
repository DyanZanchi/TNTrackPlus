import { describe, expect, it } from "vitest";
import { DEMO_EPISODES } from "@/lib/demo/episodes";
import { DEMO_BACKGROUND_CHECK_INS } from "@/lib/demo/background-check-ins";
import {
  BACKGROUND_CHECK_IN_CSV_HEADERS,
  buildBackgroundCheckInsCsv,
  buildEpisodeCsvRows,
  buildEpisodesCsv,
  EPISODE_CSV_HEADERS,
} from "./episodes-csv";

describe("episode CSV export", () => {
  it("keeps every row aligned with the header", () => {
    const rows = buildEpisodeCsvRows(DEMO_EPISODES);

    expect(rows).not.toHaveLength(0);
    rows.forEach((row) => {
      expect(row).toHaveLength(EPISODE_CSV_HEADERS.length);
    });
  });

  it("includes treatment-history column names", () => {
    expect(EPISODE_CSV_HEADERS).toContain("treatment_history_changed");
    expect(EPISODE_CSV_HEADERS).toContain("treatment_change_date");
    expect(EPISODE_CSV_HEADERS).toContain("treatment_update");
    expect(EPISODE_CSV_HEADERS).toContain("duration_status");
    expect(EPISODE_CSV_HEADERS).toContain("background_severity_before");
    expect(EPISODE_CSV_HEADERS[0]).toBe("schema_version");
  });

  it("escapes quotes in free text", () => {
    const csv = buildEpisodesCsv([
      {
        ...DEMO_EPISODES[0],
        notes: 'Pain felt "different" today.',
      },
    ]);

    expect(csv).toContain('"Pain felt ""different"" today."');
  });

  it("exports background check-ins as a distinct observation type", () => {
    const csv = buildBackgroundCheckInsCsv(DEMO_BACKGROUND_CHECK_INS);

    expect(BACKGROUND_CHECK_IN_CSV_HEADERS[0]).toBe("schema_version");
    expect(BACKGROUND_CHECK_IN_CSV_HEADERS[1]).toBe("observation_type");
    expect(csv).toContain('"background_check_in"');
    expect(csv.split("\n")).toHaveLength(DEMO_BACKGROUND_CHECK_INS.length + 1);
  });
});
