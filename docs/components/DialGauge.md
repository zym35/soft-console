# DialGauge

A dial gauge shows one live value against its range with a tick ring, a glowing accent arc and the number on a raised hub.

## What you provide
```html
<div data-sc-gauge="72" data-label="Cluster load" data-unit="%" data-min="0" data-max="100"></div>
```
Or `SoftConsole.gauge(el, 72, { label, unit, min, max })`. The arc sweeps in and the hub counts up on render; both stop under reduced motion. Ticks up to the value light in `accent-text`.

## Do and don't
- Do use it for bounded values where position in the range matters: load, utilization, fill level.
- Do keep the label to two words.
- Don't use it for unbounded counts (requests, errors). Use a KPI tile.
- Don't put more than three gauges in a row; compare many values with a bar chart.
