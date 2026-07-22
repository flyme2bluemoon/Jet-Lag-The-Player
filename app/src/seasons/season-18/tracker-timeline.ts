import type { TeamId } from "./team-data";
import type {
    EpisodeSlug,
    FlightTravelEvent,
    GroundDwellPhase,
    GroundPathPhase,
    GroundTravelEvent,
    StationaryEvent,
    TrackerStatus,
    TrackerTimeline,
    TrackerTimestamp,
    TravelDisplay,
} from "./tracker-model";
import type { LocationId, PathId } from "./tracker-static";

const EPISODE_ONE_TRACKER_END = 55 * 60 + 52;
const EPISODE_TWO_TRACKER_START = 1 * 60 + 7;
const EPISODE_TWO_TRACKER_END = 52 * 60 + 53;
const EPISODE_THREE_TRACKER_START = 43;
const EPISODE_THREE_TRACKER_END = 41 * 60 + 43;
const EPISODE_FOUR_TRACKER_START = 55;
const EPISODE_FOUR_TRACKER_END = 56 * 60 + 42;

export const trackerEpisodeRanges = {
    "episode-1": { start: 5, end: EPISODE_ONE_TRACKER_END },
    "episode-2": { start: EPISODE_TWO_TRACKER_START, end: EPISODE_TWO_TRACKER_END },
    "episode-3": { start: EPISODE_THREE_TRACKER_START, end: EPISODE_THREE_TRACKER_END },
    "episode-4": { start: EPISODE_FOUR_TRACKER_START, end: EPISODE_FOUR_TRACKER_END },
    "episode-5": { start: 47, end: 46 * 60 + 27 },
} as const satisfies Partial<Record<EpisodeSlug, { start: number; end: number }>>;

export type TrackerEpisodeSlug = keyof typeof trackerEpisodeRanges;

function time(episode: EpisodeSlug, at: number): TrackerTimestamp {
    return { episode, at };
}

function status(description: string, location: string): TrackerStatus {
    return { description, location };
}

function stationary(
    id: string,
    episode: EpisodeSlug,
    at: number,
    location: LocationId,
    description: string,
    statusLocation: string,
): StationaryEvent<LocationId> {
    return {
        id,
        kind: "stationary",
        at: time(episode, at),
        location,
        status: status(description, statusLocation),
    };
}

type PhaseOptions = {
    status?: TrackerStatus;
    display?: TravelDisplay<LocationId>;
    destWaypointMapLabel?: { text?: string };
    mapLabel?: { text?: string };
    setIntermediateOrigin?: boolean;
};

function pathPhase(
    path: PathId,
    episode: EpisodeSlug,
    start: number,
    end: number,
    options: Omit<PhaseOptions, "mapLabel"> = {},
): GroundPathPhase<PathId, LocationId> {
    return {
        kind: "path",
        path,
        time: { start: time(episode, start), end: time(episode, end) },
        ...options,
    };
}

function dwellPhase(
    location: LocationId,
    episode: EpisodeSlug,
    start: number,
    end: number,
    options: Omit<PhaseOptions, "destWaypointMapLabel"> = {},
): GroundDwellPhase<LocationId> {
    return {
        kind: "dwell",
        location,
        time: { start: time(episode, start), end: time(episode, end) },
        ...options,
    };
}

function ground(
    id: string,
    origin: LocationId,
    destination: LocationId,
    description: string,
    location: string,
    phases: GroundTravelEvent<PathId, LocationId>["phases"],
    options: Pick<GroundTravelEvent<PathId, LocationId>, "display" | "interruption"> = {},
): GroundTravelEvent<PathId, LocationId> {
    return {
        id,
        kind: "ground",
        origin,
        destination,
        status: status(description, location),
        phases,
        ...options,
    };
}

function simpleGround(
    id: string,
    episode: EpisodeSlug,
    start: number,
    end: number,
    path: PathId,
    origin: LocationId,
    destination: LocationId,
    description: string,
    location: string,
    display?: TravelDisplay<LocationId>,
) {
    return ground(
        id,
        origin,
        destination,
        description,
        location,
        [pathPhase(path, episode, start, end)],
        { display },
    );
}

function flight(
    id: string,
    origin: LocationId,
    destination: LocationId,
    description: string,
    phases: FlightTravelEvent<LocationId>["phases"],
): FlightTravelEvent<LocationId> {
    return {
        id,
        kind: "flight",
        origin,
        destination,
        status: status(description, "In the air"),
        phases,
    };
}

function flightPhase(
    episode: EpisodeSlug,
    start: number,
    end: number,
    progress?: { from: number; to: number },
) {
    return {
        kind: "flight" as const,
        time: { start: time(episode, start), end: time(episode, end) },
        progress,
    };
}

