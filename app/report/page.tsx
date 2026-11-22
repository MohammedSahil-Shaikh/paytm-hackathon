import { AppShell } from "@/components/layout/app-shell";
import { StepRail } from "@/components/journey/step-rail";
import { ReportPanel } from "@/components/report/report-panel";

export default function ReportPage() {
  return (
    <AppShell eyebrow="Step 04" title="Interview Report">
      <StepRail active={3} />
      <ReportPanel />
    </AppShell>
  );
}
