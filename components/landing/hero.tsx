import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function LandingHero() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-pulse-glow absolute -left-24 top-16 h-72 w-72 rounded-full bg-gold-500/25 blur-3xl" />
        <div className="animate-drift absolute right-[-4rem] top-24 h-96 w-96 rounded-full bg-gold-400/15 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold-500 font-display text-sm font-bold text-navy-950">
            D0
          </span>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-ink-50">
              DayZero
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
              Before Day One
            </p>
          </div>
        </div>
        <ButtonLink href="/setup" variant="secondary" className="hidden sm:inline-flex">
          Enter workspace
        </ButtonLink>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-5.5rem)] w-full max-w-6xl flex-col justify-center px-6 pb-20 pt-8">
        <p className="animate-fade-up font-display text-5xl font-semibold tracking-tight text-gold-500 sm:text-7xl md:text-8xl">
          DayZero
        </p>
        <h1 className="animate-fade-up-delay mt-5 max-w-3xl text-balance font-display text-3xl font-semibold leading-tight text-ink-50 sm:text-5xl">
          Your journey starts before Day One.
        </h1>
        <p className="animate-fade-up-delay-2 mt-6 max-w-xl text-base leading-relaxed text-ink-300 sm:text-lg">
          Company research → adaptive voice interview → evidence report → hiring
          transition → personalized 30/60/90 roadmap → HR assistant. One continuous
          DayZero journey before Day One.
        </p>
        <div className="animate-fade-up-delay-2 mt-10 flex flex-wrap items-center gap-4">
          <ButtonLink href="/setup">
            Start Your Journey
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="/setup" variant="secondary">
            Begin at setup
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
