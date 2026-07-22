import type { Coordinate } from "./tracker-routes";
import { trackerRoutePaths, type TrackerRouteId } from "./tracker-routes";
import type { TrackerLocation, TrackerPath } from "./tracker-model";

export const trackerLocations = {
    centralPark: { name: "Central Park", coordinate: [-73.9654, 40.7829] },
    seventySecondStreet: { name: "72 Street", coordinate: [-73.97641, 40.775594] },
    jacksonHeightsRoosevelt: { name: "Jackson Heights–Roosevelt Avenue", coordinate: [-73.891338, 40.746644] },
    lgaTerminalB: { name: "LGA Terminal B", coordinate: [-73.8727, 40.7745], airportCode: "LGA" },
    lgaTerminalC: { name: "LGA Terminal C", coordinate: [-73.8637, 40.7701], airportCode: "LGA" },
    ord: { name: "O’Hare Airport", coordinate: [-87.904223, 41.977665], airportCode: "ORD" },
    cumberlandMetra: { name: "Cumberland Station", coordinate: [-87.9122222, 42.0525] },
    desPlainesMetra: { name: "Des Plaines Station", coordinate: [-87.8866667, 42.0408333] },
    deeRoadMetra: { name: "Dee Road Station", coordinate: [-87.8561111, 42.0241667] },
    parkRidgeMetra: { name: "Park Ridge Station", coordinate: [-87.8316667, 42.0102778] },
    edisonParkMetra: { name: "Edison Park Station", coordinate: [-87.8175, 42.0022222] },
    jeffersonParkMetra: { name: "Jefferson Park Station", coordinate: [-87.7633333, 41.9713889] },
    mem: { name: "Memphis Airport", coordinate: [-89.980244, 35.050974], airportCode: "MEM" },
    hattieBs: { name: "Hattie B’s", coordinate: [-90.0024, 35.1232] },
    hernandoDeSotoPark: { name: "Hernando DeSoto River Park", coordinate: [-90.2456389, 34.9525556] },
    wallsPullOver: { name: "Walls pull-over", coordinate: [-90.1523, 34.9591] },
    dtw: { name: "Detroit Metropolitan Airport", coordinate: [-83.355955, 42.20783], airportCode: "DTW" },
    detroitWindsorTunnelBorder: { name: "U.S.–Canada border", coordinate: [-83.039775, 42.324476] },
    windsorCityHall: { name: "Downtown Windsor", coordinate: [-83.0349931, 42.3170535] },
    ambassadorBridge: { name: "Ambassador Bridge", coordinate: [-83.073407, 42.310948] },
    bos: { name: "Boston Logan Airport", coordinate: [-71.017981, 42.36224], airportCode: "BOS" },
    massachusettsNewHampshireBorder: { name: "New Hampshire border", coordinate: [-71.20975, 42.743436] },
    newHampshireMassachusettsI93Border: { name: "Massachusetts border", coordinate: [-71.210185, 42.743512] },
    londonderryHomeDepot: { name: "Home Depot", coordinate: [-71.3487084, 42.8611358] },
    merrimackCoveredBridge: { name: "Merrimack Covered Bridge", coordinate: [-71.5633, 42.8959] },
    paulReverePark: { name: "Paul Revere Park", coordinate: [-71.06248, 42.37013] },
    boston: { name: "Boston", coordinate: [-71.103519, 42.41103] },
    margaritavilleBoston: { name: "Jimmy Buffett’s Margaritaville", coordinate: [-71.0555, 42.3601] },
    mississippiAlabamaBorder: { name: "Alabama border", coordinate: [-88.188371, 34.201219] },
    birmingham: { name: "Birmingham", coordinate: [-86.8024326, 33.5206824] },
    alabamaGeorgiaBorder: { name: "Georgia border", coordinate: [-85.342673, 33.675677] },
    westGeorgia: { name: "West Georgia", coordinate: [-85.15864, 33.687314] },
    villaRicaMural: { name: "Coca-Cola ghost mural", coordinate: [-84.9199167, 33.7316944] },
    worldOfCocaCola: { name: "World of Coca-Cola", coordinate: [-84.3925521, 33.7628981] },
    atl: { name: "Atlanta Hartsfield-Jackson Airport", coordinate: [-84.446778, 33.640012], airportCode: "ATL" },
    stl: { name: "St. Louis Lambert Airport", coordinate: [-90.373804, 38.745163], airportCode: "STL" },
    gatewayArch: { name: "Gateway Arch", coordinate: [-90.183902, 38.624475] },
    rendLake: { name: "Rend Lake", coordinate: [-88.917895, 38.125657] },
    irvinCobbBridge: { name: "Irvin Cobb Bridge", coordinate: [-88.627287, 37.120018] },
    kentuckyAfterBridge: { name: "Kentucky", coordinate: [-88.631498, 37.107868] },
    paducahDistillery: { name: "Paducah Distillery", coordinate: [-88.600689, 37.086526] },
    missouriIowaBorder: { name: "Iowa border", coordinate: [-91.568573, 40.462653] },
    donnellsonDollarGeneral: { name: "Dollar General", coordinate: [-91.560091, 40.639028] },
    eddyvilleExit53: { name: "Eddyville", coordinate: [-92.632082, 41.132936] },
    desMoines: { name: "Des Moines", coordinate: [-93.624478, 41.585952] },
    iowaSouthDakotaBorder: { name: "South Dakota border", coordinate: [-96.477449, 42.495467] },
    northSiouxDollarGeneral: { name: "Dollar General", coordinate: [-96.494307, 42.524492] },
    duelArena: { name: "Duel Arena", coordinate: [-96.488361, 42.546566] },
    dca: { name: "Reagan National Airport", coordinate: [-77.04351, 38.851182], airportCode: "DCA" },
    jamesMonroeBirthplace: { name: "James Monroe’s Birthplace", coordinate: [-76.990576, 38.24192] },
    washingtonUnionStation: { name: "Washington Union Station", coordinate: [-77.0064, 38.8971] },
    baltimorePennStation: { name: "Baltimore Penn Station", coordinate: [-76.615815, 39.307251] },
    baltimoreInnerHarbor: { name: "Inner Harbor", coordinate: [-76.611, 39.285] },
    baltimoreWaterTaxi: { name: "Water Taxi", coordinate: [-76.575972, 39.255889] },
    fellsPoint: { name: "Fell’s Point", coordinate: [-76.591, 39.282] },
    baltimoreAquarium: { name: "Baltimore Aquarium", coordinate: [-76.606713, 39.285104] },
    leMars: { name: "Le Mars", coordinate: [-96.163996, 42.794293] },
    iowaMinnesotaBorder: { name: "Minnesota border", coordinate: [-95.594277, 43.499902] },
    okabenaLake: { name: "Okabena Lake", coordinate: [-95.615768, 43.610341] },
    timberLake: { name: "Timber Lake", coordinate: [-95.216409, 43.820222] },
    cottonwoodLake: { name: "Cottonwood Lake", coordinate: [-95.102068, 43.880106] },
    binghamLake: { name: "Bingham Lake", coordinate: [-95.046357, 43.906581] },
    saintJamesLake: { name: "Saint James Lake", coordinate: [-94.647329, 43.969453] },
    fedjeLake: { name: "Fedje Lake", coordinate: [-94.381833, 44.079536] },
    lakeCrystal: { name: "Lake Crystal", coordinate: [-94.218849, 44.10589] },
    loonLake: { name: "Loon Lake", coordinate: [-94.182039, 44.093707] },
    millsLake: { name: "Mills Lake", coordinate: [-94.145568, 44.078125] },
    lakeDorothy: { name: "Lake Dorothy", coordinate: [-93.960265, 44.171738] },
    mallOfAmerica: { name: "Mall of America", coordinate: [-93.242118, 44.856021] },
    msp: { name: "Minneapolis-St. Paul Airport", coordinate: [-93.21954, 44.879477] },
    philadelphia30thStreet: { name: "30th Street Station", coordinate: [-75.181244, 39.955522] },
    philadelphiaTarget: { name: "Target", coordinate: [-75.17253, 39.961796] },
    vanCollnField: { name: "Van Colln Memorial Field", coordinate: [-75.1752149, 39.9628114] },
    phlTerminalAWest: { name: "Philadelphia Int’l Airport", coordinate: [-75.252369, 39.874668] },
    newYorkPennStation: { name: "New York Penn Station", coordinate: [-73.9935, 40.7506] },
    empireStateBuilding: { name: "Empire State Building", coordinate: [-73.9857, 40.7484] },
    hertzWest34th: { name: "Hertz", coordinate: [-73.99474, 40.752724] },
} as const satisfies Record<string, TrackerLocation>;

