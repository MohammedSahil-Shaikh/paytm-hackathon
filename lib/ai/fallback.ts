import type {
  AnswerEvaluation,
  InterviewAnswerData,
  InterviewStartData,
} from "@/lib/ai/types";
import type {
  CandidateProfile,
  HrAssistantResponse,
  InterviewQuestion,
  InterviewReport,
  OnboardingPlan,
  ResearchData,
} from "@/types";
import { createId } from "@/lib/ai/utils";

function primarySkill(candidate: CandidateProfile, research: ResearchData): string {
  return (
    candidate.skills[0] ||
    research.jobRequirements[0] ||
    "core fundamentals"
  );
}

function secondarySkill(candidate: CandidateProfile, research: ResearchData): string {
  return (
    candidate.skills[1] ||
    research.jobRequirements[1] ||
    candidate.skillGaps[0] ||
    "system design"
  );
}

export function buildFallbackQuestions(
  candidate: CandidateProfile,
  research: ResearchData,
): InterviewQuestion[] {
  const company = research.company || candidate.targetCompany;
  const role = research.role || candidate.targetRole;
  const skill = primarySkill(candidate, research);
  const skill2 = secondarySkill(candidate, research);
  const requirement = research.jobRequirements[0] || skill;
  const insight = research.insights[0] || `${company} product reliability`;

  return [
    {
      id: "q_001",
      question: `What foundational concepts for a ${role} role at ${company} do you rely on most when starting a new feature involving ${skill}?`,
      category: "foundational",
      difficulty: "easy",
      reasoning: `Foundational check anchored on ${skill} for ${role}.`,
    },
    {
      id: "q_002",
      question: `Walk through how you would design and implement a production feature using ${skill} for ${role} work at ${company}. Include interfaces, failure modes, and validation.`,
      category: "technical",
      difficulty: "medium",
      reasoning: `Role-specific technical depth on ${skill}.`,
    },
    {
      id: "q_003",
      question: `Given the requirement "${requirement}", how would you apply ${skill2} to deliver a maintainable solution for ${company}?`,
      category: "technical",
      difficulty: "medium",
      reasoning: `Second technical probe tied to job requirements.`,
    },
    {
      id: "q_004",
      question: `${company} faces pressure around "${insight}". As a ${role}, how would you diagnose the issue, prioritize mitigations, and measure recovery using ${skill}?`,
      category: "problem_solving",
      difficulty: "hard",
      reasoning: "Company-contextual problem solving using research insights.",
    },
    {
      id: "q_005",
      question: `Tell me about a time you had to deliver under ambiguity while collaborating with stakeholders on a ${role}-related initiative. What trade-offs did you communicate?`,
      category: "behavioral",
      difficulty: "medium",
      reasoning: "Behavioral ownership and communication under ambiguity.",
    },
  ];
}

export function buildFallbackStartData(input: {
  sessionId: string;
  candidate: CandidateProfile;
  research: ResearchData;
}): InterviewStartData {
  const questions = buildFallbackQuestions(input.candidate, input.research);
  return {
    sessionId: input.sessionId,
    candidate: input.candidate,
    questions,
    currentQuestionIndex: 0,
    currentQuestion: questions[0],
    status: "active",
    source: "mock",
  };
}

