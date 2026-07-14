"use client";

interface SuggestionButtonsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

export function SuggestionButtons({ suggestions, onSelect, disabled }: SuggestionButtonsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-fifa-green/40 hover:bg-fifa-green/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-fifa-green/30 disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}

export const FAN_SUGGESTIONS = [
  "Nearest accessible restroom",
  "How do I get to Section 114?",
  "Where can I recycle?",
  "Shuttle to downtown",
  "Bag policy",
  "Wheelchair route to Gate C",
];
