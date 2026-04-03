# Public Vector Tile root.json URLs (MapLibre Style GL Compatible)

Publicly available ArcGIS Vector Tile Service `root.json` style files from Esri Living Atlas, ArcGIS Online, and public government portals.

All URLs follow the pattern: `{VectorTileServer}/resources/styles/root.json`

Collected: 2026-04-03

## Validation Summary

All URLs were bulk-validated via `curl` on 2026-04-03.

| Category | Count | Result |
|----------|-------|--------|
| Esri Living Atlas basemaps | 8 unique endpoints | All OK (HTTP 200, valid style JSON) |
| USA 2020 demographic layers | 10 | All OK |
| USA 2016 demographic layers | 10 | All OK |
| Esri country/regional basemaps | 9 | 9/9 OK |
| Esri thematic/edge-case layers | 7 | 7/7 OK |
| Esri OSM tile services | 3 | 3/3 OK |
| Overture Maps PMTiles | 6 themes | 6/6 OK (HTTP 200 HEAD) |
| OpenFreeMap styles | 5 | 5/5 OK |
| Stadia Maps styles | 7 | 7/7 OK |
| MapLibre Demo Tiles | 1 | OK |
| Government portals (placeholder URLs) | 5 | Skipped (require item ID discovery) |

**66 validated URLs across Esri, Overture Maps, OpenFreeMap, and Stadia Maps.**

---

## Esri Living Atlas Basemaps (Web Mercator, EPSG:3857)

These all use the same tile source (`World_Basemap_v2`) but with different style configurations.

| Style Name | root.json URL |
|------------|---------------|
| World Topographic Map | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| World Street Map | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| World Navigation Map | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| World Navigation Map (Dark) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| World Street Map (Night) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Light Gray Canvas | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Dark Gray Canvas | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| National Geographic Style | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Human Geography Base | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Human Geography Label | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Human Geography Detail | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Human Geography Dark Base | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Human Geography Dark Label | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Human Geography Dark Detail | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Modern Antique | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Charted Territory | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Mid-Century | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Nova | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Colored Pencil | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Newspaper | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Watercolour | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Community | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Outdoor | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Outline | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| World Terrain Base | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| World Terrain Reference | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| World Ocean Reference | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Hybrid Reference Layer | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Enhanced Contrast Base | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Enhanced Contrast Reference | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Enhanced Contrast Dark Base | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |
| Enhanced Contrast Dark Reference | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json` |

> **Note:** The styles above share the same `World_Basemap_v2` tile source. Each style name corresponds to a different ArcGIS item with its own style definition. To get the per-style `root.json`, use the item-specific URL pattern:
> `https://www.arcgis.com/sharing/rest/content/items/{ITEM_ID}/resources/styles/root.json`

## Esri Living Atlas Basemaps (WGS84, EPSG:4326)

