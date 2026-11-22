export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
  date?: string;
}

export interface ResearchProviderResult {
  provider: "serpapi" | "you";
  answer?: string;
  results: SearchResult[];
}
