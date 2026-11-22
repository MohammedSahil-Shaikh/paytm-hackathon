"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface, Eyebrow } from "@/components/ui/surface";
import { ApiClientError, fetchResearch } from "@/lib/client/api";
import { ensureCandidate, readJourney, writeJourney } from "@/lib/client/journey-store";
import type { ResearchData } from "@/types";

export function ResearchPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [research, setResearch] = useState<ResearchData | null>(null);

  async function loadResearch() {
    setLoading(true);
    setError(null);
    try {
      const candidate = ensureCandidate();
      const jobDescription = readJourney().jobDescription || "";
      const data = await fetchResearch({
        company: candidate.targetCompany,
        role: candidate.targetRole,
        jobDescription,
      });
      setResearch(data);
      writeJourney({ research: data, candidate });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load research",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadResearch();
  }, []);

  if (loading) {
    return (
      <Surface className="flex min-h-[280px] items-center justify-center gap-3">
        <LoaderCircle className="h-5 w-5 animate-spin text-gold-500" />
        <p className="text-sm text-ink-300">Fetching company research…</p>
      </Surface>
    );
  }

  if (error || !research) {
    return (
      <Surface>
        <p className="text-sm text-red-200">{error || "No research available"}</p>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => void loadResearch()}>
            Retry research
          </Button>
        </div>
      </Surface>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
      <Surface>
        <Eyebrow>
          {research.company} · {research.role}
        </Eyebrow>
        <p className="mt-4 text-base leading-relaxed text-ink-100">
          {research.overview}
        </p>
        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.16em] text-ink-400">
            Requirements
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {research.jobRequirements.map((item) => (
              <span
                key={item}
                className="rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-400"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.16em] text-ink-400">Insights</p>
          <ul className="mt-3 space-y-2">
            {research.insights.map((insight) => (
              <li
                key={insight}
                className="border-l-2 border-gold-500/40 pl-3 text-sm text-ink-300"
              >
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </Surface>

      <div className="space-y-4">
        <Surface>
          <Eyebrow>Sources</Eyebrow>
          <div className="mt-4 space-y-3">
            {research.sources.length === 0 ? (
              <p className="text-sm text-ink-400">
                No citations returned yet. Interview start may still enrich via SerpApi.
              </p>
            ) : (
              research.sources.map((source) => (
                <a
                  key={`${source.url}-${source.title}`}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-gold-500/10 bg-navy-900/50 px-4 py-3 transition hover:border-gold-500/35"
                >
                  <p className="text-sm font-medium text-ink-50">{source.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gold-500">
                    {source.provider}
                  </p>
                </a>
              ))
            )}
          </div>
        </Surface>
        <Button
          className="w-full"
          onClick={() => {
            writeJourney({
              sessionId: null,
              questions: [],
              currentQuestion: null,
              interviewComplete: false,
              report: null,
              onboardingPlan: null,
            });
            router.push("/interview");
          }}
        >
          Begin AI interview
        </Button>
        <ButtonLink href="/setup" variant="secondary" className="w-full">
          Edit candidate setup
        </ButtonLink>
      </div>
    </div>
  );
}
