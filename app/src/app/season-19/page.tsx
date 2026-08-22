import type { Metadata } from "next";
import { SeasonTrailerPage } from "@/components/season-trailer";
import { seasonNineteenTrailer } from "@/data/season-trailers";

export const metadata: Metadata = {
  title: "Season 19 Trailer | Jet Lag: The Player",
};

export default function SeasonNineteenTrailerPage() {
  return <SeasonTrailerPage trailer={seasonNineteenTrailer} />;
}
