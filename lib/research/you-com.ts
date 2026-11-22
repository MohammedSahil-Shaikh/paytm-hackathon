import type { ResearchProviderResult, SearchResult } from "./types";

const YOU_COM_URL = "https://api.you.com/v1/search";
const REQUEST_TIMEOUT_MS = 8_000;

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeResult(value: unknown): SearchResult | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const title = asString(item.title);
  const url = asString(item.url) ?? asString(item.link);
  if (!title || !url || !url.startsWith("http")) return null;

  return {
    title,
    url,
    snippet: asString(item.description) ?? asString(item.snippet),
    date: asString(item.published_date) ?? asString(item.date),
  };
}

export async function researchWithYouCom(
  query: string,
): Promise<ResearchProviderResult> {
  const apiKey = process.env.YOU_COM_API_KEY;
  if (!apiKey) throw new Error("YOU_COM_API_KEY is not configured");

  const response = await fetch(`${YOU_COM_URL}?${new URLSearchParams({ query })}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      Accept: "application/json",
      "X-API-Key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`You.com request failed with status ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object") {
    return { provider: "you", results: [] };
  }

  const data = payload as Record<string, unknown>;
  const rawResults = Array.isArray(data.results)
    ? data.results
    : Array.isArray(data.hits)
      ? data.hits
      : [];
  const results = rawResults
    .map(normalizeResult)
    .filter((item): item is SearchResult => item !== null);

  return {
    provider: "you",
    answer: asString(data.answer) ?? asString(data.summary),
    results,
  };
}
