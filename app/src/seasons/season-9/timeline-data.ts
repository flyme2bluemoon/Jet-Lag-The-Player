import markup from "./episode-1-events.json";
import { seasonNine } from "@/data/season-9";
import { compareTimestamps, formatEpisodeLabel, formatTimestamp, type EpisodeTimestamp } from "@/lib/timestamps";

export type PlayerId = "sam" | "adam" | "ben";
export type QuestionCategory = "relative" | "radar" | "photo" | "oddball" | "precision" | "unknown";

type EventMetadata = {
    hider?: PlayerId;
    questionType?: QuestionCategory;
    questionId?: string;
    questionLabel?: string;
    coins?: number;
    questionEventId?: string;
    questionResponseEventId?: string;
    response?: string;
    responseKind?: "veto";
    diceCount?: number;
    curseId?: string;
    curseTypeId?: string;
    curseName?: string;
    curseRoll?: string;
    durationSeconds?: number;
};

type SeasonNineEvent = {
    id: string;
    episode: string;
    at: number;
    type: string;
    metadata: EventMetadata;
};

export type InvestigationQuestion = {
    id: string;
    eventId: string;
    category: QuestionCategory;
    label: string;
    description: string;
    coins: number;
    askedAt: EpisodeTimestamp;
    responseAt?: EpisodeTimestamp;
    response: string | null;
    responseAsset: string | null;
    status: "waiting" | "received" | "answered" | "vetoed";
};

export type CurseRecord = {
    purchaseId: string;
    name: string;
    description: string;
    diceCount: number;
    roll: number;
    purchasedAt: EpisodeTimestamp;
    rolledAt: EpisodeTimestamp;
    active: boolean;
};

export type CompletedRun = {
    hider: PlayerId;
    durationSeconds: number;
    endedAt: EpisodeTimestamp;
};

export type SeasonNineState = {
    currentHider: PlayerId;
    currentRunActive: boolean;
    currentRunStartedAt: EpisodeTimestamp;
    endgame: boolean;
    coinBalance: number;
    questions: readonly InvestigationQuestion[];
    curses: readonly CurseRecord[];
    activeCurse: CurseRecord | null;
    curseLogVisible: boolean;
    leaderboard: readonly CompletedRun[];
};

const events = (markup.events as readonly SeasonNineEvent[]).toSorted((left, right) => {
    const timestampComparison = compareTimestamps(seasonNine, left, right);
    if (timestampComparison !== 0) return timestampComparison;

    if (left.type === "question-response" && right.type === "question-response-revealed") return -1;
    if (left.type === "question-response-revealed" && right.type === "question-response") return 1;
    return 0;
});

const QUESTION_DESCRIPTIONS: Record<string, string> = {
    longitude: "Is your longitude higher or lower than ours?",
    latitude: "Is your latitude higher or lower than ours?",
    "five-buildings": "Send a photo where at least five buildings are visible.",
    "25-miles": "Are you within 25 miles of the seekers?",
    "10-miles": "Are you within 10 miles of the seekers?",
    "hotel-price": "What is the rounded price of your nearest hotel?",
    "train-station": "Send a photo of the nearest train station.",
    "photo-straight-up": "Without moving, send a photo with the camera facing straight up.",
    selfie: "Without moving, take a picture facing you at arm’s length.",
    "five-words": "Send us five words. One of them has to rhyme with your town name.",
    "political-party": "Did your location vote for the same political party as ours?",
    "largest-body-of-water": "Send a photo of the largest body of water where you are.",
    "town-hall": "Send a picture of your town hall.",
    strava: "Send a Strava map of yourself running ½ mile on local streets.",
    "tallest-visible-mountain": "Send a photo of the tallest visible mountain based on your sightline.",
    "street-starting-letter-number": "What is the first letter or number of your nearest street?",
    "train-station-walking-distance": "How long would it take to walk to the nearest train station?",
    "geographic-region": "Are you in the same geographic region as us?",
    canton: "Are you in the same Canton as us?",
    "5-miles": "Are you within 5 miles of the seekers?",
    "50-miles": "Are you within 50 miles of the seekers?",
    mcdonalds: "Send a photo of a McDonald’s.",
    "train-departure": "Is the next train at your nearest station at an odd or even time?",
    "bird-facetime": "FaceTime us until you show us a bird.",
    "street-orientation": "What intercardinal direction does your nearest street run?",
    "half-mile": "Are you within ½ mile of the seekers?",
    "feet-from-nearest-road": "Rounded to 5, how many feet are you from the nearest road?",
    "feet-from-nearest-intersection": "Rounded to 5, how many feet are you from the nearest intersection?",
    "same-street": "Are you on the same street as us?",
};

