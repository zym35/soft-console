# LineChart

Line charts plot up to four series in a recessed well, colored by the chart's job: accent-led when one series matters, categorical when series are peers.

## Two modes
- `mode: 'focus'`: the focus series in `accent`, the rest in `mute-1` to `mute-3`. Clicking a legend entry moves the focus.
- `mode: 'peers'`: `series-1` to `series-4`, none of them a status color. Clicking a legend entry thickens that line; clicking it again clears.

## What you provide
```html
<div class="sc-chart sc-inset-2" id="cpu"></div>
<div class="sc-legend" id="cpu-legend"></div>
<script>
SoftConsole.lines(cpu, cpuLegend, [{ name: 'edge-01', data: [/* … */] }], { mode: 'focus', focus: 0, max: 100, suffix: '%', label: 'CPU load, last 24 hours' });
</script>
```
Legend entries press like the rest: the label brightens and the swatch thickens on pointer down, as the focused line does. The line reveals left to right once, on first draw. Clicking a legend entry restyles the chart and legend in place without replaying it, and keyboard focus stays on the entry.

To update a chart, call `SoftConsole.lines` again on the same element with the new series:
```js
SoftConsole.lines(cpu, cpuLegend, nextSeries);   // same number of series and points
```
Every point springs from where it is on screen to its new value (response 0.6 s, no overshoot), so a second update mid-move carries on smoothly. The reveal does not replay, the legend values update in place, and the focus the viewer chose stays unless you pass `focus`. Options you leave out keep their last value. A different number of series or points redraws the chart, reveal included. Under reduced motion the lines change in place. The chart's live state is `el.scLines`; one click handler per legend reads it, so calling `lines` again never leaves a stale handler behind.

Y labels show one decimal and legend values none, followed by `suffix`. For other units, pass `format(v)`, which returns the whole label: `format: v => '$' + v.toFixed(2)`.

## Do and don't
- Do pick the mode by the question: "how is this one doing against the rest?" is focus; "how do these compare?" is peers.
- Don't add a fifth series. Group the rest or split into small multiples.
- Don't use signal colors for series; they are reserved for status.
