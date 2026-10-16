Soft Console is a neumorphic system for technical dashboards: one soft material, shaped into an instrument panel. Height carries meaning, a single accent marks values and the main action, and the hardware vocabulary (segment displays, LEDs, tick-marked dials, a jog wheel) does the talking. It is dark by default, with a light mode cut from the same material.

## Principles

1. **Raised means you can press it**, or it is a panel that holds things. Controls use `raised-1`, tiles and display bezels `raised-2`, the device frame and top-level panels `raised-3`.
2. **Pressed in means on.** Selected tabs, the active nav item, toggled buttons and switched-on settings use `btn-press`, turn `accent-text`, and get the accent underline: 2px, across the item's inner width with an 8–10px inset.
3. **Recessed means data.** Values, inputs, tracks and charts sit in wells (`inset-1`, `inset-2`), never on bumps.
4. **Accent means value or the main action.** One primary button per view. Never use `accent` as decoration.
5. **Every shape has a hairline edge.** `edge-hi` on the lit side and `edge-lo` on the shaded side keep shapes readable on dim screens and give controls a 3:1 boundary. Never remove them.

## Color

Everything is cut from `surface`. Its lighter and darker relatives (`surface-up`, `surface-down`, `well`, `slot`, `rule`) and the shadow pair (`shade-hi`, `shade-lo`) are all derived from it, so never paint a raised element in a different color.

### Palettes

Two palettes ship as themes. Set one with `data-theme` on `<html>`, or call `SoftConsole.setTheme(id)` from a preferences screen:

| Theme id | Name | Character |
| --- | --- | --- |
| `graphite-teal` | Graphite · Teal | The default. Neutral cool graphite with a teal signal. |
| `carbon-cyan` | Carbon · Cyan | Darker and almost neutral. Crisp, high-tech. |

Store the person's choice and apply it before first paint. Never mix palettes on one screen.

### Modes

Each palette comes in dark and light. Dark is the default. Set the mode with `data-mode` on `<html>`, or call `SoftConsole.setMode(mode)`:

| Mode | What it does |
| --- | --- |
| `dark` | The default. Also what you get with no `data-mode` at all. |
| `light` | The same material on a cool light grey, tinted by the palette's hue. |
| `auto` | Follows the operating system (`prefers-color-scheme`) in CSS alone, so it works before any script runs. |

Store the person's choice and apply it before first paint, like the palette. `setMode` crossfades between modes; under `auto` a change in the OS applies at once. `data-mode` goes on `<html>` only, so a screen never mixes modes.

Light mode keeps the grammar and changes the light:

- The material is light, so shadows grow a little (0.6x depth) and the lit side turns almost white.
- `accent` stays bright for fills, with dark `accent-ink` on it. Marks that must reach 3:1 against the material (focus rings, the switch-on ring, the radio dot, the slider thumb ring) use `accent-mark`, which is `accent` in dark and a deeper accent in light.
- Nothing on the material glows (`glow` is 0, `accent-glow` is transparent). LEDs and live display glass still do: they are lit.
- Signal colors deepen so they pass as text; LEDs use the vivid `ok-led`, `warn-led`, `crit-led` and `info-led`. `warn` leans orange so it never reads brown.
- Live display glass stays dark, with bright `vfd-ink`. Setpoint glass is the same in both modes.

### Text

- `text-1` for values and primary text, `text-2` for secondary text, `text-3` for labels, captions and axis text. All three read on `surface` and `well` in every palette and mode.
- `text-off` is for disabled controls and minor gauge ticks only. Never set content in it.
- `accent-text` for accent as text or icon on `surface` (selected segments, setpoint labels, links). `accent-ink` for text on an `accent` fill.

Contrast measured per palette and mode, on `surface` in dark and on `well` in light (the darker of the two text backgrounds in each mode):

