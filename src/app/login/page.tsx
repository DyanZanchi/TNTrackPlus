import { AuthForm } from "@/components/auth/auth-form";
import { signInAction } from "@/lib/auth/actions";
import { isAuthBypassed } from "@/lib/supabase/env";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : {};
  const message = typeof params.message === "string" ? params.message : undefined;
  const demoMode = isAuthBypassed();

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <AuthForm
        title="Welcome back"
        description={
          demoMode
            ? "Demo mode is enabled. Use the button below to open the dashboard without email setup."
            : "Sign in to track facial pain episodes and review your dashboard."
        }
        submitLabel="Log in"
        alternateHref="/signup"
        alternateLabel="Need an account? Create one."
        action={signInAction}
        message={demoMode ? "Authentication is temporarily bypassed for local preview." : message}
      />
    </div>
  );
}
