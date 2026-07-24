"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isReleasedEpisode, type Episode } from "@/data/season-pages";

type EpisodeSwitcherProps = {
  seasonSlug: string;
  episodes: readonly Episode[];
  currentSlug: string;
};

export function EpisodeSwitcher({ seasonSlug, episodes, currentSlug }: EpisodeSwitcherProps) {
  const router = useRouter();

  return (
    <div className="border-paper/40 tablet:min-w-44 col-span-8 flex min-w-0 items-stretch border-x">
      <Select value={currentSlug} onValueChange={(slug) => router.push(`/${seasonSlug}/${slug}`)}>
        <SelectTrigger aria-label="Select episode" className="text-paper focus-visible:outline-signal hover:bg-paper/5 data-open:bg-paper/5 min-h-full w-full rounded-none border-0 px-4 py-0 font-display text-base leading-none font-bold focus-visible:border-0 focus-visible:ring-0 focus-visible:-outline-offset-2 focus-visible:outline-2">
          <SelectValue className="h-full" />
        </SelectTrigger>
        <SelectContent position="popper" side="bottom" align="start" sideOffset={1} className="bg-select text-paper w-(--radix-select-trigger-width) shadow-xl">
          {episodes.map((episode, index) => {
            const released = isReleasedEpisode(episode);

            return (
              <SelectItem className="bg-select text-paper border-paper/10 focus:bg-select-hover focus:text-paper! focus:**:text-paper! data-highlighted:bg-select-hover data-checked:bg-select-active data-checked:focus:bg-select-hover data-checked:data-highlighted:bg-select-hover [&>span:first-child]:hidden rounded-none border-b px-4 py-3 font-display text-base leading-none font-bold last:border-b-0" value={released ? episode.slug : `upcoming-${index}`} key={released ? episode.slug : `${episode.label}-${index}`} disabled={!released}>
                {episode.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
