import { NextResponse } from "next/server";
import { startInterview } from "@/lib/ai/interview";
import type { InterviewStartRequest } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InterviewStartRequest;
    if (!body?.candidate?.name || !body.candidate.targetCompany || !body.candidate.targetRole || !body.research) {
      return NextResponse.json({ error: "candidate and research context are required" }, { status: 400 });
    }
    return NextResponse.json(await startInterview(body));
  } catch {
    return NextResponse.json({ error: "Invalid interview start request" }, { status: 400 });
  }
}
