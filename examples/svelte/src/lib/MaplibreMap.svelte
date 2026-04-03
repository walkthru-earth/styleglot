<script lang="ts">
  import { untrack } from "svelte";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";

  maplibregl.setRTLTextPlugin(
    "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js",
    true,
  );

  let {
    styleJson = "",
    center = $bindable([0, 30] as [number, number]),
    zoom = $bindable(2),
    onmove,
  }: {
    styleJson?: string;
    center?: [number, number];
    zoom?: number;
    onmove?: (center: [number, number], zoom: number) => void;
  } = $props();

  let container: HTMLElement;
  let map: maplibregl.Map | undefined = $state();
  let syncing = false;

  // Initialize and teardown the map (only when container mounts)
  $effect(() => {
    if (!container) return;

    const [initCenter, initZoom] = untrack(() => [center, zoom]);

    const m = new maplibregl.Map({
      container,
      style: { version: 8, sources: {}, layers: [] } as any,
      center: initCenter,
      zoom: initZoom,
      attributionControl: false,
    });

    m.addControl(new maplibregl.NavigationControl(), "top-left");
    m.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    m.on("moveend", () => {
      if (syncing) return;
      const c = m.getCenter();
      center = [c.lng, c.lat];
      zoom = m.getZoom();
      onmove?.(center, zoom);
    });

    map = m;

    return () => {
      map = undefined;
      m.remove();
    };
  });

  // Apply style when it changes
  let prevStyleJson = "";
  $effect(() => {
    if (!map || !styleJson || styleJson === prevStyleJson) return;
    prevStyleJson = styleJson;
    try {
      map.setStyle(JSON.parse(styleJson));
    } catch (err) {
      console.warn("[MapLibreMap] style error:", err);
    }
  });

  export function syncView(c: [number, number], z: number) {
    if (!map) return;
    syncing = true;
    map.jumpTo({ center: c, zoom: z });
    setTimeout(() => (syncing = false), 50);
  }
</script>

<div class="w-full h-full" bind:this={container}></div>
