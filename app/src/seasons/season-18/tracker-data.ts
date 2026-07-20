import { seasonEighteen } from "@/data/season-18";
import { compareTimestamps } from "@/lib/timestamps";
import type { TeamId } from "./team-data";
import {
    trackerRoutePaths,
    type Coordinate,
    type TrackerRouteId,
} from "./tracker-routes";

export type { Coordinate } from "./tracker-routes";

/**
 * How to extend the Season 18 tracker
 *
 * 1. Add every reusable stop or destination to `locations`. Coordinates are
 *    always `[longitude, latitude]` and should describe the point where the
 *    live pin should sit, not a label position or a broad city center.
 * 2. Add non-flight geometry to `tracker-routes.ts`, then reference its key
 *    from a movement event's `routeId`. Flights use IATA codes instead.
 * 3. Append `place(...)` and `movement(...)` records to the relevant team's
 *    array in strict video order. Times are seconds from the start of the
 *    episode. When two records have the same time, the later array entry wins.
 * 4. Use a place record whenever a team becomes stationary at a meaningful
 *    location, and a movement record only while a team is actively traveling.
 * 5. Keep status copy presentation-safe: primary is a place or transport
 *    description, secondary is city/state or a broad interstate mode such as
 *    `Flight`, `Interstate Roadtrip`, or `Intercity rail`. Never expose a
 *    mapping address or timestamp in this copy.
 * 6. Set `positionProgressAtArrival` when the footage ends or a movement is
 *    abandoned before reaching the end of its route. Add a focused progress
 *    helper, like the LGA and Metra milestones below, only when simple linear
 *    progress would misrepresent stops or another explicit tracker rule.
 * 7. Give every movement concise `originLabel` and `destinationLabel` values.
 *    They are rendered beside the live route endpoints, so prefer recognizable
 *    place names or airport codes over addresses.
 *
 * Adding another episode also requires storing its tracker bounds, extending
 * `trackerEpisodeRanges`, and adding a camera stage in `tracker-card.tsx`. Query functions
 * already select the latest event across episode boundaries.
 */
type EpisodeSlug = (typeof seasonEighteen.episodes)[number]["slug"];

const EPISODE_ONE_TRACKER_START = 0 * 60 + 5;
const EPISODE_ONE_TRACKER_END = 55 * 60 + 52;
const EPISODE_TWO_TRACKER_START = 1 * 60 + 7;
const EPISODE_TWO_TRACKER_END = 52 * 60 + 53;
const EPISODE_THREE_TRACKER_START = 43;
const EPISODE_THREE_TRACKER_END = 41 * 60 + 43;
const EPISODE_FOUR_TRACKER_START = 55;
const EPISODE_FOUR_TRACKER_END = 56 * 60 + 42;

const trackerEpisodeRanges = {
    "episode-1": { start: EPISODE_ONE_TRACKER_START, end: EPISODE_ONE_TRACKER_END },
    "episode-2": { start: EPISODE_TWO_TRACKER_START, end: EPISODE_TWO_TRACKER_END },
    "episode-3": { start: EPISODE_THREE_TRACKER_START, end: EPISODE_THREE_TRACKER_END },
    "episode-4": { start: EPISODE_FOUR_TRACKER_START, end: EPISODE_FOUR_TRACKER_END },
    "episode-5": { start: 47, end: 46 * 60 + 27 },
} as const satisfies Partial<Record<
    EpisodeSlug,
    { start: number; end: number }
>>;

type TrackerEpisodeSlug = keyof typeof trackerEpisodeRanges;

export function hasTrackerData(
    episodeSlug: string,
): episodeSlug is TrackerEpisodeSlug {
    return Object.hasOwn(trackerEpisodeRanges, episodeSlug);
}

export function clampTrackerTime(episodeSlug: string, currentTime: number) {
    if (!hasTrackerData(episodeSlug)) return currentTime;

    const range = trackerEpisodeRanges[episodeSlug];
    return Math.min(Math.max(currentTime, range.start), range.end);
}

type AirportCode = "ATL" | "BOS" | "DCA" | "DTW" | "LGA" | "MEM" | "ORD" | "STL";

type TrackerMode =
    | "place"
    | "public-transit"
    | "flight"
    | "rideshare"
    | "commuter-rail"
    | "subway"
    | "walking"
    | "driving";

type Status = {
    primary: string;
    secondary: string;
};

type Travel = {
    mode: Exclude<TrackerMode, "place">;
    // Destination metadata; the rendered pin follows routeId/flight geometry.
    to: Coordinate;
    originLabel: string;
    destinationLabel: string;
    arrivalAt: number;
    // Ground routes must exist in tracker-routes.ts and run origin -> destination.
    routeId?: TrackerRouteId;
    flight?: { from: AirportCode; to: AirportCode };
    // Fraction of the supplied geometry already reached at departure.
    positionProgressAtDeparture?: number;
    // Fraction of the supplied geometry reached when arrivalAt is hit.
    positionProgressAtArrival?: number;
};

type TrackerEvent = {
    id: string;
    team: TeamId;
    episode: EpisodeSlug;
    at: number;
    coordinate: Coordinate;
    status: Status;
    travel?: Travel;
};

export type TrackerSnapshot = {
    event: TrackerEvent;
    position: Coordinate;
};

export type ActiveTrajectory = {
    id: string;
    team: TeamId;
    progress: number;
    positionProgress: number;
    revealProgressOnly: boolean;
    originLabel: string;
    destinationLabel: string;
    destinationVisible?: boolean;
} & (
    | { kind: "ground"; coordinates: Coordinate[] }
    | { kind: "flight"; from: AirportCode; to: AirportCode }
);

const locations = {
    centralPark: [-73.9654, 40.7829] as Coordinate,
    seventySecondStreet: [-73.97641, 40.775594] as Coordinate,
    jacksonHeightsRoosevelt: [-73.891338, 40.746644] as Coordinate,
    lgaTerminalB: [-73.8727, 40.7745] as Coordinate,
    lgaTerminalC: [-73.8637, 40.7701] as Coordinate,
    ord: [-87.904223, 41.977665] as Coordinate,
    cumberlandMetra: [-87.9122222, 42.0525] as Coordinate,
    desPlainesMetra: [-87.8866667, 42.0408333] as Coordinate,
    deeRoadMetra: [-87.8561111, 42.0241667] as Coordinate,
    parkRidgeMetra: [-87.8316667, 42.0102778] as Coordinate,
    edisonParkMetra: [-87.8175, 42.0022222] as Coordinate,
    jeffersonParkMetra: [-87.7633333, 41.9713889] as Coordinate,
    mem: [-89.980244, 35.050974] as Coordinate,
    hattieBs: [-90.0024, 35.1232] as Coordinate,
    hernandoDeSotoPark: [-90.2456389, 34.9525556] as Coordinate,
    wallsPullOver: [-90.1523, 34.9591] as Coordinate,
    dtw: [-83.355955, 42.20783] as Coordinate,
    detroitWindsorTunnelBorder: [-83.0386, 42.3215] as Coordinate,
    windsorCityHall: [-83.0349931, 42.3170535] as Coordinate,
    ambassadorBridge: [-83.074074, 42.311974] as Coordinate,
    bos: [-71.017981, 42.36224] as Coordinate,
    massachusettsNewHampshireBorder: [-71.209077, 42.697023] as Coordinate,
    newHampshireMassachusettsI93Border: [-71.209322, 42.69728] as Coordinate,
    londonderryHomeDepot: [-71.3487084, 42.8611358] as Coordinate,
    merrimackCoveredBridge: [-71.5633, 42.8959] as Coordinate,
    paulReverePark: [-71.06248, 42.37013] as Coordinate,
    boston: [-71.103519, 42.41103] as Coordinate,
    margaritavilleBoston: [-71.0555, 42.3601] as Coordinate,
    mississippiAlabamaBorder: [-88.1880874, 34.2039176] as Coordinate,
    birmingham: [-86.8024326, 33.5206824] as Coordinate,
    alabamaGeorgiaBorder: [-85.3433943, 33.673039] as Coordinate,
    westGeorgia: [-85.15864, 33.687314] as Coordinate,
    villaRicaMural: [-84.9199167, 33.7316944] as Coordinate,
    worldOfCocaCola: [-84.3925521, 33.7628981] as Coordinate,
    atl: [-84.446778, 33.640012] as Coordinate,
    stl: [-90.373804, 38.745163] as Coordinate,
    gatewayArch: [-90.183902, 38.624475] as Coordinate,
    rendLake: [-88.917895, 38.125657] as Coordinate,
    irvinCobbBridge: [-88.629001, 37.115073] as Coordinate,
    kentuckyAfterBridge: [-88.631498, 37.107868] as Coordinate,
    paducahDistillery: [-88.600689, 37.086526] as Coordinate,
    missouriIowaBorder: [-91.559637, 40.613404] as Coordinate,
    donnellsonDollarGeneral: [-91.560091, 40.639028] as Coordinate,
    eddyvilleExit53: [-92.632082, 41.132936] as Coordinate,
    desMoines: [-93.624478, 41.585952] as Coordinate,
    iowaSouthDakotaBorder: [-96.484134, 42.497496] as Coordinate,
    northSiouxDollarGeneral: [-96.494307, 42.524492] as Coordinate,
    duelArena: [-96.488361, 42.546566] as Coordinate,
    dca: [-77.04351, 38.851182] as Coordinate,
    jamesMonroeBirthplace: [-76.990576, 38.24192] as Coordinate,
    washingtonUnionStation: [-77.0064, 38.8971] as Coordinate,
    baltimorePennStation: [-76.615815, 39.307251] as Coordinate,
    baltimoreInnerHarbor: [-76.611, 39.285] as Coordinate,
    baltimoreWaterTaxi: [-76.575972, 39.255889] as Coordinate,
    fellsPoint: [-76.591, 39.282] as Coordinate,
    baltimoreAquarium: [-76.606713, 39.285104] as Coordinate,
    leMars: [-96.163996, 42.794293] as Coordinate,
    iowaMinnesotaBorder: [-95.595, 43.499904] as Coordinate,
    okabenaLake: [-95.615768, 43.610341] as Coordinate,
    timberLake: [-95.216409, 43.820222] as Coordinate,
    cottonwoodLake: [-95.102068, 43.880106] as Coordinate,
    binghamLake: [-95.046357, 43.906581] as Coordinate,
    saintJamesLake: [-94.647329, 43.969453] as Coordinate,
    fedjeLake: [-94.381833, 44.079536] as Coordinate,
    lakeCrystal: [-94.218849, 44.10589] as Coordinate,
    loonLake: [-94.182039, 44.093707] as Coordinate,
    millsLake: [-94.145568, 44.078125] as Coordinate,
    lakeDorothy: [-93.960265, 44.171738] as Coordinate,
    mallOfAmerica: [-93.242118, 44.856021] as Coordinate,
    msp: [-93.21954, 44.879477] as Coordinate,
    philadelphia30thStreet: [-75.181244, 39.955522] as Coordinate,
    philadelphiaTarget: [-75.17253, 39.961796] as Coordinate,
    vanCollnField: [-75.1752149, 39.9628114] as Coordinate,
    phlTerminalAWest: [-75.252369, 39.874668] as Coordinate,
    newYorkPennStation: [-73.9935, 40.7506] as Coordinate,
    empireStateBuilding: [-73.9857, 40.7484] as Coordinate,
    hertzWest34th: [-73.99474, 40.752724] as Coordinate,
} as const;

