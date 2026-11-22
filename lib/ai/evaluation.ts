/**
 * Member 1 — Answer evaluation and adaptive follow-up.
 */
import { evaluateAnswerFallback } from "@/lib/ai/fallback";
import { AiProviderError, generateJson, isAiConfigured } from "@/lib/ai/provider";
import { buildEvaluationPrompts } from "@/lib/ai/prompts";
import {
  evaluationAiSchema,
  interviewAnswerInputSchema,
} from "@/lib/ai/schemas";
import { getSession, saveSession } from "@/lib/ai/session-store";
import type {
  AnswerEvaluation,
  InterviewAnswerData,
  InterviewSession,
  NextInterviewAction,
} from "@/lib/ai/types";
import { createId, nowIso } from "@/lib/ai/utils";
import type { InterviewQuestion } from "@/types";

const MAX_FOLLOW_UPS = 2;

function decideAction(input: {
  requested: NextInterviewAction;
  followUpsUsed: number;
  remainingOriginalsAfterCurrent: number;
  quality: AnswerEvaluation["quality"];
}): NextInterviewAction {
  const needsFollowUp =
    input.quality === "partial" ||
    input.quality === "weak" ||
    (input.requested === "follow_up" && input.quality !== "strong");

  if (needsFollowUp && input.followUpsUsed < MAX_FOLLOW_UPS) {
    return "follow_up";
  }

  if (input.remainingOriginalsAfterCurrent <= 0) {
    return "complete";
  }

  return "next_question";
}

function withInterviewerMessage(
  session: InterviewSession,
  question: InterviewQuestion,
): InterviewSession {
  const alreadyAsked = session.transcript.some(
    (msg) => msg.role === "interviewer" && msg.questionId === question.id,
  );
  if (alreadyAsked) {
    return { ...session, currentQuestion: question };
  }
  return {
    ...session,
    currentQuestion: question,
    transcript: [
      ...session.transcript,
      {
        id: createId("msg"),
        role: "interviewer",
        content: question.question,
        questionId: question.id,
        timestamp: nowIso(),
      },
    ],
  };
}

export async function evaluateAnswer(raw: unknown): Promise<InterviewAnswerData> {
  const parsed = interviewAnswerInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid answer payload");
  }

  const session = getSession(parsed.data.sessionId);
  if (!session) {
    throw new Error("Interview session not found");
  }
  if (session.status === "completed") {
    throw new Error("Interview session is already completed");
  }

  const currentQuestion =
    session.currentQuestion ??
    parsed.data.question ??
    session.plannedQuestions[session.currentQuestionIndex];

  if (!currentQuestion) {
    throw new Error("No active interview question");
  }

  const answerText = parsed.data.answer.trim();
  const followUpsUsed = session.followUpsForCurrentOriginal;
  const remainingAfterCurrent = Math.max(
    session.plannedQuestions.length - (session.originalsCompleted + 1),
    0,
  );

  let evaluation: AnswerEvaluation;
  let requestedAction: NextInterviewAction;
  let followUp: InterviewQuestion | null = null;
  let source: "ai" | "mock" = "mock";

  if (isAiConfigured()) {
    try {
      const prompts = buildEvaluationPrompts({
        candidate: session.candidate,
        research: session.research,
        question: currentQuestion,
        answer: answerText,
        followUpsUsed,
        originalsCompleted: session.originalsCompleted,
        remainingOriginals: remainingAfterCurrent,
      });
      const aiResult = await generateJson({
        system: prompts.system,
        user: prompts.user,
        schema: evaluationAiSchema,
      });
      evaluation = aiResult.evaluation;
      followUp = aiResult.followUpQuestion;
      requestedAction = aiResult.nextAction;
      source = "ai";
    } catch (error) {
      if (!(error instanceof AiProviderError)) throw error;
      const fallback = evaluateAnswerFallback({
        answer: answerText,
        followUpsUsed,
        remainingOriginals: remainingAfterCurrent,
        question: currentQuestion,
      });
      evaluation = fallback.evaluation;
      followUp = fallback.nextQuestion;
      requestedAction = fallback.nextAction;
      source = "mock";
    }
  } else {
    const fallback = evaluateAnswerFallback({
      answer: answerText,
      followUpsUsed,
      remainingOriginals: remainingAfterCurrent,
      question: currentQuestion,
    });
    evaluation = fallback.evaluation;
    followUp = fallback.nextQuestion;
    requestedAction = fallback.nextAction;
    source = "mock";
  }

  const nextAction = decideAction({
    requested: requestedAction,
    followUpsUsed,
    remainingOriginalsAfterCurrent: remainingAfterCurrent,
    quality: evaluation.quality,
  });

  if (nextAction === "follow_up" && !followUp) {
    followUp = {
      id: createId("q_follow"),
      question: `Can you share a concrete example that strengthens your answer to: "${currentQuestion.question}"?`,
      category: "follow_up",
      difficulty: "medium",
      reasoning: "Adaptive follow-up for missing depth or clarity.",
    };
  }

  let updated: InterviewSession = {
    ...session,
    source,
    transcript: [
      ...session.transcript,
      {
        id: createId("msg"),
        role: "candidate",
        content: answerText || "(empty answer)",
        questionId: currentQuestion.id,
        timestamp: nowIso(),
      },
    ],
    answers: [
      ...session.answers,
      {
        questionId: currentQuestion.id,
        question: currentQuestion,
        answer: answerText,
        evaluation,
        isFollowUp: currentQuestion.category === "follow_up",
        createdAt: nowIso(),
      },
    ],
  };

  let nextQuestion: InterviewQuestion | null = null;
  let resolvedAction = nextAction;

  if (nextAction === "follow_up" && followUp) {
    updated = {
      ...withInterviewerMessage(updated, followUp),
      followUpsForCurrentOriginal: followUpsUsed + 1,
    };
    nextQuestion = followUp;
  } else if (nextAction === "next_question") {
    const nextIndex = session.originalsCompleted + 1;
    const upcoming = session.plannedQuestions[nextIndex];
    updated = withInterviewerMessage(
      {
        ...updated,
        originalsCompleted: nextIndex,
        currentQuestionIndex: nextIndex,
        followUpsForCurrentOriginal: 0,
      },
      upcoming,
    );
    nextQuestion = upcoming;
  } else {
    updated = {
      ...updated,
      originalsCompleted: session.plannedQuestions.length,
      currentQuestionIndex: session.plannedQuestions.length,
      currentQuestion: null,
      followUpsForCurrentOriginal: 0,
      status: "completed",
      completedAt: nowIso(),
    };
    nextQuestion = null;
    resolvedAction = "complete";
  }

  saveSession(updated);

  return {
    evaluation,
    nextAction: updated.status === "completed" ? "complete" : resolvedAction,
    nextQuestion,
    isComplete: updated.status === "completed",
    currentQuestionIndex: updated.currentQuestionIndex,
    status: updated.status,
    source,
  };
}
