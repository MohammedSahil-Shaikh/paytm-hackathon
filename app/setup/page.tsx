import { AppShell } from "@/components/layout/app-shell";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";

export default function SetupPage() {
  return (
    <AppShell title="Candidate Setup">
      <PlaceholderPanel
        title="Enter name, company, role, and optional resume"
        description="Member 3 builds this form. It will call POST /api/candidate and continue into research."
      />
    </AppShell>
  );
}
