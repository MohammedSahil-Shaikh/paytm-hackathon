import { AppShell } from "@/components/layout/app-shell";
import { StepRail } from "@/components/journey/step-rail";
import { InterviewPanel } from "@/components/interview/interview-panel";

export default function InterviewPage() {
  return (
    <AppShell eyebrow="Step 03" title="Voice AI Interview">
      <StepRail active={2} />
      <p className="mb-6 max-w-2xl text-sm text-ink-300">
        Allow the camera, then click Begin interview. The agent speaks each question;
        you answer by voice (text optional). Submit, then use Next for follow-ups.
        The 60-minute timer starts only after you begin.
      </p>
      <InterviewPanel />
    </AppShell>
  );
}
