import { seasonEighteen } from "@/data/season-18";
import { compareTimestamps, isTimestampInRange } from "@/lib/timestamps";
import {
    seasonEighteenTeamIds,
    type TeamId,
} from "./team-data";

type EpisodeSlug = (typeof seasonEighteen.episodes)[number]["slug"];

export type BoardRegion =
    | "Alabama"
    | "Alaska"
    | "Arizona"
    | "Arkansas"
    | "California"
    | "Canada"
    | "Colorado"
    | "Connecticut"
    | "Delaware"
    | "District of Columbia"
    | "Florida"
    | "Georgia"
    | "Hawaii"
    | "Idaho"
    | "Illinois"
    | "Indiana"
    | "Iowa"
    | "Kansas"
    | "Kentucky"
    | "Louisiana"
    | "Maine"
    | "Maryland"
    | "Massachusetts"
    | "Michigan"
    | "Minnesota"
    | "Mississippi"
    | "Missouri"
    | "Montana"
    | "Nebraska"
    | "Nevada"
    | "New Jersey"
    | "New Hampshire"
    | "New Mexico"
    | "New York"
    | "North Carolina"
    | "North Dakota"
    | "Ohio"
    | "Oklahoma"
    | "Oregon"
    | "Pennsylvania"
    | "Rhode Island"
    | "South Carolina"
    | "South Dakota"
    | "Tennessee"
    | "Texas"
    | "Utah"
    | "Vermont"
    | "Virginia"
    | "Washington"
    | "West Virginia"
    | "Wisconsin"
    | "Wyoming";

export type GameCard = {
    description?: string;
    id: string;
    label: string;
    name: string;
    targets: readonly BoardRegion[];
    title?: string;
    wildcard?: boolean;
};

