import { NextResponse } from "next/server";
import { mockReport } from "@/lib/mock";

/**
 * Member 1 — POST /api/interview/finish
 * Placeholder report. Replace with lib/ai/report.
 */
export async function POST(request: Request) {
  try {
    await request.json();
    return NextResponse.json(mockReport);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
