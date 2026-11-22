"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface, Eyebrow } from "@/components/ui/surface";
import { ApiClientError, generateOnboarding } from "@/lib/client/api";
import {
  ensureCandidate,
  ensureResearch,
  readJourney,
  writeJourney,
} from "@/lib/client/journey-store";
import type { OnboardingPlan } from "@/types";

export function RoadmapPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<OnboardingPlan | null>(null);

  async function loadPlan() {
    setLoading(true);
    setError(null);
    try {
      const journey = readJourney();
      if (journey.onboardingPlan) {
        setPlan(journey.onboardingPlan);
        return;
      }
      if (!journey.report) {
        setError("No interview report found. Finish an interview first.");
        return;
      }
      const candidate = ensureCandidate();
      const research = ensureResearch(candidate);
      const data = await generateOnboarding({
        candidate,
        research,
        report: journey.report,
      });
      setPlan(data.plan);
      writeJourney({ onboardingPlan: data.plan, candidate, research });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load onboarding plan",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPlan();
  }, []);

  if (loading) {
    return (
      <Surface className="flex min-h-[240px] items-center justify-center gap-3">
        <LoaderCircle className="h-5 w-5 animate-spin text-gold-500" />
        <p className="text-sm text-ink-300">Loading personalized roadmap…</p>
      </Surface>
    );
  }

  if (error || !plan) {
    return (
      <Surface>
        <p className="text-sm text-red-700">{error || "No roadmap available"}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => void loadPlan()}>
            Retry
          </Button>
          <ButtonLink href="/report" variant="secondary">
            Go to report
          </ButtonLink>
        </div>
      </Surface>
    );
  }

  return (
    <>
      <p className="mb-6 max-w-2xl text-sm text-ink-300">
        Personalized for {plan.employeeName} joining {plan.company} as {plan.role}.
      </p>
      <div className="grid gap-5 lg:grid-cols-3">
        {plan.phases.map((phase, index) => (
          <Surface
            key={phase.period}
            className={index === 0 ? "border-gold-500/35" : undefined}
          >
            <Eyebrow>{phase.period}</Eyebrow>
            <h2 className="mt-3 font-display text-xl font-semibold text-ink-50">
              {index === 0 ? "Learn" : index === 1 ? "Contribute" : "Own"}
            </h2>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-ink-400">Goals</p>
                <ul className="mt-2 space-y-1.5 text-sm text-ink-200">
                  {phase.goals.map((goal) => (
                    <li key={goal}>• {goal}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-ink-400">Tasks</p>
                <ul className="mt-2 space-y-1.5 text-sm text-ink-200">
                  {phase.tasks.map((task) => (
                    <li key={task}>• {task}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-gold-500">
                  Milestones
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-ink-200">
                  {phase.milestones.map((milestone) => (
                    <li key={milestone}>• {milestone}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Surface>
        ))}
      </div>
      <div className="mt-8">
        <ButtonLink href="/assistant">Ask the HR assistant</ButtonLink>
      </div>
    </>
  );
}
