import { startInterview } from "@/lib/ai/interview";
import { jsonError, jsonSuccess, validationError } from "@/lib/ai/utils";

/**
 * Member 1 — POST /api/interview/start
 * Returns 5 role-specific questions + session metadata.
 * Falls back to labeled mock questions when AI is unavailable.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await startInterview(body);
    return jsonSuccess(data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return validationError("Malformed JSON body");
    }
    const message =
      error instanceof Error ? error.message : "Failed to start interview";
    if (
      message.toLowerCase().includes("invalid") ||
      message.toLowerCase().includes("required")
    ) {
      return validationError(message);
    }
    return jsonError("INTERVIEW_START_ERROR", message, 500);
  }
}
