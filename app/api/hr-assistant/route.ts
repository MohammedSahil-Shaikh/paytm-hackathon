import { askHrAssistant } from "@/lib/ai/assistant";
import { jsonError, jsonSuccess, validationError } from "@/lib/ai/utils";

/**
 * Member 1 — POST /api/hr-assistant
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await askHrAssistant(body);
    return jsonSuccess(data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return validationError("Malformed JSON body");
    }
    const message =
      error instanceof Error ? error.message : "Failed to answer HR question";
    if (message.toLowerCase().includes("invalid")) {
      return validationError(message);
    }
    return jsonError("HR_ASSISTANT_ERROR", message, 500);
  }
}
