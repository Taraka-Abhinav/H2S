"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { SafeMarkdown, messageText } from "./SafeMarkdown";

export function StaffAskAI() {
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat/staff",
        body: () => ({ languageOverride: "en" }),
      }),
    []
  );

  const { messages, sendMessage, status, error } = useChat({ transport });
  const isBusy = status === "submitted" || status === "streaming";
  const lastAnswer = messageText(
    [...messages].reverse().find((message) => message.role === "assistant")
  );

  return (
    <Card className="p-5 sm:p-6" elevated>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-fifa-gold">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">Ops copilot</span>
          </div>
          <h2 className="text-lg font-semibold text-white">Ask about current operations</h2>
          <p className="mt-1 text-sm text-zinc-500">Answers use the shared server snapshot.</p>
        </div>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const text = input.trim();
          if (!text || isBusy) return;
          setInput("");
          void sendMessage({ text });
        }}
      >
        <label htmlFor="staff-question" className="sr-only">Ask an operational question</label>
        <input
          id="staff-question"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Which gate should relieve Zone C?"
          maxLength={1_000}
          disabled={isBusy}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-fifa-gold/50 focus:ring-2 focus:ring-fifa-gold/10 disabled:opacity-50"
        />
        <Button type="submit" variant="secondary" disabled={isBusy || !input.trim()} aria-label="Ask operations copilot">
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>

      {error && (
        <p role="alert" className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
          {error.message || "The operations copilot could not respond."}
        </p>
      )}

      {isBusy && !lastAnswer && (
        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin text-fifa-gold" />
          Analyzing the shared feed…
        </div>
      )}

      {lastAnswer && (
        <div className="mt-4 rounded-xl border border-fifa-gold/20 bg-fifa-gold/[0.06] p-4">
          <SafeMarkdown className="text-sm leading-6 text-zinc-200 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_strong]:font-semibold [&_strong]:text-white [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
            {lastAnswer}
          </SafeMarkdown>
        </div>
      )}
    </Card>
  );
}
