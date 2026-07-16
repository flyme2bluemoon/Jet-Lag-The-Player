import { ThemeToggle } from "@/components/theme-toggle";

export function SiteFooter() {
  return (
    <footer className="max-w-page border-paper/15 px-gutter tablet:h-64 relative mx-auto flex h-48 w-full items-center justify-between gap-4 border-t py-10">
      <div className="border-paper/40 after:border-paper/25 relative z-1 hidden size-28 -rotate-6 place-content-center rounded-full border text-center after:absolute after:inset-2 after:rounded-full after:border after:border-dashed after:content-[''] sm:grid">
        <span className="font-display text-4xl leading-none font-bold">18½</span>
        <small className="font-heading text-xs leading-tight font-bold uppercase">seasons<br />one world</small>
      </div>
      <p className="text-footer-copy absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-base leading-none font-bold uppercase">Jet Lag: The Player</p>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </footer>
  );
}
