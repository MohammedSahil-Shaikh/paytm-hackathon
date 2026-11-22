import { AppShell } from "@/components/layout/app-shell";
import { HrChat } from "@/components/assistant/hr-chat";

export default function AssistantPage() {
  return (
    <AppShell eyebrow="Employee support" title="HR AI Assistant">
      <HrChat />
    </AppShell>
  );
}
