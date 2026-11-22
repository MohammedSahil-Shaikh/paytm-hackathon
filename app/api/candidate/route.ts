import { NextResponse } from "next/server";
import type { CandidateProfile } from "@/types";

/**
 * Member 1 — POST /api/candidate
 * Placeholder creates an in-memory candidate id for session flow.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CandidateProfile;

    if (!body?.name || !body?.targetCompany || !body?.targetRole) {
      return NextResponse.json(
        { error: "name, targetCompany, and targetRole are required" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      id: `cand_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      ...body,
      skills: body.skills ?? [],
      experience: body.experience ?? [],
      strengths: body.strengths ?? [],
      skillGaps: body.skillGaps ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
