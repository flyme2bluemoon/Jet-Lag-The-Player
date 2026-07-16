import type { Metadata } from "next";
import { Barlow_Condensed, Geist_Mono, Rubik } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Jet Lag: The Player",
  description: "Choose a season and play Jet Lag: The Game.",
};

const themeScript = `
  (() => {
    const getPreference = () => {
      try {
        const stored = localStorage.getItem("jetlag-theme");
        return stored === "light" || stored === "dark" ? stored : "system";
      } catch (_) {
        return "system";
      }
    };
    const applyTheme = (preference) => {
      const isDark = preference === "dark" ||
        (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.dataset.theme = preference;
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    };

    applyTheme(getPreference());
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (getPreference() === "system") applyTheme("system");
    });
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${barlowCondensed.variable} ${rubik.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="bg-ink text-paper flex min-h-full flex-col">
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
