export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  reasoning: string;
  sourceIds?: string[];
}

export interface InterviewMessage {
  id: string;
  role: "interviewer" | "candidate";
  content: string;
  questionId?: string;
  timestamp: string;
}

export interface InterviewReport {
  overallSummary: string;
  strengths: string[];
  improvementAreas: string[];
  skillAnalysis: {
    skill: string;
    level: string;
    feedback: string;
  }[];
  answerFeedback: {
    question: string;
    answerSummary: string;
    feedback: string;
    suggestedAnswerApproach: string;
  }[];
  recommendations: string[];
}

export interface InterviewStartRequest {
  candidate: import("./candidate").CandidateProfile;
  research: import("./research").ResearchData;
  jobDescription?: string;
}

export interface InterviewStartResponse {
  sessionId: string;
  questions: InterviewQuestion[];
}

export interface InterviewAnswerRequest {
  sessionId: string;
  question: InterviewQuestion;
  answer: string;
  transcript: InterviewMessage[];
}

export interface InterviewAnswerResponse {
  evaluation: {
    rating: "strong" | "adequate" | "weak" | "vague" | "incomplete" | "incorrect";
    feedback: string;
  };
  nextQuestion: InterviewQuestion | null;
  followUp: InterviewQuestion | null;
  isComplete: boolean;
}
