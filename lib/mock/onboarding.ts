import type { OnboardingPlan } from "@/types";

export const mockOnboardingPlan: OnboardingPlan = {
  employeeName: "Jordan Lee",
  company: "Paytm",
  role: "Backend Engineer",
  phases: [
    {
      period: "Days 1-30",
      goals: [
        "Learn payment domain basics",
        "Set up local development",
        "Understand team APIs",
      ],
      tasks: [
        "Complete service onboarding docs",
        "Shadow an API on-call review",
        "Build a small internal API exercise",
      ],
      milestones: ["Dev environment ready", "First PR merged"],
    },
    {
      period: "Days 31-60",
      goals: ["Contribute to merchant API work", "Close Kafka skill gap"],
      tasks: [
        "Own a guided ticket on API reliability",
        "Implement a sample producer/consumer lab",
        "Pair on an incident retrospective",
      ],
      milestones: ["Delivers one production-facing improvement"],
    },
    {
      period: "Days 61-90",
      goals: ["Own a feature slice", "Establish growth goals"],
      tasks: [
        "Lead a small backend feature",
        "Document runbooks for owned APIs",
        "Set 6-month learning plan",
      ],
      milestones: ["Independent ownership of a service area"],
    },
  ],
};
