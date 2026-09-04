import type { seasonNineteen } from "@/data/season-19";
import type { EpisodeTimestamp } from "@/lib/timestamps";

type ReleasedSeasonNineteenEpisode = Extract<
  (typeof seasonNineteen.episodes)[number],
  { slug: string }
>;

export type SeasonNineteenEpisodeSlug = ReleasedSeasonNineteenEpisode["slug"];
export type SeasonNineteenTimestamp = EpisodeTimestamp<SeasonNineteenEpisodeSlug>;
export type SeasonNineteenTeamId = "sam-ben" | "adam-tom";

export type SeasonNineteenPlace = {
  id: string;
  name: string;
  prefecture: string;
};

export type SeasonNineteenPlaceId = keyof typeof seasonNineteenPlaces;

export type SeasonNineteenTeamLocationEvent = SeasonNineteenTimestamp &
  (
    | {
        kind: "stationary";
        place: SeasonNineteenPlaceId;
      }
    | {
        kind: "in-transit";
        mode: "train" | "shinkansen" | "bus" | "taxi" | "walking";
        from: SeasonNineteenPlaceId;
        to: SeasonNineteenPlaceId;
      }
  );

export type SeasonNineteenChallengeId = keyof typeof seasonNineteenChallenges;

export type SeasonNineteenChallenge = {
  id: string;
  title: string;
  description: string;
  cardPulls: number;
};

export type SeasonNineteenChallengeEvent = SeasonNineteenTimestamp &
  (
    | {
        kind: "revealed" | "removed";
        challenge: SeasonNineteenChallengeId;
      }
    | {
        kind: "attempt-started";
        attempt: string;
        team: SeasonNineteenTeamId;
        challenge: SeasonNineteenChallengeId;
      }
    | {
        kind: "attempt-ended";
        attempt: string;
        team: SeasonNineteenTeamId;
        challenge: SeasonNineteenChallengeId;
        outcome: "abandoned" | "failed" | "unavailable" | "completed";
      }
    | {
        kind: "completed";
        team: SeasonNineteenTeamId;
        challenge: SeasonNineteenChallengeId;
      }
  );

export type SeasonNineteenPrefectureUnlock = SeasonNineteenTimestamp & {
  team: SeasonNineteenTeamId;
  prefecture: string;
  challenge: SeasonNineteenChallengeId;
};

export type SeasonNineteenRewardCardId = keyof typeof seasonNineteenRewardCards;

export type SeasonNineteenRewardCard = {
  id: string;
  title: string;
  description?: string;
};

export type SeasonNineteenHandEvent = SeasonNineteenTimestamp & {
  kind: "kept" | "used";
  team: SeasonNineteenTeamId;
  card: SeasonNineteenRewardCardId;
};

const episodeOne = (at: number): SeasonNineteenTimestamp => ({
  episode: "episode-1",
  at,
});

/** Places explicitly shown or named during Episode 1. */
export const seasonNineteenPlaces = {
  "nishi-oyama-station": {
    id: "nishi-oyama-station",
    name: "Nishi-Ōyama Station",
    prefecture: "Kagoshima",
  },
  "kagoshima-chuo-station": {
    id: "kagoshima-chuo-station",
    name: "Kagoshima-Chūō Station",
    prefecture: "Kagoshima",
  },
  "sengan-en": {
    id: "sengan-en",
    name: "Sengan-en / Kagoshima Cultural Experience",
    prefecture: "Kagoshima",
  },
  "sengan-en-station": {
    id: "sengan-en-station",
    name: "Sengan-en Station",
    prefecture: "Kagoshima",
  },
  "shin-yatsushiro-station": {
    id: "shin-yatsushiro-station",
    name: "Shin-Yatsushiro Station",
    prefecture: "Kumamoto",
  },
  "kumamoto-station": {
    id: "kumamoto-station",
    name: "Kumamoto Station",
    prefecture: "Kumamoto",
  },
  "round1-stadium-kumamoto": {
    id: "round1-stadium-kumamoto",
    name: "Round1 Stadium Kumamoto",
    prefecture: "Kumamoto",
  },
  "meteo-sports-plaza": {
    id: "meteo-sports-plaza",
    name: "Meteo Sports Plaza",
    prefecture: "Kagoshima",
  },
  "taniyama-station": {
    id: "taniyama-station",
    name: "Taniyama Station",
    prefecture: "Kagoshima",
  },
  "iso-beach": {
    id: "iso-beach",
    name: "Iso Beach",
    prefecture: "Kagoshima",
  },
  "omuta-station": {
    id: "omuta-station",
    name: "Ōmuta Station",
    prefecture: "Fukuoka",
  },
  "hakata-station": {
    id: "hakata-station",
    name: "Hakata Station",
    prefecture: "Fukuoka",
  },
  "kitakyushu": {
    id: "kitakyushu",
    name: "Kitakyushu",
    prefecture: "Fukuoka",
  },
  "miyazaki-station-area": {
    id: "miyazaki-station-area",
    name: "Miyazaki Station area",
    prefecture: "Miyazaki",
  },
  "miyazaki-shrine": {
    id: "miyazaki-shrine",
    name: "Miyazaki Shrine",
    prefecture: "Miyazaki",
  },
} as const satisfies Record<string, SeasonNineteenPlace>;

