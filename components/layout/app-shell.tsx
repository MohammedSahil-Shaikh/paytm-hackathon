"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/surface";
import { JourneySeed } from "@/components/journey/journey-seed";

const links = [
  { href: "/setup", label: "Setup" },
  { href: "/research", label: "Research" },
  { href: "/interview", label: "Interview" },
  { href: "/report", label: "Report" },
  { href: "/onboarding", label: "Hired" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/assistant", label: "HR" },
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
    <div className="relative min-h-screen">
      <JourneySeed />
      <header className="sticky top-0 z-40 border-b border-navy-600 bg-[#FFFDF8]/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-8">
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
                      ? "bg-gold-500 font-semibold text-navy-950"
                      : "text-ink-300 hover:bg-white hover:text-ink-50",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1600px] px-6 py-10 sm:px-8">
        <div className="animate-fade-up max-w-4xl">
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
