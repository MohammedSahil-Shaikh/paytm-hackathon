import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "DayZero | Your journey starts before Day One",
  description:
    "DayZero connects company research, AI interviews, hiring transition, and personalized onboarding. Navy and gold premium AI SaaS experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${sora.variable} font-[family-name:var(--font-plus-jakarta)] antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
