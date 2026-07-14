import { handleChatRequest } from "@/lib/chatRoute";

export const maxDuration = 90;

export function POST(request: Request) {
  return handleChatRequest(request, "staff");
}