/**
 * Team location state changes at the first frame where the new state is clear.
 * Transit destinations follow the route stated in the episode; short transfers
 * hidden by the edit are represented by the named interchange that is shown.
 */
export const seasonNineteenTeamLocations = {
  "sam-ben": [
    { ...episodeOne(0), kind: "stationary", place: "nishi-oyama-station" },
    {
      ...episodeOne(170),
      kind: "in-transit",
      mode: "train",
      from: "nishi-oyama-station",
      to: "kagoshima-chuo-station",
    },
    { ...episodeOne(463), kind: "stationary", place: "kagoshima-chuo-station" },
    {
      ...episodeOne(589),
      kind: "in-transit",
      mode: "taxi",
      from: "kagoshima-chuo-station",
      to: "sengan-en",
    },
    { ...episodeOne(910), kind: "stationary", place: "sengan-en" },
    {
      ...episodeOne(1426),
      kind: "in-transit",
      mode: "walking",
      from: "sengan-en",
      to: "sengan-en-station",
    },
    { ...episodeOne(1489), kind: "stationary", place: "sengan-en-station" },
    {
      ...episodeOne(1495),
      kind: "in-transit",
      mode: "train",
      from: "sengan-en-station",
      to: "kagoshima-chuo-station",
    },
    { ...episodeOne(1578), kind: "stationary", place: "kagoshima-chuo-station" },
    {
      ...episodeOne(1697),
      kind: "in-transit",
      mode: "shinkansen",
      from: "kagoshima-chuo-station",
      to: "shin-yatsushiro-station",
    },
    { ...episodeOne(2223), kind: "stationary", place: "shin-yatsushiro-station" },
    {
      ...episodeOne(2291),
      kind: "in-transit",
      mode: "train",
      from: "shin-yatsushiro-station",
      to: "kumamoto-station",
    },
    { ...episodeOne(2378), kind: "stationary", place: "kumamoto-station" },
    {
      ...episodeOne(2571),
      kind: "in-transit",
      mode: "bus",
      from: "kumamoto-station",
      to: "round1-stadium-kumamoto",
    },
    { ...episodeOne(2736), kind: "stationary", place: "round1-stadium-kumamoto" },
    {
      ...episodeOne(3411),
      kind: "in-transit",
      mode: "walking",
      from: "round1-stadium-kumamoto",
      to: "kumamoto-station",
    },
    { ...episodeOne(3464), kind: "stationary", place: "kumamoto-station" },
    {
      ...episodeOne(3491),
      kind: "in-transit",
      mode: "train",
      from: "kumamoto-station",
      to: "omuta-station",
    },
    { ...episodeOne(3828), kind: "stationary", place: "omuta-station" },
    {
      ...episodeOne(3846),
      kind: "in-transit",
      mode: "train",
      from: "omuta-station",
      to: "hakata-station",
    },
    { ...episodeOne(4044), kind: "stationary", place: "hakata-station" },
    {
      ...episodeOne(4050),
      kind: "in-transit",
      mode: "train",
      from: "hakata-station",
      to: "kitakyushu",
    },
    { ...episodeOne(4314), kind: "stationary", place: "kitakyushu" },
  ],
  "adam-tom": [
    { ...episodeOne(0), kind: "stationary", place: "nishi-oyama-station" },
    {
      ...episodeOne(170),
      kind: "in-transit",
      mode: "train",
      from: "nishi-oyama-station",
      to: "kagoshima-chuo-station",
    },
    { ...episodeOne(458), kind: "stationary", place: "kagoshima-chuo-station" },
    {
      ...episodeOne(1663),
      kind: "in-transit",
      mode: "taxi",
      from: "kagoshima-chuo-station",
      to: "meteo-sports-plaza",
    },
    { ...episodeOne(1756), kind: "stationary", place: "meteo-sports-plaza" },
    {
      ...episodeOne(1806),
      kind: "in-transit",
      mode: "walking",
      from: "meteo-sports-plaza",
      to: "taniyama-station",
    },
    { ...episodeOne(1864), kind: "stationary", place: "taniyama-station" },
    {
      ...episodeOne(1875),
      kind: "in-transit",
      mode: "train",
      from: "taniyama-station",
      to: "kagoshima-chuo-station",
    },
    { ...episodeOne(2149), kind: "stationary", place: "kagoshima-chuo-station" },
    {
      ...episodeOne(2703),
      kind: "in-transit",
      mode: "train",
      from: "kagoshima-chuo-station",
      to: "sengan-en-station",
    },
    { ...episodeOne(2866), kind: "stationary", place: "sengan-en-station" },
    {
      ...episodeOne(2867),
      kind: "in-transit",
      mode: "walking",
      from: "sengan-en-station",
      to: "iso-beach",
    },
    { ...episodeOne(2950), kind: "stationary", place: "iso-beach" },
    {
      ...episodeOne(3408),
      kind: "in-transit",
      mode: "walking",
      from: "iso-beach",
      to: "sengan-en-station",
    },
    { ...episodeOne(3523), kind: "stationary", place: "sengan-en-station" },
    {
      ...episodeOne(3601),
      kind: "in-transit",
      mode: "train",
      from: "sengan-en-station",
      to: "miyazaki-station-area",
    },
    { ...episodeOne(3953), kind: "stationary", place: "miyazaki-station-area" },
    {
      ...episodeOne(4678),
      kind: "in-transit",
      mode: "taxi",
      from: "miyazaki-station-area",
      to: "miyazaki-shrine",
    },
    { ...episodeOne(4763), kind: "stationary", place: "miyazaki-shrine" },
  ],
} as const satisfies Record<
  SeasonNineteenTeamId,
  readonly SeasonNineteenTeamLocationEvent[]
