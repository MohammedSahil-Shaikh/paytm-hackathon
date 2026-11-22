/**
 * Browser speech helpers for voice-first English interviews.
 * Uses Web Speech API (SpeechSynthesis + SpeechRecognition).
 */

export const INTERVIEW_LOCALE = "en-US";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function canUseSpeechRecognition(): boolean {
  return Boolean(getRecognitionCtor());
}

export function canUseSpeechSynthesis(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeaking(): void {
  if (canUseSpeechSynthesis()) {
    window.speechSynthesis.cancel();
  }
}

const FEMALE_VOICE_PATTERNS = [
  /zira/i,
  /samantha/i,
  /jenny/i,
  /aria/i,
  /sara/i,
  /sonia/i,
  /hazel/i,
  /susan/i,
  /karen/i,
  /moira/i,
  /tessa/i,
  /fiona/i,
  /veena/i,
  /raveena/i,
  /google us english female/i,
  /google uk english female/i,
  /female/i,
];

function pickSweetFemaleVoice(): SpeechSynthesisVoice | null {
  if (!canUseSpeechSynthesis()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const english = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("en"),
  );

  for (const pattern of FEMALE_VOICE_PATTERNS) {
    const match = english.find((voice) => pattern.test(voice.name));
    if (match) return match;
  }

  return english.find((voice) => /en-US/i.test(voice.lang)) || english[0] || null;
}

function ensureVoicesLoaded(): Promise<void> {
  return new Promise((resolve) => {
    if (!canUseSpeechSynthesis()) {
      resolve();
      return;
    }
    const existing = window.speechSynthesis.getVoices();
    if (existing.length) {
      resolve();
      return;
    }
    const onVoices = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    // Fallback if event never fires
    window.setTimeout(resolve, 400);
  });
}

export async function speakEnglish(
  text: string,
  options?: { onend?: () => void; onerror?: (message: string) => void },
): Promise<void> {
  if (!canUseSpeechSynthesis()) {
    options?.onerror?.("Speech synthesis is not supported in this browser.");
    return;
  }

  await ensureVoicesLoaded();
  stopSpeaking();

  await new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = INTERVIEW_LOCALE;
    // Sweet, calm female delivery
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    utterance.volume = 1;

    const voice = pickSweetFemaleVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || INTERVIEW_LOCALE;
    }

    utterance.onend = () => {
      options?.onend?.();
      resolve();
    };
    utterance.onerror = () => {
      options?.onerror?.("Could not speak the interview prompt.");
      resolve();
    };
    window.speechSynthesis.speak(utterance);
  });
}

export type DictationHandle = {
  stop: () => void;
};

/**
 * Continuous English dictation with silence auto-complete.
 * After the speaker pauses for `silenceMs`, onSilenceComplete fires with the transcript.
 */
export function startEnglishDictation(handlers: {
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onSilenceComplete?: (text: string) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
  silenceMs?: number;
  minCharsForAutoSubmit?: number;
}): DictationHandle | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    handlers.onError?.(
      "Speech recognition is not supported. Use Chrome/Edge, or type your answer.",
    );
    return null;
  }

  const recognition = new Ctor();
  recognition.lang = INTERVIEW_LOCALE;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let finalBuffer = "";
  let stopped = false;
  let silenceTimer: number | null = null;
  const silenceMs = handlers.silenceMs ?? 2200;
  const minChars = handlers.minCharsForAutoSubmit ?? 24;

  function clearSilenceTimer() {
    if (silenceTimer != null) {
      window.clearTimeout(silenceTimer);
      silenceTimer = null;
    }
  }

  function scheduleSilenceComplete() {
    clearSilenceTimer();
    silenceTimer = window.setTimeout(() => {
      const text = finalBuffer.trim();
      if (!stopped && text.length >= minChars) {
        handlers.onSilenceComplete?.(text);
      }
    }, silenceMs);
  }

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      const chunk = result[0]?.transcript || "";
      if (result.isFinal) {
        finalBuffer = `${finalBuffer} ${chunk}`.trim();
        handlers.onFinal?.(finalBuffer);
        scheduleSilenceComplete();
      } else {
        interim += chunk;
        scheduleSilenceComplete();
      }
    }
    const combined = `${finalBuffer} ${interim}`.trim();
    if (combined) handlers.onPartial?.(combined);
  };

  recognition.onerror = (event) => {
    if (event.error === "aborted") return;
    if (event.error === "no-speech") {
      // Keep listening; Chrome fires this often.
      return;
    }
    handlers.onError?.(
      event.error === "not-allowed"
        ? "Microphone permission denied."
        : `Speech recognition error: ${event.error}`,
    );
  };

  recognition.onend = () => {
    if (stopped) {
      handlers.onEnd?.();
      return;
    }
    // Chrome stops continuous recognition periodically — restart while active.
    try {
      recognition.start();
    } catch {
      handlers.onEnd?.();
    }
  };

  try {
    recognition.start();
  } catch {
    handlers.onError?.("Could not start the microphone.");
    return null;
  }

  return {
    stop: () => {
      stopped = true;
      clearSilenceTimer();
      try {
        recognition.onend = null;
        recognition.stop();
      } catch {
        // ignore
      }
    },
  };
}
