"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import type { CandidateProfile, InterviewMessage, InterviewQuestion, ResearchData } from "@/types";

export default function InterviewPage() {
  const router = useRouter();
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [research, setResearch] = useState<ResearchData | null>(null);
  const [question, setQuestion] = useState<InterviewQuestion | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [transcript, setTranscript] = useState<InterviewMessage[]>([]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  useEffect(() => {
    const profile = localStorage.getItem("dayzero_candidate"); const context = localStorage.getItem("dayzero_research");
    if (!profile || !context) { router.replace("/setup"); return; }
    const parsedCandidate = JSON.parse(profile) as CandidateProfile; const parsedResearch = JSON.parse(context) as ResearchData;
    setCandidate(parsedCandidate); setResearch(parsedResearch);
    fetch("/api/interview/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ candidate: parsedCandidate, research: parsedResearch, jobDescription: localStorage.getItem("dayzero_job_description") ?? "" }) }).then((response) => response.json()).then((data) => { setQuestions(data.questions); setQuestion(data.questions[0]); }).finally(() => setLoading(false));
  }, [router]);
  async function submit(event: FormEvent) { event.preventDefault(); if (!question || !candidate || !research || !answer.trim()) return; const candidateMessage: InterviewMessage = { id: crypto.randomUUID(), role: "candidate", content: answer.trim(), questionId: question.id, timestamp: new Date().toISOString() }; const nextTranscript = [...transcript, candidateMessage]; setTranscript(nextTranscript); setAnswer(""); setFeedback("Evaluating your answer…"); const response = await fetch("/api/interview/answer", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId: "browser-session", question, answer: candidateMessage.content, transcript }) }); const result = await response.json(); setFeedback(`${result.evaluation.rating}: ${result.evaluation.feedback}`); if (result.isComplete) { const reportResponse = await fetch("/api/interview/finish", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ candidate, questions, transcript: nextTranscript }) }); localStorage.setItem("dayzero_report", JSON.stringify(await reportResponse.json())); setFinished(true); } else { const next = result.followUp ?? result.nextQuestion; if (next) setQuestion(next); } }
  return <AppShell title="AI Interview"><div className="max-w-3xl space-y-5">{loading ? <p className="text-[#93a4bd]">Preparing your role-specific interview…</p> : finished ? <div className="rounded-3xl border border-[#4f7cff]/40 bg-[#111f39] p-8"><p className="text-sm text-[#7e9cff]">Interview complete</p><h2 className="mt-2 text-3xl font-semibold text-white">Your insights are ready.</h2><p className="mt-3 text-[#c4d0df]">Your answers were used to create an evidence-based report and onboarding plan.</p><button onClick={() => router.push("/report")} className="mt-6 rounded-xl bg-[#4f7cff] px-5 py-3 font-semibold text-white">View report</button></div> : question && <><div className="rounded-3xl border border-white/10 bg-[rgba(15,27,45,0.72)] p-6"><p className="text-sm text-[#4f7cff]">Question {transcript.length + 1}</p><h2 className="mt-3 text-xl font-semibold text-white">{question.question}</h2><p className="mt-3 text-sm text-[#93a4bd]">{question.category} · {question.difficulty}</p></div><form onSubmit={submit} className="space-y-4"><textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={7} placeholder="Explain your thinking and include a concrete example…" className="w-full rounded-2xl border border-white/10 bg-[#0b1627] p-4 text-white outline-none focus:border-[#4f7cff]" /><button className="rounded-xl bg-[#4f7cff] px-5 py-3 font-semibold text-white">Submit answer</button></form>{feedback && <p className="rounded-xl border border-white/10 p-4 text-sm text-[#c4d0df]">{feedback}</p>}</>}</div></AppShell>;
}
