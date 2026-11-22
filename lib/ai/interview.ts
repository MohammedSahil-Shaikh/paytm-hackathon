/** Context-aware interview generation with a deterministic demo fallback. */
import type { InterviewQuestion, InterviewStartRequest, InterviewStartResponse } from "@/types";

export async function startInterview(
  input: InterviewStartRequest,
): Promise<InterviewStartResponse> {
  const role = input.candidate.targetRole || input.research.role;
  const company = input.candidate.targetCompany || input.research.company;
  const requirements = input.research.jobRequirements.slice(0, 2).join(" and ");
  const questions: InterviewQuestion[] = [
    {
      id: crypto.randomUUID(),
      question: `How would you approach the most important responsibilities of a ${role} at ${company}?`,
      category: "role_company",
      difficulty: "medium",
      reasoning: `Uses the target role and researched requirements: ${requirements || "core role fundamentals"}.`,
    },
    {
      id: crypto.randomUUID(),
      question: `Describe a project where you solved a difficult technical or operational problem. What did you change and what was the result?`,
      category: "problem_solving",
      difficulty: "medium",
      reasoning: "Looks for a concrete situation, actions, trade-offs, and evidence of impact.",
    },
    {
      id: crypto.randomUUID(),
      question: `Design a reliable solution related to ${requirements || `${role} systems`}. What failure modes and monitoring would you consider?`,
      category: "technical",
      difficulty: "hard",
      reasoning: "Tests technical depth against the researched role requirements.",
    },
    {
      id: crypto.randomUUID(),
      question: "Tell me about a time you received difficult feedback or had to work through disagreement with a teammate.",
      category: "behavioral",
      difficulty: "medium",
      reasoning: "Evaluates communication, ownership, and reflection.",
    },
    {
      id: crypto.randomUUID(),
      question: `What would you want to learn in your first 90 days in this ${role} position?`,
      category: "growth",
      difficulty: "easy",
      reasoning: "Connects interview readiness to the later onboarding plan.",
    },
  ];

  return { sessionId: `sess_${crypto.randomUUID().slice(0, 8)}`, questions };
}
