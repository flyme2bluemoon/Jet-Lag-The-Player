# GeoJSON provenance

These source notes travel with the stored geometry in addition to the credits
shown in each relevant dashboard footer.

- `canada.geojson`: Canada national boundary from [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/). Natural Earth data is public domain; credit is optional but retained in the UI in good faith.
- `us-states.geojson`: U.S. state boundary geometry shared by Mike Bostock through the [Leaflet choropleth example](https://leafletjs.com/examples/choropleth/). The file also retains the example's unused population-density property; the application does not display or analyze that field.
- `switzerland.geojson`: Switzerland ADM0 boundary from [geoBoundaries](https://www.geoboundaries.org/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The geometry was converted to compact application GeoJSON and simplified after download.
- `japan.geojson`: Japan ADM0 boundary `JPN-ADM0-22093344`, representing 2022 boundaries, from the [geoBoundaries gbOpen dataset](https://www.geoboundaries.org/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). geoBoundaries identifies Japan's Ministry of Land, Infrastructure, Transport and Tourism National Land Numerical Information Download Site as its source. The geometry is pinned to geoBoundaries commit `9469f09`, then simplified and filtered by `scripts/generate-japan-boundary.mjs` for this application.
- `centre-party-cantons.json` and `zurich-canton.json`: canton boundaries derived from © swisstopo, swissBOUNDARIES3D 2020. The files record the source URL and simplification tolerance in their top-level metadata.
- `non-mittelland-regions.json`: Biogeographical regions of Switzerland from the Federal Office for the Environment (FOEN). The file records the exact geo.admin.ch API layer and query in its top-level metadata.
