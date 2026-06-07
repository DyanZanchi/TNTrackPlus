"use client";

import { useFormStatus } from "react-dom";
import { btnPrimaryClass } from "@/lib/design/ui-classes";
import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  className?: string;
};

export function SubmitButton({
  label,
  pendingLabel = "Saving...",
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={cn(btnPrimaryClass, className)}>
      {pending ? pendingLabel : label}
    </button>
  );
}
