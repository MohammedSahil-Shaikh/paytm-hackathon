/**
 * Member 1 — Evidence-based interview report.
 */
import { generateJson, isAiConfigured } from "@/lib/ai/provider";
import { buildReportPrompts } from "@/lib/ai/prompts";
import { interviewFinishInputSchema, interviewReportAiSchema } from "@/lib/ai/schemas";
import { buildFallbackReport } from "@/lib/ai/fallback";
import { getSession, saveSession } from "@/lib/ai/session-store";
import { nowIso } from "@/lib/ai/utils";
import type { AiSource } from "@/lib/ai/types";
import type { InterviewReport } from "@/types";

export async function finishInterview(raw: unknown): Promise<{
  report: InterviewReport;
  sessionId: string;
  source: AiSource;
}> {
  const parsed = interviewFinishInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid finish payload: ${parsed.error.issues[0]?.message || "validation failed"}`);
  }

  const session = getSession(parsed.data.sessionId);
  if (!session) {
    throw new Error("Interview session not found");
  }
  if (session.answers.length === 0) {
    throw new Error("Cannot finish interview with no answers");
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
    } catch {
      report = buildFallbackReport(session.candidate, answerPayload);
    }
  } else {
    report = buildFallbackReport(session.candidate, answerPayload);
  }

  saveSession({
    ...session,
    report,
    status: "completed",
    completedAt: session.completedAt ?? nowIso(),
    currentQuestion: null,
    source,
  });

  return {
    report,
    sessionId: session.id,
    source,
  };
}

/** Back-compat alias if older imports expect generateInterviewReport. */
export async function generateInterviewReport(input: unknown) {
  return finishInterview(input);
}
