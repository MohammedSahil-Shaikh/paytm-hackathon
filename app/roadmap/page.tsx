import { AppShell } from "@/components/layout/app-shell";
import { StepRail } from "@/components/journey/step-rail";
import { RoadmapPanel } from "@/components/onboarding/roadmap-panel";

export default function RoadmapPage() {
  return (
    <AppShell eyebrow="Step 06" title="30 / 60 / 90 Roadmap">
      <StepRail active={5} />
      <RoadmapPanel />
    </AppShell>
  );
}