export const seasonEighteenCards = {
    illinois: {
        description: "Board any non-metro train. One player randomly chooses one of the five Secret Illinois Passwords, and the other must guess it before the team can leave the train. At every stop, including the boarding stop, the guesser may ask one yes-or-no question. If you must leave the train for any reason, restart with a new password.",
        id: "illinois",
        label: "IL",
        name: "Illinois",
        targets: ["Illinois"],
        title: "Escape the train",
    },
    wisconsin: { id: "wisconsin", label: "WI", name: "Wisconsin", targets: ["Wisconsin"] },
    nebraska: { id: "nebraska", label: "NE", name: "Nebraska", targets: ["Nebraska"] },
    utah: { id: "utah", label: "UT", name: "Utah", targets: ["Utah"] },
    tennessee: {
        description: "Visit any hot chicken restaurant and order its hottest chicken. Answer three trivia questions correctly. You may attempt as many questions as needed, but before every answer you must take a large bite of the chicken.",
        id: "tennessee",
        label: "TN",
        name: "Tennessee",
        targets: ["Tennessee"],
        title: "Answer hot questions while eating even hotter chicken",
    },
    mississippi: {
        description: "Go to the Mississippi River and find a rock measuring at least four inches along one dimension. Using only natural materials gathered nearby, build a raft and place the rock on it without fastening it. Launch the raft so it carries the rock at least 30 feet downstream without either player touching it.",
        id: "mississippi",
        label: "MS",
        name: "Mississippi",
        targets: ["Mississippi"],
        title: "Send Rockleberry Finn down the Mississippi",
    },
    newYork: {
        description: "Choose one of the ten tallest buildings in the United States located in New York City and visit its observation deck. One player photographs the prettiest, ugliest, and silliest buildings, plus the building that best represents their partner. The partner must correctly match all four photos to their categories without any prior collusion. After a failed attempt, wait 30 minutes before trying again.",
        id: "new-york",
        label: "NY",
        name: "New York",
        targets: ["New York"],
        title: "Mind meld at a skyscraper",
    },
    michigan: { id: "michigan", label: "MI", name: "Michigan", targets: ["Michigan"] },
    canada: {
        description: "Start at any Canadian city hall, then find eight items within 60 minutes: a Canadian flag, a Tim Hortons, bilingual signage, ketchup chips, the word “sorry,” a Canada Post mailbox, a maple tree, a goose, a hockey stick or image of one, and a Celsius temperature. You may not research before or during the challenge, apart from navigating to the starting point, and nothing seen before the start counts. A failed attempt may be retried in a different province.",
        id: "canada",
        label: "Canada",
        name: "Canada Wild Card",
        targets: ["Canada"],
        title: "Complete the Canada scavenger hunt",
        wildcard: true,
    },
    vermont: { id: "vermont", label: "VT", name: "Vermont", targets: ["Vermont"] },
    southDakota: {
        description: "Find a stretch of road with no buildings in frame. Stand back-to-back, walk ten paces of at least two feet each, and—without saying anything else—have one player shout “draw.” Within one second, both players must turn and throw an object at the other; both objects must hit. After a miss, wait five minutes before trying again.",
        id: "south-dakota",
        label: "SD",
        name: "South Dakota",
        targets: ["South Dakota"],
        title: "Kill each other in a duel",
    },
    georgia: {
        description: "Visit an original or recreated Coca-Cola mural and make an advertisement for Coca-Cola there. Both team members must successfully bottle-flip a bottle of Coca-Cola. If either bottle fails to land upright, wait ten minutes before trying again; you may practice during the wait.",
        id: "georgia",
        label: "GA",
        name: "Georgia",
        targets: ["Georgia"],
        title: "Make an advertisement for Coca-Cola",
    },
    delaware: { id: "delaware", label: "DE", name: "Delaware", targets: ["Delaware"] },
    louisiana: { id: "louisiana", label: "LA", name: "Louisiana", targets: ["Louisiana"] },
    districtOfColumbia: {
        id: "district-of-columbia",
        label: "DC",
        name: "District of Columbia",
        targets: ["District of Columbia"],
    },
    newHampshire: {
        description: "Visit any covered bridge and estimate its length without crossing it or using a formal measuring device. Your estimate must be within 10% of its actual length. If it is not, try again at another bridge.",
        id: "new-hampshire",
        label: "NH",
        name: "New Hampshire",
        targets: ["New Hampshire"],
        title: "Abridge a bridge",
    },
    ohio: { id: "ohio", label: "OH", name: "Ohio", targets: ["Ohio"] },
    nationalPark: {
        description: "Somewhere in a National Park, take a selfie showing both team members at 0.5× zoom. Post it to social media with a poll asking which National Park it is. After ten minutes, the correct answer must be the most common response.",
        id: "national-park",
        label: "National Park",
        name: "National Park Wild Card",
        targets: [
            "Alaska",
            "Arizona",
            "Arkansas",
            "California",
            "Colorado",
            "Florida",
            "Hawaii",
            "Idaho",
            "Indiana",
            "Kentucky",
            "Maine",
            "Michigan",
            "Minnesota",
            "Missouri",
            "Montana",
            "Nevada",
            "New Mexico",
            "North Carolina",
            "North Dakota",
            "Ohio",
            "Oregon",
            "South Carolina",
            "South Dakota",
            "Tennessee",
            "Texas",
            "Utah",
            "Virginia",
            "Washington",
            "West Virginia",
            "Wyoming",
        ],
        title: "Take an iconic photo at a National Park",
        wildcard: true,
    },
    massachusetts: {
        description: "Starting anywhere along Paul Revere’s actual midnight-ride route, both team members must run, jog, or walk 1% of the route while each balances a whole lemon between their legs. If either lemon touches the ground, start over.",
        id: "massachusetts",
        label: "MA",
        name: "Massachusetts",
        targets: ["Massachusetts"],
        title: "Do 1% of Paul Revere’s Midnight Ride while riding a whole lemon",
    },
    washington: {
        id: "washington",
        label: "WA",
        name: "Washington",
        targets: ["Washington"],
    },
    california: {
        id: "california",
        label: "CA",
        name: "California",
        targets: ["California"],
    },
    oklahoma: { id: "oklahoma", label: "OK", name: "Oklahoma", targets: ["Oklahoma"] },
    kentucky: {
        description: "Get drunk at a bourbon distillery.",
        id: "kentucky",
        label: "KY",
        name: "Kentucky",
        targets: ["Kentucky"],
        title: "Get drunk at a bourbon distillery",
    },
    arizona: { id: "arizona", label: "AZ", name: "Arizona", targets: ["Arizona"] },
    alabama: { id: "alabama", label: "AL", name: "Alabama", targets: ["Alabama"] },
    newJersey: { id: "new-jersey", label: "NJ", name: "New Jersey", targets: ["New Jersey"] },
    virginia: {
        description: "Go to any presidential birthplace. One player randomly generates a president and reads three sentences from that president’s inaugural address; the sentences need not be consecutive, but may not contain names or years. Their partner gets one guess and may consult only Wikipedia’s list of U.S. presidents. After a failure, try again at another presidential birthplace.",
        id: "virginia",
        label: "VA",
        name: "Virginia",
        targets: ["Virginia"],
        title: "Identify a President at a President’s Birthplace",
    },
    iowa: {
        description: "Bring one stick of butter to the outskirts of a farm where animals are visible, then sculpt the butter into one of those animals. Post a photo of the sculpture without the real animal in the background; the audience must correctly guess what it depicts. After a failure, wait 45 minutes and try another animal.",
        id: "iowa",
        label: "IA",
        name: "Iowa",
        targets: ["Iowa"],
        title: "Sculpt a Butter Animal",
    },
    maryland: {
        description: "One team member must memorize one of the three lesser-known verses of “The Star-Spangled Banner,” but may study only while aboard a water taxi. During each recitation attempt, at least one projectile must be thrown generally toward their head every ten seconds. After a failure, take another water-taxi ride before trying again.",
        id: "maryland",
        label: "MD",
        name: "Maryland",
        targets: ["Maryland"],
        title: "Learn the Star Spangled Banner",
    },
    bucEes: {
        id: "buc-ees",
        label: "Buc-ee’s",
        name: "Buc-ee’s Wild Card",
        targets: [
            "Alabama",
            "Colorado",
            "Florida",
            "Georgia",
            "Kentucky",
            "Mississippi",
            "Missouri",
            "South Carolina",
            "Tennessee",
            "Texas",
            "Virginia",
        ],
        wildcard: true,
    },
    northDakota: { id: "north-dakota", label: "ND", name: "North Dakota", targets: ["North Dakota"] },
    northCarolina: { id: "north-carolina", label: "NC", name: "North Carolina", targets: ["North Carolina"] },
    pennsylvania: {
        description: "At a public baseball field, throw any ball from the pitching mound to a partner at first, second, third, and home plate, making every catch consecutively. Each plate must be 46 feet from the mound. Both players must stay on their knees and wear their shoes on their knees to look like children; after any missed catch, start over.",
        id: "pennsylvania",
        label: "PA",
        name: "Pennsylvania",
        targets: ["Pennsylvania"],
        title: "Win the Little League World Series",
    },
    indiana: { id: "indiana", label: "IN", name: "Indiana", targets: ["Indiana"] },
    minnesota: {
        description: "At a lake with a documented surface area, one team member administers the challenge while the other estimates the lake’s acreage. The estimate must be within 10% of the true area. After a failure, try again at another lake.",
        id: "minnesota",
        label: "MN",
        name: "Minnesota",
        targets: ["Minnesota"],
        title: "Estimate a lake",
    },
    oregon: { id: "oregon", label: "OR", name: "Oregon", targets: ["Oregon"] },
    texas: { id: "texas", label: "TX", name: "Texas", targets: ["Texas"] },
    maine: { id: "maine", label: "ME", name: "Maine", targets: ["Maine"] },
    montana: { id: "montana", label: "MT", name: "Montana", targets: ["Montana"] },
    wyoming: { id: "wyoming", label: "WY", name: "Wyoming", targets: ["Wyoming"] },
    southCarolina: { id: "south-carolina", label: "SC", name: "South Carolina", targets: ["South Carolina"] },
    rhodeIsland: { id: "rhode-island", label: "RI", name: "Rhode Island", targets: ["Rhode Island"] },
    margaritaville: {
        id: "margaritaville",
        label: "Margaritaville",
        name: "Margaritaville Wild Card",
        targets: [
            "Nevada",
            "Oklahoma",
            "Michigan",
            "Ohio",
            "New Jersey",
            "South Carolina",
            "Florida",
        ],
        wildcard: true,
    },
} as const satisfies Record<string, GameCard>;