// Keep each team array chronological. `getTrackerSnapshot` searches from the
// end, so a place event at an arrival timestamp intentionally supersedes the
// movement that ends at that same timestamp.
const samAmyEvents: TrackerEvent[] = [
    place("sam-amy-central-park", "sam-amy", 0, locations.centralPark, "Central Park", "New York, NY"),
    movement("sam-amy-to-lga", "sam-amy", 4 * 60 + 13, locations.centralPark, {
        mode: "public-transit",
        to: locations.lgaTerminalB,
        originLabel: "Central Park",
        destinationLabel: "LGA Terminal B",
        arrivalAt: 7 * 60 + 40,
        routeId: "nyc-lga-b",
    }, "Public transport to LGA", "New York, NY"),
    place("sam-amy-lga", "sam-amy", 7 * 60 + 40, locations.lgaTerminalB, "LGA Terminal B", "New York, NY"),
    movement("sam-amy-lga-ord", "sam-amy", 12 * 60, locations.lgaTerminalB, {
        mode: "flight",
        to: locations.ord,
        originLabel: "LGA",
        destinationLabel: "ORD",
        arrivalAt: 14 * 60 + 54,
        flight: { from: "LGA", to: "ORD" },
    }, "Flight from LGA to ORD", "In the air"),
    place("sam-amy-ord-arrival", "sam-amy", 14 * 60 + 54, locations.ord, "O'Hare Airport", "Chicago, IL"),
    movement("sam-amy-to-cumberland", "sam-amy", 18 * 60 + 43, locations.ord, {
        mode: "rideshare",
        to: locations.cumberlandMetra,
        originLabel: "O’Hare Airport",
        destinationLabel: "Cumberland Station",
        arrivalAt: 20 * 60 + 5,
        routeId: "ord-cumberland",
    }, "Rideshare to Cumberland Station", "Chicago, IL"),
    place("sam-amy-cumberland", "sam-amy", 20 * 60 + 5, locations.cumberlandMetra, "Cumberland Station", "Des Plaines, IL"),
    movement("sam-amy-cumberland-departure", "sam-amy", 23 * 60 + 24, locations.cumberlandMetra, {
        mode: "commuter-rail",
        to: locations.desPlainesMetra,
        originLabel: "Cumberland Station",
        destinationLabel: "Des Plaines Station",
        arrivalAt: 27 * 60 + 26,
        routeId: "metra-up-nw",
    }, "Union Pacific Northwest Train towards Chicago OTC", "Chicago, IL"),
    place("sam-amy-des-plaines-stop", "sam-amy", 27 * 60 + 26, locations.desPlainesMetra, "Des Plaines Station", "Des Plaines, IL"),
    movement("sam-amy-des-plaines-departure", "sam-amy", 27 * 60 + 53, locations.desPlainesMetra, {
        mode: "commuter-rail",
        to: locations.deeRoadMetra,
        originLabel: "Des Plaines Station",
        destinationLabel: "Dee Road Station",
        arrivalAt: 31 * 60 + 32,
        routeId: "metra-up-nw",
    }, "Union Pacific Northwest Train towards Chicago OTC", "Chicago, IL"),
    place("sam-amy-dee-road-stop", "sam-amy", 31 * 60 + 32, locations.deeRoadMetra, "Dee Road Station", "Park Ridge, IL"),
    movement("sam-amy-dee-road-departure", "sam-amy", 31 * 60 + 35, locations.deeRoadMetra, {
        mode: "commuter-rail",
        to: locations.parkRidgeMetra,
        originLabel: "Dee Road Station",
        destinationLabel: "Park Ridge Station",
        arrivalAt: 32 * 60 + 39,
        routeId: "metra-up-nw",
    }, "Union Pacific Northwest Train towards Chicago OTC", "Chicago, IL"),
    place("sam-amy-park-ridge-stop", "sam-amy", 32 * 60 + 39, locations.parkRidgeMetra, "Park Ridge Station", "Park Ridge, IL"),
    movement("sam-amy-park-ridge-departure", "sam-amy", 32 * 60 + 49, locations.parkRidgeMetra, {
        mode: "commuter-rail",
        to: locations.edisonParkMetra,
        originLabel: "Park Ridge Station",
        destinationLabel: "Edison Park Station",
        arrivalAt: 34 * 60 + 32,
        routeId: "metra-up-nw",
    }, "Union Pacific Northwest Train towards Chicago OTC", "Chicago, IL"),
    place("sam-amy-edison-park-stop", "sam-amy", 34 * 60 + 32, locations.edisonParkMetra, "Edison Park Station", "Chicago, IL"),
    movement("sam-amy-edison-park-departure", "sam-amy", 34 * 60 + 34, locations.edisonParkMetra, {
        mode: "commuter-rail",
        to: locations.jeffersonParkMetra,
        originLabel: "Edison Park Station",
        destinationLabel: "Jefferson Park Station",
        arrivalAt: 37 * 60 + 33,
        routeId: "metra-up-nw",
    }, "Union Pacific Northwest Train towards Chicago OTC", "Chicago, IL"),
    place("sam-amy-jefferson-park", "sam-amy", 37 * 60 + 33, locations.jeffersonParkMetra, "Jefferson Park Station", "Chicago, IL"),
    movement("sam-amy-blue-line", "sam-amy", 38 * 60 + 37, locations.jeffersonParkMetra, {
        mode: "subway",
        to: locations.ord,
        originLabel: "Jefferson Park Station",
        destinationLabel: "O’Hare Airport",
        arrivalAt: 43 * 60 + 33,
        routeId: "cta-blue-jefferson-ord",
    }, "Blue Line towards O’Hare", "Chicago, IL"),
    place("sam-amy-back-at-ord", "sam-amy", 43 * 60 + 33, locations.ord, "O'Hare Airport", "Chicago, IL"),
    movement("sam-amy-ord-dtw", "sam-amy", 51 * 60 + 2, locations.ord, {
        mode: "flight",
        to: locations.dtw,
        originLabel: "ORD",
        destinationLabel: "DTW",
        arrivalAt: EPISODE_ONE_TRACKER_END,
        flight: { from: "ORD", to: "DTW" },
        positionProgressAtArrival: 0.18,
    }, "Flight from ORD to DTW", "In the air"),
    movement("sam-amy-ord-dtw-episode-two", "sam-amy", EPISODE_TWO_TRACKER_START, locations.ord, {
        mode: "flight",
        to: locations.dtw,
        originLabel: "ORD",
        destinationLabel: "DTW",
        arrivalAt: 1 * 60 + 43,
        flight: { from: "ORD", to: "DTW" },
        positionProgressAtDeparture: 0.18,
    }, "Flight from ORD to DTW", "In the air", "episode-2"),
    place("sam-amy-dtw-arrival", "sam-amy", 1 * 60 + 43, locations.dtw, "DTW McNamara Terminal", "Detroit, MI", "episode-2"),
    movement("sam-amy-dtw-to-canada-border", "sam-amy", 4 * 60 + 58, locations.dtw, {
        mode: "driving",
        to: locations.detroitWindsorTunnelBorder,
        originLabel: "DTW Airport",
        destinationLabel: "Canada border",
        arrivalAt: 8 * 60 + 6,
        routeId: "dtw-tunnel-border",
    }, "Driving to Downtown Windsor", "Detroit–Windsor", "episode-2"),
    movement("sam-amy-crossing-into-canada", "sam-amy", 8 * 60 + 6, locations.detroitWindsorTunnelBorder, {
        mode: "driving",
        to: locations.windsorCityHall,
        originLabel: "U.S.–Canada border",
        destinationLabel: "Downtown Windsor",
        arrivalAt: 8 * 60 + 30,
        routeId: "tunnel-border-windsor",
    }, "Crossing the U.S.–Canada border", "Detroit–Windsor Tunnel", "episode-2"),
    place("sam-amy-downtown-windsor", "sam-amy", 8 * 60 + 30, locations.windsorCityHall, "Downtown Windsor", "Windsor, ON", "episode-2"),
    movement("sam-amy-windsor-to-ambassador", "sam-amy", 16 * 60 + 42, locations.windsorCityHall, {
        mode: "driving",
        to: locations.ambassadorBridge,
        originLabel: "Downtown Windsor",
        destinationLabel: "Ambassador Bridge",
        arrivalAt: 17 * 60 + 15,
        routeId: "windsor-ambassador",
    }, "Driving back to DTW Airport", "Windsor–Detroit", "episode-2"),
    movement("sam-amy-ambassador-bridge", "sam-amy", 17 * 60 + 15, locations.ambassadorBridge, {
        mode: "driving",
        to: locations.dtw,
        originLabel: "Ambassador Bridge",
        destinationLabel: "DTW Airport",
        arrivalAt: 17 * 60 + 32,
        routeId: "ambassador-dtw",
    }, "Crossing Ambassador Bridge", "Canada–U.S. border", "episode-2"),
    place("sam-amy-back-at-dtw", "sam-amy", 17 * 60 + 32, locations.dtw, "Detroit Metropolitan Airport", "Detroit, MI", "episode-2"),
    movement("sam-amy-dtw-bos", "sam-amy", 30 * 60 + 13, locations.dtw, {
        mode: "flight",
        to: locations.bos,
        originLabel: "DTW",
        destinationLabel: "BOS",
        arrivalAt: 34 * 60 + 3,
        flight: { from: "DTW", to: "BOS" },
    }, "Flight from DTW to BOS", "In the air", "episode-2"),
    place("sam-amy-bos-arrival", "sam-amy", 34 * 60 + 3, locations.bos, "Boston Logan Airport", "Boston, MA", "episode-2"),
    movement("sam-amy-bos-to-new-hampshire", "sam-amy", 40 * 60 + 31, locations.bos, {
        mode: "driving",
        to: locations.massachusettsNewHampshireBorder,
        originLabel: "BOS Airport",
        destinationLabel: "New Hampshire border",
        arrivalAt: 43 * 60 + 22,
        routeId: "bos-new-hampshire-border",
    }, "Driving to Merrimack Covered Bridge", "Interstate Roadtrip", "episode-2"),
    movement("sam-amy-crossing-into-new-hampshire", "sam-amy", 43 * 60 + 22, locations.massachusettsNewHampshireBorder, {
        mode: "driving",
        to: locations.londonderryHomeDepot,
        originLabel: "Massachusetts border",
        destinationLabel: "Londonderry",
        arrivalAt: 43 * 60 + 56,
        routeId: "new-hampshire-border-home-depot",
    }, "Crossing the Massachusetts–New Hampshire border", "Interstate Roadtrip", "episode-2"),
    place("sam-amy-londonderry-home-depot", "sam-amy", 43 * 60 + 56, locations.londonderryHomeDepot, "Home Depot", "Londonderry, NH", "episode-2"),
    movement("sam-amy-home-depot-to-covered-bridge", "sam-amy", 47 * 60 + 52, locations.londonderryHomeDepot, {
        mode: "driving",
        to: locations.merrimackCoveredBridge,
        originLabel: "Londonderry",
        destinationLabel: "Merrimack Covered Bridge",
        arrivalAt: 48 * 60 + 39,
        routeId: "home-depot-merrimack-bridge",
    }, "Driving to Merrimack Covered Bridge", "New Hampshire", "episode-2"),
    place("sam-amy-merrimack-covered-bridge", "sam-amy", 48 * 60 + 39, locations.merrimackCoveredBridge, "Merrimack Covered Bridge", "Merrimack, NH", "episode-2"),
    movement("sam-amy-merrimack-to-boston", "sam-amy", 1 * 60 + 43, locations.merrimackCoveredBridge, {
        mode: "driving",
        to: locations.paulReverePark,
        originLabel: "Merrimack Covered Bridge",
        destinationLabel: "Boston",
        arrivalAt: 10 * 60 + 38,
        routeId: "merrimack-bridge-paul-revere-park",
    }, "Driving towards Boston", "New Hampshire", "episode-3"),
    status("sam-amy-boston-arrival", "sam-amy", 4 * 60 + 45, locations.boston, "Driving through Boston", "Boston, MA", "episode-3"),
    status("sam-amy-whole-foods", "sam-amy", 4 * 60 + 59, locations.boston, "Whole Foods", "Boston, MA", "episode-3"),
    movement("sam-amy-leave-whole-foods", "sam-amy", 6 * 60 + 11, locations.boston, {
        mode: "driving",
        to: locations.paulReverePark,
        originLabel: "Boston",
        destinationLabel: "Paul Revere Park",
        arrivalAt: 10 * 60 + 38,
        routeId: "merrimack-bridge-paul-revere-park",
    }, "Driving to Paul Revere Park", "Boston, MA", "episode-3"),
    place("sam-amy-paul-revere-park", "sam-amy", 10 * 60 + 38, locations.paulReverePark, "Paul Revere Park", "Boston, MA", "episode-3"),
    status("sam-amy-leave-paul-revere-park", "sam-amy", 15 * 60 + 24, locations.paulReverePark, "Downtown Boston", "Boston, MA", "episode-3"),
    place("sam-amy-margaritaville-place", "sam-amy", 19 * 60 + 40, locations.margaritavilleBoston, "Jimmy Buffett’s Margaritaville", "Boston, MA", "episode-3"),
    status("sam-amy-margaritaville", "sam-amy", 19 * 60 + 40, locations.margaritavilleBoston, "Boston’s finest culinary institution", "Jimmy Buffett’s Margaritaville, Boston, MA", "episode-3"),
    movement("sam-amy-margaritaville-to-bos", "sam-amy", 22 * 60 + 31, locations.margaritavilleBoston, {
        mode: "driving",
        to: locations.bos,
        originLabel: "Margaritaville, Boston",
        destinationLabel: "Boston Logan Airport",
        arrivalAt: 23 * 60 + 23,
        routeId: "margaritaville-bos",
    }, "Driving to BOS Airport", "Boston, MA", "episode-3"),
    place("sam-amy-bos-episode-three", "sam-amy", 23 * 60 + 23, locations.bos, "Boston Logan Airport", "Boston, MA", "episode-3"),
    movement("sam-amy-bos-stl", "sam-amy", 39 * 60 + 54, locations.bos, {
        mode: "flight",
        to: locations.stl,
        originLabel: "BOS",
        destinationLabel: "STL",
        arrivalAt: EPISODE_THREE_TRACKER_END,
        flight: { from: "BOS", to: "STL" },
        positionProgressAtArrival: 0.2,
    }, "Flight from BOS to STL", "In the air", "episode-3"),
    movement("sam-amy-bos-stl-episode-four", "sam-amy", EPISODE_FOUR_TRACKER_START, locations.bos, {
        mode: "flight",
        to: locations.stl,
        originLabel: "BOS",
        destinationLabel: "STL",
        arrivalAt: 1 * 60 + 3,
        flight: { from: "BOS", to: "STL" },
        positionProgressAtDeparture: 0.2,
    }, "Flight from BOS to STL", "In the air", "episode-4"),
    place("sam-amy-stl-arrival", "sam-amy", 1 * 60 + 3, locations.stl, "St. Louis Lambert Airport", "St. Louis, MO", "episode-4"),
    movement("sam-amy-stl-to-donnellson", "sam-amy", 5 * 60 + 31, locations.stl, {
        mode: "driving",
        to: locations.donnellsonDollarGeneral,
        originLabel: "STL Airport",
        destinationLabel: "Donnellson",
        arrivalAt: 17 * 60 + 40,
        routeId: "stl-donnellson-dollar-general",
    }, "Driving to Iowa", "Missouri", "episode-4"),
    place("sam-amy-donnellson-dollar-general", "sam-amy", 17 * 60 + 40, locations.donnellsonDollarGeneral, "Dollar General", "Donnellson, IA", "episode-4"),
    movement("sam-amy-searching-for-farm-animals", "sam-amy", 21 * 60 + 14, locations.donnellsonDollarGeneral, {
        mode: "driving",
        to: locations.eddyvilleExit53,
        originLabel: "Donnellson",
        destinationLabel: "Des Moines",
        arrivalAt: 22 * 60 + 9,
        routeId: "donnellson-eddyville",
    }, "Searching for Farm Animals", "Iowa", "episode-4"),
    status("sam-amy-eddyville-farm", "sam-amy", 22 * 60 + 9, locations.eddyvilleExit53, "Outskirts of a Farm", "Eddyville, IA", "episode-4"),
    movement("sam-amy-eddyville-to-des-moines", "sam-amy", 24 * 60 + 13, locations.eddyvilleExit53, {
        mode: "driving",
        to: locations.desMoines,
        originLabel: "Eddyville",
        destinationLabel: "Des Moines",
        arrivalAt: 26 * 60 + 21,
        routeId: "eddyville-des-moines",
    }, "Driving to Des Moines", "Iowa", "episode-4"),
    place("sam-amy-des-moines-rest", "sam-amy", 26 * 60 + 21, locations.desMoines, "Des Moines", "Des Moines, IA", "episode-4"),
    movement("sam-amy-des-moines-to-north-sioux", "sam-amy", 29 * 60 + 9, locations.desMoines, {
        mode: "driving",
        to: locations.northSiouxDollarGeneral,
        originLabel: "Des Moines",
        destinationLabel: "North Sioux City",
        arrivalAt: 51 * 60 + 24,
        routeId: "des-moines-north-sioux-dollar-general",
    }, "Driving to South Dakota", "Iowa", "episode-4"),
    place("sam-amy-north-sioux-dollar-general", "sam-amy", 51 * 60 + 24, locations.northSiouxDollarGeneral, "Dollar General", "North Sioux City, SD", "episode-4"),
    movement("sam-amy-to-duel-arena", "sam-amy", 52 * 60 + 2, locations.northSiouxDollarGeneral, {
        mode: "driving",
        to: locations.duelArena,
        originLabel: "Dollar General",
        destinationLabel: "Duel Arena",
        arrivalAt: 52 * 60 + 16,
        routeId: "north-sioux-dollar-general-duel-arena",
    }, "Finding a place to duel", "North Sioux City, SD", "episode-4"),
    place("sam-amy-duel-arena", "sam-amy", 52 * 60 + 16, locations.duelArena, "Duel Arena", "North Sioux City, SD", "episode-4"),
    movement("sam-amy-north-sioux-to-minneapolis", "sam-amy", 1 * 60 + 26, locations.duelArena, {
        mode: "driving",
        to: locations.msp,
        originLabel: "North Sioux City",
        destinationLabel: "Minneapolis",
        arrivalAt: 45 * 60 + 24,
        routeId: "north-sioux-minneapolis-msp",
    }, "Driving to Minneapolis", "Iowa", "episode-5"),
    place("sam-amy-msp-arrival", "sam-amy", 45 * 60 + 24, locations.msp, "Minneapolis-St. Paul Airport", "Minneapolis–St. Paul, MN", "episode-5"),
];

