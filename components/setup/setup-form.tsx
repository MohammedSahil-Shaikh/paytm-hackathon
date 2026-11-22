"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface, Eyebrow } from "@/components/ui/surface";
import { ApiClientError, createCandidate } from "@/lib/client/api";
import { defaultCandidate, saveCandidateRecord } from "@/lib/client/journey-store";

function splitList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function SetupForm() {
  const router = useRouter();
  const defaults = defaultCandidate();
  const [name, setName] = useState(defaults.name);
  const [email, setEmail] = useState(defaults.email || "");
  const [targetCompany, setTargetCompany] = useState(defaults.targetCompany);
  const [targetRole, setTargetRole] = useState(defaults.targetRole);
  const [skills, setSkills] = useState(defaults.skills.join(", "));
  const [resumeText, setResumeText] = useState(defaults.resumeText || "");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const record = await createCandidate({
        name: name.trim(),
        email: email.trim() || undefined,
        resumeText: resumeText.trim() || undefined,
        skills: splitList(skills),
        experience: [],
        strengths: [],
        skillGaps: [],
        targetRole: targetRole.trim(),
        targetCompany: targetCompany.trim(),
      });
      saveCandidateRecord(record, jobDescription.trim());
      router.push("/research");
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to save candidate",
      );
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-navy-600 bg-[#FFFDF8] px-3 py-2.5 text-sm text-ink-50 outline-none focus:ring-2 focus:ring-gold-500/35";

  return (
    <Surface>
      <Eyebrow>Live candidate intake</Eyebrow>
      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs uppercase tracking-[0.14em] text-ink-400">
            Full name
            <input
              className={fieldClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="block text-xs uppercase tracking-[0.14em] text-ink-400">
            Email (optional)
            <input
              className={fieldClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-xs uppercase tracking-[0.14em] text-ink-400">
            Target company
            <input
              className={fieldClass}
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              required
            />
          </label>
          <label className="block text-xs uppercase tracking-[0.14em] text-ink-400">
            Target role
            <input
              className={fieldClass}
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              required
            />
          </label>
        </div>

        <label className="block text-xs uppercase tracking-[0.14em] text-ink-400">
          Skills (comma-separated)
          <input
            className={fieldClass}
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </label>

        <label className="block text-xs uppercase tracking-[0.14em] text-ink-400">
          Resume text (optional)
          <textarea
            className={`${fieldClass} min-h-28`}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </label>

        <label className="block text-xs uppercase tracking-[0.14em] text-ink-400">
          Job description (optional)
          <textarea
            className={`${fieldClass} min-h-24`}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </label>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Saving profile…
            </>
          ) : (
            "Save & continue to research"
          )}
        </Button>
      </form>
    </Surface>
  );
}
