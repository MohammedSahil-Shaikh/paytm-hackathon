import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-gold-500 text-navy-950 hover:bg-gold-400 shadow-[0_10px_30px_rgba(245,197,24,0.28)] disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "border border-gold-500/30 bg-navy-800/50 text-ink-50 hover:border-gold-500/60 hover:bg-navy-700/70 disabled:cursor-not-allowed disabled:opacity-50",
  ghost: "text-ink-300 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-50",
} as const;

type Variant = keyof typeof variants;

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition duration-200";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(baseClass, variants[variant], className)}>
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  type = "button",
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(baseClass, variants[variant], className)}
    >
      {children}
    </button>
  );
}
