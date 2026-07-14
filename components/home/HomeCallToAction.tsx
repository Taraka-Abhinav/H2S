import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HomeCallToAction() {
  return (
    <section className="container py-24 sm:py-32">
      <div className="relative overflow-hidden rounded-[2rem] border border-fifa-green/20 bg-gradient-to-br from-fifa-green/[0.11] via-white/[0.035] to-fifa-blue/[0.1] px-6 py-14 text-center sm:px-12 sm:py-20">
        <div className="hero-grid absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-2xl">
          <p className="eyebrow">Ready for kickoff</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            A smarter stadium starts with one question.
          </h2>
          <p className="mt-5 text-base leading-7 text-zinc-400">
            Try the fan assistant, then explore the same venue through the simulated
            operations view.
          </p>
          <Link
            href="/fan"
            prefetch={false}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-fifa-green-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fifa-green-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Explore FanPulse AI
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