| Pair | Graphite dark | Carbon dark | Graphite light | Carbon light |
| --- | --- | --- | --- | --- |
| `text-1` | 11.15:1 | 12.65:1 | 10.63:1 | 10.62:1 |
| `text-2` | 6.77:1 | 7.75:1 | 6.52:1 | 6.60:1 |
| `text-3` | 4.84:1 | 5.60:1 | 4.62:1 | 4.60:1 |
| `accent-text` | 8.13:1 | 8.88:1 | 4.64:1 | 4.67:1 |
| Lowest signal | 4.95:1 (`crit`) | 5.58:1 (`crit`) | 4.63:1 (`crit`) | 4.61:1 (`warn`) |
| `accent-mark` (3:1 needed) | 6.30:1 | 7.68:1 | 3.03:1 | 3.02:1 |
| `accent-ink` on `accent` | 7.40:1 | 8.24:1 | 5.12:1 | 5.84:1 |

### Accent

- `accent` fills the primary button (as a gradient from `accent-2`), the live arc of a gauge and slider fills.
- `accent-mark` draws the thin marks that must stay visible: the focus ring, the switch-on ring, the radio dot and the slider thumb ring.
- `accent-glow` is the soft light around the primary button in dark mode. Lit digits and bars on live glass use `vfd-glow`. Knobs never glow.
- Only lit things glow. Glows on the material scale with `glow`, which is 0 in light mode; LEDs and live glass keep theirs.
- `accent-tint` is the faint wash inside an inset track that is on (switch track, checked box).

### Signals

`ok`, `warn`, `crit` and `info` mean status and nothing else. Use them for chip text, deltas and meter fills; LEDs use `ok-led`, `warn-led`, `crit-led` and `info-led`, which stay vivid in light mode. Every signal appears beside a word (Online, Degraded, Offline, Syncing) so a state never relies on color alone. Blink (`sc-led--blink`) only for something failing right now, one per view at most.

One exception: the label of a destructive or high-risk action may be set in `crit` (`.sc-btn--danger`). Never as a fill, and the action still confirms in a dialog.

### Displays

- **Setpoints are reflective.** Numbers a person sets (thresholds, limits, targets) go on `lcd-glass` with `lcd-ink` segments and `lcd-ghost` unlit segments.
- **Live values are backlit.** Numbers the system reports go on `vfd-glass` with `vfd-ink` segments, `vfd-ghost` unlit segments and a soft `vfd-glow`. The glass stays dark in light mode too, like a display window set into a light casing.

The style tells people which kind of number they are looking at, so never swap them. SegmentBars follow the same rule: a series the system reports goes on live glass, and a series a person sets goes on setpoint glass.

### Chart color

Pick colors by the chart's job:

- **One series matters** (one node against the fleet): the focus series in `accent`, the rest in `mute-1`, `mute-2`, `mute-3`. `mute-1` sits nearest the focus in both modes (lightest in dark, darkest in light).
- **Series are peers** (compare four regions): `series-1` to `series-4`. Four hues at most; group or split into small multiples beyond that. Series colors never reuse a signal color.

## Type

Manrope sets the interface; IBM Plex Mono sets every number. Both load from Google Fonts.

- `t-display` for one screen title on overview pages. `t-title` for page and section titles. `t-heading` for panel titles.
- `t-body` for running text and descriptions, in `text-2`.
- `t-label` for uppercase labels above values, table headers and panel meta, in `text-3`. Keep labels to two or three words.
- `t-readout` for the one big number in a tile or hub, `t-kpi` for KPI tile values, `t-data` for table cells, timestamps and node names.
- Set every number in the data family with tabular figures (`.sc-mono`, or `font-variant-numeric: tabular-nums`) so columns line up.

## Shape and depth

- Corners are tight: `radius-xs` for checkboxes, `radius-sm` for segments, `radius-md` for buttons and fields, `radius-lg` for tiles and bezels, `radius-xl` for panels, `radius-pill` for tracks, chips and meters.
- Depth is subtle. Use the shadow tokens as they are; never build a deeper shadow by hand.
- Overlays float rather than rise out of the material. Dialogs, tooltips, toasts and the select list take `float`, the dark half of `raised-3` alone, so nothing lights up around them.
- Convex parts (knobs, gauge hubs, slider thumbs) take a `surface-up` to `surface-down` gradient at 145°.
- Knobs carry a thin ring set just inside their edge: a faint `rule` groove when off, `accent-mark` when on. No glow.

## Spacing and density

