# Slider

A slider sets a value in a range; the track is recessed, the filled part is accent, and the knob carries the `accent-mark` ring.

## What you provide
```html
<label for="rate">Sample rate</label> <output for="rate" class="sc-range-out"></output>
<input id="rate" class="sc-range" type="range" min="50" max="1000" step="50" value="250" data-format="{v} ms">
```
`SoftConsole.init` keeps the fill (`--pct`) and the `<output>` in sync. `data-format` sets the output text.

## Do and don't
- Do always show the current value with its unit next to the label.
- Don't use a slider when the exact number matters more than the feel. Use a Field or the JogWheel.
