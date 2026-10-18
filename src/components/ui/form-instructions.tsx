import { hintClass } from "@/lib/design/ui-classes";

export function FormInstructions() {
  return (
    <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--accent)]/50 p-4 text-sm">
      <p className="font-semibold">Before you start</p>
      <ul className={`${hintClass} mt-2 list-disc space-y-1 pl-5`}>
        <li>Look at the buttons at the bottom of the page.</li>
        <li>If you do not see the next question, scroll down.</li>
        <li>Use Cancel to leave without saving. Answers are not saved automatically.</li>
        <li>Use Save when you have finished this screen.</li>
      </ul>
    </div>
  );
}