type GameCardKey = keyof typeof seasonEighteenCards;
type CardLocation = "public" | TeamId;

type CardChange = {
    episode: EpisodeSlug;
    at: number;
    location: CardLocation;
    day?: 1 | 2 | 3 | 4 | 5;
    add?: readonly GameCardKey[];
    remove?: readonly GameCardKey[];
};

export type Claim = {
    id: string;
    episode: EpisodeSlug;
    startedAt: number;
    claimedAt: number;
    state: BoardRegion;
    team: TeamId;
    card: GameCardKey;
};

export type TeamScore = {
    score: number;
    statesClaimed: number;
    connectedArea: number;
    connectedStates: BoardRegion[];
};

export type PrivateCardSlot = {
    day: 1 | 2 | 3 | 4 | 5;
    card?: GameCard;
    cardKey?: GameCardKey;
    used: boolean;
};

export type GameBoardState = {
    activeClaims: Claim[];
    cardsByLocation: Record<CardLocation, GameCard[]>;
    claims: Map<BoardRegion, Claim>;
    privateSlots: Record<TeamId, PrivateCardSlot[]>;
    scores: Record<TeamId, TeamScore>;
};

// Draws and explicit discards live here. A successful claim is deliberately
// not duplicated as a hand change: getGameBoardState removes its card using
// the claim record below.
const cardChanges: CardChange[] = [
    { episode: "episode-1", at: 1 * 60 + 10, location: "public", add: ["illinois"] },
    { episode: "episode-1", at: 1 * 60 + 17, location: "public", add: ["wisconsin"] },
    { episode: "episode-1", at: 1 * 60 + 22, location: "public", add: ["nebraska"] },
    { episode: "episode-1", at: 1 * 60 + 24, location: "public", add: ["utah"] },
    { episode: "episode-1", at: 1 * 60 + 26, location: "public", add: ["tennessee"] },
    { episode: "episode-1", at: 1 * 60 + 31, location: "public", add: ["mississippi"] },
    { episode: "episode-1", at: 2 * 60 + 47, location: "sam-amy", day: 1, add: ["delaware"] },
    { episode: "episode-1", at: 2 * 60 + 56, location: "ben-adam", day: 1, add: ["louisiana"] },
    { episode: "episode-1", at: 30 * 60 + 36, location: "public", add: ["newYork"] },
    { episode: "episode-1", at: 30 * 60 + 55, location: "public", remove: ["wisconsin"] },
    { episode: "episode-1", at: 31 * 60 + 2, location: "public", add: ["michigan"] },
    { episode: "episode-1", at: 35 * 60 + 11, location: "public", add: ["canada"] },
    { episode: "episode-1", at: 35 * 60 + 29, location: "public", remove: ["newYork"] },
    { episode: "episode-1", at: 35 * 60 + 39, location: "public", add: ["vermont"] },
    { episode: "episode-1", at: 52 * 60 + 11, location: "public", add: ["southDakota"] },
    { episode: "episode-1", at: 52 * 60 + 29, location: "public", remove: ["michigan"] },
    { episode: "episode-1", at: 52 * 60 + 39, location: "public", add: ["georgia"] },
    { episode: "episode-2", at: 15 * 60 + 30, location: "public", add: ["districtOfColumbia"] },
    { episode: "episode-2", at: 15 * 60 + 52, location: "public", remove: ["districtOfColumbia"] },
    { episode: "episode-2", at: 15 * 60 + 56, location: "public", add: ["newHampshire"] },
    { episode: "episode-2", at: 19 * 60 + 21, location: "ben-adam", day: 2, add: ["california"] },
    { episode: "episode-2", at: 19 * 60 + 59, location: "sam-amy", day: 2, add: ["washington"] },
    { episode: "episode-2", at: 32 * 60 + 6, location: "public", add: ["ohio"] },
    { episode: "episode-2", at: 32 * 60 + 28, location: "public", remove: ["vermont"] },
    { episode: "episode-2", at: 32 * 60 + 36, location: "public", add: ["nationalPark"] },
    { episode: "episode-2", at: 51 * 60 + 55, location: "public", add: ["wisconsin"] },
    { episode: "episode-2", at: 52 * 60 + 24, location: "public", remove: ["nebraska"] },
    { episode: "episode-2", at: 52 * 60 + 39, location: "public", add: ["massachusetts"] },
    { episode: "episode-3", at: 7 * 60 + 57, location: "public", add: ["oklahoma"] },
    { episode: "episode-3", at: 8 * 60 + 18, location: "public", remove: ["wisconsin"] },
    { episode: "episode-3", at: 8 * 60 + 21, location: "public", add: ["kentucky"] },
    { episode: "episode-3", at: 14 * 60 + 5, location: "public", add: ["arizona"] },
    { episode: "episode-3", at: 14 * 60 + 13, location: "public", remove: ["ohio"] },
    { episode: "episode-3", at: 14 * 60 + 17, location: "public", add: ["alabama"] },
    { episode: "episode-3", at: 30 * 60 + 32, location: "public", add: ["newJersey"] },
    { episode: "episode-3", at: 30 * 60 + 51, location: "public", remove: ["newJersey"] },
    { episode: "episode-3", at: 31 * 60 + 6, location: "public", add: ["virginia"] },
    { episode: "episode-3", at: 31 * 60 + 27, location: "sam-amy", day: 3, add: ["iowa"] },
    { episode: "episode-3", at: 32 * 60 + 13, location: "ben-adam", day: 3, add: ["maryland"] },
    { episode: "episode-4", at: 19 * 60 + 20, location: "public", add: ["bucEes"] },
    { episode: "episode-4", at: 19 * 60 + 53, location: "public", remove: ["utah"] },
    { episode: "episode-4", at: 19 * 60 + 59, location: "public", add: ["northDakota"] },
    { episode: "episode-4", at: 27 * 60 + 18, location: "sam-amy", day: 4, add: ["oregon"] },
    { episode: "episode-4", at: 27 * 60 + 44, location: "ben-adam", day: 4, add: ["texas"] },
    { episode: "episode-4", at: 30 * 60 + 56, location: "public", remove: ["bucEes"] },
    { episode: "episode-4", at: 31 * 60 + 2, location: "public", add: ["northCarolina"] },
    { episode: "episode-4", at: 47 * 60 + 46, location: "public", remove: ["northDakota"] },
    { episode: "episode-4", at: 47 * 60 + 50, location: "public", add: ["pennsylvania"] },
    { episode: "episode-4", at: 56 * 60 + 8, location: "public", add: ["indiana"] },
    { episode: "episode-4", at: 56 * 60 + 22, location: "public", remove: ["northCarolina"] },
    { episode: "episode-4", at: 56 * 60 + 28, location: "public", add: ["minnesota"] },
    { episode: "episode-5", at: 16 * 60 + 40, location: "public", add: ["maine"] },
    { episode: "episode-5", at: 16 * 60 + 59, location: "public", remove: ["indiana"] },
    { episode: "episode-5", at: 17 * 60 + 5, location: "public", add: ["montana"] },
    { episode: "episode-5", at: 31 * 60 + 46, location: "public", add: ["newYork"] },
    { episode: "episode-5", at: 32 * 60 + 8, location: "public", remove: ["alabama"] },
    { episode: "episode-5", at: 32 * 60 + 15, location: "public", add: ["wyoming"] },
    { episode: "episode-5", at: 43 * 60 + 11, location: "public", add: ["southCarolina"] },
    { episode: "episode-5", at: 43 * 60 + 26, location: "public", remove: ["montana"] },
    { episode: "episode-5", at: 43 * 60 + 31, location: "public", add: ["margaritaville"] },
    { episode: "episode-5", at: 46 * 60 + 15, location: "sam-amy", day: 5, add: ["rhodeIsland"] },
];

