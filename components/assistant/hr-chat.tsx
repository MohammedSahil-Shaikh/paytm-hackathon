"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface, Eyebrow } from "@/components/ui/surface";
import { ApiClientError, askHrAssistant } from "@/lib/client/api";
import { ensureCandidate, readJourney } from "@/lib/client/journey-store";

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

export function HrChat() {
  const candidate = useMemo(() => ensureCandidate(), []);
  const journey = useMemo(() => readJourney(), []);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Ask about onboarding, roadmap tasks, or company policy context. If policy details are missing, I will say so instead of inventing them.",
      verified: true,
    },
  ]);

  const onboardingContext = journey.onboardingPlan
    ? JSON.stringify(journey.onboardingPlan)
    : journey.report
      ? `Recommendations: ${journey.report.recommendations.join("; ")}. Gaps: ${journey.report.improvementAreas.join("; ")}`
      : "";

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
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
      setError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to reach HR assistant",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <Surface className="flex min-h-[420px] flex-col">
        <div className="flex items-center gap-3 border-b border-gold-500/10 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500 text-navy-950">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-ink-50">DayZero Assistant</p>
            <p className="text-xs text-ink-400">
              {candidate.targetCompany} · {candidate.targetRole}
            </p>
          </div>
        </div>

        <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                message.role === "assistant"
                  ? "rounded-tl-md bg-navy-700/80 text-ink-100"
                  : "ml-auto rounded-tr-md bg-gold-500/15 text-ink-50"
              }`}
            >
              {message.content}
              {message.role === "assistant" && message.verified === false ? (
                <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-gold-500">
                  Unverified / missing policy context
                </p>
              ) : null}
            </div>
          ))}
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <div className="mt-6 rounded-2xl border border-gold-500/15 bg-navy-900/70 p-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            disabled={loading}
            placeholder="Ask about onboarding or policy context…"
            className="w-full resize-none bg-transparent px-2 text-sm text-ink-100 outline-none placeholder:text-ink-400"
          />
          <div className="mt-3 flex justify-end">
            <Button onClick={() => void send(question)} disabled={loading}>
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
              onClick={() => void send(prompt)}
              className="w-full rounded-2xl border border-gold-500/15 bg-navy-900/50 px-4 py-3 text-left text-sm text-ink-200 transition hover:border-gold-500/40 hover:text-ink-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </Surface>
    </div>
  );
}
