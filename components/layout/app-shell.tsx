import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/setup", label: "Setup" },
  { href: "/research", label: "Research" },
  { href: "/interview", label: "Interview" },
  { href: "/report", label: "Report" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/assistant", label: "HR Assistant" },
];

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="font-[family-name:var(--font-sora)] text-lg font-semibold">
            DayZero
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm text-[#93a4bd]">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-[family-name:var(--font-sora)] text-3xl font-semibold text-white">
          {title}
        </h1>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
