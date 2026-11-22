import { NextResponse } from "next/server";
import { generateInterviewReport } from "@/lib/ai/report";
import type { CandidateProfile, InterviewMessage, InterviewQuestion } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      candidate: CandidateProfile;
      questions: InterviewQuestion[];
      transcript: InterviewMessage[];
    };
    if (!body?.candidate || !Array.isArray(body.questions) || !Array.isArray(body.transcript)) {
      return NextResponse.json({ error: "candidate, questions, and transcript are required" }, { status: 400 });
    }
    return NextResponse.json(await generateInterviewReport(body));
  } catch {
    return NextResponse.json({ error: "Invalid interview finish request" }, { status: 400 });
  }
}
