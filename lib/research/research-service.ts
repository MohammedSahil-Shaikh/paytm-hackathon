/**
 * Member 2 — Company research orchestration.
 */
import type { ResearchData } from "@/types";

export async function researchCompany(input: {
  company: string;
  role: string;
  jobDescription?: string;
}): Promise<ResearchData> {
  void input;
  throw new Error("Not implemented: lib/research/research-service.researchCompany");
}