const seasonEighteenClaims: Claim[] = [
    {
        id: "ben-adam-tennessee",
        episode: "episode-1",
        startedAt: 14 * 60 + 2,
        claimedAt: 30 * 60 + 4,
        state: "Tennessee",
        team: "ben-adam",
        card: "tennessee",
    },
    {
        id: "sam-amy-illinois",
        episode: "episode-1",
        startedAt: 17 * 60 + 24,
        claimedAt: 34 * 60 + 41,
        state: "Illinois",
        team: "sam-amy",
        card: "illinois",
    },
    {
        id: "ben-adam-mississippi",
        episode: "episode-1",
        startedAt: 32 * 60 + 55,
        claimedAt: 51 * 60 + 48,
        state: "Mississippi",
        team: "ben-adam",
        card: "mississippi",
    },
    {
        id: "sam-amy-canada",
        episode: "episode-2",
        startedAt: 4 * 60 + 19,
        claimedAt: 14 * 60 + 32,
        state: "Canada",
        team: "sam-amy",
        card: "canada",
    },
    {
        id: "ben-adam-georgia",
        episode: "episode-2",
        startedAt: 21 * 60 + 16,
        claimedAt: 31 * 60 + 25,
        state: "Georgia",
        team: "ben-adam",
        card: "georgia",
    },
    {
        id: "sam-amy-new-hampshire",
        episode: "episode-2",
        startedAt: 39 * 60 + 13,
        claimedAt: 51 * 60 + 19,
        state: "New Hampshire",
        team: "sam-amy",
        card: "newHampshire",
    },
    {
        id: "ben-adam-missouri",
        episode: "episode-3",
        startedAt: 20,
        claimedAt: 7 * 60 + 28,
        state: "Missouri",
        team: "ben-adam",
        card: "nationalPark",
    },
    {
        id: "sam-amy-massachusetts",
        episode: "episode-3",
        startedAt: 1 * 60 + 8,
        claimedAt: 13 * 60 + 14,
        state: "Massachusetts",
        team: "sam-amy",
        card: "massachusetts",
    },
    {
        id: "ben-adam-kentucky",
        episode: "episode-3",
        startedAt: 9 * 60 + 30,
        claimedAt: 25 * 60 + 41,
        state: "Kentucky",
        team: "ben-adam",
        card: "kentucky",
    },
    {
        id: "ben-adam-virginia",
        episode: "episode-4",
        startedAt: 7 * 60 + 26,
        claimedAt: 18 * 60 + 39,
        state: "Virginia",
        team: "ben-adam",
        card: "virginia",
    },
    {
        id: "sam-amy-iowa",
        episode: "episode-4",
        startedAt: 11 * 60 + 38,
        claimedAt: 30 * 60 + 10,
        state: "Iowa",
        team: "sam-amy",
        card: "iowa",
    },
    {
        id: "ben-adam-maryland",
        episode: "episode-4",
        startedAt: 33 * 60 + 5,
        claimedAt: 47 * 60 + 16,
        state: "Maryland",
        team: "ben-adam",
        card: "maryland",
    },
    {
        id: "sam-amy-south-dakota",
        episode: "episode-4",
        startedAt: 49 * 60 + 33,
        claimedAt: 55 * 60 + 11,
        state: "South Dakota",
        team: "sam-amy",
        card: "southDakota",
    },
    {
        id: "ben-adam-pennsylvania",
        episode: "episode-5",
        startedAt: 2 * 60 + 54,
        claimedAt: 16 * 60 + 1,
        state: "Pennsylvania",
        team: "ben-adam",
        card: "pennsylvania",
    },
    {
        id: "sam-amy-minnesota",
        episode: "episode-5",
        startedAt: 6 * 60 + 26,
        claimedAt: 30 * 60 + 46,
        state: "Minnesota",
        team: "sam-amy",
        card: "minnesota",
    },
    {
        id: "ben-adam-new-york",
        episode: "episode-5",
        startedAt: 35 * 60 + 1,
        claimedAt: 42 * 60 + 39,
        state: "New York",
        team: "ben-adam",
        card: "newYork",
    },
];

