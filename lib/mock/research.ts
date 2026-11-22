import type { ResearchData } from "@/types";

export const mockResearch: ResearchData = {
  company: "Paytm",
  role: "Backend Engineer",
  overview:
    "Paytm is an Indian fintech platform focused on digital payments, merchant acquiring, lending, and financial services.",
  jobRequirements: [
    "Strong backend fundamentals",
    "API design and reliability",
    "SQL and data modeling",
    "Ownership in production systems",
  ],
  recentNews: [
    {
      title: "Paytm expands merchant payment products",
      summary: "Mock news item for hackathon demos when live research is unavailable.",
      url: "https://example.com/paytm-news",
    },
  ],
  insights: [
    "Reliability and trust matter for payment systems.",
    "Engineers often work across APIs, data, and merchant tooling.",
    "Fast experimentation with strong production ownership.",
  ],
  sources: [
    {
      title: "Mock Paytm company overview",
      url: "https://example.com/paytm-overview",
      provider: "mock",
    },
  ],
};
