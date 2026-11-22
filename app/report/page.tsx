import { AppShell } from "@/components/layout/app-shell";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { mockReport } from "@/lib/mock";

export default function ReportPage() {
  return (
    <AppShell title="Interview Report">
      <PlaceholderPanel
        title="Evidence-based feedback"
        description={mockReport.overallSummary}
      />
    </AppShell>
  );
}
