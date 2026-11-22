/**
 * Member 1 — Interview report generation.
 */
import { buildFallbackReport } from "@/lib/ai/fallback";
import { AiProviderError, generateJson, isAiConfigured } from "@/lib/ai/provider";
import { buildReportPrompts } from "@/lib/ai/prompts";
import {
  interviewFinishInputSchema,
  interviewReportAiSchema,
} from "@/lib/ai/schemas";
import { getSession, saveSession } from "@/lib/ai/session-store";
import type { AiSource } from "@/lib/ai/types";
import { nowIso } from "@/lib/ai/utils";
import type { InterviewReport } from "@/types";

export async function generateInterviewReport(raw: unknown): Promise<{
  report: InterviewReport;
  sessionId: string;
  source: AiSource;
}> {
  const parsed = interviewFinishInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid finish payload");
  }

  const session = getSession(parsed.data.sessionId);
  if (!session) {
    throw new Error("Interview session not found");
  }

  if (session.answers.length === 0) {
    throw new Error("Cannot finish interview without answers");
  }

  const answerPayload = session.answers.map((item) => ({
    question: item.question.question,
    answer: item.answer,
    evaluation: item.evaluation,
  }));

  let report: InterviewReport;
  let source: AiSource = "mock";

  if (isAiConfigured()) {
    try {
      const prompts = buildReportPrompts({
        candidate: session.candidate,
        research: session.research,
        transcript: session.transcript.map((msg) => ({
          role: msg.role,
          content: msg.content,
          questionId: msg.questionId,
        })),
        answers: answerPayload,
      });
      report = await generateJson({
        system: prompts.system,
        user: prompts.user,
        schema: interviewReportAiSchema,
      });
      source = "ai";
    } catch (error) {
      if (!(error instanceof AiProviderError)) throw error;
      report = buildFallbackReport(session.candidate, answerPayload);
      source = "mock";
    }
  } else {
    report = buildFallbackReport(session.candidate, answerPayload);
    source = "mock";
  }

  saveSession({
    ...session,
    status: "completed",
    completedAt: session.completedAt ?? nowIso(),
    currentQuestion: null,
    report,
    source,
  });

  return {
    report,
    sessionId: session.id,
    source,
  };
}
