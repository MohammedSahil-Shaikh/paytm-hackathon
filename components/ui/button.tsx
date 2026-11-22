import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-gold-500 text-navy-950 hover:bg-gold-400 shadow-[0_8px_24px_rgba(244,196,48,0.28)] disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "border border-navy-600 bg-white text-ink-50 hover:border-gold-500/50 hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-50",
  ghost: "text-ink-300 hover:text-ink-50 disabled:cursor-not-allowed disabled:opacity-50",
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
