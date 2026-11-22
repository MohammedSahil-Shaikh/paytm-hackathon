"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import type { CandidateProfile, InterviewReport, OnboardingPlan, ResearchData } from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<OnboardingPlan | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const candidate = localStorage.getItem("dayzero_candidate");
    const report = localStorage.getItem("dayzero_report");
    const research = localStorage.getItem("dayzero_research");

    if (!candidate || !report || !research) {
      setError("Complete the interview first to create a personalized plan.");
      return;
    }

    fetch("/api/onboarding", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        candidate: JSON.parse(candidate) as CandidateProfile,
        report: JSON.parse(report) as InterviewReport,
        research: JSON.parse(research) as ResearchData,
      }),
    })
      .then((response) => response.json())
      .then(setPlan)
      .catch(() => setError("Unable to create onboarding plan."));
  }, []);

  return (
    <AppShell title="You're hired. Your DayZero begins now.">
      {error ? (
        <p className="text-[#c4d0df]">{error}</p>
      ) : !plan ? (
        <p className="text-[#93a4bd]">Building your personalized 30/60/90 plan…</p>
      ) : (
        <div className="space-y-6">
          <p className="text-lg text-[#c4d0df]">
            Your interview insights now shape what you learn, contribute, and own next.
          </p>
          <div className="grid gap-5 lg:grid-cols-3">
            {plan.phases.map((phase) => (
              <section key={phase.period} className="rounded-3xl border border-white/10 bg-[rgba(15,27,45,0.72)] p-5">
                <p className="text-sm text-[#4f7cff]">{phase.period}</p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {phase.period === "Days 1-30" ? "Learn" : phase.period === "Days 31-60" ? "Contribute" : "Own"}
                </h2>
                <h3 className="mt-5 text-sm font-semibold text-white">Goals</h3>
                <ul className="mt-2 space-y-2 text-sm text-[#c4d0df]">
                  {phase.goals.map((item) => <li key={item}>• {item}</li>)}
                </ul>
                <h3 className="mt-5 text-sm font-semibold text-white">Tasks</h3>
                <ul className="mt-2 space-y-2 text-sm text-[#c4d0df]">
                  {phase.tasks.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => router.push("/assistant")} className="mt-6 rounded-xl border border-white/15 px-5 py-3 font-semibold text-white">
        Ask the HR assistant
      </button>
    </AppShell>
  );
}
