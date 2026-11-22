/**
 * Member 1 — Interview generation and session bootstrap.
 */
import { generateJson, isAiConfigured } from "@/lib/ai/provider";
import { buildInterviewStartPrompts } from "@/lib/ai/prompts";
import { interviewQuestionsAiSchema, interviewStartInputSchema } from "@/lib/ai/schemas";
import { buildFallbackStartData } from "@/lib/ai/fallback";
import { saveSession } from "@/lib/ai/session-store";
import { fetchLiveCompanyRoleContext } from "@/lib/ai/serpapi";
import { createId, nowIso } from "@/lib/ai/utils";
import type { InterviewSession, InterviewStartData } from "@/lib/ai/types";
import type { InterviewQuestion, ResearchData } from "@/types";

function mergeResearch(
  research: ResearchData,
  enrichment: Awaited<ReturnType<typeof fetchLiveCompanyRoleContext>>,
): ResearchData {
  return {
    ...research,
    overview:
      research.overview ||
      enrichment.overviewHints.slice(0, 2).join(" ") ||
      research.overview,
    jobRequirements: Array.from(
      new Set([...research.jobRequirements, ...enrichment.jobHints]),
    ).slice(0, 12),
    recentNews:
      research.recentNews.length > 0
        ? research.recentNews
        : enrichment.newsHints.slice(0, 5),
    insights: Array.from(
      new Set([
        ...research.insights,
        ...enrichment.overviewHints.slice(0, 3),
      ]),
    ).slice(0, 10),
    sources: [...research.sources, ...enrichment.sources].slice(0, 12),
  };
}

export async function startInterview(raw: unknown): Promise<InterviewStartData> {
  const parsed = interviewStartInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid interview start payload: ${parsed.error.issues[0]?.message || "validation failed"}`);
  }

  const candidate = {
    ...parsed.data.candidate,
    email: parsed.data.candidate.email || undefined,
    resumeText: parsed.data.candidate.resumeText || undefined,
  };
  let research = parsed.data.research as ResearchData;
  const jobDescription = parsed.data.jobDescription || "";
  const sessionId = createId("sess");

  if (isAiConfigured()) {
    try {
      // Best-effort enrichment with a hard cap so Gemini still gets time.
      const live = await Promise.race([
        fetchLiveCompanyRoleContext({
          company: candidate.targetCompany,
          role: candidate.targetRole,
        }),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Live enrichment timed out")), 8_000);
        }),
      ]);
      research = mergeResearch(research, live);
    } catch {
      // Keep client research if live enrichment fails or is slow.
    }
  }

  let questions: InterviewQuestion[];
  let source: "ai" | "mock" = "mock";

  if (isAiConfigured()) {
    try {
      const prompts = buildInterviewStartPrompts({
        candidate,
        research,
        jobDescription,
      });
      const ai = await generateJson({
        system: prompts.system,
        user: prompts.user,
        schema: interviewQuestionsAiSchema,
        timeoutMs: 55_000,
      });
      const normalized: InterviewQuestion[] = ai.questions.slice(0, 5).map((question, index) => ({
        id: question.id || `q_${String(index + 1).padStart(3, "0")}`,
        question: question.question,
        category: question.category,
        difficulty: question.difficulty,
        reasoning: question.reasoning,
        sourceIds: question.sourceIds,
      }));
      // Pad to 5 with fallbacks if the model returned fewer.
      if (normalized.length < 5) {
        const filler = buildFallbackStartData({
          sessionId,
          candidate,
          research,
        }).questions;
        while (normalized.length < 5) {
          const next = filler[normalized.length];
          if (!next) break;
          normalized.push(next);
        }
      }
      questions = normalized;
      source = "ai";
    } catch (error) {
      console.warn(
        "[interview/start] AI question generation failed, using mock fallback:",
        error instanceof Error ? error.message : error,
      );
      questions = buildFallbackStartData({ sessionId, candidate, research }).questions;
      source = "mock";
    }
  } else {
    questions = buildFallbackStartData({ sessionId, candidate, research }).questions;
  }

  const session: InterviewSession = {
    id: sessionId,
    candidate,
    research,
    jobDescription,
    plannedQuestions: questions,
    currentQuestionIndex: 0,
    currentQuestion: questions[0] ?? null,
    answers: [],
    transcript: [],
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
