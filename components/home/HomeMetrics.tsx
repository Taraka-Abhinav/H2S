import { HOME_METRICS } from "./homeContent";

export function HomeMetrics() {
  return (
    <section
      className="border-b border-white/[0.07] bg-white/[0.018]"
      aria-label="FanPulse demo metrics"
    >
      <div className="container grid grid-cols-2 divide-x divide-y divide-white/[0.07] sm:grid-cols-4 sm:divide-y-0">
        {HOME_METRICS.map(({ value, label }) => (
          <div key={label} className="px-4 py-7 text-center">
            <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-zinc-600">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
