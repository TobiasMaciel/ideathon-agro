# Frame packet: 04-intro

## Project inputs

- Project: C:\Users\tobia\Desktop\Proyectos\ideathon-agro\entregables\fuente\video
- Design tokens: C:\Users\tobia\Desktop\Proyectos\ideathon-agro\entregables\fuente\video\frame.md
- RULES_DIR: c:\Users\tobia\Desktop\Proyectos\ideathon-agro\.claude\skills\hyperframes-animation\rules

## Assigned storyboard block

## Frame 4 — Sobra.

- scene: Tarjeta de presentación de Sobra: el nuevo ícono de píxeles, la marca "Sobra." con punto cobalto, la pregunta "¿Cierra después del camión?" y la portada real de la aplicación
- voiceover: "Por eso creamos Sobra. Un mapa de oferta y demanda de biomasa que, para cada vendedor y cada comprador, responde una sola pregunta: ¿cierra el negocio?"
- duration: 8.533s
- transition_in: zoom-through
- status: outline
- src: compositions/frames/04-intro.html
- type: product_intro
- persuasion: Friction reduction
- beat: curiosity → clarity
- blueprint: titlecard-reveal (Adapt)
- asset_candidates: assets/logo-sobra-light.svg — marca completa de Sobra; assets/app-00-portada.png — portada real de Sobra con el ejemplo en vivo; assets/app-01-inicio.png — vista del mapa y panel
- focal: assets/app-00-portada.png
- roles: app-00-portada = cutout · app-01-inicio = supporting · logo-sobra-light = supporting
- sfx: riser

Adapt: asymmetric 45/55 product reveal on `#EEF3FD` canvas — left column reveals the `logo-sobra-light.svg` lockup, the tagline, and the Cobalt question block `¿Cierra el negocio?`; right column showcases the real `app-00-portada.png` landing card morphing into `app-01-inicio.png` map view.
Scene 1 (0.0–3.2s): Light cobalt canvas (`#EEF3FD`) with grid and topbar (`■ LA SOLUCIÓN · PLATAFORMA` left, `04 / 10` right). Left column enters with `assets/logo-sobra-light.svg` (scaled crisp) and mono badge `ECONOMÍA CIRCULAR · NEA`. Right column frames `assets/app-00-portada.png` inside a crisp 8px instrument frame (`1.5px solid #D3DEF3`).
Scene 2 (3.2–7.0s): As the VO says "Un mapa de oferta y demanda de biomasa...", the right showcase crossfades and pushes slightly into `assets/app-01-inicio.png` (showing the live map of Corrientes with 13 plants and 10 buyers), while left column reveals the subhead `Oferta georreferenciada + demanda industrial real`.
Scene 3 (7.0–11.0s): As the VO asks "¿cierra el negocio?", a solid electric cobalt (`#2150E8`) banner block sweeps open on the left column with Archivo 800 white display text `¿Cierra el negocio?` and three mono pills (`✓ CIERRA` · `! JUSTO` · `✕ NO CIERRA`), holding still as a deliberate held beat.

narrativeRole: Presentar el producto como la respuesta directa al problema.
keyMessage: Sobra responde "¿cierra el negocio?".

## Selected blueprint: titlecard-reveal

# titlecard-reveal — Title-Card / Single-Card Reveal

**intent**: The calm breather/landing beat — one clean title or single brand/proof card revealed with exactly one restrained move (a slide-up crossfade, or a wipe-away-to-reveal), then a still hold. Low motion is the payload, not a deficiency.

**roles served**