export function evaluateAnswerFallback(input: {
  answer: string;
  followUpsUsed: number;
  remainingOriginals: number;
  question: InterviewQuestion;
}): InterviewAnswerData {
  const answer = input.answer.trim();
  const length = answer.length;
  let quality: AnswerEvaluation["quality"] = "partial";
  let score = 62;

  if (!answer) {
    quality = "weak";
    score = 15;
  } else if (length < 80) {
    quality = "weak";
    score = 40;
  } else if (length < 180) {
    quality = "partial";
    score = 65;
  } else if (length < 400) {
    quality = "good";
    score = 78;
  } else {
    quality = "strong";
    score = 88;
  }

  const evaluation: AnswerEvaluation = {
    quality,
    score,
    feedback:
      quality === "strong"
        ? "Clear and detailed response with practical structure."
        : quality === "good"
          ? "Solid answer with room for more concrete evidence."
          : quality === "partial"
            ? "Understands the basics but misses important depth."
            : "Answer is too thin or incomplete for this question.",
    strengths:
      quality === "weak"
        ? []
        : ["Attempted to address the question directly"],
    gaps:
      quality === "strong"
        ? ["Could add measurable outcomes"]
        : ["Needs concrete examples", "Needs clearer trade-offs"],
    topicsToProbe:
      quality === "strong" ? ["edge cases", "tradeoffs"] : ["examples", "implementation details"],
  };

  const canFollowUp =
    input.followUpsUsed < 2 &&
    (quality === "weak" || quality === "partial");

  if (canFollowUp) {
    return {
      evaluation,
      nextAction: "follow_up",
      nextQuestion: {
        id: createId("q_follow"),
        question:
          quality === "weak"
            ? `Can you share a specific example from your work related to: "${input.question.question}"?`
            : `What did you personally implement, and how did you handle edge cases for: "${input.question.question}"?`,
        category: "follow_up",
        difficulty: "medium",
        reasoning: "Mock adaptive follow-up based on answer quality.",
      },
      isComplete: false,
      currentQuestionIndex: 0,
      status: "active",
      source: "mock",
    };
  }

  if (input.remainingOriginals <= 0) {
    return {
      evaluation,
      nextAction: "complete",
      nextQuestion: null,
      isComplete: true,
      currentQuestionIndex: 0,
      status: "completed",
      source: "mock",
    };
  }

  return {
    evaluation,
    nextAction: "next_question",
    nextQuestion: null,
    isComplete: false,
    currentQuestionIndex: 0,
    status: "active",
    source: "mock",
  };
}

export function buildFallbackReport(
  candidate: CandidateProfile,
  answers: { question: string; answer: string; evaluation: AnswerEvaluation }[],
): InterviewReport {
  const avg =
    answers.length === 0
      ? 0
      : Math.round(
          answers.reduce((sum, item) => sum + item.evaluation.score, 0) /
            answers.length,
        );

  const strengths = Array.from(
    new Set(answers.flatMap((item) => item.evaluation.strengths)),
  ).slice(0, 5);
  const gaps = Array.from(
    new Set(answers.flatMap((item) => item.evaluation.gaps)),
  ).slice(0, 5);

  return {
    overallSummary: `${candidate.name} completed a ${candidate.targetRole} interview for ${candidate.targetCompany} with an average evidence score of ${avg}/100. This report is mock-generated from actual answer evaluations because the live AI provider was unavailable.`,
    strengths: strengths.length
      ? strengths
      : ["Participated fully in the interview"],
    improvementAreas: gaps.length
      ? gaps
      : ["Provide more concrete implementation detail"],
    skillAnalysis: [
      {
        skill: candidate.skills[0] || candidate.targetRole,
        level: avg >= 75 ? "strong" : avg >= 55 ? "developing" : "needs_work",
        feedback:
          avg >= 75
            ? "Responses showed practical understanding with clear structure."
            : "Responses need more depth and concrete examples.",
      },
      ...candidate.skillGaps.slice(0, 2).map((skill) => ({
        skill,
        level: "needs_work",
        feedback: `Interview signals suggest continued practice on ${skill}.`,
      })),
    ],
    answerFeedback: answers.map((item) => ({
      question: item.question,
      answerSummary: item.answer.slice(0, 160) || "No answer provided",
      feedback: item.evaluation.feedback,
      suggestedAnswerApproach:
        "State the goal, describe your approach, cover edge cases, and share a concrete example.",
    })),
    recommendations: [
      ...gaps.slice(0, 2).map((gap) => `Practice and document a real example for: ${gap}`),
      `Build a small ${candidate.targetRole} project aligned to ${candidate.targetCompany} requirements`,
    ],
  };
}

