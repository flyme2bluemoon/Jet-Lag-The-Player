"use client";

import type { Feature, MultiPolygon, Polygon, Position } from "geojson";
import type MapLibreGL from "maplibre-gl";
import type { FilterSpecification } from "maplibre-gl";
import { useEffect, useId, useMemo } from "react";
import { useMapRegionLabel } from "@/components/episode/map-region-label";
import {
  Map,
  MapControls,
  MapGeoJSON,
  useMap,
  type MapFillColor,
  type MapFillOpacity,
} from "@/components/ui/map";
import {
  MAPLIBRE_COLORS,
  MAPLIBRE_WATER_CANVAS_COLORS,
  MAPLIBRE_SCOREBOARD_COLORS,
} from "@/components/ui/map-colors";
import { useJapanGeoJson, type JapanGeoJson } from "@/lib/japan-geojson";
import {
  useJapanPrefecturesGeoJson,
  type JapanPrefecturesGeoJson,
} from "@/lib/japan-prefectures-geojson";
import {
  resolveOccupiedOutlines,
  type PrefectureUnlockState,
  type TeamLocationsState,
  type TeamTrackerState,
} from "./game-board";
import { TeamTrackersOverlay } from "./team-trackers-overlay";
import { seasonNineteenTeamIds, seasonNineteenTeams } from "./team-data";
import {
  seasonNineteenPlaces,
  type SeasonNineteenTeamId,
} from "./timeline-data";

const JAPAN_BOARD_BOUNDS: [[number, number], [number, number]] = [
  [127, 26],
  [146, 46],
];
const WORLD_RING: Position[] = [
  [-180, -85],
  [180, -85],
  [180, 85],
  [-180, 85],
  [-180, -85],
];
/** Insert the mask beneath Carto place labels so in-Japan labels stay readable. */
const PLACE_LABEL_LAYER_BEFORE_ID = "place_country_2";
const UNLOCK_OVERLAP_PATTERN_ID = "season-nineteen-unlock-overlap";
const TRANSPARENT_PATTERN_ID = "season-nineteen-transparent";
const UNLOCKED_FILL_OPACITY = 0.58;
const STRIPED_FILL_OPACITY = 0.72;

type MapFillPattern = NonNullable<
  NonNullable<MapLibreGL.FillLayerSpecification["paint"]>["fill-pattern"]
>;

type GameBoardCardProps = {
  locations: TeamLocationsState;
  unlocks: PrefectureUnlockState;
};

export function GameBoardCard({ locations, unlocks }: GameBoardCardProps) {
  const titleId = useId();
  const japanGeoJson = useJapanGeoJson();
  const prefecturesGeoJson = useJapanPrefecturesGeoJson();
  const japanMap = useMemo(
    () => japanGeoJson && createJapanMap(japanGeoJson),
    [japanGeoJson],
  );

  return (
    <section
      className="border-paper/25 bg-panel @container w-full overflow-hidden rounded-lg border"
      aria-labelledby={titleId}
    >
      <header className="border-paper/20 border-b p-6">
        <h2
          id={titleId}
          className="font-heading text-3xl leading-none font-bold tracking-tight uppercase"
        >
          Game Board
        </h2>
      </header>

      <div className="bg-map-water-canvas relative h-96 overflow-hidden">
        {japanMap && (
          <Map
            bounds={JAPAN_BOARD_BOUNDS}
            fitBoundsOptions={{ padding: 24 }}
            minZoom={2}
            maxZoom={14}
            dragRotate={false}
            touchPitch={false}
          >
            <JapanMask
              mask={japanMap.mask}
              labelFilters={japanMap.labelFilters}
            />
            <PrefectureLayers
              prefecturesGeoJson={prefecturesGeoJson}
              locations={locations}
              unlocks={unlocks}
            />
            <TeamTrackersOverlay locations={locations} />
            <MapControls
              resetView={{ bounds: JAPAN_BOARD_BOUNDS, padding: 24 }}
            />
          </Map>
        )}
      </div>

      <TeamLocationsStatus locations={locations} />
    </section>
  );
}

const TRANSIT_MODE_LABELS = {
  train: "Train",
  shinkansen: "Shinkansen",
  bus: "Bus",
  taxi: "Taxi",
  walking: "Walking",
  ferry: "Ferry",
} as const satisfies Record<
  Extract<TeamTrackerState, { kind: "in-transit" }>["mode"],
  string
