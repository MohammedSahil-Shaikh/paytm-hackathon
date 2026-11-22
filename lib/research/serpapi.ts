import type { ResearchProviderResult, SearchResult } from "./types";

const SERPAPI_URL = "https://serpapi.com/search.json";
const REQUEST_TIMEOUT_MS = 8_000;

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeResult(value: unknown): SearchResult | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const title = asString(item.title);
  const url = asString(item.link) ?? asString(item.url);
  if (!title || !url || !url.startsWith("http")) return null;

  return {
    title,
    url,
    snippet: asString(item.snippet) ?? asString(item.snippet_highlighted),
    date: asString(item.date),
  };
}

export async function searchWithSerpApi(
  query: string,
  options: { type?: "search" | "news"; limit?: number } = {},
): Promise<ResearchProviderResult> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) throw new Error("SERPAPI_API_KEY is not configured");

  const params = new URLSearchParams({
    engine: options.type === "news" ? "google_news" : "google",
    q: query,
    api_key: apiKey,
    num: String(Math.min(options.limit ?? 5, 10)),
  });

  const response = await fetch(`${SERPAPI_URL}?${params.toString()}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`SerpApi request failed with status ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object") {
    return { provider: "serpapi", results: [] };
  }

  const data = payload as Record<string, unknown>;
  const rawResults = options.type === "news" ? data.news_results : data.organic_results;
  const results = Array.isArray(rawResults)
    ? rawResults.map(normalizeResult).filter((item): item is SearchResult => item !== null)
    : [];

  const answerBox = data.answer_box;
  const answer = answerBox && typeof answerBox === "object"
    ? asString((answerBox as Record<string, unknown>).answer)
    : undefined;

  return { provider: "serpapi", answer, results };
}
