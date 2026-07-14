import { google } from "@ai-sdk/google";

export const AI_MODEL = "gemini-3.5-flash";

export class MissingApiKeyError extends Error {
  constructor() {
    super(
      "FanPulse AI is not configured yet. Add GOOGLE_GENERATIVE_AI_API_KEY to .env.local."
    );
    this.name = "MissingApiKeyError";
  }
}

export function getLanguageModel() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new MissingApiKeyError();
  }

  return google(AI_MODEL);
}
