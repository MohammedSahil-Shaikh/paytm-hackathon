import type { CandidateProfile, ResearchData } from "@/types";
import { truncateText } from "@/lib/ai/utils";

export function buildInterviewStartPrompts(input: {
  candidate: CandidateProfile;
  research: ResearchData;
  jobDescription: string;
}): { system: string; user: string } {
  const system = `You are DayZero's interview engine.
Generate exactly 5 personalized interview questions.
Distribution required:
1) foundational
2) technical
3) technical (or role-specific)
4) problem_solving
5) behavioral (or situational)

Rules:
- Tailor to candidate skills, experience, resume, role, company research, and job requirements.
- Avoid generic prompts like "Tell me about yourself" unless clearly justified.
- Keep questions concrete and answerable.
- Return strict JSON only.`;

  const user = `Candidate:
${JSON.stringify(
  {
    name: input.candidate.name,
    skills: input.candidate.skills,
    experience: input.candidate.experience,
    strengths: input.candidate.strengths,
    skillGaps: input.candidate.skillGaps,
    targetRole: input.candidate.targetRole,
    targetCompany: input.candidate.targetCompany,
    resumeText: truncateText(input.candidate.resumeText ?? "", 4000),
  },
  null,
  2,
)}

Research:
${JSON.stringify(
  {
    company: input.research.company,
    role: input.research.role,
    overview: truncateText(input.research.overview, 1200),
    jobRequirements: input.research.jobRequirements,
    insights: input.research.insights.slice(0, 8),
    recentNews: input.research.recentNews.slice(0, 3),
  },
  null,
  2,
)}

Job description:
${truncateText(input.jobDescription || "Not provided", 2000)}

Return JSON:
{
  "questions": [
    {
      "id": "q_001",
      "question": "...",
      "category": "foundational|technical|problem_solving|behavioral|situational|role_company",
      "difficulty": "easy|medium|hard",
      "reasoning": "short rationale"
    }
  ]
}`;

  return { system, user };
}

export function buildEvaluationPrompts(input: {
  candidate: CandidateProfile;
  research: ResearchData;
  question: { id: string; question: string; category: string; difficulty: string };
  answer: string;
  followUpsUsed: number;
  originalsCompleted: number;
  remainingOriginals: number;
}): { system: string; user: string } {
  const system = `You are DayZero's adaptive interview evaluator.
Evaluate the candidate answer with evidence.
Decide nextAction:
- follow_up (if vague/partial/weak and follow-ups used < 2)
- next_question (move on)
- complete (if interview should end)

Quality must be one of: strong | good | partial | weak
Score 0-100 based on evidence.
Return strict JSON only.`;

  const user = `Candidate role: ${input.candidate.targetRole} at ${input.candidate.targetCompany}
Skills: ${input.candidate.skills.join(", ") || "n/a"}
Company insights: ${input.research.insights.slice(0, 5).join("; ") || "n/a"}

Current question:
${JSON.stringify(input.question)}

Candidate answer:
${truncateText(input.answer, 3000)}

Follow-ups already used for this original question: ${input.followUpsUsed}
Original questions completed: ${input.originalsCompleted}
Remaining planned original questions: ${input.remainingOriginals}

Return JSON:
{
  "evaluation": {
    "quality": "strong|good|partial|weak",
    "score": 0,
    "feedback": "...",
    "strengths": ["..."],
    "gaps": ["..."],
    "topicsToProbe": ["..."]
  },
  "nextAction": "follow_up|next_question|complete",
  "followUpQuestion": {
    "id": "q_follow_001",
    "question": "...",
    "category": "follow_up",
    "difficulty": "easy|medium|hard",
    "reasoning": "..."
  }
}
If nextAction is not follow_up, set followUpQuestion to null.`;

  return { system, user };
}

export function buildReportPrompts(input: {
  candidate: CandidateProfile;
  research: ResearchData;
  transcript: { role: string; content: string; questionId?: string }[];
  answers: {
    question: string;
    answer: string;
    evaluation: {
      quality: string;
      score: number;
      feedback: string;
      strengths: string[];
      gaps: string[];
    };
  }[];
}): { system: string; user: string } {
  const system = `You are DayZero's interview report generator.
Create an evidence-based InterviewReport from actual answers only.
Do not invent experience or achievements.
Return strict JSON only.`;

  const user = `Candidate: ${JSON.stringify({
    name: input.candidate.name,
    role: input.candidate.targetRole,
    company: input.candidate.targetCompany,
    skills: input.candidate.skills,
  })}

Answers and evaluations:
${JSON.stringify(input.answers)}

Transcript summary:
${JSON.stringify(input.transcript.slice(-30))}

Return JSON matching:
{
  "overallSummary": "...",
  "strengths": ["..."],
  "improvementAreas": ["..."],
  "skillAnalysis": [{"skill":"...","level":"...","feedback":"..."}],
  "answerFeedback": [{"question":"...","answerSummary":"...","feedback":"...","suggestedAnswerApproach":"..."}],
  "recommendations": ["..."]
}`;

  return { system, user };
}

export function buildOnboardingPrompts(input: {
  candidate: CandidateProfile;
  research: ResearchData;
  report: unknown;
}): { system: string; user: string } {
  const system = `You are DayZero's onboarding planner.
Create a personalized 30/60/90 onboarding plan linked to interview strengths and gaps.
Tasks must be practical and specific to the role and company.
Return strict JSON only.`;

  const user = `Candidate: ${JSON.stringify(input.candidate)}
Research: ${JSON.stringify({
    company: input.research.company,
    role: input.research.role,
    overview: truncateText(input.research.overview, 800),
    jobRequirements: input.research.jobRequirements,
  })}
Interview report: ${JSON.stringify(input.report)}

Return JSON:
{
  "employeeName": "...",
  "company": "...",
  "role": "...",
  "phases": [
    {
      "period": "Days 1-30",
      "goals": ["..."],
      "tasks": ["..."],
      "milestones": ["..."]
    },
    {
      "period": "Days 31-60",
      "goals": ["..."],
      "tasks": ["..."],
      "milestones": ["..."]
    },
    {
      "period": "Days 61-90",
      "goals": ["..."],
      "tasks": ["..."],
      "milestones": ["..."]
    }
  ]
}`;

  return { system, user };
}

export function buildHrAssistantPrompts(input: {
  question: string;
  company: string;
  role: string;
  policyContext: string;
  onboardingContext: string;
}): { system: string; user: string } {
  const system = `You are DayZero's HR onboarding assistant.
Answer using only provided policy/onboarding context.
If policy details are missing, clearly say you do not have verified information.
Never invent leave, salary, benefits, or work timings.
Format the answer field as readable markdown with short headings (## / ###), short paragraphs, and bullet lists (- item).
Do not return one long dense paragraph.
Return strict JSON only.`;

  const user = `Company: ${input.company}
Role: ${input.role}
Policy context:
${truncateText(input.policyContext || "None provided", 3000)}

Onboarding context:
${truncateText(input.onboardingContext || "None provided", 3000)}

Employee question:
${truncateText(input.question, 1000)}

Return JSON:
{
  "answer": "## Heading\\n\\nShort intro.\\n\\n### Section\\n- bullet\\n- bullet",
  "sources": ["policy|onboarding|none"],
  "verified": true
}`;

  return { system, user };
}
