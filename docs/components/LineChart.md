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

## Do and don't
- Do pick the mode by the question: "how is this one doing against the rest?" is focus; "how do these compare?" is peers.
- Don't add a fifth series. Group the rest or split into small multiples.
- Don't use signal colors for series; they are reserved for status.