const samAmyTimeline = [
    stationary("sam-amy-central-park", "episode-1", 0, "centralPark", "Central Park", "New York, NY"),
    ground("sam-amy-to-lga", "centralPark", "lgaTerminalB", "Public transport to LGA", "New York, NY", [
        pathPhase("central-park-72-street", "episode-1", 4 * 60 + 13, 4 * 60 + 37),
        pathPhase("72-street-jackson-heights", "episode-1", 4 * 60 + 37, 5 * 60 + 5),
        dwellPhase("jacksonHeightsRoosevelt", "episode-1", 5 * 60 + 5, 6 * 60 + 25),
        pathPhase("jackson-heights-lga-b", "episode-1", 6 * 60 + 25, 7 * 60 + 40),
    ]),
    stationary("sam-amy-lga", "episode-1", 7 * 60 + 40, "lgaTerminalB", "LGA Terminal B", "New York, NY"),
    flight("sam-amy-lga-ord", "lgaTerminalB", "ord", "Flight from LGA to ORD", [
        flightPhase("episode-1", 12 * 60, 14 * 60 + 54),
    ]),
    stationary("sam-amy-ord-arrival", "episode-1", 14 * 60 + 54, "ord", "O'Hare Airport", "Chicago, IL"),
    simpleGround("sam-amy-to-cumberland", "episode-1", 18 * 60 + 43, 20 * 60 + 5, "ord-cumberland", "ord", "cumberlandMetra", "Rideshare to Cumberland Station", "Chicago, IL"),
    stationary("sam-amy-cumberland", "episode-1", 20 * 60 + 5, "cumberlandMetra", "Cumberland Station", "Des Plaines, IL"),
    ground("sam-amy-metra", "cumberlandMetra", "jeffersonParkMetra", "Union Pacific Northwest Train towards Chicago OTC", "Chicago, IL", [
        pathPhase("cumberland-des-plaines", "episode-1", 23 * 60 + 24, 27 * 60 + 26),
        dwellPhase("desPlainesMetra", "episode-1", 27 * 60 + 26, 27 * 60 + 53),
        pathPhase("des-plaines-dee-road", "episode-1", 27 * 60 + 53, 31 * 60 + 32),
        dwellPhase("deeRoadMetra", "episode-1", 31 * 60 + 32, 31 * 60 + 35),
        pathPhase("dee-road-park-ridge", "episode-1", 31 * 60 + 35, 32 * 60 + 39),
        dwellPhase("parkRidgeMetra", "episode-1", 32 * 60 + 39, 32 * 60 + 49),
        pathPhase("park-ridge-edison-park", "episode-1", 32 * 60 + 49, 34 * 60 + 32),
        dwellPhase("edisonParkMetra", "episode-1", 34 * 60 + 32, 34 * 60 + 34),
        pathPhase("edison-park-jefferson-park", "episode-1", 34 * 60 + 34, 34 * 60 + 50),
        pathPhase("edison-park-jefferson-park", "episode-1", 34 * 60 + 50, 37 * 60 + 33, {
            status: status("Union Pacific Northwest Train towards Jefferson Park", "Chicago, IL"),
        }),
    ], {
        display: {
            revealPath: "traveled",
            destinationLabel: {
                visibleFrom: time("episode-1", 34 * 60 + 50),
            },
        },
    }),
    stationary("sam-amy-jefferson-park", "episode-1", 37 * 60 + 33, "jeffersonParkMetra", "Jefferson Park Station", "Chicago, IL"),
    simpleGround("sam-amy-blue-line", "episode-1", 38 * 60 + 37, 43 * 60 + 33, "jefferson-park-ord", "jeffersonParkMetra", "ord", "Blue Line towards O’Hare", "Chicago, IL"),
    stationary("sam-amy-back-at-ord", "episode-1", 43 * 60 + 33, "ord", "O'Hare Airport", "Chicago, IL"),
    flight("sam-amy-ord-dtw", "ord", "dtw", "Flight from ORD to DTW", [
        flightPhase("episode-1", 51 * 60 + 2, EPISODE_ONE_TRACKER_END, { from: 0, to: 0.18 }),
        flightPhase("episode-2", EPISODE_TWO_TRACKER_START, 1 * 60 + 43, { from: 0.18, to: 1 }),
    ]),
    stationary("sam-amy-dtw-arrival", "episode-2", 1 * 60 + 43, "dtw", "DTW McNamara Terminal", "Detroit, MI"),
    ground("sam-amy-dtw-windsor", "dtw", "windsorCityHall", "Driving to Downtown Windsor", "Detroit, MI", [
        pathPhase("dtw-tunnel-border", "episode-2", 4 * 60 + 58, 8 * 60 + 6),
        pathPhase("tunnel-border-windsor", "episode-2", 8 * 60 + 6, 8 * 60 + 30, {
            status: status("Driving to Downtown Windsor", "Windsor, ON"),
        }),
    ]),
    stationary("sam-amy-downtown-windsor", "episode-2", 8 * 60 + 30, "windsorCityHall", "Downtown Windsor", "Windsor, ON"),
    ground("sam-amy-windsor-dtw", "windsorCityHall", "dtw", "Driving back to DTW Airport", "Windsor, ON", [
        pathPhase("windsor-ambassador", "episode-2", 16 * 60 + 42, 17 * 60 + 15),
        pathPhase("ambassador-dtw", "episode-2", 17 * 60 + 15, 17 * 60 + 32, {
            status: status("Driving back to DTW Airport", "Detroit, MI"),
        }),
    ]),
    stationary("sam-amy-back-at-dtw", "episode-2", 17 * 60 + 32, "dtw", "Detroit Metropolitan Airport", "Detroit, MI"),
    flight("sam-amy-dtw-bos", "dtw", "bos", "Flight from DTW to BOS", [
        flightPhase("episode-2", 30 * 60 + 13, 34 * 60 + 3),
    ]),
    stationary("sam-amy-bos-arrival", "episode-2", 34 * 60 + 3, "bos", "Boston Logan Airport", "Boston, MA"),
    ground("sam-amy-bos-merrimack", "bos", "merrimackCoveredBridge", "Driving to Merrimack Covered Bridge", "Massachusetts", [
        pathPhase("bos-new-hampshire-border", "episode-2", 40 * 60 + 31, 43 * 60 + 22),
        pathPhase("new-hampshire-border-home-depot", "episode-2", 43 * 60 + 22, 43 * 60 + 56, {
            status: status("Driving to Merrimack Covered Bridge", "New Hampshire"),
        }),
        dwellPhase("londonderryHomeDepot", "episode-2", 43 * 60 + 56, 47 * 60 + 52, {
            status: status("Home Depot", "Londonderry, NH"),
        }),
        pathPhase("home-depot-merrimack", "episode-2", 47 * 60 + 52, 48 * 60 + 39, {
            status: status("Driving to Merrimack Covered Bridge", "New Hampshire"),
        }),
    ]),
    stationary("sam-amy-merrimack-covered-bridge", "episode-2", 48 * 60 + 39, "merrimackCoveredBridge", "Merrimack Covered Bridge", "Merrimack, NH"),
    ground("sam-amy-merrimack-boston", "merrimackCoveredBridge", "paulReverePark", "Driving towards Boston", "New Hampshire", [
        pathPhase("merrimack-massachusetts-border", "episode-3", 1 * 60 + 43, 3 * 60 + 21),
        pathPhase("massachusetts-border-boston", "episode-3", 3 * 60 + 21, 4 * 60 + 45, {
            status: status("Driving towards Boston", "Massachusetts"),
        }),
        dwellPhase("boston", "episode-3", 4 * 60 + 45, 4 * 60 + 59, {
            status: status("Driving through Boston", "Boston, MA"),
        }),
        dwellPhase("boston", "episode-3", 4 * 60 + 59, 6 * 60 + 11, {
            status: status("Whole Foods", "Boston, MA"),
        }),
        pathPhase("boston-paul-revere", "episode-3", 6 * 60 + 11, 10 * 60 + 38, {
            status: status("Driving to Paul Revere Park", "Boston, MA"),
        }),
    ]),
    stationary("sam-amy-paul-revere-park", "episode-3", 10 * 60 + 38, "paulReverePark", "Paul Revere Park", "Boston, MA"),
    stationary("sam-amy-downtown-boston", "episode-3", 15 * 60 + 24, "paulReverePark", "Downtown Boston", "Boston, MA"),
    stationary("sam-amy-margaritaville", "episode-3", 19 * 60 + 40, "margaritavilleBoston", "Boston’s finest culinary institution", "Jimmy Buffett’s Margaritaville, Boston, MA"),
    simpleGround("sam-amy-margaritaville-to-bos", "episode-3", 22 * 60 + 31, 23 * 60 + 23, "margaritaville-bos", "margaritavilleBoston", "bos", "Driving to BOS Airport", "Boston, MA"),
    stationary("sam-amy-bos-episode-three", "episode-3", 23 * 60 + 23, "bos", "Boston Logan Airport", "Boston, MA"),
    flight("sam-amy-bos-stl", "bos", "stl", "Flight from BOS to STL", [
        flightPhase("episode-3", 39 * 60 + 54, EPISODE_THREE_TRACKER_END, { from: 0, to: 0.2 }),
        flightPhase("episode-4", EPISODE_FOUR_TRACKER_START, 1 * 60 + 3, { from: 0.2, to: 1 }),
    ]),
    stationary("sam-amy-stl-arrival", "episode-4", 1 * 60 + 3, "stl", "St. Louis Lambert Airport", "St. Louis, MO"),
    ground("sam-amy-stl-donnellson", "stl", "donnellsonDollarGeneral", "Driving to Iowa", "Missouri", [
        pathPhase("stl-missouri-iowa-border", "episode-4", 5 * 60 + 31, 14 * 60 + 3),
        pathPhase("missouri-iowa-border-donnellson", "episode-4", 14 * 60 + 3, 16 * 60, {
            status: status("Driving to Iowa", "Iowa"),
        }),
        pathPhase("missouri-iowa-border-donnellson", "episode-4", 16 * 60, 17 * 60 + 40, {
            status: status("Driving to Dollar General", "Iowa"),
            display: { destinationLabel: { text: "Dollar General" } },
        }),
    ], { display: { destinationLabel: { text: "Donnellson" } } }),
    stationary("sam-amy-donnellson-dollar-general", "episode-4", 17 * 60 + 40, "donnellsonDollarGeneral", "Dollar General", "Donnellson, IA"),
    ground("sam-amy-to-des-moines", "donnellsonDollarGeneral", "desMoines", "Searching for Farm Animals", "Iowa", [
        pathPhase("donnellson-eddyville", "episode-4", 21 * 60 + 14, 22 * 60 + 9, {
            display: { revealPath: "traveled", destinationLabel: false },
        }),
        dwellPhase("eddyvilleExit53", "episode-4", 22 * 60 + 9, 24 * 60 + 13, {
            status: status("Outskirts of a Farm", "Eddyville, IA"),
        }),
        pathPhase("eddyville-des-moines", "episode-4", 24 * 60 + 13, 26 * 60 + 21, {
            status: status("Driving to Des Moines", "Iowa"),
        }),
    ]),
    stationary("sam-amy-des-moines-rest", "episode-4", 26 * 60 + 21, "desMoines", "Des Moines", "Des Moines, IA"),
    ground("sam-amy-des-moines-north-sioux", "desMoines", "northSiouxDollarGeneral", "Driving to South Dakota", "Iowa", [
        pathPhase("des-moines-south-dakota-border", "episode-4", 29 * 60 + 9, 49 * 60 + 18),
        pathPhase("south-dakota-border-north-sioux", "episode-4", 49 * 60 + 18, 51 * 60 + 24, {
            status: status("Driving to South Dakota", "South Dakota"),
        }),
    ]),
    stationary("sam-amy-north-sioux-dollar-general", "episode-4", 51 * 60 + 24, "northSiouxDollarGeneral", "Dollar General", "North Sioux City, SD"),
    simpleGround("sam-amy-to-duel-arena", "episode-4", 52 * 60 + 2, 52 * 60 + 16, "north-sioux-duel-arena", "northSiouxDollarGeneral", "duelArena", "Finding a place to duel", "North Sioux City, SD"),
    stationary("sam-amy-duel-arena", "episode-4", 52 * 60 + 16, "duelArena", "Duel Arena", "North Sioux City, SD"),
    ground("sam-amy-north-sioux-msp", "duelArena", "msp", "Driving to Minneapolis", "Iowa", [
        pathPhase("duel-arena-le-mars", "episode-5", 1 * 60 + 26, 5 * 60 + 5),
        pathPhase("le-mars-minnesota-border", "episode-5", 5 * 60 + 5, 9 * 60 + 59),
        pathPhase("minnesota-border-okabena", "episode-5", 9 * 60 + 59, 11 * 60 + 34, { status: status("Driving to Minneapolis", "Minnesota") }),
        dwellPhase("okabenaLake", "episode-5", 11 * 60 + 34, 12 * 60 + 5, { status: status("Okabena Lake", "Minnesota"), mapLabel: {} }),
        pathPhase("okabena-timber", "episode-5", 12 * 60 + 5, 13 * 60 + 19, { status: status("Driving to Minneapolis", "Minnesota") }),
        dwellPhase("timberLake", "episode-5", 13 * 60 + 19, 13 * 60 + 43, { status: status("Timber Lake", "Minnesota"), mapLabel: {} }),
        pathPhase("timber-cottonwood", "episode-5", 13 * 60 + 43, 14 * 60 + 22, { status: status("Driving to Minneapolis", "Minnesota") }),
        dwellPhase("cottonwoodLake", "episode-5", 14 * 60 + 22, 14 * 60 + 58, { status: status("Cottonwood Lake", "Minnesota"), mapLabel: {} }),
        pathPhase("cottonwood-bingham", "episode-5", 14 * 60 + 58, 19 * 60 + 43, { status: status("Driving to Minneapolis", "Minnesota") }),
        dwellPhase("binghamLake", "episode-5", 19 * 60 + 43, 20 * 60 + 14, { status: status("Bingham Lake", "Minnesota"), mapLabel: {} }),
        pathPhase("bingham-saint-james", "episode-5", 20 * 60 + 14, 21 * 60 + 21, { status: status("Driving to Minneapolis", "Minnesota") }),
        dwellPhase("saintJamesLake", "episode-5", 21 * 60 + 21, 22 * 60 + 3, { status: status("Saint James Lake", "Minnesota"), mapLabel: {} }),
        pathPhase("saint-james-fedje", "episode-5", 22 * 60 + 3, 24 * 60 + 43, { status: status("Driving to Minneapolis", "Minnesota") }),
        dwellPhase("fedjeLake", "episode-5", 24 * 60 + 43, 24 * 60 + 53, { status: status("Fedje Lake", "Minnesota"), mapLabel: {} }),
        pathPhase("fedje-lake-crystal", "episode-5", 24 * 60 + 53, 25 * 60 + 20, { status: status("Driving to Minneapolis", "Minnesota") }),
        dwellPhase("lakeCrystal", "episode-5", 25 * 60 + 20, 25 * 60 + 35, { status: status("Lake Crystal", "Minnesota"), mapLabel: {} }),
        pathPhase("lake-crystal-loon", "episode-5", 25 * 60 + 35, 25 * 60 + 56, { status: status("Driving to Minneapolis", "Minnesota") }),
        dwellPhase("loonLake", "episode-5", 25 * 60 + 56, 26 * 60 + 7, { status: status("Loon Lake", "Minnesota"), mapLabel: {} }),
        pathPhase("loon-mills", "episode-5", 26 * 60 + 7, 27 * 60 + 42, { status: status("Driving to Minneapolis", "Minnesota") }),
        dwellPhase("millsLake", "episode-5", 27 * 60 + 42, 28 * 60 + 30, { status: status("Mills Lake", "Minnesota"), mapLabel: {} }),
        pathPhase("mills-lake-dorothy", "episode-5", 28 * 60 + 30, 29 * 60 + 34, { status: status("Driving to Minneapolis", "Minnesota") }),
        dwellPhase("lakeDorothy", "episode-5", 29 * 60 + 34, 34 * 60 + 14, { status: status("Lake Dorothy", "Minnesota"), mapLabel: {} }),
        pathPhase("lake-dorothy-mall", "episode-5", 34 * 60 + 14, 38 * 60 + 4, {
            status: status("Driving to MSP Airport", "Minnesota"),
            setIntermediateOrigin: true,
            display: {
                originLabel: { text: "Lake Dorothy" },
                destinationLabel: { text: "Minneapolis-St. Paul Airport" },
            },
        }),
        dwellPhase("mallOfAmerica", "episode-5", 38 * 60 + 4, 43 * 60 + 55, {
            status: status("Strategic Delay at the Mall of America", "Minneapolis–St. Paul, MN"),
            setIntermediateOrigin: true,
            display: {
                originLabel: { text: "Mall of America" },
                destinationLabel: { text: "Minneapolis-St. Paul Airport" },
            },
        }),
        pathPhase("mall-msp", "episode-5", 43 * 60 + 55, 45 * 60 + 24, {
            status: status("Driving to MSP Airport", "Minnesota"),
            display: {
                originLabel: { text: "Mall of America" },
                destinationLabel: { text: "Minneapolis-St. Paul Airport" },
            },
        }),
    ], {
        display: {
            originLabel: { text: "North Sioux City" },
            destinationLabel: { text: "Minneapolis" },
        },
    }),
    stationary("sam-amy-msp-arrival", "episode-5", 45 * 60 + 24, "msp", "Minneapolis-St. Paul Airport", "Minneapolis–St. Paul, MN"),
] satisfies readonly (StationaryEvent<LocationId> | GroundTravelEvent<PathId, LocationId> | FlightTravelEvent<LocationId>)[];

