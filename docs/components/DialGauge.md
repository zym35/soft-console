# DialGauge

A dial gauge shows one live value against its range with a tick ring, a glowing accent arc and the number on a raised hub.

## What you provide
```html
<div data-sc-gauge="72" data-label="Cluster load" data-unit="%" data-min="0" data-max="100"></div>
```
Or `SoftConsole.gauge(el, 72, { label, unit, min, max, decimals })`. On first render the arc sweeps up from `min` and the hub counts up with it, driven by one spring (response 0.6 s, no overshoot); under reduced motion the value appears in place. Ticks up to the value light in `accent-text`.

A gauge is live. Move it with `el.scGauge.set(value)`, or call `SoftConsole.gauge(el, value)` again on the same element:
```js
var cpu = document.getElementById('cpu');
SoftConsole.gauge(cpu, 72, { label: 'Cluster load' });
cpu.scGauge.set(35);   // arc, lit ticks and hub number move from where they are now
cpu.scGauge.value;     // 35, the target
```
Nothing is rebuilt and nothing restarts from `min`. Set it again while it is moving and it turns around smoothly, carrying its velocity. A call that changes `min`, `max`, `unit`, `label` or `decimals` redraws the dial instead.

In light mode the arc stays bright `accent` and does not glow; lit ticks use `accent-text`, which deepens to stay readable on the light face.

## Do and don't
- Do use it for bounded values where position in the range matters: load, utilization, fill level.
- Do keep the label to two words.
- Don't use it for unbounded counts (requests, errors). Use a KPI tile.
- Don't put more than three gauges in a row; compare many values with SegmentBars or a DataTable.
