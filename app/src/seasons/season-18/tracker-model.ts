import type { AirportRef } from "@/components/ui/flight";
import type { seasonEighteen } from "@/data/season-18";

import type { TeamId } from "./team-data";
import type { Coordinate } from "./tracker-routes";

export type EpisodeSlug = (typeof seasonEighteen.episodes)[number]["slug"];
export type FlightAirport = Extract<AirportRef, string>;

export type TrackerTimestamp = Readonly<{
    episode: EpisodeSlug;
    at: number;
}>;

export type TimeRange = Readonly<{
    start: TrackerTimestamp;
    end: TrackerTimestamp;
}>;

export type TrackerStatus = Readonly<{
    primary: string;
    secondary: string;
}>;

export type TrackerLocation = Readonly<{
    name: string;
    coordinate: Coordinate;
    airportCode?: FlightAirport;
}>;

export type TrackerPath<Location extends string = string> = Readonly<{
    origin: Location;
    destination: Location;
    intermediateCoordinates: readonly Coordinate[];
}>;

export type MapLabel = Readonly<{
    text?: string;
}>;

export type EndpointLabel<Location extends string = string> =
    | false
    | Readonly<{
        text?: string;
        location?: Location;
        visibleFrom?: TrackerTimestamp;
    }>;

export type TravelDisplay<Location extends string = string> = Readonly<{
    revealPath?: "full" | "traveled";
    originLabel?: EndpointLabel<Location>;
    destinationLabel?: EndpointLabel<Location>;
}>;

export type StationaryEvent<Location extends string = string> = Readonly<{
    id: string;
    kind: "stationary";
    at: TrackerTimestamp;
    location: Location;
    status: TrackerStatus;
}>;

export type GroundPathPhase<
    Path extends string = string,
    Location extends string = string,
> = Readonly<{
    kind: "path";
    path: Path;
    time: TimeRange;
    status?: TrackerStatus;
    display?: TravelDisplay<Location>;
    destWaypointMapLabel?: MapLabel;
    setIntermediateOrigin?: boolean;
}>;

export type GroundDwellPhase<Location extends string = string> = Readonly<{
    kind: "dwell";
    location: Location;
    time: TimeRange;
    status?: TrackerStatus;
    display?: TravelDisplay<Location>;
    mapLabel?: MapLabel;
    setIntermediateOrigin?: boolean;
}>;

export type GroundPhase<
    Path extends string = string,
    Location extends string = string,
> = GroundPathPhase<Path, Location> | GroundDwellPhase<Location>;

export type GroundTravelEvent<
    Path extends string = string,
    Location extends string = string,
> = Readonly<{
    id: string;
    kind: "ground";
    origin: Location;
    destination: Location;
    status: TrackerStatus;
    phases: readonly [GroundPhase<Path, Location>, ...GroundPhase<Path, Location>[]];
    interruption?: Location;
    display?: TravelDisplay<Location>;
}>;

export type FlightPhase<Location extends string = string> = Readonly<{
    kind: "flight";
    time: TimeRange;
    progress?: Readonly<{ from: number; to: number }>;
    status?: TrackerStatus;
    display?: TravelDisplay<Location>;
}>;

export type FlightTravelEvent<Location extends string = string> = Readonly<{
    id: string;
    kind: "flight";
    origin: Location;
    destination: Location;
    status: TrackerStatus;
    phases: readonly [FlightPhase<Location>, ...FlightPhase<Location>[]];
    display?: TravelDisplay<Location>;
}>;

export type TrackerEvent<
    Path extends string = string,
    Location extends string = string,
> =
    | StationaryEvent<Location>
    | GroundTravelEvent<Path, Location>
    | FlightTravelEvent<Location>;

export type TrackerTimeline<
    Path extends string = string,
    Location extends string = string,
> = Readonly<Record<TeamId, readonly TrackerEvent<Path, Location>[]>>;

export type ResolvedEndpointLabel<Location extends string = string> = Readonly<{
    text: string;
    location: Location;
    coordinate: Coordinate;
}>;

export type ResolvedTravelDisplay<Location extends string = string> = Readonly<{
    revealPath: "full" | "traveled";
    originLabel: ResolvedEndpointLabel<Location> | null;
    destinationLabel: ResolvedEndpointLabel<Location> | null;
    waypointLabels: readonly ResolvedEndpointLabel<Location>[];
}>;

export type ResolvedGroundTrajectory = Readonly<{
    kind: "ground";
    coordinates: readonly Coordinate[];
    progressFrom: number;
    progressTo: number;
}>;

export type ResolvedFlightTrajectory = Readonly<{
    kind: "flight";
    from: FlightAirport;
    to: FlightAirport;
    progressFrom: number;
    progressTo: number;
}>;

type ResolvedTrackerIntervalBase = Readonly<{
    id: string;
    eventId: string;
    team: TeamId;
    time: TimeRange;
    status: TrackerStatus;
}>;

export type ResolvedTrackerInterval<Location extends string = string> =
    ResolvedTrackerIntervalBase & (
        | Readonly<{
            kind: "stationary";
            location: Location;
            coordinate: Coordinate;
        }>
        | Readonly<{
            kind: "ground";
            trajectory: ResolvedGroundTrajectory;
            display: ResolvedTravelDisplay<Location>;
        }>
        | Readonly<{
            kind: "flight";
            trajectory: ResolvedFlightTrajectory;
            display: ResolvedTravelDisplay<Location>;
        }>
    );
