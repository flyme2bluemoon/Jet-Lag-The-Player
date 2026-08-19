import markup from "./episode-1-events.json";
import { seasonNine } from "@/data/season-9";
import { compareTimestamps, type EpisodeTimestamp } from "@/lib/timestamps";
import { SEEKERS_RAIL_ROUTES } from "./seekers-rail-routes";

export type TrackerCoordinate = [longitude: number, latitude: number];

type SeekersLocationEvent = EpisodeTimestamp & {
    id: string;
    type: "seekers-location";
    metadata: { location: string };
};

export type SeekersTrackerState = {
    id: string;
    label: string;
    startedAt: EpisodeTimestamp;
    endsAt: EpisodeTimestamp | null;
} & (
    | { kind: "point"; coordinate: TrackerCoordinate }
    | { kind: "transit"; route: readonly TrackerCoordinate[] }
);

type Station = { name: string; coordinate: TrackerCoordinate };

function station(name: string, longitude: number, latitude: number): Station {
    return { name, coordinate: [longitude, latitude] };
}

const STATIONS = {
    lucerne: station("Lucerne", 8.31072, 47.049),
    arthGoldau: station("Arth-Goldau", 8.54945, 47.04904),
    goeschenen: station("Göschenen", 8.5891, 46.66578),
    andermatt: station("Andermatt", 8.59324, 46.63696),
    hospental: station("Hospental", 8.57095, 46.62112),
    zug: station("Zug", 8.5157, 47.17356),
    chollermueli: station("Chollermüli", 8.48661, 47.18019),
    chamAlpenblick: station("Cham Alpenblick", 8.47131, 47.1823),
    steinen: station("Steinen", 8.60752, 47.0475),
    seewen: station("Seewen", 8.63139, 47.02752),
    merlischachen: station("Merlischachen", 8.40908, 47.06763),
    zurich: station("Zurich", 8.54021, 47.37818),
    winterthur: station("Winterthur", 8.72397, 47.50031),
    winterthurMcDonalds: station("Töss, Winterthur", 8.71217, 47.49531),
    bern: station("Bern", 7.43985, 46.94942),
    solothurn: station("Solothurn", 7.54269, 47.20419),
    wiedlisbach: station("Wiedlisbach", 7.64623, 47.25286),
    utzenstorf: station("Utzenstorf", 7.55358, 47.13003),
    burgdorf: station("Burgdorf", 7.6204, 47.06089),
    langenthal: station("Langenthal", 7.78482, 47.21721),
    rohrbach: station("Rohrbach", 7.81386, 47.13722),
} satisfies Record<string, Station>;

const POINTS_BY_LABEL: Readonly<Record<string, Station>> = {
    Lucerne: STATIONS.lucerne,
    Goschenen: STATIONS.goeschenen,
    Andermatt: STATIONS.andermatt,
    Hospental: STATIONS.hospental,
    "Arrive in Goschenen": STATIONS.goeschenen,
    "Arrive in Zug": STATIONS.zug,
    "Stop at Chollermuli": STATIONS.chollermueli,
    "Arrive in Cham Alpenblick": STATIONS.chamAlpenblick,
    "Arrive in Steinen": STATIONS.steinen,
    "Arrive in Seewen": STATIONS.seewen,
    "Transfer in Arth-Goldau": STATIONS.arthGoldau,
    "Arrive in Merlischachen": STATIONS.merlischachen,
    "Arrive in Lucerne": STATIONS.lucerne,
    "Arrive in Zurich": STATIONS.zurich,
    "Arrive in Winterthur": STATIONS.winterthur,
    "Arrive at the McDonald's in Sam's hiding zone (Zürcherstrasse 50, 8406 Winterthur, Switzerland)": STATIONS.winterthurMcDonalds,
    "Arrive at Zurich": STATIONS.zurich,
    "Arrive in Bern": STATIONS.bern,
    "Arrive in Solothurn": STATIONS.solothurn,
    "Arrive at Wiedlisbach": STATIONS.wiedlisbach,
    "Arrive in Utzenstorf": STATIONS.utzenstorf,
    "Arrive in Bergdorf": STATIONS.burgdorf,
    "Arrive in Langenthal": STATIONS.langenthal,
};

