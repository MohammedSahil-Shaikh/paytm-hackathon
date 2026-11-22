import { NextResponse } from "next/server";

/**
 * Member 1 — POST /api/interview/answer
 * Placeholder adaptive response. Replace with lib/ai/evaluation.
 */
export async function POST(request: Request) {
  try {
    await request.json();

    return NextResponse.json({
      evaluation: {
        rating: "adequate",
        feedback: "Placeholder evaluation. Member 1 will implement real scoring.",
      },
      nextQuestion: null,
      followUp: {
        id: "q_follow_001",
        question: "Can you make that answer more concrete with an example from your work?",
        category: "follow_up",
        difficulty: "medium",
        reasoning: "Placeholder follow-up for vague/incomplete answers.",
      },
      isComplete: false,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
