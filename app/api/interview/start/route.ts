import { NextResponse } from "next/server";
import { mockQuestions } from "@/lib/mock";

/**
 * Member 1 — POST /api/interview/start
 * Placeholder returns mock questions. Replace with lib/ai/interview.
 */
export async function POST(request: Request) {
  try {
    await request.json();

    return NextResponse.json({
      sessionId: `sess_${crypto.randomUUID().slice(0, 8)}`,
      questions: mockQuestions,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
