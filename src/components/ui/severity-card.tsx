"use client";

import type { CSSProperties } from "react";
import { cardClass } from "@/lib/design/ui-classes";
import { getSeverityDisplay, getSeveritySliderPercent } from "@/lib/design/severity";
import { cn } from "@/lib/utils";

type SeverityCardProps = {
  severity: number;
  onChange: (value: number) => void;
  name?: string;
};

export function SeverityCard({ severity, onChange, name = "severity" }: SeverityCardProps) {
  const display = getSeverityDisplay(severity);

  return (
    <div className={cn(cardClass, "space-y-5 p-6")}>
      <p className="text-sm font-semibold text-[color:var(--muted)]">How are you feeling?</p>

      <div className="space-y-1">
        <div className="flex items-baseline gap-1">
          <span
            className="font-display text-5xl font-bold leading-none transition-colors duration-300"
            style={{ color: display.color }}
          >
            {severity}
          </span>
          <span className="text-2xl font-medium text-[color:var(--muted)]">/ 10</span>
        </div>
        <p
          className="text-lg font-semibold transition-colors duration-300"
          style={{ color: display.color }}
        >
          {display.label}
        </p>
      </div>

      <div className="space-y-2">
        <input
          type="range"
          name={name}
          min="1"
          max="10"
          step="1"
          value={severity}
          required
          onChange={(event) => onChange(Number(event.target.value))}
          className="severity-slider"
          style={{ "--slider-pct": getSeveritySliderPercent(severity) } as CSSProperties}
          aria-label="Pain severity"
        />
        <div className="flex justify-between text-xs font-medium text-[color:var(--muted)]">
          <span>1</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
}
