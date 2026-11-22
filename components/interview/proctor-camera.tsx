"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Camera, CameraOff, ShieldAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProctorCameraHandle = {
  retry: () => void;
};

type ProctorCameraProps = {
  enabled: boolean;
  /** When false, camera still initializes but the preview UI is hidden. */
  showPreview?: boolean;
  /** When false, skip tab/focus proctor warnings (lobby). */
  monitorFocus?: boolean;
  className?: string;
  onStatusChange: (ready: boolean) => void;
  onWarning: (reason: string) => void;
  onErrorChange?: (message: string | null) => void;
};

export const ProctorCamera = forwardRef<ProctorCameraHandle, ProctorCameraProps>(
  function ProctorCamera(
    {
      enabled,
      showPreview = true,
      monitorFocus = true,
      className,
      onStatusChange,
      onWarning,
      onErrorChange,
    },
    ref,
  ) {
    const previewRef = useRef<HTMLVideoElement | null>(null);
    const modalRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const statusRef = useRef(onStatusChange);
    const warningRef = useRef(onWarning);
    const errorChangeRef = useRef(onErrorChange);
    const [error, setError] = useState<string | null>(null);
    const [hint, setHint] = useState<string | null>(null);
    const [live, setLive] = useState(false);
    const [starting, setStarting] = useState(false);
    const [expanded, setExpanded] = useState(false);

    statusRef.current = onStatusChange;
    warningRef.current = onWarning;
    errorChangeRef.current = onErrorChange;

    function attachStream(video: HTMLVideoElement | null) {
      if (!video || !streamRef.current) return;
      if (video.srcObject !== streamRef.current) {
        video.srcObject = streamRef.current;
      }
      void video.play().catch(() => undefined);
    }

    function stopStream() {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (previewRef.current) previewRef.current.srcObject = null;
      if (modalRef.current) modalRef.current.srcObject = null;
    }

    async function startCamera() {
      if (!enabled) return;
      setStarting(true);
      setError(null);
      setHint(null);
      errorChangeRef.current?.(null);

      try {
        if (!window.isSecureContext) {
          throw Object.assign(new Error("Camera needs HTTPS or localhost."), {
            name: "SecurityError",
          });
        }
        if (!navigator.mediaDevices?.getUserMedia) {
          throw Object.assign(new Error("Camera API unavailable."), {
            name: "NotSupportedError",
          });
        }

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false,
          });
        }

        stopStream();
        streamRef.current = stream;
        attachStream(previewRef.current);
        attachStream(modalRef.current);
        setLive(true);
        statusRef.current(true);

        stream.getVideoTracks()[0]?.addEventListener("ended", () => {
          setLive(false);
          statusRef.current(false);
          warningRef.current("Camera disconnected during proctored interview.");
        });
      } catch (err) {
        setLive(false);
        statusRef.current(false);
        const name = err instanceof Error ? err.name : "";
        let message = "Could not start the camera.";
        let nextHint = "Close other apps using the webcam, then retry.";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          message = "Camera permission denied.";
          nextHint = "Allow camera in the browser address bar, then retry.";
        } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
          message = "No camera device found.";
          nextHint = "Connect a webcam and retry.";
        } else if (name === "SecurityError") {
          message = "Insecure context.";
          nextHint = "Open http://localhost:3000 (not a LAN IP).";
        }
        setError(message);
        setHint(nextHint);
        errorChangeRef.current?.(message);
      } finally {
        setStarting(false);
      }
    }

    useImperativeHandle(ref, () => ({
      retry: () => {
        void startCamera();
      },
    }));

    useEffect(() => {
      if (enabled) {
        void startCamera();
      } else {
        stopStream();
        setLive(false);
        statusRef.current(false);
      }
      return () => stopStream();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled]);

    useEffect(() => {
      if (showPreview || expanded) {
        attachStream(previewRef.current);
        attachStream(modalRef.current);
      }
    }, [showPreview, expanded, live]);

    useEffect(() => {
      if (!expanded) return;
      function onKey(event: KeyboardEvent) {
        if (event.key === "Escape") setExpanded(false);
      }
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [expanded]);

    useEffect(() => {
      if (!enabled || !live || !monitorFocus) return;
      function onVisibility() {
        if (document.hidden) {
          warningRef.current("Tab/window left during proctored interview.");
        }
      }
      function onBlur() {
        warningRef.current("Window lost focus during proctored interview.");
      }
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("blur", onBlur);
      return () => {
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("blur", onBlur);
      };
    }, [enabled, live, monitorFocus]);

    return (
      <>
        {/* Keep a hidden video so the stream stays attached before preview shows */}
        {!showPreview ? (
          <video
            ref={previewRef}
            muted
            playsInline
            autoPlay
            className="pointer-events-none absolute h-px w-px opacity-0"
            aria-hidden
          />
        ) : null}

        {showPreview ? (
          <div
            className={cn(
              "pointer-events-auto w-[200px] overflow-hidden rounded-2xl border border-[#EAE5D9] bg-white shadow-[0_10px_30px_rgba(28,28,28,0.08)] sm:w-[220px]",
              className,
            )}
          >
            <div className="flex items-center justify-between border-b border-[#EAE5D9] px-3 py-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#737373]">
                {live ? (
                  <Camera className="h-3.5 w-3.5 text-[#F4C430]" />
                ) : (
                  <CameraOff className="h-3.5 w-3.5 text-[#737373]" />
                )}
                Camera
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                  live
                    ? "bg-[rgba(244,196,48,0.18)] text-[#1C1C1C]"
                    : "bg-[#F5F2EA] text-[#737373]",
                )}
              >
                {live ? "Live" : "Off"}
              </span>
            </div>

            <button
              type="button"
              className="relative block aspect-[4/3] w-full bg-[#F5F2EA] text-left"
              onClick={() => {
                if (live) setExpanded(true);
              }}
              aria-label={live ? "Expand camera preview" : "Camera offline"}
            >
              <video
                ref={previewRef}
                muted
                playsInline
                autoPlay
                className="h-full w-full object-cover scale-x-[-1]"
              />
              {!live ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#FFFDF8]/95 px-2 text-center">
                  <ShieldAlert className="h-5 w-5 text-[#F4C430]" />
                  <p className="text-[11px] leading-snug text-[#737373]">
                    {error || (starting ? "Starting camera…" : "Camera required")}
                  </p>
                  {hint ? (
                    <p className="text-[10px] leading-snug text-[#A3A3A3]">{hint}</p>
                  ) : null}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      void startCamera();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        void startCamera();
                      }
                    }}
                    className="rounded-full bg-[#F4C430] px-3 py-1.5 text-[11px] font-semibold text-[#1C1C1C]"
                  >
                    {starting ? "Starting…" : "Retry camera"}
                  </span>
                </div>
              ) : null}
            </button>
          </div>
        ) : null}

        {expanded && showPreview ? (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(28,28,28,0.55)] p-4"
            onClick={() => setExpanded(false)}
          >
            <div
              className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-[#EAE5D9] bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#EAE5D9] px-5 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F4C430]">
                    Camera live
                  </p>
                  <p className="mt-1 text-sm text-[#737373]">
                    Same proctor stream · press Esc to close
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="rounded-full border border-[#EAE5D9] p-2 text-[#1C1C1C] hover:bg-[#FFFDF8]"
                  aria-label="Close camera popup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="aspect-video bg-[#F5F2EA]">
                <video
                  ref={modalRef}
                  muted
                  playsInline
                  autoPlay
                  className="h-full w-full object-cover scale-x-[-1]"
                />
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  },
);
