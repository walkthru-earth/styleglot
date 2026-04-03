<script lang="ts">
  import { untrack } from "svelte";
  import Basemap from "@arcgis/core/Basemap.js";
  import Map from "@arcgis/core/Map.js";
  import MapView from "@arcgis/core/views/MapView.js";
  import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer.js";
  import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";
  import { watch } from "@arcgis/core/core/reactiveUtils.js";

  let {
    styleJson = "",
    serviceUrl = "",
    center = $bindable([0, 30] as [number, number]),
    zoom = $bindable(2),
    onmove,
  }: {
    styleJson?: string;
    serviceUrl?: string;
    center?: [number, number];
    zoom?: number;
    onmove?: (center: [number, number], zoom: number) => void;
  } = $props();

  let container: HTMLElement;
  let view: MapView | undefined = $state();
  let syncing = false;

  // Initialize and teardown the MapView (only when container mounts)
  $effect(() => {
    if (!container) return;

    const [initCenter, initZoom] = untrack(() => [center, zoom]);

    const map = new Map();
    const v = new MapView({
      container,
      map,
      center: initCenter,
      zoom: initZoom,
      spatialReference: SpatialReference.WebMercator,
      constraints: {
        maxZoom: 20,
      },
    });

    const handle = watch(
      () => [v.center, v.zoom] as const,
      ([c, z]) => {
        if (syncing || !c) return;
        center = [c.longitude, c.latitude];
        zoom = z;
        onmove?.(center, zoom);
      },
    );

    view = v;

    return () => {
      handle.remove();
      view = undefined;
      v.destroy();
    };
  });

  // Apply style when it changes
  let prevStyleJson = "";
  $effect(() => {
    if (!view || !styleJson || styleJson === prevStyleJson) return;
    let parsed: any;
    try {
      parsed = JSON.parse(styleJson);
    } catch {
      return;
    }
    if (!parsed.sources || Object.keys(parsed.sources).length === 0) return;
    prevStyleJson = styleJson;

    const layer = serviceUrl
      ? new VectorTileLayer({ url: serviceUrl })
      : new VectorTileLayer({ style: parsed });
    layer.load().then(() => {
      if (view) view.map.basemap = new Basemap({ baseLayers: [layer] });
    }).catch((err: any) => {
      console.error("[EsriMap] VectorTileLayer load failed:", err);
    });
  });

  export function syncView(c: [number, number], z: number) {
    if (!view?.ready) return;
    syncing = true;
    view
      .goTo({ center: c, zoom: z }, { animate: false })
      .finally(() => (syncing = false));
  }
</script>

<div class="w-full h-full" bind:this={container}></div>
