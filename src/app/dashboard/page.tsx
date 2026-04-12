import Link from "next/link";
import { redirect } from "next/navigation";
import { ExportButton } from "@/components/dashboard/export-button";
import { FaceAreaChart } from "@/components/dashboard/face-area-chart";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { MedicationChart } from "@/components/dashboard/medication-chart";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { RecentEpisodesTable } from "@/components/dashboard/recent-episodes-table";
import { TopTriggers } from "@/components/dashboard/top-triggers";
import { TrendsChart } from "@/components/dashboard/trends-chart";
import {
  buildFaceAreaCounts,
  buildFilterQuery,
  buildMedicationCounts,
  buildMonthlyTrend,
  buildTriggerCounts,
  summarizeEpisodes,
} from "@/lib/analytics/episodes";
import { DEMO_EPISODES } from "@/lib/demo/episodes";
import { getEpisodesForUser } from "@/lib/episodes/queries";
import { parseDashboardFilters } from "@/lib/analytics/filters";
import { hasSupabaseEnv, isAuthBypassed } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EpisodeRecord } from "@/lib/types/episodes";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const filters = await parseDashboardFilters(searchParams);
  const params = searchParams ? await searchParams : {};
  const created = params.created === "1";
  const demoMode = isAuthBypassed();

  if (!demoMode && !hasSupabaseEnv()) {
    return (
      <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Supabase setup required</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your local environment
          before using the dashboard.
        </p>
      </div>
    );
  }

  const { startIso, endIso } = buildFilterQuery(filters);
  let episodes: EpisodeRecord[] = [];

  if (demoMode) {
    episodes = DEMO_EPISODES.filter((episode) => {
      return episode.onset_at >= startIso && episode.onset_at <= endIso;
    }).sort((left, right) => right.onset_at.localeCompare(left.onset_at));
  } else {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    episodes = await getEpisodesForUser(user.id, filters);
  }
  const summary = summarizeEpisodes(episodes);
  const trendData = buildMonthlyTrend(episodes, 6);
  const triggerData = buildTriggerCounts(episodes);
  const faceAreaData = buildFaceAreaCounts(episodes);
  const medicationData = buildMedicationCounts(episodes);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-[color:var(--muted)]">
            Review episode frequency, severity, likely triggers, face-area trends, and medication use.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <ExportButton filters={filters} />
          <Link
            href="/episodes/new"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[color:var(--primary)] px-4 py-2 font-semibold text-[color:var(--primary-foreground)]"
          >
            New entry
          </Link>
        </div>
      </div>

      {created && (
        <p className="rounded-xl bg-[color:var(--accent)] px-4 py-3 text-sm text-[color:var(--foreground)]">
          {demoMode
            ? "Demo entry accepted. Demo mode does not save data yet."
            : "Episode saved successfully."}
        </p>
      )}

      {demoMode && (
        <p className="rounded-xl border border-dashed border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[color:var(--muted)]">
          Demo mode is enabled. Authentication is bypassed and the dashboard is showing sample data.
        </p>
      )}

      <FilterBar filters={filters} />
      <MetricsCards summary={summary} />
      <TrendsChart data={trendData} />

      <div className="grid gap-6 xl:grid-cols-2">
        <TopTriggers data={triggerData} />
        <FaceAreaChart data={faceAreaData} />
      </div>

      <MedicationChart data={medicationData} />
      <RecentEpisodesTable episodes={episodes} />
    </div>
  );
}
