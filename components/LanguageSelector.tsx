"use client";

import {
  LANGUAGE_OPTIONS,
  parseLanguage,
  type LanguageOverride,
} from "@/lib/languages";

export type LanguageOption = LanguageOverride;

interface LanguageSelectorProps {
  value: LanguageOption;
  onChange: (value: LanguageOption) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">
      <label
        htmlFor="language-select"
        className="whitespace-nowrap text-xs font-medium text-zinc-500"
      >
        Reply in
      </label>
      <select
        id="language-select"
        value={value}
        onChange={(event) => {
          const nextLanguage = parseLanguage(event.target.value);
          if (nextLanguage) onChange(nextLanguage);
        }}
        className="rounded-md bg-transparent px-1 py-0.5 text-sm font-medium text-zinc-200 outline-none focus-visible:ring-2 focus-visible:ring-fifa-green-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        {LANGUAGE_OPTIONS.map((language) => (
          <option key={language.value} value={language.value}>
            {language.label}
          </option>
        ))}
      </select>
    </div>
  );
}
