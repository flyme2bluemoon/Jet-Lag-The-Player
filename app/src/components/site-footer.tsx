import { ThemeToggle } from "@/components/theme-toggle";

export function SiteFooter() {
  return (
    <footer className="max-w-page border-paper/15 px-gutter tablet:h-64 relative mx-auto flex h-48 w-full items-center justify-between gap-4 border-t py-10">
      <div className="border-paper/40 after:border-paper/25 relative z-1 hidden size-28 -rotate-6 place-content-center rounded-full border text-center after:absolute after:inset-2 after:rounded-full after:border after:border-dashed sm:grid">
        <span className="font-display text-4xl leading-none font-bold">18½</span>
        <small className="font-heading text-xs leading-tight font-bold uppercase">seasons<br />one world</small>
      </div>
      <div className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 whitespace-nowrap text-center">
        <p className="text-footer-copy font-display text-base leading-none font-bold uppercase">Jet Lag: The Player</p>
        <div className="text-footer-copy/70 flex items-center gap-3 font-sans text-sm">
          <a
            className="hover:text-footer-copy focus-visible:ring-ring rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            href="https://flyme2bluemoon.github.io/"
            rel="noreferrer"
            target="_blank"
          >
            Made by Matthew Shen
          </a>
          <span aria-hidden="true">·</span>
          <a
            className="hover:text-footer-copy focus-visible:ring-ring rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            href="https://github.com/flyme2bluemoon/Jet-Lag-The-Player"
            rel="noreferrer"
            target="_blank"
          >
            Source Code
          </a>
        </div>
      </div>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </footer>
  );
}
