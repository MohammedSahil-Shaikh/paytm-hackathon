/**
 * Member 1 — Personalized 30/60/90 onboarding.
 */
import { generateJson, isAiConfigured } from "@/lib/ai/provider";
import { buildOnboardingPrompts } from "@/lib/ai/prompts";
import { onboardingAiSchema, onboardingInputSchema } from "@/lib/ai/schemas";
import { buildFallbackOnboarding } from "@/lib/ai/fallback";
import type { AiSource } from "@/lib/ai/types";
import type { OnboardingPlan } from "@/types";

export async function generateOnboardingPlan(raw: unknown): Promise<{
  plan: OnboardingPlan;
  source: AiSource;
}> {
  const parsed = onboardingInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid onboarding payload: ${parsed.error.issues[0]?.message || "validation failed"}`);
  }

  const candidate = {
    ...parsed.data.candidate,
    email: parsed.data.candidate.email || undefined,
    resumeText: parsed.data.candidate.resumeText || undefined,
  };
  const research = parsed.data.research;
  const report = parsed.data.report;

  if (isAiConfigured()) {
    try {
      const prompts = buildOnboardingPrompts({ candidate, research, report });
      const plan = await generateJson({
        system: prompts.system,
        user: prompts.user,
        schema: onboardingAiSchema,
      });
      return {
        plan: {
          ...plan,
          employeeName: plan.employeeName || candidate.name,
          company: plan.company || candidate.targetCompany,
          role: plan.role || candidate.targetRole,
        },
        source: "ai",
      };
    } catch {
      // fall through
    }
  }

  return {
    plan: buildFallbackOnboarding(candidate, research, report),
    source: "mock",
  };
}
