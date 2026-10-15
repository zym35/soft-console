# SegmentBars

Segment bars draw a read-only bar graph as a level meter on a segment display's glass, with a seven-segment readout of the total or the column under the cursor.

## What you provide
```html
<div class="sc-display sc-display--live sc-raised-2"><div class="sc-display__glass" id="usage"></div></div>
<script>
SoftConsole.segbars(usage, [203000, 159622, 23353, 58643, 39854, 115466, 0], {
  labels: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
  names: ['Oct 9', 'Oct 10', 'Oct 11', 'Oct 12', 'Oct 13', 'Oct 14', 'Oct 15'],
  format: v => ({ text: (v / 1000).toFixed(v >= 1e5 ? 0 : 1), unit: 'k tokens' }),
  label: 'Daily tokens', totalLabel: 'Tokens · 7 days',
});
</script>
```
`format(v)` returns `{ text, unit }`. The text uses seven-segment characters (0–9, `.`, `-`), and the unit is printed beside the digits, as on every display.

Or draw it from markup. `SoftConsole.init` draws every `data-sc-segbars` glass, with the value rounded to two decimals and `data-unit` beside it:
```html
<div class="sc-display__glass" data-sc-segbars="12,18,9,22,15,30,26" data-labels="Fri,Sat,Sun,Mon,Tue,Wed,Thu"
     data-unit="GB" data-label="Daily egress" data-total-label="Egress · 7 days"></div>
```
The other options map to `data-names`, `data-max`, `data-levels`, `data-digits`, `data-max-labels` and `data-state-label`.

Options:
- `levels` (10): segments per column.
- `digits` (5): readout digit cells.
- `max`: the value of a full column. Defaults to the largest value rounded up to 1, 2, 2.5 or 5 × 10ⁿ (`SoftConsole.niceMax`).
- `maxLabels` (8): about how many x labels to show.
- `stateLabel` ("Live"): the top-right word while the readout shows the total.

How it reads:
- Past columns are lit at reduced intensity; the latest is lit at full intensity, with a glow on live glass.
- The pointer, or the arrow keys, Home, End and Escape when the graph has focus, move a cursor. The cursor column takes the full intensity, and the readout shows its name, value and "Latest" or "Day".
- Columns cap at 40px and spread evenly, so wide panels keep the meter look.
- Columns are not buttons. The graph is one focusable `role="img"` whose label lists every value.
- Segments light bottom-up in steps on first draw, and appear in place under reduced motion.
- When only every nth column is labelled, labels may overflow into unlabelled neighbours, and the first and last are pinned to the graph edges.

## Do and don't
- Do use the live (backlit) glass for values the system reports, and the setpoint (reflective) glass only for a series a person sets, following the display rule.
- Do keep it to one series. Use a LineChart to compare series.
- Do use it for read-only series of any length. Use a BarChart when people pick a bar.
- Don't put more than one or two displays in a view. Segment displays are the loudest element on screen.
- Don't rely on segment height for exact values. The readout carries the number.
