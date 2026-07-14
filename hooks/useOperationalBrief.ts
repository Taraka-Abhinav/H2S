"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  operationalBriefResponseSchema,
  type OperationalBrief,
} from "@/lib/insights";
import type { MatchdaySnapshot } from "@/lib/matchday";
import { buildOperationalInsights } from "@/lib/operations";

interface OperationalBriefState {
  brief: OperationalBrief | null;
  loading: boolean;
  error: string | null;
  isStale: boolean;
  refresh: () => Promise<void>;
}

export function useOperationalBrief(
  snapshot: MatchdaySnapshot | null
): OperationalBriefState {
  const [brief, setBrief] = useState<OperationalBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const currentSnapshotId = useRef<string | null>(null);
  currentSnapshotId.current = snapshot?.snapshotId ?? null;

  useEffect(() => {
    if (!snapshot) return;
    setBrief((current) =>
      current ?? {
        insights: buildOperationalInsights(snapshot.zones, snapshot.phase),
        source: "rules",
        snapshotId: snapshot.snapshotId,
        generatedAt: snapshot.generatedAt,
      }
    );
  }, [snapshot]);

  const refresh = useCallback(async () => {
    if (!snapshot) return;
    const requestedSnapshotId = snapshot.snapshotId;
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshotId: requestedSnapshotId }),
        signal: controller.signal,
      });
      const payload: unknown = await response.json();
      const parsed = operationalBriefResponseSchema.safeParse(payload);
      if (!response.ok || !parsed.success) {
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Failed to generate recommendations.";
        throw new Error(message);
      }
      if (currentSnapshotId.current !== requestedSnapshotId) return;
      setBrief(parsed.data);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        return;
      }
      setError(
        requestError instanceof Error ? requestError.message : "Unknown error"
      );
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setLoading(false);
      }
    }
  }, [snapshot]);

  useEffect(() => () => activeRequest.current?.abort(), []);

  return {
    brief,
    loading,
    error,
    isStale: Boolean(
      snapshot && brief && snapshot.snapshotId !== brief.snapshotId
    ),
    refresh,
  };
}
