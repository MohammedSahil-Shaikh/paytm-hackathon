import type { ApiEnvelope, ApiErrorBody } from "@/lib/ai/types";
import { NextResponse } from "next/server";

const MAX_RESUME_CHARS = 8_000;

export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
}

export function truncateText(text: string, maxLength = MAX_RESUME_CHARS): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 3)}...`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function successEnvelope<T>(data: T): ApiEnvelope<T> {
  return { success: true, data, error: null };
}

export function errorEnvelope(
  code: string,
  message: string,
): ApiEnvelope<null> {
  return { success: false, data: null, error: { code, message } };
}

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json(successEnvelope(data), { status });
}

export function jsonError(code: string, message: string, status: number) {
  return NextResponse.json(errorEnvelope(code, message), { status });
}

export function validationError(message: string) {
  return jsonError("VALIDATION_ERROR", message, 422);
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}

export function parseJsonSafe<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function extractJsonObject(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SECRET_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

export type { ApiErrorBody };
