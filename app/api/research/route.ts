import { NextResponse } from "next/server";
import { researchCompany } from "@/lib/research/research-service";

/**
 * Member 2 — POST /api/research
 * Returns normalized research and falls back when providers are unavailable.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      company?: unknown;
      role?: unknown;
      jobDescription?: unknown;
    };
    const company = typeof body.company === "string" ? body.company.trim() : "";
    const role = typeof body.role === "string" ? body.role.trim() : "";
    const jobDescription = typeof body.jobDescription === "string"
      ? body.jobDescription.trim()
      : undefined;

    if (!company || !role) {
      return NextResponse.json(
        { error: "company and role are required" },
        { status: 400 },
      );
    }

    const research = await researchCompany({ company, role, jobDescription });
    return NextResponse.json(research);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
