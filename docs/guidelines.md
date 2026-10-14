Soft Console is a dark neumorphic system for technical dashboards: one soft material, shaped into an instrument panel. Height carries meaning, a single accent marks values and the main action, and the hardware vocabulary (segment displays, LEDs, tick-marked dials, a jog wheel) does the talking. It is dark only.

## Principles

1. **Raised means you can press it**, or it is a panel that holds things. Controls use `raised-1`, tiles and display bezels `raised-2`, the device frame and top-level panels `raised-3`.
2. **Pressed in means on.** Selected tabs, the active nav item, toggled buttons and switched-on settings use `btn-press`, turn `accent-text`, and get the accent underline: 2px, across the item's inner width with an 8–10px inset.
3. **Recessed means data.** Values, inputs, tracks and charts sit in wells (`inset-1`, `inset-2`), never on bumps.
4. **Accent means value or the main action.** One primary button per view. Never use `accent` as decoration.
5. **Every shape has a hairline edge.** `edge-hi` on the lit side and `edge-lo` on the shaded side keep shapes readable on dim screens and give controls a 3:1 boundary. Never remove them.

## Color

Everything is cut from `surface`. Its lighter and darker relatives (`surface-up`, `surface-down`, `well`, `slot`, `rule`) and the shadow pair (`shade-hi`, `shade-lo`) are all derived from it, so never paint a raised element in a different color.

### Palettes

Three palettes ship as themes. Set one with `data-theme` on `<html>`, or call `SoftConsole.setTheme(id)` from a preferences screen:

| Theme id | Name | Character |
| --- | --- | --- |
| `graphite-teal` | Graphite · Teal | The default. Neutral cool graphite with a teal signal. |
| `carbon-cyan` | Carbon · Cyan | Darker and almost neutral. Crisp, high-tech. |
| `basalt-lime` | Basalt · Lime | Olive-black with an LCD-green signal. The most retro. |

Store the person's choice and apply it before first paint. Never mix palettes on one screen.

### Text

- `text-1` for values and primary text, `text-2` for secondary text, `text-3` for labels, captions and axis text. All three read on `surface` and `well` in every palette.
- `text-off` is for disabled controls and minor gauge ticks only. Never set content in it.
- `accent-text` for accent as text or icon on `surface` (selected segments, setpoint labels, links). `accent-ink` for text on an `accent` fill.

Contrast on `surface`, measured per palette:

| Pair | Graphite · Teal | Carbon · Cyan | Basalt · Lime |
| --- | --- | --- | --- |
| `text-1` | 11.15:1 | 12.65:1 | 11.97:1 |
| `text-2` | 6.77:1 | 7.75:1 | 7.56:1 |
| `text-3` | 4.84:1 | 5.60:1 | 5.54:1 |
| `accent-text` | 8.13:1 | 8.88:1 | 10.22:1 |
| `crit` (lowest signal) | 4.95:1 | 5.58:1 | 5.14:1 |
| `accent-ink` on `accent` | 7.40:1 | 8.24:1 | 10.07:1 |

### Accent

- `accent` fills the primary button (as a gradient from `accent-2`), the live arc of a gauge, the selected bar, slider fills, the switch-on ring and the focus ring.
- `accent-glow` is the soft light around lit accent marks: the primary button, the gauge arc, the selected bar, backlit digits. Knobs never glow.
- `accent-tint` is the faint wash inside an inset track that is on (switch track, checked box).

### Signals

`ok`, `warn`, `crit` and `info` mean status and nothing else. Every signal appears beside a word (Online, Degraded, Offline, Syncing) so a state never relies on color alone. Blink (`sc-led--blink`) only for something failing right now, one per view at most.

### Displays

- **Setpoints are reflective.** Numbers a person sets (thresholds, limits, targets) go on `lcd-glass` with `lcd-ink` segments and `lcd-ghost` unlit segments.
- **Live values are backlit.** Numbers the system reports go on `vfd-glass` with `accent-text` segments, `vfd-ghost` unlit segments and a soft `accent-glow`.

The style tells people which kind of number they are looking at, so never swap them.

### Chart color

Pick colors by the chart's job:

- **One series matters** (one node against the fleet): the focus series in `accent`, the rest in `mute-1`, `mute-2`, `mute-3`.
- **Series are peers** (compare four regions): `series-1` to `series-4`. Four hues at most; group or split into small multiples beyond that. Series colors never reuse a signal color.

## Type

Manrope sets the interface; IBM Plex Mono sets every number. Both load from Google Fonts.

- `t-display` for one screen title on overview pages. `t-title` for page and section titles. `t-heading` for panel titles.
- `t-body` for running text and descriptions, in `text-2`.
- `t-label` for uppercase labels above values, table headers and panel meta, in `text-3`. Keep labels to two or three words.
- `t-readout` for the one big number in a tile or hub, `t-kpi` for KPI tile values, `t-data` for table cells, timestamps and node names.
- Set every number in the data family with tabular figures (`.sc-mono`, or `font-variant-numeric: tabular-nums`) so columns line up.

## Shape and depth

- Corners are tight: `radius-xs` for checkboxes, `radius-sm` for segments, `radius-md` for buttons and fields, `radius-lg` for tiles and bezels, `radius-xl` for panels, `radius-pill` for tracks, chips, meters and bars.
- Depth is subtle. Use the shadow tokens as they are; never build a deeper shadow by hand.
- Convex parts (knobs, gauge hubs, slider thumbs) take a `surface-up` to `surface-down` gradient at 145°.
- Knobs carry a thin ring set just inside their edge: a faint `rule` groove when off, `accent` when on. No glow.

## Spacing and density

- Two densities ship. Comfortable is the default (`ctl-h` 44px, `pad-panel` 22px, `gap` 28px, `row-py` 12px). Compact (`data-density="compact"` or `SoftConsole.setDensity('compact')`) uses the `-compact` tokens for dense tables and ops screens.
- Use `space-1` to `space-8` for everything else: `space-2` inside chips, `space-3` between related controls, `space-5` between control groups, `space-8` between page sections.
- Lay sibling groups out with grid or flex `gap`, not margins.

## States

- **Hover:** buttons lift slightly (`btn-hover`); KPI tiles that open a detail view lift to `raised-3`.
- **Pressed and selected:** `btn-press`, `accent-text`, and the accent underline under the item.
- **Focus:** a solid 2px `accent` outline, 3px offset, on every interactive element. Never remove it.
- **Disabled:** flattened into the surface (`btn-flat`), `rule` border, `text-off` text.

## Motion

Motion is expressive but functional. Durations: `dur-press` for press travel, `dur-ui` for switches, hover and the selection marker, `dur-value` for values moving into place, `dur-enter` for panels rising in on first load. Every transition uses `ease-standard`.

- Buttons and segments travel in when pressed; the shadow animates, it never jumps.
- Values move like hardware: gauges sweep, digits count up, bars and meters grow in, charts reveal left to right.
- Panels and tiles rise in once on first load (`SoftConsole.init(root, { enter: true })`), staggered by 60ms.
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

Outline icons on a 24px grid at a 1.8 stroke, round caps and joins, colored with `currentColor`. The kit ships a small set (home, grid, chart, bell, gear, search, power, refresh, plus, minus, chevron, bolt, server): call `SoftConsole.mountIcons()` once, then use `SoftConsole.icon('bell')` or `<svg class="sc-ic"><use href="#sc-i-bell"/></svg>`. For anything else, use an outline set drawn on a 24px grid and set its stroke to 1.8. Never fill icons, and never use emoji as icons.

## Using the kit

1. Load `dist/tokens.css`, then `dist/soft-console.css`, then `dist/soft-console.js` (a plain script; it defines `window.SoftConsole` and needs no libraries).
2. Set `data-theme` on `<html>` (default `graphite-teal`) and, for dense screens, `data-density="compact"`.
3. Write the markup from each component's guidelines and call `SoftConsole.init(root)`. It mounts icons, wires selection groups, switches, toggles and sliders, and draws every `data-sc-seg`, `data-sc-gauge`, `data-sc-spark`, `data-sc-bars`, `data-sc-jog` and `data-sc-count` element. Call it again after you add markup.
4. Draw instruments from data with `SoftConsole.segment`, `.gauge`, `.spark`, `.lines`, `.bars` and `.jog`.
