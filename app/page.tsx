import Link from "next/link";
import {
  Accessibility,
  Activity,
  ArrowRight,
  Bot,
  Languages,
  MapPinned,
  Radio,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Waves,
} from "lucide-react";
import { HeroCard } from "@/components/HeroCard";

const METRICS = [
  ["5", "fan languages"],
  ["8", "live stadium zones"],
  ["15s", "crowd refresh"],
  ["24/7", "matchday context"],
];

export default function Home() {
  return (
    <div className="overflow-hidden">
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
              Built for FIFA World Cup 2026 matchdays
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-[5.35rem]">
              Every fan guided. <span className="bg-gradient-to-r from-fifa-green-light via-emerald-300 to-blue-300 bg-clip-text text-transparent">Every zone understood.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl">
              FanPulse AI turns stadium knowledge and live crowd signals into calm,
              confident matchdays—for the people in the stands and the teams behind them.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/fan" className="inline-flex items-center justify-center gap-2 rounded-xl bg-fifa-green px-5 py-3.5 text-sm font-bold text-ink shadow-glow transition-all hover:-translate-y-0.5 hover:bg-fifa-green-light focus:outline-none focus:ring-2 focus:ring-fifa-green-light focus:ring-offset-2 focus:ring-offset-ink">
                Open fan assistant <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/staff" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.045] px-5 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.075] focus:outline-none focus:ring-2 focus:ring-white/40">
                View live operations <Activity className="h-4 w-4 text-blue-300" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-zinc-500">
              <span className="flex items-center gap-2"><Languages className="h-4 w-4 text-fifa-green-light" /> Multilingual</span>
              <span className="flex items-center gap-2"><Accessibility className="h-4 w-4 text-fifa-green-light" /> Accessibility-first</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-fifa-green-light" /> Grounded answers</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[580px] animate-float lg:mx-0">
            <div className="absolute -inset-10 -z-10 rounded-full bg-gradient-to-br from-fifa-green/15 to-fifa-blue/10 blur-3xl" />
            <div className="glass-panel relative overflow-hidden rounded-[2rem] p-4 shadow-2xl sm:p-5">
              <div className="flex items-center justify-between border-b border-white/[0.08] px-1 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="h-3.5 w-3.5 text-fifa-green-light" />
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">Live stadium pulse</p>
                  </div>
                  <p className="mt-1.5 text-[11px] text-zinc-600">MetLife Stadium • 20:42</p>
                </div>
                <span className="rounded-full border border-fifa-green/20 bg-fifa-green/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-fifa-green-light">Connected</span>
              </div>

              <div className="grid gap-4 py-4 sm:grid-cols-[1.08fr_0.92fr]">
                <div className="relative min-h-64 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                  <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,.14)_1px,transparent_1px)] [background-size:20px_20px]" />
                  <div className="relative mx-auto mt-6 flex h-44 w-[88%] items-center justify-center rounded-[50%] border border-white/15 bg-gradient-to-b from-white/[0.04] to-transparent shadow-inner">
                    <div className="absolute inset-5 rounded-[50%] border border-fifa-green/30 bg-fifa-green/[0.06]" />
                    <div className="absolute inset-10 rounded-[50%] border border-white/10 bg-[#07110e]" />
                    <div className="relative h-14 w-24 rounded-md border border-white/30 bg-emerald-950/80">
                      <span className="absolute left-1/2 top-0 h-full w-px bg-white/25" />
                      <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />
                    </div>
                    <span className="absolute left-[3%] top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-red-400/30 bg-red-400/15 text-xs font-bold text-red-300">C</span>
                    <span className="absolute right-[4%] top-[24%] flex h-8 w-8 items-center justify-center rounded-xl border border-fifa-green/25 bg-fifa-green/10 text-[11px] font-bold text-fifa-green-light">E</span>
                    <span className="absolute bottom-[3%] right-[31%] flex h-8 w-8 items-center justify-center rounded-xl border border-yellow-300/25 bg-yellow-300/10 text-[11px] font-bold text-yellow-200">H</span>
                  </div>
                  <div className="relative mt-3 flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-600">
                    <span>8 zones online</span><span>Next refresh 00:11</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-300">Attention</span>
                      <TrendingUp className="h-4 w-4 text-red-300" />
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-white">92%</p>
                    <p className="text-xs text-zinc-400">Zone C • West concourse</p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full w-[92%] rounded-full bg-gradient-to-r from-yellow-300 to-red-400" /></div>
                  </div>
                  <div className="rounded-2xl border border-fifa-blue/20 bg-fifa-blue/[0.07] p-4">
                    <div className="flex items-center gap-2 text-blue-300"><Sparkles className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-[0.14em]">AI action</span></div>
                    <p className="mt-3 text-xs leading-5 text-zinc-300">Prepare overflow Gate C2 and redirect west-plaza arrivals.</p>
                    <p className="mt-3 text-[10px] text-zinc-600">Generated 12 sec ago</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-fifa-green/10 text-fifa-green-light"><Bot className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-zinc-200">“How do I reach Section 114?”</p><p className="mt-0.5 truncate text-[10px] text-zinc-600">Via Gate C • step-free route available</p></div>
                <Waves className="h-4 w-4 text-fifa-green-light" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.07] bg-white/[0.018]">
        <div className="container grid grid-cols-2 divide-x divide-y divide-white/[0.07] sm:grid-cols-4 sm:divide-y-0">
          {METRICS.map(([value, label]) => (
            <div key={label} className="px-4 py-7 text-center">
              <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-zinc-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="choose" className="container py-24 sm:py-32">
        <div className="mb-12 max-w-2xl">
          <p className="eyebrow">One platform, two perspectives</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Built for everyone who makes matchday move.</h2>
          <p className="mt-5 text-base leading-7 text-zinc-400">Choose your view. Fans get instant venue guidance; staff get a live operating picture and decision support.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <HeroCard href="/fan" eyebrow="For supporters" title="Find your way, faster." description="A multilingual stadium guide for seats, accessible routes, shuttles, policies, amenities, and sustainable choices." action="Start asking" icon={MapPinned} accent="green" />
          <HeroCard href="/staff" eyebrow="For operations teams" title="See pressure before it builds." description="Monitor eight live zones, spot crowd trends, generate operational recommendations, and ask questions against the current feed." action="Open control view" icon={Users} accent="blue" />
        </div>
      </section>

      <section className="border-y border-white/[0.07] bg-white/[0.018] py-24 sm:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Designed for high-stakes moments</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">From question to action in seconds.</h2>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              [Languages, "Speak naturally", "Automatic language detection and manual override across five core fan languages."],
              [Accessibility, "Access without friction", "Step-free routes, accessible amenities, sensory spaces, and hearing-support information."],
              [Activity, "Operate with foresight", "Live occupancy signals become prioritized, specific recommendations for stadium teams."],
            ].map(([Icon, title, description]) => {
              const FeatureIcon = Icon as typeof Languages;
              return (
                <div key={title as string} className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-fifa-green-light"><FeatureIcon className="h-5 w-5" /></span>
                  <h3 className="mt-8 text-xl font-semibold text-white">{title as string}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">{description as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container py-24 sm:py-32">
        <div className="relative overflow-hidden rounded-[2rem] border border-fifa-green/20 bg-gradient-to-br from-fifa-green/[0.11] via-white/[0.035] to-fifa-blue/[0.1] px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="absolute inset-0 hero-grid opacity-50" />
          <div className="relative mx-auto max-w-2xl">
            <p className="eyebrow">Ready for kickoff</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">A smarter stadium starts with one question.</h2>
            <p className="mt-5 text-base leading-7 text-zinc-400">Try the fan assistant, then watch the same venue come alive from the operations view.</p>
            <Link href="/fan" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-fifa-green-light">
              Explore FanPulse AI <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
