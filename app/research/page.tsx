import { AppShell } from "@/components/layout/app-shell";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { mockResearch } from "@/lib/mock";

export default function ResearchPage() {
  return (
    <AppShell title="Company Research">
      <PlaceholderPanel
        title={`${mockResearch.company} · ${mockResearch.role}`}
        description={`${mockResearch.overview} Requirements: ${mockResearch.jobRequirements.join(", ")}.`}
      />
    </AppShell>
  );
}
