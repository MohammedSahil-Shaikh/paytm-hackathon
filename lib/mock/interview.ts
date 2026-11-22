import type { InterviewQuestion, InterviewReport } from "@/types";

export const mockQuestions: InterviewQuestion[] = [
  {
    id: "q_001",
    question:
      "How would you design a reliable payment status API for merchants at Paytm?",
    category: "technical",
    difficulty: "medium",
    reasoning: "Role and company relevant API design question.",
  },
  {
    id: "q_002",
    question:
      "Tell me about a time you shipped under ambiguity with stakeholders.",
    category: "behavioral",
    difficulty: "medium",
    reasoning: "Checks ownership and communication.",
  },
  {
    id: "q_003",
    question:
      "UPI checkout latency spikes during peak traffic. How do you diagnose and mitigate?",
    category: "problem_solving",
    difficulty: "hard",
    reasoning: "Company-contextual incident reasoning.",
  },
  {
    id: "q_004",
    question:
      "Which Backend Engineer requirements at Paytm map strongest to your experience?",
    category: "role_company",
    difficulty: "easy",
    reasoning: "Role fit and self-awareness.",
  },
  {
    id: "q_005",
    question:
      "How would you introduce Kafka into a payment event pipeline safely?",
    category: "technical",
    difficulty: "hard",
    reasoning: "Targets a likely skill gap.",
  },
];

export const mockReport: InterviewReport = {
  overallSummary:
    "Jordan showed solid API thinking and clear communication, with room to grow in streaming and incident leadership.",
  strengths: ["API design fundamentals", "Structured explanations", "Product awareness"],
  improvementAreas: ["Event-driven systems", "Deeper production incident stories"],
  skillAnalysis: [
    {
      skill: "API design",
      level: "strong",
      feedback: "Described contracts, failure modes, and monitoring clearly.",
    },
    {
      skill: "Kafka / streaming",
      level: "developing",
      feedback: "Needed more concrete rollout and consumer failure handling detail.",
    },
  ],
  answerFeedback: [
    {
      question: mockQuestions[0].question,
      answerSummary: "Outlined idempotency, status machine, and retries.",
      feedback: "Strong structure. Add concrete SLA and observability examples.",
      suggestedAnswerApproach:
        "State requirements, propose API shape, cover failure modes, then monitoring.",
    },
  ],
  recommendations: [
    "Practice designing event-driven payment workflows",
    "Prepare one deep production incident narrative",
  ],
};
