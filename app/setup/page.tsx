"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import type { CandidateProfile } from "@/types";

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", company: "Paytm", role: "Backend Engineer", jobDescription: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const candidate: CandidateProfile = {
      name: form.name,
      targetCompany: form.company,
      targetRole: form.role,
      skills: [],
      experience: [],
      strengths: [],
      skillGaps: [],
    };
    try {
      const response = await fetch("/api/candidate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(candidate) });
      if (!response.ok) throw new Error("Please enter your name, company, and role.");
      const saved = await response.json();
      localStorage.setItem("dayzero_candidate", JSON.stringify(saved));
      localStorage.setItem("dayzero_job_description", form.jobDescription);
      router.push("/research");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save setup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Candidate Setup">
      <form onSubmit={submit} className="max-w-2xl space-y-5 rounded-3xl border border-white/10 bg-[rgba(15,27,45,0.72)] p-6">
        {[["name", "Full name"], ["company", "Target company"], ["role", "Target role"]].map(([key, label]) => (
          <label key={key} className="block text-sm text-[#93a4bd]">{label}
            <input required value={form[key as keyof typeof form]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1627] px-4 py-3 text-white outline-none focus:border-[#4f7cff]" />
          </label>
        ))}
        <label className="block text-sm text-[#93a4bd]">Job description (optional)
          <textarea value={form.jobDescription} onChange={(event) => setForm({ ...form, jobDescription: event.target.value })} rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1627] px-4 py-3 text-white outline-none focus:border-[#4f7cff]" />
        </label>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button disabled={loading} className="rounded-xl bg-[#4f7cff] px-5 py-3 font-semibold text-white disabled:opacity-60">{loading ? "Saving…" : "Start research"}</button>
      </form>
    </AppShell>
  );
}
