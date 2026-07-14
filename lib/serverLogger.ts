import { safeErrorDetails } from "@/lib/requestSecurity";

interface LogContext {
  requestId: string;
  route: string;
}

export function logServerError(
  event: string,
  context: LogContext,
  error: unknown
): void {
  console.error(event, { ...context, ...safeErrorDetails(error) });
}

export function logServerFallback(
  event: string,
  context: LogContext,
  error: unknown
): void {
  console.warn(event, { ...context, ...safeErrorDetails(error) });
}
