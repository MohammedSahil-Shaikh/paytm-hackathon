import Link from "next/link";

export function LandingHero() {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#93a4bd]">
        DayZero
      </p>
      <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-sora)] text-4xl font-semibold leading-tight text-white sm:text-6xl">
        Your journey starts before Day One.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#93a4bd]">
        DayZero connects company research, AI interviews, candidate insights,
        hiring transition, and personalized 30/60/90 onboarding into one continuous
        experience.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/setup"
          className="rounded-full bg-[#4f7cff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3f6af0]"
        >
          Start Your Journey
        </Link>
        <Link
          href="/research"
          className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
        >
          View research shell
        </Link>
      </div>
    </section>
  );
}