export type LocationId = keyof typeof trackerLocations;

function distance(left: Coordinate, right: Coordinate) {
    return Math.hypot(left[0] - right[0], left[1] - right[1]);
}

function closestIndex(coordinates: readonly Coordinate[], target: Coordinate) {
    return coordinates.reduce((bestIndex, coordinate, index) =>
        distance(coordinate, target) < distance(coordinates[bestIndex], target)
            ? index
            : bestIndex, 0);
}

function pathFromCoordinates(
    coordinates: readonly Coordinate[],
    origin: LocationId,
    destination: LocationId,
    includedLocations: readonly LocationId[] = [],
): TrackerPath<LocationId> {
    const originCoordinate = trackerLocations[origin].coordinate;
    const destinationCoordinate = trackerLocations[destination].coordinate;
    const originIndex = closestIndex(coordinates, originCoordinate);
    const destinationIndex = closestIndex(coordinates, destinationCoordinate);
    const sliced = destinationIndex > originIndex
        ? coordinates.slice(originIndex + 1, destinationIndex)
        : [];
    const intermediates = [...sliced];

    includedLocations.forEach((location) => {
        const coordinate = trackerLocations[location].coordinate;
        if (intermediates.some((candidate) => distance(candidate, coordinate) < 1e-9)) {
            return;
        }
        const insertAt = closestIndex(
            [originCoordinate, ...intermediates, destinationCoordinate],
            coordinate,
        );
        intermediates.splice(Math.max(0, insertAt - 1), 0, coordinate);
    });

    return { origin, destination, intermediateCoordinates: intermediates };
}

