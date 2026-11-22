import { processCandidate } from "@/lib/ai/candidate";
import { jsonError, jsonSuccess, validationError } from "@/lib/ai/utils";

/**
 * Member 1 — POST /api/candidate
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const candidate = await processCandidate(body);
    return jsonSuccess(candidate, 201);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return validationError("Malformed JSON body");
    }
    const message = error instanceof Error ? error.message : "Invalid candidate data";
    if (message.toLowerCase().includes("invalid") || message.toLowerCase().includes("required")) {
      return validationError(message);
    }
    return jsonError("CANDIDATE_ERROR", message, 400);
  }
}
