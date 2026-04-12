import { signOutAction } from "@/lib/auth/actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-xl border border-[color:var(--border)] px-3 py-2 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-white"
      >
        Sign out
      </button>
    </form>
  );
}
