# BarChart

The bar chart compares a handful of values as recessed pill tracks; the selected bar fills with accent and shows its value in a raised bubble.

## What you provide
```html
<div data-sc-bars="42,58,66,88,71,49,37" data-labels="M,T,W,T,F,S,S"
     data-names="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday" data-unit="k requests per minute" data-max="100"></div>
```
Or `SoftConsole.bars(el, values, { labels, names, unit, max, selected })`. Bars are buttons: click or Tab to select one. The highest bar starts selected.

The bar chart is for choosing a bar: its pressed state and value bubble read as a control. For a read-only series, such as daily totals over 7 or 30 days, use SegmentBars.

## Do and don't
- Do keep it to 12 bars or fewer, with short labels.
- Do state the unit in the panel head.
- Don't use it for time series with many points; use a LineChart or Sparkline.
- Don't use it to display a series nobody selects from. Use SegmentBars.
