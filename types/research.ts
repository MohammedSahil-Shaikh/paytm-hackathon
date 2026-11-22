export interface ResearchSource {
  title: string;
  url: string;
  provider: "serpapi" | "you" | "mock";
}

export interface ResearchNewsItem {
  title: string;
  summary: string;
  url: string;
}

export interface ResearchData {
  company: string;
  role: string;
  overview: string;
  jobRequirements: string[];
  recentNews: ResearchNewsItem[];
  insights: string[];
  sources: ResearchSource[];
}