export function buildFallbackOnboarding(
  candidate: CandidateProfile,
  research: ResearchData,
  report: InterviewReport,
): OnboardingPlan {
  const gap =
    candidate.skillGaps[0] ||
    report.skillAnalysis.find((item) => item.level !== "strong")?.skill ||
    report.improvementAreas[0] ||
    "core fundamentals";
  const strength =
    candidate.skills[0] ||
    report.skillAnalysis.find((item) => item.level === "strong")?.skill ||
    report.strengths[0] ||
    "existing strengths";
  const company = research.company || candidate.targetCompany;
  const role = research.role || candidate.targetRole;

  return {
    employeeName: candidate.name,
    company,
    role,
    phases: [
      {
        period: "Days 1-30",
        goals: [
          `Learn ${company} products, team rituals, and ${role} workflows`,
          `Close foundational gaps in ${gap}`,
        ],
        tasks: [
          `Read onboarding docs and map ${company} systems used by ${role}`,
          `Complete a focused learning sprint on ${gap}`,
          `Shadow a teammate on a task involving ${strength}`,
        ],
        milestones: ["Dev/setup complete", `Demonstrates baseline competence in ${gap}`],
      },
      {
        period: "Days 31-60",
        goals: [
          "Contribute to guided production work",
          `Apply ${gap} skills on a real ticket`,
        ],
        tasks: [
          `Own a small guided feature using ${strength}`,
          `Implement a practical assignment targeting ${gap}`,
          "Pair on code review and write a short retro",
        ],
        milestones: ["First meaningful contribution merged"],
      },
      {
        period: "Days 61-90",
        goals: [
          "Take independent ownership",
          "Deliver measurable outcomes",
        ],
        tasks: [
          `Lead a ${role} task end-to-end at ${company}`,
          `Improve documentation/runbooks related to ${gap}`,
          "Set a 6-month growth plan with your manager",
        ],
        milestones: ["Independent ownership of a scoped deliverable"],
      },
    ],
  };
}

function extractBullets(section: string | undefined): string[] {
  if (!section?.trim()) return [];
  return section
    .split(/\n|;/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 8);
}

function formatContextAsMarkdown(onboarding: string, question: string): string {
  const insightsMatch = onboarding.match(/Insights:\s*([\s\S]*?)(?:\n\s*Requirements:|$)/i);
  const requirementsMatch = onboarding.match(/Requirements:\s*([\s\S]*?)(?:\n\s*[A-Z][a-z]+:|$)/i);
  const strengthsMatch = onboarding.match(/Strengths:\s*([\s\S]*?)(?:\n\s*Gaps:|$)/i);
  const gapsMatch = onboarding.match(/Gaps:\s*([\s\S]*?)(?:\n\s*Recommendations:|$)/i);
  const recommendationsMatch = onboarding.match(/Recommendations:\s*([\s\S]*?)$/i);
  const overviewMatch = onboarding.match(/Overview:\s*([\s\S]*?)(?:\n\s*Insights:|$)/i);
  const companyLine =
    onboarding.match(/Company research for (.+)/i)?.[1]?.trim() ||
    onboarding.match(/Candidate targeting (.+)/i)?.[1]?.trim() ||
    "your role";

  const insights = extractBullets(insightsMatch?.[1]);
  const requirements = extractBullets(requirementsMatch?.[1]);
  const strengths = extractBullets(strengthsMatch?.[1]);
  const gaps = extractBullets(gapsMatch?.[1]);
  const recommendations = extractBullets(recommendationsMatch?.[1]);
  const overview = overviewMatch?.[1]?.trim();

  const q = question.toLowerCase();
  const parts: string[] = [];

  if (q.includes("30") || q.includes("focus") || q.includes("onboarding") || q.includes("roadmap")) {
    parts.push(`## Days 1–30 focus`);
    parts.push("");
    parts.push(`For **${companyLine}**, start with the highest-leverage fundamentals from your DayZero context.`);
    parts.push("");
    if (insights.length) {
      parts.push("### Priority insights");
      parts.push(...insights.map((item) => `- ${item}`));
      parts.push("");
    }
    if (requirements.length) {
      parts.push("### Requirements to practice");
      parts.push(...requirements.map((item) => `- ${item}`));
      parts.push("");
    }
    if (recommendations.length) {
      parts.push("### Recommended next steps");
      parts.push(...recommendations.map((item) => `- ${item}`));
    } else {
      parts.push("### Recommended next steps");
      parts.push("- Map your first 2 weeks around one production-facing service or API area");
      parts.push("- Schedule a deep-dive with your mentor on local architecture and ownership boundaries");
      parts.push("- Keep a weekly checklist of reliability, testing, and delivery habits");
    }
    return parts.join("\n");
  }

  if (q.includes("gap") || q.includes("skill")) {
    parts.push("## Skill priorities");
    parts.push("");
    parts.push(`Based on your DayZero context for **${companyLine}**:`);
    parts.push("");
    if (gaps.length) {
      parts.push("### Gaps to close first");
      parts.push(...gaps.map((item) => `- ${item}`));
      parts.push("");
    }
    if (strengths.length) {
      parts.push("### Strengths to lean on");
      parts.push(...strengths.map((item) => `- ${item}`));
      parts.push("");
    }
    if (requirements.length) {
      parts.push("### Role requirements to emphasize");
      parts.push(...requirements.map((item) => `- ${item}`));
    }
    if (!gaps.length && !strengths.length && !requirements.length) {
      parts.push("- Review your interview report gaps once available");
      parts.push("- Align practice with the top role requirements from research");
    }
    return parts.join("\n");
  }

  parts.push("## From your DayZero context");
  parts.push("");
  parts.push(`Here is a structured read of what I have for **${companyLine}**.`);
  parts.push("");
  if (overview) {
    parts.push("### Overview");
    parts.push(overview.slice(0, 400));
    parts.push("");
  }
  if (insights.length) {
    parts.push("### Insights");
    parts.push(...insights.map((item) => `- ${item}`));
    parts.push("");
  }
  if (requirements.length) {
    parts.push("### Requirements");
    parts.push(...requirements.map((item) => `- ${item}`));
    parts.push("");
  }
  if (gaps.length) {
    parts.push("### Gaps");
    parts.push(...gaps.map((item) => `- ${item}`));
    parts.push("");
  }
  if (recommendations.length) {
    parts.push("### Recommendations");
    parts.push(...recommendations.map((item) => `- ${item}`));
  }
  if (parts.length <= 4) {
    parts.push("- Continue Setup → Research → Interview so I can give richer, verified guidance");
  }
  return parts.join("\n");
}

