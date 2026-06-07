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
import { IconPlus } from "@/components/ui/icons";
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
import { alertInfoClass, alertSuccessClass, btnPrimaryClass, cardClass } from "@/lib/design/ui-classes";
import { hasSupabaseEnv, isAuthBypassed } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EpisodeRecord } from "@/lib/types/episodes";
import { cn } from "@/lib/utils";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const filters = await parseDashboardFilters(searchParams);
  const params = searchParams ? await searchParams : {};
  const created = params.created === "1";
  const treatmentChanged = params.treatment_changed === "1";
  const welcome = params.welcome === "1";
  const demoMode = isAuthBypassed();

  if (!demoMode && !hasSupabaseEnv()) {
    return (
      <div className={cn(cardClass, "p-6")}>
        <h1 className="font-display text-2xl font-bold">Supabase setup required</h1>
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

  const logCtaLabel =
    summary.totalEpisodes === 0 ? "Log your first entry" : "Log new entry";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Dashboard</h1>
          <p className="text-[color:var(--muted)]">
            Review episode frequency, severity, triggers, face-area trends, and medication use.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <ExportButton filters={filters} />
        </div>
      </div>

      {welcome ? (
        <p className={alertSuccessClass}>
          Profile saved. You can now log your first facial pain entry.
          {demoMode ? " Demo mode does not persist these changes." : ""}
        </p>
      ) : null}

      {created ? (
        <p className={alertSuccessClass}>
          {demoMode
            ? "Demo entry accepted. Demo mode does not save data yet."
            : "Episode saved successfully."}
        </p>
      ) : null}

      {treatmentChanged ? (
        <p className={alertInfoClass}>Treatment history updated with this entry.</p>
      ) : null}

      {demoMode ? (
        <p className={alertInfoClass}>
          Demo mode is enabled. Authentication is bypassed and the dashboard is showing sample data.
        </p>
      ) : null}

      <MetricsCards summary={summary} />

      <Link
        href="/episodes/new"
        className={cn(
          btnPrimaryClass,
          "flex w-full min-h-14 justify-center text-base shadow-[0_8px_28px_rgba(123,82,171,0.32)]",
        )}
      >
        <IconPlus className="h-5 w-5" />
        {logCtaLabel}
      </Link>

      <FilterBar filters={filters} />
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
