"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";

export default function AssistantPage() {
  const [question, setQuestion] = useState(""); const [answer, setAnswer] = useState(""); const [loading, setLoading] = useState(false);
  async function ask(event: FormEvent) { event.preventDefault(); setLoading(true); const candidate = JSON.parse(localStorage.getItem("dayzero_candidate") ?? "{}"); const response = await fetch("/api/hr-assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question, company: candidate.targetCompany ?? "your company", role: candidate.targetRole ?? "your role", onboardingContext: localStorage.getItem("dayzero_onboarding_context") ?? "" }) }); setAnswer((await response.json()).answer); setLoading(false); }
  return <AppShell title="HR AI Assistant"><div className="max-w-2xl space-y-5"><p className="text-[#c4d0df]">Ask about onboarding or policies. The assistant will not invent information it cannot verify.</p><form onSubmit={ask} className="space-y-4"><textarea required value={question} onChange={(event) => setQuestion(event.target.value)} rows={4} placeholder="Ask a question…" className="w-full rounded-2xl border border-white/10 bg-[#0b1627] p-4 text-white outline-none focus:border-[#4f7cff]" /><button disabled={loading} className="rounded-xl bg-[#4f7cff] px-5 py-3 font-semibold text-white">{loading ? "Checking…" : "Ask assistant"}</button></form>{answer && <div className="rounded-2xl border border-white/10 p-5 text-[#c4d0df]">{answer}</div>}</div></AppShell>;
}
