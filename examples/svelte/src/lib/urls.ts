export interface StyleUrl {
  name: string;
  url: string;
}

export interface UrlGroup {
  label: string;
  urls: StyleUrl[];
}

export const URL_GROUPS: UrlGroup[] = [
  {
    label: "Esri Basemaps",
    urls: [
      {
        name: "World Basemap v2",
        url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "World Basemap GCS v2 (WGS84)",
        url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "World Contours v2",
        url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Contours_v2/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "World Hillshade v2",
        url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Hillshade_v2/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "OpenStreetMap v2",
        url: "https://basemaps.arcgis.com/arcgis/rest/services/OpenStreetMap_v2/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "OpenBasemap v2",
        url: "https://basemaps.arcgis.com/arcgis/rest/services/OpenBasemap_v2/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "OpenBasemap GCS v2 (WGS84)",
        url: "https://basemaps.arcgis.com/arcgis/rest/services/OpenBasemap_GCS_v2/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "World Basemap Export v2",
        url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_Export_v2/VectorTileServer/resources/styles/root.json",
      },
    ],
  },
  {
    label: "Esri Demographics",
    urls: [
      {
        name: "2020 USA Population Density",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Population_Density_VTPK/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2020 USA Population Growth",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Population_Growth_VTPK/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2020 USA Median Age",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Median_Age/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2020 USA Median Household Income",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Demographic_Reference_Layers_VTPK_MEDHINC/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2020 USA Average Household Income",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Average_Household_Income/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2020 USA Per Capita Income",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_2020_Per_Capita_Income/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2020 USA Median Disposable Income",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Demographic_Reference_Layers_VTPK_MEDDINC/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2020 USA Median Home Value",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Median_Home_Value/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2020 USA Diversity Index",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Diversity_Index/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2020 USA Average Household Size",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Demographic_Reference_Layers_VTPK_AVGHHS/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2016 USA Population Density",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Pop_Density/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2016 USA Median Age",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Med_Age/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2016 USA Median Household Income",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Med_HH_Income/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2016 USA Average Household Income",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Avg_HH_Income/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2016 USA Per Capita Income",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Per_Cap_Income/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2016 USA Median Disposable Income",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Med_Disp_Income/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2016 USA Median Home Value",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Med_Home_Value/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2016 USA Diversity Index",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Diverse_Index/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2016 USA Average Household Size",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Avg_HH_Size/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "2016-2021 USA Population Growth",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Pop_Ann_Growth_Rate/VectorTileServer/resources/styles/root.json",
      },
    ],
  },
  {
    label: "Esri Regional",
    urls: [
      {
        name: "GB Topographic",
        url: "https://tiles.arcgis.com/tiles/qHLhLQrcvEnxjtPr/arcgis/rest/services/GB_Basemap_v1/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "NZ Topographic",
        url: "https://tiles.arcgis.com/tiles/XTtANUDT8Va4DLwI/arcgis/rest/services/nz_vector_basemap_v1/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "Topo RD (Netherlands)",
        url: "https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/Topo_RD/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "Swiss Dark Gray Canvas (LV95)",
        url: "https://tiles.arcgis.com/tiles/oPre3pOfRfefL8y0/arcgis/rest/services/Vector_Tile_Basemap_Switzerland_LV95/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "LV95 Contours Switzerland",
        url: "https://tiles.arcgis.com/tiles/oPre3pOfRfefL8y0/arcgis/rest/services/LV95_Contours_Switzerland/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "Canterbury Basemap",
        url: "https://tiles.arcgis.com/tiles/RNxkQaMWQcgbiF98/arcgis/rest/services/Canterbury_Basemap/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "OSM RD (Netherlands)",
        url: "https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/OSM_RD/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "Africa Mask (Dark)",
        url: "https://tiles.arcgis.com/tiles/zNrTBuYXV2f35M0U/arcgis/rest/services/Africa_Buffer_v2/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "Caribbean Mask (Dark)",
        url: "https://tiles.arcgis.com/tiles/yVZJC1sH78c0dQ2w/arcgis/rest/services/Caribbean_Mask_Dark/VectorTileServer/resources/styles/root.json",
      },
    ],
  },
  {
    label: "Esri Thematic",
    urls: [
      {
        name: "Microsoft Building Footprints",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Microsoft_Building_Footprints/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "Canterbury Contours",
        url: "https://tiles.arcgis.com/tiles/RNxkQaMWQcgbiF98/arcgis/rest/services/Contours/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "NZ Mainland Contours (Topo 50k)",
        url: "https://tiles.arcgis.com/tiles/sreKTGUpFk4UFFqu/arcgis/rest/services/NZ_Mainland_Contours_Topo_50k/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "Stark County Contours",
        url: "https://tiles.arcgis.com/tiles/1JiK2PayqrHvvJhM/arcgis/rest/services/Contour_Vector_Cache/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "Dark Skies",
        url: "https://tiles.arcgis.com/tiles/KTcxiTD9dsQw4r7Z/arcgis/rest/services/Dark_Skies/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "Utah Statewide Parcels",
        url: "https://tiles.arcgis.com/tiles/99lidPhWCzftIe9K/arcgis/rest/services/StatewideParcels/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "NC OneMap Parcel Boundaries",
        url: "https://tiles.arcgis.com/tiles/NuWFvHYDMVmmxMeM/arcgis/rest/services/NCOneMapParcelBoundaries/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "Santa Monica Mountains Parcels",
        url: "https://vectortileservices3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Santa_Monica_Mountains_Parcels_VTL/VectorTileServer/resources/styles/root.json",
      },
    ],
  },
  {
    label: "Esri OSM",
    urls: [
      {
        name: "OpenStreetMap v2 (tiles)",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/OpenStreetMap_v2/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "OpenStreetMap GCS v2 (tiles)",
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/OpenStreetMap_GCS_v2/VectorTileServer/resources/styles/root.json",
      },
      {
        name: "OpenStreetMap GCS v2 (basemaps)",
        url: "https://basemaps.arcgis.com/arcgis/rest/services/OpenStreetMap_GCS_v2/VectorTileServer/resources/styles/root.json",
      },
    ],
  },
  {
    label: "OpenFreeMap",
    urls: [
      { name: "Liberty", url: "https://tiles.openfreemap.org/styles/liberty" },
      { name: "Bright", url: "https://tiles.openfreemap.org/styles/bright" },
      {
        name: "Positron",
        url: "https://tiles.openfreemap.org/styles/positron",
      },
      { name: "Dark", url: "https://tiles.openfreemap.org/styles/dark" },
      { name: "Fiord", url: "https://tiles.openfreemap.org/styles/fiord" },
    ],
  },
  {
    label: "Stadia Maps",
    urls: [
      {
        name: "Alidade Smooth",
        url: "https://tiles.stadiamaps.com/styles/alidade_smooth.json",
      },
      {
        name: "Alidade Smooth Dark",
        url: "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
      },
      {
        name: "OSM Bright",
        url: "https://tiles.stadiamaps.com/styles/osm_bright.json",
      },
      {
        name: "Outdoors",
        url: "https://tiles.stadiamaps.com/styles/outdoors.json",
      },
      {
        name: "Stamen Toner",
        url: "https://tiles.stadiamaps.com/styles/stamen_toner.json",
      },
      {
        name: "Stamen Terrain",
        url: "https://tiles.stadiamaps.com/styles/stamen_terrain.json",
      },
      {
        name: "Stamen Watercolor",
        url: "https://tiles.stadiamaps.com/styles/stamen_watercolor.json",
      },
    ],
  },
  {
    label: "MapLibre",
    urls: [
      {
        name: "Demo Tiles",
        url: "https://demotiles.maplibre.org/style.json",
      },
    ],
  },
];
