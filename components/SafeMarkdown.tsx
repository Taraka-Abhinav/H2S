import ReactMarkdown from "react-markdown";

interface SafeMarkdownProps {
  children: string;
  className?: string;
}

export function SafeMarkdown({ children, className }: SafeMarkdownProps) {
  return (
    <div dir="auto" className={className}>
      <ReactMarkdown
        skipHtml
        allowedElements={["p", "strong", "em", "ul", "ol", "li", "code"]}
        unwrapDisallowed
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

interface MessagePart {
  type: string;
  text?: string;
}

export function messageText(message: { parts: MessagePart[] } | undefined): string {
  if (!message) return "";
  return message.parts
    .filter(
      (part): part is MessagePart & { text: string } =>
        part.type === "text" && typeof part.text === "string"
    )
    .map((part) => part.text)
    .join("");
}
