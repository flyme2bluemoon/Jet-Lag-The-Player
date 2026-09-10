import type { seasonNineteen } from "@/data/season-19";
import type { EpisodeTimestamp } from "@/lib/timestamps";

type ReleasedSeasonNineteenEpisode = Extract<
  (typeof seasonNineteen.episodes)[number],
  { slug: string }
>;

export type SeasonNineteenEpisodeSlug = ReleasedSeasonNineteenEpisode["slug"];
export type SeasonNineteenTimestamp = EpisodeTimestamp<SeasonNineteenEpisodeSlug>;
export type SeasonNineteenTeamId = "sam-ben" | "adam-tom";

export type SeasonNineteenCoordinate = readonly [longitude: number, latitude: number];

export type SeasonNineteenPlace = {
  id: string;
  name: string;
  /** Compact map label; defaults to `name` when omitted. */
  label?: string;
  prefecture: string;
  /** MapLibre `[longitude, latitude]` used by the Game Board tracker. */
  coordinate: SeasonNineteenCoordinate;
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
        mode: "train" | "shinkansen" | "bus" | "taxi" | "walking" | "ferry";
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
} & (
  | { challenge: SeasonNineteenChallengeId; card?: "curse-magic-mirror" }
  | { card: "unlock-any-prefecture"; challenge?: never }
);

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

const episodeTwo = (at: number): SeasonNineteenTimestamp => ({
  episode: "episode-2",
  at,
});

const episodeThree = (at: number): SeasonNineteenTimestamp => ({
  episode: "episode-3",
  at,
});

