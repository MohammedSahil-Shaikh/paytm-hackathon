"use client";

import Link from "next/link";
import { useState } from "react";
import { ClipboardPlus, FileBarChart, Users } from "lucide-react";
import { ComingSoonDialog } from "@/components/ui/coming-soon-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    id: "create",
    title: "Create Interview",
    description: "Set up a structured AI interview session.",
    icon: ClipboardPlus,
    mode: "dialog" as const,
  },
  {
    id: "candidates",
    title: "View Candidates",
    description: "Browse candidate profiles and pipeline status.",
    icon: Users,
    mode: "link" as const,
    href: "/candidates",
  },
  {
    id: "reports",
    title: "Review Reports",
    description: "Open interview summaries and score insights.",
    icon: FileBarChart,
    mode: "link" as const,
    href: "/reports",
  },
];

export function QuickActions() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Placeholder shortcuts — product workflows are not live yet.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const content = (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{action.title}</p>
                  <p className="mt-1 text-sm text-ink-500">{action.description}</p>
                </div>
              </>
            );

            if (action.mode === "link") {
              return (
                <Link
                  key={action.id}
                  href={action.href}
                  className="flex flex-col gap-4 rounded-2xl border border-ink-200 bg-ink-50/60 p-4 transition hover:border-brand-200 hover:bg-white"
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={action.id}
                type="button"
                onClick={() => setDialogOpen(true)}
                className="flex flex-col gap-4 rounded-2xl border border-ink-200 bg-ink-50/60 p-4 text-left transition hover:border-brand-200 hover:bg-white"
              >
                {content}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <ComingSoonDialog
        open={dialogOpen}
        title="Create Interview"
        description="Interview creation will be available in a later milestone. This foundation stage only provides navigation and UI structure."
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
