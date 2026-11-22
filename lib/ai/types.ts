import type {
  CandidateProfile,
  InterviewMessage,
  InterviewQuestion,
  InterviewReport,
  ResearchData,
} from "@/types";

export type AiSource = "ai" | "mock";

export type InterviewStatus = "created" | "active" | "completed";

export interface AnswerEvaluation {
  quality: "strong" | "good" | "partial" | "weak";
  score: number;
  feedback: string;
  strengths: string[];
  gaps: string[];
  topicsToProbe: string[];
}

export interface StoredAnswer {
  questionId: string;
  question: InterviewQuestion;
  answer: string;
  evaluation: AnswerEvaluation;
  isFollowUp: boolean;
  parentQuestionId?: string;
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  candidate: CandidateProfile;
  research: ResearchData;
  jobDescription: string;
  plannedQuestions: InterviewQuestion[];
  currentQuestionIndex: number;
  currentQuestion: InterviewQuestion | null;
  answers: StoredAnswer[];
  transcript: InterviewMessage[];
  followUpsForCurrentOriginal: number;
  originalsCompleted: number;
  status: InterviewStatus;
  source: AiSource;
  startedAt: string;
  completedAt?: string;
  report?: InterviewReport;
}

export interface InterviewStartData {
  sessionId: string;
  candidate: CandidateProfile;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  currentQuestion: InterviewQuestion;
  status: InterviewStatus;
  source: AiSource;
}

export type NextInterviewAction = "follow_up" | "next_question" | "complete";

export interface InterviewAnswerData {
  evaluation: AnswerEvaluation;
  nextAction: NextInterviewAction;
  nextQuestion: InterviewQuestion | null;
  isComplete: boolean;
  currentQuestionIndex: number;
  status: InterviewStatus;
  source: AiSource;
}

export interface ApiErrorBody {
  code: string;
  message: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: ApiErrorBody | null;
}
