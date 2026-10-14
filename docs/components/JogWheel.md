# JogWheel

The jog wheel sets a number by dragging, scrolling or using the arrow keys, and shows it on a reflective segment display.

## When to use
Setpoints people nudge rather than type: alarm thresholds, limits, targets. Pair it with a `.sc-display--setpoint` display, since the number is one the person sets.

## What you provide
```html
<div class="sc-display sc-display--setpoint sc-raised-2"><div class="sc-display__glass">
  <div class="sc-display__top"><span>Alarm at</span><span>Armed</span></div>
  <div class="sc-display__row"><div id="thr"></div><span class="sc-display__unit">°C</span></div>
</div></div>
<div class="sc-jog sc-raised-1" data-sc-jog data-min="40" data-max="95" data-value="78" data-display="#thr" data-unit="degrees Celsius" aria-label="Alarm threshold"></div>
```
The wheel is a `role="slider"` with Home, End, PageUp and PageDown. It fires `sc-change` with `{ value }`. Or call `SoftConsole.jog(el, { min, max, value, display })`.

## Do and don't
- Do put − and + icon buttons on either side for single steps.
- Don't use it for values without a sensible range.
