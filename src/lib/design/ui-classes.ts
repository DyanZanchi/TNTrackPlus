export const inputClass =
  "min-h-11 w-full rounded-2xl border border-[color:var(--border)] bg-white px-3.5 py-2.5 text-[color:var(--foreground)] transition-[border-color,box-shadow] duration-200 hover:border-[color:var(--accent-strong)] focus:border-[color:var(--primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/15";

export const inputMonoClass = `${inputClass} font-mono`;

export const labelClass = "text-sm font-semibold text-[color:var(--foreground)]";

export const surveyPromptClass =
  "block font-display text-lg font-bold leading-snug tracking-tight text-[color:var(--survey-prompt)] md:text-xl";

export const hintClass = "text-xs text-[color:var(--muted)]";

export const btnBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60";

export const btnPrimaryClass = `${btnBase} rounded-full border-0 bg-[color:var(--primary)] text-white shadow-[0_4px_16px_rgba(123,82,171,0.28)] hover:bg-[color:var(--primary-hover)] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(123,82,171,0.35)]`;

export const btnSecondaryClass = `${btnBase} border border-[color:var(--border)] bg-white text-[color:var(--foreground)] hover:border-[color:var(--accent-strong)] hover:bg-[color:var(--accent)]`;

export const btnGhostClass = `${btnBase} border-0 bg-transparent text-[color:var(--muted)] hover:bg-[color:var(--accent)] hover:text-[color:var(--primary)]`;

export const navLinkClass =
  "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-[color:var(--muted)] transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--primary)]";

export const selectionTileClass =
  "flex cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] border-[color:var(--border)] bg-white px-4 py-3 text-sm transition-all duration-200 hover:border-[color:var(--accent-strong)] hover:shadow-[0_2px_12px_rgba(123,82,171,0.06)] active:scale-[0.98]";

export const selectionTileSelectedClass =
  "border-[color:var(--primary)] bg-[color:var(--accent)] text-[color:var(--primary)] shadow-[0_0_0_1px_rgba(123,82,171,0.12)]";

export const selectionGridTileClass =
  "flex-col justify-center text-center min-h-[5.5rem] gap-2 px-3 py-4";

export const cardClass =
  "rounded-3xl border border-[color:var(--border)] bg-white shadow-[0_2px_12px_rgba(123,82,171,0.06)]";

export const cardElevatedClass = "shadow-[0_8px_32px_rgba(123,82,171,0.1)]";

export const alertBaseClass = "rounded-2xl px-4 py-3 text-sm";

export const alertErrorClass = `${alertBaseClass} bg-[color:var(--danger-bg)] text-[color:var(--danger)]`;

export const alertInfoClass = `${alertBaseClass} bg-[color:var(--accent)] text-[color:var(--foreground)]`;

export const alertSuccessClass = `${alertBaseClass} bg-[color:var(--success-bg)] text-[#2e7d5a]`;
