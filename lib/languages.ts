import { z } from "zod";

export const LANGUAGE_CODES = ["auto", "en", "es", "pt", "fr", "ar"] as const;
export const languageSchema = z.enum(LANGUAGE_CODES);

export type LanguageOverride = (typeof LANGUAGE_CODES)[number];

export const SUPPORTED_LANGUAGES: Record<LanguageOverride, string> = {
  auto: "the same language as the fan's latest message",
  en: "English",
  es: "Spanish",
  pt: "Portuguese",
  fr: "French",
  ar: "Arabic",
};

export const LANGUAGE_OPTIONS: ReadonlyArray<{
  value: LanguageOverride;
  label: string;
}> = [
  { value: "auto", label: "Auto-detect" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
  { value: "fr", label: "Français" },
  { value: "ar", label: "العربية" },
];

export function parseLanguage(value: string): LanguageOverride | null {
  const result = languageSchema.safeParse(value);
  return result.success ? result.data : null;
}
