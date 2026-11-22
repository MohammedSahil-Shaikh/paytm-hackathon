import { AppShell } from "@/components/layout/app-shell";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { mockOnboardingPlan } from "@/lib/mock";

export default function RoadmapPage() {
  return (
    <AppShell title="30 / 60 / 90 Roadmap">
      <div className="grid gap-4 md:grid-cols-3">
        {mockOnboardingPlan.phases.map((phase) => (
          <PlaceholderPanel
            key={phase.period}
            title={phase.period}
            description={`Goals: ${phase.goals.join("; ")}`}
          />
        ))}
      </div>
    </AppShell>
  );
}