export function buildFallbackHrResponse(input: {
  question: string;
  policyContext?: string;
  onboardingContext?: string;
}): HrAssistantResponse {
  const policy = input.policyContext?.trim();
  const onboarding = input.onboardingContext?.trim();
  const q = input.question.toLowerCase();

  if (policy) {
    return {
      answer: [
        "## Policy context",
        "",
        "Based on the verified policy text you provided:",
        "",
        policy.slice(0, 700),
      ].join("\n"),
      sources: ["policy"],
      verified: true,
    };
  }

  if (
    onboarding &&
    (q.includes("roadmap") ||
      q.includes("onboarding") ||
      q.includes("task") ||
      q.includes("focus") ||
      q.includes("gap") ||
      q.includes("skill") ||
      q.includes("30") ||
      q.includes("60") ||
      q.includes("90"))
  ) {
    return {
      answer: formatContextAsMarkdown(onboarding, input.question),
      sources: ["onboarding"],
      verified: true,
    };
  }

  if (
    q.includes("leave") ||
    q.includes("policy") ||
    q.includes("salary") ||
    q.includes("benefit") ||
    q.includes("pto") ||
    q.includes("holiday")
  ) {
    return {
      answer: [
        "## No verified policy on file",
        "",
        "I do not have a verified company leave/policy document in context.",
        "",
        "### What I will not invent",
        "- Leave / PTO rules",
        "- Salary or benefits details",
        "- Work schedule / holiday calendars",
        "",
        "### What to do next",
        "- Ask your HR team for the official policy",
        "- Or add policy context so I can answer with verification",
      ].join("\n"),
      sources: [],
      verified: false,
    };
  }

  if (onboarding) {
    return {
      answer: formatContextAsMarkdown(onboarding, input.question),
      sources: ["onboarding"],
      verified: true,
    };
  }

  return {
    answer: [
      "## How I can help",
      "",
      "I can help with onboarding focus, interview gaps, and roadmap priorities once those are in your DayZero journey.",
      "",
      "### For policy questions",
      "- I need verified policy context",
      "- I will not invent leave, salary, benefits, or schedule details",
    ].join("\n"),
    sources: [],
    verified: false,
  };
}
