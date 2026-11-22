import { NextResponse } from "next/server";
import { mockOnboardingPlan } from "@/lib/mock";

/**
 * Member 1 — POST /api/onboarding
 * Placeholder plan. Replace with lib/ai/onboarding.
 */
export async function POST(request: Request) {
  try {
    await request.json();
    return NextResponse.json(mockOnboardingPlan);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
