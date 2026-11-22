/**
 * Member 1 — Personalized onboarding plan generation.
 */
import type {
  CandidateProfile,
  InterviewReport,
  OnboardingPlan,
  ResearchData,
} from "@/types";

export async function generateOnboardingPlan(input: {
  candidate: CandidateProfile;
  report: InterviewReport;
  research: ResearchData;
}): Promise<OnboardingPlan> {
  void input;
  throw new Error("Not implemented: lib/ai/onboarding.generateOnboardingPlan");
}
