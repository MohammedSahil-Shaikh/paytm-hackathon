"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComingSoonDialog } from "@/components/ui/coming-soon-dialog";
import { getGreeting } from "@/lib/utils";

export function WelcomeSection() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-ink-200/80 bg-white shadow-soft">
        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(51,129,255,0.12),transparent_55%)]" />
          <div className="relative max-w-2xl">
            <p className="text-sm font-medium text-brand-700">
              {getGreeting()}, Interviewer
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              Your interview workspace
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-500 sm:text-base">
              Manage interviews, discover candidate insights, and streamline your hiring
              process with AI.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Start New Interview
              </Button>
              <Link
                href="/candidates"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-medium text-ink-800 shadow-sm transition-colors hover:bg-ink-50"
              >
                View Candidates
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ComingSoonDialog
        open={dialogOpen}
        title="Start New Interview"
        description="Interview setup is not implemented yet. This button is a UI placeholder for the upcoming interview workflow."
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
