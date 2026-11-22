/**
 * Member 1 — HR assistant (no invented policies).
 */
import { generateJson, isAiConfigured } from "@/lib/ai/provider";
import { buildHrAssistantPrompts } from "@/lib/ai/prompts";
import { hrAssistantAiSchema, hrAssistantInputSchema } from "@/lib/ai/schemas";
import { buildFallbackHrResponse } from "@/lib/ai/fallback";
import type { AiSource } from "@/lib/ai/types";
import type { HrAssistantResponse } from "@/types";

const HR_AI_TIMEOUT_MS = 8_000;

function looksLikePolicyQuestion(question: string): boolean {
  const q = question.toLowerCase();
  return (
    q.includes("leave") ||
    q.includes("policy") ||
    q.includes("salary") ||
    q.includes("benefit") ||
    q.includes("pto") ||
    q.includes("holiday") ||
    q.includes("wfh") ||
    q.includes("remote") ||
    q.includes("timing") ||
    q.includes("work hours")
  );
}

export async function askHrAssistant(raw: unknown): Promise<{
  response: HrAssistantResponse;
  source: AiSource;
}> {
  const parsed = hrAssistantInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Invalid HR assistant payload: ${parsed.error.issues[0]?.message || "validation failed"}`,
    );
  }

  const input = parsed.data;
  const hasPolicy = Boolean(input.policyContext?.trim());
  const hasOnboarding = Boolean(input.onboardingContext?.trim());

  // Policy questions with no policy context: answer immediately — don't wait on Gemini.
  if (looksLikePolicyQuestion(input.question) && !hasPolicy) {
    return {
      response: buildFallbackHrResponse(input),
      source: "mock",
    };
  }

  // Onboarding/roadmap questions with local context: prefer fast local answer.
  if (
    hasOnboarding &&
    !hasPolicy &&
    /roadmap|onboarding|day[s]?\s*1|30|60|90|gap|skill|focus|task/i.test(
      input.question,
    )
  ) {
    return {
      response: buildFallbackHrResponse(input),
      source: "mock",
    };
  }

  if (isAiConfigured() && (hasPolicy || hasOnboarding)) {
    try {
      const prompts = buildHrAssistantPrompts(input);
      const response = await generateJson({
        system: prompts.system,
        user: prompts.user,
        schema: hrAssistantAiSchema,
        timeoutMs: HR_AI_TIMEOUT_MS,
      });
      if (!hasPolicy && response.verified && !hasOnboarding) {
        response.verified = false;
      }
      return { response, source: "ai" };
    } catch {
      // fall through to deterministic fallback
    }
  }

  return {
    response: buildFallbackHrResponse(input),
    source: "mock",
  };
}
