<script lang="ts">
  import { EditorView, basicSetup } from "codemirror";
  import { json } from "@codemirror/lang-json";
  import { EditorState, Compartment } from "@codemirror/state";
  import { oneDark } from "@codemirror/theme-one-dark";

  let {
    content = "",
    label = "",
    onchange,
  }: {
    content?: string;
    label?: string;
    onchange?: (value: string) => void;
  } = $props();

  let container: HTMLElement;
  let view: EditorView | undefined = $state();
  let ignoreUpdate = false;
  const themeCompartment = new Compartment();

  function isDark(): boolean {
    return document.documentElement.getAttribute("data-theme") === "walkthru-dark";
  }

  // Initialize and teardown the editor
  $effect(() => {
    if (!container) return;

    const v = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: [
          basicSetup,
          json(),
          themeCompartment.of(isDark() ? oneDark : []),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !ignoreUpdate) {
              onchange?.(update.state.doc.toString());
            }
          }),
          EditorView.theme({
            "&": { height: "100%", fontSize: "12px" },
            ".cm-scroller": { overflow: "auto" },
          }),
        ],
      }),
      parent: container,
    });

    view = v;

    // Watch for theme changes via MutationObserver on data-theme attribute
    const observer = new MutationObserver(() => {
      v.dispatch({
        effects: themeCompartment.reconfigure(isDark() ? oneDark : []),
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
      view = undefined;
      v.destroy();
    };
  });

  // Sync external content changes into the editor
  $effect(() => {
    if (view && content !== view.state.doc.toString()) {
      ignoreUpdate = true;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: content },
      });
      ignoreUpdate = false;
    }
  });
</script>

<div class="flex flex-col h-full overflow-hidden">
  {#if label}
    <div class="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-base-content/50 bg-base-200 border-b border-base-300">
      {label}
    </div>
  {/if}
  <div class="flex-1 overflow-hidden" bind:this={container}></div>
</div>
