import type { CurseRecord } from "./timeline-data";

export function CurseCard({ curse }: { curse: CurseRecord | null }) {
    if (!curse) return null;

    return (
        <section className="border-paper/25 bg-panel dark:bg-jet-lag-curse-purple/20 relative w-full overflow-hidden rounded-lg border" aria-labelledby="active-curse-title" aria-live="polite">
            <div className="bg-jet-lag-curse-purple/12 dark:bg-transparent absolute inset-0" />
            <span className="text-curse-number/15 dark:text-curse-number/35 absolute top-3 right-5 font-display text-[12rem] leading-none font-bold select-none" aria-hidden="true">
                {curse.roll}
            </span>
            <header className="relative p-6 pb-3">
                <div>
                    <p className="text-jet-lag-curse-purple dark:text-paper font-display text-sm font-bold tracking-widest uppercase">Active Curse</p>
                    <h2 id="active-curse-title" className="mt-1 font-heading text-3xl leading-none font-bold tracking-tight uppercase">
                        {curse.name}
                    </h2>
                </div>
            </header>
            <div className="relative px-6 pt-3 pb-6">
                <p className="text-card-meta max-w-[32ch] text-sm leading-relaxed">{curse.description}</p>
            </div>
        </section>
    );
}
