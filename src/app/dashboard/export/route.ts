import { NextResponse } from "next/server";
import { buildFilterQuery } from "@/lib/analytics/episodes";
import { getBackgroundPainCheckInsForUser } from "@/lib/background-check-ins/queries";
import { DEMO_BACKGROUND_CHECK_INS } from "@/lib/demo/background-check-ins";
import { DEMO_EPISODES } from "@/lib/demo/episodes";
import {
  buildBackgroundCheckInsCsv,
  buildEpisodesCsv,
} from "@/lib/export/episodes-csv";
import { buildMedicationInventoryCsv } from "@/lib/export/medication-csv";
import { getMedicationInventory } from "@/lib/medications/queries";
import { hasSupabaseEnv, isAuthBypassed } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getEpisodesForUser } from "@/lib/episodes/queries";
import type { DashboardFilters, RangeKey } from "@/lib/types/episodes";

const VALID_RANGES: RangeKey[] = ["30d", "90d", "month", "custom"];

function parseFilters(request: Request): DashboardFilters {
  const { searchParams } = new URL(request.url);
  const rangeParam = searchParams.get("range") ?? "30d";

  return {
    range: VALID_RANGES.includes(rangeParam as RangeKey) ? (rangeParam as RangeKey) : "30d",
    start: searchParams.get("start") ?? undefined,
    end: searchParams.get("end") ?? undefined,
  };
}

export async function GET(request: Request) {
  if (!isAuthBypassed() && !hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase environment variables are missing." },
      { status: 503 },
    );
  }

  const filters = parseFilters(request);
  const { startIso, endIso } = buildFilterQuery(filters);
  const exportKind = new URL(request.url).searchParams.get("kind");
  const exportBackgroundCheckIns = exportKind === "background";
  const exportMedications = exportKind === "medications";

  if (isAuthBypassed()) {
    const csv = exportMedications
      ? buildMedicationInventoryCsv({
          uses: [],
          compounded: [],
          context: {
            compoundedUsed: null,
            compoundedCount: null,
            cannabisUsed: null,
            cannabisMedicalDispensary: null,
            cannabisOpenDispensary: null,
            cannabisOtherPlace: null,
            cannabisRelief: null,
            erVisited: null,
            erVisitCount: null,
            erSentHomeNoTreatment: null,
            erGivenOpiate: null,
            erGivenIvAnticonvulsant: null,
            erAskedForNamedProtocol: null,
            erOtherMedication: null,
            erAdmitted: null,
            erFeltHeard: null,
            erTreatedAsDrugSeeking: null,
            medicationsInFront: null,
            answerConfidence: null,
          },
        })
      : exportBackgroundCheckIns
      ? buildBackgroundCheckInsCsv(
          DEMO_BACKGROUND_CHECK_INS.filter(
            (checkIn) => checkIn.recorded_at >= startIso && checkIn.recorded_at <= endIso,
          ),
        )
      : buildEpisodesCsv(
          DEMO_EPISODES.filter(
            (episode) => episode.onset_at >= startIso && episode.onset_at <= endIso,
          ),
        );

    const filename = exportMedications
      ? "tn-medications-demo.csv"
      : exportBackgroundCheckIns
        ? "tn-background-check-ins-demo.csv"
        : "tn-episodes-demo.csv";

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const csv = exportMedications
      ? buildMedicationInventoryCsv(await getMedicationInventory())
      : exportBackgroundCheckIns
        ? buildBackgroundCheckInsCsv(await getBackgroundPainCheckInsForUser(user.id, filters))
        : buildEpisodesCsv(await getEpisodesForUser(user.id, filters));

    const filename = exportMedications
      ? "tn-medications.csv"
      : exportBackgroundCheckIns
        ? "tn-background-check-ins.csv"
        : "tn-episodes.csv";

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export episodes." },
      { status: 500 },
    );
  }
}
