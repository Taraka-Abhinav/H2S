import { MapPinned, Users } from "lucide-react";
import { HeroCard } from "@/components/HeroCard";

export function PersonaChooser() {
  return (
    <section id="choose" className="container py-24 sm:py-32">
      <div className="mb-12 max-w-2xl">
        <p className="eyebrow">One platform, two perspectives</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
          Built for everyone who makes matchday move.
        </h2>
        <p className="mt-5 text-base leading-7 text-zinc-400">
          Choose your view. Fans get instant venue guidance; staff get a simulated
          operating picture and decision support.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <HeroCard
          href="/fan"
          eyebrow="For supporters"
          title="Find your way, faster."
          description="A multilingual stadium guide for seats, accessible routes, shuttles, policies, amenities, and sustainable choices."
          action="Start asking"
          icon={MapPinned}
          accent="green"
        />
        <HeroCard
          href="/staff"
          eyebrow="For operations teams"
          title="See pressure before it builds."
          description="Monitor eight simulated demo zones, spot crowd trends, generate operational recommendations, and ask questions against the current simulated feed."
          action="Open control view"
          icon={Users}
          accent="blue"
        />
      </div>
    </section>
  );
}
