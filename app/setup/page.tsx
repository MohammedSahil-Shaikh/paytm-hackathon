import { UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StepRail } from "@/components/journey/step-rail";
import { SetupForm } from "@/components/setup/setup-form";
import { Surface } from "@/components/ui/surface";

export default function SetupPage() {
  return (
    <AppShell eyebrow="Step 01" title="Candidate Setup">
      <StepRail active={0} />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <SetupForm />
        <Surface className="flex flex-col justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-500">
              <UserRound className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold text-ink-50">
              Your DayZero profile
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-300">
              Saved via POST /api/candidate, then carried through research, voice
              interview, report, hiring transition, and 30/60/90 onboarding.
            </p>
          </div>
          <p className="mt-8 text-xs uppercase tracking-[0.16em] text-gold-500">
            Live · session journey
          </p>
        </Surface>
      </div>
    </AppShell>
  );
}