const gameBoardStateCache = new Map<number, GameBoardState>();
const emptyGameBoardState: GameBoardState = {
    activeClaims: [],
    cardsByLocation: makeEmptyCardsByLocation(),
    claims: new Map(),
    privateSlots: makeEmptyPrivateSlots(),
    scores: makeScores(new Map()),
};

function getGameBoardRevision(episode: string, currentTime: number) {
    const currentTimestamp = { episode, at: currentTime };
    const visibleCardChanges = cardChanges.reduce(
        (count, change) => count + Number(
            compareTimestamps(seasonEighteen, change, currentTimestamp) <= 0,
        ),
        0,
    );
    const claimBoundaries = seasonEighteenClaims.reduce((count, claim) => {
        const started = compareTimestamps(
            seasonEighteen,
            { episode: claim.episode, at: claim.startedAt },
            currentTimestamp,
        ) <= 0;
        const completed = compareTimestamps(
            seasonEighteen,
            { episode: claim.episode, at: claim.claimedAt },
            currentTimestamp,
        ) <= 0;

        return count + Number(started) + Number(completed);
    }, 0);

    return visibleCardChanges + claimBoundaries;
}

export function getGameBoardState(
    episode: string,
    currentTime: number,
): GameBoardState {
    if (!seasonEighteen.episodes.some(({ slug }) => slug === episode)) {
        return emptyGameBoardState;
    }

    const revision = getGameBoardRevision(episode, currentTime);
    const cachedState = gameBoardStateCache.get(revision);
    if (cachedState) return cachedState;

    const currentTimestamp = { episode, at: currentTime };
    const cardLocations = new Map<GameCardKey, CardLocation>();
    const privateSlots = makeEmptyPrivateSlots();

    for (const change of cardChanges) {
        if (compareTimestamps(seasonEighteen, change, currentTimestamp) > 0) {
            continue;
        }

        for (const card of change.remove ?? []) cardLocations.delete(card);
        for (const card of change.add ?? []) {
            cardLocations.set(card, change.location);

            if (change.location !== "public") {
                const nextSlot = change.day
                    ? privateSlots[change.location][change.day - 1]
                    : privateSlots[change.location].find((slot) => !slot.card);
                if (nextSlot) {
                    nextSlot.card = seasonEighteenCards[card];
                    nextSlot.cardKey = card;
                }
            }
        }
    }

    const claims = new Map<BoardRegion, Claim>();
    const usedCards = new Set<GameCardKey>();
    for (const claim of seasonEighteenClaims) {
        const claimTimestamp = { episode: claim.episode, at: claim.claimedAt };
        if (compareTimestamps(seasonEighteen, claimTimestamp, currentTimestamp) <= 0) {
            claims.set(claim.state, claim);
            cardLocations.delete(claim.card);
            usedCards.add(claim.card);
        }
    }

    for (const team of seasonEighteenTeamIds) {
        for (const slot of privateSlots[team]) {
            slot.used = Boolean(
                slot.cardKey && usedCards.has(slot.cardKey),
            );
        }
    }

    const cardsByLocation = makeEmptyCardsByLocation();
    for (const [card, location] of cardLocations) {
        cardsByLocation[location].push(seasonEighteenCards[card]);
    }

    const activeClaims = seasonEighteenClaims.filter((claim) =>
        isTimestampInRange(
            seasonEighteen,
            currentTimestamp,
            { episode: claim.episode, at: claim.startedAt },
            { episode: claim.episode, at: claim.claimedAt },
        ),
    );

    const gameBoardState = {
        activeClaims,
        cardsByLocation,
        claims,
        privateSlots,
        scores: makeScores(claims),
    };
    gameBoardStateCache.set(revision, gameBoardState);
    return gameBoardState;
}

