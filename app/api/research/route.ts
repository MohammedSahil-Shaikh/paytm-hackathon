import { NextResponse } from "next/server";
import { mockResearch } from "@/lib/mock";

/**
 * Member 2 — POST /api/research
 * Placeholder returns mock research until SerpApi/You.com are integrated.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      company?: string;
      role?: string;
      jobDescription?: string;
    };

    if (!body.company || !body.role) {
      return NextResponse.json(
        { error: "company and role are required" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ...mockResearch,
      company: body.company,
      role: body.role,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
