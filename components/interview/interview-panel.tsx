"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  LoaderCircle,
  Mic,
  MicOff,
  Send,
  Volume2,
  Keyboard,
  X,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  ProctorCamera,
  type ProctorCameraHandle,
} from "@/components/interview/proctor-camera";
import { InterviewAgent } from "@/components/interview/interview-agent";
import { ProgressSidebar } from "@/components/interview/progress-sidebar";
import { seedDemoJourney } from "@/lib/client/seed";
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
  resetInterviewProgress,
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
  const cameraRef = useRef<ProctorCameraHandle | null>(null);
  const manualTypingRef = useRef(false);

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
  const [showTextInput, setShowTextInput] = useState(true);
  const [speechSupported] = useState(() => canUseSpeechRecognition());
  const [canResume, setCanResume] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  useEffect(() => {
    if (!showFinishConfirm) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !finishing) setShowFinishConfirm(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showFinishConfirm, finishing]);
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
        setPhase("complete");
        setCurrentQuestion(null);
        writeJourney({ interviewComplete: true, currentQuestion: null });
        await speakEnglish(
          `Okay, that was wonderful. We've covered everything for now. I'll prepare your report.`,
        );
        // Persist report immediately so /report doesn't depend on a live in-memory session.
        const sid = sessionIdRef.current;
        if (sid && !readJourney().report) {
          try {
            const finished = await finishInterview(sid);
            writeJourney({
              report: finished.report,
              interviewComplete: true,
              interviewSource: finished.source,
            });
          } catch {
            // User can still retry Generate report from the complete screen.
          }
        }
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
        setAnsweredIds((prev) => {
          const next = prev.includes(question.id) ? prev : [...prev, question.id];
          writeJourney({
            answeredQuestionIds: next,
            skippedQuestionIds: (readJourney().skippedQuestionIds || []).filter(
              (id) => id !== question.id,
            ),
          });
          return next;
        });
        setSkippedIds((prev) => prev.filter((id) => id !== question.id));
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
    manualTypingRef.current = false;
    setError(null);
    setStatusLine("Listening… speak or type your answer");
    setShowTextInput(true);

    const handle = startEnglishDictation({
      silenceMs: 3500,
      minCharsForAutoSubmit: 40,
      onPartial: (text) => {
        if (manualTypingRef.current) return;
        setAnswer(text);
        answerRef.current = text;
      },
      onFinal: (text) => {
        if (manualTypingRef.current) return;
        setAnswer(text);
        answerRef.current = text;
      },
      onSilenceComplete: (text) => {
        const payload = manualTypingRef.current
          ? answerRef.current
          : text || answerRef.current;
        void submitCurrentAnswer(payload);
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
            // Wait for TTS audio to fully release before opening the mic
            window.setTimeout(() => startListening(), 900);
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
    seedDemoJourney({ clearInterview: false });
    const existing = readJourney();
    // Never auto-jump into a live session — in-memory server sessions die on refresh.
    // Offer an explicit resume only when we still have local question state.
    if (
      existing.sessionId &&
      existing.currentQuestion &&
      existing.interviewStartedAt &&
      !existing.interviewComplete
    ) {
      setCanResume(true);
      setSessionId(existing.sessionId);
      setQuestions(existing.questions);
      setCurrentQuestion(existing.currentQuestion);
      setCurrentQuestionIndex(existing.currentQuestionIndex);
      setEvaluation(existing.lastEvaluation);
      setSource(existing.interviewSource);
      setInterviewStartedAt(existing.interviewStartedAt);
      setProctorWarnings(existing.proctorWarnings || 0);
      setSkippedIds(existing.skippedQuestionIds || []);
      setAnsweredIds(existing.answeredQuestionIds || []);
    }
    return () => {
      stopDictation();
      stopSpeaking();
    };
  }, [stopDictation]);

  function resumeInterview() {
    if (!cameraReady) {
      setError("Camera must be live before you can resume the interview.");
      return;
    }
    const existing = readJourney();
    if (!existing.sessionId || !existing.currentQuestion) {
      setError("No resumable session found. Start a new interview.");
      setCanResume(false);
      return;
    }
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
    lastSpokenQuestionId.current = null;
    setPhase("live");
    setStatusLine("Resumed interview");
  }

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

  async function beginInterview() {
    if (starting) return;
    if (!cameraReady) {
      setError("Camera must be live before the interview can begin. Allow access and retry.");
      return;
    }

    setStarting(true);
    setError(null);
    try {
      const existing = readJourney();
      const candidate = ensureCandidate();
      const research = ensureResearch(candidate);
      const jobDescription = existing.jobDescription || "";
      const startedAt = new Date().toISOString();

      resetInterviewProgress();
      writeJourney({ onboardingPlan: null });

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
      setSkippedIds([]);
      setAnsweredIds([]);
      setShowFinishConfirm(false);
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
        proctorWarnings: 0,
        skippedQuestionIds: [],
        answeredQuestionIds: [],
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

  function skipQuestion() {
    if (!currentQuestion || submitting || finishing) return;
    stopDictation();
    stopSpeaking();
    const questionId = currentQuestion.id;
    setSkippedIds((prev) => {
      const next = prev.includes(questionId) ? prev : [...prev, questionId];
      writeJourney({
        skippedQuestionIds: next,
        answeredQuestionIds: (readJourney().answeredQuestionIds || []).filter(
          (id) => id !== questionId,
        ),
      });
      return next;
    });
    setAnsweredIds((prev) => prev.filter((id) => id !== questionId));
    setAnswer("");
    answerRef.current = "";
    setEvaluation(null);
    setStatusLine("Question skipped");
    goNext();
  }

  function incompleteCounts() {
    const answered = new Set(answeredIds);
    const skipped = new Set(skippedIds);
    const notAttempted = questions.filter(
      (question) => !answered.has(question.id) && !skipped.has(question.id),
    ).length;
    return {
      skipped: skippedIds.length,
      notAttempted,
      totalIncomplete: skippedIds.length + notAttempted,
    };
  }

  function requestFinish() {
    const counts = incompleteCounts();
    if (counts.totalIncomplete > 0) {
      setShowFinishConfirm(true);
      return;
    }
    void onFinish();
  }

  async function onFinish() {
    if (!sessionId || finishing) return;
    stopDictation();
    stopSpeaking();
    setShowFinishConfirm(false);
    setFinishing(true);
    setError(null);
    setStatusLine("Generating your report…");
    try {
      const existingReport = readJourney().report;
      if (existingReport) {
        router.push("/report");
        return;
      }
      const data = await finishInterview(sessionId);
      writeJourney({
        report: data.report,
        interviewComplete: true,
        interviewSource: data.source,
        currentQuestion: null,
        skippedQuestionIds: skippedIds,
        answeredQuestionIds: answeredIds,
      });
      router.push("/report");
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to finish interview";
      // Stale session after server restart — force a clean restart path.
      if (message.toLowerCase().includes("not found")) {
        writeJourney({
          sessionId: null,
          interviewStartedAt: null,
          interviewComplete: false,
          currentQuestion: null,
        });
        setCanResume(false);
        setPhase("lobby");
        setError("Session expired after a server restart. Please begin a new interview.");
      } else {
        setError(message);
      }
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

  const agentStatus = submitting
    ? nextAction === "follow_up" || statusLine.toLowerCase().includes("follow")
      ? "Generating follow-up"
      : "Evaluating answer"
    : speakingQuestion
      ? "Speaking"
      : listening
        ? "Listening"
        : phase === "complete"
          ? "Interview complete"
          : "Ready";

  const btnPrimary =
    "!bg-[#F4C430] !text-[#1C1C1C] !shadow-none hover:!bg-[#E5B94C] disabled:!opacity-50";
  const btnSecondary =
    "!border-[#EAE5D9] !bg-white !text-[#1C1C1C] !shadow-none hover:!bg-[#FFFDF8] disabled:!opacity-50";

  const progressIndex =
    phase === "complete"
      ? Math.max(questions.length - 1, 0)
      : Math.max(
          currentQuestion
            ? questions.findIndex((q) => q.id === currentQuestion.id)
            : currentQuestionIndex,
          0,
        );

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col lg:flex-row">
      <ProgressSidebar
        questions={phase === "lobby" ? [] : questions}
        currentQuestionId={phase === "lobby" ? null : (currentQuestion?.id ?? null)}
        currentIndex={phase === "lobby" ? 0 : progressIndex}
        timerLabel={formatCountdown(msLeft)}
        timerUrgent={timerUrgent}
        statusLine={statusLine}
        warnings={proctorWarnings}
        skippedIds={skippedIds}
        answeredIds={answeredIds}
        phase={phase}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <ProctorCamera
          ref={cameraRef}
          enabled
          showPreview={phase !== "lobby"}
          monitorFocus={phase === "live"}
          className={
            phase === "lobby"
              ? undefined
              : "absolute right-4 top-4 z-30 sm:right-8 sm:top-5"
          }
          onStatusChange={onCameraStatus}
          onWarning={onProctorWarning}
          onErrorChange={setCameraError}
        />

        <div
          className={`flex flex-1 flex-col px-4 pb-28 sm:px-10 lg:px-12 ${
            phase === "lobby"
              ? "pt-6"
              : "pt-[11.5rem] sm:pt-6 lg:pr-[280px] lg:pt-6"
          }`}
        >
          {phase === "live" && !cameraReady ? (
            <div className="mb-4 rounded-2xl border border-[#F4C430] bg-[rgba(244,196,48,0.12)] px-4 py-3 text-sm text-[#1C1C1C]">
              Camera became unavailable. Use Retry camera in the preview to restore proctoring.
              {lastProctorNote ? ` (${lastProctorNote})` : null}
            </div>
          ) : null}

          {error ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {phase === "lobby" ? (
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-10 text-center">
              <InterviewAgent speaking={false} status="Ready" />
              <h1 className="mt-8 font-display text-3xl font-semibold text-[#1C1C1C] sm:text-4xl">
                Voice AI Interview
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#737373]">
                Camera permission is required before you begin. The live camera preview appears
                only after the interview starts. The agent then asks each question in English,
                listens automatically, evaluates your answer, and follows up when needed.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  className={btnPrimary}
                  onClick={() => void beginInterview()}
                  disabled={starting || !cameraReady}
                >
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
                {canResume ? (
                  <Button
                    variant="secondary"
                    className={btnSecondary}
                    disabled={starting || !cameraReady}
                    onClick={resumeInterview}
                  >
                    Resume previous
                  </Button>
                ) : null}
                {!cameraReady ? (
                  <Button
                    variant="secondary"
                    className={btnSecondary}
                    disabled={starting}
                    onClick={() => cameraRef.current?.retry()}
                  >
                    Retry camera
                  </Button>
                ) : null}
              </div>
              {!cameraReady ? (
                <p className="mt-4 text-xs text-[#737373]">
                  {cameraError
                    ? `${cameraError} Allow access, then retry.`
                    : "Waiting for camera permission… Begin stays disabled until the camera is ready."}
                </p>
              ) : (
                <p className="mt-4 text-xs font-medium text-[#1C1C1C]">
                  Camera ready · preview will appear after you begin
                </p>
              )}
              <p className="mt-2 text-xs text-[#A3A3A3]">
                Demo profile is seeded (Jordan Lee → Paytm). If the mic fails, type and Submit.
                {source ? ` · Last source: ${source}` : null}
              </p>
            </div>
          ) : null}

          {phase === "complete" || (phase === "live" && !currentQuestion) ? (
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-10 text-center">
              <InterviewAgent speaking={false} status="Interview complete" />
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F4C430]">
                {timedOut ? "Time expired" : "Interview complete"}
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-[#1C1C1C] sm:text-3xl">
                Ready to generate your evidence-based report
              </h2>
              {(skippedIds.length > 0 || incompleteCounts().notAttempted > 0) && (
                <p className="mx-auto mt-4 max-w-md text-sm text-[#B45309]">
                  {incompleteCounts().skipped} skipped · {incompleteCounts().notAttempted}{" "}
                  not attempted — you can still submit a report.
                </p>
              )}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  className={btnPrimary}
                  onClick={requestFinish}
                  disabled={finishing}
                >
                  {finishing ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Generating report…
                    </>
                  ) : (
                    "Submit / Generate report"
                  )}
                </Button>
                <ButtonLink href="/report" variant="secondary" className={btnSecondary}>
                  Go to report page
                </ButtonLink>
              </div>
            </div>
          ) : null}

          {phase === "live" && currentQuestion ? (
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
              <div className="pt-2 pr-0 sm:pt-1 lg:pt-2">
                <h2 className="text-center font-display text-[1.45rem] font-semibold leading-snug tracking-tight text-[#1C1C1C] sm:text-2xl md:text-[1.85rem] md:leading-[1.35]">
                  {currentQuestion.question}
                </h2>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-[#737373]">
                  <span>
                    Question {progressIndex + 1} of {Math.max(questions.length, 1)}
                  </span>
                  <span aria-hidden>·</span>
                  <span className="capitalize">{currentQuestion.category}</span>
                  <span aria-hidden>·</span>
                  <span className="capitalize">{currentQuestion.difficulty}</span>
                </div>
              </div>

              <div className="mt-8 flex flex-1 flex-col items-center">
                <InterviewAgent
                  speaking={speakingQuestion}
                  listening={listening}
                  evaluating={submitting}
                  status={agentStatus}
                />

                {evaluation ? (
                  <div className="mt-6 w-full max-w-xl rounded-2xl border border-[#EAE5D9] bg-white px-4 py-3 text-left shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F4C430]">
                      Latest evaluation
                    </p>
                    <p className="mt-2 text-sm text-[#1C1C1C]">
                      <span className="font-semibold">{evaluation.quality}</span>
                      {" · "}
                      score {evaluation.score}/100
                      {nextAction ? ` · ${nextAction}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-[#737373]">{evaluation.feedback}</p>
                  </div>
                ) : null}

                <div className="mt-6 w-full max-w-xl rounded-2xl border border-[#EAE5D9] bg-white px-4 py-4 text-left shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#737373]">
                    Live transcript
                  </p>
                  <p className="mt-3 min-h-14 whitespace-pre-wrap text-sm leading-relaxed text-[#1C1C1C]">
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
                        manualTypingRef.current = true;
                        setAnswer(event.target.value);
                        answerRef.current = event.target.value;
                      }}
                      onFocus={() => {
                        setShowTextInput(true);
                      }}
                      rows={3}
                      disabled={submitting}
                      placeholder={
                        listening
                          ? "Type here anytime — mic stays open…"
                          : "Type your answer here anytime…"
                      }
                      className="mt-3 w-full resize-y rounded-xl border border-[#EAE5D9] bg-[#FFFDF8] px-3 py-3 text-sm text-[#1C1C1C] outline-none placeholder:text-[#A3A3A3] focus:border-[#F4C430] focus:ring-2 focus:ring-[rgba(244,196,48,0.25)] disabled:opacity-60"
                    />
                  ) : (
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#737373] hover:text-[#1C1C1C]"
                      onClick={() => setShowTextInput(true)}
                    >
                      <Keyboard className="h-3.5 w-3.5" />
                      Type your answer
                    </button>
                  )}

                  {!speechSupported ? (
                    <p className="mt-3 text-xs text-[#B45309]">
                      Speech recognition unavailable — type your answer, then Submit.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {phase === "live" && currentQuestion ? (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#EAE5D9] bg-[#FFFDF8]/95 px-4 py-3 backdrop-blur-md lg:left-[280px]">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2 sm:gap-3">
              <Button
                variant="secondary"
                className={btnSecondary}
                onClick={goBack}
                disabled={!canGoBack || submitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                className={listening ? btnSecondary : btnPrimary}
                variant={listening ? "secondary" : "primary"}
                onClick={toggleListening}
                disabled={submitting || speakingQuestion}
              >
                {listening ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Start answering
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                className={btnSecondary}
                onClick={replayQuestion}
                disabled={submitting || listening}
              >
                <Volume2 className="h-4 w-4" />
                Replay
              </Button>
              <Button
                className={btnPrimary}
                onClick={() => void submitCurrentAnswer()}
                disabled={!canSubmit}
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit answer
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                className="!border-[#B45309]/40 !bg-white !text-[#B45309] !shadow-none hover:!bg-[rgba(180,83,9,0.08)] disabled:!opacity-50"
                onClick={skipQuestion}
                disabled={submitting || listening || finishing}
              >
                <Flag className="h-4 w-4" />
                Skip
              </Button>
              <Button
                className={btnPrimary}
                onClick={goNext}
                disabled={!canGoNext || submitting || listening}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}

        {showFinishConfirm ? (
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(28,28,28,0.55)] p-4"
            onClick={() => !finishing && setShowFinishConfirm(false)}
          >
            <div
              className="w-full max-w-md rounded-3xl border border-[#EAE5D9] bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="finish-confirm-title"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F4C430]">
                    Before you submit
                  </p>
                  <h3
                    id="finish-confirm-title"
                    className="mt-2 font-display text-xl font-semibold text-[#1C1C1C]"
                  >
                    Incomplete questions found
                  </h3>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-[#EAE5D9] p-2 text-[#1C1C1C] hover:bg-[#FFFDF8]"
                  onClick={() => setShowFinishConfirm(false)}
                  disabled={finishing}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#737373]">
                You have{" "}
                <span className="font-semibold text-[#1C1C1C]">
                  {incompleteCounts().skipped} skipped
                </span>{" "}
                and{" "}
                <span className="font-semibold text-[#1C1C1C]">
                  {incompleteCounts().notAttempted} not attempted
                </span>
                . You can still submit and generate a report from the answers you did provide.
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button
                  variant="secondary"
                  className={btnSecondary}
                  onClick={() => setShowFinishConfirm(false)}
                  disabled={finishing}
                >
                  Go back
                </Button>
                <Button
                  className={btnPrimary}
                  onClick={() => void onFinish()}
                  disabled={finishing}
                >
                  {finishing ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    "Submit anyways"
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
