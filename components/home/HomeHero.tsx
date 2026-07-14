import Link from "next/link";
import {
  Accessibility,
  Activity,
  ArrowRight,
  Languages,
  ShieldCheck,
} from "lucide-react";
import { DemoStadiumPulse } from "./DemoStadiumPulse";

export function HomeHero() {
  return (
    <section className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden border-b border-white/[0.07]">
      <div className="hero-grid absolute inset-0 -z-20" />
      <div className="absolute left-[-12rem] top-28 -z-10 h-[28rem] w-[28rem] rounded-full bg-fifa-green/[0.08] blur-3xl" />
      <div className="absolute right-[-12rem] top-12 -z-10 h-[34rem] w-[34rem] rounded-full bg-fifa-blue/[0.09] blur-3xl" />

      <div className="container grid min-h-[calc(100vh-72px)] items-center gap-16 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="max-w-3xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-medium text-zinc-300 shadow-lg shadow-black/10">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fifa-green opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-fifa-green-light" />
            </span>
            Hack2Skill Challenge 4 • FIFA World Cup 2026
          </div>

          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-[5.35rem]">
            Every fan guided.{" "}
            <span className="bg-gradient-to-r from-fifa-green-light via-emerald-300 to-blue-300 bg-clip-text text-transparent">
              Every zone understood.
            </span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl">
            FanPulse AI turns stadium knowledge and simulated crowd signals into calm,
            confident matchdays—for the people in the stands and the teams behind them.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/fan"
              prefetch={false}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-fifa-green px-5 py-3.5 text-sm font-bold text-ink shadow-glow transition-all hover:-translate-y-0.5 hover:bg-fifa-green-light focus:outline-none focus:ring-2 focus:ring-fifa-green-light focus:ring-offset-2 focus:ring-offset-ink"
            >
              Open fan assistant
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/staff"
              prefetch={false}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.045] px-5 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.075] focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              View simulated operations
              <Activity className="h-4 w-4 text-blue-300" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-zinc-500">
            <span className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-fifa-green-light" aria-hidden="true" />
              Multilingual
            </span>
            <span className="flex items-center gap-2">
              <Accessibility className="h-4 w-4 text-fifa-green-light" aria-hidden="true" />
              Accessibility-first
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-fifa-green-light" aria-hidden="true" />
              Grounded answers
            </span>
          </div>
        </div>

        <DemoStadiumPulse />
      </div>
    </section>
  );
}
