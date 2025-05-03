import { Inter } from "next/font/google";
import { Providers } from "@/components/providers"; // Import the new Providers component
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LearnBridge - Education Platform",
  description: "A comprehensive learning management system for educators and students",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers> {/* Use the Providers component */}
          {children}
        </Providers>
      </body>
    </html>
  );
}