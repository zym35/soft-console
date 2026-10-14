# KpiTile

A KPI tile shows one headline number with its label, its change and a sparkline of recent history.

## What you provide
```html
<div class="sc-kpi sc-raised-2 sc-kpi--link">
  <div class="sc-kpi__top"><span class="sc-label">p95 latency</span><span class="sc-delta sc-delta--ok">▼ 6 ms</span></div>
  <div class="sc-kpi__value"><span data-sc-count="182">182</span><small>ms</small></div>
  <div class="sc-spark sc-inset-1" data-sc-spark="210,204,199,206,195,190,192,188,186,190,184,182"></div>
</div>
```
Add `.sc-kpi--link` when the tile opens a detail view: it lifts on hover. Delta color follows meaning, not direction (lower latency is `ok`). Use `.sc-spark--warn` when the trend is the problem.

## Do and don't
- Do use four tiles per row at most, all the same height.
- Do show the unit in `<small>` after the value.
- Don't put more than one number in a tile.
