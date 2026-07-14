const MAX_BODY_BYTES = 32 * 1024;

export type BodyReadResult =
  | { success: true; data: unknown }
  | { success: false; response: Response };

function noStoreHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set("Cache-Control", "no-store, max-age=0");
  headers.set("X-Content-Type-Options", "nosniff");
  return headers;
}

export function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return Response.json(body, {
    ...init,
    headers: noStoreHeaders(init.headers),
  });
}

export async function readBoundedJsonBody(
  request: Request,
  maxBytes = MAX_BODY_BYTES
): Promise<BodyReadResult> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return {
      success: false,
      response: jsonResponse(
        { error: "Content-Type must be application/json." },
        { status: 415 }
      ),
    };
  }

  const declaredSize = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredSize) && declaredSize > maxBytes) {
    return {
      success: false,
      response: jsonResponse(
        { error: "Request body is too large." },
        { status: 413 }
      ),
    };
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > maxBytes) {
    return {
      success: false,
      response: jsonResponse(
        { error: "Request body is too large." },
        { status: 413 }
      ),
    };
  }

  try {
    const data: unknown = JSON.parse(rawBody);
    return { success: true, data };
  } catch {
    return {
      success: false,
      response: jsonResponse(
        { error: "Request body must be valid JSON." },
        { status: 400 }
      ),
    };
  }
}

export function hasTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto =
    request.headers.get("x-forwarded-proto") ??
    requestUrl.protocol.slice(0, -1);
  const expectedOrigin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin;

  return origin === expectedOrigin;
}

export function safeErrorDetails(error: unknown): {
  name: string;
  message: string;
} {
  if (!(error instanceof Error)) {
    return { name: "UnknownError", message: "Unknown server error" };
  }

  return {
    name: error.name.slice(0, 80),
    message: error.message
      .replace(/AIza[0-9A-Za-z_-]{20,}/g, "[REDACTED]")
      .slice(0, 240),
  };
}
