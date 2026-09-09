"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapMarker,
  MapRoute,
  MarkerContent,
  useMap,
} from "@/components/ui/map";
import { MAPLIBRE_COLORS } from "@/components/ui/map-colors";
import { cn } from "@/lib/utils";
import type { TeamTrackerState } from "./game-board";
import { seasonNineteenTeamIds, seasonNineteenTeams } from "./team-data";
import type {
  SeasonNineteenPlaceId,
  SeasonNineteenTeamId,
} from "./timeline-data";

const DASH_LENGTH = 1.6;
const GAP_LENGTH = 2.2;
const DASH_STEPS = 24;

const DASH_FRAMES = Array.from({ length: DASH_STEPS }, (_unused, step) => {
  const offset = (step / DASH_STEPS) * (DASH_LENGTH + GAP_LENGTH);
  if (offset <= GAP_LENGTH) {
    return [0, offset, DASH_LENGTH, GAP_LENGTH - offset];
  }
  const wrapped = offset - GAP_LENGTH;
  return [wrapped, GAP_LENGTH, DASH_LENGTH - wrapped, 0];
});

function useDashFrame(active: boolean) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(
      () => setFrame((current) => (current + 1) % DASH_FRAMES.length),
      120,
    );
    return () => window.clearInterval(interval);
  }, [active]);

  return DASH_FRAMES[frame]!;
}

const ROUTE_MARKER_MINIMUM_SCALE = 0.68;
const ROUTE_MARKER_SCALE_START_ZOOM = 5.5;
const ROUTE_MARKER_FULL_SIZE_ZOOM = 9;
/** Stationary place names appear once the map is zoomed past regional overview. */
const PLACE_LABEL_MIN_ZOOM = 7;

function routeMarkerScale(zoom: number) {
  const progress = Math.max(
    0,
    Math.min(
      1,
      (zoom - ROUTE_MARKER_SCALE_START_ZOOM) /
        (ROUTE_MARKER_FULL_SIZE_ZOOM - ROUTE_MARKER_SCALE_START_ZOOM),
    ),
  );
  return (
    ROUTE_MARKER_MINIMUM_SCALE + progress * (1 - ROUTE_MARKER_MINIMUM_SCALE)
  );
}

function useMapZoom() {
  const { map } = useMap();
  const [zoom, setZoom] = useState(
    () => map?.getZoom() ?? ROUTE_MARKER_FULL_SIZE_ZOOM,
  );

  useEffect(() => {
    if (!map) return;
    const update = () => setZoom(map.getZoom());
    update();
    map.on("zoom", update);
    return () => {
      map.off("zoom", update);
    };
  }, [map]);

  return zoom;
}

function MarkerLabel({
  children,
  color,
  className,
}: {
  children: string;
  /** Team map color; when set, fills the label and uses a dark stroke. */
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-heading flex h-6 items-center rounded-md px-2 text-xs leading-none font-bold whitespace-nowrap uppercase",
        color
          ? "border-2 border-jet-lag-navy-blue text-challenge-card-paper"
          : "bg-jet-lag-navy-blue text-challenge-card-paper dark:bg-challenge-card-paper dark:text-jet-lag-navy-blue",
        className,
      )}
      style={color ? { backgroundColor: color } : undefined}
    >
      {children}
    </span>
  );
}

function TeamDot({
  colors,
  className,
  compact = false,
}: {
  colors: readonly string[];
  className?: string;
  compact?: boolean;
}) {
  const [leftColor = MAPLIBRE_COLORS.jetLagYellow, rightColor = leftColor] =
    colors;
  const isSplit = rightColor !== leftColor;

  return (
    <span
      className={cn(
        "bg-jet-lag-navy-blue dark:bg-challenge-card-paper relative z-10 flex shrink-0 items-center justify-center rounded-full",
        compact ? "size-3" : "size-6",
        className,
      )}
    >
      <span
        className={cn(
          "ring-challenge-card-paper/70 dark:ring-jet-lag-navy-blue/70 block rounded-full shadow-sm ring-1",
          compact ? "size-2" : "size-4",
        )}
        style={
          isSplit
            ? {
                backgroundImage: `linear-gradient(90deg, ${leftColor} 0 50%, ${rightColor} 50% 100%)`,
              }
            : { backgroundColor: leftColor }
        }
        aria-hidden="true"
      />
    </span>
  );
}

type LabelPlacement = "left" | "right" | "center";

/**
 * Dot stays pinned to the map coordinate. The team callout stays level above;
 * optional left/right placement offsets it while the pointer leans to the tip.
 * The place name sits below the tip in the same navy pill used for transit ends.
 */