>;

export const seasonNineteenChallenges = {
  "catch-a-fish": {
    id: "catch-a-fish",
    title: "Catch a Fish",
    description:
      "Pull any live, wild fish out of the water for at least one second. This must be done in saltwater to ensure you do not violate local fishing permissions.",
    cardPulls: 5,
  },
  "leave-prefecture-by-boat": {
    id: "leave-prefecture-by-boat",
    title: "Leave Your Prefecture by Boat",
    description:
      "The boat ride must take at least one hour. This must be an actual captained boat; you cannot, for example, hop in a canoe and cross a river.",
    cardPulls: 3,
  },
  "shoot-a-bullseye": {
    id: "shoot-a-bullseye",
    title: "Shoot a Bullseye with a Bow and Arrow",
    description:
      "From a distance of at least 20 feet, shoot an arrow into any point within the three innermost rings of a target. You may not buy or create a bow, arrow, or target to complete this challenge.",
    cardPulls: 2,
  },
  "survive-the-batting-cage": {
    id: "survive-the-batting-cage",
    title: "Survive the Batting Cage",
    description:
      "Visit a batting cage and hit at least three out of five pitches. If you fail, you must wait 10 minutes before trying again. You may not practice.",
    cardPulls: 2,
  },
  "japan-scavenger-hunt": {
    id: "japan-scavenger-hunt",
    title: "Complete the Japan Scavenger Hunt",
    description:
      "After disembarking at any station, and without using your phone, find eight of the following: a convenience store, a torii gate, any depiction of Totoro, plastic food, a photo booth, anything high-vis, a koi fish, a boat, a manhole cover, and bamboo. You have one hour. If you fail, you may retry at a new station.",
    cardPulls: 2,
  },
  "play-suikawari": {
    id: "play-suikawari",
    title: "Play Suikawari at the Beach",
    description:
      "Go to any beach. Starting 30 feet away from your watermelon, your partner must spin of their own accord, stopping after 20 seconds. They then must hit the watermelon within 40 seconds of ceasing spinning. Your partner may say three words, but may not move or touch you. If you fail, you must wait 10 minutes before trying again.",
    cardPulls: 2,
  },
  "show-one-monkey": {
    id: "show-one-monkey",
    title: "Show the Audience One Monkey",
    description:
      "The Japanese macaque, or snow monkey, can be found across most parts of Japan. Find and photograph any monkey not in captivity.",
    cardPulls: 3,
  },
  "find-prefectural-bird": {
    id: "find-prefectural-bird",
    title: "Find Your Prefectural Bird",
    description:
      "Each prefecture of Japan has an official prefectural bird. Find and photograph your prefecture's bird, and verify its identity with a birdwatching app.",
    cardPulls: 2,
  },
  "flip-remarkable-water": {
    id: "flip-remarkable-water",
    title: "Flip One of Japan's 100 Remarkable Waters",
    description:
      "Visit any of the 100 Remarkable Waters of Japan with a water bottle. Fill the bottle with any amount of the remarkable water, then flip the bottle and have it land upright. If you fail, you must wait five minutes before trying again.",
    cardPulls: 2,
  },
  "answer-riddle-under-bridge": {
    id: "answer-riddle-under-bridge",
    title: "Answer a Riddle Under a Big Bridge",
    description:
      "Correctly answer Tristan's riddle while standing under a bridge longer than 400 meters. If you fail, this challenge cannot be reattempted by your team.",
    cardPulls: 2,
  },
} as const satisfies Record<string, SeasonNineteenChallenge>;