const benAdamEvents: TrackerEvent[] = [
    place("ben-adam-central-park", "ben-adam", 0, locations.centralPark, "Central Park", "New York, NY"),
    movement("ben-adam-to-lga", "ben-adam", 3 * 60 + 47, locations.centralPark, {
        mode: "public-transit",
        to: locations.lgaTerminalC,
        originLabel: "Central Park",
        destinationLabel: "LGA Terminal C",
        arrivalAt: 7 * 60 + 5,
        routeId: "nyc-lga-c",
    }, "Public transport to LGA", "New York, NY"),
    place("ben-adam-lga", "ben-adam", 7 * 60 + 5, locations.lgaTerminalC, "LGA Terminal C", "New York, NY"),
    movement("ben-adam-lga-mem", "ben-adam", 10 * 60 + 43, locations.lgaTerminalC, {
        mode: "flight",
        to: locations.mem,
        originLabel: "LGA",
        destinationLabel: "MEM",
        arrivalAt: 13 * 60 + 47,
        flight: { from: "LGA", to: "MEM" },
    }, "Flight from LGA to MEM", "In the air"),
    place("ben-adam-mem-arrival", "ben-adam", 13 * 60 + 47, locations.mem, "Memphis Airport", "Memphis, TN"),
    movement("ben-adam-to-hattie-bs", "ben-adam", 15 * 60 + 59, locations.mem, {
        mode: "driving",
        to: locations.hattieBs,
        originLabel: "Memphis Airport",
        destinationLabel: "Hattie B’s",
        arrivalAt: 19 * 60 + 8,
        routeId: "mem-hattie",
    }, "Drive to Hattie B's", "Memphis, TN"),
    place("ben-adam-hattie-bs", "ben-adam", 19 * 60 + 8, locations.hattieBs, "Hattie B’s", "Memphis, TN"),
    movement("ben-adam-to-river-park", "ben-adam", 37 * 60 + 24, locations.hattieBs, {
        mode: "driving",
        to: locations.hernandoDeSotoPark,
        originLabel: "Hattie B’s",
        destinationLabel: "Hernando DeSoto River Park",
        arrivalAt: 42 * 60 + 22,
        routeId: "hattie-river-park",
    }, "Drive to Hernando DeSoto River Park", "Interstate Roadtrip"),
    place("ben-adam-river-park", "ben-adam", 42 * 60 + 22, locations.hernandoDeSotoPark, "Hernando DeSoto River Park", "Lake Cormorant, MS"),
    movement("ben-adam-leave-river-park", "ben-adam", 53 * 60 + 17, locations.hernandoDeSotoPark, {
        mode: "driving",
        to: locations.wallsPullOver,
        originLabel: "Hernando DeSoto River Park",
        destinationLabel: "Memphis Airport",
        arrivalAt: 54 * 60 + 6,
        routeId: "river-park-mem",
        positionProgressAtArrival: getClosestProgress(
            [...trackerRoutePaths["river-park-mem"]],
            locations.wallsPullOver,
        ),
    }, "Drive towards Memphis Airport", "Interstate Roadtrip"),
    place("ben-adam-pull-over", "ben-adam", 54 * 60 + 6, locations.wallsPullOver, "Pulled over", "Mississippi"),
    movement("ben-adam-walls-to-alabama", "ben-adam", 1 * 60 + 25, locations.wallsPullOver, {
        mode: "driving",
        to: locations.mississippiAlabamaBorder,
        originLabel: "Walls, MS",
        destinationLabel: "Alabama border",
        arrivalAt: 7 * 60,
        routeId: "walls-alabama-border",
    }, "Driving towards Atlanta", "Interstate Roadtrip", "episode-2"),
    movement("ben-adam-crossing-into-alabama", "ben-adam", 7 * 60, locations.mississippiAlabamaBorder, {
        mode: "driving",
        to: locations.birmingham,
        originLabel: "Mississippi border",
        destinationLabel: "Birmingham",
        arrivalAt: 17 * 60 + 44,
        routeId: "alabama-border-birmingham",
    }, "Crossing the Mississippi–Alabama border", "Interstate Roadtrip", "episode-2"),
    place("ben-adam-birmingham-overnight", "ben-adam", 17 * 60 + 44, locations.birmingham, "Overnight stop", "Near Birmingham, AL", "episode-2"),
    movement("ben-adam-birmingham-to-georgia", "ben-adam", 19 * 60 + 30, locations.birmingham, {
        mode: "driving",
        to: locations.alabamaGeorgiaBorder,
        originLabel: "Birmingham",
        destinationLabel: "Georgia border",
        arrivalAt: 21 * 60 + 1,
        routeId: "birmingham-georgia-border",
    }, "Driving towards Atlanta", "Interstate Roadtrip", "episode-2"),
    movement("ben-adam-crossing-into-georgia", "ben-adam", 21 * 60 + 1, locations.alabamaGeorgiaBorder, {
        mode: "driving",
        to: locations.westGeorgia,
        originLabel: "Alabama border",
        destinationLabel: "West Georgia",
        arrivalAt: 22 * 60 + 16,
        routeId: "georgia-border-east",
    }, "Crossing the Alabama–Georgia border", "Interstate Roadtrip", "episode-2"),
    movement("ben-adam-change-destination-villa-rica", "ben-adam", 22 * 60 + 16, locations.westGeorgia, {
        mode: "driving",
        to: locations.villaRicaMural,
        originLabel: "West Georgia",
        destinationLabel: "Villa Rica",
        arrivalAt: 26 * 60 + 44,
        routeId: "georgia-line-villa-rica",
    }, "Driving to Villa Rica", "Destination changed", "episode-2"),
    place("ben-adam-villa-rica-mural", "ben-adam", 26 * 60 + 44, locations.villaRicaMural, "Coca-Cola ghost mural", "Villa Rica, GA", "episode-2"),
    movement("ben-adam-villa-rica-to-atlanta", "ben-adam", 35 * 60 + 34, locations.villaRicaMural, {
        mode: "driving",
        to: locations.worldOfCocaCola,
        originLabel: "Villa Rica",
        destinationLabel: "Atlanta",
        arrivalAt: 36 * 60 + 20,
        routeId: "villa-rica-world-of-coca-cola",
    }, "Driving to Atlanta", "Georgia", "episode-2"),
    place("ben-adam-world-of-coca-cola", "ben-adam", 36 * 60 + 20, locations.worldOfCocaCola, "Kill time at the World of Coca-Cola", "Atlanta, GA", "episode-2"),
    movement("ben-adam-world-of-coca-cola-to-atl", "ben-adam", 38 * 60 + 54, locations.worldOfCocaCola, {
        mode: "driving",
        to: locations.atl,
        originLabel: "World of Coca-Cola",
        destinationLabel: "ATL Airport",
        arrivalAt: 41 * 60,
        routeId: "world-of-coca-cola-atl",
    }, "Driving to ATL Airport", "Atlanta, GA", "episode-2"),
    place("ben-adam-atl-airport", "ben-adam", 41 * 60, locations.atl, "Atlanta Hartsfield-Jackson Airport", "Atlanta, GA", "episode-2"),
    movement("ben-adam-atl-stl", "ben-adam", 47 * 60 + 14, locations.atl, {
        mode: "flight",
        to: locations.stl,
        originLabel: "ATL",
        destinationLabel: "STL",
        arrivalAt: EPISODE_TWO_TRACKER_END,
        flight: { from: "ATL", to: "STL" },
        positionProgressAtArrival: 0.35,
    }, "Flight from ATL to STL", "In the air", "episode-2"),
    movement("ben-adam-atl-stl-episode-three", "ben-adam", EPISODE_THREE_TRACKER_START, locations.atl, {
        mode: "flight",
        to: locations.stl,
        originLabel: "ATL",
        destinationLabel: "STL",
        arrivalAt: 1 * 60 + 55,
        flight: { from: "ATL", to: "STL" },
        positionProgressAtDeparture: 0.35,
    }, "Flight from ATL to STL", "In the air", "episode-3"),
    place("ben-adam-stl-arrival", "ben-adam", 1 * 60 + 55, locations.stl, "St. Louis Lambert Airport", "St. Louis, MO", "episode-3"),
    movement("ben-adam-stl-to-gateway-arch", "ben-adam", 4 * 60 + 5, locations.stl, {
        mode: "rideshare",
        to: locations.gatewayArch,
        originLabel: "STL Airport",
        destinationLabel: "Gateway Arch",
        arrivalAt: 5 * 60 + 13,
        routeId: "stl-gateway-arch",
    }, "Rideshare to Gateway Arch", "St. Louis, MO", "episode-3"),
    place("ben-adam-gateway-arch", "ben-adam", 5 * 60 + 13, locations.gatewayArch, "Gateway Arch", "St. Louis, MO", "episode-3"),
    status("ben-adam-downtown-st-louis", "ben-adam", 8 * 60 + 50, locations.gatewayArch, "Downtown St. Louis", "St. Louis, MO", "episode-3"),
    movement("ben-adam-st-louis-to-paducah", "ben-adam", 18 * 60 + 54, locations.gatewayArch, {
        mode: "driving",
        to: locations.paducahDistillery,
        originLabel: "St. Louis",
        destinationLabel: "Paducah",
        arrivalAt: 24 * 60 + 6,
        routeId: "st-louis-paducah",
    }, "Driving to Paducah", "Interstate Roadtrip", "episode-3"),
    status("ben-adam-paducah-distillery", "ben-adam", 24 * 60 + 6, locations.paducahDistillery, "Ben gets drunk, again", "Paducah, KY", "episode-3"),
    status("ben-adam-paducah-evening", "ben-adam", 26 * 60 + 29, locations.paducahDistillery, "Lovely little (drunk) evening in Paducah", "Paducah, KY", "episode-3"),
    status("ben-adam-snack-zone", "ben-adam", 27 * 60 + 44, locations.paducahDistillery, "Snack Zone After Hours", "Paducah, KY", "episode-3"),
    status("ben-adam-paducah-evening-resume", "ben-adam", 28 * 60 + 10, locations.paducahDistillery, "Lovely little (drunk) evening in Paducah", "Paducah, KY", "episode-3"),
    status("ben-adam-hungover", "ben-adam", 29 * 60 + 47, locations.paducahDistillery, "Hungover Ben", "Paducah, KY", "episode-3"),
    status("ben-adam-exploring-paducah", "ben-adam", 34 * 60 + 16, locations.paducahDistillery, "Exploring Paducah’s cute downtown", "Paducah, KY", "episode-3"),
    movement("ben-adam-paducah-to-stl", "ben-adam", 35 * 60 + 31, locations.paducahDistillery, {
        mode: "driving",
        to: locations.stl,
        originLabel: "Paducah",
        destinationLabel: "STL Airport",
        arrivalAt: 40 * 60 + 31,
        routeId: "paducah-stl",
    }, "Driving to STL Airport", "Interstate Roadtrip", "episode-3"),
    place("ben-adam-back-at-stl", "ben-adam", 40 * 60 + 31, locations.stl, "St. Louis Lambert Airport", "St. Louis, MO", "episode-3"),
    movement("ben-adam-stl-dca", "ben-adam", 1 * 60 + 39, locations.stl, {
        mode: "flight",
        to: locations.dca,
        originLabel: "STL",
        destinationLabel: "DCA",
        arrivalAt: 6 * 60 + 15,
        flight: { from: "STL", to: "DCA" },
    }, "Flight from STL to DCA", "In the air", "episode-4"),
    place("ben-adam-dca-arrival", "ben-adam", 6 * 60 + 15, locations.dca, "Reagan National Airport", "Arlington, VA", "episode-4"),
    movement("ben-adam-dca-to-monroe", "ben-adam", 8 * 60 + 41, locations.dca, {
        mode: "driving",
        to: locations.jamesMonroeBirthplace,
        originLabel: "DCA Airport",
        destinationLabel: "James Monroe’s Birthplace",
        arrivalAt: 14 * 60 + 18,
        routeId: "dca-james-monroe-birthplace",
    }, "Driving to Monroe’s Birthplace", "Maryland/Virginia", "episode-4"),
    place("ben-adam-james-monroe-birthplace", "ben-adam", 14 * 60 + 18, locations.jamesMonroeBirthplace, "James Monroe’s Birthplace", "Colonial Beach, VA", "episode-4"),
    movement("ben-adam-monroe-to-dca", "ben-adam", 20 * 60 + 27, locations.jamesMonroeBirthplace, {
        mode: "driving",
        to: locations.dca,
        originLabel: "James Monroe’s Birthplace",
        destinationLabel: "DCA Airport",
        arrivalAt: 24 * 60 + 45,
        routeId: "james-monroe-birthplace-dca",
    }, "Driving to DCA Airport", "Maryland/Virginia", "episode-4"),
    place("ben-adam-back-at-dca", "ben-adam", 24 * 60 + 45, locations.dca, "Reagan National Airport", "Arlington, VA", "episode-4"),
    movement("ben-adam-dca-to-union-station", "ben-adam", 24 * 60 + 58, locations.dca, {
        mode: "subway",
        to: locations.washingtonUnionStation,
        originLabel: "DCA Airport",
        destinationLabel: "Washington Union Station",
        arrivalAt: 25 * 60 + 5,
        routeId: "dca-union-station-wmata",
    }, "WMATA to Union Station", "Washington, DC", "episode-4"),
    place("ben-adam-washington-union-station", "ben-adam", 25 * 60 + 5, locations.washingtonUnionStation, "Washington Union Station", "Washington, DC", "episode-4"),
    movement("ben-adam-nec-to-baltimore", "ben-adam", 29 * 60 + 25, locations.washingtonUnionStation, {
        mode: "commuter-rail",
        to: locations.baltimorePennStation,
        originLabel: "Washington Union Station",
        destinationLabel: "Baltimore Penn Station",
        arrivalAt: 33 * 60 + 48,
        routeId: "washington-union-baltimore-penn",
    }, "Northeast Corridor Train to Baltimore", "Intercity rail", "episode-4"),
    place("ben-adam-baltimore-penn", "ben-adam", 33 * 60 + 48, locations.baltimorePennStation, "Baltimore Penn Station", "Baltimore, MD", "episode-4"),
    movement("ben-adam-bus-to-inner-harbor", "ben-adam", 34 * 60 + 46, locations.baltimorePennStation, {
        mode: "public-transit",
        to: locations.baltimoreInnerHarbor,
        originLabel: "Baltimore Penn Station",
        destinationLabel: "Inner Harbor",
        arrivalAt: 36 * 60 + 29,
        routeId: "baltimore-penn-inner-harbor",
    }, "Bus to Inner Harbor", "Baltimore, MD", "episode-4"),
    place("ben-adam-inner-harbor", "ben-adam", 36 * 60 + 29, locations.baltimoreInnerHarbor, "Inner Harbor", "Baltimore, MD", "episode-4"),
    status("ben-adam-water-taxi", "ben-adam", 42 * 60 + 44, locations.baltimoreWaterTaxi, "Water Taxi", "Baltimore Harbor, MD", "episode-4"),
    place("ben-adam-fells-point", "ben-adam", 50 * 60 + 41, locations.fellsPoint, "Fell’s Point", "Baltimore, MD", "episode-4"),
    movement("ben-adam-fells-point-to-penn", "ben-adam", 51 * 60 + 18, locations.fellsPoint, {
        mode: "public-transit",
        to: locations.baltimorePennStation,
        originLabel: "Fell’s Point",
        destinationLabel: "Baltimore Penn Station",
        arrivalAt: 55 * 60 + 37,
        routeId: "fells-point-baltimore-penn",
    }, "Bus back to Baltimore Penn Station", "Baltimore, MD", "episode-4"),
    place("ben-adam-back-at-baltimore-penn", "ben-adam", 55 * 60 + 37, locations.baltimorePennStation, "Baltimore Penn Station", "Baltimore, MD", "episode-4"),
    movement("ben-adam-baltimore-to-philadelphia", "ben-adam", 1 * 60 + 43, locations.baltimorePennStation, {
        mode: "commuter-rail",
        to: locations.philadelphia30thStreet,
        originLabel: "Baltimore Penn Station",
        destinationLabel: "30th Street Station",
        arrivalAt: 8 * 60 + 7,
        routeId: "baltimore-penn-philadelphia-30th",
    }, "Northeast Corridor Train to Philadelphia", "Intercity rail", "episode-5"),
    place("ben-adam-philadelphia-30th", "ben-adam", 8 * 60 + 7, locations.philadelphia30thStreet, "30th Street Station", "Philadelphia, PA", "episode-5"),
    movement("ben-adam-philadelphia-target", "ben-adam", 8 * 60 + 22, locations.philadelphia30thStreet, {
        mode: "rideshare",
        to: locations.philadelphiaTarget,
        originLabel: "30th Street Station",
        destinationLabel: "Target",
        arrivalAt: 8 * 60 + 58,
        routeId: "philadelphia-30th-target",
    }, "Rideshare to Target", "Philadelphia, PA", "episode-5"),
    place("ben-adam-philadelphia-target-arrival", "ben-adam", 8 * 60 + 58, locations.philadelphiaTarget, "Target", "Philadelphia, PA", "episode-5"),
    movement("ben-adam-walk-to-van-colln", "ben-adam", 9 * 60 + 36, locations.philadelphiaTarget, {
        mode: "walking",
        to: locations.vanCollnField,
        originLabel: "Target",
        destinationLabel: "Van Colln Memorial Field",
        arrivalAt: 10 * 60 + 40,
        routeId: "philadelphia-target-van-colln-field",
    }, "Walking to Van Colln Memorial Field", "Philadelphia, PA", "episode-5"),
    place("ben-adam-van-colln-field", "ben-adam", 10 * 60 + 40, locations.vanCollnField, "Van Colln Memorial Field", "Philadelphia, PA", "episode-5"),
    movement("ben-adam-van-colln-to-phl", "ben-adam", 18 * 60 + 54, locations.vanCollnField, {
        mode: "rideshare",
        to: locations.phlTerminalAWest,
        originLabel: "Van Colln Memorial Field",
        destinationLabel: "Philadelphia Int’l Airport",
        arrivalAt: 20 * 60 + 20,
        routeId: "van-colln-field-phl",
    }, "Rideshare to PHL Airport", "Philadelphia, PA", "episode-5"),
    place("ben-adam-phl-arrival", "ben-adam", 20 * 60 + 20, locations.phlTerminalAWest, "Philadelphia Int’l Airport", "Philadelphia, PA", "episode-5"),
    status("ben-adam-snake-zone", "ben-adam", 23 * 60 + 15, locations.phlTerminalAWest, "Snake Zone between Terminal A West and East", "Philadelphia Int’l Airport", "episode-5"),
    status("ben-adam-snake-zone-end", "ben-adam", 23 * 60 + 43, locations.phlTerminalAWest, "Philadelphia Int’l Airport", "Philadelphia, PA", "episode-5"),
    movement("ben-adam-phl-to-30th-septa", "ben-adam", 33 * 60 + 57, locations.phlTerminalAWest, {
        mode: "commuter-rail",
        to: locations.philadelphia30thStreet,
        originLabel: "Philadelphia Int’l Airport",
        destinationLabel: "30th Street Station",
        arrivalAt: 35 * 60 + 43,
        routeId: "phl-30th-septa",
    }, "SEPTA Airport Line to 30th Street Station", "Philadelphia, PA", "episode-5"),
    place("ben-adam-back-at-philadelphia-30th", "ben-adam", 35 * 60 + 43, locations.philadelphia30thStreet, "30th Street Station", "Philadelphia, PA", "episode-5"),
    movement("ben-adam-philadelphia-to-new-york", "ben-adam", 36 * 60 + 28, locations.philadelphia30thStreet, {
        mode: "commuter-rail",
        to: locations.newYorkPennStation,
        originLabel: "30th Street Station",
        destinationLabel: "New York Penn Station",
        arrivalAt: 39 * 60 + 25,
        routeId: "philadelphia-30th-new-york-penn",
    }, "Northeast Corridor Train to New York", "Intercity rail", "episode-5"),
    place("ben-adam-new-york-penn", "ben-adam", 39 * 60 + 25, locations.newYorkPennStation, "New York Penn Station", "New York, NY", "episode-5"),
    movement("ben-adam-walk-to-empire-state", "ben-adam", 39 * 60 + 35, locations.newYorkPennStation, {
        mode: "walking",
        to: locations.empireStateBuilding,
        originLabel: "New York Penn Station",
        destinationLabel: "Empire State Building",
        arrivalAt: 39 * 60 + 47,
        routeId: "new-york-penn-empire-state",
    }, "Walking to Empire State Building", "New York, NY", "episode-5"),
    place("ben-adam-empire-state-building", "ben-adam", 39 * 60 + 47, locations.empireStateBuilding, "Empire State Building", "New York, NY", "episode-5"),
    movement("ben-adam-empire-state-to-hertz", "ben-adam", 44 * 60 + 9, locations.empireStateBuilding, {
        mode: "walking",
        to: locations.hertzWest34th,
        originLabel: "Empire State Building",
        destinationLabel: "Hertz",
        arrivalAt: 45 * 60 + 10,
        routeId: "empire-state-hertz",
    }, "Walking to Hertz", "New York, NY", "episode-5"),
    place("ben-adam-hertz", "ben-adam", 45 * 60 + 10, locations.hertzWest34th, "Hertz", "New York, NY", "episode-5"),
];

