"use client";

export type LanguageOption = "auto" | "en" | "es" | "pt" | "fr" | "ar";

const LANGUAGES: { value: LanguageOption; label: string }[] = [
  { value: "auto", label: "Auto-detect" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
  { value: "fr", label: "Français" },
  { value: "ar", label: "العربية" },
];

interface LanguageSelectorProps {
  value: LanguageOption;
  onChange: (value: LanguageOption) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">
      <label htmlFor="language-select" className="whitespace-nowrap text-xs font-medium text-zinc-500">
        Reply in
      </label>
      <select
        id="language-select"
        value={value}
        onChange={(e) => onChange(e.target.value as LanguageOption)}
        className="bg-transparent text-sm font-medium text-zinc-200 outline-none focus:text-white"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
