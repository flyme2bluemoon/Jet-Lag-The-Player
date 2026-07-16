export type ThemePreference = "system" | "light" | "dark";

export const THEME_CHANGE_EVENT = "jet-lag-theme-change";

export function getThemePreference(): ThemePreference {
  if (typeof document === "undefined") return "system";
  const preference = document.documentElement.dataset.theme;
  return preference === "light" || preference === "dark" ? preference : "system";
}

export function getStoredThemePreference(): ThemePreference {
  try {
    const preference = localStorage.getItem("jetlag-theme");
    return preference === "light" || preference === "dark" ? preference : "system";
  } catch {
    return "system";
  }
}

export function subscribeToTheme(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, callback);
}

export function setThemePreference(preference: ThemePreference) {
  const isDark = preference === "dark" ||
    (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  try { localStorage.setItem("jetlag-theme", preference); } catch {}
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.dataset.theme = preference;
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}
