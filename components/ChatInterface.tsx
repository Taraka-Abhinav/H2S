"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, CircleStop, Radio, Send, ShieldCheck } from "lucide-react";
import { ChatTranscript } from "@/components/chat/ChatTranscript";
import { FanContextControls } from "@/components/FanContextControls";
import { LanguageSelector, type LanguageOption } from "@/components/LanguageSelector";
import {
  FAN_SUGGESTIONS,
  SuggestionButtons,
} from "@/components/SuggestionButtons";
import { Button } from "@/components/ui/Button";
import { useMatchdayTelemetry } from "@/hooks/useMatchdayTelemetry";
import { DEFAULT_FAN_CONTEXT, type FanContext } from "@/lib/matchday";

export function ChatInterface() {
  const [language, setLanguage] = useState<LanguageOption>("auto");
  const [fanContext, setFanContext] = useState<FanContext>(DEFAULT_FAN_CONTEXT);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { snapshot } = useMatchdayTelemetry();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { languageOverride: language, fanContext },
      }),
    [fanContext, language]
  );

  const { messages, sendMessage, status, error, stop } = useChat({ transport });
  const isBusy = status === "submitted" || status === "streaming";
  const activeAdvisory = snapshot?.advisories[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: status === "streaming" ? "auto" : "smooth",
      block: "end",
    });
  }, [messages, status]);

  const submitMessage = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isBusy) return;
    setInput("");
    await sendMessage({ text: cleanText });
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-labelledby="fan-assistant-title">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-fifa-green-light">
            <Radio className="h-3.5 w-3.5" aria-hidden="true" />
            Matchday assistant online
          </div>
          <h1 id="fan-assistant-title" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Where can we help you go?
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gates, seats, accessibility, transport, and stadium essentials.
          </p>
        </div>
        <LanguageSelector value={language} onChange={setLanguage} />
      </div>

      <div className="glass-panel flex min-h-[620px] flex-1 flex-col overflow-hidden rounded-[1.75rem]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-fifa-green/15 text-fifa-green-light">
              <Bot className="h-5 w-5" aria-hidden="true" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink bg-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">FanPulse guide</p>
              <p className="text-xs text-zinc-500">Grounded in venue + shared simulated context</p>
            </div>
          </div>
          <div className="hidden items-center gap-1.5 text-xs text-zinc-500 sm:flex">
            <ShieldCheck className="h-4 w-4 text-fifa-green-light" aria-hidden="true" />
            Accessibility-first
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6" aria-live="polite">
          <ChatTranscript messages={messages} status={status} endRef={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 bg-black/15 p-4 sm:p-5">
          <FanContextControls value={fanContext} onChange={setFanContext} disabled={isBusy} />
          {activeAdvisory && (
            <p role="status" className="mt-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.07] px-3 py-2 text-xs leading-5 text-amber-100">
              <span className="font-semibold">Simulated advisory:</span>{" "}
              {activeAdvisory.publicGuidance}
            </p>
          )}
          {error && (
            <div role="alert" className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
              {error.message || "The assistant could not respond. Please try again."}
            </div>
          )}

          <div className="mt-3">
            <SuggestionButtons suggestions={FAN_SUGGESTIONS} onSelect={submitMessage} disabled={isBusy} />
          </div>
          <form
            className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] p-2 focus-within:border-fifa-green/50 focus-within:ring-2 focus-within:ring-fifa-green/10"
            onSubmit={(event) => {
              event.preventDefault();
              void submitMessage(input);
            }}
          >
            <label htmlFor="fan-message" className="sr-only">Ask the stadium assistant</label>
            <input
              id="fan-message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about a gate, section, or service…"
              maxLength={2_000}
              disabled={isBusy}
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-zinc-600 disabled:opacity-60 sm:px-3"
            />
            {isBusy ? (
              <Button type="button" variant="ghost" size="md" onClick={() => void stop()} aria-label="Stop response">
                <CircleStop className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button type="submit" size="md" disabled={!input.trim()} aria-label="Send message">
                <Send className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            )}
          </form>
          <p className="mt-2 text-center text-[11px] text-zinc-600">
            For emergencies, contact the nearest steward immediately.
          </p>
        </div>
      </div>
    </section>
  );
}
