<script lang="ts">
  import { untrack } from "svelte";
  import mapboxgl from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";

  mapboxgl.setRTLTextPlugin(
    "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js",
  );

  let {
    styleJson = "",
    accessToken = "",
    center = $bindable([0, 30] as [number, number]),
    zoom = $bindable(2),
    onmove,
  }: {
    styleJson?: string;
    accessToken?: string;
    center?: [number, number];
    zoom?: number;
    onmove?: (center: [number, number], zoom: number) => void;
  } = $props();

  let container: HTMLElement;
  let map: mapboxgl.Map | undefined = $state();
  let syncing = false;
  let hasToken = $derived(!!accessToken);

  // Initialize and teardown the map (only when container + token available)
  $effect(() => {
    if (!container || !accessToken) return;

    const [initCenter, initZoom] = untrack(() => [center, zoom]);

    mapboxgl.accessToken = accessToken;

    const m = new mapboxgl.Map({
      container,
      style: { version: 8, sources: {}, layers: [] } as any,
      center: initCenter,
      zoom: initZoom,
      attributionControl: false,
    });

    m.addControl(new mapboxgl.NavigationControl(), "top-left");
    m.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

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
      console.warn("[MapboxMap] style error:", err);
    }
  });

  export function syncView(c: [number, number], z: number) {
    if (!map) return;
    syncing = true;
    map.jumpTo({ center: c, zoom: z });
    setTimeout(() => (syncing = false), 50);
  }
</script>

{#if !hasToken}
  <div class="w-full h-full flex items-center justify-center bg-base-200 text-base-content/40 text-xs text-center p-4">
    <p>Set VITE_MAPBOX_ACCESS_TOKEN in .env to enable the Mapbox map</p>
  </div>
{/if}
<div class="w-full h-full" class:hidden={!hasToken} bind:this={container}></div>

<style>
  .hidden {
    display: none;
  }
</style>
