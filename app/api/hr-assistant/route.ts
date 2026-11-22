import { NextResponse } from "next/server";

/**
 * Member 1 — POST /api/hr-assistant
 * Placeholder HR assistant. Replace with lib/ai/assistant.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { question?: string };

    if (!body.question?.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    return NextResponse.json({
      answer:
        "I do not have verified policy information for that yet. Member 1 will connect this to mock policy context and the HR assistant logic.",
      sources: [],
      verified: false,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
