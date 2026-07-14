"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("FanPulse page boundary", {
      name: error.name,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="container flex flex-1 items-center justify-center py-24 text-center">
      <div className="max-w-md">
        <p className="eyebrow">Recoverable error</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          FanPulse could not load this view.
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          No operational action was taken. Try loading the view again.
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