- Two densities ship. Comfortable is the default (`ctl-h` 44px, `pad-panel` 22px, `gap` 28px, `row-py` 12px). Compact (`data-density="compact"` or `SoftConsole.setDensity('compact')`) uses the `-compact` tokens for dense tables and ops screens.
- Use `space-1` to `space-8` for everything else: `space-2` inside chips, `space-3` between related controls, `space-5` between control groups, `space-8` between page sections.
- Lay sibling groups out with grid or flex `gap`, not margins.

## States

- **Hover:** buttons lift slightly (`btn-hover`); KPI tiles that open a detail view lift to `raised-3`.
- **Pressed and selected:** `btn-press`, `accent-text`, and the accent underline under the item.
- **Focus:** a solid 2px `accent-mark` outline, 3px offset, on every interactive element. Never remove it.
- **Disabled:** flattened into the surface (`btn-flat`), `rule` border, `text-off` text.
- **Modal:** an open dialog keeps focus inside it. Escape and a click on the scrim close it, and focus returns to the control that opened it. `SoftConsole.dialog` does this for you.

## Motion

Motion is expressive but functional. Durations: `dur-press` for press travel, `dur-ui` for switches, hover and the selection marker, `dur-value` for values moving into place, `dur-enter` for panels rising in on first load. Every transition uses `ease-standard`.

- Buttons and segments travel in when pressed; the shadow animates, it never jumps.
- Values move like hardware: gauges sweep, digits count up, meters grow in, segment bars light up, charts reveal left to right.
- Switching modes with `SoftConsole.setMode` crossfades the page over `dur-ui`.
- Panels and tiles rise in once on first load (`SoftConsole.init(root, { enter: true })`), staggered by 60ms.
- Overlays (tooltips, toasts, dialogs) are centered with the CSS `translate` property and animate only `transform`. Mixing both in `transform` makes an overlay slide sideways as it rises.
- Under `prefers-reduced-motion`, all of it is switched off and values appear in place.

## Content

- Write from the operator's side. Name things by what people see: nodes, alerts, thresholds.
- Sentence case for titles and buttons; uppercase only through `t-label`.
- Buttons are verbs that say what happens: Deploy, Restart, Pause.
- Alerts say what is wrong and where: "edge-12 disk at 91%", "Error rate above 0.4%".
- Always show units, next to the value: 182 ms, 23.4 °C, 91 %. Missing values are an em dash.
- Ages use the shortest unit: 4m, 18m, 1h. Uptime reads 41d 06h.
- No emoji. Arrows for deltas are text glyphs: ▲ 3.2%, ▼ 6 ms.

## Iconography

Outline icons on a 24px grid at a 1.8 stroke, round caps and joins, colored with `currentColor`. The kit ships a small set (home, grid, chart, bell, gear, search, power, refresh, plus, minus, chevron, chevron-right, info, close, bolt, server, sun, moon, monitor, play, pause, volume, muted, expand): call `SoftConsole.mountIcons()` once, then use `SoftConsole.icon('bell')` or `<svg class="sc-ic"><use href="#sc-i-bell"/></svg>`. For anything else, use an outline set drawn on a 24px grid and set its stroke to 1.8. Never fill icons, and never use emoji as icons. A mode switch uses moon, sun and monitor (match system) as icon-only segments, each with an `aria-label`.

## Using the kit

1. Load `dist/tokens.css`, then `dist/soft-console.css`, then `dist/soft-console.js` (a plain script; it defines `window.SoftConsole` and needs no libraries).
2. Set `data-theme` on `<html>` (default `graphite-teal`), `data-mode` (default `dark`) and, for dense screens, `data-density="compact"`.
3. Write the markup from each component's guidelines and call `SoftConsole.init(root)`. It mounts icons, wires selection groups, switches, toggles and sliders, upgrades selects in fields into Soft Console listboxes, draws every `data-sc-seg`, `data-sc-segbars`, `data-sc-gauge`, `data-sc-spark`, `data-sc-jog`, `data-sc-wave` and `data-sc-count` element, wires `data-sc-player` rows to their audio or video, and wires `data-sc-dialog` buttons to open their dialog or lightbox. Call it again after you add markup.
4. Draw instruments from data with `SoftConsole.segment`, `.segbars`, `.gauge`, `.spark`, `.lines` and `.jog`. Wire a player row to its media with `SoftConsole.player(row, media)` and draw a waveform with `.wave`. Open and close dialogs and lightboxes with `SoftConsole.dialog(scrim)`.
