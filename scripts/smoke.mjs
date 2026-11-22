/**
 * DayZero smoke test — pages + core APIs against a running dev server.
 * Usage: node scripts/smoke.mjs [baseUrl]
 */

const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

const pages = [
  "/",
  "/setup",
  "/research",
  "/interview",
  "/report",
  "/onboarding",
  "/roadmap",
  "/assistant",
];

const candidate = {
  name: "Jordan Lee",
  email: "jordan.lee@example.com",
  resumeText:
    "Backend engineer with Python, FastAPI, PostgreSQL, and Redis. Built payment APIs and merchant tooling.",
  skills: ["Python", "FastAPI", "PostgreSQL", "Redis", "System Design"],
  experience: ["3 years backend engineering", "Built checkout APIs"],
  strengths: ["API design", "Ownership"],
  skillGaps: ["Kafka"],
  targetRole: "Backend Engineer",
  targetCompany: "Paytm",
};

const researchSeed = {
  company: "Paytm",
  role: "Backend Engineer",
  overview: "Paytm fintech platform for payments and financial services.",
  jobRequirements: ["Python", "PostgreSQL", "Redis", "API design"],
  recentNews: [],
  insights: ["Focus on payment reliability and scalable APIs."],
  sources: [],
};

function ok(label) {
  console.log(`  ✓ ${label}`);
}

function fail(label, detail) {
  console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

async function checkPage(path) {
  const res = await fetch(`${base}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  if (!html || html.length < 40) throw new Error("empty body");
  ok(`GET ${path} (${res.status})`);
}

async function postJson(path, body) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { res, json };
}

async function main() {
  console.log(`\nDayZero smoke → ${base}\n`);
  let failures = 0;

  console.log("Pages");
  for (const path of pages) {
    try {
      await checkPage(path);
    } catch (err) {
      failures += 1;
      fail(`GET ${path}`, err instanceof Error ? err.message : String(err));
    }
  }

  console.log("\nAPIs");
  try {
    const { res, json } = await postJson("/api/candidate", candidate);
    if (!res.ok || !json?.success || !json?.data?.id) {
      throw new Error(json?.error?.message || `HTTP ${res.status}`);
    }
    ok(`POST /api/candidate (${json.data.id})`);
  } catch (err) {
    failures += 1;
    fail("POST /api/candidate", err instanceof Error ? err.message : String(err));
  }

  try {
    const { res, json } = await postJson("/api/research", {
      company: "Paytm",
      role: "Backend Engineer",
      jobDescription: "Backend engineer for payment APIs",
    });
    if (!res.ok || !json?.company || !json?.role) {
      throw new Error(json?.error?.message || `HTTP ${res.status}`);
    }
    ok(`POST /api/research (${json.company} / ${json.role})`);
  } catch (err) {
    failures += 1;
    fail("POST /api/research", err instanceof Error ? err.message : String(err));
  }

  let sessionId = null;
  let question = null;
  try {
    const { res, json } = await postJson("/api/interview/start", {
      candidate,
      research: researchSeed,
      jobDescription: "Backend Engineer at Paytm",
    });
    if (!res.ok || !json?.success || !json?.data?.sessionId) {
      throw new Error(json?.error?.message || `HTTP ${res.status}`);
    }
    sessionId = json.data.sessionId;
    question = json.data.currentQuestion;
    ok(
      `POST /api/interview/start (${sessionId}, ${json.data.questions?.length || 0} Qs, source=${json.data.source})`,
    );
  } catch (err) {
    failures += 1;
    fail("POST /api/interview/start", err instanceof Error ? err.message : String(err));
  }

  if (sessionId && question) {
    try {
      const { res, json } = await postJson("/api/interview/answer", {
        sessionId,
        question,
        answer:
          "I would design scalable payment APIs with idempotency keys, PostgreSQL transactions, Redis caching for hot paths, and clear SLOs for latency and availability.",
      });
      if (!res.ok || !json?.success || !json?.data?.evaluation) {
        throw new Error(json?.error?.message || `HTTP ${res.status}`);
      }
      ok(
        `POST /api/interview/answer (quality=${json.data.evaluation.quality}, next=${json.data.nextAction})`,
      );
    } catch (err) {
      failures += 1;
      fail("POST /api/interview/answer", err instanceof Error ? err.message : String(err));
    }

    try {
      const { res, json } = await postJson("/api/interview/finish", { sessionId });
      if (!res.ok || !json?.success || !json?.data?.report) {
        throw new Error(json?.error?.message || `HTTP ${res.status}`);
      }
      ok("POST /api/interview/finish (report generated)");
    } catch (err) {
      failures += 1;
      fail("POST /api/interview/finish", err instanceof Error ? err.message : String(err));
    }
  }

  try {
    const { res, json } = await postJson("/api/onboarding", {
      candidate,
      research: researchSeed,
      report: {
        overallSummary: "Strong backend fundamentals with ownership mindset.",
        strengths: ["API design", "Ownership"],
        improvementAreas: ["Kafka"],
        skillAnalysis: [],
        answerFeedback: [],
        recommendations: ["Practice distributed systems interview prompts"],
      },
    });
    if (!res.ok || !json?.success || !json?.data) {
      throw new Error(json?.error?.message || `HTTP ${res.status}`);
    }
    ok("POST /api/onboarding");
  } catch (err) {
    failures += 1;
    fail("POST /api/onboarding", err instanceof Error ? err.message : String(err));
  }

  try {
    const { res, json } = await postJson("/api/hr-assistant", {
      question: "What should I focus on in Days 1–30?",
      company: "Paytm",
      role: "Backend Engineer",
      policyContext: "",
      onboardingContext: "Focus on service ownership and payment API reliability.",
    });
    if (!res.ok || !json?.success || !json?.data?.response?.answer) {
      throw new Error(json?.error?.message || `HTTP ${res.status}`);
    }
    ok("POST /api/hr-assistant");
  } catch (err) {
    failures += 1;
    fail("POST /api/hr-assistant", err instanceof Error ? err.message : String(err));
  }

  console.log(
    failures === 0
      ? "\nSmoke passed.\n"
      : `\nSmoke finished with ${failures} failure(s).\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
