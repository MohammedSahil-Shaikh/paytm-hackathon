import { AppShell } from "@/components/layout/app-shell";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { mockQuestions } from "@/lib/mock";

export default function InterviewPage() {
  return (
    <AppShell title="AI Interview">
      <PlaceholderPanel
        title="Adaptive interview shell"
        description={`First mock question: ${mockQuestions[0].question}`}
      />
    </AppShell>
  );
}
