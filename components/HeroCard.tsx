import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

interface HeroCardProps {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  icon: LucideIcon;
  accent: "green" | "blue";
}

const styles = {
  green: {
    line: "from-fifa-green to-fifa-green-light",
    icon: "border-fifa-green/25 bg-fifa-green/10 text-fifa-green-light",
    glow: "group-hover:shadow-[0_28px_80px_rgba(32,199,122,0.13)]",
  },
  blue: {
    line: "from-fifa-blue to-cyan-400",
    icon: "border-fifa-blue/25 bg-fifa-blue/10 text-blue-300",
    glow: "group-hover:shadow-[0_28px_80px_rgba(65,105,255,0.14)]",
  },
};

export function HeroCard({ href, eyebrow, title, description, action, icon: Icon, accent }: HeroCardProps) {
  const accentStyle = styles[accent];

  return (
    <Link
      href={href}
      prefetch={false}
      className={`group relative overflow-hidden rounded-[1.75rem] border border-white/[0.09] bg-white/[0.035] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fifa-green-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:p-9 ${accentStyle.glow}`}
    >
      <span className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accentStyle.line}`} />
      <div className="mb-10 flex items-start justify-between">
        <span className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${accentStyle.icon}`}>
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
        <ArrowUpRight className="h-5 w-5 text-zinc-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" aria-hidden="true" />
      </div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{eyebrow}</p>
      <h3 className="text-3xl font-semibold tracking-tight text-white">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">{description}</p>
      <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white">
        {action}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}
