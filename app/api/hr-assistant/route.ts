import { NextResponse } from "next/server";
import { askHrAssistant } from "@/lib/ai/assistant";
import type { HrAssistantRequest } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HrAssistantRequest;
    if (!body?.question?.trim() || !body.company || !body.role) {
      return NextResponse.json({ error: "question, company, and role are required" }, { status: 400 });
    }
    return NextResponse.json(await askHrAssistant(body));
  } catch {
    return NextResponse.json({ error: "Invalid HR assistant request" }, { status: 400 });
  }
}
