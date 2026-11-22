"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import type { InterviewReport } from "@/types";

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<InterviewReport | null>(null);
  useEffect(() => { const saved = localStorage.getItem("dayzero_report"); if (saved) setReport(JSON.parse(saved)); }, []);
  return <AppShell title="Interview Report">{!report ? <p className="text-[#93a4bd]">Complete the interview to generate your report.</p> : <div className="space-y-6"><section className="rounded-3xl border border-white/10 bg-[rgba(15,27,45,0.72)] p-6"><p className="text-sm text-[#4f7cff]">Evidence from your answers</p><p className="mt-3 text-lg text-white">{report.overallSummary}</p></section><div className="grid gap-6 md:grid-cols-2"><section className="rounded-3xl border border-white/10 p-6"><h2 className="font-semibold text-white">Strengths</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#c4d0df]">{report.strengths.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="rounded-3xl border border-white/10 p-6"><h2 className="font-semibold text-white">Areas to improve</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#c4d0df]">{report.improvementAreas.map((item) => <li key={item}>{item}</li>)}</ul></section></div><section className="rounded-3xl border border-white/10 p-6"><h2 className="font-semibold text-white">Recommendations</h2><ul className="mt-3 space-y-3 text-sm text-[#c4d0df]">{report.recommendations.map((item) => <li key={item}>→ {item}</li>)}</ul></section><button onClick={() => router.push("/onboarding")} className="rounded-xl bg-[#4f7cff] px-5 py-3 font-semibold text-white">Generate my DayZero plan</button></div>}</AppShell>;
}
