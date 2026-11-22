/**
 * Member 2 — Company research orchestration.
 */
import type { ResearchData, ResearchSource } from "@/types";
import { searchWithSerpApi } from "./serpapi";
import { researchWithYouCom } from "./you-com";
import type { ResearchProviderResult, SearchResult } from "./types";

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function uniqueSources(results: ResearchProviderResult[]): ResearchSource[] {
  const sources = results.flatMap((result) =>
    result.results.map((item) => ({
      title: item.title,
      url: item.url,
      provider: result.provider,
    })),
  );
  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = source.url.toLowerCase().replace(/\/$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function fallbackResearch(company: string, role: string): ResearchData {
  return {
    company,
    role,
    overview: `Mock fallback research for ${company}. Live sources were unavailable, so verify company details before relying on them.`,
    jobRequirements: [
      `Core ${role} fundamentals`,
      "Relevant technical and domain skills",
      "Structured problem solving",
      "Clear communication and ownership",
    ],
    recentNews: [],
    insights: [
      `Review ${company}'s verified products, customers, and industry position before the interview.`,
      `Prepare examples that demonstrate impact in a ${role} role.`,
    ],
    sources: [{
      title: "Mock fallback research (not a verified source)",
      url: "https://example.com/dayzero-mock-research",
      provider: "mock",
    }],
  };
}

function newsFrom(results: SearchResult[]) {
  return results.slice(0, 5).map((item) => ({
    title: item.title,
    summary: item.snippet ?? "Recent company or industry result.",
    url: item.url,
  }));
}

export async function researchCompany(input: {
  company: string;
  role: string;
  jobDescription?: string;
}): Promise<ResearchData> {
  const queryBase = `${input.company} ${input.role}`;
  const requests = await Promise.allSettled([
    searchWithSerpApi(`${queryBase} company products services industry`, { type: "search" }),
    searchWithSerpApi(`${queryBase} recent news technology developments`, { type: "news" }),
    searchWithSerpApi(`${queryBase} job requirements skills`, { type: "search" }),
    researchWithYouCom(`${queryBase} company overview role requirements industry insights`),
  ]);

  const results = requests.flatMap((request) =>
    request.status === "fulfilled" && request.value.results.length > 0
      ? [request.value]
      : [],
  );

  if (results.length === 0) return fallbackResearch(input.company, input.role);

  const allItems = results.flatMap((result) => result.results);
  const overviewResult = results.find((result) => result.answer)?.answer;
  const jobItems = allItems.filter((item) =>
    /skill|require|engineer|developer|experience|knowledge/i.test(`${item.title} ${item.snippet ?? ""}`),
  );
  const newsItems = allItems.filter((item) =>
    /news|announce|launch|report|update|growth/i.test(`${item.title} ${item.snippet ?? ""}`),
  );
  const sources = uniqueSources(results);

  return {
    company: input.company,
    role: input.role,
    overview: overviewResult ?? `Research results for ${input.company} and the ${input.role} role.`,
    jobRequirements: unique([
      ...jobItems.slice(0, 8).map((item) => item.snippet ?? item.title),
      ...(input.jobDescription ? [input.jobDescription] : []),
    ]).slice(0, 8),
    recentNews: newsFrom(newsItems.length > 0 ? newsItems : allItems),
    insights: unique([
      ...results.flatMap((result) => result.answer ? [result.answer] : []),
      `Use the cited sources to prepare for ${input.role} responsibilities at ${input.company}.`,
    ]).slice(0, 6),
    sources,
  };
}
