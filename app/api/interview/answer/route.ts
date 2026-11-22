import { NextResponse } from "next/server";
import { evaluateAnswer } from "@/lib/ai/evaluation";
import type { InterviewAnswerRequest } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InterviewAnswerRequest;
    if (!body?.sessionId || !body.question || !body.answer?.trim() || !Array.isArray(body.transcript)) {
      return NextResponse.json({ error: "sessionId, question, answer, and transcript are required" }, { status: 400 });
    }
    return NextResponse.json(await evaluateAnswer(body));
  } catch {
    return NextResponse.json({ error: "Invalid interview answer request" }, { status: 400 });
  }
}
