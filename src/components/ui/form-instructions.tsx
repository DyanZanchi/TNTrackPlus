import { hintClass } from "@/lib/design/ui-classes";

export function FormInstructions() {
  return (
    <p className={hintClass}>
      Scroll to see every question. Answers are not saved until you use Save. Cancel leaves without
      saving.
    </p>
  );
}
