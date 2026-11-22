/**
 * AI generation provider powered by SerpApi Google Gemini.
 * Beyond 9TO5 Track 1 — no OpenAI dependency.
 */
import { z } from "zod";
import { askGemini, isSerpApiConfigured, SerpApiError } from "@/lib/ai/serpapi";
import { extractJsonObject, parseJsonSafe, truncateText } from "@/lib/ai/utils";

const DEFAULT_TIMEOUT_MS = 35_000;

export class AiProviderError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "MISSING_API_KEY"
      | "TIMEOUT"
      | "PROVIDER_ERROR"
      | "INVALID_JSON"
      | "VALIDATION_FAILED" = "PROVIDER_ERROR",
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}

export function isAiConfigured(): boolean {
  return isSerpApiConfigured();
}

function mapSerpError(error: unknown): AiProviderError {
  if (error instanceof SerpApiError) {
    return new AiProviderError(error.message, error.code);
  }
  if (error instanceof AiProviderError) return error;
  return new AiProviderError(
    error instanceof Error ? error.message : "AI provider request failed",
    "PROVIDER_ERROR",
  );
}

export async function generateJson<T>(input: {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  temperature?: number;
  timeoutMs?: number;
}): Promise<T> {
  if (!isAiConfigured()) {
    throw new AiProviderError(
      "SERPAPI_API_KEY is not configured",
      "MISSING_API_KEY",
    );
  }

  const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const prompt = [
    input.system,
    "",
    "Return ONLY valid JSON. No markdown fences. No prose outside JSON.",
    "",
    truncateText(input.user, 10_000),
  ].join("\n");

  try {
    // Keep provider timeout slightly under the caller budget so AbortController fires first.
    const content = await Promise.race([
      askGemini(prompt, Math.max(5_000, timeoutMs - 2_000)),
      new Promise<string>((_, reject) => {
        setTimeout(() => {
          reject(new AiProviderError("AI provider request timed out", "TIMEOUT"));
        }, timeoutMs);
      }),
    ]);

    const parsed = parseJsonSafe<unknown>(extractJsonObject(content));
    if (parsed === null) {
      throw new AiProviderError("AI returned invalid JSON", "INVALID_JSON");
    }

    const validated = input.schema.safeParse(parsed);
    if (!validated.success) {
      throw new AiProviderError(
        `AI JSON failed validation: ${validated.error.issues[0]?.message ?? "invalid shape"}`,
        "VALIDATION_FAILED",
      );
    }

    return validated.data;
  } catch (error) {
    throw mapSerpError(error);
  }
}
