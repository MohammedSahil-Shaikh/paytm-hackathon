import { finishInterview } from "@/lib/ai/report";
import { jsonError, jsonSuccess, validationError } from "@/lib/ai/utils";

/**
 * Member 1 — POST /api/interview/finish
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await finishInterview(body);
    return jsonSuccess(data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return validationError("Malformed JSON body");
    }
    const message =
      error instanceof Error ? error.message : "Failed to finish interview";
    if (message.includes("not found")) {
      return jsonError("SESSION_NOT_FOUND", message, 404);
    }
    if (
      message.toLowerCase().includes("invalid") ||
      message.toLowerCase().includes("no answers")
    ) {
      return validationError(message);
    }
    return jsonError("INTERVIEW_FINISH_ERROR", message, 500);
  }
}