function makeEmptyPrivateSlots(): Record<TeamId, PrivateCardSlot[]> {
    const days = [1, 2, 3, 4, 5] as const;

    return makeTeamRecord(() => days.map((day) => ({
        day,
        used: false,
    })));
}

function makeEmptyCardsByLocation(): Record<CardLocation, GameCard[]> {
    return {
        public: [],
        ...makeTeamRecord((): GameCard[] => []),
    };
}

function makeScores(
    claims: ReadonlyMap<BoardRegion, Claim>,
): Record<TeamId, TeamScore> {
    return makeTeamRecord((team) => {
        const states = [...claims.values()]
            .filter((claim) => claim.team === team)
            .map((claim) => claim.state);
        const largestComponent = getLargestConnectedComponent(states);

        return {
            score: largestComponent.length,
            statesClaimed: states.length,
            connectedArea: getArea(largestComponent),
            connectedStates: largestComponent,
        };
    });
}

function getLargestConnectedComponent(states: BoardRegion[]) {
    const remaining = new Set<BoardRegion>(states);
    let largest: BoardRegion[] = [];

    while (remaining.size) {
        const start = remaining.values().next().value;
        if (!start) break;

        const component: BoardRegion[] = [];
        const pending = [start];
        remaining.delete(start);

        while (pending.length) {
            const state = pending.pop();
            if (!state) continue;
            component.push(state);

            for (const neighbor of stateNeighbors[state] ?? []) {
                if (remaining.delete(neighbor)) pending.push(neighbor);
            }
        }

        if (
            component.length > largest.length ||
            (component.length === largest.length && getArea(component) > getArea(largest))
        ) {
            largest = component;
        }
    }

    return largest;
}

