import Link from "next/link";
import { Card } from "@/components/ui/card";

const features = [
  "Structured pain episode logging",
  "Monthly and rolling trend summaries",
  "Trigger, medication, and face-area breakdowns",
  "CSV export for sharing with care teams",
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-[color:var(--accent)] px-3 py-1 text-sm font-medium text-[color:var(--primary)]">
            Trigeminal neuralgia symptom tracking
          </span>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Capture facial pain episodes in a consistent, reviewable way.
            </h1>
            <p className="max-w-2xl text-lg text-[color:var(--muted)]">
              TN Tracker helps patients log episode severity, duration, likely triggers, and medication
              use so patterns are easier to discuss over time.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-[color:var(--primary)] px-5 py-3 font-semibold text-[color:var(--primary-foreground)]"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-[color:var(--border)] bg-white px-5 py-3 font-semibold"
            >
              Log in
            </Link>
          </div>
        </div>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">What the MVP includes</h2>
          <ul className="space-y-3 text-sm text-[color:var(--muted)]">
            {features.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[color:var(--primary)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <h3 className="text-lg font-semibold">Log episodes</h3>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Record where the pain occurred, how severe it was, the episode duration, and the likely
            trigger.
          </p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Review trends</h3>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            See how often episodes occur each month and which triggers or medications are most common.
          </p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Share data</h3>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Export filtered logs to CSV for clinic visits or personal records.
          </p>
        </Card>
      </section>
    </div>
  );
}
