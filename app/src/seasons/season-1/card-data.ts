
export type ChallengeCard = {
    id: string;
    title: string;
    description: string;
};

export const seasonOneCards = {
    catchBugs: {
        id: "catch-bugs",
        title: "Catch 3 different local bugs",
        description: "You must have all 3 bugs at the same time. The bugs do not have to be local in origin, but you must have caught them in the state. They must be different kinds of bugs. You may not, for example, catch 3 mosquitos.",
    },
    getIntoxicated: {
        id: "get-intoxicated",
        title: "Get one team member intoxicated",
        description: "You may get intoxicated at any bar in the state. If there are no bars open, you may go to a restaurant. If there are no restaurants or bars open, you may get drunk wherever you like. If it is impossible to buy alcohol in the next hour, you may draw another card. See the intoxication chart for reference."
    },
    eatSpicyFood: {
        id: "eat-spicy-food",
        title: "Eat spicy food",
        description: "Go to a local Indian restaurant and ask them for the hottest food they can serve you. Eat the entire thing. While ordering, you must say, \"I want the spiciest thing on the menu.\" If there is no Indian restaurant open within 20 miles, you may go to a Chinese, Thai or Mexican restaurant. If no such restaurants are open within 20 miles, you may draw another card."
    },
    bowlAStrike: {
        id: "bowl-a-strike",
        title: "Bowl a strike",
        description: "It must be at a bowling alley. You cannot use makeshift bowling pins. If there is not an open bowling alley within 20 miles, you may pull another card."
    },
    solvePuzzle: {
        id: "solve-puzzle",
        title: "Buy the local paper and solve one of the puzzles",
        description: "The paper must be local to the town or the state. If no local paper has any puzzles, then draw a new card."
    },
    buryTreasure: {
        id: "bury-treasure",
        title: "Bury a treasure",
        description: "The treasure must be worth at least $50. You must leave a conspicuous sign next to the treasure so that someone may find it. The buried treasure must be completely covered. The treasure must be at least 3 inches underground. The treasure cannot be cash or a check. You must preserve the treasure such that whoever digs it up can use/enjoy it. This may be as simple as putting it in a plastic bag."
    },
    recreateStatue: {
        id: "recreate-statue",
        title: "Find a statue and recreate it",
        description: "The statue must be at least 100 meters from the captiol building. You may not use the internet to locate a statue. You must hold the pose for at least 5 minutes. The statue does not need to be human, but you still must do your best to recreate it with your bodies."
    },
    paintTeammate: {
        id: "paint-teammate",
        title: "Paint your teammate's face as the state flag",
        description: "Only one teammate must get their face painted. This must cover their full face. It must recognizably be the state flag. You can use any paint, but you should probably use face paint. Makeup is also acceptable."
    },
    busk: {
        id: "busk",
        title: "Busk until you earn one dollar",
        description: "You may have a sign, but you may not verbally ask people for money. You must do some sort of performance to earn the money; you cannot just ask for it. You may add any money earned to your budget."
    },
    stateDessert: {
        id: "state-dessert",
        title: "Eat the state dessert",
        description: "You must eat at least one serving of the dessert - a serving is up to your own reasonable interpretation. See the state dessert guide for reference."
    },
    stateDish: {
        id: "state-dish",
        title: "Eat the state dish",
        description: "You must eat at least one serving of the dish - a serving is up to your own reasonable interpretation. See the state dish guide for reference."
    },
    claimImmidiately: {
        id: "claim-immidiately",
        title: "Claim the state immidiately, but...",
        description: "In order to book your next flight, you must call the airline and not use any of the following words. If you say any of the words, you must apologize, hang up, and try again. You may not rehearse or write out what you are going to say ahead of time. Banned words: flight, fly, go, plane, time, yes, no, arrive, depart, leaving, get, want, hello, hi, (any city name)."
    }
} as const satisfies Record<string, ChallengeCard>;

export type ChallengeCardKey = keyof typeof seasonOneCards;
