"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import type { CandidateProfile, ResearchData } from "@/types";

export default function ResearchPage() {
  const router = useRouter();
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [research, setResearch] = useState<ResearchData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const saved = localStorage.getItem("dayzero_candidate");
    if (!saved) { router.replace("/setup"); return; }
    const profile = JSON.parse(saved) as CandidateProfile;
    setCandidate(profile);
    fetch("/api/research", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ company: profile.targetCompany, role: profile.targetRole, jobDescription: localStorage.getItem("dayzero_job_description") ?? "" }) })
      .then(async (response) => { if (!response.ok) throw new Error("Research could not be loaded."); return response.json(); })
      .then(setResearch)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Research failed."));
  }, [router]);
  return <AppShell title="Company Research">
    {!candidate || (!research && !error) ? <p className="text-[#93a4bd]">Researching the company and role…</p> : error ? <p className="text-red-300">{error}</p> : research && <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-[rgba(15,27,45,0.72)] p-6"><p className="text-sm text-[#4f7cff]">{research.company} · {research.role}</p><h2 className="mt-2 text-2xl font-semibold text-white">Company intelligence</h2><p className="mt-3 text-[#c4d0df]">{research.overview}</p></section>
      <section className="grid gap-6 md:grid-cols-2"><div className="rounded-3xl border border-white/10 p-6"><h3 className="font-semibold text-white">Role requirements</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#c4d0df]">{research.jobRequirements.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="rounded-3xl border border-white/10 p-6"><h3 className="font-semibold text-white">Insights</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#c4d0df]">{research.insights.map((item) => <li key={item}>{item}</li>)}</ul></div></section>
      <button onClick={() => { localStorage.setItem("dayzero_research", JSON.stringify(research)); router.push("/interview"); }} className="rounded-xl bg-[#4f7cff] px-5 py-3 font-semibold text-white">Start adaptive interview</button>
    </div>}
  </AppShell>;
}
