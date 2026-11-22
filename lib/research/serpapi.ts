/**
 * Member 2 — SerpApi research helpers.
 * Shared low-level client lives in lib/ai/serpapi.ts for Track 1.
 */
import { serpApiSearch } from "@/lib/ai/serpapi";

export async function searchWithSerpApi(query: string): Promise<unknown> {
  return serpApiSearch({
    engine: "google",
    q: query,
    num: 10,
  });
}

export async function searchCompanyNews(company: string): Promise<unknown> {
  return serpApiSearch({
    engine: "google_news",
    q: `${company} news`,
    num: 8,
  });
}

export async function searchRoleJobs(company: string, role: string): Promise<unknown> {
  return serpApiSearch({
    engine: "google_jobs",
    q: `${role} ${company}`,
  });
}
