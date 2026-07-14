import type { Metadata } from "next";
import { ChatInterface } from "@/components/ChatInterface";

export const metadata: Metadata = {
  title: "Fan assistant",
  description:
    "Context-aware multilingual stadium navigation, accessibility, transport, and venue guidance.",
};

export default function FanPage() {
  return (
    <div className="container flex min-h-[calc(100svh-72px)] max-w-5xl flex-col py-6 sm:py-8">
      <ChatInterface />
    </div>
  );
}
