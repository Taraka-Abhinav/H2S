"use client";

import {
  ACCESS_PREFERENCES,
  ACCESS_PREFERENCE_LABELS,
  FAN_LOCATIONS,
  FAN_LOCATION_LABELS,
  parseAccessPreference,
  parseFanLocation,
  type FanContext,
} from "@/lib/matchday";

interface FanContextControlsProps {
  value: FanContext;
  onChange: (context: FanContext) => void;
  disabled?: boolean;
}

export function FanContextControls({
  value,
  onChange,
  disabled = false,
}: FanContextControlsProps) {
  return (
    <fieldset className="grid gap-2 sm:grid-cols-2" disabled={disabled}>
      <legend className="sr-only">Route context</legend>
      <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-zinc-500">
        Starting at
        <select
          aria-label="Current location"
          value={value.currentLocation}
          onChange={(event) => {
            const currentLocation = parseFanLocation(event.target.value);
            if (currentLocation) onChange({ ...value, currentLocation });
          }}
          className="min-w-0 bg-transparent text-sm font-medium text-zinc-200 outline-none focus-visible:ring-2 focus-visible:ring-fifa-green-light"
        >
          {FAN_LOCATIONS.map((location) => (
            <option key={location} value={location}>
              {FAN_LOCATION_LABELS[location]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-zinc-500">
        Preference
        <select
          aria-label="Route preference"
          value={value.accessPreference}
          onChange={(event) => {
            const accessPreference = parseAccessPreference(event.target.value);
            if (accessPreference) onChange({ ...value, accessPreference });
          }}
          className="min-w-0 bg-transparent text-sm font-medium text-zinc-200 outline-none focus-visible:ring-2 focus-visible:ring-fifa-green-light"
        >
          {ACCESS_PREFERENCES.map((preference) => (
            <option key={preference} value={preference}>
              {ACCESS_PREFERENCE_LABELS[preference]}
            </option>
          ))}
        </select>
      </label>
    </fieldset>
  );
}
