# Meter

Meters are thin recessed tracks with a colored fill, used in lists of rails, resources or quotas.

## What you provide
```html
<div class="sc-rail">
  <span class="sc-led sc-led--warn"></span><span class="sc-rail__name">PSU B load</span><span class="sc-rail__value">91 %</span>
  <span class="sc-meter sc-inset-1"><i style="--p:91%;--c:var(--warn)"></i></span>
</div>
```
`--p` is the fill width, `--c` its color: `accent` by default, a signal color only past a threshold. `.sc-meter--mini` fits inside table cells.

## Do and don't
- Do switch the fill to `warn` or `crit` only when a threshold is crossed, and say so with the LED and value.
- Don't use meters for values that can exceed 100%.