/** Challenge-board changes and attempt lifecycles in editorial order. */
export const seasonNineteenChallengeEvents = [
  { ...episodeOne(205), kind: "revealed", challenge: "catch-a-fish" },
  { ...episodeOne(211), kind: "revealed", challenge: "leave-prefecture-by-boat" },
  { ...episodeOne(218), kind: "revealed", challenge: "shoot-a-bullseye" },
  { ...episodeOne(227), kind: "revealed", challenge: "survive-the-batting-cage" },
  { ...episodeOne(232), kind: "revealed", challenge: "japan-scavenger-hunt" },
  {
    ...episodeOne(458),
    kind: "attempt-started",
    attempt: "adam-tom-scavenger-1",
    team: "adam-tom",
    challenge: "japan-scavenger-hunt",
  },
  {
    ...episodeOne(464),
    kind: "attempt-started",
    attempt: "sam-ben-scavenger-1",
    team: "sam-ben",
    challenge: "japan-scavenger-hunt",
  },
  {
    ...episodeOne(584),
    kind: "attempt-ended",
    attempt: "sam-ben-scavenger-1",
    team: "sam-ben",
    challenge: "japan-scavenger-hunt",
    outcome: "abandoned",
  },
  {
    ...episodeOne(589),
    kind: "attempt-started",
    attempt: "sam-ben-bullseye-1",
    team: "sam-ben",
    challenge: "shoot-a-bullseye",
  },
  {
    ...episodeOne(1284),
    kind: "attempt-ended",
    attempt: "sam-ben-bullseye-1",
    team: "sam-ben",
    challenge: "shoot-a-bullseye",
    outcome: "completed",
  },
  {
    ...episodeOne(1291),
    kind: "completed",
    team: "sam-ben",
    challenge: "shoot-a-bullseye",
  },
  { ...episodeOne(1379), kind: "revealed", challenge: "play-suikawari" },
  {
    ...episodeOne(1538),
    kind: "attempt-ended",
    attempt: "adam-tom-scavenger-1",
    team: "adam-tom",
    challenge: "japan-scavenger-hunt",
    outcome: "failed",
  },
  {
    ...episodeOne(1654),
    kind: "attempt-started",
    attempt: "adam-tom-batting-1",
    team: "adam-tom",
    challenge: "survive-the-batting-cage",
  },
  {
    ...episodeOne(1787),
    kind: "attempt-ended",
    attempt: "adam-tom-batting-1",
    team: "adam-tom",
    challenge: "survive-the-batting-cage",
    outcome: "unavailable",
  },
  {
    ...episodeOne(2149),
    kind: "attempt-started",
    attempt: "adam-tom-scavenger-2",
    team: "adam-tom",
    challenge: "japan-scavenger-hunt",
  },
  {
    ...episodeOne(2527),
    kind: "attempt-ended",
    attempt: "adam-tom-scavenger-2",
    team: "adam-tom",
    challenge: "japan-scavenger-hunt",
    outcome: "abandoned",
  },
  {
    ...episodeOne(2528),
    kind: "attempt-started",
    attempt: "adam-tom-suikawari-1",
    team: "adam-tom",
    challenge: "play-suikawari",
  },
  {
    ...episodeOne(2561),
    kind: "attempt-started",
    attempt: "sam-ben-batting-1",
    team: "sam-ben",
    challenge: "survive-the-batting-cage",
  },
  {
    ...episodeOne(3127),
    kind: "attempt-ended",
    attempt: "sam-ben-batting-1",
    team: "sam-ben",
    challenge: "survive-the-batting-cage",
    outcome: "completed",
  },
  {
    ...episodeOne(3130),
    kind: "completed",
    team: "sam-ben",
    challenge: "survive-the-batting-cage",
  },
  { ...episodeOne(3284), kind: "revealed", challenge: "show-one-monkey" },
  {
    ...episodeOne(3379),
    kind: "attempt-ended",
    attempt: "adam-tom-suikawari-1",
    team: "adam-tom",
    challenge: "play-suikawari",
    outcome: "completed",
  },
  {
    ...episodeOne(3386),
    kind: "completed",
    team: "adam-tom",
    challenge: "play-suikawari",
  },
  { ...episodeOne(3613), kind: "revealed", challenge: "find-prefectural-bird" },
  {
    ...episodeOne(3958),
    kind: "attempt-started",
    attempt: "adam-tom-scavenger-3",
    team: "adam-tom",
    challenge: "japan-scavenger-hunt",
  },
  { ...episodeOne(4416), kind: "removed", challenge: "show-one-monkey" },
  { ...episodeOne(4416), kind: "removed", challenge: "find-prefectural-bird" },
  { ...episodeOne(4496), kind: "revealed", challenge: "flip-remarkable-water" },
  {
    ...episodeOne(4529),
    kind: "revealed",
    challenge: "answer-riddle-under-bridge",
  },
  {
    ...episodeOne(4561),
    kind: "attempt-started",
    attempt: "sam-ben-riddle-1",
    team: "sam-ben",
    challenge: "answer-riddle-under-bridge",
  },
] as const satisfies readonly SeasonNineteenChallengeEvent[];

