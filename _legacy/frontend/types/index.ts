export type InterviewStatus = "Completed" | "In Progress" | "Scheduled";

export interface RecentInterview {
  id: string;
  candidate: string;
  role: string;
  interviewType: string;
  date: string;
  status: InterviewStatus;
  score: number | null;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "completed" | "candidate" | "report" | "scheduled";
}

export interface StatCardData {
  id: string;
  label: string;
  value: string;
  hint: string;
  trend: string;
}

export type ServiceName = "frontend" | "backend" | "ai";

export type ServiceStatusState = "checking" | "connected" | "disconnected";

export interface HealthResponse {
  success: boolean;
  service: string;
  status: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: "overview" | "interviews" | "candidates" | "reports" | "workspace" | "settings" | "help";
}