>;

function teamLocationCopy(state: TeamTrackerState): {
  primary: string;
  secondary: string;
} {
  if (state.kind === "stationary") {
    return {
      primary: seasonNineteenPlaces[state.place].name,
      secondary: state.prefecture,
    };
  }

  return {
    primary: state.label,
    secondary: TRANSIT_MODE_LABELS[state.mode],
  };
}

function TeamLocationsStatus({ locations }: { locations: TeamLocationsState }) {
  return (
    <div
      className="border-paper/20 grid grid-cols-1 border-t @xl:grid-cols-2"
      aria-label="Team locations"
    >
      {seasonNineteenTeamIds.map((team, index) => {
        const state = locations[team];
        const teamDetails = seasonNineteenTeams[team];
        const { primary, secondary } = teamLocationCopy(state);
        const isLast = index === seasonNineteenTeamIds.length - 1;

        return (
          <div
            key={team}
            className={`flex min-w-0 flex-col px-5 py-5 sm:px-6 ${isLast ? "" : "border-paper/20 border-b @xl:border-r @xl:border-b-0"}`}
            style={{
              backgroundImage: `linear-gradient(110deg, color-mix(in srgb, ${teamDetails.color} 14%, transparent), color-mix(in srgb, ${teamDetails.color} 4%, transparent))`,
            }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: teamDetails.color }}
              />
              <h3
                className="wrap-break-word font-heading text-base leading-none font-bold uppercase"
                style={{ color: teamDetails.color }}
              >
                {teamDetails.name}
              </h3>
            </div>
            <p className="wrap-break-word mt-2 font-sans text-base leading-snug font-semibold whitespace-normal">
              {primary}
            </p>
            <p className="text-card-meta wrap-break-word mt-1 font-sans text-sm leading-snug whitespace-normal">
              {secondary}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function PrefectureLayers({
  prefecturesGeoJson,
  locations,
  unlocks,
}: {
  prefecturesGeoJson: JapanPrefecturesGeoJson | null;
  locations: TeamLocationsState;
  unlocks: PrefectureUnlockState;
}) {
  const { isLoaded, map, resolvedTheme } = useMap();
  const { regionLabelPopup, showOnClick, showOnHover } = useMapRegionLabel();
  const colors = MAPLIBRE_SCOREBOARD_COLORS[resolvedTheme];
  const occupied = useMemo(
    () => resolveOccupiedOutlines(locations, unlocks),
    [locations, unlocks],
  );
  const stripedPrefectures = useMemo(
    () =>
      [...unlocks.fills]
        .filter(([, fill]) => fill.kind === "striped")
        .map(([name]) => name),
    [unlocks.fills],
  );
  const stripeFillPattern = useMemo(
    () =>
      [
        "case",
        ["in", ["get", "name"], ["literal", stripedPrefectures]],
        UNLOCK_OVERLAP_PATTERN_ID,
        TRANSPARENT_PATTERN_ID,
      ] as MapFillPattern,
    [stripedPrefectures],
  );

  useEffect(() => {
    if (!isLoaded || !map) return;

    if (!map.hasImage(UNLOCK_OVERLAP_PATTERN_ID)) {
      map.addImage(UNLOCK_OVERLAP_PATTERN_ID, createStripePatternImage(), {
        pixelRatio: 2,
      });
    }
    if (!map.hasImage(TRANSPARENT_PATTERN_ID)) {
      map.addImage(TRANSPARENT_PATTERN_ID, createTransparentPatternImage(), {
        pixelRatio: 2,
      });
    }
  }, [isLoaded, map]);

  const fillColor = useMemo(() => {
    const singles = [...unlocks.fills].filter(
      (
        entry,
      ): entry is [string, { kind: "single"; team: SeasonNineteenTeamId }] =>
        entry[1].kind === "single",
    );
    if (singles.length === 0) return MAPLIBRE_COLORS.transparent;

    const expression: unknown[] = ["match", ["get", "name"]];
    for (const [prefecture, fill] of singles) {
      expression.push(prefecture, seasonNineteenTeams[fill.team].mapColor);
    }
    expression.push(MAPLIBRE_COLORS.transparent);
    return expression as MapFillColor;
  }, [unlocks.fills]);

  const fillOpacity = useMemo(() => {
    const singles = [...unlocks.fills].filter(
      ([, fill]) => fill.kind === "single",
    );
    if (singles.length === 0) return 0;

    const expression: unknown[] = ["match", ["get", "name"]];
    for (const [prefecture] of singles) {
      expression.push(prefecture, UNLOCKED_FILL_OPACITY);
    }
    expression.push(0);
    return expression as MapFillOpacity;
  }, [unlocks.fills]);

  const baseLineColor = colors.line;

  if (!prefecturesGeoJson) return null;

  return (
    <>
      <MapGeoJSON
        id="season-nineteen-prefectures"
        data={prefecturesGeoJson}
        promoteId="name"
        beforeId={PLACE_LABEL_LAYER_BEFORE_ID}
        interactive
        fillPaint={{
          "fill-color": fillColor,
          "fill-opacity": fillOpacity,
        }}
        linePaint={{
          "line-color": baseLineColor,
          "line-width": 0.75,
          "line-opacity": 0.85,
          "line-blur": 0.35,
        }}
        onClick={(event) => {
          const name = event.feature.properties.name;
          if (typeof name === "string") showOnClick(name, event);
        }}
        onMove={(event) => {
          const name = event.feature.properties.name;
          showOnHover(typeof name === "string" ? name : null, event);
        }}
        onHover={(event) => {
          if (!event) showOnHover(null, null);
        }}
      />
      <MapGeoJSON
        id="season-nineteen-prefecture-stripes"
        data={prefecturesGeoJson}
        beforeId={PLACE_LABEL_LAYER_BEFORE_ID}
        fillPaint={{
          "fill-pattern": stripeFillPattern,
          "fill-opacity": STRIPED_FILL_OPACITY,
        }}
        linePaint={false}
      />
      <OccupiedOutlines occupied={occupied} data={prefecturesGeoJson} />
      {regionLabelPopup}
    </>
  );
}

function OccupiedOutlines({
  occupied,
  data,
}: {
  occupied: Record<SeasonNineteenTeamId, string | null>;
  data: JapanPrefecturesGeoJson;
}) {
  const samBen = occupied["sam-ben"];
  const adamTom = occupied["adam-tom"];

  if (samBen && adamTom && samBen === adamTom) {
    return (
      <>
        <OccupiedOutline
          id="season-nineteen-occupied-outer"
          prefecture={samBen}
          data={data}
          color={seasonNineteenTeams["sam-ben"].mapColor}
          width={3}
        />
        <OccupiedOutline
          id="season-nineteen-occupied-inner"
          prefecture={adamTom}
          data={data}
          color={seasonNineteenTeams["adam-tom"].mapColor}
          width={1.5}
        />
      </>
    );
  }

  return (
    <>
      {seasonNineteenTeamIds.map((team) => {
        const prefecture = occupied[team];
        if (!prefecture) return null;
        return (
          <OccupiedOutline
            key={team}
            id={`season-nineteen-occupied-${team}`}
            prefecture={prefecture}
            data={data}
            color={seasonNineteenTeams[team].mapColor}
            width={2}
          />
        );
      })}
    </>
  );
}

function OccupiedOutline({
  id,
  prefecture,
  data,
  color,
  width,
}: {
  id: string;
  prefecture: string;
  data: JapanPrefecturesGeoJson;
  color: string;
  width: number;
}) {
  const outlineData = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: data.features.filter(
        (feature) => feature.properties.name === prefecture,
      ),
    }),
    [data, prefecture],
  );

  return (
    <MapGeoJSON
      id={id}
      data={outlineData}
      beforeId={PLACE_LABEL_LAYER_BEFORE_ID}
      fillPaint={false}
      linePaint={{
        "line-color": color,
        "line-width": width,
        "line-opacity": 0.95,
        "line-blur": 0.5,
      }}
    />
  );
}

function createStripePatternImage() {
  const size = 24;
  const stripeWidth = 6;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create prefecture stripe pattern.");

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const stripe = Math.floor((x + y) / stripeWidth) % 2;
      context.fillStyle =
        stripe === 0 ? MAPLIBRE_COLORS.jetLagRed : MAPLIBRE_COLORS.jetLagYellow;
      context.fillRect(x, y, 1, 1);
    }
  }

  return context.getImageData(0, 0, size, size);
}

