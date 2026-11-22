/** Evidence-based interview report generation. */
import type {
  CandidateProfile,
  InterviewMessage,
  InterviewQuestion,
  InterviewReport,
} from "@/types";

export async function generateInterviewReport(input: {
  candidate: CandidateProfile;
  questions: InterviewQuestion[];
  transcript: InterviewMessage[];
}): Promise<InterviewReport> {
  const answers = input.transcript.filter((message) => message.role === "candidate");
  const detailedAnswers = answers.filter((answer) => answer.content.trim().split(/\s+/).length >= 25);
  const strongestAnswer = detailedAnswers[0]?.content ?? answers[0]?.content ?? "No answer was recorded.";
  const hasTechnicalQuestion = input.questions.some((question) => question.category === "technical");

  return {
    overallSummary: `${input.candidate.name} completed an interview for ${input.candidate.targetRole} with ${answers.length} recorded answer${answers.length === 1 ? "" : "s"}. The strongest evidence came from: “${strongestAnswer.slice(0, 180)}${strongestAnswer.length > 180 ? "…" : ""}”`,
    strengths: [
      ...(detailedAnswers.length > 0 ? ["Explains decisions with useful detail"] : []),
      ...(answers.length > 0 ? ["Engaged with the interview prompts"] : []),
      ...(input.candidate.skills.length > 0 ? [`Relevant skills: ${input.candidate.skills.slice(0, 3).join(", ")}`] : []),
    ],
    improvementAreas: [
      ...(detailedAnswers.length < answers.length ? ["Use concrete examples and measurable outcomes"] : []),
      ...(hasTechnicalQuestion ? ["Make technical trade-offs, failure modes, and validation steps explicit"] : []),
      "Connect answers more directly to the target role's responsibilities",
    ],
    skillAnalysis: [
      {
        skill: "Communication",
        level: detailedAnswers.length > 0 ? "developing" : "needs evidence",
        feedback: detailedAnswers.length > 0 ? "At least one answer included enough detail to explain reasoning." : "More complete examples are needed to assess communication reliably.",
      },
      {
        skill: "Problem solving",
        level: answers.length > 0 ? "developing" : "not assessed",
        feedback: "Assessment should be strengthened with explicit constraints, decisions, and outcomes.",
      },
    ],
    answerFeedback: input.questions.slice(0, answers.length).map((question, index) => {
      const answer = answers[index];
      return {
        question: question.question,
        answerSummary: answer ? answer.content.slice(0, 180) : "No answer recorded.",
        feedback: answer && answer.content.split(/\s+/).length >= 25
          ? "The response had enough detail to discuss; add measurable impact where possible."
          : "The response was too brief to support a confident assessment.",
        suggestedAnswerApproach: "Use context, your specific action, technical or collaboration trade-offs, and the result.",
      };
    }),
    recommendations: [
      "Practice STAR-style answers with concrete outcomes.",
      "For technical questions, state assumptions, failure modes, and how you would validate the design.",
    ],
  };
}
