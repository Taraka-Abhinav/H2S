"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { matchdaySnapshotSchema, type MatchdaySnapshot } from "@/lib/matchday";
import { OPERATIONS_POLICY } from "@/lib/operationsPolicy";

interface MatchdayTelemetryState {
  snapshot: MatchdaySnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMatchdayTelemetry(): MatchdayTelemetryState {
  const [snapshot, setSnapshot] = useState<MatchdaySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;

    try {
      const response = await fetch("/api/telemetry", {
        cache: "no-store",
        signal: controller.signal,
      });
      const payload: unknown = await response.json();
      const parsed = matchdaySnapshotSchema.safeParse(payload);
      if (!response.ok || !parsed.success) {
        throw new Error("The simulated operations feed is unavailable.");
      }
      setSnapshot(parsed.data);
      setError(null);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        return;
      }
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The simulated operations feed is unavailable."
      );
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const stop = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
    };
    const start = () => {
      stop();
      if (document.hidden) return;
      void refresh();
      intervalId = setInterval(
        () => void refresh(),
        OPERATIONS_POLICY.simulation.refreshMs
      );
    };
    const handleVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stop();
      activeRequest.current?.abort();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refresh]);

  return { snapshot, loading, error, refresh };
}
