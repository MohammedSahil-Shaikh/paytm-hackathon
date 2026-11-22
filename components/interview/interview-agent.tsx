"use client";

import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

type InterviewAgentProps = {
  speaking?: boolean;
  listening?: boolean;
  evaluating?: boolean;
  status?: string;
  label?: string;
};

const RING_BARS = 36;

export function InterviewAgent({
  speaking = false,
  listening = false,
  evaluating = false,
  status,
  label = "DayZero Interview Agent",
}: InterviewAgentProps) {
  const resolved =
    status ||
    (evaluating
      ? "Evaluating answer"
      : speaking
        ? "Speaking"
        : listening
          ? "Listening"
          : "Ready");

  const active = speaking || listening || evaluating;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex h-36 w-36 items-center justify-center sm:h-40 sm:w-40">
        {/* Circular border wave — bars sit on the robot ring */}
        {speaking ? (
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {Array.from({ length: RING_BARS }).map((_, index) => {
              const angle = (360 / RING_BARS) * index;
              const delay = `${(index % 12) * 0.05}s`;
              const duration = `${0.55 + (index % 5) * 0.08}s`;
              return (
                <span
                  key={index}
                  className="voice-ring-bar absolute left-1/2 top-1/2"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-66px)`,
                    animationDelay: delay,
                    animationDuration: duration,
                  }}
                />
              );
            })}
          </div>
        ) : null}

        <div
          className={cn(
            "relative z-10 flex h-28 w-28 items-center justify-center rounded-full border-[3px] bg-white transition sm:h-32 sm:w-32",
            speaking
              ? "border-transparent"
              : active
                ? "border-gold-500 shadow-[0_0_0_6px_rgba(244,196,48,0.12)]"
                : "border-navy-600",
          )}
        >
          {!speaking ? (
            <span
              className={cn(
                "pointer-events-none absolute inset-[-3px] rounded-full border-[3px]",
                active ? "border-gold-500" : "border-transparent",
              )}
            />
          ) : (
            <span className="pointer-events-none absolute inset-[-2px] rounded-full border-2 border-[rgba(244,196,48,0.35)]" />
          )}
          <Bot
            className={cn(
              "h-12 w-12 sm:h-14 sm:w-14",
              active ? "text-gold-500" : "text-navy-950",
            )}
          />
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold text-ink-50">{label}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold-500">
        {resolved}
      </p>
    </div>
  );
}
