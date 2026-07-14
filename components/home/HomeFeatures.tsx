import { HOME_FEATURES } from "./homeContent";

export function HomeFeatures() {
  return (
    <section className="py-24 sm:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Designed for high-stakes moments</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
            From question to action in seconds.
          </h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {HOME_FEATURES.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-fifa-green-light">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-8 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-500">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
