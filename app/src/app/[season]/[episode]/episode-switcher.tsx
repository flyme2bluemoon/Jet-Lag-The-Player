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
    <div className="border-paper/40 tablet:min-w-44 flex min-w-0 border-x">
      <Select value={currentSlug} onValueChange={(slug) => router.push(`/${seasonSlug}/${slug}`)}>
        <SelectTrigger aria-label="Select episode" className="text-paper focus-visible:outline-signal h-full w-full rounded-none border-0 bg-transparent px-4 text-sm font-bold shadow-none hover:bg-white/5 focus-visible:border-0 focus-visible:ring-0 focus-visible:-outline-offset-2 focus-visible:outline-2 data-[state=open]:bg-white/5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" side="bottom" align="start" sideOffset={1} className="bg-select text-paper episode-select-content w-(--radix-select-trigger-width) rounded-lg border-white/30 p-0 shadow-xl">
          {episodes.map((episode) => (
            <SelectItem className="bg-select focus:bg-select-active focus:text-paper data-[state=checked]:bg-select-active data-[state=checked]:text-signal rounded-none border-b border-white/10 px-4 py-3 font-medium last:border-b-0" value={episode.slug} key={episode.slug}>
              {episode.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
