<script lang="ts">
  type Theme = "light" | "dark" | "system";

  let current = $state<Theme>(
    (localStorage.getItem("theme") as Theme) || "system",
  );

  function apply(theme: Theme) {
    current = theme;
    localStorage.setItem("theme", theme);
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "walkthru-light");
    } else if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "walkthru-dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-theme", prefersDark ? "walkthru-dark" : "walkthru-light");
    }
  }

  function cycle() {
    const next: Theme = current === "light" ? "dark" : current === "dark" ? "system" : "light";
    apply(next);
  }
</script>

<button
  class="btn btn-sm btn-ghost btn-circle"
  onclick={cycle}
  aria-label="Toggle theme ({current})"
  title="Theme: {current}"
>
  {#if current === "light"}
    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  {:else if current === "dark"}
    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  {:else}
    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <path d="M8 21h8m-4-4v4" />
    </svg>
  {/if}
</button>
