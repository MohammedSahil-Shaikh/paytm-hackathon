import type {
  CandidateProfile,
  CandidateRecord,
  InterviewQuestion,
  InterviewReport,
  OnboardingPlan,
  ResearchData,
} from "@/types";
import type { AnswerEvaluation } from "@/lib/ai/types";

const STORAGE_KEY = "dayzero.journey.v1";

export type JourneyState = {
  candidate: CandidateProfile | null;
  candidateId: string | null;
  jobDescription: string;
  research: ResearchData | null;
  sessionId: string | null;
  questions: InterviewQuestion[];
  currentQuestion: InterviewQuestion | null;
  currentQuestionIndex: number;
  lastEvaluation: AnswerEvaluation | null;
  interviewComplete: boolean;
  interviewSource: "ai" | "mock" | null;
  interviewStartedAt: string | null;
  proctorWarnings: number;
  report: InterviewReport | null;
  onboardingPlan: OnboardingPlan | null;
};

const emptyState = (): JourneyState => ({
  candidate: null,
  candidateId: null,
  jobDescription: "",
  research: null,
  sessionId: null,
  questions: [],
  currentQuestion: null,
  currentQuestionIndex: 0,
  lastEvaluation: null,
  interviewComplete: false,
  interviewSource: null,
  interviewStartedAt: null,
  proctorWarnings: 0,
  report: null,
  onboardingPlan: null,
});

export const defaultCandidate = (): CandidateProfile => ({
  name: "Jordan Lee",
  email: "jordan.lee@example.com",
  resumeText:
    "Backend engineer with Python, FastAPI, PostgreSQL, and Redis. Built payment APIs and merchant tooling.",
  skills: ["Python", "FastAPI", "PostgreSQL", "Redis", "System Design"],
  experience: ["3 years backend engineering", "Built checkout APIs"],
  strengths: ["API design", "Ownership"],
  skillGaps: ["Kafka"],
  targetRole: "Backend Engineer",
  targetCompany: "Paytm",
});

export function readJourney(): JourneyState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return { ...emptyState(), ...(JSON.parse(raw) as JourneyState) };
  } catch {
    return emptyState();
  }
}

export function writeJourney(patch: Partial<JourneyState>): JourneyState {
  const next = { ...readJourney(), ...patch };
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearJourney(): void {
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function ensureCandidate(): CandidateProfile {
  const state = readJourney();
  if (state.candidate) return state.candidate;
  const candidate = defaultCandidate();
  writeJourney({ candidate });
  return candidate;
}

export function ensureResearch(candidate?: CandidateProfile): ResearchData {
  const state = readJourney();
  if (state.research) return state.research;
  const profile = candidate || ensureCandidate();
  const research: ResearchData = {
    company: profile.targetCompany,
    role: profile.targetRole,
    overview: `${profile.targetCompany} context will be enriched by research/interview services.`,
    jobRequirements: profile.skills.slice(0, 4),
    recentNews: [],
    insights: [`Focus on ${profile.targetRole} responsibilities at ${profile.targetCompany}.`],
    sources: [],
  };
  writeJourney({ research });
  return research;
}

export function saveCandidateRecord(record: CandidateRecord, jobDescription: string) {
  const { id, createdAt: _createdAt, ...profile } = record;
  void _createdAt;
  return writeJourney({
    candidate: profile,
    candidateId: id,
    jobDescription,
  });
}
