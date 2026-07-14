import {
  CHALLENGE_CAPABILITIES,
  HOME_PROCESS_STEPS,
} from "./homeContent";

export function ChallengeCoverage() {
  return (
    <section
      className="border-y border-white/[0.07] bg-white/[0.018] py-24 sm:py-28"
      aria-labelledby="challenge-coverage-title"
    >
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div className="max-w-xl">
            <p className="eyebrow">Challenge 4 coverage</p>
            <h2
              id="challenge-coverage-title"
              className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl"
            >
              One matchday platform, six real operations outcomes.
            </h2>
            <p className="mt-5 text-base leading-7 text-zinc-400">
              FanPulse combines trusted venue knowledge, simulated matchday signals,
              deterministic safety logic, and grounded GenAI so every answer is
              useful even when the model is unavailable.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {CHALLENGE_CAPABILITIES.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-fifa-green/10 text-fifa-green-light">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className="font-semibold text-white">{title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-500">{description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-14 grid overflow-hidden rounded-3xl border border-white/[0.08] bg-black/15 md:grid-cols-3">
          {HOME_PROCESS_STEPS.map(({ step, title, description }) => (
            <article
              key={step}
              className="border-b border-white/[0.08] p-6 last:border-0 sm:p-7 md:border-b-0 md:border-r md:last:border-r-0"
            >
              <p className="text-xs font-bold tracking-[0.2em] text-fifa-gold">{step}</p>
              <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
