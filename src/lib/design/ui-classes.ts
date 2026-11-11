export const inputClass =
  "min-h-11 w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2.5 text-[color:var(--foreground)] transition-[border-color,box-shadow] duration-200 hover:border-[color:var(--accent-strong)] focus:border-[color:var(--primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/15";

export const inputMonoClass = `${inputClass} font-mono`;

/** Native select: reads as a control, not another choice tile. */
export const selectClass = `${inputClass} select-control appearance-none bg-[color:var(--accent)]/40 bg-[length:1rem] bg-[right_0.9rem_center] bg-no-repeat pr-10`;

export const labelClass = "text-sm font-medium text-[color:var(--foreground)]";

export const surveyPromptClass =
  "block font-display text-lg font-semibold leading-snug tracking-tight text-[color:var(--survey-prompt)] md:text-xl";

/** Secondary question inside a section — quieter than the main survey prompt. */
export const subsectionPromptClass =
  "block text-sm font-semibold leading-snug text-[color:var(--foreground)]";

export const hintClass = "text-xs leading-relaxed text-[color:var(--muted)]";

export const btnBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60";

export const btnPrimaryClass = `${btnBase} rounded-full border-0 bg-[color:var(--primary)] text-white shadow-[0_4px_16px_rgba(123,82,171,0.28)] hover:bg-[color:var(--primary-hover)] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(123,82,171,0.35)]`;

export const btnSecondaryClass = `${btnBase} border border-[color:var(--border)] bg-white text-[color:var(--foreground)] hover:border-[color:var(--accent-strong)] hover:bg-[color:var(--accent)]`;

export const btnGhostClass = `${btnBase} border-0 bg-transparent text-[color:var(--muted)] hover:bg-[color:var(--accent)] hover:text-[color:var(--primary)]`;

export const navLinkClass =
  "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-[color:var(--muted)] transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--primary)]";

export const selectionTileClass =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm transition-all duration-200 hover:border-[color:var(--accent-strong)] hover:bg-[color:var(--accent)]/40 active:scale-[0.98]";

export const selectionTileSelectedClass =
  "border-[color:var(--primary)] bg-[color:var(--accent)] text-[color:var(--primary)] shadow-[0_0_0_1px_rgba(123,82,171,0.12)]";

export const selectionGridTileClass =
  "flex-col justify-center text-center min-h-[5.5rem] gap-2 px-3 py-4";

/** Compact yes/no and short status chips — distinct from full-width tiles. */
export const choiceChipClass =
  "inline-flex cursor-pointer items-center justify-center rounded-full border border-[color:var(--border)] bg-white px-3.5 py-1.5 text-sm font-medium text-[color:var(--foreground)] transition-colors hover:border-[color:var(--accent-strong)] hover:bg-[color:var(--accent)]/50";

export const choiceChipSelectedClass =
  "border-[color:var(--primary)] bg-[color:var(--primary)] text-white hover:bg-[color:var(--primary-hover)] hover:border-[color:var(--primary-hover)]";

/** Indented follow-up block under a parent question. */
export const followUpIndentClass =
  "ml-1 space-y-3 border-l-2 border-[color:var(--primary)]/30 py-1 pl-4 sm:ml-2 sm:pl-5";

/** Nested follow-up panel — clearly inside a parent question, not a new top-level card. */
export const nestedPanelClass =
  "ml-1 space-y-3 rounded-r-xl border border-dashed border-[color:var(--border)] border-l-2 border-l-[color:var(--primary)]/35 bg-[color:var(--accent)]/35 px-3.5 py-3.5 sm:ml-2 sm:px-4";

export const cardClass =
  "rounded-2xl border border-[color:var(--border)] bg-white shadow-[0_1px_8px_rgba(123,82,171,0.05)]";

export const cardElevatedClass = "shadow-[0_8px_32px_rgba(123,82,171,0.1)]";

export const alertBaseClass = "rounded-xl px-4 py-3 text-sm";

export const alertErrorClass = `${alertBaseClass} bg-[color:var(--danger-bg)] text-[color:var(--danger)]`;

export const alertInfoClass = `${alertBaseClass} bg-[color:var(--accent)] text-[color:var(--foreground)]`;

export const alertSuccessClass = `${alertBaseClass} bg-[color:var(--success-bg)] text-[#2e7d5a]`;
