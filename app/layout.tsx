import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "FanPulse AI — Smarter Stadiums, Better Games",
    template: "%s | FanPulse AI",
  },
  description:
    "A multilingual fan assistant and live stadium operations copilot for FIFA World Cup 2026.",
  keywords: ["stadium operations", "fan experience", "FIFA World Cup 2026", "AI assistant"],
};

export const viewport: Viewport = {
  themeColor: "#070b12",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-ink`}>
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-lg bg-white px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
