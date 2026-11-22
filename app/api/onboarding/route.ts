import { generateOnboardingPlan } from "@/lib/ai/onboarding";
import { jsonError, jsonSuccess, validationError } from "@/lib/ai/utils";

/**
 * Member 1 — POST /api/onboarding
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await generateOnboardingPlan(body);
    return jsonSuccess(data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return validationError("Malformed JSON body");
    }
    const message =
      error instanceof Error ? error.message : "Failed to generate onboarding plan";
    if (message.toLowerCase().includes("invalid")) {
      return validationError(message);
    }
    return jsonError("ONBOARDING_ERROR", message, 500);
  }
}
