"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface, Eyebrow } from "@/components/ui/surface";
import { ApiClientError, finishInterview, generateOnboarding } from "@/lib/client/api";
import {
  ensureCandidate,
  ensureResearch,
  readJourney,
  writeJourney,
} from "@/lib/client/journey-store";
import type { InterviewReport } from "@/types";

export function ReportPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<InterviewReport | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const journey = readJourney();
        if (journey.report) {
          setReport(journey.report);
          return;
        }
        if (!journey.sessionId) {
          setError("No interview session found. Finish an interview first.");
          return;
        }
        const data = await finishInterview(journey.sessionId);
        setReport(data.report);
        writeJourney({
          report: data.report,
          interviewComplete: true,
          interviewSource: data.source,
        });
      } catch (err) {
        const message =
          err instanceof ApiClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load report";
        if (message.toLowerCase().includes("not found")) {
          writeJourney({ sessionId: null, interviewStartedAt: null });
          setError(
            "Interview session expired (server restarted). Go back to Interview and begin again, then generate the report from there.",
          );
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function continueToOnboarding() {
    if (!report) return;
    setGeneratingPlan(true);
    setError(null);
    try {
      if (!readJourney().onboardingPlan) {
        const candidate = ensureCandidate();
        const research = ensureResearch(candidate);
        const data = await generateOnboarding({
          candidate,
          research,
          report,
        });
        writeJourney({ onboardingPlan: data.plan, candidate, research });
      }
      router.push("/onboarding");
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to generate onboarding",
      );
      router.push("/onboarding");
    } finally {
      setGeneratingPlan(false);
    }
  }

  if (loading) {
    return (
      <Surface className="flex min-h-[240px] items-center justify-center gap-3">
        <LoaderCircle className="h-5 w-5 animate-spin text-gold-500" />
        <p className="text-sm text-ink-300">Loading interview report…</p>
      </Surface>
    );
  }

  if (error && !report) {
    return (
      <Surface>
        <p className="text-sm text-red-700">{error}</p>
        <div className="mt-4 flex gap-3">
          <ButtonLink href="/interview" variant="secondary">
            Back to interview
          </ButtonLink>
        </div>
      </Surface>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Surface>
        <Eyebrow>Overall summary</Eyebrow>
        <p className="mt-4 text-lg leading-relaxed text-ink-100">
          {report.overallSummary}
        </p>
      </Surface>

      <div className="grid gap-6 md:grid-cols-2">
        <Surface>
          <Eyebrow>Strengths</Eyebrow>
          <ul className="mt-4 space-y-2">
            {report.strengths.map((item) => (
              <li key={item} className="text-sm text-ink-200">
                <span className="mr-2 text-gold-500">+</span>
                {item}
              </li>
            ))}
          </ul>
        </Surface>
        <Surface>
          <Eyebrow>Improvement areas</Eyebrow>
          <ul className="mt-4 space-y-2">
            {report.improvementAreas.map((item) => (
              <li key={item} className="text-sm text-ink-200">
                <span className="mr-2 text-gold-500">→</span>
                {item}
              </li>
            ))}
          </ul>
        </Surface>
      </div>

      <Surface>
        <Eyebrow>Skill analysis</Eyebrow>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {report.skillAnalysis.map((skill) => (
            <div
              key={`${skill.skill}-${skill.level}`}
              className="rounded-2xl border border-navy-600 bg-navy-900 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-ink-50">{skill.skill}</p>
                <span className="rounded-full bg-gold-500/15 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-gold-400">
                  {skill.level}
                </span>
              </div>
              <p className="mt-2 text-sm text-ink-300">{skill.feedback}</p>
            </div>
          ))}
        </div>

        {report.answerFeedback.length > 0 ? (
          <div className="mt-6 space-y-3">
            <Eyebrow>Question feedback</Eyebrow>
            {report.answerFeedback.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-navy-600 bg-navy-900 p-4"
              >
                <p className="text-sm font-medium text-ink-50">{item.question}</p>
                <p className="mt-2 text-sm text-ink-300">{item.feedback}</p>
                <p className="mt-2 text-xs text-ink-400">
                  Suggested approach: {item.suggestedAnswerApproach}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => void continueToOnboarding()} disabled={generatingPlan}>
            {generatingPlan ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Building onboarding…
              </>
            ) : (
              "Continue to hiring transition"
            )}
          </Button>
          <ButtonLink href="/interview" variant="secondary">
            Back to interview
          </ButtonLink>
        </div>
      </Surface>
    </div>
  );
}
