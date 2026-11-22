import { NextResponse } from "next/server";
import { generateOnboardingPlan } from "@/lib/ai/onboarding";
import type { CandidateProfile, InterviewReport, ResearchData } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      candidate: CandidateProfile;
      report: InterviewReport;
      research: ResearchData;
    };
    if (!body?.candidate || !body.report || !body.research) {
      return NextResponse.json({ error: "candidate, report, and research are required" }, { status: 400 });
    }
    return NextResponse.json(await generateOnboardingPlan(body));
  } catch {
    return NextResponse.json({ error: "Invalid onboarding request" }, { status: 400 });
  }
}
