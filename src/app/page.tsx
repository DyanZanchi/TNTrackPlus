import Link from "next/link";
import { Card } from "@/components/ui/card";
import { btnPrimaryClass, btnSecondaryClass } from "@/lib/design/ui-classes";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-[color:var(--accent)] px-4 py-1.5 text-sm font-semibold text-[color:var(--primary)]">
            Facial Pain Episode Tracking
          </span>
          <div className="space-y-4">
            <h1 className="font-display max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Capture facial pain episodes in a consistent, reviewable way.
            </h1>
            <p className="max-w-2xl text-lg text-[color:var(--muted)]">
              TN Track+ helps patients log episode severity, duration, likely triggers, and medication
              use so patterns are easier to discuss over time.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className={cn(btnPrimaryClass, "px-6 py-3 text-base")}>
              Create account
            </Link>
            <Link href="/login" className={cn(btnSecondaryClass, "px-6 py-3 text-base")}>
              Log in
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Log episodes",
            body: "Record where the pain occurred, how severe it was, the episode duration, and the likely trigger.",
          },
          {
            title: "Review trends",
            body: "See how often episodes occur each month and which triggers or medications are most common.",
          },
          {
            title: "Share data",
            body: "Export filtered logs to CSV for clinic visits or personal records.",
          },
        ].map((item) => (
          <Card key={item.title}>
            <h3 className="font-display text-lg font-bold">{item.title}</h3>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{item.body}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
