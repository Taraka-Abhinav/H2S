import { Bot, Radio, Sparkles, TrendingUp, Waves } from "lucide-react";

export function DemoStadiumPulse() {
  return (
    <div className="relative mx-auto w-full max-w-[580px] animate-float lg:mx-0">
      <div className="absolute -inset-10 -z-10 rounded-full bg-gradient-to-br from-fifa-green/15 to-fifa-blue/10 blur-3xl" />
      <div className="glass-panel relative overflow-hidden rounded-[2rem] p-4 shadow-2xl sm:p-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-1 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 text-fifa-green-light" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
                Simulated stadium pulse
              </p>
            </div>
            <p className="mt-1.5 text-[11px] text-zinc-600">
              MetLife Stadium • demo scenario
            </p>
          </div>
          <span className="rounded-full border border-fifa-green/20 bg-fifa-green/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-fifa-green-light">
            Demo data
          </span>
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
              <span className="absolute left-[3%] top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-red-400/30 bg-red-400/15 text-xs font-bold text-red-300">
                C
              </span>
              <span className="absolute right-[4%] top-[24%] flex h-8 w-8 items-center justify-center rounded-xl border border-fifa-green/25 bg-fifa-green/10 text-[11px] font-bold text-fifa-green-light">
                E
              </span>
              <span className="absolute bottom-[3%] right-[31%] flex h-8 w-8 items-center justify-center rounded-xl border border-yellow-300/25 bg-yellow-300/10 text-[11px] font-bold text-yellow-200">
                H
              </span>
            </div>
            <div className="relative mt-3 flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-600">
              <span>8 sample zones</span>
              <span>Illustrative snapshot</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-300">
                  Attention
                </span>
                <TrendingUp className="h-4 w-4 text-red-300" aria-hidden="true" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-white">92%</p>
              <p className="text-xs text-zinc-400">Zone C • West concourse</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-yellow-300 to-red-400" />
              </div>
            </div>
            <div className="rounded-2xl border border-fifa-blue/20 bg-fifa-blue/[0.07] p-4">
              <div className="flex items-center gap-2 text-blue-300">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                  AI action
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-zinc-300">
                Prepare overflow Gate C2 and redirect west-plaza arrivals.
              </p>
              <p className="mt-3 text-[10px] text-zinc-600">
                Deterministic demo action
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-fifa-green/10 text-fifa-green-light">
            <Bot className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-zinc-200">
              “How do I reach Section 114?”
            </p>
            <p className="mt-0.5 truncate text-[10px] text-zinc-600">
              Via Gate C • step-free route available
            </p>
          </div>
          <Waves className="h-4 w-4 text-fifa-green-light" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
