# Frame packet: 06-demo-verde

## Project inputs

- Project: C:\Users\tobia\Desktop\Proyectos\ideathon-agro\entregables\fuente\video
- Design tokens: C:\Users\tobia\Desktop\Proyectos\ideathon-agro\entregables\fuente\video\frame.md
- RULES_DIR: c:\Users\tobia\Desktop\Proyectos\ideathon-agro\.claude\skills\hyperframes-animation\rules

## Assigned storyboard block

## Frame 6 — Pellet: verde

- scene: La misma vista en Sobra pasa de Suelto a Pellet: el círculo cobalto crece de 25 km a 310 km y el resultado pasa a verde "✓ CIERRA: MARGEN 23,1 %" con "+$ 1.931.537/mes" y "12× más lejos"
- voiceover: "Pelletizada, la misma cascarilla llega doce veces más lejos. Semáforo verde: veintitrés por ciento de margen para el molino."
- duration: 7.061s
- transition_in: crossfade
- status: outline
- src: compositions/frames/06-demo-verde.html
- type: feature_showcase
- persuasion: Show-don't-tell proof
- beat: relief + excitement
- blueprint: video-text-pivot (Adapt)
- asset_candidates: assets/app-03-pellet-verde.png — mismo par en pellet, radio 310 km, CIERRA 23,1 %; assets/app-02-suelto-rojo.png — estado anterior para la transición rojo → verde
- focal: assets/app-03-pellet-verde.png
- roles: app-03-pellet-verde = cutout · app-02-suelto-rojo = supporting
- sfx: whoosh
- handoff_in: element=app-viewport x=960 y=460 scale=1.08 opacity=1 direction=still

Adapt: starts on `assets/app-02-suelto-rojo.png` at the exact handoff pose, flips in-place to `assets/app-03-pellet-verde.png` as the VO says "Pelletizada", expanding the cobalt radius ring to 310 km (`12× MÁS LEJOS`), and locks onto the green verdict `✓ CIERRA: MARGEN 23,1 %`.
Scene 1 (0.0–3.8s): Opens seamlessly from `app-02-suelto-rojo.png` and immediately crossfades to `assets/app-03-pellet-verde.png` while easing back to full view (`scale: 1.08` → `1.0`). Left-side hero callout card (`#2150E8` solid cobalt block with white Archivo 800 text) reveals: `25 KM → 310 KM · 12× MÁS LEJOS`.
Scene 2 (3.8–6.8s): As the VO says "Semáforo verde: veintitrés por ciento de margen para el molino", a green verdict card (`#17784A` fill, `#FFFFFF` text) lands below the cobalt card: `✓ CIERRA · MARGEN +23,1 % · +$ 1.931.537 / MES` with trajectory tag `−281,5 % → +23,1 %`.
Scene 3 (6.8–9.0s): Climax hold — the green verdict and the full Corrientes 310 km radius ring hold completely still so the jury reads the exact numbers.

narrativeRole: El giro: la app muestra qué cambio hace viable el negocio.
keyMessage: Pelletizar convierte el rojo en verde.

## Selected blueprint: video-text-pivot

# video-text-pivot — Video → Text Pivot

**intent**: A product video holds center and claims attention, then slides aside to hand its weight to a hero stat in the space it vacates, then both clear and kinetic text types into the center — accent words carrying the meaning the video used to carry — sealed by a gradient pill. The arc is "show → yield → pivot → stamp," and each handoff pairs an exit with a same-anchor entrance so two beats read, not four.

**roles served**

- Product_Intro (from `metric-video-text-pivot`): when the open is "see the feature" then "see the impact" and the `[product video]` must stay visible through the stat reveal — it slides, it doesn't cut.
- Key_Feature: a feature clip that yields to a frame-filling metric and a typographic impact line.

**duration**: 6–8s

**shot structure** (a `[bg]` canvas; one `[product video]` as a real muted `.mp4` clip, a hero stat, then kinetic text — each pair shares a screen anchor so the handoff reads as a weight-transfer)

- **Scene 1 (0.0–~1.6s) — the video shows.** The `[product video]` lands centered on a smooth scale-up and breathes (a small y-bob), claiming full attention. Camera static.
- **Scene 2 (~1.6–3.2s) — yield + stat (signature move).** The video SLIDES aside (x + scale down) **into the very space** the `[hero stat]` now fills as the stat pops in with 3D-depth type — one weight-transfer reading as a single event, not two. The stat breathes within this window.
- **Scene 3 (~3.2–5.0s) — pivot to text.** Both video and stat clear out and kinetic `[impact text]` TYPES into the vacated center, character by character; its `[accent words]` carry the meaning the video used to carry.
- **Scene 4 (~5.0–end) — stamp.** A gradient `[pill]` snaps shut around the closing line (`scaleX` 0→1), its glow halo resolving a beat behind so the silhouette reads before the bloom — sealing the statement as one graphic. Holds.

**motion vocabulary**: video scale-in + small breath; weight-transfer slide (video x + scale-down handing off to the stat at the same anchor); 3D-depth stat type; character-stream typing; gradient pill scaleX-snap; glow-halo bloom trailing the silhouette.

**rule mapping**

- video entrance (smooth) and the weight-transfer slide → `gsap-effects` (scale/opacity then x + scale on a long-tail `power3`); the video itself is a muted `<video class="clip">` direct child of the root
- hero stat's frame-filling 3D type → `3d-text-depth-layers` (static-depth variation — layers built at setup, no cascade fighting the entry)
- the same-anchor video-exit ↔ stat-entry handoff (if treated as a morph) → `scale-swap-transition` (shared center)
- character-by-character impact typing through segmented spans → `dynamic-content-sequencing` (clean character stream) or `discrete-text-sequence`
- pill `scaleX` snap + trailing glow halo → `gsap-effects` (scaleX) + `ambient-glow-bloom` (the halo, resolving a beat behind)
- video / stat breath within their windows → `sine-wave-loop` (low-amplitude register — subtle jitter, gated to each element's window, never a forever loop)

**camera modifier**: camera-static — all motion is element-space (the video translates), so the "pivot" is the elements moving, not a camera.
