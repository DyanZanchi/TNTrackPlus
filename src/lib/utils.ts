export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDurationSeconds(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    if (remainingSeconds === 0) {
      return `${hours} hr ${minutes} min`;
    }

    return `${hours} hr ${minutes} min ${remainingSeconds} sec`;
  }

  if (minutes > 0) {
    if (remainingSeconds === 0) {
      return `${minutes} min`;
    }

    return `${minutes} min ${remainingSeconds} sec`;
  }

  return `${remainingSeconds} sec`;
}

export function formatDurationHms(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${remainingSeconds}`;
}
