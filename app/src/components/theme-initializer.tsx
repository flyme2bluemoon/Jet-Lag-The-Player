const themeInitializerScript = `
(() => {
    const storageKey = "jetlag-theme";
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");

    const getStoredPreference = () => {
        try {
            const preference = localStorage.getItem(storageKey);
            return preference === "light" || preference === "dark"
                ? preference
                : "system";
        } catch {
            return "system";
        }
    };

    const applyPreference = (preference) => {
        const isDark = preference === "dark" ||
            (preference === "system" && colorScheme.matches);

        document.documentElement.classList.toggle("dark", isDark);
        document.documentElement.dataset.theme = preference;
        document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    };

    applyPreference(getStoredPreference());
    colorScheme.addEventListener("change", () => {
        const preference = getStoredPreference();
        if (preference === "system") applyPreference(preference);
    });
})();
`;

export function ThemeInitializer() {
    // This must be a parser-blocking head script so the theme is applied before
    // the browser can paint the server-rendered document.
    return <script dangerouslySetInnerHTML={{ __html: themeInitializerScript }} />;
}