function routePath(
    route: TrackerRouteId,
    origin: LocationId,
    destination: LocationId,
    includedLocations: readonly LocationId[] = [],
) {
    return pathFromCoordinates(
        trackerRoutePaths[route],
        origin,
        destination,
        includedLocations,
    );
}

function joinedCoordinates(...routes: readonly TrackerRouteId[]) {
    return routes.flatMap((route, index) =>
        index === 0 ? [...trackerRoutePaths[route]] : trackerRoutePaths[route].slice(1));
}

export const trackerPaths = {
    "central-park-72-street": routePath("nyc-lga-b", "centralPark", "seventySecondStreet"),
    "72-street-jackson-heights": routePath("nyc-lga-b", "seventySecondStreet", "jacksonHeightsRoosevelt"),
    "jackson-heights-lga-b": routePath("nyc-lga-b", "jacksonHeightsRoosevelt", "lgaTerminalB"),
    "jackson-heights-lga-c": routePath("nyc-lga-c", "jacksonHeightsRoosevelt", "lgaTerminalC"),
    "ord-cumberland": routePath("ord-cumberland", "ord", "cumberlandMetra"),
    "cumberland-des-plaines": routePath("metra-up-nw", "cumberlandMetra", "desPlainesMetra"),
    "des-plaines-dee-road": routePath("metra-up-nw", "desPlainesMetra", "deeRoadMetra"),
    "dee-road-park-ridge": routePath("metra-up-nw", "deeRoadMetra", "parkRidgeMetra"),
    "park-ridge-edison-park": routePath("metra-up-nw", "parkRidgeMetra", "edisonParkMetra"),
    "edison-park-jefferson-park": routePath("metra-up-nw", "edisonParkMetra", "jeffersonParkMetra"),
    "jefferson-park-ord": routePath("cta-blue-jefferson-ord", "jeffersonParkMetra", "ord"),
    "mem-hattie": routePath("mem-hattie", "mem", "hattieBs"),
    "hattie-river-park": routePath("hattie-river-park", "hattieBs", "hernandoDeSotoPark"),
    "river-park-mem": routePath("river-park-mem", "hernandoDeSotoPark", "mem", ["wallsPullOver"]),
    "dtw-tunnel-border": routePath("dtw-tunnel-border", "dtw", "detroitWindsorTunnelBorder"),
    "tunnel-border-windsor": routePath("tunnel-border-windsor", "detroitWindsorTunnelBorder", "windsorCityHall"),
    "windsor-ambassador": routePath("windsor-ambassador", "windsorCityHall", "ambassadorBridge"),
    "ambassador-dtw": routePath("ambassador-dtw", "ambassadorBridge", "dtw"),
    "bos-new-hampshire-border": routePath("bos-new-hampshire-border", "bos", "massachusettsNewHampshireBorder"),
    "new-hampshire-border-home-depot": routePath("new-hampshire-border-home-depot", "massachusettsNewHampshireBorder", "londonderryHomeDepot"),
    "home-depot-merrimack": routePath("home-depot-merrimack-bridge", "londonderryHomeDepot", "merrimackCoveredBridge"),
    "merrimack-massachusetts-border": routePath("merrimack-bridge-paul-revere-park", "merrimackCoveredBridge", "newHampshireMassachusettsI93Border"),
    "massachusetts-border-boston": routePath("merrimack-bridge-paul-revere-park", "newHampshireMassachusettsI93Border", "boston"),
    "boston-paul-revere": routePath("merrimack-bridge-paul-revere-park", "boston", "paulReverePark"),
    "margaritaville-bos": routePath("margaritaville-bos", "margaritavilleBoston", "bos"),
    "walls-alabama-border": routePath("walls-alabama-border", "wallsPullOver", "mississippiAlabamaBorder"),
    "alabama-border-birmingham": routePath("alabama-border-birmingham", "mississippiAlabamaBorder", "birmingham"),
    "birmingham-georgia-border": routePath("birmingham-georgia-border", "birmingham", "alabamaGeorgiaBorder"),
    "georgia-border-west": routePath("georgia-border-east", "alabamaGeorgiaBorder", "westGeorgia"),
    "west-georgia-villa-rica": routePath("georgia-line-villa-rica", "westGeorgia", "villaRicaMural"),
    "villa-rica-world-of-coca-cola": routePath("villa-rica-world-of-coca-cola", "villaRicaMural", "worldOfCocaCola"),
    "world-of-coca-cola-atl": routePath("world-of-coca-cola-atl", "worldOfCocaCola", "atl"),
    "stl-gateway-arch": routePath("stl-gateway-arch", "stl", "gatewayArch"),
    "st-louis-rend-lake": routePath("st-louis-paducah", "gatewayArch", "rendLake"),
    "rend-lake-irvin-cobb": routePath("st-louis-paducah", "rendLake", "irvinCobbBridge"),
    "irvin-cobb-kentucky": routePath("st-louis-paducah", "irvinCobbBridge", "kentuckyAfterBridge"),
    "kentucky-paducah": routePath("st-louis-paducah", "kentuckyAfterBridge", "paducahDistillery"),
    "paducah-stl": routePath("paducah-stl", "paducahDistillery", "stl"),
    "stl-missouri-iowa-border": routePath("stl-donnellson-dollar-general", "stl", "missouriIowaBorder"),
    "missouri-iowa-border-donnellson": routePath("stl-donnellson-dollar-general", "missouriIowaBorder", "donnellsonDollarGeneral"),
    "donnellson-eddyville": routePath("donnellson-eddyville", "donnellsonDollarGeneral", "eddyvilleExit53"),
    "eddyville-des-moines": routePath("eddyville-des-moines", "eddyvilleExit53", "desMoines"),
    "des-moines-south-dakota-border": routePath("des-moines-north-sioux-dollar-general", "desMoines", "iowaSouthDakotaBorder"),
    "south-dakota-border-north-sioux": routePath("des-moines-north-sioux-dollar-general", "iowaSouthDakotaBorder", "northSiouxDollarGeneral"),
    "north-sioux-duel-arena": routePath("north-sioux-dollar-general-duel-arena", "northSiouxDollarGeneral", "duelArena"),
    "dca-monroe": routePath("dca-james-monroe-birthplace", "dca", "jamesMonroeBirthplace"),
    "monroe-dca": routePath("james-monroe-birthplace-dca", "jamesMonroeBirthplace", "dca"),
    "dca-union-station": routePath("dca-union-station-wmata", "dca", "washingtonUnionStation"),
    "washington-baltimore": routePath("washington-union-baltimore-penn", "washingtonUnionStation", "baltimorePennStation"),
    "baltimore-penn-inner-harbor": routePath("baltimore-penn-inner-harbor", "baltimorePennStation", "baltimoreInnerHarbor"),
    "baltimore-water-taxi-fells-point": routePath("baltimore-water-taxi-fells-point", "baltimoreWaterTaxi", "fellsPoint"),
    "fells-point-aquarium": routePath("fells-point-baltimore-penn", "fellsPoint", "baltimoreAquarium"),
    "aquarium-inner-harbor": routePath("fells-point-baltimore-penn", "baltimoreAquarium", "baltimoreInnerHarbor"),
    "inner-harbor-baltimore-penn": routePath("fells-point-baltimore-penn", "baltimoreInnerHarbor", "baltimorePennStation"),
    "duel-arena-le-mars": routePath("north-sioux-minneapolis-msp", "duelArena", "leMars"),
    "le-mars-minnesota-border": routePath("north-sioux-minneapolis-msp", "leMars", "iowaMinnesotaBorder"),
    "minnesota-border-okabena": routePath("north-sioux-minneapolis-msp", "iowaMinnesotaBorder", "okabenaLake"),
    "okabena-timber": routePath("north-sioux-minneapolis-msp", "okabenaLake", "timberLake"),
    "timber-cottonwood": routePath("north-sioux-minneapolis-msp", "timberLake", "cottonwoodLake"),
    "cottonwood-bingham": routePath("north-sioux-minneapolis-msp", "cottonwoodLake", "binghamLake"),
    "bingham-saint-james": routePath("north-sioux-minneapolis-msp", "binghamLake", "saintJamesLake"),
    "saint-james-fedje": routePath("north-sioux-minneapolis-msp", "saintJamesLake", "fedjeLake"),
    "fedje-lake-crystal": routePath("north-sioux-minneapolis-msp", "fedjeLake", "lakeCrystal"),
    "lake-crystal-loon": routePath("north-sioux-minneapolis-msp", "lakeCrystal", "loonLake"),
    "loon-mills": routePath("north-sioux-minneapolis-msp", "loonLake", "millsLake"),
    "mills-lake-dorothy": routePath("north-sioux-minneapolis-msp", "millsLake", "lakeDorothy"),
    "lake-dorothy-mall": routePath("north-sioux-minneapolis-msp", "lakeDorothy", "mallOfAmerica"),
    "mall-msp": routePath("north-sioux-minneapolis-msp", "mallOfAmerica", "msp"),
    "baltimore-philadelphia": routePath("baltimore-penn-philadelphia-30th", "baltimorePennStation", "philadelphia30thStreet"),
    "philadelphia-30th-target": routePath("philadelphia-30th-target", "philadelphia30thStreet", "philadelphiaTarget"),
    "target-van-colln": routePath("philadelphia-target-van-colln-field", "philadelphiaTarget", "vanCollnField"),
    "van-colln-phl": routePath("van-colln-field-phl", "vanCollnField", "phlTerminalAWest"),
    "phl-30th": routePath("phl-30th-septa", "phlTerminalAWest", "philadelphia30thStreet"),
    "philadelphia-new-york": routePath("philadelphia-30th-new-york-penn", "philadelphia30thStreet", "newYorkPennStation"),
    "new-york-penn-empire-state": routePath("new-york-penn-empire-state", "newYorkPennStation", "empireStateBuilding"),
    "empire-state-hertz": routePath("empire-state-hertz", "empireStateBuilding", "hertzWest34th"),
    "georgia-border-atl": pathFromCoordinates(
        joinedCoordinates(
            "georgia-border-east",
            "georgia-line-villa-rica",
            "villa-rica-world-of-coca-cola",
            "world-of-coca-cola-atl",
        ),
        "alabamaGeorgiaBorder",
        "atl",
        ["westGeorgia"],
    ),
} as const satisfies Record<string, TrackerPath<LocationId>>;

export type PathId = keyof typeof trackerPaths;

export function materializePath(pathId: PathId): readonly Coordinate[] {
    const path = trackerPaths[pathId];
    return [
        trackerLocations[path.origin].coordinate,
        ...path.intermediateCoordinates,
        trackerLocations[path.destination].coordinate,
    ];
}
