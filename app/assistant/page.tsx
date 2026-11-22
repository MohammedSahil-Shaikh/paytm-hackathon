import { AppShell } from "@/components/layout/app-shell";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";

export default function AssistantPage() {
  return (
    <AppShell title="HR AI Assistant">
      <PlaceholderPanel
        title="Ask onboarding and policy questions"
        description="Uses supplied policy context only. If information is unavailable, it must say so instead of inventing policies."
      />
    </AppShell>
  );
}
