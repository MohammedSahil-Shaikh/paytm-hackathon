/**
 * Member 1 — Personalized onboarding plan generation.
 */
import { normalizeCandidate } from "@/lib/ai/candidate";
import { buildFallbackOnboarding } from "@/lib/ai/fallback";
import { AiProviderError, generateJson, isAiConfigured } from "@/lib/ai/provider";
import { buildOnboardingPrompts } from "@/lib/ai/prompts";
import { onboardingAiSchema, onboardingInputSchema } from "@/lib/ai/schemas";
import type { AiSource } from "@/lib/ai/types";
import type { OnboardingPlan } from "@/types";

export async function generateOnboardingPlan(raw: unknown): Promise<{
  plan: OnboardingPlan;
  source: AiSource;
}> {
  const parsed = onboardingInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid onboarding payload");
  }

  const candidate = normalizeCandidate(parsed.data.candidate);
  const research = parsed.data.research;
  const report = parsed.data.report;

  let plan: OnboardingPlan;
  let source: AiSource = "mock";

  if (isAiConfigured()) {
    try {
      const prompts = buildOnboardingPrompts({ candidate, research, report });
      plan = await generateJson({
        system: prompts.system,
        user: prompts.user,
        schema: onboardingAiSchema,
      });
      source = "ai";
    } catch (error) {
      if (!(error instanceof AiProviderError)) throw error;
      plan = buildFallbackOnboarding(candidate, research, report);
      source = "mock";
    }
  } else {
    plan = buildFallbackOnboarding(candidate, research, report);
    source = "mock";
  }

  return { plan, source };
}