/** Unlocks use the first frame of each full-screen Challenge Completed graphic. */
export const seasonNineteenPrefectureUnlocks = [
  {
    ...episodeOne(1291),
    team: "sam-ben",
    prefecture: "Kagoshima",
    challenge: "shoot-a-bullseye",
  },
  {
    ...episodeOne(3130),
    team: "sam-ben",
    prefecture: "Kumamoto",
    challenge: "survive-the-batting-cage",
  },
  {
    ...episodeOne(3386),
    team: "adam-tom",
    prefecture: "Kagoshima",
    challenge: "play-suikawari",
  },
] as const satisfies readonly SeasonNineteenPrefectureUnlock[];

/** Every reward card whose face is shown in Episode 1. */
export const seasonNineteenRewardCards = {
  "unlock-opponent-prefecture": {
    id: "unlock-opponent-prefecture",
    title: "Unlock a Prefecture That Your Opponents Unlocked",
  },
  "shinkansen-45-minutes": {
    id: "shinkansen-45-minutes",
    title: "Shinkansen — 45 Minutes",
  },
  "curse-golden-carriage": {
    id: "curse-golden-carriage",
    title: "Curse of the Golden Carriage",
    description:
      "Choose any train scheduled to depart from the train station you are currently in. You must remain at the station until that train leaves. The other team cannot board that train or play any curse that affects it.",
  },
  "curse-divine-quest": {
    id: "curse-divine-quest",
    title: "Curse of the Divine Quest",
    description:
      "Play this curse in response to a new challenge entering the board. You may look at the next five challenges and choose a different one to replace it.",
  },
  "triple-reward-prefecture-ending-e": {
    id: "triple-reward-prefecture-ending-e",
    title: '3× Reward in a Prefecture That Ends in "E"',
  },
} as const satisfies Record<string, SeasonNineteenRewardCard>;

/** Only cards actually selected for a hand are kept; rejected pulls are omitted. */
export const seasonNineteenHandEvents = [
  {
    ...episodeOne(1366),
    kind: "kept",
    team: "sam-ben",
    card: "shinkansen-45-minutes",
  },
  {
    ...episodeOne(1701),
    kind: "used",
    team: "sam-ben",
    card: "shinkansen-45-minutes",
  },
  {
    ...episodeOne(3278),
    kind: "kept",
    team: "sam-ben",
    card: "curse-golden-carriage",
  },
  {
    ...episodeOne(3575),
    kind: "kept",
    team: "adam-tom",
    card: "triple-reward-prefecture-ending-e",
  },
] as const satisfies readonly SeasonNineteenHandEvent[];

/** Independent boundary sets for the dashboard's future timestamp projections. */
export const seasonNineteenTimelineBoundaries = {
  teamLocations: Object.values(seasonNineteenTeamLocations).flatMap((events) =>
    events.map(({ episode, at }) => ({ episode, at })),
  ),
  challengeBoard: seasonNineteenChallengeEvents.map(({ episode, at }) => ({
    episode,
    at,
  })),
  prefectureUnlocks: seasonNineteenPrefectureUnlocks.map(({ episode, at }) => ({
    episode,
    at,
  })),
  teamHands: seasonNineteenHandEvents.map(({ episode, at }) => ({ episode, at })),
} as const;
