import { cn } from "@/lib/utils";

const steps = [
  "Setup",
  "Research",
  "Interview",
  "Report",
  "Onboarding",
  "Roadmap",
];

export function StepRail({ active }: { active: number }) {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      {steps.map((step, index) => {
        const done = index < active;
        const current = index === active;
        return (
          <div key={step} className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
                current && "bg-gold-500 text-navy-950",
                done && !current && "bg-navy-700 text-gold-400",
                !done && !current && "bg-navy-800 text-ink-400",
              )}
            >
              {step}
            </span>
            {index < steps.length - 1 ? (
              <span className="hidden h-px w-4 bg-gold-500/25 sm:block" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