const CURSE_DESCRIPTIONS: Record<string, string> = {
    "william-tell": "Before asking the next question, knock an apple off your partner’s head from 10 feet away.",
    "swiss-clock": "Before asking the next question, clap 15 seconds after your partner starts a timer, within half a second. A failed attempt requires a 10-minute wait.",
    "cheese-rolling": "Before asking the next question, roll cheese 30 feet in a single roll.",
    "swiss-cheese": "Before asking the next question, acquire 8 ounces of Swiss cheese and fill its outside holes with other cheeses until it looks solid.",
};

const RESPONSE_ASSETS: Record<string, string> = {
    "adam_run-1_five-buildings.jpg": "/season-9/responses/adam_run-1_five-buildings.jpg",
    "adam_run-1_straight-up.jpg": "/season-9/responses/adam_run-1_straight-up.jpg",
    "adam_run-1_selfie.jpg": "/season-9/responses/adam_run-1_selfie.jpg",
    "ben_run1_mountain.jpg": "/season-9/responses/ben_run1_mountain.jpg",
    "ben_run1_photo-up.jpg": "/season-9/responses/ben_run1_photo-up.jpg",
    "ben_run1_selfie.jpg": "/season-9/responses/ben_run1_selfie.jpg",
    "ben_run1_strava.jpg": "/season-9/responses/ben_run1_strava.jpg",
    "ben_run1_train-station.jpg": "/season-9/responses/ben_run1_train-station.jpg",
    "ben_run1_water.jpg": "/season-9/responses/ben_run1_water.jpg",
    "sam_run1_mcd.jpg": "/season-9/responses/sam_run1_mcd.jpg",
    "sam_run1_photo-up.jpg": "/season-9/responses/sam_run1_photo-up.jpg",
    "sam_run1_train-station.jpg": "/season-9/responses/sam_run1_train-station.jpg",
    "adam_run2_train-station.jpg": "/season-9/responses/adam_run2_train-station.jpg",
    "adam_run2_5buildings.jpg": "/season-9/responses/adam_run2_5buildings.jpg",
};

const stateCache = new Map<string, SeasonNineState>();
const CURSE_LOG_REVEAL: EpisodeTimestamp = { episode: "episode-1", at: 13 * 60 + 9 };

function required<T>(value: T | undefined, field: string): T {
    if (value === undefined) {
        throw new Error(`Season 9 event is missing ${field}.`);
    }
    return value;
}

function eventTimestamp(event: SeasonNineEvent): EpisodeTimestamp {
    return { episode: event.episode, at: event.at };
}

export function formatSeasonNineTimestamp(timestamp: EpisodeTimestamp) {
    return `${formatEpisodeLabel(timestamp.episode)} · ${formatTimestamp(timestamp.at)}`;
}

