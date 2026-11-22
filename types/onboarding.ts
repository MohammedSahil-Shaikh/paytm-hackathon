export interface OnboardingPlan {
  employeeName: string;
  company: string;
  role: string;
  phases: {
    period: "Days 1-30" | "Days 31-60" | "Days 61-90";
    goals: string[];
    tasks: string[];
    milestones: string[];
  }[];
}

export interface HrAssistantRequest {
  question: string;
  company: string;
  role: string;
  policyContext?: string;
  onboardingContext?: string;
}

export interface HrAssistantResponse {
  answer: string;
  sources: string[];
  verified: boolean;
}
