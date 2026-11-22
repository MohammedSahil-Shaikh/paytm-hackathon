/** Verified-context HR and onboarding assistant. */
import type { HrAssistantRequest, HrAssistantResponse } from "@/types";

export async function askHrAssistant(
  input: HrAssistantRequest,
): Promise<HrAssistantResponse> {
  const question = input.question.toLowerCase();
  const context = `${input.policyContext ?? ""} ${input.onboardingContext ?? ""}`.trim();
  if (!context) {
    return {
      answer: `I do not have verified ${input.company} policy information for that question yet. Please check your company handbook or ask HR directly.`,
      sources: [],
      verified: false,
    };
  }

  const matches = context.split(/(?<=[.!?])\s+/).filter((sentence) =>
    question.split(/\s+/).some((word) => word.length > 3 && sentence.toLowerCase().includes(word)),
  );
  if (matches.length === 0) {
    return {
      answer: "I could not find a verified answer in the policy or onboarding context provided. Please confirm this with HR.",
      sources: [],
      verified: false,
    };
  }
  return {
    answer: matches.slice(0, 2).join(" "),
    sources: ["Provided company policy/onboarding context"],
    verified: true,
  };
}
