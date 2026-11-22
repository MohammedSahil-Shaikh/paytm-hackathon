"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, ShieldAlert } from "lucide-react";
import { Eyebrow } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProctorCameraProps = {
  enabled: boolean;
  compact?: boolean;
  className?: string;
  onStatusChange: (ready: boolean) => void;
  onWarning: (reason: string) => void;
};

export function ProctorCamera({
  enabled,
  compact = false,
  className,
  onStatusChange,
  onWarning,
}: ProctorCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const statusRef = useRef(onStatusChange);
  const warningRef = useRef(onWarning);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [permission, setPermission] = useState<PermissionState | "unknown">("unknown");

  statusRef.current = onStatusChange;
  warningRef.current = onWarning;

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function readPermission() {
    try {
      if (!navigator.permissions?.query) return;
      const result = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      setPermission(result.state);
      result.onchange = () => setPermission(result.state);
    } catch {
      setPermission("unknown");
    }
  }

  async function startCamera() {
    if (!enabled) return;
    setStarting(true);
    setError(null);
    setHint(null);

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

      // Prefer simple constraints — facingMode fails on some desktop setups.
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

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.muted = true;
        video.setAttribute("playsinline", "true");
        await video.play();
      }

      setLive(true);
      statusRef.current(true);
      await readPermission();

      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        setLive(false);
        statusRef.current(false);
        warningRef.current("Camera disconnected during proctored interview.");
      });
    } catch (err) {
      setLive(false);
      statusRef.current(false);
      await readPermission();

      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setError("Camera blocked by the browser.");
        setHint(
          "Click the camera icon in the address bar → set Camera to Allow → reload if needed → press Allow camera again.",
        );
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setError("No camera detected on this device.");
        setHint("Plug in a webcam or use a laptop with a built-in camera.");
      } else if (name === "SecurityError") {
        setError("Insecure context.");
        setHint("Open the app at http://localhost:3000 (not a LAN IP) or use HTTPS.");
      } else {
        setError("Could not start the camera.");
        setHint(
          "Use Chrome/Edge on localhost, ensure no other app is using the webcam, then try Allow camera.",
        );
      }
    } finally {
      setStarting(false);
    }
  }

  useEffect(() => {
    void readPermission();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopStream();
      setLive(false);
      statusRef.current(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !live) return;

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
  }, [enabled, live]);

  return (
    <div
      className={cn(
        "overflow-hidden border border-gold-500/25 bg-navy-950/95 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur",
        compact ? "w-[200px] rounded-xl sm:w-[240px]" : "rounded-2xl",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between border-b border-gold-500/10",
          compact ? "px-2.5 py-1.5" : "px-4 py-3",
        )}
      >
        <div className="flex items-center gap-1.5">
          {live ? (
            <Camera className="h-3.5 w-3.5 text-gold-500" />
          ) : (
            <CameraOff className="h-3.5 w-3.5 text-ink-400" />
          )}
          <Eyebrow>{compact ? "Camera" : "Proctor camera"}</Eyebrow>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
            live ? "bg-gold-500/15 text-gold-400" : "bg-navy-800 text-ink-400"
          }`}
        >
          {live ? "Live" : permission === "denied" ? "Blocked" : "Off"}
        </span>
      </div>

      <div className={cn("relative bg-navy-900", compact ? "aspect-[4/3]" : "aspect-video")}>
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          className="h-full w-full object-cover scale-x-[-1]"
        />
        {!live ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-navy-950/95 px-2.5 text-center">
            <ShieldAlert className="h-5 w-5 text-gold-500" />
            <p className={cn("text-ink-200", compact ? "text-[11px] leading-snug" : "text-sm")}>
              {error || "Camera is off. Press Allow camera."}
            </p>
            {hint ? (
              <p className="text-[10px] leading-snug text-ink-400">{hint}</p>
            ) : null}
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              disabled={starting}
              onClick={() => void startCamera()}
            >
              {starting ? "Starting…" : "Allow camera"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