const trackerEvents: Record<TeamId, TrackerEvent[]> = {
    "sam-amy": samAmyEvents,
    "ben-adam": benAdamEvents,
};

function place(
    id: string,
    team: TeamId,
    at: number,
    coordinate: Coordinate,
    name: string,
    placeName: string,
    episode: EpisodeSlug = "episode-1",
): TrackerEvent {
    return {
        id,
        team,
        episode,
        at,
        coordinate,
        status: { primary: name, secondary: placeName },
    };
}

function movement(
    id: string,
    team: TeamId,
    at: number,
    coordinate: Coordinate,
    travel: Travel,
    primary: string,
    secondary: string,
    episode: EpisodeSlug = "episode-1",
): TrackerEvent {
    return {
        id,
        team,
        episode,
        at,
        coordinate,
        status: { primary, secondary },
        travel,
    };
}

function status(
    id: string,
    team: TeamId,
    at: number,
    coordinate: Coordinate,
    primary: string,
    secondary: string,
    episode: EpisodeSlug,
): TrackerEvent {
    return {
        id,
        team,
        episode,
        at,
        coordinate,
        status: { primary, secondary },
    };
}

function isVisible(event: TrackerEvent, episodeSlug: string, currentTime: number) {
    return compareTimestamps(
        seasonEighteen,
        event,
        { episode: episodeSlug, at: currentTime },
    ) <= 0;
}

