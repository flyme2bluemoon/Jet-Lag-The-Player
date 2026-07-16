import type { Metadata } from "next";
import { Barlow_Condensed, Geist_Mono, Rubik } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { ThemeInitializer } from "@/components/theme-initializer";
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
      <body className="bg-ink text-paper flex min-h-full flex-col">
        <ThemeInitializer />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
