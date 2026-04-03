# @walkthru-earth/styleglot

## 0.2.0

### Minor Changes

- Preserve GeoJSON sources and respect input sprite/glyphs in Esri emitter

  - Pass through GeoJSON sources in Esri output instead of silently dropping them
  - Make `sprite` and `glyphs` optional in `EsriStyleOutput`, only include them when present in the input style or when targeting an Esri VTS with a baseUrl
  - Stop hardcoding fallback sprite/glyphs paths for non-Esri source styles

## 0.1.2

### Patch Changes

- [`77d0b1a`](https://github.com/walkthru-earth/styleglot/commit/77d0b1ad0db613430f1cdea423beac539bd26fea) Thanks [@yharby](https://github.com/yharby)! - add README.md
