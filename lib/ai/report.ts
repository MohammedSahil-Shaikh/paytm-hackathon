/**
 * Member 1 — Interview report generation.
 */
import type {
  CandidateProfile,
  InterviewMessage,
  InterviewQuestion,
  InterviewReport,
} from "@/types";

export async function generateInterviewReport(input: {
  candidate: CandidateProfile;
  questions: InterviewQuestion[];
  transcript: InterviewMessage[];
}): Promise<InterviewReport> {
  void input;
  throw new Error("Not implemented: lib/ai/report.generateInterviewReport");
}
