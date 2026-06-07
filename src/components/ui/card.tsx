import type { ReactNode } from "react";
import { cardClass, cardElevatedClass } from "@/lib/design/ui-classes";
import { cn } from "@/lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
};

export function Card({ children, className, elevated }: CardProps) {
  return (
    <div className={cn(cardClass, "p-6", elevated && cardElevatedClass, className)}>
      {children}
    </div>
  );
}
