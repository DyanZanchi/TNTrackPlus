import Link from "next/link";
import { Card } from "@/components/ui/card";

type AuthErrorPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = searchParams ? await searchParams : {};
  const message =
    typeof params.message === "string"
      ? params.message
      : "Something went wrong while processing your session. Please try signing in again.";

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-lg space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Authentication error</h1>
        <p className="text-sm text-[color:var(--muted)]">{message}</p>
        <Link
          href="/login"
          className="inline-flex rounded-xl bg-[color:var(--primary)] px-4 py-2 font-semibold text-[color:var(--primary-foreground)]"
        >
          Back to login
        </Link>
      </Card>
    </div>
  );
}
