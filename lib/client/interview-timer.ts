export const INTERVIEW_DURATION_MS = 60 * 60 * 1000; // 60 minutes

export function formatCountdown(msRemaining: number): string {
  const clamped = Math.max(0, msRemaining);
  const totalSeconds = Math.floor(clamped / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function remainingMs(startedAtIso: string, now = Date.now()): number {
  const started = Date.parse(startedAtIso);
  if (Number.isNaN(started)) return INTERVIEW_DURATION_MS;
  return INTERVIEW_DURATION_MS - (now - started);
}
