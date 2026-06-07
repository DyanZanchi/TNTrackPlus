export type IconProps = {
  className?: string;
};

export function IconEpisodes({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 2c1.5 3 4 5.5 4 9a4 4 0 0 1-8 0c0-3.5 2.5-6 4-9Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 21h8" strokeLinecap="round" />
    </svg>
  );
}

export function IconDuration({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSeverity({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 18V6l8 4 8-4v12l-8 4-8-4Z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconTrigger({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconTrend({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 17l5-5 4 4 8-10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 6h4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconUser({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}

export function IconTag({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 12V4h8l9 9-5 5-9-9Z" strokeLinejoin="round" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPlus({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}
