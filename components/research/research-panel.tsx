"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ExternalLink, LoaderCircle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface, Eyebrow } from "@/components/ui/surface";
import { ApiClientError, fetchResearch } from "@/lib/client/api";
import {
  hasCandidate,
  readJourney,
  resetInterviewProgress,
  writeJourney,
} from "@/lib/client/journey-store";
import { seedDemoJourney } from "@/lib/client/seed";
import type { ResearchData, ResearchSource } from "@/types";

const SOURCES_PER_PAGE = 4;

export function ResearchPanel() {
  const router = useRouter();
  const loadingRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [research, setResearch] = useState<ResearchData | null>(null);
  const [sourcePage, setSourcePage] = useState(0);
  const [selectedSource, setSelectedSource] = useState<ResearchSource | null>(null);

  async function loadResearch(options?: { force?: boolean }) {
    if (loadingRef.current) return;
    seedDemoJourney({ clearInterview: false });
    if (!hasCandidate()) {
      router.replace("/setup");
      return;
    }

    const journey = readJourney();
    if (!options?.force && journey.research?.company) {
      setResearch(journey.research);
      setSourcePage(0);
      setSelectedSource(null);
      setLoading(false);
      return;
    }

    loadingRef.current = true;
    if (options?.force) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const candidate = journey.candidate!;
      const data = await fetchResearch({
        company: candidate.targetCompany,
        role: candidate.targetRole,
        jobDescription: journey.jobDescription || "",
      });
      setResearch(data);
      setSourcePage(0);
      setSelectedSource(null);
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
      loadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadResearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sourceTotalPages = useMemo(() => {
    if (!research?.sources.length) return 1;
    return Math.max(1, Math.ceil(research.sources.length / SOURCES_PER_PAGE));
  }, [research]);

  const pagedSources = useMemo(() => {
    if (!research) return [];
    const start = sourcePage * SOURCES_PER_PAGE;
    return research.sources.slice(start, start + SOURCES_PER_PAGE);
  }, [research, sourcePage]);

  useEffect(() => {
    if (sourcePage > sourceTotalPages - 1) {
      setSourcePage(Math.max(0, sourceTotalPages - 1));
    }
  }, [sourcePage, sourceTotalPages]);

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
        <p className="text-sm text-red-700">{error || "No research available"}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => void loadResearch({ force: true })}>
            Retry research
          </Button>
          <ButtonLink href="/setup" variant="secondary">
            Back to setup
          </ButtonLink>
        </div>
      </Surface>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-300">
          Live company brief for interview prep. Sources stay in this panel — use pagination
          below, no new browser tabs for browsing the list.
        </p>
        <Button
          variant="secondary"
          disabled={refreshing}
          onClick={() => void loadResearch({ force: true })}
        >
          {refreshing ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Refreshing…
            </>
          ) : (
            "Refresh research"
          )}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Surface className="min-w-0">
          <Eyebrow>
            {research.company} · {research.role}
          </Eyebrow>
          <p className="mt-4 text-base leading-relaxed text-ink-100">{research.overview}</p>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.16em] text-ink-400">Requirements</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {research.jobRequirements.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-navy-600 bg-[rgba(244,196,48,0.14)] px-3 py-1 text-xs font-medium text-ink-50"
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

          {research.recentNews.length > 0 ? (
            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.16em] text-ink-400">Recent news</p>
              <ul className="mt-3 space-y-3">
                {research.recentNews.slice(0, 5).map((item) => (
                  <li key={`${item.url}-${item.title}`} className="text-sm text-ink-300">
                    <button
                      type="button"
                      className="text-left font-medium text-gold-600 hover:underline"
                      onClick={() =>
                        setSelectedSource({
                          title: item.title,
                          url: item.url,
                          provider: "serpapi",
                        })
                      }
                    >
                      {item.title}
                    </button>
                    {item.summary ? (
                      <span className="mt-1 block text-ink-400">{item.summary}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Surface>

        <div className="flex min-w-0 flex-col gap-4">
          <Surface className="flex min-h-[420px] flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Eyebrow>Sources</Eyebrow>
                <p className="mt-2 text-xs text-ink-400">
                  {research.sources.length} citation
                  {research.sources.length === 1 ? "" : "s"} · page {sourcePage + 1} of{" "}
                  {sourceTotalPages}
                </p>
              </div>
            </div>

            <div className="mt-4 flex-1 space-y-3">
              {research.sources.length === 0 ? (
                <p className="text-sm text-ink-400">
                  No citations returned yet. Interview start may still enrich via SerpApi.
                </p>
              ) : (
                pagedSources.map((source) => {
                  const active =
                    selectedSource?.url === source.url &&
                    selectedSource?.title === source.title;
                  return (
                    <button
                      key={`${source.url}-${source.title}`}
                      type="button"
                      onClick={() => setSelectedSource(source)}
                      className={`block w-full rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? "border-gold-500 bg-[rgba(244,196,48,0.12)]"
                          : "border-navy-600 bg-navy-900 hover:border-gold-500/50"
                      }`}
                    >
                      <p className="text-sm font-medium text-ink-50">{source.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gold-500">
                        {source.provider}
                      </p>
                    </button>
                  );
                })
              )}
            </div>

            {research.sources.length > SOURCES_PER_PAGE ? (
              <div className="mt-4 flex items-center justify-between border-t border-navy-600 pt-4">
                <Button
                  variant="secondary"
                  className="!px-4 !py-2"
                  disabled={sourcePage <= 0}
                  onClick={() => {
                    setSourcePage((page) => Math.max(0, page - 1));
                    setSelectedSource(null);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <p className="text-xs font-medium text-ink-300">
                  {sourcePage + 1} / {sourceTotalPages}
                </p>
                <Button
                  variant="secondary"
                  className="!px-4 !py-2"
                  disabled={sourcePage >= sourceTotalPages - 1}
                  onClick={() => {
                    setSourcePage((page) => Math.min(sourceTotalPages - 1, page + 1));
                    setSelectedSource(null);
                  }}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </Surface>

          <Surface className="min-h-[160px]">
            <Eyebrow>Source preview</Eyebrow>
            {selectedSource ? (
              <div className="mt-3">
                <p className="text-sm font-semibold text-ink-50">{selectedSource.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gold-500">
                  {selectedSource.provider}
                </p>
                <p className="mt-3 break-all text-xs text-ink-400">{selectedSource.url}</p>
                <a
                  href={selectedSource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold-600 hover:underline"
                >
                  Open original
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-400">
                Select a source to preview it here without leaving this page.
              </p>
            )}
          </Surface>

          <Button
            className="w-full"
            onClick={() => {
              resetInterviewProgress();
              writeJourney({ research });
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
    </div>
  );
}
