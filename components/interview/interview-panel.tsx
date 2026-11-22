"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  Mic,
  MicOff,
  Send,
  Volume2,
  Keyboard,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface, Eyebrow } from "@/components/ui/surface";
import { ProctorCamera } from "@/components/interview/proctor-camera";
import { InterviewAgent } from "@/components/interview/interview-agent";
import {
  ApiClientError,
  finishInterview,
  startInterview,
  submitAnswer,
} from "@/lib/client/api";
import {
  ensureCandidate,
  ensureResearch,
  readJourney,
  writeJourney,
} from "@/lib/client/journey-store";
import {
  canUseSpeechRecognition,
  speakEnglish,
  startEnglishDictation,
  stopSpeaking,
  type DictationHandle,
} from "@/lib/client/speech";
import {
  formatCountdown,
  remainingMs,
} from "@/lib/client/interview-timer";
import type { AnswerEvaluation, NextInterviewAction } from "@/lib/ai/types";
import type { InterviewQuestion } from "@/types";

type Phase = "lobby" | "live" | "complete";

export function InterviewPanel() {
  const router = useRouter();
  const dictationRef = useRef<DictationHandle | null>(null);
  const lastSpokenQuestionId = useRef<string | null>(null);
  const warningCooldownRef = useRef(0);
  const answerRef = useRef("");
  const sessionIdRef = useRef<string | null>(null);
  const currentQuestionRef = useRef<InterviewQuestion | null>(null);
  const submittingRef = useRef(false);
  const autoListenRef = useRef(true);

  const [phase, setPhase] = useState<Phase>("lobby");
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [trail, setTrail] = useState<InterviewQuestion[]>([]);
  const [trailIndex, setTrailIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [nextAction, setNextAction] = useState<NextInterviewAction | null>(null);
  const [source, setSource] = useState<"ai" | "mock" | null>(null);
  const [interviewStartedAt, setInterviewStartedAt] = useState<string | null>(null);
  const [msLeft, setMsLeft] = useState(60 * 60 * 1000);
  const [timedOut, setTimedOut] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [proctorWarnings, setProctorWarnings] = useState(0);
  const [lastProctorNote, setLastProctorNote] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [speakingQuestion, setSpeakingQuestion] = useState(false);
  const [statusLine, setStatusLine] = useState("Waiting to begin");
  const [showTextInput, setShowTextInput] = useState(false);
  const [speechSupported] = useState(() => canUseSpeechRecognition());

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);
  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  const stopDictation = useCallback(() => {
    dictationRef.current?.stop();
    dictationRef.current = null;
    setListening(false);
  }, []);

  const onProctorWarning = useCallback((reason: string) => {
    const now = Date.now();
    if (now - warningCooldownRef.current < 4000) return;
    warningCooldownRef.current = now;
    setLastProctorNote(reason);
    setProctorWarnings((prev) => {
      const next = prev + 1;
      writeJourney({ proctorWarnings: next });
      return next;
    });
  }, []);

  const advanceToQuestion = useCallback(
    (question: InterviewQuestion, plannedIndex: number) => {
      setTrail((prev) => {
        const trimmed = prev.slice(0, trailIndex + 1);
        if (trimmed[trimmed.length - 1]?.id === question.id) return trimmed;
        return [...trimmed, question];
      });
      setTrailIndex((prev) => prev + 1);
      setCurrentQuestion(question);
      setCurrentQuestionIndex(plannedIndex);
      setAnswer("");
      answerRef.current = "";
      setEvaluation(null);
      setNextAction(null);
      lastSpokenQuestionId.current = null;
      writeJourney({
        currentQuestion: question,
        currentQuestionIndex: plannedIndex,
        interviewComplete: false,
      });
    },
    [trailIndex],
  );

  const handleEvaluationResult = useCallback(
    async (data: {
      evaluation: AnswerEvaluation;
      nextAction: NextInterviewAction;
      nextQuestion: InterviewQuestion | null;
      isComplete: boolean;
      currentQuestionIndex: number;
      source: "ai" | "mock";
    }) => {
      setEvaluation(data.evaluation);
      setNextAction(data.nextAction);
      setSource(data.source);
      writeJourney({
        lastEvaluation: data.evaluation,
        currentQuestionIndex: data.currentQuestionIndex,
      });

      const quality = data.evaluation.quality;
      const needsFollowUp =
        data.nextAction === "follow_up" && Boolean(data.nextQuestion);
      const isDone =
        data.isComplete || data.nextAction === "complete" || !data.nextQuestion;

      if (needsFollowUp && data.nextQuestion) {
        setStatusLine("Answer needs a follow-up…");
        await speakEnglish(
          `Thanks for sharing that. I'd love a bit more detail. Here's a follow-up.`,
          {},
        );
        advanceToQuestion(data.nextQuestion, data.currentQuestionIndex);
        return;
      }

      if (isDone) {
        setStatusLine("Wrapping up the interview…");
        await speakEnglish(
          `Okay, that was wonderful. We've covered everything for now. I'll prepare your report.`,
          {
            onend: () => {
              setPhase("complete");
              setCurrentQuestion(null);
              writeJourney({ interviewComplete: true, currentQuestion: null });
            },
          },
        );
        return;
      }

      // Strong / good / next_question → auto advance
      setStatusLine("Moving to the next question…");
      await speakEnglish(
        quality === "strong" || quality === "good"
          ? `Okay, that sounds great. Moving to the next question.`
          : `Okay, thank you. Let's move to the next question.`,
        {},
      );

      if (data.nextQuestion) {
        const plannedIndex =
          questions.findIndex((q) => q.id === data.nextQuestion!.id) >= 0
            ? questions.findIndex((q) => q.id === data.nextQuestion!.id)
            : data.currentQuestionIndex;
        advanceToQuestion(data.nextQuestion, plannedIndex);
      }
    },
    [advanceToQuestion, questions],
  );

  const submitCurrentAnswer = useCallback(
    async (rawAnswer?: string) => {
      const sid = sessionIdRef.current;
      const question = currentQuestionRef.current;
      const trimmed = (rawAnswer ?? answerRef.current).trim();
      if (!sid || !question || submittingRef.current || timedOut) return;
      if (!trimmed) {
        setError("I didn't catch an answer yet. Please speak a little more.");
        setStatusLine("Listening again…");
        return;
      }
      if (!cameraReady) {
        onProctorWarning("Answer submitted without live camera.");
      }

      stopDictation();
      stopSpeaking();
      setSubmitting(true);
      submittingRef.current = true;
      setError(null);
      setStatusLine("Analyzing your answer…");

      try {
        const data = await submitAnswer({
          sessionId: sid,
          answer: trimmed,
          question,
        });
        setAnswer("");
        answerRef.current = "";
        await handleEvaluationResult(data);
      } catch (err) {
        setError(
          err instanceof ApiClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to submit answer",
        );
        setStatusLine("Ready when you are");
      } finally {
        setSubmitting(false);
        submittingRef.current = false;
      }
    },
    [cameraReady, handleEvaluationResult, onProctorWarning, stopDictation, timedOut],
  );

  const startListening = useCallback(() => {
    if (submittingRef.current || timedOut) return;
    stopDictation();
    stopSpeaking();
    setError(null);
    setStatusLine("Listening… please answer out loud");

    const handle = startEnglishDictation({
      silenceMs: 2200,
      minCharsForAutoSubmit: 20,
      onPartial: (text) => {
        setAnswer(text);
        answerRef.current = text;
      },
      onFinal: (text) => {
        setAnswer(text);
        answerRef.current = text;
      },
      onSilenceComplete: (text) => {
        void submitCurrentAnswer(text);
      },
      onError: (message) => {
        setError(message);
        setListening(false);
        setShowTextInput(true);
        setStatusLine("Mic issue — you can type your answer");
      },
      onEnd: () => setListening(false),
    });

    if (handle) {
      dictationRef.current = handle;
      setListening(true);
    } else {
      setShowTextInput(true);
      setStatusLine("Type your answer, then press Submit");
    }
  }, [stopDictation, submitCurrentAnswer, timedOut]);

  const speakQuestion = useCallback(
    (question: InterviewQuestion) => {
      lastSpokenQuestionId.current = question.id;
      stopDictation();
      setSpeakingQuestion(true);
      setStatusLine("Agent is asking a question…");
      void speakEnglish(`Here's your question. ${question.question}`, {
        onend: () => {
          setSpeakingQuestion(false);
          if (autoListenRef.current) {
            // Small beat so TTS release doesn't clip the mic
            window.setTimeout(() => startListening(), 350);
          }
        },
        onerror: (message) => {
          setSpeakingQuestion(false);
          setError(message);
          startListening();
        },
      });
    },
    [startListening, stopDictation],
  );

  useEffect(() => {
    const existing = readJourney();
    if (
      existing.sessionId &&
      existing.currentQuestion &&
      existing.interviewStartedAt &&
      !existing.interviewComplete
    ) {
      setSessionId(existing.sessionId);
      setQuestions(existing.questions);
      setCurrentQuestion(existing.currentQuestion);
      setCurrentQuestionIndex(existing.currentQuestionIndex);
      setTrail(
        existing.questions.length
          ? existing.questions.slice(0, Math.max(1, existing.currentQuestionIndex + 1))
          : [existing.currentQuestion],
      );
      setTrailIndex(Math.max(0, existing.currentQuestionIndex));
      setEvaluation(existing.lastEvaluation);
      setSource(existing.interviewSource);
      setInterviewStartedAt(existing.interviewStartedAt);
      setProctorWarnings(existing.proctorWarnings || 0);
      setPhase("live");
    }
    return () => {
      stopDictation();
      stopSpeaking();
    };
  }, [stopDictation]);

  useEffect(() => {
    if (phase !== "live" || !interviewStartedAt) return;
    const tick = () => {
      const left = remainingMs(interviewStartedAt);
      setMsLeft(left);
      if (left <= 0) setTimedOut(true);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [phase, interviewStartedAt]);

  useEffect(() => {
    if (!timedOut || phase === "complete") return;
    stopDictation();
    stopSpeaking();
    setPhase("complete");
    setCurrentQuestion(null);
    writeJourney({ interviewComplete: true, currentQuestion: null });
    setError("Time is up (60 minutes). Generate your report from answers so far.");
  }, [timedOut, phase, stopDictation]);

  useEffect(() => {
    if (phase !== "live" || !currentQuestion || submitting) return;
    if (lastSpokenQuestionId.current === currentQuestion.id) return;
    speakQuestion(currentQuestion);
  }, [phase, currentQuestion, submitting, speakQuestion]);

  const onCameraStatus = useCallback((ready: boolean) => {
    setCameraReady(ready);
  }, []);

  async function beginInterview(requireCamera: boolean) {
    if (starting) return;
    if (requireCamera && !cameraReady) {
      setError("Turn on the camera (top right → Allow camera), or start without camera.");
      return;
    }
    if (!cameraReady) {
      onProctorWarning("Interview started without live proctor camera.");
    }

    setStarting(true);
    setError(null);
    try {
      const existing = readJourney();
      const candidate = ensureCandidate();
      const research = ensureResearch(candidate);
      const jobDescription = existing.jobDescription || "";
      const startedAt = new Date().toISOString();

      writeJourney({
        sessionId: null,
        questions: [],
        currentQuestion: null,
        interviewComplete: false,
        interviewStartedAt: null,
        report: null,
        onboardingPlan: null,
        lastEvaluation: null,
      });

      const data = await startInterview({
        candidate,
        research,
        jobDescription,
      });

      lastSpokenQuestionId.current = null;
      autoListenRef.current = true;
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setCurrentQuestion(data.currentQuestion);
      setCurrentQuestionIndex(data.currentQuestionIndex);
      setTrail([data.currentQuestion]);
      setTrailIndex(0);
      setSource(data.source);
      setEvaluation(null);
      setNextAction(null);
      setAnswer("");
      setTimedOut(false);
      setInterviewStartedAt(startedAt);
      setPhase("live");
      setStatusLine("Interview started");

      writeJourney({
        candidate,
        research,
        jobDescription,
        sessionId: data.sessionId,
        questions: data.questions,
        currentQuestion: data.currentQuestion,
        currentQuestionIndex: data.currentQuestionIndex,
        interviewSource: data.source,
        interviewComplete: false,
        interviewStartedAt: startedAt,
        proctorWarnings: cameraReady ? 0 : 1,
        lastEvaluation: null,
        report: null,
        onboardingPlan: null,
      });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to start interview",
      );
    } finally {
      setStarting(false);
    }
  }

  function toggleListening() {
    if (listening) {
      const text = answerRef.current.trim();
      stopDictation();
      if (text.length >= 12) {
        void submitCurrentAnswer(text);
      } else {
        setStatusLine("Answer was too short — keep speaking or type more");
      }
      return;
    }
    if (speakingQuestion) {
      setError("Wait for the agent to finish asking the question.");
      return;
    }
    startListening();
  }

  function replayQuestion() {
    if (!currentQuestion || submitting) return;
    lastSpokenQuestionId.current = null;
    speakQuestion(currentQuestion);
  }

  function goBack() {
    if (trailIndex <= 0) return;
    stopDictation();
    stopSpeaking();
    const nextIndex = trailIndex - 1;
    const question = trail[nextIndex];
    if (!question) return;
    setTrailIndex(nextIndex);
    setCurrentQuestion(question);
    setCurrentQuestionIndex(Math.max(0, questions.findIndex((q) => q.id === question.id)));
    setAnswer("");
    setEvaluation(null);
    lastSpokenQuestionId.current = null;
    writeJourney({ currentQuestion: question });
  }

  function goNext() {
    stopDictation();
    stopSpeaking();
    if (!currentQuestion) return;
    const idx = questions.findIndex((q) => q.id === currentQuestion.id);
    if (trailIndex < trail.length - 1) {
      const nextIdx = trailIndex + 1;
      const question = trail[nextIdx];
      if (!question) return;
      setTrailIndex(nextIdx);
      setCurrentQuestion(question);
      lastSpokenQuestionId.current = null;
      return;
    }
    const nextPlanned = idx >= 0 ? questions[idx + 1] : null;
    if (nextPlanned) {
      advanceToQuestion(nextPlanned, idx + 1);
      return;
    }
    setPhase("complete");
    setCurrentQuestion(null);
    writeJourney({ interviewComplete: true, currentQuestion: null });
  }

  async function onFinish() {
    if (!sessionId || finishing) return;
    stopDictation();
    stopSpeaking();
    setFinishing(true);
    setError(null);
    try {
      const data = await finishInterview(sessionId);
      writeJourney({
        report: data.report,
        interviewComplete: true,
        interviewSource: data.source,
      });
      router.push("/report");
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to finish interview",
      );
    } finally {
      setFinishing(false);
    }
  }

  const timerUrgent = msLeft <= 5 * 60 * 1000;
  const canSubmit =
    phase === "live" &&
    Boolean(answer.trim()) &&
    !submitting &&
    !listening &&
    !timedOut;
  const canGoBack = trailIndex > 0 && phase === "live";
  const canGoNext =
    phase === "live" &&
    (trailIndex < trail.length - 1 ||
      Boolean(
        currentQuestion &&
          questions.findIndex((q) => q.id === currentQuestion.id) < questions.length - 1,
      ));

  return (
    <div className="relative pb-28">
      <ProctorCamera
        compact
        enabled
        className="fixed right-4 top-20 z-40 sm:right-6 sm:top-24"
        onStatusChange={onCameraStatus}
        onWarning={onProctorWarning}
      />

      {phase === "lobby" ? (
        <Surface className="mx-auto max-w-2xl">
          <InterviewAgent speaking={false} />
          <h2 className="mt-6 text-center font-display text-2xl font-semibold text-ink-50">
            Ready when you are
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-ink-300">
            After you begin, the agent asks each question in a sweet female voice, then
            listens automatically. Pause when you finish speaking and she will analyze
            your answer, follow up if needed, or move on.
          </p>
          {error ? (
            <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-200">
              {error}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={() => void beginInterview(true)} disabled={starting || !cameraReady}>
              {starting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Starting…
                </>
              ) : (
                <>
                  Begin interview
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              disabled={starting}
              onClick={() => void beginInterview(false)}
            >
              Start without camera
            </Button>
          </div>
        </Surface>
      ) : null}

      {phase !== "lobby" ? (
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Surface>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Eyebrow>Progress</Eyebrow>
                <p className="mt-3 font-display text-3xl font-semibold text-gold-500">
                  {Math.min(trailIndex + 1, Math.max(questions.length, 1))} /{" "}
                  {Math.max(questions.length, 1)}
                </p>
                <p className="mt-2 text-sm text-ink-300">
                  Conversational · English female voice
                  {source ? ` · ${source}` : ""}
                </p>
              </div>
              <div className="text-right">
                <Eyebrow>Test timer</Eyebrow>
                <p
                  className={`mt-2 font-display text-3xl font-semibold tabular-nums ${
                    timerUrgent ? "text-red-300" : "text-ink-50"
                  }`}
                >
                  {formatCountdown(msLeft)}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    currentQuestion?.id === question.id
                      ? "bg-gold-500/15 text-gold-400"
                      : "bg-navy-900/40 text-ink-400"
                  }`}
                >
                  Q{index + 1} · {question.category}
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs text-gold-400">{statusLine}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-400">
              <span>Proctor warnings: {proctorWarnings}</span>
            </div>
            {lastProctorNote ? (
              <p className="mt-2 text-xs text-gold-400">{lastProctorNote}</p>
            ) : null}
          </Surface>

          <Surface className="min-h-[420px] sm:pr-[250px]">
            {error ? (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {phase === "complete" || !currentQuestion ? (
              <div>
                <InterviewAgent speaking={false} label="Interview complete" />
                <div className="mt-6">
                  <Eyebrow>
                    {timedOut ? "Time expired" : "Interview complete"}
                  </Eyebrow>
                </div>
                <h2 className="mt-3 font-display text-2xl font-semibold text-ink-50">
                  Ready to generate your evidence-based report
                </h2>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={() => void onFinish()} disabled={finishing}>
                    {finishing ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Generating report…
                      </>
                    ) : (
                      "Generate report"
                    )}
                  </Button>
                  <ButtonLink href="/report" variant="secondary">
                    Go to report page
                  </ButtonLink>
                </div>
              </div>
            ) : (
              <>
                <InterviewAgent
                  speaking={speakingQuestion}
                  listening={listening}
                />

                <div className="mt-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <Eyebrow>{currentQuestion.category}</Eyebrow>
                    <span className="rounded-full bg-navy-700 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-ink-300">
                      {currentQuestion.difficulty}
                    </span>
                    {listening ? (
                      <span className="rounded-full bg-gold-500/15 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-gold-400">
                        Listening to you
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-4 font-display text-xl font-semibold leading-snug text-ink-50 sm:text-2xl">
                    {currentQuestion.question}
                  </h2>
                </div>

                {evaluation ? (
                  <div className="mt-6 rounded-2xl border border-gold-500/20 bg-navy-900/60 p-4">
                    <Eyebrow>Latest evaluation</Eyebrow>
                    <p className="mt-2 text-sm text-ink-100">
                      <span className="font-semibold text-gold-400">
                        {evaluation.quality}
                      </span>
                      {" · "}
                      score {evaluation.score}/100
                      {nextAction ? ` · ${nextAction}` : ""}
                    </p>
                    <p className="mt-2 text-sm text-ink-300">{evaluation.feedback}</p>
                  </div>
                ) : null}

                <div className="mt-6 rounded-[22px] border border-gold-500/15 bg-navy-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-ink-400">
                    Live transcript
                  </p>
                  <p className="mt-3 min-h-16 whitespace-pre-wrap text-sm leading-relaxed text-ink-100">
                    {answer ||
                      (listening
                        ? "I'm listening… speak naturally, then pause when finished."
                        : speakingQuestion
                          ? "Agent is speaking…"
                          : statusLine)}
                  </p>

                  {showTextInput ? (
                    <textarea
                      value={answer}
                      onChange={(event) => {
                        setAnswer(event.target.value);
                        answerRef.current = event.target.value;
                      }}
                      rows={4}
                      disabled={submitting || listening}
                      placeholder="Optional typed answer…"
                      className="mt-3 w-full resize-y rounded-xl border border-gold-500/10 bg-navy-950/60 px-3 py-3 text-sm text-ink-100 outline-none ring-gold-500/40 placeholder:text-ink-400 focus:ring-2"
                    />
                  ) : (
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-400 hover:text-gold-400"
                      onClick={() => setShowTextInput(true)}
                    >
                      <Keyboard className="h-3.5 w-3.5" />
                      Optional: type instead
                    </button>
                  )}

                  {!speechSupported ? (
                    <p className="mt-3 text-xs text-gold-400">
                      Speech recognition unavailable — type your answer, then Submit.
                    </p>
                  ) : null}
                </div>
              </>
            )}
          </Surface>
        </div>
      ) : null}

      {phase === "live" && currentQuestion ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gold-500/20 bg-navy-950/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3">
            <Button variant="secondary" onClick={goBack} disabled={!canGoBack || submitting}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={toggleListening}
              disabled={submitting || speakingQuestion}
              variant={listening ? "secondary" : "primary"}
            >
              {listening ? (
                <>
                  <MicOff className="h-4 w-4" />
                  I&apos;m done speaking
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Speak again
                </>
              )}
            </Button>
            <Button variant="secondary" onClick={replayQuestion} disabled={submitting || listening}>
              <Volume2 className="h-4 w-4" />
              Replay
            </Button>
            <Button onClick={() => void submitCurrentAnswer()} disabled={!canSubmit}>
              {submitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
            <Button onClick={goNext} disabled={!canGoNext || submitting || listening}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
