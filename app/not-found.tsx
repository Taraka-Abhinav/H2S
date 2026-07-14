import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container flex flex-1 items-center justify-center py-24 text-center">
      <div className="max-w-md">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">That route is outside the stadium map.</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Return to FanPulse and choose the fan guide or operations demo.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-fifa-green px-5 py-3 text-sm font-semibold text-white hover:bg-fifa-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fifa-green-light"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
