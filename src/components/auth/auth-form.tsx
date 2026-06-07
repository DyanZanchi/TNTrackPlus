"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthActionState } from "@/lib/auth/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  alertErrorClass,
  alertInfoClass,
  cardClass,
  cardElevatedClass,
  inputClass,
  labelClass,
} from "@/lib/design/ui-classes";
import { cn } from "@/lib/utils";

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
    <div className={cn(cardClass, cardElevatedClass, "mx-auto w-full max-w-md p-8")}>
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        <p className="text-sm text-[color:var(--muted)]">{description}</p>
      </div>

      {(message || state.error) && (
        <p className={cn("mt-4", state.error ? alertErrorClass : alertInfoClass)}>
          {state.error ?? message}
        </p>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <label className="block space-y-2">
          <span className={labelClass}>Email</span>
          <input
            type="email"
            name="email"
            required
            className={inputClass}
            placeholder="patient@example.com"
          />
        </label>

        <label className="block space-y-2">
          <span className={labelClass}>Password</span>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className={inputClass}
            placeholder="Minimum 6 characters"
          />
        </label>

        <SubmitButton label={submitLabel} pendingLabel="Working..." className="w-full" />
      </form>

      <p className="mt-4 text-sm text-[color:var(--muted)]">
        <Link
          className="font-semibold text-[color:var(--primary)] hover:text-[color:var(--primary-hover)]"
          href={alternateHref}
        >
          {alternateLabel}
        </Link>
      </p>
    </div>
  );
}
