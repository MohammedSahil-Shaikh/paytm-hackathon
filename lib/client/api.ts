/**
 * Browser API client for DayZero journey pages.
 *
 * CONTRACT NOTE (do not silently "fix" shared types/):
 * - M1 AI routes return { success, data, error }.
 * - Runtime interview answer shape uses quality/score/nextAction
 *   (lib/ai/types), which differs from types/interview.ts
 *   InterviewAnswerResponse (rating/followUp). UI follows runtime API.
 * - /api/research currently returns a flat ResearchData object (no envelope).
 */

import type {
  CandidateProfile,
  CandidateRecord,
  HrAssistantResponse,
  InterviewQuestion,
  InterviewReport,
  OnboardingPlan,
  ResearchData,
} from "@/types";
import type {
  AnswerEvaluation,
  InterviewAnswerData,
  InterviewStartData,
  NextInterviewAction,
} from "@/lib/ai/types";

export type { AnswerEvaluation, InterviewAnswerData, InterviewStartData, NextInterviewAction };

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code = "API_ERROR",
    public readonly status = 500,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type Envelope<T> = {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
};

async function postEnvelope<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let payload: Envelope<T> | null = null;
  try {
    payload = (await response.json()) as Envelope<T>;
  } catch {
    throw new ApiClientError("Invalid JSON response from server", "INVALID_JSON", response.status);
  }

  if (!response.ok || !payload.success || !payload.data) {
    throw new ApiClientError(
      payload.error?.message || `Request failed (${response.status})`,
      payload.error?.code || "REQUEST_FAILED",
      response.status,
    );
  }

  return payload.data;
}

export async function createCandidate(
  candidate: CandidateProfile,
): Promise<CandidateRecord> {
  return postEnvelope<CandidateRecord>("/api/candidate", candidate);
}

export async function fetchResearch(input: {
  company: string;
  role: string;
  jobDescription?: string;
}): Promise<ResearchData> {
  const response = await fetch("/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as ResearchData & {
    success?: boolean;
    data?: ResearchData;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new ApiClientError(
      payload.error?.message || "Research request failed",
      "RESEARCH_FAILED",
      response.status,
    );
  }

  // Support both flat research response and future envelope.
  if (payload.success && payload.data) {
    return payload.data;
  }

  if (!payload.company || !payload.role) {
    throw new ApiClientError("Research response missing company/role", "RESEARCH_INVALID");
  }

  return {
    company: payload.company,
    role: payload.role,
    overview: payload.overview || "",
    jobRequirements: payload.jobRequirements || [],
    recentNews: payload.recentNews || [],
    insights: payload.insights || [],
    sources: payload.sources || [],
  };
}

export async function startInterview(input: {
  candidate: CandidateProfile;
  research: ResearchData;
  jobDescription?: string;
}): Promise<InterviewStartData> {
  return postEnvelope<InterviewStartData>("/api/interview/start", input);
}

export async function submitAnswer(input: {
  sessionId: string;
  answer: string;
  question?: InterviewQuestion;
}): Promise<InterviewAnswerData> {
  return postEnvelope<InterviewAnswerData>("/api/interview/answer", input);
}

export async function finishInterview(sessionId: string): Promise<{
  report: InterviewReport;
  sessionId: string;
  source: "ai" | "mock";
}> {
  return postEnvelope("/api/interview/finish", { sessionId });
}

export async function generateOnboarding(input: {
  candidate: CandidateProfile;
  research: ResearchData;
  report: InterviewReport;
}): Promise<{ plan: OnboardingPlan; source: "ai" | "mock" }> {
  return postEnvelope("/api/onboarding", input);
}

export async function askHrAssistant(input: {
  question: string;
  company: string;
  role: string;
  policyContext?: string;
  onboardingContext?: string;
}): Promise<{ response: HrAssistantResponse; source: "ai" | "mock" }> {
  return postEnvelope("/api/hr-assistant", input);
}
