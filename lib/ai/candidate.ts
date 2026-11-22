import { candidateInputSchema } from "@/lib/ai/schemas";
import { createId, nowIso, truncateText } from "@/lib/ai/utils";
import type { CandidateProfile, CandidateRecord } from "@/types";
import { z } from "zod";

const KNOWN_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "FastAPI",
  "Django",
  "Java",
  "Spring",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Kafka",
  "AWS",
  "Docker",
  "Kubernetes",
  "GraphQL",
  "REST",
  "System Design",
  "CI/CD",
];

function uniqNormalize(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const cleaned = value.trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }
  return result;
}

export function extractSkillsFromResume(resumeText: string): string[] {
  if (!resumeText.trim()) return [];
  return KNOWN_SKILLS.filter((skill) =>
    new RegExp(`\\b${skill.replace(".", "\\.")}\\b`, "i").test(resumeText),
  );
}

export function normalizeCandidate(
  input: z.infer<typeof candidateInputSchema>,
): CandidateProfile {
  const resumeText = truncateText(input.resumeText ?? "");
  const extracted = extractSkillsFromResume(resumeText);
  const skills = uniqNormalize([...(input.skills ?? []), ...extracted]);

  return {
    name: input.name.trim(),
    email: input.email?.trim() || undefined,
    resumeText: resumeText || undefined,
    skills,
    experience: uniqNormalize(input.experience ?? []),
    strengths: uniqNormalize(input.strengths ?? []),
    skillGaps: uniqNormalize(input.skillGaps ?? []),
    targetRole: input.targetRole.trim(),
    targetCompany: input.targetCompany.trim(),
  };
}

export function createCandidateRecord(
  profile: CandidateProfile,
): CandidateRecord {
  return {
    id: createId("cand"),
    createdAt: nowIso(),
    ...profile,
  };
}

export async function processCandidate(
  raw: unknown,
): Promise<CandidateRecord> {
  const parsed = candidateInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid candidate data");
  }
  const profile = normalizeCandidate(parsed.data);
  return createCandidateRecord(profile);
}
