<script lang="ts">
  import { transpile, detect, resolveEsriStyleUrls } from "@walkthru-earth/styleglot";
  import type { Dialect, EsriStyleOutput } from "@walkthru-earth/styleglot";
  import CodeEditor from "./lib/CodeEditor.svelte";
  import EsriMap from "./lib/EsriMap.svelte";
  import MaplibreMap from "./lib/MaplibreMap.svelte";
  import MapboxMap from "./lib/MapboxMap.svelte";
  import ThemeToggle from "./lib/ThemeToggle.svelte";
  import { DEFAULT_STYLE_URL, URL_GROUPS } from "./lib/urls";

  let selectedUrl = $state(DEFAULT_STYLE_URL);
  let customUrl = $state("");
  let useCustom = $state(false);
  let mapboxToken = $state(import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "");
  let loading = $state(false);
  let error = $state("");
  let detectedDialect = $state<string>("");

  let esriJson = $state("");
  let maplibreJson = $state("");
  let mapboxJson = $state("");
  let hasEsriSource = $state(false);

  let center = $state<[number, number]>([0, 30]);
  let zoom = $state(2);

  let esriMapRef: EsriMap;
  let maplibreMapRef: MaplibreMap;
  let mapboxMapRef: MapboxMap;

  function handleMapMove(
    source: "esri" | "maplibre" | "mapbox",
    c: [number, number],
    z: number,
  ) {
    center = c;
    zoom = z;
    if (source !== "esri") esriMapRef?.syncView(c, z);
    if (source !== "maplibre") maplibreMapRef?.syncView(c, z);
    if (source !== "mapbox") mapboxMapRef?.syncView(c, z);
  }

  let activeUrl = $derived(useCustom ? customUrl.trim() : selectedUrl);

  $effect(() => {
    if (activeUrl && !esriJson) handleFetch();
  });

  async function handleFetch() {
    if (!activeUrl) return;
    loading = true;
    error = "";

    try {
      const res = await fetch(activeUrl, {
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const style = await res.json();
      const dialect: Dialect = detect(style);
      detectedDialect = dialect;

      const baseUrl = activeUrl.includes("/VectorTileServer")
        ? activeUrl.replace(/\/resources\/styles\/root\.json$/, "")
        : undefined;

      const toEsri = transpile(style, {
        toDialect: "esri",
        fromDialect: dialect,
        baseUrl,
      });

      const toMaplibre = transpile(style, {
        toDialect: "maplibre",
        fromDialect: dialect,
        baseUrl,
      });

      const toMapbox = transpile(style, {
        toDialect: "mapbox",
        fromDialect: dialect,
        baseUrl,
      });

      const esriOutput = baseUrl
        ? resolveEsriStyleUrls(toEsri.output as EsriStyleOutput, baseUrl)
        : toEsri.output;
      const sources = (esriOutput as EsriStyleOutput).sources ?? {};
      const anySrc = Object.values(sources)[0];
      hasEsriSource = !!baseUrl || !!(anySrc?.tiles?.length) || !!(anySrc?.url);
      esriJson = JSON.stringify(esriOutput, null, 2);
      maplibreJson = JSON.stringify(toMaplibre.output, null, 2);
      mapboxJson = JSON.stringify(toMapbox.output, null, 2);
    } catch (e: any) {
      error = e.message || "Failed to fetch style";
    }

    loading = false;
  }
</script>

<!-- Navbar -->
<nav class="sticky top-0 z-50 flex items-center justify-between min-h-12 px-3 gap-3 bg-base-200 border-b border-base-300 shrink-0">
  <a href="https://walkthru.earth/links" target="_blank" rel="noopener" class="flex items-center gap-2 shrink-0">
    <img src="{import.meta.env.BASE_URL}favicon.svg" alt="walkthru.earth" class="w-6 h-6" />
    <span class="font-bold text-sm tracking-wide text-base-content">Styleglot</span>
  </a>

  <div class="flex items-center gap-2 flex-1 flex-wrap min-w-0">
    {#if useCustom}
      <input
        type="url"
        bind:value={customUrl}
        placeholder="Paste a style JSON URL..."
        class="input input-sm input-bordered flex-1 min-w-[180px] max-w-[400px] text-xs font-mono"
      />
    {:else}
      <select bind:value={selectedUrl} class="select select-sm select-bordered flex-1 min-w-[180px] max-w-[400px] text-xs">
        {#each URL_GROUPS as group}
          <optgroup label={group.label}>
            {#each group.urls as item}
              <option value={item.url}>{item.name}</option>
            {/each}
          </optgroup>
        {/each}
      </select>
    {/if}

    <button
      class="btn btn-sm btn-ghost text-xs"
      onclick={() => (useCustom = !useCustom)}
    >
      {useCustom ? "Presets" : "Custom URL"}
    </button>

    <button
      class="btn btn-sm btn-primary"
      onclick={handleFetch}
      disabled={!activeUrl || loading}
    >
      {loading ? "Loading..." : "Fetch & Transpile"}
    </button>

    {#if detectedDialect}
      <span class="badge badge-sm badge-success text-success-content">{detectedDialect}</span>
    {/if}

    <span class="badge badge-sm badge-info text-info-content font-mono tabular-nums">z{zoom.toFixed(1)}</span>
  </div>

  <div class="flex items-center gap-1 shrink-0">
    <a
      href="https://github.com/walkthru-earth/styleglot"
      target="_blank"
      rel="noopener"
      class="btn btn-sm btn-ghost btn-circle"
      aria-label="GitHub"
    >
      <svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
    </a>
    <ThemeToggle />
  </div>
</nav>

{#if error}
  <div class="px-3 py-1.5 bg-error text-error-content text-xs">{error}</div>
{/if}

<!-- Main content: 3 columns -->
<div class="flex flex-1 overflow-hidden">
  <!-- Esri column -->
  <div class="flex flex-col flex-1 border-r border-base-300 overflow-hidden">
    <div class="h-[40%] border-b border-base-300 overflow-hidden">
      <CodeEditor content={esriJson} label="Esri" onchange={(v) => (esriJson = v)} />
    </div>
    <div class="h-[60%] overflow-hidden">
      {#if hasEsriSource}
        <EsriMap
          bind:this={esriMapRef}
          styleJson={esriJson}
          bind:center
          bind:zoom
          onmove={(c, z) => handleMapMove("esri", c, z)}
        />
      {:else}
        <div class="w-full h-full flex flex-col items-center justify-center bg-base-200 text-base-content/40 text-xs text-center gap-1 p-4">
          <p>Esri map preview requires a vector tile source.</p>
          <p>The transpiled JSON is shown above.</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- MapLibre column -->
  <div class="flex flex-col flex-1 border-r border-base-300 overflow-hidden">
    <div class="h-[40%] border-b border-base-300 overflow-hidden">
      <CodeEditor content={maplibreJson} label="MapLibre" onchange={(v) => (maplibreJson = v)} />
    </div>
    <div class="h-[60%] overflow-hidden">
      <MaplibreMap
        bind:this={maplibreMapRef}
        styleJson={maplibreJson}
        bind:center
        bind:zoom
        onmove={(c, z) => handleMapMove("maplibre", c, z)}
      />
    </div>
  </div>

  <!-- Mapbox column -->
  <div class="flex flex-col flex-1 overflow-hidden">
    <div class="h-[40%] border-b border-base-300 overflow-hidden">
      <CodeEditor content={mapboxJson} label="Mapbox" onchange={(v) => (mapboxJson = v)} />
    </div>
    <div class="h-[60%] overflow-hidden">
      <MapboxMap
        bind:this={mapboxMapRef}
        styleJson={mapboxJson}
        accessToken={mapboxToken}
        bind:center
        bind:zoom
        onmove={(c, z) => handleMapMove("mapbox", c, z)}
      />
    </div>
  </div>
</div>