const benAdamTimeline = [
    stationary("ben-adam-central-park", "episode-1", 0, "centralPark", "Central Park", "New York, NY"),
    ground("ben-adam-to-lga", "centralPark", "lgaTerminalC", "Public transport to LGA", "New York, NY", [
        pathPhase("central-park-72-street", "episode-1", 3 * 60 + 47, 4 * 60 + 37),
        pathPhase("72-street-jackson-heights", "episode-1", 4 * 60 + 37, 5 * 60 + 5),
        dwellPhase("jacksonHeightsRoosevelt", "episode-1", 5 * 60 + 5, 6 * 60 + 4),
        pathPhase("jackson-heights-lga-c", "episode-1", 6 * 60 + 4, 7 * 60 + 5),
    ]),
    stationary("ben-adam-lga", "episode-1", 7 * 60 + 5, "lgaTerminalC", "LGA Terminal C", "New York, NY"),
    flight("ben-adam-lga-mem", "lgaTerminalC", "mem", "Flight from LGA to MEM", [flightPhase("episode-1", 10 * 60 + 43, 13 * 60 + 47)]),
    stationary("ben-adam-mem-arrival", "episode-1", 13 * 60 + 47, "mem", "Memphis Airport", "Memphis, TN"),
    simpleGround("ben-adam-to-hattie-bs", "episode-1", 15 * 60 + 59, 19 * 60 + 8, "mem-hattie", "mem", "hattieBs", "Drive to Hattie B's", "Memphis, TN"),
    stationary("ben-adam-hattie-bs", "episode-1", 19 * 60 + 8, "hattieBs", "Hattie B’s", "Memphis, TN"),
    simpleGround("ben-adam-to-river-park", "episode-1", 37 * 60 + 24, 42 * 60 + 22, "hattie-river-park", "hattieBs", "hernandoDeSotoPark", "Drive to Hernando DeSoto River Park", "Interstate Roadtrip"),
    stationary("ben-adam-river-park", "episode-1", 42 * 60 + 22, "hernandoDeSotoPark", "Hernando DeSoto River Park", "Lake Cormorant, MS"),
    ground("ben-adam-river-park-to-mem", "hernandoDeSotoPark", "mem", "Drive towards Memphis Airport", "Interstate Roadtrip", [
        pathPhase("river-park-mem", "episode-1", 53 * 60 + 17, 54 * 60 + 6),
    ], { interruption: "wallsPullOver" }),
    stationary("ben-adam-pull-over", "episode-1", 54 * 60 + 6, "wallsPullOver", "Pulled over", "Mississippi"),
    ground("ben-adam-walls-atlanta", "wallsPullOver", "atl", "Driving to Georgia", "Mississippi", [
        pathPhase("walls-alabama-border", "episode-2", 1 * 60 + 25, 7 * 60),
        pathPhase("alabama-border-birmingham", "episode-2", 7 * 60, 17 * 60 + 44, { status: status("Driving to Georgia", "Alabama") }),
        dwellPhase("birmingham", "episode-2", 17 * 60 + 44, 19 * 60 + 30, { status: status("Rest Period in Birmingham", "Birmingham, AL") }),
        pathPhase("birmingham-georgia-border", "episode-2", 19 * 60 + 30, 21 * 60 + 1, { status: status("Driving to Georgia", "Alabama") }),
        pathPhase("georgia-border-atl", "episode-2", 21 * 60 + 1, 22 * 60 + 16, { status: status("Driving to Georgia", "Georgia") }),
    ], { interruption: "westGeorgia", display: { revealPath: "traveled" } }),
    simpleGround("ben-adam-change-destination-villa-rica", "episode-2", 22 * 60 + 16, 26 * 60 + 44, "west-georgia-villa-rica", "westGeorgia", "villaRicaMural", "Driving to Coca-Cola Mural", "Georgia", { revealPath: "traveled" }),
    stationary("ben-adam-villa-rica-mural", "episode-2", 26 * 60 + 44, "villaRicaMural", "Coca-Cola ghost mural", "Villa Rica, GA"),
    simpleGround("ben-adam-villa-rica-to-atlanta", "episode-2", 35 * 60 + 34, 36 * 60 + 20, "villa-rica-world-of-coca-cola", "villaRicaMural", "worldOfCocaCola", "Driving to Atlanta", "Georgia"),
    stationary("ben-adam-world-of-coca-cola", "episode-2", 36 * 60 + 20, "worldOfCocaCola", "Kill time at the World of Coca-Cola", "Atlanta, GA"),
    simpleGround("ben-adam-world-of-coca-cola-to-atl", "episode-2", 38 * 60 + 54, 41 * 60, "world-of-coca-cola-atl", "worldOfCocaCola", "atl", "Driving to ATL Airport", "Atlanta, GA"),
    stationary("ben-adam-atl-airport", "episode-2", 41 * 60, "atl", "Atlanta Hartsfield-Jackson Airport", "Atlanta, GA"),
    flight("ben-adam-atl-stl", "atl", "stl", "Flight from ATL to STL", [
        flightPhase("episode-2", 47 * 60 + 14, EPISODE_TWO_TRACKER_END, { from: 0, to: 0.35 }),
        flightPhase("episode-3", EPISODE_THREE_TRACKER_START, 1 * 60 + 55, { from: 0.35, to: 1 }),
    ]),
    stationary("ben-adam-stl-arrival", "episode-3", 1 * 60 + 55, "stl", "St. Louis Lambert Airport", "St. Louis, MO"),
    simpleGround("ben-adam-stl-to-gateway-arch", "episode-3", 4 * 60 + 5, 5 * 60 + 13, "stl-gateway-arch", "stl", "gatewayArch", "Rideshare to Gateway Arch", "St. Louis, MO"),
    stationary("ben-adam-gateway-arch", "episode-3", 5 * 60 + 13, "gatewayArch", "Gateway Arch", "St. Louis, MO"),
    stationary("ben-adam-downtown-st-louis", "episode-3", 8 * 60 + 50, "gatewayArch", "Downtown St. Louis", "St. Louis, MO"),
    ground("ben-adam-st-louis-paducah", "gatewayArch", "paducahDistillery", "Driving to Paducah", "Illinois", [
        pathPhase("st-louis-rend-lake", "episode-3", 18 * 60 + 54, 20 * 60 + 17),
        pathPhase("rend-lake-irvin-cobb", "episode-3", 20 * 60 + 17, 22 * 60 + 38),
        pathPhase("irvin-cobb-kentucky", "episode-3", 22 * 60 + 38, 23 * 60 + 2, { status: status("Driving to Paducah", "Crossing the Ohio River") }),
        pathPhase("kentucky-paducah", "episode-3", 23 * 60 + 2, 24 * 60 + 6, { status: status("Driving to Paducah", "Kentucky") }),
    ]),
    stationary("ben-adam-paducah-distillery", "episode-3", 24 * 60 + 6, "paducahDistillery", "Ben gets drunk, again", "Paducah, KY"),
    stationary("ben-adam-paducah-evening", "episode-3", 26 * 60 + 29, "paducahDistillery", "Lovely little (drunk) evening in Paducah", "Paducah, KY"),
    stationary("ben-adam-snack-zone", "episode-3", 27 * 60 + 44, "paducahDistillery", "Snack Zone After Hours", "Paducah, KY"),
    stationary("ben-adam-paducah-evening-resume", "episode-3", 28 * 60 + 10, "paducahDistillery", "Lovely little (drunk) evening in Paducah", "Paducah, KY"),
    stationary("ben-adam-hungover", "episode-3", 29 * 60 + 47, "paducahDistillery", "Hungover Ben", "Paducah, KY"),
    stationary("ben-adam-exploring-paducah", "episode-3", 34 * 60 + 16, "paducahDistillery", "Exploring Paducah’s cute downtown", "Paducah, KY"),
    simpleGround("ben-adam-paducah-to-stl", "episode-3", 35 * 60 + 31, 40 * 60 + 31, "paducah-stl", "paducahDistillery", "stl", "Driving to STL Airport", "Interstate Roadtrip"),
    stationary("ben-adam-back-at-stl", "episode-3", 40 * 60 + 31, "stl", "St. Louis Lambert Airport", "St. Louis, MO"),
    flight("ben-adam-stl-dca", "stl", "dca", "Flight from STL to DCA", [flightPhase("episode-4", 1 * 60 + 39, 6 * 60 + 15)]),
    stationary("ben-adam-dca-arrival", "episode-4", 6 * 60 + 15, "dca", "Reagan National Airport", "Arlington, VA"),
    simpleGround("ben-adam-dca-to-monroe", "episode-4", 8 * 60 + 41, 14 * 60 + 18, "dca-monroe", "dca", "jamesMonroeBirthplace", "Driving to Monroe’s Birthplace", "Maryland/Virginia"),
    stationary("ben-adam-james-monroe-birthplace", "episode-4", 14 * 60 + 18, "jamesMonroeBirthplace", "James Monroe’s Birthplace", "Colonial Beach, VA"),
    simpleGround("ben-adam-monroe-to-dca", "episode-4", 20 * 60 + 27, 24 * 60 + 45, "monroe-dca", "jamesMonroeBirthplace", "dca", "Driving to DCA Airport", "Maryland/Virginia"),
    stationary("ben-adam-back-at-dca", "episode-4", 24 * 60 + 45, "dca", "Reagan National Airport", "Arlington, VA"),
    simpleGround("ben-adam-dca-to-union-station", "episode-4", 24 * 60 + 58, 25 * 60 + 5, "dca-union-station", "dca", "washingtonUnionStation", "WMATA to Union Station", "Washington, DC"),
    stationary("ben-adam-washington-union-station", "episode-4", 25 * 60 + 5, "washingtonUnionStation", "Washington Union Station", "Washington, DC"),
    simpleGround("ben-adam-nec-to-baltimore", "episode-4", 29 * 60 + 25, 33 * 60 + 48, "washington-baltimore", "washingtonUnionStation", "baltimorePennStation", "Northeast Corridor Train to Baltimore", "Intercity rail"),
    stationary("ben-adam-baltimore-penn", "episode-4", 33 * 60 + 48, "baltimorePennStation", "Baltimore Penn Station", "Baltimore, MD"),
    simpleGround("ben-adam-bus-to-inner-harbor", "episode-4", 34 * 60 + 46, 36 * 60 + 29, "baltimore-penn-inner-harbor", "baltimorePennStation", "baltimoreInnerHarbor", "Bus to Inner Harbor", "Baltimore, MD"),
    stationary("ben-adam-inner-harbor", "episode-4", 36 * 60 + 29, "baltimoreInnerHarbor", "Inner Harbor", "Baltimore, MD"),
    stationary("ben-adam-water-taxi", "episode-4", 42 * 60 + 44, "baltimoreWaterTaxi", "Water Taxi", "Baltimore Harbor, MD"),
    stationary("ben-adam-fells-point", "episode-4", 50 * 60 + 41, "fellsPoint", "Fell’s Point", "Baltimore, MD"),
    ground("ben-adam-fells-point-baltimore-penn", "fellsPoint", "baltimorePennStation", "Bus back to Baltimore Penn Station", "Baltimore, MD", [
        pathPhase("fells-point-aquarium", "episode-4", 51 * 60 + 18, 53 * 60 + 49),
        pathPhase("aquarium-inner-harbor", "episode-4", 53 * 60 + 49, 54 * 60 + 5),
        pathPhase("inner-harbor-baltimore-penn", "episode-4", 54 * 60 + 5, 55 * 60 + 37),
    ]),
    stationary("ben-adam-back-at-baltimore-penn", "episode-4", 55 * 60 + 37, "baltimorePennStation", "Baltimore Penn Station", "Baltimore, MD"),
    simpleGround("ben-adam-baltimore-to-philadelphia", "episode-5", 1 * 60 + 43, 8 * 60 + 7, "baltimore-philadelphia", "baltimorePennStation", "philadelphia30thStreet", "Northeast Corridor Train to Philadelphia", "Intercity rail"),
    stationary("ben-adam-philadelphia-30th", "episode-5", 8 * 60 + 7, "philadelphia30thStreet", "30th Street Station", "Philadelphia, PA"),
    simpleGround("ben-adam-philadelphia-target", "episode-5", 8 * 60 + 22, 8 * 60 + 58, "philadelphia-30th-target", "philadelphia30thStreet", "philadelphiaTarget", "Rideshare to Target", "Philadelphia, PA"),
    stationary("ben-adam-philadelphia-target-arrival", "episode-5", 8 * 60 + 58, "philadelphiaTarget", "Target", "Philadelphia, PA"),
    simpleGround("ben-adam-walk-to-van-colln", "episode-5", 9 * 60 + 36, 10 * 60 + 40, "target-van-colln", "philadelphiaTarget", "vanCollnField", "Walking to Van Colln Memorial Field", "Philadelphia, PA"),
    stationary("ben-adam-van-colln-field", "episode-5", 10 * 60 + 40, "vanCollnField", "Van Colln Memorial Field", "Philadelphia, PA"),
    simpleGround("ben-adam-van-colln-to-phl", "episode-5", 18 * 60 + 54, 20 * 60 + 20, "van-colln-phl", "vanCollnField", "phlTerminalAWest", "Rideshare to PHL Airport", "Philadelphia, PA"),
    stationary("ben-adam-phl-arrival", "episode-5", 20 * 60 + 20, "phlTerminalAWest", "Philadelphia Int’l Airport", "Philadelphia, PA"),
    stationary("ben-adam-snake-zone", "episode-5", 23 * 60 + 15, "phlTerminalAWest", "Snake Zone between Terminal A West and East", "Philadelphia Int’l Airport"),
    stationary("ben-adam-snake-zone-end", "episode-5", 23 * 60 + 43, "phlTerminalAWest", "Philadelphia Int’l Airport", "Philadelphia, PA"),
    simpleGround("ben-adam-phl-to-30th-septa", "episode-5", 33 * 60 + 57, 35 * 60 + 43, "phl-30th", "phlTerminalAWest", "philadelphia30thStreet", "SEPTA Airport Line to 30th Street Station", "Philadelphia, PA"),
    stationary("ben-adam-back-at-philadelphia-30th", "episode-5", 35 * 60 + 43, "philadelphia30thStreet", "30th Street Station", "Philadelphia, PA"),
    simpleGround("ben-adam-philadelphia-to-new-york", "episode-5", 36 * 60 + 28, 39 * 60 + 25, "philadelphia-new-york", "philadelphia30thStreet", "newYorkPennStation", "Northeast Corridor Train to New York", "Intercity rail"),
    stationary("ben-adam-new-york-penn", "episode-5", 39 * 60 + 25, "newYorkPennStation", "New York Penn Station", "New York, NY"),
    simpleGround("ben-adam-walk-to-empire-state", "episode-5", 39 * 60 + 35, 39 * 60 + 47, "new-york-penn-empire-state", "newYorkPennStation", "empireStateBuilding", "Walking to Empire State Building", "New York, NY"),
    stationary("ben-adam-empire-state-building", "episode-5", 39 * 60 + 47, "empireStateBuilding", "Empire State Building", "New York, NY"),
    simpleGround("ben-adam-empire-state-to-hertz", "episode-5", 44 * 60 + 9, 45 * 60 + 10, "empire-state-hertz", "empireStateBuilding", "hertzWest34th", "Walking to Hertz", "New York, NY"),
    stationary("ben-adam-hertz", "episode-5", 45 * 60 + 10, "hertzWest34th", "Hertz", "New York, NY"),
] satisfies readonly (StationaryEvent<LocationId> | GroundTravelEvent<PathId, LocationId> | FlightTravelEvent<LocationId>)[];

export const trackerTimeline = {
    "sam-amy": samAmyTimeline,
    "ben-adam": benAdamTimeline,
} satisfies TrackerTimeline<PathId, LocationId>;

export const trackerTeams = Object.keys(trackerTimeline) as TeamId[];