/** Places explicitly shown or named in the extracted episodes. */
export const seasonNineteenPlaces = {
  "nishi-oyama-station": {
    id: "nishi-oyama-station",
    name: "Nishi-Ōyama Station",
    label: "Nishi-Ōyama",
    prefecture: "Kagoshima",
    coordinate: [130.57646, 31.1903],
  },
  "kagoshima-chuo-station": {
    id: "kagoshima-chuo-station",
    name: "Kagoshima-Chūō Station",
    label: "Kagoshima-Chūō",
    prefecture: "Kagoshima",
    coordinate: [130.5435, 31.58466],
  },
  "sengan-en": {
    id: "sengan-en",
    name: "Sengan-en / Kagoshima Cultural Experience",
    label: "Sengan-en",
    prefecture: "Kagoshima",
    coordinate: [130.57663, 31.61662],
  },
  "sengan-en-station": {
    id: "sengan-en-station",
    name: "Sengan-en Station",
    label: "Sengan-en Sta.",
    prefecture: "Kagoshima",
    // Transit point beside Sengan-en / Iso Beach used between walking and train legs.
    coordinate: [130.5755, 31.6145],
  },
  "shin-yatsushiro-station": {
    id: "shin-yatsushiro-station",
    name: "Shin-Yatsushiro Station",
    label: "Shin-Yatsushiro",
    prefecture: "Kumamoto",
    coordinate: [130.63484, 32.51804],
  },
  "kumamoto-station": {
    id: "kumamoto-station",
    name: "Kumamoto Station",
    label: "Kumamoto Sta.",
    prefecture: "Kumamoto",
    coordinate: [130.6897, 32.78968],
  },
  "round1-stadium-kumamoto": {
    id: "round1-stadium-kumamoto",
    name: "Round1 Stadium Kumamoto",
    label: "Round1 Kumamoto",
    prefecture: "Kumamoto",
    coordinate: [130.67753, 32.78505],
  },
  "meteo-sports-plaza": {
    id: "meteo-sports-plaza",
    name: "Meteo Sports Plaza",
    label: "Meteo Sports Plaza",
    prefecture: "Kagoshima",
    coordinate: [130.52805, 31.51681],
  },
  "taniyama-station": {
    id: "taniyama-station",
    name: "Taniyama Station",
    label: "Taniyama Sta.",
    prefecture: "Kagoshima",
    coordinate: [130.51908, 31.52673],
  },
  "iso-beach": {
    id: "iso-beach",
    name: "Iso Beach",
    prefecture: "Kagoshima",
    coordinate: [130.57532, 31.6141],
  },
  "omuta-station": {
    id: "omuta-station",
    name: "Ōmuta Station",
    label: "Ōmuta Sta.",
    prefecture: "Fukuoka",
    coordinate: [130.4451, 33.02939],
  },
  "hakata-station": {
    id: "hakata-station",
    name: "Hakata Station",
    label: "Hakata Sta.",
    prefecture: "Fukuoka",
    coordinate: [130.4199, 33.59004],
  },
  kitakyushu: {
    id: "kitakyushu",
    name: "Kitakyushu",
    prefecture: "Fukuoka",
    coordinate: [130.88218, 33.88676],
  },
  "miyazaki-station-area": {
    id: "miyazaki-station-area",
    name: "Miyazaki Station area",
    label: "Miyazaki Sta.",
    prefecture: "Miyazaki",
    coordinate: [131.43195, 31.91575],
  },
  "miyazaki-shrine": {
    id: "miyazaki-shrine",
    name: "Miyazaki Shrine",
    prefecture: "Miyazaki",
    coordinate: [131.43049, 31.93844],
  },
  "mojiko-station": {
    id: "mojiko-station",
    name: "Mojikō Station",
    prefecture: "Fukuoka",
    coordinate: [130.9614754, 33.9451155],
  },
  "kanmon-bridge": {
    id: "kanmon-bridge",
    name: "Kanmon Bridge (Moji side)",
    prefecture: "Fukuoka",
    coordinate: [130.9622895, 33.9606598],
  },
  "kanmon-tunnel-shimonoseki-exit": {
    id: "kanmon-tunnel-shimonoseki-exit",
    name: "Kanmon Tunnel / Shimonoseki-side bus stop",
    prefecture: "Yamaguchi",
    coordinate: [130.956144, 33.9655078],
  },
  "shimonoseki-station": {
    id: "shimonoseki-station",
    name: "Shimonoseki Station",
    prefecture: "Yamaguchi",
    coordinate: [130.9217895, 33.9493851],
  },
  "usuki-station": {
    id: "usuki-station",
    name: "Usuki Station",
    prefecture: "Oita",
    coordinate: [131.807899, 33.1186021],
  },
  "usuki-port": {
    id: "usuki-port",
    name: "Usuki Port",
    prefecture: "Oita",
    coordinate: [131.8105296, 33.1264865],
  },
  "yawatahama-port": {
    id: "yawatahama-port",
    name: "Yawatahama Port",
    prefecture: "Ehime",
    coordinate: [132.4163796, 33.4589111],
  },
  "yawatahama-station": {
    id: "yawatahama-station",
    name: "Yawatahama Station",
    prefecture: "Ehime",
    coordinate: [132.4359747, 33.4581242],
  },
  "tsuzu-station": {
    id: "tsuzu-station",
    name: "Tsuzu Station",
    prefecture: "Yamaguchi",
    coordinate: [132.2049813, 34.0681847],
  },
  "tsuzu-fishing-supply-store": {
    id: "tsuzu-fishing-supply-store",
    name: "Kameya fishing-supply store in Tsuzu",
    prefecture: "Yamaguchi",
    coordinate: [132.2084845, 34.072119],
  },
  "tsuzu-beach": {
    id: "tsuzu-beach",
    name: "Tsuzu beach / river mouth",
    prefecture: "Yamaguchi",
    coordinate: [132.2087698, 34.076732],
  },
  "sakura-ido": {
    id: "sakura-ido",
    name: "Sakura Ido",
    prefecture: "Yamaguchi",
    coordinate: [132.2040392, 34.0729586],
  },
  "hiroshima-station": {
    id: "hiroshima-station",
    name: "Hiroshima Station",
    prefecture: "Hiroshima",
    coordinate: [132.4755766, 34.3978256],
  },
  "hiroshima-cat-cafe": {
    id: "hiroshima-cat-cafe",
    name: "Cat café near Hiroshima Station",
    prefecture: "Hiroshima",
    coordinate: [132.4748826, 34.3973182],
  },
  "matsuyama-station": {
    id: "matsuyama-station",
    name: "Matsuyama Station",
    prefecture: "Ehime",
    coordinate: [132.750762, 33.8397822],
  },
  "matsuyama-fishing-harbor": {
    id: "matsuyama-fishing-harbor",
    name: "Matsuyama fishing harbor",
    prefecture: "Ehime",
    coordinate: [132.70459, 33.837799],
  },
  "matsuyama-fishing-supply-store": {
    id: "matsuyama-fishing-supply-store",
    name: "Matsuyama fishing-supply store",
    prefecture: "Ehime",
    coordinate: [132.7424156, 33.815009],
  },
  "matsuyama-fishing-shore": {
    id: "matsuyama-fishing-shore",
    name: "Matsuyama fishing waterfront",
    prefecture: "Ehime",
    coordinate: [132.6965449, 33.850839],
  },
  "saijo-station": {
    id: "saijo-station",
    name: "Saijō Station",
    prefecture: "Hiroshima",
    coordinate: [132.7436714, 34.4313263],
  },
  "matsuyama-city-station-area": {
    id: "matsuyama-city-station-area",
    name: "Matsuyama City Station area",
    prefecture: "Ehime",
    coordinate: [132.7636738, 33.8362664],
  },
  "kasaoka-station": {
    id: "kasaoka-station",
    name: "Kasaoka Station",
    prefecture: "Okayama",
    coordinate: [133.5047114, 34.5047232],
  },
  "kasaoka-dinosaur-park-coast": {
    id: "kasaoka-dinosaur-park-coast",
    name: "Kasaoka Dinosaur Park / Horseshoe Crab Museum coastline",
    prefecture: "Okayama",
    coordinate: [133.5213699, 34.4774642],
  },
  "fukuyama-station": {
    id: "fukuyama-station",
    name: "Fukuyama Station",
    prefecture: "Hiroshima",
    coordinate: [133.3618898, 34.4892799],
  },
  "okayama-station": {
    id: "okayama-station",
    name: "Okayama Station",
    prefecture: "Okayama",
    coordinate: [133.917825, 34.6654089],
  },
  "koraku-en": {
    id: "koraku-en",
    name: "Kōraku-en",
    prefecture: "Okayama",
    coordinate: [133.9373948, 34.66633],
  },
  "koraku-en-bus-stop": {
    id: "koraku-en-bus-stop",
    name: "Kōraku-en bus stop",
    prefecture: "Okayama",
    coordinate: [133.93382, 34.66984],
  },
  "shin-kobe-station": {
    id: "shin-kobe-station",
    name: "Shin-Kōbe Station",
    prefecture: "Hyogo",
    coordinate: [135.1958713, 34.7061386],
  },
  "kobe-nunobiki-ropeway": {
    id: "kobe-nunobiki-ropeway",
    name: "Kōbe Nunobiki Herb Gardens & Ropeway",
    prefecture: "Hyogo",
    coordinate: [135.1948851, 34.7038416],
  },
  "sannomiya-station": {
    id: "sannomiya-station",
    name: "Sannomiya Station",
    prefecture: "Hyogo",
    coordinate: [135.1954173, 34.6933747],
  },
  "shin-osaka-station": {
    id: "shin-osaka-station",
    name: "Shin-Ōsaka Station",
    prefecture: "Osaka",
    coordinate: [135.5018726, 34.7340782],
  },
  "japanese-farmhouses-museum-parking": {
    id: "japanese-farmhouses-museum-parking",
    name: "Open Air Museum of Old Japanese Farm Houses / parking area",
    prefecture: "Osaka",
    coordinate: [135.4878429, 34.7803793],
  },
  "japanese-farmhouses-museum-house": {
    id: "japanese-farmhouses-museum-house",
    name: "Gassho-zukuri house at the Open Air Museum of Old Japanese Farm Houses",
    prefecture: "Osaka",
    coordinate: [135.4885791, 34.7787771],
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
    {
      ...episodeTwo(108),
      kind: "in-transit",
      mode: "train",
      from: "kitakyushu",
      to: "mojiko-station",
    },
    {
      ...episodeTwo(287),
      kind: "stationary",
      place: "mojiko-station",
    },
    {
      ...episodeTwo(320),
      kind: "in-transit",
      mode: "walking",
      from: "mojiko-station",
      to: "kanmon-bridge",
    },
    {
      ...episodeTwo(438),
      kind: "stationary",
      place: "kanmon-bridge",
    },
    {
      ...episodeTwo(685),
      kind: "in-transit",
      mode: "walking",
      from: "kanmon-bridge",
      to: "kanmon-tunnel-shimonoseki-exit",
    },
    {
      ...episodeTwo(807),
      kind: "stationary",
      place: "kanmon-tunnel-shimonoseki-exit",
    },
    {
      ...episodeTwo(810),
      kind: "in-transit",
      mode: "bus",
      from: "kanmon-tunnel-shimonoseki-exit",
      to: "shimonoseki-station",
    },
    {
      ...episodeTwo(815),
      kind: "stationary",
      place: "shimonoseki-station",
    },
    {
      ...episodeTwo(822),
      kind: "in-transit",
      mode: "train",
      from: "shimonoseki-station",
      to: "tsuzu-station",
    },
    {
      ...episodeTwo(1541),
      kind: "stationary",
      place: "tsuzu-station",
    },
    {
      ...episodeTwo(1543),
      kind: "in-transit",
      mode: "walking",
      from: "tsuzu-station",
      to: "tsuzu-fishing-supply-store",
    },
    {
      ...episodeTwo(1561),
      kind: "stationary",
      place: "tsuzu-fishing-supply-store",
    },
    {
      ...episodeTwo(1594),
      kind: "in-transit",
      mode: "walking",
      from: "tsuzu-fishing-supply-store",
      to: "tsuzu-beach",
    },
    {
      ...episodeTwo(1680),
      kind: "stationary",
      place: "tsuzu-beach",
    },
    {
      ...episodeTwo(2128),
      kind: "in-transit",
      mode: "walking",
      from: "tsuzu-beach",
      to: "sakura-ido",
    },
    {
      ...episodeTwo(2199),
      kind: "stationary",
      place: "sakura-ido",
    },
    {
      ...episodeTwo(2478),
      kind: "in-transit",
      mode: "walking",
      from: "sakura-ido",
      to: "tsuzu-station",
    },
    {
      ...episodeTwo(2729),
      kind: "stationary",
      place: "tsuzu-station",
    },
    {
      ...episodeTwo(2734),
      kind: "in-transit",
      mode: "train",
      from: "tsuzu-station",
      to: "hiroshima-station",
    },
    {
      ...episodeTwo(2939),
      kind: "stationary",
      place: "hiroshima-station",
    },
    {
      ...episodeTwo(2945),
      kind: "in-transit",
      mode: "walking",
      from: "hiroshima-station",
      to: "hiroshima-cat-cafe",
    },
    {
      ...episodeTwo(2990),
      kind: "stationary",
      place: "hiroshima-cat-cafe",
    },
    {
      ...episodeTwo(3313),
      kind: "in-transit",
      mode: "walking",
      from: "hiroshima-cat-cafe",
      to: "hiroshima-station",
    },
    {
      ...episodeTwo(3330),
      kind: "stationary",
      place: "hiroshima-station",
    },
    {
      ...episodeTwo(3420),
      kind: "in-transit",
      mode: "train",
      from: "hiroshima-station",
      to: "saijo-station",
    },
    {
      ...episodeTwo(3729),
      kind: "stationary",
      place: "saijo-station",
    },
    {
      ...episodeThree(128),
      kind: "in-transit",
      mode: "train",
      from: "saijo-station",
      to: "kasaoka-station"
    },
    {
      ...episodeThree(489),
      kind: "stationary",
      place: "kasaoka-station"
    },
    {
      ...episodeThree(497),
      kind: "in-transit",
      mode: "taxi",
      from: "kasaoka-station",
      to: "kasaoka-dinosaur-park-coast"
    },
    {
      ...episodeThree(527),
      kind: "stationary",
      place: "kasaoka-dinosaur-park-coast"
    },
    {
      ...episodeThree(1044),
      kind: "in-transit",
      mode: "walking",
      from: "kasaoka-dinosaur-park-coast",
      to: "kasaoka-station"
    },
    {
      ...episodeThree(1419),
      kind: "stationary",
      place: "kasaoka-station"
    },
    {
      ...episodeThree(1435),
      kind: "in-transit",
      mode: "train",
      from: "kasaoka-station",
      to: "fukuyama-station"
    },
    {
      ...episodeThree(1474),
      kind: "stationary",
      place: "fukuyama-station"
    },
    {
      ...episodeThree(1511),
      kind: "in-transit",
      mode: "shinkansen",
      from: "fukuyama-station",
      to: "shin-kobe-station"
    },
    {
      ...episodeThree(2042),
      kind: "stationary",
      place: "shin-kobe-station"
    },
    {
      ...episodeThree(2060),
      kind: "in-transit",
      mode: "walking",
      from: "shin-kobe-station",
      to: "kobe-nunobiki-ropeway"
    },
    {
      ...episodeThree(2181),
      kind: "stationary",
      place: "kobe-nunobiki-ropeway"
    },
    {
      ...episodeThree(2722),
      kind: "in-transit",
      mode: "walking",
      from: "kobe-nunobiki-ropeway",
      to: "shin-kobe-station"
    },
    {
      ...episodeThree(2728),
      kind: "stationary",
      place: "shin-kobe-station"
    },
    {
      ...episodeThree(2913),
      kind: "in-transit",
      mode: "walking",
      from: "shin-kobe-station",
      to: "sannomiya-station"
    },
    {
      ...episodeThree(2976),
      kind: "stationary",
      place: "sannomiya-station"
    },
    {
      ...episodeThree(2987),
      kind: "in-transit",
      mode: "train",
      from: "sannomiya-station",
      to: "shin-osaka-station"
    },
    {
      ...episodeThree(3140),
      kind: "stationary",
      place: "shin-osaka-station"
    },
    {
      ...episodeThree(3322),
      kind: "in-transit",
      mode: "taxi",
      from: "shin-osaka-station",
      to: "japanese-farmhouses-museum-parking"
    },
    {
      ...episodeThree(3537),
      kind: "stationary",
      place: "japanese-farmhouses-museum-parking"
    },
    {
      ...episodeThree(3539),
      kind: "in-transit",
      mode: "walking",
      from: "japanese-farmhouses-museum-parking",
      to: "japanese-farmhouses-museum-house"
    },
    {
      ...episodeThree(3603),
      kind: "stationary",
      place: "japanese-farmhouses-museum-house"
    },
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
    {
      ...episodeTwo(105),
      kind: "in-transit",
      mode: "taxi",
      from: "miyazaki-shrine",
      to: "miyazaki-station-area",
    },
    {
      ...episodeTwo(242),
      kind: "stationary",
      place: "miyazaki-station-area",
    },
    {
      ...episodeTwo(559),
      kind: "in-transit",
      mode: "train",
      from: "miyazaki-station-area",
      to: "usuki-station",
    },
    {
      ...episodeTwo(945),
      kind: "stationary",
      place: "usuki-station",
    },
    {
      ...episodeTwo(951),
      kind: "in-transit",
      mode: "walking",
      from: "usuki-station",
      to: "usuki-port",
    },
    {
      ...episodeTwo(987),
      kind: "stationary",
      place: "usuki-port",
    },
    {
      ...episodeTwo(1003),
      kind: "in-transit",
      mode: "ferry",
      from: "usuki-port",
      to: "yawatahama-port",
    },
    {
      ...episodeTwo(1950),
      kind: "stationary",
      place: "yawatahama-port",
    },
    {
      ...episodeTwo(1966),
      kind: "in-transit",
      mode: "walking",
      from: "yawatahama-port",
      to: "yawatahama-station",
    },
    {
      ...episodeTwo(1991),
      kind: "stationary",
      place: "yawatahama-station",
    },
    {
      ...episodeTwo(1999),
      kind: "in-transit",
      mode: "train",
      from: "yawatahama-station",
      to: "matsuyama-station",
    },
    {
      ...episodeTwo(2616),
      kind: "stationary",
      place: "matsuyama-station",
    },
    {
      ...episodeTwo(2620),
      kind: "in-transit",
      mode: "walking",
      from: "matsuyama-station",
      to: "matsuyama-fishing-harbor",
    },
    {
      ...episodeTwo(2632),
      kind: "stationary",
      place: "matsuyama-fishing-harbor",
    },
    {
      ...episodeTwo(2661),
      kind: "in-transit",
      mode: "walking",
      from: "matsuyama-fishing-harbor",
      to: "matsuyama-fishing-supply-store",
    },
    {
      ...episodeTwo(2664),
      kind: "stationary",
      place: "matsuyama-fishing-supply-store",
    },
    {
      ...episodeTwo(2718),
      kind: "in-transit",
      mode: "walking",
      from: "matsuyama-fishing-supply-store",
      to: "matsuyama-fishing-shore",
    },
    {
      ...episodeTwo(2786),
      kind: "stationary",
      place: "matsuyama-fishing-shore",
    },
    {
      ...episodeTwo(3568),
      kind: "in-transit",
      mode: "taxi",
      from: "matsuyama-fishing-shore",
      to: "matsuyama-station",
    },
    {
      ...episodeTwo(3669),
      kind: "stationary",
      place: "matsuyama-station",
    },
    {
      ...episodeTwo(3680),
      kind: "in-transit",
      mode: "walking",
      from: "matsuyama-station",
      to: "matsuyama-city-station-area",
    },
    {
      ...episodeTwo(3770),
      kind: "stationary",
      place: "matsuyama-city-station-area",
    },
    {
      ...episodeThree(102),
      kind: "in-transit",
      mode: "train",
      from: "matsuyama-city-station-area",
      to: "matsuyama-station"
    },
    {
      ...episodeThree(251),
      kind: "stationary",
      place: "matsuyama-station"
    },
    {
      ...episodeThree(443),
      kind: "in-transit",
      mode: "train",
      from: "matsuyama-station",
      to: "okayama-station"
    },
    {
      ...episodeThree(1566),
      kind: "stationary",
      place: "okayama-station"
    },
    {
      ...episodeThree(1614),
      kind: "in-transit",
      mode: "bus",
      from: "okayama-station",
      to: "koraku-en"
    },
    {
      ...episodeThree(1683),
      kind: "stationary",
      place: "koraku-en"
    },
    {
      ...episodeThree(1971),
      kind: "in-transit",
      mode: "walking",
      from: "koraku-en",
      to: "koraku-en-bus-stop"
    },
    {
      ...episodeThree(2069),
      kind: "stationary",
      place: "koraku-en-bus-stop"
    },
    {
      ...episodeThree(2190),
      kind: "in-transit",
      mode: "bus",
      from: "koraku-en-bus-stop",
      to: "okayama-station"
    },
    {
      ...episodeThree(2246),
      kind: "stationary",
      place: "okayama-station"
    },
    {
      ...episodeThree(2759),
      kind: "in-transit",
      mode: "shinkansen",
      from: "okayama-station",
      to: "shin-osaka-station"
    },
    {
      ...episodeThree(3206),
      kind: "stationary",
      place: "shin-osaka-station"
    },
    {
      ...episodeThree(3284),
      kind: "in-transit",
      mode: "taxi",
      from: "shin-osaka-station",
      to: "japanese-farmhouses-museum-parking"
    },
    {
      ...episodeThree(3368),
      kind: "stationary",
      place: "japanese-farmhouses-museum-parking"
    },
    {
      ...episodeThree(3369),
      kind: "in-transit",
      mode: "walking",
      from: "japanese-farmhouses-museum-parking",
      to: "japanese-farmhouses-museum-house"
    },
    {
      ...episodeThree(3392),
      kind: "stationary",
      place: "japanese-farmhouses-museum-house"
    },
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
  "find-a-clam": {
    id: "find-a-clam",
    title: "Find a Clam",
    description:
      "It's peak clam season in Japan! Clam-digging, or shiohigari, is a springtime tradition in Japan. Go to a beach and dig up a clam!",
    cardPulls: 4,
  },
  "catvenger-hunt-part-deux": {
    id: "catvenger-hunt-part-deux",
    title: "Catvenger Hunt Part Deux",
    description:
      "Before leaving the prefecture, find four of these five cats. They must be different cats: a meowing cat; a cat that is licking itself; a cat that is touching you (you may not get closer than one foot from the cat to begin this; the cat must cover the remaining one foot); a cat that is all one color; a cat that is being pet by someone who is not you or your partner.",
    cardPulls: 1,
  },
  "hide-at-japan-landscape": {
    id: "hide-at-japan-landscape",
    title: "Hide at One of the 100 Landscapes of Japan",
    description:
      "At one of the 100 Landscapes of Japan, one partner must generate a number 2–10. They must then hide in a place where they believe it will take their partner that amount of time to find them. You get a one-minute margin of error on each side, and may make an attempt every 10 minutes.",
    cardPulls: 2,
  },
  "taste-rice-at-rice-field": {
    id: "taste-rice-at-rice-field",
    title: "Taste Rice at a Rice Field",
    description:
      "Visit a field of rice terraces. One team member will randomly generate a number of grains and feed them to their teammate, who is blindfolded. They must correctly determine the number of grains in their mouth. If they fail, you must wait 10 minutes before trying again.",
    cardPulls: 3,
  },
  "get-recognized": {
    id: "get-recognized",
    title: "Get Recognized",
    description:
      "A person you do not know personally must come up to you and make it clear they recognize you from the internet. You may try to situate yourself in noticeable places, and act recognizable, but you may not directly solicit recognition, either verbally or in writing. You may not post on social media about your location. In order to be eligible to complete this challenge, you must select which member of your team must be recognized. You must successfully gather footage in which the person is recognizing you; you may not ask them to recreate the moment.",
    cardPulls: 5,
  },
  "taste-test-strawberries": {
    id: "taste-test-strawberries",
    title: "Taste Test Strawberries",
    description:
      "It's strawberry season! At a strawberry farm, pick three strawberries based on appearance and predict how your blindfolded partner will rank them based on taste. If you do not match, you must wait 30 minutes before trying again.",
    cardPulls: 2,
  },
  "spot-partner-from-ropeway": {
    id: "spot-partner-from-ropeway",
    title: "Spot Your Partner from a Ropeway",
    description: "One player must secretly generate a random number 250–500 and situate themselves at least that many feet from the ropeway station. Their partner must ride the suspended ropeway and spot them. When the ropeway begins its journey, the hiding player may send a top-down photo of themselves. You may not collude beforehand. If you fail, try again on the descent; after a second failure, switch roles before reattempting.",
    cardPulls: 3
  },
  "find-secret-spot-great-garden": {
    id: "find-secret-spot-great-garden",
    title: "Find the Secret Spot at One of Japan's Great Gardens",
    description: "Just outside Kenroku-en, Kōraku-en, or Kairaku-en, reveal Amy's secret location for that garden. Find it within 10 minutes without using your phone. For every minute past the timer, wait at the garden an additional five minutes before leaving.",
    cardPulls: 3
  },
  "build-house-of-cards": {
    id: "build-house-of-cards",
    title: "Build a House of Cards at a Gassho-zukuri House",
    description: "Go to any gassho-zukuri house and construct a two-story house of cards using your Jet Lag cards. You may practice. If any cards tip over and hit their flat parts on the ground during an attempt, wait 30 minutes before trying again.",
    cardPulls: 3
  },
  "record-iconic-sound": {
    id: "record-iconic-sound",
    title: "Record an Iconic Sound",
    description: "Record one of the sounds on the Japanese government's 1996 list of the 100 Soundscapes of Japan.",
    cardPulls: 2
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
  {
    ...episodeOne(4770),
    kind: "attempt-ended",
    attempt: "adam-tom-scavenger-3",
    team: "adam-tom",
    challenge: "japan-scavenger-hunt",
    outcome: "completed",
  },
  {
    ...episodeOne(4773),
    kind: "completed",
    team: "adam-tom",
    challenge: "japan-scavenger-hunt",
  },
  {
    ...episodeTwo(188),
    kind: "revealed",
    challenge: "find-a-clam",
  },
  {
    ...episodeTwo(533),
    kind: "attempt-ended",
    attempt: "sam-ben-riddle-1",
    team: "sam-ben",
    challenge: "answer-riddle-under-bridge",
    outcome: "completed",
  },
  {
    ...episodeTwo(535),
    kind: "completed",
    team: "sam-ben",
    challenge: "answer-riddle-under-bridge",
  },
  {
    ...episodeTwo(652),
    kind: "revealed",
    challenge: "catvenger-hunt-part-deux",
  },
  {
    ...episodeTwo(938),
    kind: "attempt-started",
    attempt: "adam-tom-boat-1",
    team: "adam-tom",
    challenge: "leave-prefecture-by-boat",
  },
  {
    ...episodeTwo(1053),
    kind: "attempt-ended",
    attempt: "adam-tom-boat-1",
    team: "adam-tom",
    challenge: "leave-prefecture-by-boat",
    outcome: "completed",
  },
  {
    ...episodeTwo(1055),
    kind: "completed",
    team: "adam-tom",
    challenge: "leave-prefecture-by-boat",
  },
  {
    ...episodeTwo(1175),
    kind: "revealed",
    challenge: "hide-at-japan-landscape",
  },
  {
    ...episodeTwo(1525),
    kind: "attempt-started",
    attempt: "sam-ben-fish-1",
    team: "sam-ben",
    challenge: "catch-a-fish",
  },
  {
    ...episodeTwo(1720),
    kind: "attempt-started",
    attempt: "sam-ben-clam-1",
    team: "sam-ben",
    challenge: "find-a-clam",
  },
  {
    ...episodeTwo(2120),
    kind: "attempt-ended",
    attempt: "sam-ben-fish-1",
    team: "sam-ben",
    challenge: "catch-a-fish",
    outcome: "abandoned",
  },
  {
    ...episodeTwo(2120),
    kind: "attempt-ended",
    attempt: "sam-ben-clam-1",
    team: "sam-ben",
    challenge: "find-a-clam",
    outcome: "abandoned",
  },
  {
    ...episodeTwo(2159),
    kind: "attempt-started",
    attempt: "sam-ben-water-1",
    team: "sam-ben",
    challenge: "flip-remarkable-water",
  },
  {
    ...episodeTwo(2460),
    kind: "attempt-ended",
    attempt: "sam-ben-water-1",
    team: "sam-ben",
    challenge: "flip-remarkable-water",
    outcome: "completed",
  },
  {
    ...episodeTwo(2462),
    kind: "completed",
    team: "sam-ben",
    challenge: "flip-remarkable-water",
  },
  {
    ...episodeTwo(2555),
    kind: "revealed",
    challenge: "taste-rice-at-rice-field",
  },
  {
    ...episodeTwo(2613),
    kind: "attempt-started",
    attempt: "adam-tom-fish-1",
    team: "adam-tom",
    challenge: "catch-a-fish",
  },
  {
    ...episodeTwo(2945),
    kind: "attempt-started",
    attempt: "sam-ben-catvenger-1",
    team: "sam-ben",
    challenge: "catvenger-hunt-part-deux",
  },
  {
    ...episodeTwo(3195),
    kind: "attempt-ended",
    attempt: "sam-ben-catvenger-1",
    team: "sam-ben",
    challenge: "catvenger-hunt-part-deux",
    outcome: "completed",
  },
  {
    ...episodeTwo(3198),
    kind: "completed",
    team: "sam-ben",
    challenge: "catvenger-hunt-part-deux",
  },
  {
    ...episodeTwo(3367),
    kind: "revealed",
    challenge: "find-prefectural-bird",
  },
  {
    ...episodeTwo(3526),
    kind: "attempt-ended",
    attempt: "adam-tom-fish-1",
    team: "adam-tom",
    challenge: "catch-a-fish",
    outcome: "abandoned",
  },
  {
    ...episodeTwo(3793),
    kind: "removed",
    challenge: "find-prefectural-bird",
  },
  {
    ...episodeTwo(3793),
    kind: "removed",
    challenge: "find-a-clam",
  },
  {
    ...episodeTwo(3827),
    kind: "revealed",
    challenge: "get-recognized",
  },
  {
    ...episodeTwo(3875),
    kind: "attempt-started",
    attempt: "adam-tom-recognized-1",
    team: "adam-tom",
    challenge: "get-recognized",
  },
  {
    ...episodeTwo(3885),
    kind: "revealed",
    challenge: "taste-test-strawberries",
  },
  {
    ...episodeTwo(3941),
    kind: "attempt-started",
    attempt: "adam-tom-rice-1",
    team: "adam-tom",
    challenge: "taste-rice-at-rice-field",
  },
  {
    ...episodeTwo(3975),
    kind: "attempt-ended",
    attempt: "adam-tom-recognized-1",
    team: "adam-tom",
    challenge: "get-recognized",
    outcome: "completed",
  },
  {
    ...episodeTwo(3993),
    kind: "completed",
    team: "adam-tom",
    challenge: "get-recognized",
  },
  {
    ...episodeTwo(4009),
    kind: "attempt-ended",
    attempt: "adam-tom-rice-1",
    team: "adam-tom",
    challenge: "taste-rice-at-rice-field",
    outcome: "abandoned",
  },
  {
    ...episodeThree(264),
    kind: "revealed",
    challenge: "spot-partner-from-ropeway"
  },
  {
    ...episodeThree(551),
    kind: "attempt-started",
    attempt: "sam-ben-landscape-1",
    team: "sam-ben",
    challenge: "hide-at-japan-landscape",
  },
  {
    ...episodeThree(740),
    kind: "attempt-ended",
    attempt: "sam-ben-landscape-1",
    team: "sam-ben",
    challenge: "hide-at-japan-landscape",
    outcome: "failed",
  },
  {
    ...episodeThree(783),
    kind: "attempt-started",
    attempt: "sam-ben-landscape-2",
    team: "sam-ben",
    challenge: "hide-at-japan-landscape",
  },
  {
    ...episodeThree(842),
    kind: "attempt-ended",
    attempt: "sam-ben-landscape-2",
    team: "sam-ben",
    challenge: "hide-at-japan-landscape",
    outcome: "failed",
  },
  {
    ...episodeThree(866),
    kind: "attempt-started",
    attempt: "sam-ben-landscape-3",
    team: "sam-ben",
    challenge: "hide-at-japan-landscape",
  },
  {
    ...episodeThree(957),
    kind: "attempt-ended",
    attempt: "sam-ben-landscape-3",
    team: "sam-ben",
    challenge: "hide-at-japan-landscape",
    outcome: "completed",
  },
  {
    ...episodeThree(961),
    kind: "completed",
    challenge: "hide-at-japan-landscape",
    team: "sam-ben"
  },
  {
    ...episodeThree(1050),
    kind: "revealed",
    challenge: "find-secret-spot-great-garden"
  },
  {
    ...episodeThree(1683),
    kind: "attempt-started",
    challenge: "find-secret-spot-great-garden",
    attempt: "adam-tom-garden-1",
    team: "adam-tom"
  },
  {
    ...episodeThree(1954),
    kind: "attempt-ended",
    challenge: "find-secret-spot-great-garden",
    attempt: "adam-tom-garden-1",
    team: "adam-tom",
    outcome: "completed"
  },
  {
    ...episodeThree(1957),
    kind: "completed",
    challenge: "find-secret-spot-great-garden",
    team: "adam-tom"
  },
  {
    ...episodeThree(2022),
    kind: "attempt-started",
    challenge: "spot-partner-from-ropeway",
    attempt: "sam-ben-ropeway-1",
    team: "sam-ben"
  },
  {
    ...episodeThree(2147),
    kind: "revealed",
    challenge: "build-house-of-cards"
  },
  {
    ...episodeThree(2400),
    kind: "attempt-ended",
    attempt: "sam-ben-ropeway-1",
    team: "sam-ben",
    challenge: "spot-partner-from-ropeway",
    outcome: "failed",
  },
  {
    ...episodeThree(2518),
    kind: "attempt-started",
    attempt: "sam-ben-ropeway-2",
    team: "sam-ben",
    challenge: "spot-partner-from-ropeway",
  },
  {
    ...episodeThree(2626),
    kind: "attempt-ended",
    challenge: "spot-partner-from-ropeway",
    attempt: "sam-ben-ropeway-2",
    team: "sam-ben",
    outcome: "completed"
  },
  {
    ...episodeThree(2629),
    kind: "completed",
    challenge: "spot-partner-from-ropeway",
    team: "sam-ben"
  },
  {
    ...episodeThree(2919),
    kind: "revealed",
    challenge: "record-iconic-sound"
  },
  {
    ...episodeThree(3428),
    kind: "attempt-started",
    challenge: "build-house-of-cards",
    attempt: "adam-tom-house-of-cards-1",
    team: "adam-tom"
  },
  {
    ...episodeThree(3446),
    kind: "attempt-started",
    challenge: "build-house-of-cards",
    attempt: "sam-ben-house-of-cards-1",
    team: "sam-ben"
  },
  {
    ...episodeThree(3582),
    kind: "attempt-ended",
    challenge: "build-house-of-cards",
    attempt: "adam-tom-house-of-cards-1",
    team: "adam-tom",
    outcome: "failed"
  },
] as const satisfies readonly SeasonNineteenChallengeEvent[];

/** Challenge unlocks use the completion graphic; direct card unlocks use card play. */
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
  {
    ...episodeOne(4773),
    team: "adam-tom",
    prefecture: "Miyazaki",
    challenge: "japan-scavenger-hunt",
  },
  {
    ...episodeTwo(535),
    team: "sam-ben",
    prefecture: "Fukuoka",
    challenge: "answer-riddle-under-bridge",
  },
  {
    ...episodeTwo(1055),
    team: "adam-tom",
    prefecture: "Oita",
    challenge: "leave-prefecture-by-boat",
  },
  {
    ...episodeTwo(2462),
    team: "sam-ben",
    prefecture: "Yamaguchi",
    challenge: "flip-remarkable-water",
  },
  {
    ...episodeTwo(3198),
    team: "sam-ben",
    prefecture: "Hiroshima",
    challenge: "catvenger-hunt-part-deux",
  },
  {
    ...episodeTwo(3993),
    team: "adam-tom",
    prefecture: "Ehime",
    challenge: "get-recognized",
  },
  {
    ...episodeThree(961),
    team: "sam-ben",
    prefecture: "Okayama",
    challenge: "hide-at-japan-landscape"
  },
  {
    ...episodeThree(1259),
    team: "adam-tom",
    prefecture: "Kagawa",
    card: "unlock-any-prefecture"
  },
  {
    ...episodeThree(1957),
    team: "adam-tom",
    prefecture: "Okayama",
    challenge: "find-secret-spot-great-garden"
  },
  {
    ...episodeThree(2629),
    team: "sam-ben",
    prefecture: "Hyogo",
    challenge: "spot-partner-from-ropeway"
  },
  {
    ...episodeThree(2629),
    team: "adam-tom",
    prefecture: "Hyogo",
    challenge: "spot-partner-from-ropeway",
    card: "curse-magic-mirror"
  },
] as const satisfies readonly SeasonNineteenPrefectureUnlock[];

/** Every reward card whose face is shown in the extracted episodes. */
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
  "curse-forbidden-quest": {
    id: "curse-forbidden-quest",
    title: "Curse of the Forbidden Quest",
    description:
      "Play this curse in response to a new challenge entering the board. That challenge cannot be attempted by the opposing team.",
  },
  "curse-toxic-cloud": {
    id: "curse-toxic-cloud",
    title: "Curse of the Toxic Cloud",
    description:
      "Select a prefecture that the opposing team is not currently in. The opposing team must flip a coin after every hour they spend in that prefecture. If it is tails, they must discard a card at random.",
  },
  "shinkansen-60-minutes": {
    id: "shinkansen-60-minutes",
    title: "Shinkansen — 60 Minutes",
  },
  "unlock-any-prefecture": {
    id: "unlock-any-prefecture",
    title: "Unlock Any Prefecture",
  },
  "curse-pickpocket": {
    id: "curse-pickpocket",
    title: "Curse of the Pickpocket",
    description: "Steal one card at random from the opposing team.",
  },
  "curse-bounty-hunter": {
    id: "curse-bounty-hunter",
    title: "Curse of the Bounty Hunter",
    description:
      "Take a photo of at least one of your opponents. You steal their entire hand and unlock the current prefecture for your team.",
  },
  "curse-reverse": {
    id: "curse-reverse",
    title: "Curse Reverse",
  },
  "shinkansen-30-minutes": {
    id: "shinkansen-30-minutes",
    title: "Shinkansen — 30 Minutes"
  },
  "unlock-landlocked-prefecture": {
    id: "unlock-landlocked-prefecture",
    title: "Unlock a Prefecture That Is Landlocked"
  },
  "shinkansen-opponent-prefecture": {
    id: "shinkansen-opponent-prefecture",
    title: "Shinkansen from a Prefecture Your Opponents Unlocked"
  },
  "curse-german-engineering": {
    id: "curse-german-engineering",
    title: "Curse of German Engineering",
    description: "Select a prefecture. The opposing team cannot take the Shinkansen in that prefecture. Cannot be played on Aomori or Hokkaido."
  },
  "curse-apprentice": {
    id: "curse-apprentice",
    title: "Curse of the Apprentice",
    description: "The next challenge completed by the opposing team may be reattempted by your team in any prefecture at any time."
  },
  "curse-magic-mirror": {
    id: "curse-magic-mirror",
    title: "Curse of the Magic Mirror",
    description: "The next prefecture the opposing team unlocks is unlocked for both teams, and the reward is earned by both teams."
  },
  "shinkansen-sea-of-japan-prefecture": {
    id: "shinkansen-sea-of-japan-prefecture",
    title: "Shinkansen from a Prefecture Touching the Sea of Japan"
  },
  "curse-hidden-funnel": {
    id: "curse-hidden-funnel",
    title: "Curse of the Hidden Funnel",
    description: "Select a prefecture that the opposing team is not currently in. All rewards earned by them in that prefecture go to you."
  },
  "reshuffle-challenges": {
    id: "reshuffle-challenges",
    title: "Reshuffle Challenges",
    description: "Completely new, different ones."
  },
  "shinkansen-landlocked-prefecture": {
    id: "shinkansen-landlocked-prefecture",
    title: "Shinkansen from a Prefecture That Is Landlocked"
  },
  "unlock-kanto-prefecture": {
    id: "unlock-kanto-prefecture",
    title: "Unlock a Prefecture That Is in the Kantō Region"
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
  {
    ...episodeTwo(172),
    kind: "kept",
    team: "adam-tom",
    card: "shinkansen-45-minutes",
  },
  {
    ...episodeTwo(645),
    kind: "kept",
    team: "sam-ben",
    card: "curse-forbidden-quest",
  },
  {
    ...episodeTwo(1152),
    kind: "kept",
    team: "adam-tom",
    card: "unlock-any-prefecture",
  },
  {
    ...episodeTwo(2534),
    kind: "kept",
    team: "sam-ben",
    card: "curse-reverse",
  },
  {
    ...episodeTwo(3266),
    kind: "kept",
    team: "sam-ben",
    card: "unlock-any-prefecture",
  },
  {
    ...episodeThree(146),
    kind: "used",
    team: "adam-tom",
    card: "triple-reward-prefecture-ending-e"
  },
  {
    ...episodeThree(171),
    kind: "kept",
    team: "adam-tom",
    card: "shinkansen-opponent-prefecture"
  },
  {
    ...episodeThree(214),
    kind: "kept",
    team: "adam-tom",
    card: "curse-reverse"
  },
  {
    ...episodeThree(238),
    kind: "kept",
    team: "adam-tom",
    card: "shinkansen-60-minutes"
  },
  {
    ...episodeThree(1023),
    kind: "kept",
    team: "sam-ben",
    card: "shinkansen-60-minutes"
  },
  {
    ...episodeThree(1259),
    kind: "used",
    team: "adam-tom",
    card: "unlock-any-prefecture"
  },
  {
    ...episodeThree(1511),
    kind: "used",
    team: "sam-ben",
    card: "shinkansen-60-minutes"
  },
  {
    ...episodeThree(2108),
    kind: "kept",
    team: "adam-tom",
    card: "curse-magic-mirror"
  },
  {
    ...episodeThree(2193),
    kind: "used",
    team: "adam-tom",
    card: "curse-magic-mirror"
  },
  {
    ...episodeThree(2707),
    kind: "kept",
    team: "adam-tom",
    card: "reshuffle-challenges"
  },
  {
    ...episodeThree(2768),
    kind: "used",
    team: "adam-tom",
    card: "shinkansen-opponent-prefecture"
  },
  {
    ...episodeThree(2886),
    kind: "kept",
    team: "sam-ben",
    card: "shinkansen-landlocked-prefecture"
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
