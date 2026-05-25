import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "LeadPulse AI — Stop Losing Leads Because You Reply Too Late",
    template: "%s | LeadPulse AI",
  },
  description:
    "LeadPulse AI responds to new inquiries instantly, qualifies prospects, and pushes them toward booking automatically. Built for med spas, salons, contractors, realtors, and local service businesses.",
  keywords: [
    "lead follow-up",
    "AI lead qualification",
    "automated SMS follow-up",
    "local business leads",
    "med spa marketing",
    "salon leads",
    "contractor leads",
  ],
  openGraph: {
    title: "LeadPulse AI — Stop Losing Leads Because You Reply Too Late",
    description:
      "AI-powered lead response and qualification for local service businesses.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
