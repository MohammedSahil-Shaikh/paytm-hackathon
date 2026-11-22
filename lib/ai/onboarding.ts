/** Personalized onboarding plan based on interview evidence and role research. */
import type {
  CandidateProfile,
  InterviewReport,
  OnboardingPlan,
  ResearchData,
} from "@/types";

export async function generateOnboardingPlan(input: {
  candidate: CandidateProfile;
  report: InterviewReport;
  research: ResearchData;
}): Promise<OnboardingPlan> {
  const gap = input.report.improvementAreas[0] ?? "role-specific skills";
  const roleSkill = input.research.jobRequirements[0] ?? `${input.candidate.targetRole} fundamentals`;

  return {
    employeeName: input.candidate.name,
    company: input.candidate.targetCompany,
    role: input.candidate.targetRole,
    phases: [
      {
        period: "Days 1-30",
        goals: ["Understand the company, team, products, and working practices", `Build confidence in ${roleSkill}`],
        tasks: ["Complete access and environment setup", "Meet key teammates and review team documentation", `Shadow a workflow related to ${roleSkill}`],
        milestones: ["Environment ready", "First learning review completed"],
      },
      {
        period: "Days 31-60",
        goals: ["Contribute to a guided work item", `Address interview improvement area: ${gap}`],
        tasks: [`Complete a small ${input.candidate.targetRole} task with review`, `Practice ${gap.toLowerCase()} through a real or sandbox project`, "Join a team retrospective and document one improvement"],
        milestones: ["First reviewed contribution merged or delivered", "Skill-gap practice reviewed with manager or mentor"],
      },
      {
        period: "Days 61-90",
        goals: ["Own a defined responsibility", "Turn interview recommendations into a sustainable growth plan"],
        tasks: ["Deliver an independently owned task or feature", `Document a repeatable approach for ${roleSkill}`, "Set next-quarter goals with the team"],
        milestones: ["Independent ownership demonstrated", "90-day growth review completed"],
      },
    ],
  };
}
