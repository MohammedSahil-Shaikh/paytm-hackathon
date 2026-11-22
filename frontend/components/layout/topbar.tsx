"use client";

import { Bell, Menu, Search } from "lucide-react";

const titleMap: Record<string, string> = {
  "/dashboard": "Overview",
  "/interviews": "Interviews",
  "/candidates": "Candidates",
  "/reports": "Reports",
  "/settings": "Settings",
  "/help": "Help & Support",
  "/workspace": "Interview Workspace",
};

export function Topbar({
  pathname,
  onMenuClick,
}: {
  pathname: string;
  onMenuClick: () => void;
}) {
  const current =
    Object.entries(titleMap).find(([path]) => pathname === path || pathname.startsWith(`${path}/`))?.[1] ??
    "Dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/70 bg-[#f7f8fb]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-700 shadow-sm lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-400">
            Day Zero
          </p>
          <h1 className="truncate font-display text-lg font-semibold text-ink-900">
            {current}
          </h1>
        </div>

        <div className="hidden max-w-sm flex-1 md:block">
          <label className="relative block">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              placeholder="Search interviews, candidates..."
              className="h-10 w-full rounded-xl border border-ink-200 bg-white pl-9 pr-3 text-sm text-ink-800 shadow-sm outline-none placeholder:text-ink-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
            />
          </label>
        </div>

        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-600 shadow-sm transition hover:bg-ink-50"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-brand-500" />
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm"
          aria-label="Profile menu"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900 text-xs font-semibold text-white">
            AI
          </span>
          <span className="hidden text-sm font-medium text-ink-700 sm:inline">Alex</span>
        </button>
      </div>
    </header>
  );
}
