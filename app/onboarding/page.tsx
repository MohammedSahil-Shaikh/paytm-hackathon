import { AppShell } from "@/components/layout/app-shell";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";

export default function OnboardingPage() {
  return (
    <AppShell title="You're hired. Your DayZero begins now.">
      <PlaceholderPanel
        title="Hiring transition"
        description="This screen keeps interview strengths, gaps, and recommendations as inputs for personalized onboarding."
      />
    </AppShell>
  );
}