- Benefits (from `benefits-titlecard-crossfade`, #34): a calm two-line value title card — headline value line, then one slide-up crossfade to a qualifier/elaboration line that holds center.
- Social_Proof (from `social-proof-reveal-card`, #35): wipe a busy app-collage open away with one diagonal pill-sweep to reveal a clean brand lockup (icon + wordmark) plus a centered "loved by [N]+ [audience] teams" social-proof line that spring-settles and holds.
- CTA (from `hard-cut-card-stack-to-logo`): a monochrome end-card
  CHAIN — statement → CTA / availability line → brand wordmark/logo — separated by instant hard
  cuts at full opacity; each card is its own allocated stillness, and the sequence terminates on
  the logo held to the final frame.
- Product_Intro (from `title-card-prelude-chain`): a three-beat dark title
  PRELUDE before any product UI — `[logo]` pop → `[name]` (a `[version]` appends grey→bright) →
  `[tagline]` card — chained by clears and blur-snap handoffs rather than hard cuts.

**duration**: 3–5s (Benefits 3–4s; Social_Proof ~5s / observed 4.7s). Card chains run 2–3s per
card, ~5.5–9.5s total.

**shot structure**

```
Scene 1 (0.0–~0.4s): static camera on [neutral / dark background]. Establish the opening state.
  Variant — Benefits: empty-to-text — [benefit line 1] is about to fade in centered (no busy open).
  Variant — Social_Proof: a busy intro frame holds briefly — an [app-screenshot / use-case collage] of overlapping cards under a [setup line].

Scene 2 (~0.4–~1.5s): the ONE move executes — a single restrained reveal that brings the calm card to center.
  Variant — Benefits: [benefit line 1] fades in centered while scaling slightly (~95%→100%, smooth ease-out) and holds.
  Variant — Social_Proof: a large [accent-color] rounded pill sweeps diagonally bottom-left → top-right and exits the corner, clip-path wiping the collage away to reveal the [brand logo lockup] beneath as the [logo icon] strokes draw on.

Scene 3 (~1.5s–end): the revealed/settled card holds to the end (the allocated stillness). At most one subtle live element (a slow breathing pulse on the card, or a very slow camera drift). No second development phase.
  Variant — Benefits: [benefit line 1] translates up and fades out as [benefit line 2 — qualifier / elaboration] translates up from below center and fades in to take center; holds. (This single slide-up crossfade IS the one move — Benefits front-loads no Scene-2 wipe.)
  Variant — Social_Proof: the lockup — [logo icon] centered, [wordmark] below, centered [social-proof tagline] "Loved by [N]+ [audience] teams" (the [N]+ may count up) — spring-settles small, then holds.

Variant — card chain (CTA end-card stack / Product_Intro title prelude): the single-card contract
repeats 2–3 times in sequence. Each card is a complete Scene 1–3 in miniature — arrive (or simply
BE there), at most one restrained move, hold — and the seams between cards are INSTANT hard cuts
at full opacity (no crossfade, no fade-through-black) or, in the prelude flavor, a blur-away →
snap-into-focus handoff.
  Card moves stay on budget: a character-by-character type-on with visible partial states, a
  right-to-left backspace that resolves the [wordmark] into the small [logo icon], a grey→bright
  append ("[name]" gains "[version]"), a blur-snap into focus — or nothing beyond a
  barely-perceptible continuous slow scale-up across the hold.
  The final card is always the [brand logo / lockup], held static to the last frame.
```

**motion vocabulary**: single restrained reveal (gentle fade-in + subtle scale-up settle | diagonal clip-path pill-wipe), one slide-up crossfade between two centered lines (Benefits), icon stroke draw-on (Social_Proof), optional "[N]+ teams" count-up, logo+tagline spring-settle-and-hold, subtle breathing on the held card, hold-to-end. Calm register — no spring chains, no tumble, no per-beat flips, no second phase. Camera static (optional very slow drift only). Card-chain register: instant hard cut at full opacity as the only seam, barely-perceptible
continuous slow scale-up across each hold, character-by-character type-on with visible partial
states, right-to-left backspace collapsing the wordmark into the logo icon, grey→bright text
append, blur-away → snap-into-focus card handoff, logo pop with overshoot + glow (prelude opener),
monochrome text-on-solid throughout.

**rule mapping**

- gentle fade-in + subtle scale-up settle (Benefits Scene 2) → `rules/scale-swap-transition.md` (restrained in/settle; cross-reference the fade ease in `techniques.md`)
- single slide-up crossfade between two centered lines (Benefits Scene 3) → `rules/discrete-text-sequence.md` (one line hands off to the next; translate-up + crossfade)
- diagonal pill-wipe reveal (Social_Proof Scene 2) → `../techniques.md` (clip-path reveal masks — the wipe)
- icon stroke draw-on (Social_Proof Scene 2) → `rules/svg-path-draw.md`
- "[N]+ teams" count-up (Social_Proof Scene 3, optional) → `rules/counting-dynamic-scale.md`
- logo + tagline spring-settle-and-hold (Social_Proof Scene 3) → `rules/spring-pop-entrance.md` (single soft settle; intentionally one beat, not a chain)
- subtle breathing on the held card (the one live element during the hold) → `rules/sine-wave-loop.md`
- type-on / backspace / grey→bright append (chain cards) → `rules/discrete-text-sequence.md`
  (non-linear typing incl. backspace; drive the version append as a bulk addition)
- wordmark remainder resolves into the logo icon → `rules/scale-swap-transition.md` (same-center
  swap fired as the last character deletes)
- barely-perceptible slow scale-up across a hold → the camera-modifier drift
  (`rules/multi-phase-camera.md`, micro-drift register) applied per-card
- blur-away → snap-into-focus handoff (prelude flavor) → `rules/depth-of-field-blur.md` (single
  pull on the outgoing / incoming card)
- logo pop with overshoot + glow (prelude card 1) → `rules/spring-pop-entrance.md` +
  `rules/ambient-glow-bloom.md`
- instant hard cut at full opacity → not a rule: a timeline `tl.set` swap — deliberately NO
  transition entry.

**camera modifier**: optional — a single very slow drift/push under the hold only → `rules/multi-phase-camera.md`. Default is fully static; do not add unless the held beat would otherwise read as a freeze-frame.

**stillness note**: This is a legitimate allocated-stillness beat. The hold in Scene 3 is the deliverable, not an unanimated gap — do NOT manufacture a development phase, extra swaps, or force-animation. One restrained move + a subtle hold (optionally one breathing element or one slow drift) is the correct and complete shape. The card-chain variant does not break this: each card individually obeys the one-move + hold
contract, and the hard cut is a seam, not a move. Boundary: if the cards flip at sub-second tempo
or each beat carries its own entrance/exit energy, you have left this blueprint — that is
`kinetic-type-beats` (its CTA variant owns the high-tempo value-line stack).
