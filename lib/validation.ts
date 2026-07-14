import type { UIMessage } from "ai";
import { z } from "zod";
import { languageSchema, type LanguageOverride } from "@/lib/languages";
import {
  ACCESS_PREFERENCES,
  DEFAULT_FAN_CONTEXT,
  FAN_LOCATIONS,
  type FanContext,
} from "@/lib/matchday";

const messageEnvelopeSchema = z
  .object({
    id: z.string().min(1).max(128).optional(),
    role: z.enum(["user", "assistant"]),
    parts: z.array(z.unknown()).min(1).max(12),
  })
  .strip();

const textPartSchema = z
  .object({
    type: z.literal("text"),
    text: z.string(),
  })
  .strip();

const fanContextSchema = z
  .object({
    currentLocation: z.enum(FAN_LOCATIONS),
    accessPreference: z.enum(ACCESS_PREFERENCES),
  })
  .strip();

const chatEnvelopeSchema = z
  .object({
    messages: z.array(z.unknown()).min(1).max(40),
    languageOverride: languageSchema.optional().default("auto"),
    fanContext: fanContextSchema.optional().default(DEFAULT_FAN_CONTEXT),
  })
  .strip();

export interface ValidatedChatPayload {
  messages: UIMessage[];
  language: LanguageOverride;
  fanContext: FanContext;
  latestQuestion: string;
}

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function sanitizeTextParts(parts: unknown[]): string {
  return parts
    .flatMap((part) => {
      const candidate = textPartSchema.safeParse(part);
      if (!candidate.success) return [];
      const text = candidate.data.text.trim();
      return text ? [text.slice(0, 2_000)] : [];
    })
    .join("\n")
    .slice(0, 2_000);
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
  return {
    success: true,
    data: {
      messages: sanitized,
      language: envelope.data.languageOverride,
      fanContext:
        audience === "fan" ? envelope.data.fanContext : DEFAULT_FAN_CONTEXT,
      latestQuestion,
    },
  };
}
