"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthActionState } from "@/lib/auth/actions";
import { SubmitButton } from "@/components/ui/submit-button";

type AuthFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  alternateHref: string;
  alternateLabel: string;
  action: (
    previousState: AuthActionState | undefined,
    formData: FormData,
  ) => Promise<AuthActionState>;
  message?: string;
};

const INITIAL_STATE: AuthActionState = {};

export function AuthForm({
  title,
  description,
  submitLabel,
  alternateHref,
  alternateLabel,
  action,
  message,
}: AuthFormProps) {
  const [state, formAction] = useActionState<AuthActionState, FormData>(action, INITIAL_STATE);

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-[color:var(--border)] bg-white p-8 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="text-sm text-[color:var(--muted)]">{description}</p>
      </div>

      {(message || state.error) && (
        <p className="mt-4 rounded-xl bg-[color:var(--accent)] px-4 py-3 text-sm text-[color:var(--foreground)]">
          {state.error ?? message}
        </p>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            name="email"
            required
            className="min-h-11 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 outline-none ring-0 transition focus:border-[color:var(--primary)]"
            placeholder="patient@example.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="min-h-11 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 outline-none ring-0 transition focus:border-[color:var(--primary)]"
            placeholder="Minimum 6 characters"
          />
        </label>

        <SubmitButton label={submitLabel} pendingLabel="Working..." className="w-full" />
      </form>

      <p className="mt-4 text-sm text-[color:var(--muted)]">
        <Link className="font-semibold text-[color:var(--primary)]" href={alternateHref}>
          {alternateLabel}
        </Link>
      </p>
    </div>
  );
}
