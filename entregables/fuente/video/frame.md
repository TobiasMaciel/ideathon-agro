---
version: alpha
name: Sobra Cobalt Instrument — Frame (video / frame layer)
description: >
  Video-first companion to Sobra's docs/design.md (Identidad Cobalto). The unit is the frame (1920×1080).
  Atoms match the live web app: cobalt-tinted paper (#eef3fd) and pure white surface cards (#ffffff) for
  light explanation/demo frames; deep navy-cobalt (#0b1640) for gravity frames (hook, savings climax, close);
  electric cobalt (#2150e8 on light, #7aa7ff sky-cobalt on dark) as the single brand accent; traffic-light
  verdict colors used ONLY for data verdicts (signal-green #17784a / #6fe0a8, signal-amber #8a6410 / #ffd06b,
  signal-red #b5402a / #ff9a80); subtle instrument graph-grid (rgba(33,80,232,0.06) on light, rgba(122,167,255,0.08)
  on dark); Archivo Variable semiexpanded (font-stretch 112%, weights 600–800) for display headlines and big KPIs,
  Geist Variable for body copy, and Geist Mono Variable uppercase with tabular-nums for kickers, metadata, and chrome.
unit: the frame — 1920×1080 primary
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  # Primary surfaces (mapped to standard roles so captions.mjs and frame workers resolve cleanly)
  canvas: "#EEF3FD"
  surface: "#FFFFFF"
  surface-subtle: "#E6EDFB"
  line: "#D3DEF3"
  ink: "#0A1433"
  ink-muted: "#45547A"
  ink-subtle: "#52618A"
  # Brand accent (Cobalt)
  cobalt: "#2150E8"
  cobalt-sky: "#7AA7FF"
  cobalt-subtle: "rgba(33,80,232,0.08)"
  # Dark gravity surfaces (Frames 1, 7, 10)
  navy: "#0B1640"
  navy-surface: "#101E52"
  navy-line: "#24377A"
  navy-ink: "#EEF2FF"
  navy-muted: "#B0BDE6"
  # Compatibility aliases for preset references
  cream: "#EEF3FD"
  cream-2: "#E6EDFB"
  green: "#0B1640"
  green-deep: "#071033"
  green-lite: "#101E52"
  pink: "#7AA7FF"
  pink-deep: "#2150E8"
  # Traffic-light data colors (Sobra's semáforo — used ONLY for data verdicts: Cierra / Justo / No cierra)
  signal-red: "#B5402A"
  signal-red-dark: "#FF9A80"
  signal-amber: "#8A6410"
  signal-amber-dark: "#FFD06B"
  signal-green: "#17784A"
  signal-green-dark: "#6FE0A8"

typography:
  # — reading + chrome ramp —
  body:         { fontFamily: "Geist Variable", cqw: 1.56, weight: 400, lineHeight: 1.4 }
  body-card:    { fontFamily: "Geist Variable", cqw: 1.35, weight: 400, lineHeight: 1.36 }
  label:        { fontFamily: "Geist Mono Variable", px: 22, cqw: 1.15, weight: 500, tracking: "0.14em", upper: true }
  caption-mono: { fontFamily: "Geist Mono Variable", px: 20, cqw: 1.05, weight: 500, tracking: "0.12em", upper: true }
  # — display ramp (Archivo Variable semiexpanded 112% for headlines and figures) —
  title-card-sm:{ fontFamily: "Archivo Variable", cqw: 2.6, weight: 700, lineHeight: 1.02, tracking: "-0.02em" }
  title-card:   { fontFamily: "Archivo Variable", cqw: 3.2, weight: 700, lineHeight: 1.0, tracking: "-0.02em" }
  headline:     { fontFamily: "Archivo Variable", cqw: 4.2, weight: 800, lineHeight: 0.98, tracking: "-0.025em" }
  headline-xl:  { fontFamily: "Archivo Variable", cqw: 5.0, weight: 800, lineHeight: 0.96, tracking: "-0.03em" }
  display:      { fontFamily: "Archivo Variable", cqw: 6.8, weight: 800, lineHeight: 0.95, tracking: "-0.03em" }
  display-hero: { fontFamily: "Archivo Variable", cqw: 10.5, weight: 800, lineHeight: 0.92, tracking: "-0.035em" }
  stat-figure:  { fontFamily: "Archivo Variable", cqw: 11.0, weight: 800, lineHeight: 0.92, tracking: "-0.035em" }
  stat-figure-unit: { fontFamily: "Geist Mono Variable", cqw: 4.2, weight: 600, lineHeight: 1.0 }
  name:         { fontFamily: "Archivo Variable", cqw: 2.2, weight: 700, lineHeight: 1.05 }

spacing:
  slide-pad: "5cqw"
  rule: "1.5px"
  rule-card: "2px"
  radius-card: "8px"
  radius-step: "8px"

components:
  topbar:
    typography: "{typography.label} (Geist Mono Variable) + Sobra pixel mark"
    placement: "top edge inside 5cqw pad, kicker left (with 8px cobalt square), Sobra lockup right"
    description: "On EVERY frame — the instrument spine."
  instrument-grid:
    backgroundImage: "linear-gradient(to right, var(--grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px); background-size: 32px 32px"
    description: "Subtle 32px technical grid on every frame's full-bleed background clip."
  kicker:
    typography: "{typography.label} with an 8px × 8px solid cobalt square prefix"
    description: "Matches Sobra's .kicker class (■ TU PLANTA, ■ RESULTADO, ■ EJEMPLO EN VIVO)."
  result-block:
    backgroundColor: "{colors.cobalt} (#2150E8) with #FFFFFF text"
    rounded: "8px"
    description: "Cobalt answer block with a white status pill on top-right carrying ✓ CIERRA (#17784A) or ✕ NO CIERRA (#B5402A)."
  step-tile:
    backgroundColor: "{colors.surface} (#FFFFFF) with 1.5px solid {colors.line} (#D3DEF3), or {colors.navy-surface} (#101E52) on dark frames"
    rounded: "8px"
    shadow: "none"
    typography: "mono ordinal + {typography.title-card} + {typography.body-card}"
    description: "Instrument card with 8px straight radius and hairline border."
  kpi-block:
    typography: "{typography.caption-mono} tag → {typography.stat-figure} (+{typography.stat-figure-unit}) → {typography.body}"
    rule: "2px cobalt rule above"
    description: "Oversized Archivo semiexpanded tabular figure."
---

# Sobra Cobalt Instrument — Frame (video / frame layer)

## Brand adaptation (READ FIRST — the frontmatter is the source of truth)

This is the **Sobra.** design system (`docs/design.md`, Identidad Cobalto 2026-10) adapted to 1920×1080 video frames:

- **Brand name & mark**: **Sobra.** (with the final period in cobalt `#2150E8` on light or `#7AA7FF` on dark). The icon (`assets/logo-mark.svg`, lockups `assets/logo-sobra-light.svg` and `assets/logo-sobra-dark.svg`) is a 9×9 pixel grid on a cobalt rounded square showing a pile of agro-industrial residue from which a diagonal of three pixels rises and lights up to 1.0 opacity ("lo que sobra gana valor").
- **Three fonts (all shipped locally in `assets/fonts/`)**:
  - **Archivo Variable** (`font-variation-settings: "wdth" 112`, weights 600–800, tight negative tracking `-0.025em` to `-0.035em`) for the brand, headlines, titles, and giant KPI figures.
  - **Geist Variable** (weights 400–500) for body copy and descriptions.
  - **Geist Mono Variable** (weights 500–600, uppercase, wide tracking `0.12em–0.16em`, `font-variant-numeric: tabular-nums`) for kickers, metadata, distances, percentages, and badges.
- **Two surface registers**:
  - **Light instrument canvas (`#EEF3FD`)** with pure white cards (`#FFFFFF`), `#D3DEF3` 1.5px borders, `#0A1433` deep navy ink, `#45547A` muted text, and `#2150E8` electric cobalt accent. Used on explanation, diagram, and live app showcase frames (Frames 2, 3, 4, 5, 6, 8, 9).
  - **Dark navy-cobalt gravity canvas (`#0B1640`)** with `#101E52` cards, `#24377A` borders, `#EEF2FF` text, `#B0BDE6` muted text, and `#7AA7FF` sky-cobalt accent (plus `#2150E8` solid cobalt blocks). Used on high-gravity frames: the cold open hook (Frame 1), the $15M/month savings climax (Frame 7), and the closing pilot CTA (Frame 10).
- **One accent, one traffic light**:
  - Cobalt (`#2150E8` / `#7AA7FF`) is active state, brand, selection, route line, radius ring, and the solid background of the "Resultado" card.
  - Traffic light colors appear **ONLY as verdict data**: Green (`#17784A` on light / `#6FE0A8` on dark) = `✓ CIERRA`, Amber (`#8A6410` / `#FFD06B`) = `! JUSTO`, Coral Red (`#B5402A` / `#FF9A80`) = `✕ NO CIERRA`. Always pair color with icon (`✓`, `!`, `✕`) and mono label.
- **Instrument grid & geometry**:
  - Every frame's full-bleed background `.clip` layer carries the 32×32px technical grid (`rgba(33, 80, 232, 0.055)` on `#EEF3FD`; `rgba(122, 167, 255, 0.07)` on `#0B1640`).
  - Straight instrument radii: `8px` on cards/panels, `4px` on badges/pills.
  - Every frame carries the **topbar** inside the `5cqw` safe area: left kicker (`■ SOBRA · DESAFÍO 03` or section name in Geist Mono uppercase) and right brand lockup (`Sobra.` + counter `0N / 10`).

## Font loading (REQUIRED in every frame `<template>` and caption skin)

Paste this exact `<style>` block into every frame composition `<template>` so `Archivo Variable`, `Geist Variable`, and `Geist Mono Variable` resolve deterministically from local files without network requests:

```html
<style>
@font-face{font-family:"Archivo Variable";font-style:normal;font-display:swap;font-weight:100 900;font-stretch:62% 125%;src:url("assets/fonts/archivo-latin-wdth-normal.woff2")format("woff2-variations")}
@font-face{font-family:"Archivo Variable";font-style:normal;font-display:swap;font-weight:100 900;font-stretch:62% 125%;src:url("assets/fonts/archivo-latin-ext-wdth-normal.woff2")format("woff2-variations");unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:"Geist Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("assets/fonts/captured-geist-latin-ext-wght-normal-DC-KSUi6.woff2")format("woff2-variations");unicode-range:U+100-2BA,U+2BD-2C5,U+2C7-2CC,U+2CE-2D7,U+2DD-2FF,U+304,U+308,U+329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:"Geist Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("assets/fonts/captured-geist-latin-wght-normal-BgDaEnEv.woff2")format("woff2-variations");unicode-range:U+??,U+131,U+152-153,U+2BB-2BC,U+2C6,U+2DA,U+2DC,U+304,U+308,U+329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:"Geist Mono Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("assets/fonts/captured-geist-mono-symbols2-wght-normal-CO5SzqOn.woff2")format("woff2-variations");unicode-range:U+2000-2001,U+2004-2008,U+200A,U+23B8-23BD,U+2500-259F}
@font-face{font-family:"Geist Mono Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("assets/fonts/captured-geist-mono-latin-ext-wght-normal-Bwz-egvJ.woff2")format("woff2-variations");unicode-range:U+100-2BA,U+2BD-2C5,U+2C7-2CC,U+2CE-2D7,U+2DD-2FF,U+304,U+308,U+329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:"Geist Mono Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("assets/fonts/captured-geist-mono-latin-wght-normal-XN7g48iV.woff2")format("woff2-variations");unicode-range:U+??,U+131,U+152-153,U+2BB-2BC,U+2C6,U+2DA,U+2DC,U+304,U+308,U+329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
</style>
```
