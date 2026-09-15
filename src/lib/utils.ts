export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDurationSeconds(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const parts: string[] = [];

  if (days > 0) {
    parts.push(days === 1 ? "1 day" : `${days} days`);
  }

  if (hours > 0) {
    parts.push(`${hours} hr`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} min`);
  }

  if (remainingSeconds > 0 && days === 0) {
    parts.push(`${remainingSeconds} sec`);
  }

  return parts.join(" ") || "0 min";
}

export function formatDurationHms(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${remainingSeconds}`;
}
