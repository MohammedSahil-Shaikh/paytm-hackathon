import type { CandidateProfile } from "@/types";

export const mockCandidate: CandidateProfile = {
  name: "Jordan Lee",
  email: "jordan.lee@example.com",
  resumeText:
    "Backend engineer with Python, FastAPI, PostgreSQL, and Redis experience. Built payment APIs and merchant tooling.",
  skills: ["Python", "FastAPI", "PostgreSQL", "Redis", "System Design"],
  experience: [
    "3 years backend engineering",
    "Built checkout APIs for a fintech product",
    "Improved API latency and reliability",
  ],
  strengths: ["API design", "Clear communication", "Ownership"],
  skillGaps: ["Kafka", "Large-scale incident leadership"],
  targetRole: "Backend Engineer",
  targetCompany: "Paytm",
};
