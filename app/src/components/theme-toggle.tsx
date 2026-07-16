"use client";

import { useSyncExternalStore } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import {
  getThemePreference,
  setThemePreference,
  subscribeToTheme,
  type ThemePreference,
} from "@/lib/theme";

const options = [
  { value: "system", label: "System", icon: Laptop },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] satisfies { value: ThemePreference; label: string; icon: typeof Laptop }[];

export function ThemeToggle() {
  const preference = useSyncExternalStore(
    subscribeToTheme,
    getThemePreference,
    () => "system",
  );

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="border-paper/25 bg-panel relative z-10 flex rounded-lg border p-1 shadow-sm"
    >
      {options.map(({ value, label, icon: Icon }) => (
        <button
          type="button"
          role="radio"
          key={value}
          data-theme-value={value}
          aria-checked={value === preference}
          aria-label={`${label} theme`}
          onClick={() => setThemePreference(value)}
          className="text-copy-muted hover:bg-paper/8 hover:text-paper focus-visible:outline-signal aria-checked:bg-paper aria-checked:text-ink flex h-9 items-center gap-2 rounded-md px-2.5 font-heading text-sm leading-none font-bold uppercase transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 sm:px-3"
        >
          <Icon className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
