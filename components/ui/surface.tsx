import { cn } from "@/lib/utils";

export function Surface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-gold-500/15 bg-navy-800/55 p-6 shadow-glow backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-500">
      {children}
    </p>
  );
}
