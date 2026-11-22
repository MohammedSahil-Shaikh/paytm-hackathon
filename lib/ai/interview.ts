/**
 * Member 1 — Interview generation and session bootstrap.
 */
import { buildFallbackStartData } from "@/lib/ai/fallback";
import { AiProviderError, generateJson, isAiConfigured } from "@/lib/ai/provider";
import { buildInterviewStartPrompts } from "@/lib/ai/prompts";
import { interviewQuestionsAiSchema, interviewStartInputSchema } from "@/lib/ai/schemas";
import {
  fetchLiveCompanyRoleContext,
  isSerpApiConfigured,
} from "@/lib/ai/serpapi";
import { saveSession } from "@/lib/ai/session-store";
import type { InterviewSession, InterviewStartData } from "@/lib/ai/types";
import { createId, nowIso } from "@/lib/ai/utils";
import { normalizeCandidate } from "@/lib/ai/candidate";
import type { InterviewQuestion, ResearchData } from "@/types";

function ensureQuestionIds(questions: InterviewQuestion[]): InterviewQuestion[] {
  return questions.map((question, index) => ({
    ...question,
    id: question.id || `q_${String(index + 1).padStart(3, "0")}`,
  }));
}

async function enrichResearchWithSerpApi(
  research: ResearchData,
): Promise<ResearchData> {
  if (!isSerpApiConfigured()) return research;

  try {
    const live = await fetchLiveCompanyRoleContext({
      company: research.company,
      role: research.role,
    });

    return {
      ...research,
      overview:
        research.overview?.trim() ||
        live.overviewHints[0] ||
        research.overview,
      insights: Array.from(
        new Set([...research.insights, ...live.overviewHints, ...live.jobHints]),
      ).slice(0, 12),
      jobRequirements: Array.from(
        new Set([...research.jobRequirements, ...live.jobHints.slice(0, 4)]),
      ).slice(0, 12),
      recentNews: [...research.recentNews, ...live.newsHints].slice(0, 8),
      sources: [
        ...research.sources,
        ...live.sources.map((source) => ({
          title: source.title,
          url: source.url,
          provider: "serpapi" as const,
        })),
      ].slice(0, 12),
    };
  } catch {
    // Live enrichment is best-effort; interview can continue with provided research.
    return research;
  }
}

export async function startInterview(raw: unknown): Promise<InterviewStartData> {
  const parsed = interviewStartInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid interview start payload");
  }

  const candidate = normalizeCandidate(parsed.data.candidate);
  const research = await enrichResearchWithSerpApi(parsed.data.research);
  const jobDescription = parsed.data.jobDescription ?? "";
  const sessionId = createId("sess");

  let questions: InterviewQuestion[];
  let source: "ai" | "mock" = "mock";

  if (isAiConfigured()) {
    try {
      const prompts = buildInterviewStartPrompts({
        candidate,
        research,
        jobDescription,
      });
      const aiResult = await generateJson({
        system: prompts.system,
        user: prompts.user,
        schema: interviewQuestionsAiSchema,
      });
      questions = ensureQuestionIds(aiResult.questions);
      source = "ai";
    } catch (error) {
      if (!(error instanceof AiProviderError)) throw error;
      const fallback = buildFallbackStartData({ sessionId, candidate, research });
      questions = fallback.questions;
      source = "mock";
    }
  } else {
    questions = buildFallbackStartData({ sessionId, candidate, research }).questions;
    source = "mock";
  }

  const session: InterviewSession = {
    id: sessionId,
    candidate,
    research,
    jobDescription,
    plannedQuestions: questions,
    currentQuestionIndex: 0,
    currentQuestion: questions[0],
    answers: [],
    transcript: [
      {
        id: createId("msg"),
        role: "interviewer",
        content: questions[0].question,
        questionId: questions[0].id,
        timestamp: nowIso(),
      },
    ],
    followUpsForCurrentOriginal: 0,
    originalsCompleted: 0,
    status: "active",
    source,
    startedAt: nowIso(),
  };

  saveSession(session);

  return {
    sessionId,
    candidate,
    questions,
    currentQuestionIndex: 0,
    currentQuestion: questions[0],
    status: "active",
    source,
  };
}