function createTransparentPatternImage() {
  return new ImageData(new Uint8ClampedArray(4), 1, 1);
}

function createJapanMap(japan: JapanGeoJson) {
  const feature = japan.features[0];
  if (!feature) throw new RangeError("Japan boundary has no features.");

  return {
    mask: {
      type: "Feature",
      properties: { id: "season-nineteen-japan-mask" },
      geometry: {
        type: "Polygon",
        coordinates: [
          WORLD_RING,
          ...feature.geometry.coordinates.map(([outerRing]) =>
            orientRing(outerRing, true),
          ),
        ],
      },
    } satisfies Feature<Polygon, { id: string }>,
    labelFilters: japanLabelFilters(feature),
  };
}

function japanLabelFilters(
  japanFeature: Feature<MultiPolygon>,
): Record<string, FilterSpecification> {
  const withinJapan: FilterSpecification = ["within", japanFeature];

  return {
    place_country_2: [
      "all",
      ["==", ["get", "class"], "country"],
      [">=", ["number", ["get", "rank"], 0], 3],
      ["has", "iso_a2"],
      ["==", ["get", "iso_a2"], "JP"],
    ],
    place_country_1: [
      "all",
      ["==", ["get", "class"], "country"],
      ["<=", ["number", ["get", "rank"], 0], 2],
      ["==", ["get", "name_en"], "Japan"],
    ],
    place_state: [
      "all",
      ["==", ["get", "class"], "state"],
      ["<=", ["number", ["get", "rank"], 0], 4],
      withinJapan,
    ],
    place_continent: [
      "all",
      ["==", ["get", "class"], "continent"],
      withinJapan,
    ],
    place_city_r6: [
      "all",
      ["==", ["get", "class"], "city"],
      [">=", ["number", ["get", "rank"], 0], 6],
      withinJapan,
    ],
    place_city_r5: [
      "all",
      ["==", ["get", "class"], "city"],
      [">=", ["number", ["get", "rank"], 0], 0],
      ["<=", ["number", ["get", "rank"], 0], 5],
      withinJapan,
    ],
    place_city_dot_r7: [
      "all",
      ["==", ["get", "class"], "city"],
      ["<=", ["number", ["get", "rank"], 0], 7],
      withinJapan,
    ],
    place_city_dot_r4: [
      "all",
      ["==", ["get", "class"], "city"],
      ["<=", ["number", ["get", "rank"], 0], 4],
      withinJapan,
    ],
    place_city_dot_r2: [
      "all",
      ["==", ["get", "class"], "city"],
      ["<=", ["number", ["get", "rank"], 0], 2],
      withinJapan,
    ],
    place_city_dot_z7: [
      "all",
      ["!", ["has", "capital"]],
      ["!", ["in", ["get", "class"], ["literal", ["country", "state"]]]],
      withinJapan,
    ],
    place_capital_dot_z7: [
      "all",
      [">", ["number", ["get", "capital"], 0], 0],
      withinJapan,
    ],
  };
}

function orientRing(ring: Position[], clockwise: boolean) {
  const signedArea =
    ring.reduce((area, coordinate, index) => {
      const next = ring[(index + 1) % ring.length]!;
      return area + coordinate[0]! * next[1]! - next[0]! * coordinate[1]!;
    }, 0) / 2;
  const isClockwise = signedArea < 0;

  return isClockwise === clockwise ? ring : ring.toReversed();
}

function JapanMask({
  mask,
  labelFilters,
}: {
  mask: Feature<Polygon, { id: string }>;
  labelFilters: Record<string, FilterSpecification>;
}) {
  const { map, isLoaded, resolvedTheme } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    for (const [layerId, filter] of Object.entries(labelFilters)) {
      if (map.getLayer(layerId)) map.setFilter(layerId, filter);
    }
  }, [isLoaded, labelFilters, map]);

  return (
    <MapGeoJSON
      id="season-nineteen-japan-mask"
      data={mask}
      beforeId={PLACE_LABEL_LAYER_BEFORE_ID}
      fillPaint={{
        "fill-color": MAPLIBRE_WATER_CANVAS_COLORS[resolvedTheme],
        "fill-opacity": 1,
      }}
      linePaint={false}
    />
  );
}
