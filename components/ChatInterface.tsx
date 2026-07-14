"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  CircleStop,
  Loader2,
  Radio,
  Send,
  ShieldCheck,
  User,
} from "lucide-react";
import { LanguageSelector, type LanguageOption } from "./LanguageSelector";
import { SuggestionButtons, FAN_SUGGESTIONS } from "./SuggestionButtons";
import { Button } from "./ui/Button";

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function ChatInterface() {
  const [language, setLanguage] = useState<LanguageOption>("auto");
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { languageOverride: language },
      }),
    [language]
  );

  const { messages, sendMessage, status, error, stop } = useChat({ transport });
  const isBusy = status === "submitted" || status === "streaming";

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
              <p className="text-xs text-zinc-500">Grounded in stadium information</p>
            </div>
          </div>
          <div className="hidden items-center gap-1.5 text-xs text-zinc-500 sm:flex">
            <ShieldCheck className="h-4 w-4 text-fifa-green-light" aria-hidden="true" />
            Accessibility-first
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6" aria-live="polite">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center py-10 text-center">
              <div className="stadium-orbit mb-7 flex h-24 w-24 items-center justify-center rounded-full">
                <Bot className="h-10 w-10 text-fifa-green-light" aria-hidden="true" />
              </div>
              <p className="eyebrow mb-3">Welcome to matchday</p>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Ask in your language.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
                Get precise directions and venue guidance in English, Spanish,
                Portuguese, French, or Arabic.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((message) => {
                const text = getMessageText(message);
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
                        <div dir="auto" className="[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p+p]:mt-2 [&_strong]:font-semibold [&_strong]:text-white [&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
                          <ReactMarkdown
                            skipHtml
                            allowedElements={["p", "strong", "em", "ul", "ol", "li", "code"]}
                            unwrapDisallowed
                          >
                            {text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <span className="flex items-center gap-2 text-zinc-400">
                          <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
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
                    <Bot className="h-4 w-4 text-fifa-green-light" />
                  </div>
                  <Loader2 className="h-4 w-4 animate-spin text-fifa-green-light" />
                  Finding the best route…
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-black/15 p-4 sm:p-5">
          {error && (
            <div role="alert" className="mb-3 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
              {error.message || "The assistant could not respond. Please try again."}
            </div>
          )}

          <SuggestionButtons
            suggestions={FAN_SUGGESTIONS}
            onSelect={submitMessage}
            disabled={isBusy}
          />

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
                <CircleStop className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" size="md" disabled={!input.trim()} aria-label="Send message">
                <Send className="h-4 w-4" />
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
