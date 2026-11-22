export interface CandidateProfile {
  name: string;
  email?: string;
  resumeText?: string;
  skills: string[];
  experience: string[];
  strengths: string[];
  skillGaps: string[];
  targetRole: string;
  targetCompany: string;
}

export interface CandidateRecord extends CandidateProfile {
  id: string;
  createdAt: string;
}
