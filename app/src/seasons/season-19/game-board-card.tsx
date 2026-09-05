"use client";

import type { Feature, MultiPolygon, Polygon, Position } from "geojson";
import type { FilterSpecification } from "maplibre-gl";
import { useEffect, useId, useMemo } from "react";
import { Map, MapControls, MapGeoJSON, useMap } from "@/components/ui/map";
import { MAPLIBRE_COUNTRY_MASK_COLORS } from "@/components/ui/map-colors";
import { useJapanGeoJson, type JapanGeoJson } from "@/lib/japan-geojson";

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

export function GameBoardCard() {
  const titleId = useId();
  const japanGeoJson = useJapanGeoJson();
  const japanMap = useMemo(
    () => japanGeoJson && createJapanMap(japanGeoJson),
    [japanGeoJson],
  );

  return (
    <section
      className="border-paper/25 bg-panel w-full overflow-hidden rounded-lg border"
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

      <div className="bg-map-canvas relative h-96 overflow-hidden">
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
            <MapControls
              resetView={{ bounds: JAPAN_BOARD_BOUNDS, padding: 24 }}
            />
          </Map>
        )}
      </div>
    </section>
  );
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
        "fill-color": MAPLIBRE_COUNTRY_MASK_COLORS[resolvedTheme],
        "fill-opacity": 1,
      }}
      linePaint={false}
    />
  );
}