function getProgress(event: TrackerEvent, currentTime: number) {
    if (!event.travel) return 0;
    return Math.min(
        1,
        Math.max(
            0,
            (currentTime - event.at)
                / (event.travel.arrivalAt - event.at),
        ),
    );
}

function getClosestProgress(path: Coordinate[], target: Coordinate) {
    const segmentLengths = path.slice(1).map((point, index) =>
        Math.hypot(point[0] - path[index][0], point[1] - path[index][1]));
    const totalLength = segmentLengths.reduce((total, length) => total + length, 0);
    let traveled = 0;
    let closestProgress = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    segmentLengths.forEach((length, index) => {
        const start = path[index];
        const end = path[index + 1];
        const deltaLongitude = end[0] - start[0];
        const deltaLatitude = end[1] - start[1];
        const lengthSquared = deltaLongitude ** 2 + deltaLatitude ** 2;
        const projection = lengthSquared === 0
            ? 0
            : Math.min(1, Math.max(0, (
                (target[0] - start[0]) * deltaLongitude
                + (target[1] - start[1]) * deltaLatitude
            ) / lengthSquared));
        const projectedPoint: Coordinate = [
            start[0] + deltaLongitude * projection,
            start[1] + deltaLatitude * projection,
        ];
        const distance = Math.hypot(
            projectedPoint[0] - target[0],
            projectedPoint[1] - target[1],
        );
        if (distance < closestDistance) {
            closestDistance = distance;
            closestProgress = totalLength === 0
                ? 0
                : (traveled + length * projection) / totalLength;
        }
        traveled += length;
    });

    return closestProgress;
}

function interpolateProgress(
    currentTime: number,
    startAt: number,
    endAt: number,
    startProgress: number,
    endProgress: number,
) {
    if (currentTime <= startAt) return startProgress;
    if (currentTime >= endAt) return endProgress;
    const progress = (currentTime - startAt) / (endAt - startAt);
    return startProgress + (endProgress - startProgress) * progress;
}