function getArea(states: readonly BoardRegion[]) {
    return states.reduce((total, state) => total + (regionAreas[state] ?? 0), 0);
}

// Connections use shared land borders. Canada is included so the wildcard can
// participate in the same scoring model once it is claimed.
const stateNeighbors: Partial<Record<BoardRegion, readonly BoardRegion[]>> = {
    Alabama: ["Florida", "Georgia", "Mississippi", "Tennessee"],
    Canada: ["Michigan", "Minnesota", "New Hampshire", "New York", "Vermont"],
    Delaware: ["Maryland", "New Jersey", "Pennsylvania"],
    Georgia: ["Alabama", "Florida", "North Carolina", "South Carolina", "Tennessee"],
    Illinois: ["Indiana", "Iowa", "Kentucky", "Missouri", "Wisconsin"],
    Iowa: ["Illinois", "Minnesota", "Missouri", "Nebraska", "South Dakota", "Wisconsin"],
    Louisiana: ["Arkansas", "Mississippi", "Texas"],
    Kentucky: ["Illinois", "Indiana", "Missouri", "Ohio", "Tennessee", "Virginia", "West Virginia"],
    Massachusetts: ["Connecticut", "New Hampshire", "New York", "Rhode Island", "Vermont"],
    Maryland: ["Delaware", "Pennsylvania", "Virginia", "West Virginia"],
    Michigan: ["Canada", "Indiana", "Ohio", "Wisconsin"],
    Mississippi: ["Alabama", "Arkansas", "Louisiana", "Tennessee"],
    Missouri: ["Arkansas", "Illinois", "Iowa", "Kansas", "Kentucky", "Nebraska", "Oklahoma", "Tennessee"],
    Minnesota: ["Canada", "Iowa", "North Dakota", "South Dakota", "Wisconsin"],
    Nebraska: ["Colorado", "Iowa", "Kansas", "Missouri", "South Dakota", "Wyoming"],
    "New Hampshire": ["Canada", "Maine", "Massachusetts", "Vermont"],
    "New York": ["Canada", "Connecticut", "Massachusetts", "New Jersey", "Pennsylvania", "Vermont"],
    Pennsylvania: ["Delaware", "Maryland", "New Jersey", "New York", "Ohio", "West Virginia"],
    "South Dakota": ["Iowa", "Minnesota", "Montana", "Nebraska", "North Dakota", "Wyoming"],
    Tennessee: ["Alabama", "Arkansas", "Georgia", "Kentucky", "Mississippi", "Missouri", "North Carolina", "Virginia"],
    Utah: ["Arizona", "Colorado", "Idaho", "Nevada", "Wyoming"],
    Vermont: ["Canada", "Massachusetts", "New Hampshire", "New York"],
    Virginia: ["Kentucky", "Maryland", "North Carolina", "Tennessee", "West Virginia"],
    Wisconsin: ["Illinois", "Iowa", "Michigan", "Minnesota"],
};

