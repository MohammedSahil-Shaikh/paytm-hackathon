"use client";

import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

type InterviewAgentProps = {
  speaking?: boolean;
  listening?: boolean;
  label?: string;
};

export function InterviewAgent({
  speaking = false,
  listening = false,
  label = "DayZero Interview Agent",
}: InterviewAgentProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        {speaking ? (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-gold-500/25" />
            <span className="absolute -inset-3 rounded-full border border-gold-500/35" />
          </>
        ) : null}
        <div
          className={cn(
            "relative flex h-40 w-40 items-center justify-center rounded-full border-[3px] bg-navy-900 shadow-[0_0_50px_rgba(245,197,24,0.22)] transition sm:h-48 sm:w-48",
            speaking
              ? "border-gold-500 scale-[1.03]"
              : listening
                ? "border-gold-500/55"
                : "border-gold-500/30",
          )}
        >
          <Bot
            className={cn(
              "h-20 w-20 sm:h-24 sm:w-24",
              speaking ? "text-gold-400" : "text-gold-500/85",
            )}
          />
        </div>
      </div>
      <p className="mt-4 text-base font-medium text-ink-50 sm:text-lg">{label}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gold-500">
        {speaking ? "Speaking…" : listening ? "Listening…" : "Ready"}
      </p>
    </div>
  );
}