// Both teams use the same C and E trains after meeting at 72 St. Ben & Adam
// then board the first Q70, while Sam & Amy wait at Jackson Heights for the
// following bus. These are video-timeline milestones, not schedule times.
function getLgaProgress(event: TrackerEvent, currentTime: number) {
    if (!event.travel?.routeId) return 0;
    const path = [...trackerRoutePaths[event.travel.routeId]];
    const seventySecondStreetProgress = getClosestProgress(
        path,
        locations.seventySecondStreet,
    );
    const jacksonHeightsProgress = getClosestProgress(
        path,
        locations.jacksonHeightsRoosevelt,
    );
    const leaveSeventySecondStreet = 4 * 60 + 37;
    const arriveAtJacksonHeights = 5 * 60 + 5;
    const q70Departure = event.team === "ben-adam"
        ? 6 * 60 + 4
        : 6 * 60 + 25;
    const time = clampTrackerTime(event.episode, currentTime);

    if (time <= leaveSeventySecondStreet) {
        return interpolateProgress(
            time,
            event.at,
            leaveSeventySecondStreet,
            0,
            seventySecondStreetProgress,
        );
    }
    if (time <= arriveAtJacksonHeights) {
        return interpolateProgress(
            time,
            leaveSeventySecondStreet,
            arriveAtJacksonHeights,
            seventySecondStreetProgress,
            jacksonHeightsProgress,
        );
    }
    if (time <= q70Departure) return jacksonHeightsProgress;

    return interpolateProgress(
        time,
        q70Departure,
        event.travel.arrivalAt,
        jacksonHeightsProgress,
        1,
    );
}

function getMetraProgress(currentTime: number) {
    const path = [...trackerRoutePaths["metra-up-nw"]];
    const milestones = [
        [23 * 60 + 24, locations.cumberlandMetra],
        [27 * 60 + 26, locations.desPlainesMetra],
        [27 * 60 + 53, locations.desPlainesMetra],
        [31 * 60 + 32, locations.deeRoadMetra],
        [31 * 60 + 35, locations.deeRoadMetra],
        [32 * 60 + 39, locations.parkRidgeMetra],
        [32 * 60 + 49, locations.parkRidgeMetra],
        [34 * 60 + 32, locations.edisonParkMetra],
        [34 * 60 + 34, locations.edisonParkMetra],
        [37 * 60 + 33, locations.jeffersonParkMetra],
    ] as const;
    const time = clampTrackerTime("episode-1", currentTime);
    const nextIndex = milestones.findIndex(([at]) => at >= time);
    if (nextIndex <= 0) return 0;
    if (nextIndex === -1) return 1;

    const [previousAt, previousCoordinate] = milestones[nextIndex - 1];
    const [nextAt, nextCoordinate] = milestones[nextIndex];
    const segmentProgress = nextAt === previousAt
        ? 1
        : (time - previousAt) / (nextAt - previousAt);
    const previousProgress = getClosestProgress(path, previousCoordinate);
    const nextProgress = getClosestProgress(path, nextCoordinate);
    return previousProgress + (nextProgress - previousProgress) * segmentProgress;
}

function getDetroitWindsorProgress(path: Coordinate[], currentTime: number) {
    const milestones = [
        [4 * 60 + 58, locations.dtw],
        [8 * 60 + 6, locations.detroitWindsorTunnelBorder],
        [8 * 60 + 30, locations.windsorCityHall],
    ] as const;
    const time = clampTrackerTime("episode-2", currentTime);
    const nextIndex = milestones.findIndex(([at]) => at >= time);
    if (nextIndex <= 0) return 0;
    if (nextIndex === -1) return 1;

    const [previousAt, previousCoordinate] = milestones[nextIndex - 1];
    const [nextAt, nextCoordinate] = milestones[nextIndex];
    const segmentProgress = nextAt === previousAt
        ? 1
        : (time - previousAt) / (nextAt - previousAt);
    const previousProgress = getClosestProgress(path, previousCoordinate);
    const nextProgress = getClosestProgress(path, nextCoordinate);
    return previousProgress + (nextProgress - previousProgress) * segmentProgress;
}

function getWindsorDetroitProgress(path: Coordinate[], currentTime: number) {
    const milestones = [
        [16 * 60 + 42, locations.windsorCityHall],
        [17 * 60 + 15, locations.ambassadorBridge],
        [17 * 60 + 32, locations.dtw],
    ] as const;
    const time = clampTrackerTime("episode-2", currentTime);
    const nextIndex = milestones.findIndex(([at]) => at >= time);
    if (nextIndex <= 0) return 0;
    if (nextIndex === -1) return 1;

    const [previousAt, previousCoordinate] = milestones[nextIndex - 1];
    const [nextAt, nextCoordinate] = milestones[nextIndex];
    const segmentProgress = nextAt === previousAt
        ? 1
        : (time - previousAt) / (nextAt - previousAt);
    const previousProgress = getClosestProgress(path, previousCoordinate);
    const nextProgress = getClosestProgress(path, nextCoordinate);
    return previousProgress + (nextProgress - previousProgress) * segmentProgress;
}

function getBostonMerrimackProgress(path: Coordinate[], currentTime: number) {
    const milestones = [
        [40 * 60 + 31, locations.bos],
        [43 * 60 + 22, locations.massachusettsNewHampshireBorder],
        [43 * 60 + 56, locations.londonderryHomeDepot],
        [47 * 60 + 52, locations.londonderryHomeDepot],
        [48 * 60 + 39, locations.merrimackCoveredBridge],
    ] as const;
    const time = clampTrackerTime("episode-2", currentTime);
    const nextIndex = milestones.findIndex(([at]) => at >= time);
    if (nextIndex <= 0) return 0;
    if (nextIndex === -1) return 1;

    const [previousAt, previousCoordinate] = milestones[nextIndex - 1];
    const [nextAt, nextCoordinate] = milestones[nextIndex];
    const segmentProgress = nextAt === previousAt
        ? 1
        : (time - previousAt) / (nextAt - previousAt);
    const previousProgress = getClosestProgress(path, previousCoordinate);
    const nextProgress = getClosestProgress(path, nextCoordinate);
    return previousProgress + (nextProgress - previousProgress) * segmentProgress;
}

function getEpisodeThreeBostonProgress(path: Coordinate[], currentTime: number) {
    const milestones = [
        [1 * 60 + 43, locations.merrimackCoveredBridge],
        [3 * 60 + 21, locations.newHampshireMassachusettsI93Border],
        [4 * 60 + 45, locations.boston],
        [4 * 60 + 59, locations.boston],
        [6 * 60 + 11, locations.boston],
        [10 * 60 + 38, locations.paulReverePark],
    ] as const;
    return getMilestoneProgress(
        path,
        milestones,
        clampTrackerTime("episode-3", currentTime),
    );
}

function getEpisodeThreePaducahProgress(path: Coordinate[], currentTime: number) {
    const milestones = [
        [18 * 60 + 54, locations.gatewayArch],
        [20 * 60 + 17, locations.rendLake],
        [22 * 60 + 38, locations.irvinCobbBridge],
        [23 * 60 + 2, locations.kentuckyAfterBridge],
        [24 * 60 + 6, locations.paducahDistillery],
    ] as const;
    return getMilestoneProgress(
        path,
        milestones,
        clampTrackerTime("episode-3", currentTime),
    );
}

function getMilestoneProgress(
    path: Coordinate[],
    milestones: readonly (readonly [number, Coordinate])[],
    time: number,
) {
    const nextIndex = milestones.findIndex(([at]) => at >= time);
    if (nextIndex <= 0) return getClosestProgress(path, milestones[0][1]);
    if (nextIndex === -1) return 1;

    const [previousAt, previousCoordinate] = milestones[nextIndex - 1];
    const [nextAt, nextCoordinate] = milestones[nextIndex];
    const segmentProgress = nextAt === previousAt
        ? 1
        : (time - previousAt) / (nextAt - previousAt);
    const previousProgress = getClosestProgress(path, previousCoordinate);
    const nextProgress = getClosestProgress(path, nextCoordinate);
    return previousProgress + (nextProgress - previousProgress) * segmentProgress;
}

function getEpisodeFiveLakeName(time: number) {
    const lakeStops = [
        [11 * 60 + 34, 12 * 60 + 5, "Okabena Lake"],
        [13 * 60 + 19, 13 * 60 + 43, "Timber Lake"],
        [14 * 60 + 22, 14 * 60 + 58, "Cottonwood Lake"],
        [19 * 60 + 43, 20 * 60 + 14, "Bingham Lake"],
        [21 * 60 + 21, 22 * 60 + 3, "Saint James Lake"],
        [24 * 60 + 43, 24 * 60 + 53, "Fedje Lake"],
        [25 * 60 + 20, 25 * 60 + 35, "Lake Crystal"],
        [25 * 60 + 56, 26 * 60 + 7, "Loon Lake"],
        [27 * 60 + 42, 28 * 60 + 30, "Mills Lake"],
        [29 * 60 + 34, 34 * 60 + 14, "Lake Dorothy"],
    ] as const;
    return lakeStops.find(([startAt, endAt]) => time >= startAt && time < endAt)?.[2];
}

function joinRoutePaths(...paths: readonly (readonly Coordinate[])[]) {
    return paths.flatMap((path, index) => index === 0 ? [...path] : path.slice(1));
}

function sliceRouteFrom(path: Coordinate[], origin: Coordinate) {
    const originIndex = path.reduce((closestIndex, coordinate, index) => {
        const closest = path[closestIndex];
        const closestDistance = Math.hypot(
            closest[0] - origin[0],
            closest[1] - origin[1],
        );
        const distance = Math.hypot(
            coordinate[0] - origin[0],
            coordinate[1] - origin[1],
        );
        return distance < closestDistance ? index : closestIndex;
    }, 0);
    return [origin, ...path.slice(originIndex + 1)];
}

function getBenAdamRoadtripPath(destination: "atlanta" | "villa-rica") {
    const riverParkToMemphis = [...trackerRoutePaths["river-park-mem"]];
    const riverParkToPullOver = cropPath(
        riverParkToMemphis,
        getClosestProgress(riverParkToMemphis, locations.wallsPullOver),
    );
    const pathToWestGeorgia = joinRoutePaths(
        riverParkToPullOver,
        trackerRoutePaths["walls-alabama-border"],
        trackerRoutePaths["alabama-border-birmingham"],
        trackerRoutePaths["birmingham-georgia-border"],
        trackerRoutePaths["georgia-border-east"],
    );
    const pathToVillaRica = joinRoutePaths(
        pathToWestGeorgia,
        trackerRoutePaths["georgia-line-villa-rica"],
    );

    if (destination === "villa-rica") return pathToVillaRica;

    return joinRoutePaths(
        pathToVillaRica,
        trackerRoutePaths["villa-rica-world-of-coca-cola"],
        trackerRoutePaths["world-of-coca-cola-atl"],
    );
}

