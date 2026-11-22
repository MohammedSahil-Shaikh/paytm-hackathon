/**
 * Temporary hackathon session store.
 * Limitation: in-memory only — not durable across process restarts,
 * serverless cold starts, or multiple instances.
 */
import type { InterviewSession } from "@/lib/ai/types";

const globalStore = globalThis as typeof globalThis & {
  __dayzeroSessions?: Map<string, InterviewSession>;
};

function getMap(): Map<string, InterviewSession> {
  if (!globalStore.__dayzeroSessions) {
    globalStore.__dayzeroSessions = new Map();
  }
  return globalStore.__dayzeroSessions;
}

export function saveSession(session: InterviewSession): InterviewSession {
  getMap().set(session.id, session);
  return session;
}

export function getSession(sessionId: string): InterviewSession | null {
  return getMap().get(sessionId) ?? null;
}

export function updateSession(
  sessionId: string,
  updater: (session: InterviewSession) => InterviewSession,
): InterviewSession | null {
  const current = getSession(sessionId);
  if (!current) return null;
  const next = updater(current);
  return saveSession(next);
}

export function listSessionIds(): string[] {
  return Array.from(getMap().keys());
}
