import type { ActivityItem, RecentInterview, StatCardData } from "@/types";

/** Demo/mock statistics — not connected to a database. */
export const mockStats: StatCardData[] = [
  {
    id: "total-interviews",
    label: "Total Interviews",
    value: "128",
    hint: "Mock data · all time",
    trend: "+12%",
  },
  {
    id: "candidates",
    label: "Candidates",
    value: "96",
    hint: "Mock data · active pipeline",
    trend: "+8%",
  },
  {
    id: "completed",
    label: "Completed Interviews",
    value: "84",
    hint: "Mock data · last 90 days",
    trend: "+15%",
  },
  {
    id: "average-score",
    label: "Average Score",
    value: "82%",
    hint: "Mock data · completed only",
    trend: "+3%",
  },
];

/** Demo/mock recent interviews. */
export const mockRecentInterviews: RecentInterview[] = [
  {
    id: "1",
    candidate: "Jordan Lee",
    role: "Frontend Developer",
    interviewType: "Technical",
    date: "Nov 20, 2026",
    status: "Completed",
    score: 88,
  },
  {
    id: "2",
    candidate: "Samira Khan",
    role: "Backend Engineer",
    interviewType: "System Design",
    date: "Nov 21, 2026",
    status: "In Progress",
    score: null,
  },
  {
    id: "3",
    candidate: "Chris Alvarez",
    role: "Full Stack Developer",
    interviewType: "Technical",
    date: "Nov 22, 2026",
    status: "Scheduled",
    score: null,
  },
  {
    id: "4",
    candidate: "Priya Nair",
    role: "AI Engineer",
    interviewType: "Behavioral",
    date: "Nov 18, 2026",
    status: "Completed",
    score: 91,
  },
  {
    id: "5",
    candidate: "Marcus Chen",
    role: "Backend Engineer",
    interviewType: "Technical",
    date: "Nov 17, 2026",
    status: "Completed",
    score: 76,
  },
  {
    id: "6",
    candidate: "Elena Rossi",
    role: "Frontend Developer",
    interviewType: "Culture Fit",
    date: "Nov 23, 2026",
    status: "Scheduled",
    score: null,
  },
];

/** Demo/mock activity events. */
export const mockActivity: ActivityItem[] = [
  {
    id: "a1",
    title: "Interview completed",
    description: "Jordan Lee scored 88% for Frontend Developer.",
    time: "2 hours ago",
    type: "completed",
  },
  {
    id: "a2",
    title: "Candidate added",
    description: "Elena Rossi was added to the hiring pipeline.",
    time: "5 hours ago",
    type: "candidate",
  },
  {
    id: "a3",
    title: "Report generated",
    description: "AI summary ready for Priya Nair's interview.",
    time: "Yesterday",
    type: "report",
  },
  {
    id: "a4",
    title: "Interview scheduled",
    description: "Chris Alvarez booked for Nov 22 at 10:00 AM.",
    time: "Yesterday",
    type: "scheduled",
  },
];
