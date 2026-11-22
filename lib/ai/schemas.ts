import { z } from "zod";

export const candidateInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.union([z.string().trim().email(), z.literal("")]).optional(),
  resumeText: z.string().max(50_000).optional().or(z.literal("")),
  skills: z.array(z.string()).optional().default([]),
  experience: z.array(z.string()).optional().default([]),
  strengths: z.array(z.string()).optional().default([]),
  skillGaps: z.array(z.string()).optional().default([]),
  targetRole: z.string().trim().min(1).max(200),
  targetCompany: z.string().trim().min(1).max(200),
});

export const researchInputSchema = z.object({
  company: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(200),
  overview: z.string().default(""),
  jobRequirements: z.array(z.string()).default([]),
  recentNews: z
    .array(
      z.object({
        title: z.string(),
        summary: z.string(),
        url: z.string(),
      }),
    )
    .default([]),
  insights: z.array(z.string()).default([]),
  sources: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
        provider: z.enum(["serpapi", "you", "mock"]),
      }),
    )
    .default([]),
});

export const interviewStartInputSchema = z.object({
  candidate: candidateInputSchema,
  research: researchInputSchema,
  jobDescription: z.string().max(20_000).optional().default(""),
});

export const interviewQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(8),
  category: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  reasoning: z.string().min(1),
  sourceIds: z.array(z.string()).optional(),
});

export const interviewQuestionsAiSchema = z.object({
  questions: z.array(interviewQuestionSchema).length(5),
});

export const answerEvaluationSchema = z.object({
  quality: z.enum(["strong", "good", "partial", "weak"]),
  score: z.number().min(0).max(100),
  feedback: z.string().min(1),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  topicsToProbe: z.array(z.string()),
});

export const evaluationAiSchema = z.object({
  evaluation: answerEvaluationSchema,
  nextAction: z.enum(["follow_up", "next_question", "complete"]),
  followUpQuestion: interviewQuestionSchema.nullable(),
});

export const interviewAnswerInputSchema = z.object({
  sessionId: z.string().min(1),
  question: interviewQuestionSchema.optional(),
  answer: z.string().max(20_000),
  transcript: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(["interviewer", "candidate"]),
        content: z.string(),
        questionId: z.string().optional(),
        timestamp: z.string(),
      }),
    )
    .optional()
    .default([]),
});

export const interviewFinishInputSchema = z.object({
  sessionId: z.string().min(1),
});

export const interviewReportAiSchema = z.object({
  overallSummary: z.string().min(1),
  strengths: z.array(z.string()),
  improvementAreas: z.array(z.string()),
  skillAnalysis: z.array(
    z.object({
      skill: z.string(),
      level: z.string(),
      feedback: z.string(),
    }),
  ),
  answerFeedback: z.array(
    z.object({
      question: z.string(),
      answerSummary: z.string(),
      feedback: z.string(),
      suggestedAnswerApproach: z.string(),
    }),
  ),
  recommendations: z.array(z.string()),
});

export const onboardingInputSchema = z.object({
  candidate: candidateInputSchema,
  research: researchInputSchema,
  report: interviewReportAiSchema,
});

export const onboardingAiSchema = z.object({
  employeeName: z.string(),
  company: z.string(),
  role: z.string(),
  phases: z
    .array(
      z.object({
        period: z.enum(["Days 1-30", "Days 31-60", "Days 61-90"]),
        goals: z.array(z.string()),
        tasks: z.array(z.string()),
        milestones: z.array(z.string()),
      }),
    )
    .length(3),
});

export const hrAssistantInputSchema = z.object({
  question: z.string().trim().min(1).max(2000),
  company: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(200),
  policyContext: z.string().max(20_000).optional().default(""),
  onboardingContext: z.string().max(20_000).optional().default(""),
});

export const hrAssistantAiSchema = z.object({
  answer: z.string().min(1),
  sources: z.array(z.string()),
  verified: z.boolean(),
});
