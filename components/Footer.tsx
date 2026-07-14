import Link from "next/link";
import { Activity } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-black/20">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 text-sm text-zinc-500 sm:flex-row">
        <div className="flex items-center gap-2 text-zinc-400">
          <Activity className="h-4 w-4 text-fifa-green-light" aria-hidden="true" />
          <span className="font-medium">FanPulse AI</span>
          <span className="text-zinc-700">•</span>
          <span>World Cup 2026 concept</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/fan" className="transition-colors hover:text-white">Fan guide</Link>
          <Link href="/staff" className="transition-colors hover:text-white">Staff operations</Link>
        </div>
      </div>
    </footer>
  );
}
