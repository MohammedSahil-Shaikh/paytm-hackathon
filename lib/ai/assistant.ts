/**
 * Member 1 — HR / onboarding assistant.
 */
import type { HrAssistantRequest, HrAssistantResponse } from "@/types";

export async function askHrAssistant(
  input: HrAssistantRequest,
): Promise<HrAssistantResponse> {
  void input;
  throw new Error("Not implemented: lib/ai/assistant.askHrAssistant");
}
