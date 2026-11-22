/** Evidence-based answer evaluation and adaptive follow-up. */
import type { InterviewAnswerRequest, InterviewAnswerResponse } from "@/types";

export async function evaluateAnswer(
  input: InterviewAnswerRequest,
): Promise<InterviewAnswerResponse> {
  const answer = input.answer.trim();
  const wordCount = answer.split(/\s+/).filter(Boolean).length;
  const hasEvidence = /\b(result|impact|improv|reduced|increased|measured|because|trade-off|example)\b/i.test(answer);
  const rating = wordCount < 8
    ? "incomplete"
    : wordCount < 25
      ? "vague"
      : hasEvidence
        ? "strong"
        : "adequate";
  const feedback = rating === "strong"
    ? "Your answer included enough detail and evidence to make the approach credible."
    : rating === "adequate"
      ? "The answer addressed the question. Add a concrete example, trade-off, and measurable result to make it stronger."
      : rating === "vague"
        ? "The direction is useful but too general. Explain what you personally did and what changed."
        : "The answer needs more detail. Use a situation, action, and result rather than a short statement.";
  const shouldFollowUp = rating === "incomplete" || rating === "vague";
  const answeredCount = input.transcript.filter((message) => message.role === "candidate").length + 1;
  const isComplete = answeredCount >= 5 && !shouldFollowUp;
  const followUp = shouldFollowUp
    ? {
        id: crypto.randomUUID(),
        question: "Can you make that answer more concrete by describing your specific action and the result?",
        category: "follow_up",
        difficulty: input.question.difficulty,
        reasoning: "The previous answer was short or lacked a concrete example.",
      }
    : null;

  return {
    evaluation: { rating, feedback },
    followUp,
    nextQuestion: shouldFollowUp || isComplete ? null : {
      id: crypto.randomUUID(),
      question: "What trade-offs did you consider, and how did you validate that your solution worked?",
      category: "adaptive_follow_up",
      difficulty: input.question.difficulty,
      reasoning: "Builds on the candidate's answer by probing decision quality and validation.",
    },
    isComplete,
  };
}