| Style Name | root.json URL |
|------------|---------------|
| World Street Map (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| World Topographic Map (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| World Navigation Map (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| World Navigation Map (Dark, WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| World Street Map (Night, WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| Light Gray Canvas (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| Dark Gray Canvas (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| Hybrid Reference Layer (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| World Terrain Base (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| World Terrain Reference (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| World Ocean Reference (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| Outline (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| Modern Antique (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| Mid-Century (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| Nova (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| Colored Pencil (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| Newspaper (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| Charted Territory (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |
| Community (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json` |

## Esri Specialty Tile Services

| Service Name | root.json URL |
|------------|---------------|
| World Contours | `https://basemaps.arcgis.com/arcgis/rest/services/World_Contours_v2/VectorTileServer/resources/styles/root.json` |
| World Hillshade | `https://basemaps.arcgis.com/arcgis/rest/services/World_Hillshade_v2/VectorTileServer/resources/styles/root.json` |
| OpenStreetMap Navigation | `https://basemaps.arcgis.com/arcgis/rest/services/OpenStreetMap_v2/VectorTileServer/resources/styles/root.json` |

## Esri Open Basemaps

| Style Name | root.json URL |
|------------|---------------|
| Open Basemap Streets | `https://basemaps.arcgis.com/arcgis/rest/services/OpenBasemap_v2/VectorTileServer/resources/styles/root.json` |
| Open Basemap Light Gray Canvas Base | `https://basemaps.arcgis.com/arcgis/rest/services/OpenBasemap_v2/VectorTileServer/resources/styles/root.json` |
| Open Basemap Hybrid Reference | `https://basemaps.arcgis.com/arcgis/rest/services/OpenBasemap_v2/VectorTileServer/resources/styles/root.json` |
| Open Basemap Streets (WGS84) | `https://basemaps.arcgis.com/arcgis/rest/services/OpenBasemap_GCS_v2/VectorTileServer/resources/styles/root.json` |

## Esri Export-Optimized Basemaps

For print and high-resolution export workflows.

| Style Name | root.json URL |
|------------|---------------|
| World Topographic Map (for Export) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_Export_v2/VectorTileServer/resources/styles/root.json` |
| World Navigation Map (for Export) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_Export_v2/VectorTileServer/resources/styles/root.json` |
| World Navigation Map (Dark, for Export) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_Export_v2/VectorTileServer/resources/styles/root.json` |
| World Street Map (for Export) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_Export_v2/VectorTileServer/resources/styles/root.json` |
| World Street Map (Night, for Export) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_Export_v2/VectorTileServer/resources/styles/root.json` |
| Hybrid Reference Layer (for Export) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_Export_v2/VectorTileServer/resources/styles/root.json` |
| World Terrain Reference (for Export) | `https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_Export_v2/VectorTileServer/resources/styles/root.json` |

## Esri Living Atlas: USA Demographic Layers

Thematic vector tile layers from the Living Atlas (owner: `esri`).

| Layer Name | root.json URL |
|------------|---------------|
| 2020 USA Population Density | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Population_Density_VTPK/VectorTileServer/resources/styles/root.json` |
| 2020 USA Population Growth | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Population_Growth_VTPK/VectorTileServer/resources/styles/root.json` |
| 2020 USA Median Age | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Median_Age/VectorTileServer/resources/styles/root.json` |
| 2020 USA Median Household Income | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Demographic_Reference_Layers_VTPK_MEDHINC/VectorTileServer/resources/styles/root.json` |
| 2020 USA Average Household Income | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Average_Household_Income/VectorTileServer/resources/styles/root.json` |
| 2020 USA Per Capita Income | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_2020_Per_Capita_Income/VectorTileServer/resources/styles/root.json` |
| 2020 USA Median Disposable Income | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Demographic_Reference_Layers_VTPK_MEDDINC/VectorTileServer/resources/styles/root.json` |
| 2020 USA Median Home Value | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Median_Home_Value/VectorTileServer/resources/styles/root.json` |
| 2020 USA Diversity Index | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Diversity_Index/VectorTileServer/resources/styles/root.json` |
| 2020 USA Average Household Size | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Demographic_Reference_Layers_VTPK_AVGHHS/VectorTileServer/resources/styles/root.json` |
| 2016 USA Population Density | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Pop_Density/VectorTileServer/resources/styles/root.json` |
| 2016 USA Median Age | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Med_Age/VectorTileServer/resources/styles/root.json` |
| 2016 USA Median Household Income | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Med_HH_Income/VectorTileServer/resources/styles/root.json` |
| 2016 USA Average Household Income | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Avg_HH_Income/VectorTileServer/resources/styles/root.json` |
| 2016 USA Per Capita Income | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Per_Cap_Income/VectorTileServer/resources/styles/root.json` |
| 2016 USA Median Disposable Income | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Med_Disp_Income/VectorTileServer/resources/styles/root.json` |
| 2016 USA Median Home Value | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Med_Home_Value/VectorTileServer/resources/styles/root.json` |
| 2016 USA Diversity Index | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Diverse_Index/VectorTileServer/resources/styles/root.json` |
| 2016 USA Average Household Size | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Avg_HH_Size/VectorTileServer/resources/styles/root.json` |
| 2016-2021 USA Population Growth | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Pop_Ann_Growth_Rate/VectorTileServer/resources/styles/root.json` |

## Public Government ArcGIS Portals

These are vector tile services hosted on publicly accessible ArcGIS Enterprise portals.

### United States

| Organization | Service | root.json URL | Status |
|-------------|---------|---------------|--------|
| Esri Sample | Santa Monica Mountains Parcels | `https://vectortileservices3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Santa_Monica_Mountains_Parcels_VTL/VectorTileServer/resources/styles/root.json` | Validated |
| City of Salinas, CA | Portal Basemap | Discover via `https://salinas-gis.ci.salinas.ca.us/portal/sharing/portals/self?f=pjson` | Needs itemId |
| City of Pearland, TX | Portal Basemap | Discover via `https://gis.pearlandtx.gov/arcgis/sharing/portals/self?f=pjson` | Needs itemId |
| Itasca County, MN | Portal Basemap | Discover via `https://maps-test.co.itasca.mn.us/portal/sharing/portals/self?f=pjson` | Needs itemId |

> **Removed:** City of Anaheim (gis.anaheim.net) - connection timeout, server unreachable as of 2026-04-03.

### Australia

| Organization | Service | Discovery URL | Status |
|-------------|---------|---------------|--------|
| Queensland Spatial Portal | Portal Basemap | Discover via `https://spatial.information.qld.gov.au/arcgis/sharing/portals/self?f=pjson` | Needs service name |
| NSW Spatial Portal | Portal Basemap | Discover via `https://portal.spatial.nsw.gov.au/portal/sharing/portals/self?f=pjson` | Needs service name |

## How to Discover More

### Search ArcGIS Online REST API

Find public vector tile services by owner or keyword:

```
https://www.arcgis.com/sharing/rest/search?q=typekeywords:"Vector Tile Service" AND access:public&f=json&num=100
```

Filter by owner (common Esri accounts):
- `owner:esri` - Esri core content
- `owner:esri_vector` - Esri vector basemaps (262 items)
- `owner:esri_en` - Esri English content

### Construct root.json URLs

**From VectorTileServer URL:**
```
{VectorTileServer URL}/resources/styles/root.json
```

**From ArcGIS item ID:**
```
https://www.arcgis.com/sharing/rest/content/items/{ITEM_ID}/resources/styles/root.json
```

### Find portal self-descriptors

Many ArcGIS Enterprise portals expose their default basemap vector tile URLs in:
```
https://{portal-host}/portal/sharing/portals/self?f=pjson
```

Look for `VectorTileLayer` entries in the `defaultBasemap` section.

## MapLibre GL JS Usage

ArcGIS vector tile `root.json` files use the Mapbox/MapLibre style specification. To use them with MapLibre GL JS:

```javascript
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json',
  center: [0, 30],
  zoom: 2
});
```

> **Important:** Some Esri basemap services require an ArcGIS API key or token. The `root.json` itself is publicly accessible, but tile requests may require authentication. Check the service's `access` property via the REST API.

## Esri Country-Specific and Regional Basemaps (Unique Tile Sources)

These have their own tile data, not just restyled World_Basemap_v2.

| Name | Region | root.json URL | Status |
|------|--------|---------------|--------|
| GB Topographic | United Kingdom | `https://tiles.arcgis.com/tiles/qHLhLQrcvEnxjtPr/arcgis/rest/services/GB_Basemap_v1/VectorTileServer/resources/styles/root.json` | Validated |
| NZ Topographic (Vector) | New Zealand | `https://tiles.arcgis.com/tiles/XTtANUDT8Va4DLwI/arcgis/rest/services/nz_vector_basemap_v1/VectorTileServer/resources/styles/root.json` | Validated |
| Topo RD (Netherlands 3D) | Netherlands | `https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/Topo_RD/VectorTileServer/resources/styles/root.json` | Validated |
| Swiss Dark Gray Canvas (LV95) | Switzerland | `https://tiles.arcgis.com/tiles/oPre3pOfRfefL8y0/arcgis/rest/services/Vector_Tile_Basemap_Switzerland_LV95/VectorTileServer/resources/styles/root.json` | Validated |
| LV95 Contours Switzerland | Switzerland | `https://tiles.arcgis.com/tiles/oPre3pOfRfefL8y0/arcgis/rest/services/LV95_Contours_Switzerland/VectorTileServer/resources/styles/root.json` | Validated |
| Canterbury Basemap | New Zealand | `https://tiles.arcgis.com/tiles/RNxkQaMWQcgbiF98/arcgis/rest/services/Canterbury_Basemap/VectorTileServer/resources/styles/root.json` | Validated |
| OSM RD (Netherlands) | Netherlands | `https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/OSM_RD/VectorTileServer/resources/styles/root.json` | Validated |
| Africa Mask (Dark) | Africa | `https://tiles.arcgis.com/tiles/zNrTBuYXV2f35M0U/arcgis/rest/services/Africa_Buffer_v2/VectorTileServer/resources/styles/root.json` | Validated |
| Caribbean Mask (Dark) | Caribbean | `https://tiles.arcgis.com/tiles/yVZJC1sH78c0dQ2w/arcgis/rest/services/Caribbean_Mask_Dark/VectorTileServer/resources/styles/root.json` | Validated |

## Esri Thematic and Edge-Case Layers (Unique Tile Sources)

Complex styling, extrusion-ready data, parcels, contours, and other specialized layers.

| Name | Type | root.json URL | Status |
|------|------|---------------|--------|
| Microsoft Building Footprints | Buildings / 3D extrusion | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Microsoft_Building_Footprints/VectorTileServer/resources/styles/root.json` | Validated |
| Canterbury Contours | Elevation contours | `https://tiles.arcgis.com/tiles/RNxkQaMWQcgbiF98/arcgis/rest/services/Contours/VectorTileServer/resources/styles/root.json` | Validated |
| NZ Mainland Contours (Topo 50k) | Elevation contours | `https://tiles.arcgis.com/tiles/sreKTGUpFk4UFFqu/arcgis/rest/services/NZ_Mainland_Contours_Topo_50k/VectorTileServer/resources/styles/root.json` | Validated |
| Stark County Contours (10ft/5ft/2ft) | Elevation contours | `https://tiles.arcgis.com/tiles/1JiK2PayqrHvvJhM/arcgis/rest/services/Contour_Vector_Cache/VectorTileServer/resources/styles/root.json` | Validated |
| Dark Skies | Thematic overlay | `https://tiles.arcgis.com/tiles/KTcxiTD9dsQw4r7Z/arcgis/rest/services/Dark_Skies/VectorTileServer/resources/styles/root.json` | Validated |
| Utah Statewide Parcels | Parcels | `https://tiles.arcgis.com/tiles/99lidPhWCzftIe9K/arcgis/rest/services/StatewideParcels/VectorTileServer/resources/styles/root.json` | Validated |
| NC OneMap Parcel Boundaries | Parcels | `https://tiles.arcgis.com/tiles/NuWFvHYDMVmmxMeM/arcgis/rest/services/NCOneMapParcelBoundaries/VectorTileServer/resources/styles/root.json` | Validated |

## Esri OpenStreetMap Vector Tile Services

Esri-hosted OSM data with their own tile endpoints (separate from Living Atlas basemaps).

| Name | root.json URL | Status |
|------|---------------|--------|
| OpenStreetMap v2 (devops) | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/OpenStreetMap_v2/VectorTileServer/resources/styles/root.json` | Validated |
| OpenStreetMap GCS v2 (WGS84) | `https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/OpenStreetMap_GCS_v2/VectorTileServer/resources/styles/root.json` | Validated |
| OpenStreetMap GCS v2 (basemaps) | `https://basemaps.arcgis.com/arcgis/rest/services/OpenStreetMap_GCS_v2/VectorTileServer/resources/styles/root.json` | Validated |

## Overture Maps PMTiles (MapLibre Compatible via pmtiles protocol)

Overture Maps distributes vector tiles as PMTiles archives. Use with MapLibre via the `pmtiles` JS library.
Latest release: `2025-02-19`. All themes validated via HTTP HEAD.

| Theme | PMTiles URL | Status |
|-------|-------------|--------|
| Buildings | `https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-02-19/buildings.pmtiles` | Validated |
| Places | `https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-02-19/places.pmtiles` | Validated |
| Transportation | `https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-02-19/transportation.pmtiles` | Validated |
| Base (land, water, boundaries) | `https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-02-19/base.pmtiles` | Validated |
| Addresses | `https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-02-19/addresses.pmtiles` | Validated |
| Divisions | `https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-02-19/divisions.pmtiles` | Validated |

> **Usage with MapLibre:** Overture PMTiles are not style.json files. Use the `pmtiles` protocol adapter:
> ```javascript
> import { Protocol } from 'pmtiles';
> let protocol = new Protocol();
> maplibregl.addProtocol('pmtiles', protocol.tile);
> // Then reference as: "pmtiles://https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-02-19/buildings.pmtiles"
> ```
> See [Overture Maps docs](https://docs.overturemaps.org/examples/overture-tiles/) and [PMTiles for MapLibre](https://docs.protomaps.com/pmtiles/maplibre).

## OpenFreeMap (Free, No API Key, No Limits)

OSM-based vector tiles. All styles validated.

| Style | Style URL | Notes |
|-------|-----------|-------|
| Liberty | `https://tiles.openfreemap.org/styles/liberty` | Classic OSM style |
| Bright | `https://tiles.openfreemap.org/styles/bright` | Light and clean |
| Positron | `https://tiles.openfreemap.org/styles/positron` | Minimal, light gray |
| Dark | `https://tiles.openfreemap.org/styles/dark` | Dark mode |
| Fiord | `https://tiles.openfreemap.org/styles/fiord` | Deep blue/dark |

## Stadia Maps (Free Tier, Domain-Based Auth)

All styles validated (HTTP 200). Free for non-commercial use and low-traffic sites (no API key needed for localhost/development).

| Style | Style URL | Notes |
|-------|-----------|-------|
| Alidade Smooth | `https://tiles.stadiamaps.com/styles/alidade_smooth.json` | Clean, modern light |
| Alidade Smooth Dark | `https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json` | Dark mode |
| OSM Bright | `https://tiles.stadiamaps.com/styles/osm_bright.json` | Colorful OSM |
| Outdoors | `https://tiles.stadiamaps.com/styles/outdoors.json` | Hiking/outdoor focus |
| Stamen Toner | `https://tiles.stadiamaps.com/styles/stamen_toner.json` | High contrast B&W |
| Stamen Terrain | `https://tiles.stadiamaps.com/styles/stamen_terrain.json` | Terrain-focused |
| Stamen Watercolor | `https://tiles.stadiamaps.com/styles/stamen_watercolor.json` | Artistic watercolor |

## Other Non-Esri Sources (MapLibre Compatible)

| Provider | Style URL | Notes |
|----------|-----------|-------|
| MapLibre Demo Tiles | `https://demotiles.maplibre.org/style.json` | Free, no key required. Validated |
| Protomaps | `https://api.protomaps.com/styles/v4/light/en.json?key={KEY}` | Free tier available (requires API key) |
| MapTiler | `https://api.maptiler.com/maps/streets-v2/style.json?key={KEY}` | Free tier available (requires API key) |