function StaticLocationBadge({
  colors,
  teamLabel,
  placeLabel,
  showPlaceLabel,
  scale,
  placement = "center",
}: {
  colors: readonly string[];
  teamLabel: string;
  placeLabel: string;
  showPlaceLabel: boolean;
  scale: number;
  placement?: LabelPlacement;
}) {
  return (
    <MarkerContent className="pointer-events-none">
      <div
        className="relative drop-shadow-sm"
        style={{
          width: 0,
          height: 0,
          transform: `scale(${scale})`,
          transformOrigin: "center bottom",
        }}
      >
        <StationaryCallout
          label={teamLabel}
          color={colors[0] ?? MAPLIBRE_COLORS.jetLagYellow}
          placement={placement}
        />
        <div className="absolute bottom-0 left-0 -translate-x-1/2">
          <TeamDot colors={colors} compact />
        </div>
        {showPlaceLabel ? (
          <div className="absolute top-1 left-0 -translate-x-1/2">
            <MarkerLabel>{placeLabel}</MarkerLabel>
          </div>
        ) : null}
      </div>
    </MarkerContent>
  );
}

/** Level team-colored label + tail as one stroked shape (no seam at the join). */
function StationaryCallout({
  label,
  color,
  placement,
}: {
  label: string;
  color: string;
  placement: LabelPlacement;
}) {
  const height = 24;
  const radius = 6;
  const tailHeight = 12;
  const width = Math.ceil(Math.max(label.length * 7.4 + 20, 84));
  /** Horizontal gap from the label's inner edge to the shared tip. */
  const tailReach = 5;
  const svgWidth = placement === "center" ? width : width + tailReach;
  const svgHeight = height + tailHeight;
  const path = speechBubblePath({
    width,
    height,
    radius,
    tailHeight,
    tailReach,
    placement,
  });
  const bubbleLeft = placement === "right" ? tailReach : 0;

  return (
    <div
      className={cn(
        "absolute bottom-2",
        placement === "center" && "left-0 -translate-x-1/2",
        // Tip sits on the shared origin; labels hug either side with only tailReach between them.
        placement === "left" && "right-0",
        placement === "right" && "left-0",
      )}
      style={{ width: svgWidth, height: svgHeight }}
    >
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="absolute inset-0 overflow-visible"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d={path}
          fill={color}
          stroke={MAPLIBRE_COLORS.jetLagNavyBlue}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="font-heading text-challenge-card-paper absolute top-0 flex h-6 items-center justify-center px-2 text-xs leading-none font-bold whitespace-nowrap uppercase"
        style={{ left: bubbleLeft, width }}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * Single closed outline for a rounded label plus skewed pointer, so fill and
 * stroke stay continuous (no horizontal join line between box and tail).
 */
function speechBubblePath({
  width,
  height,
  radius,
  tailHeight,
  tailReach,
  placement,
}: {
  width: number;
  height: number;
  radius: number;
  tailHeight: number;
  tailReach: number;
  placement: LabelPlacement;
}) {
  const r = radius;
  const tipY = height + tailHeight;

  if (placement === "center") {
    const tipX = width / 2;
    const tailHalf = 7;
    return [
      `M${r} 0`,
      `H${width - r}`,
      `Q${width} 0 ${width} ${r}`,
      `V${height - r}`,
      `Q${width} ${height} ${width - r} ${height}`,
      `H${tipX + tailHalf}`,
      `L${tipX} ${tipY}`,
      `L${tipX - tailHalf} ${height}`,
      `H${r}`,
      `Q0 ${height} 0 ${height - r}`,
      `V${r}`,
      `Q0 0 ${r} 0`,
      "Z",
    ].join(" ");
  }

  if (placement === "left") {
    // Label sits left of the tip; pointer leaves the bottom-right toward the tip.
    const tipX = width + tailReach - 1;
    return [
      `M${r} 0`,
      `H${width - r}`,
      `Q${width} 0 ${width} ${r}`,
      `V${height - r}`,
      `Q${width} ${height} ${width - r} ${height}`,
      `H${width - 4}`,
      `L${tipX} ${tipY}`,
      `L${width - 14} ${height}`,
      `H${r}`,
      `Q0 ${height} 0 ${height - r}`,
      `V${r}`,
      `Q0 0 ${r} 0`,
      "Z",
    ].join(" ");
  }

  // placement === "right": label sits right of the tip; SVG is shifted so tip
  // is near x=0 and the bubble occupies [tailReach, tailReach+width].
  const x0 = tailReach;
  const tipX = 1;
  return [
    `M${x0 + r} 0`,
    `H${x0 + width - r}`,
    `Q${x0 + width} 0 ${x0 + width} ${r}`,
    `V${height - r}`,
    `Q${x0 + width} ${height} ${x0 + width - r} ${height}`,
    `H${x0 + 14}`,
    `L${tipX} ${tipY}`,
    `L${x0 + 4} ${height}`,
    `H${x0 + r}`,
    `Q${x0} ${height} ${x0} ${height - r}`,
    `V${r}`,
    `Q${x0} 0 ${x0 + r} 0`,
    "Z",
  ].join(" ");
}

function EndpointBadge({
  colors,
  label,
  placement,
  scale,
}: {
  colors: readonly string[];
  label: string;
  placement: "left" | "right";
  scale: number;
}) {
  return (
    <MarkerContent className="pointer-events-none">
      <div
        className="flex h-6 items-center drop-shadow-sm"
        style={{
          transform: `scale(${scale})`,
          transformOrigin:
            placement === "left" ? "calc(100% - 12px) center" : "12px center",
        }}
      >
        {placement === "right" && <TeamDot colors={colors} />}
        <MarkerLabel
          className={cn(
            placement === "left"
              ? "-mr-3 rounded-r-none pr-3.5"
              : "-ml-3 rounded-l-none pl-3.5",
          )}
        >
          {label}
        </MarkerLabel>
        {placement === "left" && <TeamDot colors={colors} />}
      </div>
    </MarkerContent>
  );
}

function legEndpointNames(
  label: string,
): [origin: string, destination: string] {
  const [origin = label, destination = label] = label
    .split("→")
    .map((part) => part.trim());
  return [origin, destination];
}

function routeCoordinates(route: TeamTrackerState & { kind: "in-transit" }) {
  return route.route.map(
    ([longitude, latitude]) => [longitude, latitude] as [number, number],
  );
}

function TransitRoute({
  id,
  state,
  colors,
  dashArray,
  markerScale,
  occupiedEndpoints,
}: {
  id: string;
  state: TeamTrackerState & { kind: "in-transit" };
  colors: readonly string[];
  dashArray: readonly number[];
  markerScale: number;
  /** Places where a team is stationary; skip endpoint badges there. */
  occupiedEndpoints: ReadonlySet<SeasonNineteenPlaceId>;
}) {
  const coordinates = routeCoordinates(state);
  const origin = coordinates[0]!;
  const destination = coordinates.at(-1)!;
  const originPlacement = origin[0] <= destination[0] ? "left" : "right";
  const destinationPlacement = originPlacement === "left" ? "right" : "left";
  const [originLabel, destinationLabel] = legEndpointNames(state.label);
  const [
    baseColor = MAPLIBRE_COLORS.jetLagYellow,
    dashColor = MAPLIBRE_COLORS.contrast,
  ] = colors;
  const markerColors = colors.length > 1 ? colors : [baseColor];
  const showOrigin = !occupiedEndpoints.has(state.from);
  const showDestination = !occupiedEndpoints.has(state.to);

  return (
    <>
      <MapRoute
        id={`${id}-base`}
        coordinates={coordinates}
        color={baseColor}
        width={6}
        opacity={0.95}
        interactive={false}
      />
      <MapRoute
        id={`${id}-dashes`}
        coordinates={coordinates}
        color={dashColor}
        width={3}
        opacity={1}
        dashArray={dashArray}
        lineCap="butt"
        interactive={false}
      />
      {showOrigin ? (
        <MapMarker
          longitude={origin[0]}
          latitude={origin[1]}
          anchor={originPlacement === "left" ? "right" : "left"}
          offset={[originPlacement === "left" ? 12 : -12, 0]}
        >
          <EndpointBadge
            colors={markerColors}
            label={originLabel}
            placement={originPlacement}
            scale={markerScale}
          />
        </MapMarker>
      ) : null}
      {showDestination ? (
        <MapMarker
          longitude={destination[0]}
          latitude={destination[1]}
          anchor={destinationPlacement === "left" ? "right" : "left"}
          offset={[destinationPlacement === "left" ? 12 : -12, 0]}
        >
          <EndpointBadge
            colors={markerColors}
            label={destinationLabel}
            placement={destinationPlacement}
            scale={markerScale}
          />
        </MapMarker>
      ) : null}
    </>
  );
}

export function TeamTrackersOverlay({
  locations,
}: {
  locations: Record<SeasonNineteenTeamId, TeamTrackerState>;
}) {
  const anyTransit = seasonNineteenTeamIds.some(
    (team) => locations[team].kind === "in-transit",
  );
  const dashArray = useDashFrame(anyTransit);
  const zoom = useMapZoom();
  const markerScale = routeMarkerScale(zoom);
  const showPlaceLabel = zoom >= PLACE_LABEL_MIN_ZOOM;

  const colocatedPlace = useMemo(() => {
    const [left, right] = seasonNineteenTeamIds;
    const leftState = locations[left];
    const rightState = locations[right];
    if (
      leftState.kind !== "stationary" ||
      rightState.kind !== "stationary" ||
      leftState.place !== rightState.place
    ) {
      return null;
    }
    return leftState.place;
  }, [locations]);

  const stationaryPlaces = useMemo(() => {
    const places = new Set<SeasonNineteenPlaceId>();
    for (const team of seasonNineteenTeamIds) {
      const state = locations[team];
      if (state.kind === "stationary") places.add(state.place);
    }
    return places;
  }, [locations]);

  const transitEndpointPlaces = useMemo(() => {
    const places = new Set<SeasonNineteenPlaceId>();
    for (const team of seasonNineteenTeamIds) {
      const state = locations[team];
      if (state.kind === "in-transit") {
        places.add(state.from);
        places.add(state.to);
      }
    }
    return places;
  }, [locations]);

  const sharedTransit = useMemo(() => {
    const [left, right] = seasonNineteenTeamIds;
    const leftState = locations[left];
    const rightState = locations[right];
    if (leftState.kind !== "in-transit" || rightState.kind !== "in-transit") {
      return null;
    }
    if (leftState.from !== rightState.from || leftState.to !== rightState.to) {
      return null;
    }
    return leftState;
  }, [locations]);

  return (
    <>
      {sharedTransit ? (
        <TransitRoute
          id="season-nineteen-shared-route"
          state={sharedTransit}
          colors={[
            seasonNineteenTeams["sam-ben"].mapColor,
            seasonNineteenTeams["adam-tom"].mapColor,
          ]}
          dashArray={dashArray}
          markerScale={markerScale}
          occupiedEndpoints={stationaryPlaces}
        />
      ) : (
        seasonNineteenTeamIds.map((team) => {
          const state = locations[team];
          if (state.kind !== "in-transit") return null;
          return (
            <TransitRoute
              key={team}
              id={`season-nineteen-route-${team}`}
              state={state}
              colors={[seasonNineteenTeams[team].mapColor]}
              dashArray={dashArray}
              markerScale={markerScale}
              occupiedEndpoints={stationaryPlaces}
            />
          );
        })
      )}

      {colocatedPlace ? (
        <ColocatedStationaryMarker
          locations={locations}
          markerScale={markerScale}
          showPlaceLabel={
            showPlaceLabel || transitEndpointPlaces.has(colocatedPlace)
          }
        />
      ) : (
        seasonNineteenTeamIds.map((team) => {
          const state = locations[team];
          if (state.kind !== "stationary") return null;
          const atTransitEndpoint = transitEndpointPlaces.has(state.place);

          return (
            <MapMarker
              key={team}
              longitude={state.coordinate[0]}
              latitude={state.coordinate[1]}
              anchor="bottom"
              offset={[0, 6]}
            >
              <StaticLocationBadge
                colors={[seasonNineteenTeams[team].mapColor]}
                teamLabel={seasonNineteenTeams[team].name}
                placeLabel={state.label}
                showPlaceLabel={showPlaceLabel || atTransitEndpoint}
                scale={markerScale}
                placement="center"
              />
            </MapMarker>
          );
        })
      )}
    </>
  );
}

/** Both teams share one map coordinate; level labels fan left/right with skewed tails. */
function ColocatedStationaryMarker({
  locations,
  markerScale,
  showPlaceLabel,
}: {
  locations: Record<SeasonNineteenTeamId, TeamTrackerState>;
  markerScale: number;
  showPlaceLabel: boolean;
}) {
  const [leftTeam, rightTeam] = seasonNineteenTeamIds;
  const state = locations[leftTeam];
  if (state.kind !== "stationary") return null;

  return (
    <MapMarker
      longitude={state.coordinate[0]}
      latitude={state.coordinate[1]}
      anchor="bottom"
      offset={[0, 6]}
    >
      <MarkerContent className="pointer-events-none">
        <div
          className="relative drop-shadow-sm"
          style={{
            width: 0,
            height: 0,
            transform: `scale(${markerScale})`,
            transformOrigin: "center bottom",
          }}
        >
          <StationaryCallout
            label={seasonNineteenTeams[leftTeam].name}
            color={seasonNineteenTeams[leftTeam].mapColor}
            placement="left"
          />
          <StationaryCallout
            label={seasonNineteenTeams[rightTeam].name}
            color={seasonNineteenTeams[rightTeam].mapColor}
            placement="right"
          />
          <div className="absolute bottom-0 left-0 -translate-x-1/2">
            <TeamDot
              colors={[
                seasonNineteenTeams[leftTeam].mapColor,
                seasonNineteenTeams[rightTeam].mapColor,
              ]}
              compact
            />
          </div>
          {showPlaceLabel ? (
            <div className="absolute top-1 left-0 -translate-x-1/2">
              <MarkerLabel>{state.label}</MarkerLabel>
            </div>
          ) : null}
        </div>
      </MarkerContent>
    </MapMarker>
  );
}
