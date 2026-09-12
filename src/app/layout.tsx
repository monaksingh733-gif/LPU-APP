import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Quad — your campus, verified",
  description:
    "The verified-student campus companion: buddy finder, event meetups, campus map and the 48-hour safe chat system.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${grotesk.variable} ${manrope.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
