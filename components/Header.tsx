import Link from "next/link";
import { Activity, ArrowUpRight } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-ink/80 backdrop-blur-xl">
      <div className="container flex h-[72px] items-center justify-between">
        <Link href="/" className="group flex items-center gap-3" aria-label="FanPulse AI home">
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-fifa-green/25 bg-fifa-green/10 text-fifa-green-light">
            <Activity className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
            <span className="absolute inset-x-2 bottom-1 h-px bg-gradient-to-r from-transparent via-fifa-green-light to-transparent" />
          </span>
          <span>
            <span className="block text-[15px] font-bold tracking-tight text-white">FanPulse AI</span>
            <span className="hidden text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500 sm:block">Stadium intelligence</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary navigation">
          <Link href="/fan" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white">
            Fan guide
          </Link>
          <Link href="/staff" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white sm:block">
            Staff ops
          </Link>
          <Link href="/fan" className="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-ink transition-all hover:bg-fifa-green-light focus:outline-none focus:ring-2 focus:ring-fifa-green sm:ml-2">
            Ask AI <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
