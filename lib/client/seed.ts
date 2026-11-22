import type { ResearchData } from "@/types";
import {
  defaultCandidate,
  readJourney,
  writeJourney,
  type JourneyState,
} from "@/lib/client/journey-store";

const SEED_FLAG = "dayzero.seed.v1";

export function defaultResearch(): ResearchData {
  const candidate = defaultCandidate();
  return {
    company: candidate.targetCompany,
    role: candidate.targetRole,
    overview:
      "Paytm is a leading Indian fintech platform spanning payments, commerce, and financial services. Backend roles focus on high-throughput APIs, reliability, and merchant/payment tooling.",
    jobRequirements: [
      "Strong Python or Java backend fundamentals",
      "API design and PostgreSQL data modeling",
      "Caching and scalability with Redis",
      "Ownership of production services",
      "Clear communication under ambiguity",
    ],
    recentNews: [
      {
        title: "Paytm continues product expansion across payments and financial services",
        url: "https://paytm.com",
        summary: "Seeded demo news item for local journey testing.",
      },
    ],
    insights: [
      "Expect system-design depth around payments and idempotent APIs.",
      "Highlight ownership of merchant tooling and checkout reliability.",
      "Be ready to discuss trade-offs between consistency, latency, and cost.",
    ],
    sources: [
      {
        title: "Paytm company overview (seed)",
        url: "https://paytm.com",
        provider: "mock",
      },
      {
        title: "Paytm payments & merchant tooling notes",
        url: "https://paytm.com/business",
        provider: "mock",
      },
      {
        title: "Backend reliability practices for fintech APIs",
        url: "https://paytm.com/careers",
        provider: "mock",
      },
      {
        title: "PostgreSQL + Redis caching patterns (seed)",
        url: "https://www.postgresql.org/docs/",
        provider: "mock",
      },
      {
        title: "Idempotent payment API design references",
        url: "https://stripe.com/docs/api",
        provider: "mock",
      },
      {
        title: "System design interview prompts for backend roles",
        url: "https://github.com/donnemartin/system-design-primer",
        provider: "mock",
      },
      {
        title: "Observability and SLO basics for services",
        url: "https://sre.google/sre-book/service-level-objectives/",
        provider: "mock",
      },
      {
        title: "Redis caching strategies overview",
        url: "https://redis.io/docs/latest/develop/use/patterns/",
        provider: "mock",
      },
    ],
  };
}

/** Seeds candidate + research so Setup/Research can be skipped for demos. */
export function seedDemoJourney(options?: {
  force?: boolean;
  clearInterview?: boolean;
}): JourneyState {
  if (typeof window === "undefined") {
    return readJourney();
  }

  const force = options?.force ?? false;
  const clearInterview = options?.clearInterview ?? true;
  const existing = readJourney();
  const alreadySeeded = window.sessionStorage.getItem(SEED_FLAG) === "1";

  if (!force && alreadySeeded && existing.candidate && existing.research) {
    return existing;
  }

  const candidate = existing.candidate || defaultCandidate();
  const research = existing.research?.company
    ? existing.research
    : defaultResearch();

  const next = writeJourney({
    candidate,
    candidateId: existing.candidateId || "seed-jordan-lee",
    jobDescription:
      existing.jobDescription ||
      "Backend Engineer focused on payment APIs, PostgreSQL, Redis, and scalable service design at Paytm.",
    research,
    ...(clearInterview && !existing.interviewComplete
      ? {
          sessionId: null,
          questions: [],
          currentQuestion: null,
          currentQuestionIndex: 0,
          lastEvaluation: null,
          interviewComplete: false,
          interviewSource: null,
          interviewStartedAt: null,
          proctorWarnings: 0,
        }
      : {}),
  });

  window.sessionStorage.setItem(SEED_FLAG, "1");
  return next;
}
