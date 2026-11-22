import { AppShell } from "@/components/layout/app-shell";
import { StepRail } from "@/components/journey/step-rail";
import { ResearchPanel } from "@/components/research/research-panel";

export default function ResearchPage() {
  return (
    <AppShell eyebrow="Step 02" title="Company Research">
      <StepRail active={1} />
      <ResearchPanel />
    </AppShell>
  );
}
