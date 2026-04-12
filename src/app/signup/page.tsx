import { AuthForm } from "@/components/auth/auth-form";
import { signUpAction } from "@/lib/auth/actions";
import { isAuthBypassed } from "@/lib/supabase/env";

export default function SignupPage() {
  const demoMode = isAuthBypassed();

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <AuthForm
        title="Create your account"
        description={
          demoMode
            ? "Demo mode is enabled. You can preview the app without setting up a real account."
            : "Use email and password to create your account. We will send you a confirmation email before your dashboard is activated."
        }
        submitLabel={demoMode ? "Continue to demo" : "Create account"}
        alternateHref="/login"
        alternateLabel="Already have an account? Log in."
        action={signUpAction}
        message={demoMode ? "Authentication is temporarily bypassed for local preview." : undefined}
      />
    </div>
  );
}