function getBenAdamRoadtripProgress(path: Coordinate[], currentTime: number) {
    const milestones = [
        [1 * 60 + 25, locations.wallsPullOver],
        [7 * 60, locations.mississippiAlabamaBorder],
        [17 * 60 + 44, locations.birmingham],
        [19 * 60 + 30, locations.birmingham],
        [21 * 60 + 1, locations.alabamaGeorgiaBorder],
        [22 * 60 + 16, locations.westGeorgia],
        [26 * 60 + 44, locations.villaRicaMural],
    ] as const;
    const time = clampTrackerTime("episode-2", currentTime);
    const nextIndex = milestones.findIndex(([at]) => at >= time);
    if (nextIndex <= 0) return getClosestProgress(path, milestones[0][1]);
    if (nextIndex === -1) return 1;

    const [previousAt, previousCoordinate] = milestones[nextIndex - 1];
    const [nextAt, nextCoordinate] = milestones[nextIndex];
    const segmentProgress = nextAt === previousAt
        ? 1
        : (time - previousAt) / (nextAt - previousAt);
    const previousProgress = getClosestProgress(path, previousCoordinate);
    const nextProgress = getClosestProgress(path, nextCoordinate);
    return previousProgress + (nextProgress - previousProgress) * segmentProgress;
}

export function getPointAlongPath(path: Coordinate[], progress: number): Coordinate {
    if (path.length === 0) return locations.centralPark;
    if (path.length === 1 || progress <= 0) return path[0];
    if (progress >= 1) return path[path.length - 1];

    const lengths = path.slice(1).map((point, index) =>
        Math.hypot(point[0] - path[index][0], point[1] - path[index][1]));
    const totalLength = lengths.reduce((total, length) => total + length, 0);
    const target = totalLength * progress;
    let traveled = 0;

    for (let index = 0; index < lengths.length; index += 1) {
        const length = lengths[index];
        if (traveled + length < target) {
            traveled += length;
            continue;
        }
        const amount = length === 0 ? 1 : (target - traveled) / length;
        return [
            path[index][0] + (path[index + 1][0] - path[index][0]) * amount,
            path[index][1] + (path[index + 1][1] - path[index][1]) * amount,
        ];
    }
    return path[path.length - 1];
}

export function cropPath(path: Coordinate[], progress: number): Coordinate[] {
    const point = getPointAlongPath(path, progress);
    if (progress <= 0) return [path[0], path[0]];
    if (progress >= 1) return path;

    const lengths = path.slice(1).map((next, index) =>
        Math.hypot(next[0] - path[index][0], next[1] - path[index][1]));
    const totalLength = lengths.reduce((total, length) => total + length, 0);
    const target = totalLength * progress;
    const result: Coordinate[] = [path[0]];
    let traveled = 0;
    for (let index = 0; index < lengths.length; index += 1) {
        if (traveled + lengths[index] < target) {
            result.push(path[index + 1]);
            traveled += lengths[index];
            continue;
        }
        result.push(point);
        break;
    }
    return result;
}

export function getTrackerSnapshot(
    episodeSlug: string,
    currentTime: number,
    team: TeamId,
): TrackerSnapshot {
    const time = clampTrackerTime(episodeSlug, currentTime);
    const events = trackerEvents[team];
    const event = events
        .findLast((candidate) => isVisible(candidate, episodeSlug, time))
        ?? events[0];

    if (
        episodeSlug === "episode-5"
        && team === "sam-amy"
        && time >= 1 * 60 + 26
        && time < 45 * 60 + 24
    ) {
        const lakeName = getEpisodeFiveLakeName(time);
        const strategicDelay = time >= 38 * 60 + 4 && time < 43 * 60 + 55;
        return {
            event: {
                ...event,
                status: {
                    primary: strategicDelay
                        ? "Strategic Delay at the Mall of America"
                        : lakeName ?? (time >= 34 * 60 + 14
                            ? "Driving to MSP Airport"
                            : "Driving to Minneapolis"),
                    secondary: strategicDelay
                        ? "Minneapolis–St. Paul, MN"
                        : time < 9 * 60 + 59 ? "Iowa" : "Minnesota",
                },
            },
            position: event.coordinate,
        };
    }

    if (
        episodeSlug === "episode-4"
        && team === "sam-amy"
        && time >= 5 * 60 + 31
        && time < 17 * 60 + 40
    ) {
        return {
            event: {
                ...event,
                status: {
                    primary: time < 16 * 60
                        ? "Driving to Iowa"
                        : "Driving to Dollar General",
                    secondary: time < 14 * 60 + 3 ? "Missouri" : "Iowa",
                },
            },
            position: event.coordinate,
        };
    }

    if (
        episodeSlug === "episode-4"
        && team === "sam-amy"
        && time >= 21 * 60 + 14
        && time < 22 * 60 + 9
    ) {
        return {
            event: {
                ...event,
                status: {
                    primary: "Searching for Farm Animals",
                    secondary: "Iowa",
                },
            },
            position: event.coordinate,
        };
    }

    if (
        episodeSlug === "episode-4"
        && team === "sam-amy"
        && time >= 29 * 60 + 9
        && time < 51 * 60 + 24
    ) {
        return {
            event: {
                ...event,
                status: {
                    primary: "Driving to South Dakota",
                    secondary: time < 49 * 60 + 18 ? "Iowa" : "South Dakota",
                },
            },
            position: event.coordinate,
        };
    }

    if (
        episodeSlug === "episode-4"
        && team === "ben-adam"
        && time >= 51 * 60 + 18
        && time < 55 * 60 + 37
    ) {
        return {
            event: {
                ...event,
                status: {
                    primary: "Bus back to Baltimore Penn Station",
                    secondary: "Baltimore, MD",
                },
            },
            position: event.coordinate,
        };
    }

    if (
        episodeSlug === "episode-3"
        && team === "sam-amy"
        && time >= 1 * 60 + 43
        && time < 10 * 60 + 38
    ) {
        const isWholeFoodsStop = time >= 4 * 60 + 59 && time < 6 * 60 + 11;
        return {
            event: {
                ...event,
                status: isWholeFoodsStop
                    ? { primary: "Whole Foods", secondary: "Boston, MA" }
                    : time >= 6 * 60 + 11
                        ? { primary: "Driving to Paul Revere Park", secondary: "Boston, MA" }
                        : time >= 4 * 60 + 45
                            ? { primary: "Driving through Boston", secondary: "Boston, MA" }
                            : {
                                primary: "Driving towards Boston",
                                secondary: time < 3 * 60 + 21
                                    ? "New Hampshire"
                                    : "Massachusetts",
                            },
            },
            position: event.coordinate,
        };
    }

    if (
        episodeSlug === "episode-3"
        && team === "ben-adam"
        && time >= 18 * 60 + 54
        && time < 24 * 60 + 6
    ) {
        return {
            event: {
                ...event,
                status: {
                    primary: "Driving to Paducah",
                    secondary: time < 22 * 60 + 38
                        ? "Illinois"
                        : time < 23 * 60 + 2
                            ? "Crossing the Ohio River"
                            : "Kentucky",
                },
            },
            position: event.coordinate,
        };
    }

    if (
        episodeSlug === "episode-2"
        && team === "sam-amy"
        && time >= 4 * 60 + 58
        && time < 8 * 60 + 30
    ) {
        return {
            event: {
                ...event,
                status: {
                    primary: "Driving to Downtown Windsor",
                    secondary: time < 8 * 60 + 6
                        ? "Detroit, MI"
                        : "Windsor, ON",
                },
            },
            position: event.coordinate,
        };
    }

    if (
        episodeSlug === "episode-2"
        && team === "sam-amy"
        && time >= 40 * 60 + 31
        && time < 48 * 60 + 39
    ) {
        const isHomeDepotStop = time >= 43 * 60 + 56
            && time < 47 * 60 + 52;
        return {
            event: {
                ...event,
                status: {
                    primary: isHomeDepotStop
                        ? "Home Depot"
                        : "Driving to Merrimack Covered Bridge",
                    secondary: isHomeDepotStop
                        ? "Londonderry, NH"
                        : time < 43 * 60 + 22
                            ? "Massachusetts"
                            : "New Hampshire",
                },
            },
            position: event.coordinate,
        };
    }

    if (
        episodeSlug === "episode-2"
        && team === "sam-amy"
        && time >= 16 * 60 + 42
        && time < 17 * 60 + 32
    ) {
        return {
            event: {
                ...event,
                status: {
                    primary: "Driving back to DTW Airport",
                    secondary: time < 17 * 60 + 15
                        ? "Windsor, ON"
                        : "Detroit, MI",
                },
            },
            position: event.coordinate,
        };
    }

    if (
        episodeSlug === "episode-2"
        && team === "ben-adam"
        && time >= 1 * 60 + 25
        && time < 26 * 60 + 44
    ) {
        const isRestPeriod = time >= 17 * 60 + 44
            && time < 19 * 60 + 30;
        const state = time < 7 * 60
            ? "Mississippi"
            : time < 21 * 60 + 1
                ? "Alabama"
                : "Georgia";

        return {
            event: {
                ...event,
                status: {
                    primary: isRestPeriod
                        ? "Rest Period in Birmingham"
                        : time >= 22 * 60 + 16
                            ? "Driving to Coca-Cola Mural"
                            : "Driving to Georgia",
                    secondary: isRestPeriod ? "Birmingham, AL" : state,
                },
            },
            position: event.coordinate,
        };
    }

    if (
        episodeSlug === "episode-1"
        && team === "sam-amy"
        && time >= 34 * 60 + 50
        && time < 37 * 60 + 33
    ) {
        return {
            event: {
                ...event,
                status: {
                    ...event.status,
                    primary: "Union Pacific Northwest Train towards Jefferson Park",
                },
            },
            position: event.coordinate,
        };
    }

    return { event, position: event.coordinate };
}

