import type { RefObject } from "react";
import type { ChatStatus, UIMessage } from "ai";
import { Bot, Loader2, User } from "lucide-react";
import { SafeMarkdown, messageText } from "@/components/SafeMarkdown";

interface ChatTranscriptProps {
  messages: UIMessage[];
  status: ChatStatus;
  endRef: RefObject<HTMLDivElement>;
}

export function ChatTranscript({ messages, status, endRef }: ChatTranscriptProps) {
  if (messages.length === 0) {
    return (
      <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center py-10 text-center">
        <div className="stadium-orbit mb-7 flex h-24 w-24 items-center justify-center rounded-full">
          <Bot className="h-10 w-10 text-fifa-green-light" aria-hidden="true" />
        </div>
        <p className="eyebrow mb-3">Welcome to matchday</p>
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Ask in your language.
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
          Get context-aware directions and venue guidance in English, Spanish,
          Portuguese, French, or Arabic.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {messages.map((message) => {
        const text = messageText(message);
        if (!text && message.role !== "assistant") return null;

        return (
          <div
            key={message.id}
            className={`flex items-end gap-2.5 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-fifa-green/15 text-fifa-green-light">
                <Bot className="h-4 w-4" aria-hidden="true" />
              </div>
            )}
            <div
              className={`max-w-[86%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[76%] ${
                message.role === "user"
                  ? "rounded-br-md bg-fifa-blue text-white shadow-lg shadow-fifa-blue/10"
                  : "rounded-bl-md border border-white/10 bg-white/[0.055] text-zinc-200"
              }`}
            >
              {text ? (
                <SafeMarkdown className="[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p+p]:mt-2 [&_strong]:font-semibold [&_strong]:text-white [&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
                  {text}
                </SafeMarkdown>
              ) : (
                <span className="flex items-center gap-2 text-zinc-400">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Thinking…
                </span>
              )}
            </div>
            {message.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-fifa-blue/20 text-blue-300">
                <User className="h-4 w-4" aria-hidden="true" />
              </div>
            )}
          </div>
        );
      })}

      {status === "submitted" && (
        <div className="flex items-center gap-2.5 text-sm text-zinc-500">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-fifa-green/15">
            <Bot className="h-4 w-4 text-fifa-green-light" aria-hidden="true" />
          </div>
          <Loader2 className="h-4 w-4 animate-spin text-fifa-green-light" aria-hidden="true" />
          Finding the safest route…
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
