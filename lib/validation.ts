import type { UIMessage } from "ai";
import { z } from "zod";
import { initialZones, type Zone } from "@/lib/crowdData";

export const SUPPORTED_LANGUAGES = {
  auto: "the same language as the fan's latest message",
  en: "English",
  es: "Spanish",
  pt: "Portuguese",
  fr: "French",
  ar: "Arabic",
} as const;

export type LanguageOverride = keyof typeof SUPPORTED_LANGUAGES;

const languageSchema = z.enum(["auto", "en", "es", "pt", "fr", "ar"]);
const zoneIdSchema = z.enum(["A", "B", "C", "D", "E", "F", "G", "H"]);

const zoneSnapshotSchema = z
  .object({
    id: zoneIdSchema,
    currentOccupancy: z.number().int().min(0).max(100),
    trend: z.enum(["up", "down", "stable"]),
  })
  .strip();

const messageEnvelopeSchema = z
  .object({
    id: z.string().min(1).max(128).optional(),
    role: z.enum(["user", "assistant"]),
    parts: z.array(z.unknown()).min(1).max(12),
  })
  .strip();

const chatEnvelopeSchema = z
  .object({
    messages: z.array(z.unknown()).min(1).max(40),
    languageOverride: languageSchema.optional().default("auto"),
    zones: z.array(z.unknown()).max(16).optional(),
  })
  .strip();

const canonicalZones = new Map(initialZones.map((zone) => [zone.id, zone]));

export interface ValidatedChatPayload {
  messages: UIMessage[];
  language: LanguageOverride;
  zones: Zone[];
  latestQuestion: string;
}

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function sanitizeTextParts(parts: unknown[]): string {
  return parts
    .flatMap((part) => {
      if (!part || typeof part !== "object") return [];
      const candidate = part as { type?: unknown; text?: unknown };
      if (candidate.type !== "text" || typeof candidate.text !== "string") {
        return [];
      }
      const text = candidate.text.trim();
      return text ? [text.slice(0, 2_000)] : [];
    })
    .join("\n")
    .slice(0, 2_000);
}

export function canonicalizeZones(input: unknown): ValidationResult<Zone[]> {
  if (!Array.isArray(input) || input.length < 2 || input.length > 8) {
    return {
      success: false,
      error: "Between 2 and 8 valid zone snapshots are required.",
    };
  }

  const parsed = input.map((zone) => zoneSnapshotSchema.safeParse(zone));
  if (parsed.some((result) => !result.success)) {
    return { success: false, error: "One or more zone snapshots are invalid." };
  }

  const snapshots = parsed.map((result) => {
    if (!result.success) throw new Error("Unreachable validation state");
    return result.data;
  });
  const ids = snapshots.map((snapshot) => snapshot.id);
  if (new Set(ids).size !== ids.length) {
    return { success: false, error: "Zone IDs must be unique." };
  }

  return {
    success: true,
    data: snapshots.map((snapshot) => {
      const canonical = canonicalZones.get(snapshot.id);
      if (!canonical) throw new Error("Unknown canonical zone");
      return {
        ...canonical,
        currentOccupancy: snapshot.currentOccupancy,
        trend: snapshot.trend,
      };
    }),
  };
}

export function validateChatPayload(
  input: unknown,
  audience: "fan" | "staff"
): ValidationResult<ValidatedChatPayload> {
  const envelope = chatEnvelopeSchema.safeParse(input);
  if (!envelope.success) {
    return { success: false, error: "A valid chat message is required." };
  }

  const sanitized: UIMessage[] = [];
  let totalCharacters = 0;

  for (const rawMessage of envelope.data.messages.slice(-8)) {
    const parsed = messageEnvelopeSchema.safeParse(rawMessage);
    if (!parsed.success) continue;

    const text = sanitizeTextParts(parsed.data.parts);
    if (!text || totalCharacters + text.length > 8_000) continue;
    totalCharacters += text.length;
    sanitized.push({
      id: parsed.data.id ?? `message-${sanitized.length + 1}`,
      role: parsed.data.role,
      parts: [{ type: "text", text }],
    });
  }

  const latest = sanitized.at(-1);
  if (!latest || latest.role !== "user") {
    return {
      success: false,
      error: "The latest valid message must be from the user.",
    };
  }

  const latestQuestion = sanitizeTextParts(latest.parts);
  const zonesResult =
    audience === "staff"
      ? canonicalizeZones(envelope.data.zones)
      : { success: true as const, data: [] as Zone[] };

  if (!zonesResult.success) return zonesResult;

  return {
    success: true,
    data: {
      messages: sanitized,
      language: envelope.data.languageOverride,
      zones: zonesResult.data,
      latestQuestion,
    },
  };
}
