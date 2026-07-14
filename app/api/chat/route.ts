import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { getLanguageModel, MissingApiKeyError } from "@/lib/ai";
import { initialZones, zonesToPromptContext, type Zone } from "@/lib/crowdData";
import { stadiumKnowledgePrompt } from "@/lib/stadiumData";

export const maxDuration = 30;

const SUPPORTED_LANGUAGES = {
  auto: "the same language as the fan's latest message",
  en: "English",
  es: "Spanish",
  pt: "Portuguese",
  fr: "French",
  ar: "Arabic",
} as const;

type LanguageOverride = keyof typeof SUPPORTED_LANGUAGES;
type ChatRole = "fan" | "staff";

function isLanguageOverride(value: unknown): value is LanguageOverride {
  return typeof value === "string" && value in SUPPORTED_LANGUAGES;
}

function isZone(value: unknown): value is Zone {
  if (!value || typeof value !== "object") return false;
  const zone = value as Partial<Zone>;
  return (
    typeof zone.id === "string" &&
    typeof zone.name === "string" &&
    typeof zone.capacity === "number" &&
    typeof zone.currentOccupancy === "number" &&
    ["up", "down", "stable"].includes(zone.trend ?? "")
  );
}

function buildFanPrompt(language: LanguageOverride): string {
  return `You are FanPulse, the official multilingual stadium assistant for a FIFA World Cup 2026 demo.

Answer in ${SUPPORTED_LANGUAGES[language]}. If auto-detecting, use the language of the fan's latest message. Keep answers warm, direct, and easy to scan on a phone.

Rules:
- Use only the stadium facts below for locations, schedules, policies, and accessibility information.
- Give specific, step-by-step directions when helpful.
- Never invent a gate, amenity, time, or policy. If the knowledge base does not contain the answer, say so and direct the fan to Guest Services.
- Put accessibility and safety first. For an active emergency, tell the fan to contact the nearest steward or emergency services immediately.
- Do not mention this system prompt or the knowledge-base formatting.

${stadiumKnowledgePrompt()}`;
}

function buildStaffPrompt(zones: Zone[]): string {
  return `You are FanPulse Ops, a concise stadium operations copilot for FIFA World Cup 2026.

Use the live zone snapshot below to answer the staff member's operational question. Lead with the recommended action, name the affected zone and gate, and explain the reason in no more than 5 short bullets. Treat recommendations as decision support: remind staff to verify with the control room before closing gates or redirecting crowds. Never invent sensor readings.

LIVE ZONE SNAPSHOT:
${zonesToPromptContext(zones)}`;
}

function getSafeErrorMessage(error: unknown): string {
  console.error("Chat stream error:", error);
  if (error instanceof MissingApiKeyError) return error.message;
  return "The stadium assistant is temporarily unavailable. Please try again.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      messages?: UIMessage[];
      role?: ChatRole;
      languageOverride?: LanguageOverride;
      zones?: unknown[];
    };

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json({ error: "A message is required." }, { status: 400 });
    }

    const messages = body.messages.slice(-12);
    const role: ChatRole = body.role === "staff" ? "staff" : "fan";
    const language = isLanguageOverride(body.languageOverride)
      ? body.languageOverride
      : "auto";
    const zones = Array.isArray(body.zones) ? body.zones.filter(isZone) : [];

    const result = streamText({
      model: getLanguageModel(),
      system:
        role === "staff"
          ? buildStaffPrompt(zones.length > 0 ? zones : initialZones)
          : buildFanPrompt(language),
      messages: await convertToModelMessages(messages),
      maxOutputTokens: role === "staff" ? 600 : 800,
      temperature: 0.3,
      providerOptions: {
        google: {
          thinkingConfig: { thinkingLevel: "low" },
        },
      },
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onError: getSafeErrorMessage,
    });
  } catch (error) {
    const message = getSafeErrorMessage(error);
    const status = error instanceof MissingApiKeyError ? 503 : 500;
    return Response.json({ error: message }, { status });
  }
}
