"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  CircleHelp,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Users,
  FileBarChart,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

const primaryNav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "overview" },
  { label: "Interviews", href: "/interviews", icon: "interviews" },
  { label: "Candidates", href: "/candidates", icon: "candidates" },
  { label: "Reports", href: "/reports", icon: "reports" },
];

const workspaceNav: NavItem[] = [
  { label: "Interview Workspace", href: "/workspace", icon: "workspace" },
];

const bottomNav: NavItem[] = [
  { label: "Settings", href: "/settings", icon: "settings" },
  { label: "Help & Support", href: "/help", icon: "help" },
];

const icons = {
  overview: LayoutDashboard,
  interviews: ClipboardList,
  candidates: Users,
  reports: FileBarChart,
  workspace: BriefcaseBusiness,
  settings: Settings,
  help: CircleHelp,
};

function NavLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const Icon = icons[item.icon];
  const active =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
          : "text-slate-300 hover:bg-white/5 hover:text-white",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active ? "text-brand-300" : "text-slate-400 group-hover:text-slate-200",
        )}
      />
      <span>{item.label}</span>
    </Link>
  );
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink-950/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-white/5 bg-ink-950 text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-soft">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold tracking-tight">
                Day Zero
              </div>
              <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                AI Interview Platform
              </div>
            </div>
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
          <div>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Navigation
            </p>
            <div className="space-y-1">
              {primaryNav.map((item) => (
                <NavLink key={item.href} item={item} onNavigate={onClose} />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Workspace
            </p>
            <div className="space-y-1">
              {workspaceNav.map((item) => (
                <NavLink key={item.href} item={item} onNavigate={onClose} />
              ))}
            </div>
          </div>
        </nav>

        <div className="space-y-3 border-t border-white/5 p-3">
          <div className="space-y-1">
            {bottomNav.map((item) => (
              <NavLink key={item.href} item={item} onNavigate={onClose} />
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/20 text-sm font-semibold text-brand-200">
              AI
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">Alex Interviewer</p>
              <p className="truncate text-xs text-slate-400">demo@dayzero.app</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
