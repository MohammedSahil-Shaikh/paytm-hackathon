"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/surface";

const links = [
  { href: "/setup", label: "Setup" },
  { href: "/research", label: "Research" },
  { href: "/interview", label: "Interview" },
  { href: "/report", label: "Report" },
  { href: "/onboarding", label: "Hired" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/assistant", label: "HR Assist" },
];

export function AppShell({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen bg-grid-navy">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-gold-500/10 bg-navy-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500 font-display text-xs font-bold text-navy-950">
              D0
            </span>
            <span className="font-display text-lg font-semibold text-ink-50">
              DayZero
            </span>
          </Link>
          <nav className="flex flex-wrap gap-1.5 text-sm">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3.5 py-2 transition",
                    active
                      ? "bg-gold-500 text-navy-950"
                      : "text-ink-300 hover:bg-navy-800 hover:text-gold-400",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        <div className="animate-fade-up max-w-3xl">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink-50 sm:text-4xl">
            {title}
          </h1>
        </div>
        <div className="animate-fade-up-delay mt-8">{children}</div>
      </main>
    </div>
  );
}
