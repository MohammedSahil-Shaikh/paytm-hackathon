"use client";

import { Check, ChevronDown, Flag } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { InterviewQuestion } from "@/types";

type ProgressSidebarProps = {
  questions: InterviewQuestion[];
  currentQuestionId: string | null;
  currentIndex: number;
  timerLabel: string;
  timerUrgent?: boolean;
  statusLine?: string;
  warnings?: number;
  skippedIds?: string[];
  answeredIds?: string[];
  phase: "lobby" | "live" | "complete";
};

export function ProgressSidebar({
  questions,
  currentQuestionId,
  currentIndex,
  timerLabel,
  timerUrgent,
  statusLine,
  warnings = 0,
  skippedIds = [],
  answeredIds = [],
  phase,
}: ProgressSidebarProps) {
  const [open, setOpen] = useState(false);
  const total = Math.max(questions.length, 1);
  const displayIndex = Math.min(currentIndex + 1, total);
  const skippedSet = new Set(skippedIds);
  const answeredSet = new Set(answeredIds);

  const list = (
    <div className="space-y-2">
      {questions.length === 0 ? (
        <p className="px-3 py-2 text-sm text-[#737373]">
          Questions appear here after you begin.
        </p>
      ) : (
        questions.map((question, index) => {
          const isCurrent = question.id === currentQuestionId;
          const isSkipped = skippedSet.has(question.id);
          const isAnswered = answeredSet.has(question.id);
          const isDone =
            !isSkipped &&
            (isAnswered ||
              phase === "complete" ||
              (phase === "live" && currentQuestionId != null && index < currentIndex));
          return (
            <div
              key={question.id}
              className={cn(
                "flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                isCurrent && !isSkipped && "bg-[rgba(244,196,48,0.18)] text-[#1C1C1C]",
                isSkipped && "bg-[rgba(180,83,9,0.12)] text-[#1C1C1C]",
                isDone && !isCurrent && !isSkipped && "text-[#1C1C1C]",
                !isCurrent && !isDone && !isSkipped && "text-[#737373]",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px]",
                  isSkipped && "border-[#B45309] bg-[#B45309] text-white",
                  isCurrent && !isSkipped && "border-[#F4C430] bg-[#F4C430] text-[#1C1C1C]",
                  isDone && !isCurrent && !isSkipped && "border-[#F4C430] bg-[#F4C430] text-[#1C1C1C]",
                  !isCurrent && !isDone && !isSkipped && "border-[#EAE5D9] bg-white",
                )}
              >
                {isSkipped ? (
                  <Flag className="h-3 w-3" />
                ) : isDone && !isCurrent ? (
                  <Check className="h-3 w-3" />
                ) : (
                  index + 1
                )}
              </span>
              <div className="min-w-0">
                <p className="font-medium">
                  Question {index + 1}
                  {isCurrent && !isSkipped
                    ? " · Current"
                    : isSkipped
                      ? " · Skipped"
                      : isDone
                        ? " · Done"
                        : ""}
                </p>
                <p className="truncate text-xs capitalize text-[#737373]">
                  {question.category}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <>
      <div className="border-b border-[#EAE5D9] bg-white lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F4C430]">
              Interview progress
            </p>
            <p className="mt-1 text-sm font-semibold text-[#1C1C1C]">
              {displayIndex} of {total} · {timerLabel}
            </p>
          </div>
          <ChevronDown
            className={cn("h-4 w-4 text-[#737373] transition", open && "rotate-180")}
          />
        </button>
        {open ? <div className="border-t border-[#EAE5D9] px-3 pb-3 pt-2">{list}</div> : null}
      </div>

      <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#EAE5D9] bg-white lg:flex">
        <div className="border-b border-[#EAE5D9] px-5 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F4C430]">
            Interview progress
          </p>
          <p className="mt-3 font-display text-3xl font-semibold text-[#1C1C1C]">
            {displayIndex}
            <span className="text-lg text-[#737373]"> / {total}</span>
          </p>
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#737373]">
              Timer
            </p>
            <p
              className={cn(
                "mt-1 font-display text-2xl font-semibold tabular-nums",
                timerUrgent ? "text-[#B45309]" : "text-[#1C1C1C]",
              )}
            >
              {timerLabel}
            </p>
            <p className="mt-1 text-xs text-[#737373]">60 minutes total</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">{list}</div>
        <div className="border-t border-[#EAE5D9] px-5 py-4 text-xs text-[#737373]">
          {statusLine ? <p className="text-[#1C1C1C]">{statusLine}</p> : null}
          <p className="mt-2">Proctor warnings: {warnings}</p>
          {skippedIds.length > 0 ? (
            <p className="mt-1 text-[#B45309]">Skipped: {skippedIds.length}</p>
          ) : null}
        </div>
      </aside>
    </>
  );
}
