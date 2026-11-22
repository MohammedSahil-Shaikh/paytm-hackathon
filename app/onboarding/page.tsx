import { AppShell } from "@/components/layout/app-shell";
import { StepRail } from "@/components/journey/step-rail";
import { HiringTransition } from "@/components/onboarding/hiring-transition";

export default function OnboardingPage() {
  return (
    <AppShell eyebrow="Step 05" title="You're hired. Your DayZero begins now.">
      <StepRail active={4} />
      <HiringTransition />
    </AppShell>
  );
}
