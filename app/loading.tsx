export default function Loading() {
  return (
    <div className="container flex flex-1 items-center justify-center py-24" role="status">
      <div className="text-center">
        <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-fifa-green-light motion-reduce:animate-none" />
        <p className="mt-4 text-sm text-zinc-400">Loading FanPulse…</p>
      </div>
    </div>
  );
}
