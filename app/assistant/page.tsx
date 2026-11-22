import { AppShell } from "@/components/layout/app-shell";
import { StepRail } from "@/components/journey/step-rail";
import { HrChat } from "@/components/assistant/hr-chat";

export default function AssistantPage() {
  return (
    <AppShell eyebrow="Step 07 · Employee support" title="HR AI Assistant">
      <StepRail active={6} />
      <HrChat />
    </AppShell>
  );
}