export function getSeasonNineState(episodeSlug: string, currentTime: number): SeasonNineState {
    const curseLogVisible = compareTimestamps(
        seasonNine,
        { episode: episodeSlug, at: currentTime },
        CURSE_LOG_REVEAL,
    ) >= 0;
    const visibleEvents = events.filter((event) =>
        compareTimestamps(seasonNine, event, { episode: episodeSlug, at: currentTime }) <= 0,
    );
    const cacheKey = `${episodeSlug}:${visibleEvents.length}:${curseLogVisible}`;
    const cached = stateCache.get(cacheKey);
    if (cached) return cached;

    let currentHider: PlayerId = "adam";
    let currentRunActive = true;
    let currentRunStartedAt: EpisodeTimestamp = { episode: "episode-1", at: 0 };
    let endgame = false;
    let coinBalance = 0;
    const questions: InvestigationQuestion[] = [];
    const questionByEvent = new Map<string, InvestigationQuestion>();
    const questionByResponseEvent = new Map<string, InvestigationQuestion>();
    const curses: CurseRecord[] = [];
    const curseByPurchase = new Map<string, CurseRecord>();
    const purchases = new Map<string, { diceCount: number; purchasedAt: EpisodeTimestamp }>();
    const completedRuns: CompletedRun[] = [];

    for (const event of visibleEvents) {
        const metadata = event.metadata;

        switch (event.type) {
            case "hider-change": {
                currentHider = required(metadata.hider, "hider");
                currentRunActive = true;
                currentRunStartedAt = eventTimestamp(event);
                endgame = false;
                coinBalance = 0;
                questions.length = 0;
                questionByEvent.clear();
                questionByResponseEvent.clear();
                curses.length = 0;
                curseByPurchase.clear();
                purchases.clear();
                break;
            }
            case "question-asked": {
                const questionId = required(metadata.questionId, "questionId");
                const coins = required(metadata.coins, "coins");
                const question: InvestigationQuestion = {
                    id: questionId,
                    eventId: event.id,
                    category: required(metadata.questionType, "questionType"),
                    label: required(metadata.questionLabel, "questionLabel"),
                    description: QUESTION_DESCRIPTIONS[questionId] ?? required(metadata.questionLabel, "questionLabel"),
                    coins,
                    askedAt: eventTimestamp(event),
                    response: null,
                    responseAsset: null,
                    status: "waiting",
                };
                questions.push(question);
                questionByEvent.set(event.id, question);
                coinBalance += coins;
                break;
            }
            case "question-response": {
                const question = questionByEvent.get(required(metadata.questionEventId, "questionEventId"));
                if (!question) break;
                question.responseAt = eventTimestamp(event);
                question.status = metadata.responseKind === "veto" ? "vetoed" : "received";
                if (metadata.responseKind === "veto") {
                    question.response = "Unavailable — the seekers entered the hiding zone.";
                }
                questionByResponseEvent.set(event.id, question);
                break;
            }
            case "question-response-revealed": {
                const question = questionByResponseEvent.get(required(metadata.questionResponseEventId, "questionResponseEventId"));
                if (!question) break;
                const response = required(metadata.response, "response");
                question.response = /\.(?:jpe?g|png|webp)$/i.test(response) ? "Photo received" : response;
                question.responseAsset = RESPONSE_ASSETS[response] ?? null;
                question.status = "answered";
                break;
            }
            case "curse-purchased": {
                const diceCount = required(metadata.diceCount, "diceCount");
                purchases.set(event.id, { diceCount, purchasedAt: eventTimestamp(event) });
                coinBalance -= diceCount * 50;
                break;
            }
            case "curse-dice-rolled": {
                const purchaseId = required(metadata.curseId, "curseId");
                const purchase = purchases.get(purchaseId);
                if (!purchase) break;
                const curseTypeId = required(metadata.curseTypeId, "curseTypeId");
                const curse: CurseRecord = {
                    purchaseId,
                    name: required(metadata.curseName, "curseName"),
                    description: CURSE_DESCRIPTIONS[curseTypeId] ?? required(metadata.curseName, "curseName"),
                    diceCount: purchase.diceCount,
                    roll: Number(required(metadata.curseRoll, "curseRoll")),
                    purchasedAt: purchase.purchasedAt,
                    rolledAt: eventTimestamp(event),
                    active: true,
                };
                curses.push(curse);
                curseByPurchase.set(purchaseId, curse);
                break;
            }
            case "curse-expired": {
                const curse = curseByPurchase.get(required(metadata.curseId, "curseId"));
                if (curse) curse.active = false;
                break;
            }
            case "endgame-started": {
                endgame = true;
                break;
            }
            case "run-ended": {
                completedRuns.push({
                    hider: required(metadata.hider, "hider"),
                    durationSeconds: required(metadata.durationSeconds, "durationSeconds"),
                    endedAt: eventTimestamp(event),
                });
                currentRunActive = false;
                endgame = false;
                for (const curse of curses) curse.active = false;
                break;
            }
        }
    }

    const leaderboard = completedRuns.toSorted((left, right) => right.durationSeconds - left.durationSeconds);
    const activeCurse = curses.findLast((curse) => curse.active) ?? null;
    const state: SeasonNineState = {
        currentHider,
        currentRunActive,
        currentRunStartedAt,
        endgame,
        coinBalance,
        questions,
        curses,
        activeCurse,
        curseLogVisible,
        leaderboard,
    };
    stateCache.set(cacheKey, state);
    return state;
}