const TRANSIT_DESTINATIONS: Readonly<Record<string, readonly Station[]>> = {
    "Train to Arth-Goldau leaves Lucerne": [STATIONS.arthGoldau],
    "Train to Andermatt": [STATIONS.andermatt],
    "Train leaves to Hospental": [STATIONS.hospental],
    "Train to Zug": [STATIONS.zug],
    "Train to Cham Alpenblick": [STATIONS.chamAlpenblick],
    "Leave Chollermuli": [STATIONS.chamAlpenblick],
    "Train to Steinen": [STATIONS.steinen],
    "Train to Seewen": [STATIONS.seewen],
    "Train to Merlischachen via Arth-Goldau": [STATIONS.arthGoldau],
    "Leaving Arth-Goldau": [STATIONS.merlischachen],
    "Train to Lucerne": [STATIONS.lucerne],
    "Train to Zurich": [STATIONS.zurich],
    "Train to Winterthur": [STATIONS.winterthur],
    "Train to Bern": [STATIONS.bern],
    "Train to Solothurn": [STATIONS.solothurn],
    "Train to Wiedlisbach": [STATIONS.wiedlisbach],
    "Train to Utzenstorf": [STATIONS.utzenstorf],
    "Train to Bergdorf": [STATIONS.burgdorf],
    "Train to Langenthal": [STATIONS.langenthal],
    "Train to Rohrbach": [STATIONS.rohrbach],
};

const locationEvents = (markup.events as readonly SeekersLocationEvent[])
    .filter((event) => event.type === "seekers-location")
    .toSorted((left, right) => compareTimestamps(seasonNine, left, right));

const stateCache = new Map<number, SeekersTrackerState>();

function createState(index: number): SeekersTrackerState {
    const cached = stateCache.get(index);
    if (cached) return cached;

    const event = locationEvents[index]!;
    const nextEvent = locationEvents[index + 1] ?? null;
    const label = event.metadata.location;
    const point = POINTS_BY_LABEL[label];
    let state: SeekersTrackerState;

    if (point) {
        state = {
            id: event.id,
            kind: "point",
            label: point.name,
            coordinate: point.coordinate,
            startedAt: event,
            endsAt: nextEvent,
        };
    } else {
        const destinations = TRANSIT_DESTINATIONS[label];
        if (!destinations) throw new Error(`Unknown Season 9 seekers location: ${label}`);

        let origin: Station = STATIONS.lucerne;
        for (let previousIndex = index - 1; previousIndex >= 0; previousIndex -= 1) {
            const previousPoint = POINTS_BY_LABEL[locationEvents[previousIndex]!.metadata.location];
            if (previousPoint) {
                origin = previousPoint;
                break;
            }
        }

        state = {
            id: event.id,
            kind: "transit",
            label: `${origin.name} → ${destinations.at(-1)!.name}`,
            route: SEEKERS_RAIL_ROUTES[event.id]
                ?? [origin.coordinate, ...destinations.map((stop) => stop.coordinate)],
            startedAt: event,
            endsAt: nextEvent,
        };
    }

    stateCache.set(index, state);
    return state;
}

export function getSeekersTrackerState(
    episodeSlug: string,
    currentTime: number,
): SeekersTrackerState {
    const current = { episode: episodeSlug, at: currentTime };
    let visibleIndex = 0;

    for (let index = 1; index < locationEvents.length; index += 1) {
        if (compareTimestamps(seasonNine, locationEvents[index]!, current) > 0) break;
        visibleIndex = index;
    }

    return createState(visibleIndex);
}
