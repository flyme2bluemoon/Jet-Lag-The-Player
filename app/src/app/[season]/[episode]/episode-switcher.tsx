"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Episode } from "@/data/season-pages";

type EpisodeSwitcherProps = {
  seasonSlug: string;
  episodes: readonly Episode[];
  currentSlug: string;
};

export function EpisodeSwitcher({ seasonSlug, episodes, currentSlug }: EpisodeSwitcherProps) {
  const router = useRouter();

  return (
    <div className="episode-switcher">
      <Select value={currentSlug} onValueChange={(slug) => router.push(`/${seasonSlug}/${slug}`)}>
        <SelectTrigger aria-label="Select episode" className="h-full w-full rounded-none border-0 bg-transparent px-4 text-sm font-bold text-[var(--paper)] shadow-none hover:bg-white/5 focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--red)] data-[state=open]:bg-white/5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" side="bottom" align="start" sideOffset={1} className="episode-select-content w-[var(--radix-select-trigger-width)] rounded-lg border-white/30 bg-[#0c2433] p-0 text-[var(--paper)] shadow-xl">
          {episodes.map((episode) => (
            <SelectItem className="rounded-none border-b border-white/10 bg-[#0c2433] px-4 py-3 font-medium last:border-b-0 focus:bg-[#18384a] focus:text-[var(--paper)] data-[state=checked]:bg-[#18384a] data-[state=checked]:text-[var(--red)]" value={episode.slug} key={episode.slug}>
              {episode.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
