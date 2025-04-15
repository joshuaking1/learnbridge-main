// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Arvo, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const arvo = Arvo({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: '--font-arvo',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "LearnBridgeEdu - Ghana SBC Platform",
  description: "AI-Powered Lesson Planning and Learning for GES SBC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-poppins",
        arvo.variable,
        poppins.variable
      )}>
        {children}
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}