export function getActiveTrajectory(
    episodeSlug: string,
    currentTime: number,
    team: TeamId,
): ActiveTrajectory | null {
    const time = clampTrackerTime(episodeSlug, currentTime);
    if (
        episodeSlug === "episode-5"
        && team === "sam-amy"
        && time >= 1 * 60 + 26
        && time < 45 * 60 + 24
    ) {
        const fullRoute = [...trackerRoutePaths["north-sioux-minneapolis-msp"]];
        const afterLakeDorothy = time >= 34 * 60 + 14;
        const atMallOfAmerica = time >= 38 * 60 + 4;
        const coordinates = atMallOfAmerica
            ? sliceRouteFrom(fullRoute, locations.mallOfAmerica)
            : afterLakeDorothy
                ? sliceRouteFrom(fullRoute, locations.lakeDorothy)
                : fullRoute;
        const milestones = atMallOfAmerica
            ? [
                [38 * 60 + 4, locations.mallOfAmerica],
                [43 * 60 + 55, locations.mallOfAmerica],
                [45 * 60 + 24, locations.msp],
            ] as const
            : afterLakeDorothy
                ? [
                    [34 * 60 + 14, locations.lakeDorothy],
                    [38 * 60 + 4, locations.mallOfAmerica],
                    [43 * 60 + 55, locations.mallOfAmerica],
                    [45 * 60 + 24, locations.msp],
                ] as const
                : [
            [1 * 60 + 26, locations.duelArena],
            [5 * 60 + 5, locations.leMars],
            [9 * 60 + 59, locations.iowaMinnesotaBorder],
            [11 * 60 + 34, locations.okabenaLake],
            [12 * 60 + 5, locations.okabenaLake],
            [13 * 60 + 19, locations.timberLake],
            [13 * 60 + 43, locations.timberLake],
            [14 * 60 + 22, locations.cottonwoodLake],
            [14 * 60 + 58, locations.cottonwoodLake],
            [19 * 60 + 43, locations.binghamLake],
            [20 * 60 + 14, locations.binghamLake],
            [21 * 60 + 21, locations.saintJamesLake],
            [22 * 60 + 3, locations.saintJamesLake],
            [24 * 60 + 43, locations.fedjeLake],
            [24 * 60 + 53, locations.fedjeLake],
            [25 * 60 + 20, locations.lakeCrystal],
            [25 * 60 + 35, locations.lakeCrystal],
            [25 * 60 + 56, locations.loonLake],
            [26 * 60 + 7, locations.loonLake],
            [27 * 60 + 42, locations.millsLake],
            [28 * 60 + 30, locations.millsLake],
            [29 * 60 + 34, locations.lakeDorothy],
            [34 * 60 + 14, locations.lakeDorothy],
            [38 * 60 + 4, locations.mallOfAmerica],
            [43 * 60 + 55, locations.mallOfAmerica],
            [45 * 60 + 24, locations.msp],
        ] as const;
        const progress = getMilestoneProgress(coordinates, milestones, time);
        return {
            id: atMallOfAmerica
                ? "sam-amy-mall-of-america-msp"
                : afterLakeDorothy
                    ? "sam-amy-lake-dorothy-msp"
                    : "sam-amy-north-sioux-minneapolis",
            team,
            kind: "ground",
            coordinates,
            progress,
            positionProgress: progress,
            revealProgressOnly: false,
            originLabel: atMallOfAmerica
                ? "Mall of America"
                : afterLakeDorothy
                    ? "Lake Dorothy"
                    : "North Sioux City",
            destinationLabel: !afterLakeDorothy
                ? "Minneapolis"
                : "Minneapolis-St. Paul Airport",
        };
    }
    if (
        episodeSlug === "episode-4"
        && team === "sam-amy"
        && time >= 5 * 60 + 31
        && time < 17 * 60 + 40
    ) {
        const coordinates = [...trackerRoutePaths["stl-donnellson-dollar-general"]];
        const progress = getMilestoneProgress(coordinates, [
            [5 * 60 + 31, locations.stl],
            [14 * 60 + 3, locations.missouriIowaBorder],
            [17 * 60 + 40, locations.donnellsonDollarGeneral],
        ], time);
        return {
            id: time < 16 * 60
                ? "sam-amy-stl-donnellson"
                : "sam-amy-stl-donnellson-dollar-general",
            team,
            kind: "ground",
            coordinates,
            progress,
            positionProgress: progress,
            revealProgressOnly: false,
            originLabel: "STL Airport",
            destinationLabel: time < 16 * 60 ? "Donnellson" : "Dollar General",
        };
    }

    if (
        episodeSlug === "episode-4"
        && team === "sam-amy"
        && time >= 21 * 60 + 14
        && time < 22 * 60 + 9
    ) {
        const coordinates = [...trackerRoutePaths["donnellson-eddyville"]];
        const progress = interpolateProgress(time, 21 * 60 + 14, 22 * 60 + 9, 0, 1);
        return {
            id: "sam-amy-searching-for-farm-animals",
            team,
            kind: "ground",
            coordinates,
            progress,
            positionProgress: progress,
            revealProgressOnly: true,
            originLabel: "Dollar General",
            destinationLabel: "Des Moines",
            destinationVisible: false,
        };
    }

    if (
        episodeSlug === "episode-4"
        && team === "sam-amy"
        && time >= 29 * 60 + 9
        && time < 51 * 60 + 24
    ) {
        const coordinates = [...trackerRoutePaths["des-moines-north-sioux-dollar-general"]];
        const progress = getMilestoneProgress(coordinates, [
            [29 * 60 + 9, locations.desMoines],
            [49 * 60 + 18, locations.iowaSouthDakotaBorder],
            [51 * 60 + 24, locations.northSiouxDollarGeneral],
        ], time);
        return {
            id: "sam-amy-des-moines-north-sioux",
            team,
            kind: "ground",
            coordinates,
            progress,
            positionProgress: progress,
            revealProgressOnly: false,
            originLabel: "Des Moines",
            destinationLabel: "North Sioux City",
        };
    }

    if (
        episodeSlug === "episode-4"
        && team === "ben-adam"
        && time >= 51 * 60 + 18
        && time < 55 * 60 + 37
    ) {
        const coordinates = [...trackerRoutePaths["fells-point-baltimore-penn"]];
        const progress = getMilestoneProgress(coordinates, [
            [51 * 60 + 18, locations.fellsPoint],
            [53 * 60 + 49, locations.baltimoreAquarium],
            [54 * 60 + 5, locations.baltimoreInnerHarbor],
            [55 * 60 + 37, locations.baltimorePennStation],
        ], time);
        return {
            id: "ben-adam-fells-point-baltimore-penn",
            team,
            kind: "ground",
            coordinates,
            progress,
            positionProgress: progress,
            revealProgressOnly: false,
            originLabel: "Fell’s Point",
            destinationLabel: "Baltimore Penn Station",
        };
    }
    if (
        episodeSlug === "episode-3"
        && team === "sam-amy"
        && time >= 1 * 60 + 43
        && time < 10 * 60 + 38
    ) {
        const coordinates = [...trackerRoutePaths["merrimack-bridge-paul-revere-park"]];
        const progress = getEpisodeThreeBostonProgress(coordinates, time);
        return {
            id: "sam-amy-merrimack-boston",
            team,
            kind: "ground",
            coordinates,
            progress,
            positionProgress: progress,
            revealProgressOnly: false,
            originLabel: "Merrimack Covered Bridge",
            destinationLabel: "Boston",
        };
    }

    if (
        episodeSlug === "episode-3"
        && team === "ben-adam"
        && time >= 18 * 60 + 54
        && time < 24 * 60 + 6
    ) {
        const coordinates = [...trackerRoutePaths["st-louis-paducah"]];
        const progress = getEpisodeThreePaducahProgress(coordinates, time);
        return {
            id: "ben-adam-st-louis-paducah",
            team,
            kind: "ground",
            coordinates,
            progress,
            positionProgress: progress,
            revealProgressOnly: false,
            originLabel: "St. Louis",
            destinationLabel: "Paducah",
        };
    }
    if (
        episodeSlug === "episode-2"
        && team === "sam-amy"
        && time >= 4 * 60 + 58
        && time < 8 * 60 + 30
    ) {
        const coordinates = [...trackerRoutePaths["dtw-windsor-city-hall"]];
        const progress = getDetroitWindsorProgress(coordinates, time);
        return {
            id: "sam-amy-dtw-windsor-city-hall",
            team,
            kind: "ground",
            coordinates,
            progress,
            positionProgress: progress,
            revealProgressOnly: false,
            originLabel: "Detroit Metropolitan Airport",
            destinationLabel: "Downtown Windsor",
        };
    }

    if (
        episodeSlug === "episode-2"
        && team === "sam-amy"
        && time >= 40 * 60 + 31
        && time < 48 * 60 + 39
    ) {
        const coordinates = [
            ...trackerRoutePaths["bos-merrimack-covered-bridge"],
        ];
        const progress = getBostonMerrimackProgress(coordinates, time);
        return {
            id: "sam-amy-bos-merrimack-covered-bridge",
            team,
            kind: "ground",
            coordinates,
            progress,
            positionProgress: progress,
            revealProgressOnly: false,
            originLabel: "Boston Logan Airport",
            destinationLabel: "Merrimack Covered Bridge",
        };
    }

    if (
        episodeSlug === "episode-2"
        && team === "sam-amy"
        && time >= 16 * 60 + 42
        && time < 17 * 60 + 32
    ) {
        const coordinates = joinRoutePaths(
            trackerRoutePaths["windsor-ambassador"],
            trackerRoutePaths["ambassador-dtw"],
        );
        const progress = getWindsorDetroitProgress(coordinates, time);
        return {
            id: "sam-amy-windsor-dtw",
            team,
            kind: "ground",
            coordinates,
            progress,
            positionProgress: progress,
            revealProgressOnly: false,
            originLabel: "Downtown Windsor",
            destinationLabel: "Detroit Metropolitan Airport",
        };
    }

    if (
        episodeSlug === "episode-2"
        && team === "ben-adam"
        && time >= 1 * 60 + 25
        && time < 26 * 60 + 44
    ) {
        const destination = time < 22 * 60 + 16 ? "atlanta" : "villa-rica";
        const coordinates = getBenAdamRoadtripPath(destination);
        const progress = getBenAdamRoadtripProgress(coordinates, time);
        return {
            id: `ben-adam-river-park-${destination}`,
            team,
            kind: "ground",
            coordinates,
            progress,
            positionProgress: progress,
            revealProgressOnly: true,
            originLabel: "Hernando DeSoto River Park",
            destinationLabel: destination === "atlanta"
                ? "Atlanta"
                : "Coca-Cola Ghost Mural",
        };
    }

    // Season-specific exception: show only the UP-NW track already traveled,
    // including stationary dwell time at its intermediate stations. If another
    // journey needs this behavior, give it its own milestone helper rather than
    // making every route reveal progressively.
    if (
        episodeSlug === "episode-1"
        && team === "sam-amy"
        && time >= 23 * 60 + 24
        && time < 37 * 60 + 33
    ) {
        const progress = getMetraProgress(time);
        return {
            id: "sam-amy-metra-progress",
            team,
            kind: "ground",
            coordinates: [...trackerRoutePaths["metra-up-nw"]],
            progress,
            positionProgress: progress,
            revealProgressOnly: true,
            originLabel: "Cumberland Station",
            destinationLabel: "Jefferson Park Station",
            destinationVisible: time >= 34 * 60 + 50,
        };
    }

    const snapshot = getTrackerSnapshot(episodeSlug, time, team);
    const travel = snapshot.event.travel;
    if (!travel || time > travel.arrivalAt) return null;
    const standardProgress = getProgress(snapshot.event, time);
    const followsSharedLgaJourney = travel.routeId === "nyc-lga-b"
        || travel.routeId === "nyc-lga-c";
    const progress = followsSharedLgaJourney
        ? getLgaProgress(snapshot.event, time)
        : standardProgress;
    const departureProgress = travel.positionProgressAtDeparture ?? 0;
    const arrivalProgress = travel.positionProgressAtArrival ?? 1;
    const positionProgress = departureProgress
        + progress * (arrivalProgress - departureProgress);

    if (travel.flight) {
        return {
            id: snapshot.event.id,
            team,
            kind: "flight",
            ...travel.flight,
            progress,
            positionProgress,
            revealProgressOnly: false,
            originLabel: travel.originLabel,
            destinationLabel: travel.destinationLabel,
        };
    }
    if (!travel.routeId) return null;
    return {
        id: snapshot.event.id,
        team,
        kind: "ground",
        coordinates: [...trackerRoutePaths[travel.routeId]],
        progress,
        positionProgress,
        revealProgressOnly: false,
        originLabel: travel.originLabel,
        destinationLabel: travel.destinationLabel,
    };
}
