import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "info";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-ink-100 text-ink-600 border-ink-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-brand-50 text-brand-700 border-brand-200",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
