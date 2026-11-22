"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { readJourney } from "@/lib/client/journey-store";
import type { OnboardingPlan } from "@/types";

export function HiringTransition() {
  const [plan, setPlan] = useState<OnboardingPlan | null>(null);
  const [hasReport, setHasReport] = useState(false);

  useEffect(() => {
    const journey = readJourney();
    setPlan(journey.onboardingPlan);
    setHasReport(Boolean(journey.report));
  }, []);

  return (
    <Surface className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-gold-500/20 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500 text-navy-950">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="mt-6 font-display text-3xl font-semibold leading-tight text-ink-50 sm:text-4xl">
            You&apos;re hired. Your DayZero begins now.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-300">
            {plan
              ? `Personalized plan ready for ${plan.employeeName} joining ${plan.company} as ${plan.role}.`
              : hasReport
                ? "Interview report is ready. Open the roadmap to generate or view your personalized 30/60/90 plan."
                : "Complete an interview and report first so onboarding can use real strengths and gaps."}
          </p>
          <p className="mt-3 text-xs text-ink-400">
            Hackathon storytelling transition — not a real employer hiring decision.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/roadmap">Open 30 / 60 / 90 roadmap</ButtonLink>
          <ButtonLink href="/report" variant="secondary">
            Review report
          </ButtonLink>
        </div>
      </div>
    </Surface>
  );
}
