/**
 * SerpApi client for DayZero AI engine (Beyond 9TO5 Track 1).
 * Uses Google Gemini for generation and Google Search/News/Jobs for live context.
 */

const SERPAPI_ENDPOINT = "https://serpapi.com/search.json";
const DEFAULT_TIMEOUT_MS = 30_000;

export class SerpApiError extends Error {
  constructor(
    message: string,
    public readonly code: "MISSING_API_KEY" | "TIMEOUT" | "PROVIDER_ERROR" = "PROVIDER_ERROR",
  ) {
    super(message);
    this.name = "SerpApiError";
  }
}

export function getSerpApiKey(): string | null {
  return process.env.SERPAPI_API_KEY?.trim() || null;
}

export function isSerpApiConfigured(): boolean {
  return Boolean(getSerpApiKey());
}

type SerpApiParams = Record<string, string | number | boolean | undefined>;

export async function serpApiSearch<T = Record<string, unknown>>(
  params: SerpApiParams,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const apiKey = getSerpApiKey();
  if (!apiKey) {
    throw new SerpApiError("SERPAPI_API_KEY is not configured", "MISSING_API_KEY");
  }

  const url = new URL(SERPAPI_ENDPOINT);
  url.searchParams.set("api_key", apiKey);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    const payload = (await response.json()) as T & {
      error?: string;
      search_metadata?: { status?: string };
    };

    if (!response.ok) {
      throw new SerpApiError(
        payload.error || `SerpApi HTTP ${response.status}`,
        "PROVIDER_ERROR",
      );
    }

    if (payload.error) {
      throw new SerpApiError(payload.error, "PROVIDER_ERROR");
    }

    return payload;
  } catch (error) {
    if (error instanceof SerpApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new SerpApiError("SerpApi request timed out", "TIMEOUT");
    }
    throw new SerpApiError(
      error instanceof Error ? error.message : "SerpApi request failed",
      "PROVIDER_ERROR",
    );
  } finally {
    clearTimeout(timer);
  }
}

type GeminiTextBlock = {
  type?: string;
  snippet?: string;
  text?: string;
};

type GeminiResponse = {
  reconstructed_markdown?: string;
  text_blocks?: GeminiTextBlock[];
  error?: string;
};

export function extractGeminiText(payload: GeminiResponse): string {
  if (payload.reconstructed_markdown?.trim()) {
    return payload.reconstructed_markdown.trim();
  }

  const parts = (payload.text_blocks ?? [])
    .map((block) => block.snippet || block.text || "")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.join("\n\n").trim();
}

export async function askGemini(
  prompt: string,
  timeoutMs = 50_000,
): Promise<string> {
  const payload = await serpApiSearch<GeminiResponse>(
    {
      engine: "google_gemini",
      q: prompt,
      no_cache: true,
    },
    timeoutMs,
  );

  const text = extractGeminiText(payload);
  if (!text) {
    throw new SerpApiError(
      payload.error || "SerpApi Gemini returned an empty answer",
      "PROVIDER_ERROR",
    );
  }
  return text;
}

export type LiveResearchSnippet = {
  overviewHints: string[];
  jobHints: string[];
  newsHints: { title: string; summary: string; url: string }[];
  sources: { title: string; url: string; provider: "serpapi" }[];
};

export async function fetchLiveCompanyRoleContext(input: {
  company: string;
  role: string;
}): Promise<LiveResearchSnippet> {
  const company = input.company.trim();
  const role = input.role.trim();

  const [search, news, jobs] = await Promise.allSettled([
    serpApiSearch<{
      organic_results?: { title?: string; snippet?: string; link?: string }[];
      knowledge_graph?: { description?: string; title?: string };
    }>({
      engine: "google",
      q: `${company} company overview products services`,
      num: 5,
    }),
    serpApiSearch<{
      news_results?: { title?: string; snippet?: string; link?: string }[];
    }>({
      engine: "google_news",
      q: `${company} news`,
      num: 5,
    }),
    serpApiSearch<{
      jobs_results?: {
        title?: string;
        company_name?: string;
        description?: string;
        location?: string;
      }[];
    }>({
      engine: "google_jobs",
      q: `${role} ${company}`,
    }),
  ]);

  const overviewHints: string[] = [];
  const jobHints: string[] = [];
  const newsHints: LiveResearchSnippet["newsHints"] = [];
  const sources: LiveResearchSnippet["sources"] = [];

  if (search.status === "fulfilled") {
    const kg = search.value.knowledge_graph?.description;
    if (kg) overviewHints.push(kg);
    for (const item of search.value.organic_results ?? []) {
      if (item.snippet) overviewHints.push(item.snippet);
      if (item.title && item.link) {
        sources.push({ title: item.title, url: item.link, provider: "serpapi" });
      }
    }
  }

  if (news.status === "fulfilled") {
    for (const item of news.value.news_results ?? []) {
      if (!item.title) continue;
      newsHints.push({
        title: item.title,
        summary: item.snippet || "",
        url: item.link || "https://serpapi.com",
      });
      if (item.link) {
        sources.push({ title: item.title, url: item.link, provider: "serpapi" });
      }
    }
  }

  if (jobs.status === "fulfilled") {
    for (const job of jobs.value.jobs_results ?? []) {
      const bits = [job.title, job.company_name, job.location, job.description]
        .filter(Boolean)
        .join(" — ");
      if (bits) jobHints.push(bits);
    }
  }

  return {
    overviewHints: overviewHints.slice(0, 6),
    jobHints: jobHints.slice(0, 6),
    newsHints: newsHints.slice(0, 5),
    sources: sources.slice(0, 8),
  };
}