// Census Bureau MAF/TIGER total-area measurements in square miles, rounded to
// the nearest square mile. Only regions currently represented by game cards
// are needed here; add new card targets alongside their area.
const regionAreas: Partial<Record<BoardRegion, number>> = {
    Alabama: 52_420,
    Canada: 3_855_100,
    Delaware: 2_489,
    Georgia: 59_425,
    Illinois: 57_914,
    Iowa: 56_273,
    Kentucky: 40_408,
    Louisiana: 52_378,
    Michigan: 96_714,
    Massachusetts: 10_554,
    Maryland: 12_406,
    Mississippi: 48_432,
    Missouri: 69_707,
    Minnesota: 86_936,
    Nebraska: 77_348,
    "New Hampshire": 9_349,
    "New York": 54_555,
    Pennsylvania: 46_054,
    "South Dakota": 77_116,
    Tennessee: 42_144,
    Utah: 84_897,
    Vermont: 9_616,
    Virginia: 42_775,
    Wisconsin: 65_496,
};

function makeTeamRecord<Value>(
    getValue: (team: TeamId) => Value,
): Record<TeamId, Value> {
    return Object.fromEntries(
        seasonEighteenTeamIds.map((team) => [team, getValue(team)]),
    ) as Record<TeamId, Value>;
}
