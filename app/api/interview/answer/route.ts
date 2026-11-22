import { evaluateAnswer } from "@/lib/ai/evaluation";
import { jsonError, jsonSuccess, validationError } from "@/lib/ai/utils";

/**
 * Member 1 — POST /api/interview/answer
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await evaluateAnswer(body);
    return jsonSuccess(data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return validationError("Malformed JSON body");
    }
    const message =
      error instanceof Error ? error.message : "Failed to evaluate answer";
    if (message.includes("not found")) {
      return jsonError("SESSION_NOT_FOUND", message, 404);
    }
    if (
      message.toLowerCase().includes("invalid") ||
      message.toLowerCase().includes("already completed")
    ) {
      return validationError(message);
    }
    return jsonError("INTERVIEW_ANSWER_ERROR", message, 500);
  }
}
