"use client";

import { useLayoutEffect } from "react";
import { getStoredThemePreference, setThemePreference } from "@/lib/theme";

export function ThemeInitializer() {
  useLayoutEffect(() => {
    setThemePreference(getStoredThemePreference());

    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const handleColorSchemeChange = () => {
      if (getStoredThemePreference() === "system") setThemePreference("system");
    };

    colorScheme.addEventListener("change", handleColorSchemeChange);
    return () => colorScheme.removeEventListener("change", handleColorSchemeChange);
  }, []);

  return null;
}
