import { convertToModelMessages, streamText } from "ai";
import {
  getLanguageModel,
  getOperationsModel,
  MissingApiKeyError,
} from "@/lib/ai";
import { buildFanPrompt, buildStaffPrompt } from "@/lib/chatPrompts";
import { getMatchdaySnapshot } from "@/lib/matchday";
import {
  checkRateLimit,
  hasTrustedOrigin,
  jsonResponse,
  rateLimitResponse,
  readBoundedJsonBody,
} from "@/lib/requestSecurity";
import { logServerError } from "@/lib/serverLogger";
import { validateChatPayload } from "@/lib/validation";

export type ChatAudience = "fan" | "staff";

function logChatFailure(audience: ChatAudience, requestId: string, error: unknown) {
  logServerError("FanPulse chat request failed", {
    route: `${audience}-chat`,
    requestId,
  }, error);
}

export async function handleChatRequest(
  request: Request,
  audience: ChatAudience
): Promise<Response> {
  const requestId = crypto.randomUUID();

  if (!hasTrustedOrigin(request)) {
    return jsonResponse({ error: "Request origin is not allowed." }, { status: 403 });
  }

  const limit = checkRateLimit(
    request,
    audience === "fan" ? "fan-chat" : "staff-chat",
    audience === "fan" ? 12 : 6
  );
  if (!limit.allowed) return rateLimitResponse(limit);

  const body = await readBoundedJsonBody(request);
  if (!body.success) return body.response;

  const validated = validateChatPayload(body.data, audience);
  if (!validated.success) {
    return jsonResponse({ error: validated.error }, { status: 400 });
  }

  try {
    const { messages, language, fanContext, latestQuestion } = validated.data;
    const snapshot = getMatchdaySnapshot();
    const abortSignal = AbortSignal.any([
      request.signal,
      AbortSignal.timeout(70_000),
    ]);

    const result = streamText({
      model:
        audience === "staff" ? getOperationsModel() : getLanguageModel(),
      system:
        audience === "staff"
          ? buildStaffPrompt(snapshot)
          : buildFanPrompt(language, latestQuestion, fanContext, snapshot),
      messages: await convertToModelMessages(messages),
      maxOutputTokens: audience === "staff" ? 420 : 520,
      maxRetries: 1,
      abortSignal,
      providerOptions: {
        google: {
          thinkingConfig: { thinkingLevel: "minimal" },
        },
      },
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "X-Request-ID": requestId,
        "X-RateLimit-Remaining": String(limit.remaining),
      },
      onError: (error) => {
        logChatFailure(audience, requestId, error);
        return error instanceof MissingApiKeyError
          ? "FanPulse AI is not configured on the server."
          : "The stadium assistant is temporarily unavailable. Please try again.";
      },
    });
  } catch (error) {
    logChatFailure(audience, requestId, error);
    const status = error instanceof MissingApiKeyError ? 503 : 500;
    return jsonResponse(
      {
        error:
          status === 503
            ? "FanPulse AI is not configured on the server."
            : "The stadium assistant is temporarily unavailable. Please try again.",
      },
      { status, headers: { "X-Request-ID": requestId } }
    );
  }
}
