/**
 * Member 1 — Answer evaluation + adaptive follow-up.
 */
import { generateJson, isAiConfigured } from "@/lib/ai/provider";
import { buildEvaluationPrompts } from "@/lib/ai/prompts";
import { evaluationAiSchema, interviewAnswerInputSchema } from "@/lib/ai/schemas";
import { evaluateAnswerFallback } from "@/lib/ai/fallback";
import { getSession, saveSession } from "@/lib/ai/session-store";
import { createId, nowIso } from "@/lib/ai/utils";
import type { InterviewAnswerData, InterviewSession } from "@/lib/ai/types";
import type { InterviewMessage, InterviewQuestion } from "@/types";

function appendTranscript(
  session: InterviewSession,
  question: InterviewQuestion,
): InterviewSession {
  const alreadyAsked = session.transcript.some(
    (message) =>
      message.role === "interviewer" && message.questionId === question.id,
  );
  if (alreadyAsked) {
    return { ...session, currentQuestion: question };
  }
  const message: InterviewMessage = {
    id: createId("msg"),
    role: "interviewer",
    content: question.question,
    questionId: question.id,
    timestamp: nowIso(),
  };
  return {
    ...session,
    currentQuestion: question,
    transcript: [...session.transcript, message],
  };
}

export async function evaluateAnswer(raw: unknown): Promise<InterviewAnswerData> {
  const parsed = interviewAnswerInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid answer payload: ${parsed.error.issues[0]?.message || "validation failed"}`);
  }

  const session = getSession(parsed.data.sessionId);
  if (!session) {
    throw new Error("Interview session not found");
  }
  if (session.status === "completed") {
    throw new Error("Interview session is already completed");
  }

  const question =
    parsed.data.question ||
    session.currentQuestion ||
    session.plannedQuestions[session.currentQuestionIndex];

  if (!question) {
    throw new Error("No active interview question");
  }

  const answer = parsed.data.answer.trim();
  if (!answer) {
    throw new Error("Answer is required");
  }

  const followUpsUsed = session.followUpsForCurrentOriginal;
  const remainingOriginals =
    session.plannedQuestions.length - (session.originalsCompleted + 1);

  let data: InterviewAnswerData;
  let source: "ai" | "mock" = "mock";

  if (isAiConfigured()) {
    try {
      const prompts = buildEvaluationPrompts({
        candidate: session.candidate,
        research: session.research,
        question,
        answer,
        followUpsUsed,
        originalsCompleted: session.originalsCompleted,
        remainingOriginals: Math.max(0, remainingOriginals),
      });
      const ai = await generateJson({
        system: prompts.system,
        user: prompts.user,
        schema: evaluationAiSchema,
      });

      let nextAction = ai.nextAction;
      let nextQuestion: InterviewQuestion | null = ai.followUpQuestion ?? null;

      if (nextAction === "follow_up" && followUpsUsed >= 2) {
        nextAction = remainingOriginals > 0 ? "next_question" : "complete";
        nextQuestion = null;
      }

      if (nextAction === "follow_up" && !nextQuestion) {
        nextQuestion = {
          id: createId("q_follow"),
          question: `Can you give a concrete example and result for: "${question.question}"?`,
          category: "follow_up",
          difficulty: question.difficulty,
          reasoning: "Fallback follow-up when AI omitted followUpQuestion.",
        };
      }

      if (nextAction === "next_question") {
        const upcoming = session.plannedQuestions[session.originalsCompleted + 1];
        nextQuestion = upcoming ?? null;
        if (!upcoming) nextAction = "complete";
      }

      if (nextAction === "complete") {
        nextQuestion = null;
      }

      data = {
        evaluation: ai.evaluation,
        nextAction,
        nextQuestion,
        isComplete: nextAction === "complete",
        currentQuestionIndex: session.originalsCompleted,
        status: nextAction === "complete" ? "completed" : "active",
        source: "ai",
      };
      source = "ai";
    } catch {
      data = evaluateAnswerFallback({
        answer,
        followUpsUsed,
        remainingOriginals: Math.max(0, remainingOriginals),
        question,
      });
    }
  } else {
    data = evaluateAnswerFallback({
      answer,
      followUpsUsed,
      remainingOriginals: Math.max(0, remainingOriginals),
      question,
    });
  }

  let updated = appendTranscript(session, question);
  const candidateMessage: InterviewMessage = {
    id: createId("msg"),
    role: "candidate",
    content: answer,
    questionId: question.id,
    timestamp: nowIso(),
  };

  updated = {
    ...updated,
    source,
    transcript: [...updated.transcript, candidateMessage],
    answers: [
      ...updated.answers,
      {
        questionId: question.id,
        question,
        answer,
        evaluation: data.evaluation,
        isFollowUp: question.category === "follow_up",
        createdAt: nowIso(),
      },
    ],
  };

  if (data.nextAction === "follow_up" && data.nextQuestion) {
    updated = {
      ...updated,
      followUpsForCurrentOriginal: followUpsUsed + 1,
      currentQuestion: data.nextQuestion,
      currentQuestionIndex: updated.originalsCompleted,
      status: "active",
    };
    data = {
      ...data,
      currentQuestionIndex: updated.currentQuestionIndex,
      status: "active",
      source,
    };
  } else if (data.nextAction === "next_question" && data.nextQuestion) {
    const nextIndex = session.originalsCompleted + 1;
    updated = {
      ...updated,
      originalsCompleted: nextIndex,
      followUpsForCurrentOriginal: 0,
      currentQuestionIndex: nextIndex,
      currentQuestion: data.nextQuestion,
      status: "active",
    };
    data = {
      ...data,
      currentQuestionIndex: nextIndex,
      status: "active",
      source,
    };
  } else {
    updated = {
      ...updated,
      originalsCompleted: session.plannedQuestions.length,
      currentQuestionIndex: session.plannedQuestions.length,
      currentQuestion: null,
      status: "completed",
      completedAt: nowIso(),
      followUpsForCurrentOriginal: 0,
    };
    data = {
      ...data,
      nextAction: "complete",
      nextQuestion: null,
      isComplete: true,
      currentQuestionIndex: updated.currentQuestionIndex,
      status: "completed",
      source,
    };
  }

  saveSession(updated);
  return data;
}
