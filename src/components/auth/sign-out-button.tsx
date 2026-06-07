import { navLinkClass } from "@/lib/design/ui-classes";
import { signOutAction } from "@/lib/auth/actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button type="submit" className={navLinkClass}>
        Sign out
      </button>
    </form>
  );
}
