"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface, Eyebrow } from "@/components/ui/surface";
import { MarkdownMessage } from "@/components/ui/markdown-message";
import { ApiClientError, askHrAssistant } from "@/lib/client/api";
import {
  ensureCandidate,
  readJourney,
  type JourneyState,
} from "@/lib/client/journey-store";
import { seedDemoJourney } from "@/lib/client/seed";
import type { CandidateProfile } from "@/types";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  verified?: boolean;
};

const prompts = [
  "What should I focus on in Days 1–30?",
  "Which skills from my interview gaps matter first?",
  "Do we have a leave policy in context?",
];

function buildOnboardingContext(
  journey: JourneyState,
  candidate: CandidateProfile,
): string {
  if (journey.onboardingPlan) {
    return JSON.stringify(journey.onboardingPlan);
  }
  if (journey.report) {
    return [
      "Interview report summary:",
      journey.report.overallSummary,
      "",
      "Strengths:",
      ...journey.report.strengths.map((item) => `- ${item}`),
      "",
      "Gaps:",
      ...journey.report.improvementAreas.map((item) => `- ${item}`),
      "",
      "Recommendations:",
      ...journey.report.recommendations.map((item) => `- ${item}`),
    ].join("\n");
  }
  if (journey.research) {
    return [
      `Company research for ${journey.research.company} — ${journey.research.role}`,
      "",
      "Overview:",
      journey.research.overview,
      "",
      "Insights:",
      ...journey.research.insights.map((item) => `- ${item}`),
      "",
      "Requirements:",
      ...journey.research.jobRequirements.map((item) => `- ${item}`),
    ].join("\n");
  }
  return [
    `Candidate targeting ${candidate.targetRole} at ${candidate.targetCompany}.`,
    "",
    "Skills:",
    ...candidate.skills.map((item) => `- ${item}`),
    "",
    "Gaps:",
    ...(candidate.skillGaps.length
      ? candidate.skillGaps.map((item) => `- ${item}`)
      : ["- none listed"]),
  ].join("\n");
}

export function HrChat() {
  const [ready, setReady] = useState(false);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [onboardingContext, setOnboardingContext] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: [
        "## Welcome",
        "",
        "Ask about onboarding, roadmap tasks, or company policy context.",
        "",
        "### What I can help with",
        "- Days 1–30 / 60 / 90 focus",
        "- Interview gaps and skill priorities",
        "- Policy questions **only** when verified policy context exists",
        "",
        "If policy details are missing, I will say so instead of inventing them.",
      ].join("\n"),
      verified: true,
    },
  ]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    seedDemoJourney({ clearInterview: false });
    const profile = ensureCandidate();
    const journey = readJourney();
    setCandidate(profile);
    setOnboardingContext(buildOnboardingContext(journey, profile));
    setReady(true);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading || !candidate) return;
    setLoading(true);
    setError(null);
    setQuestion("");
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: trimmed },
    ]);

    try {
      const data = await askHrAssistant({
        question: trimmed,
        company: candidate.targetCompany,
        role: candidate.targetRole,
        policyContext: "",
        onboardingContext,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.response.answer,
          verified: data.response.verified,
        },
      ]);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to reach HR assistant";
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-err-${Date.now()}`,
          role: "assistant",
          content: [
            "## Temporary error",
            "",
            message,
            "",
            "Try again in a moment.",
          ].join("\n"),
          verified: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
      <Surface className="flex min-h-[520px] flex-col">
        <div className="flex items-center gap-3 border-b border-navy-600 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500 text-navy-950">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-ink-50">DayZero Assistant</p>
            <p className="text-xs text-ink-400" suppressHydrationWarning>
              {ready && candidate
                ? `${candidate.targetCompany} · ${candidate.targetRole}`
                : "Loading profile…"}
            </p>
          </div>
        </div>

        <div className="mt-6 max-h-[420px] flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
                message.role === "assistant"
                  ? "rounded-tl-md bg-navy-900 text-ink-100"
                  : "ml-auto rounded-tr-md bg-[rgba(244,196,48,0.18)] text-ink-50"
              }`}
            >
              {message.role === "assistant" ? (
                <MarkdownMessage content={message.content} />
              ) : (
                message.content
              )}
              {message.role === "assistant" && message.verified === false ? (
                <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-gold-600">
                  Unverified / missing policy context
                </p>
              ) : null}
            </div>
          ))}

          {loading ? (
            <div
              className="max-w-[85%] rounded-2xl rounded-tl-md bg-navy-900 px-4 py-3 text-sm text-ink-300"
              aria-live="polite"
              aria-label="Assistant is typing"
            >
              <span className="inline-flex items-center gap-1 tracking-[0.2em]">
                <span className="animate-pulse">.</span>
                <span className="animate-pulse [animation-delay:150ms]">.</span>
                <span className="animate-pulse [animation-delay:300ms]">.</span>
              </span>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 rounded-2xl border border-navy-600 bg-[#FFFDF8] p-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(question);
              }
            }}
            rows={3}
            disabled={loading || !ready}
            placeholder="Ask about onboarding or policy context…"
            className="w-full resize-none bg-transparent px-2 text-sm text-ink-100 outline-none placeholder:text-ink-400"
          />
          <div className="mt-3 flex justify-end">
            <Button
              onClick={() => void send(question)}
              disabled={loading || !ready || !question.trim()}
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Thinking…
                </>
              ) : (
                "Send"
              )}
            </Button>
          </div>
        </div>
      </Surface>

      <Surface>
        <Eyebrow>Suggested prompts</Eyebrow>
        <div className="mt-4 space-y-3">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={loading || !ready}
              onClick={() => void send(prompt)}
              className="w-full rounded-2xl border border-navy-600 bg-navy-900 px-4 py-3 text-left text-sm text-ink-200 transition hover:border-gold-500/50 hover:text-ink-50 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </Surface>
    </div>
  );
}
