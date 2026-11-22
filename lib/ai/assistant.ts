/**
 * Member 1 — HR / onboarding assistant.
 */
import { buildFallbackHrResponse } from "@/lib/ai/fallback";
import { AiProviderError, generateJson, isAiConfigured } from "@/lib/ai/provider";
import { buildHrAssistantPrompts } from "@/lib/ai/prompts";
import { hrAssistantAiSchema, hrAssistantInputSchema } from "@/lib/ai/schemas";
import type { AiSource } from "@/lib/ai/types";
import type { HrAssistantResponse } from "@/types";

export async function askHrAssistant(raw: unknown): Promise<{
  response: HrAssistantResponse;
  source: AiSource;
}> {
  const parsed = hrAssistantInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid HR assistant payload");
  }

  const policyContext = parsed.data.policyContext ?? "";
  const onboardingContext = parsed.data.onboardingContext ?? "";

  let response: HrAssistantResponse;
  let source: AiSource = "mock";

  if (isAiConfigured()) {
    try {
      const prompts = buildHrAssistantPrompts({
        question: parsed.data.question,
        company: parsed.data.company,
        role: parsed.data.role,
        policyContext,
        onboardingContext,
      });
      response = await generateJson({
        system: prompts.system,
        user: prompts.user,
        schema: hrAssistantAiSchema,
      });

      if (!policyContext.trim() && !onboardingContext.trim()) {
        response = {
          answer:
            "I do not have verified company policy or onboarding context for that question, so I cannot invent leave, salary, benefits, or schedule details.",
          sources: [],
          verified: false,
        };
      } else if (
        !policyContext.trim() &&
        response.verified &&
        response.sources.includes("policy")
      ) {
        response = {
          ...response,
          verified: false,
          sources: response.sources.filter((item) => item !== "policy"),
          answer:
            response.answer ||
            "I do not have verified policy information in the provided context.",
        };
      }

      source = "ai";
    } catch (error) {
      if (!(error instanceof AiProviderError)) throw error;
      response = buildFallbackHrResponse({
        question: parsed.data.question,
        policyContext,
        onboardingContext,
      });
      source = "mock";
    }
  } else {
    response = buildFallbackHrResponse({
      question: parsed.data.question,
      policyContext,
      onboardingContext,
    });
    source = "mock";
  }

  return { response, source };
}
