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
The wheel is a `role="slider"` with Home, End, PageUp and PageDown. It fires `sc-change` with `{ value }`, once per step. Or call `SoftConsole.jog(el, { min, max, value, display })`.

How it moves:
- Gripped, the wheel presses in (`btn-press`) and the ridges follow the pointer 1:1 from where it was grabbed.
- Let go with speed and it coasts: the release speed over the last 100ms is projected to a resting step (`project(v) = v/1000 · 0.99 / (1 − 0.99)`, so 1000 px/s travels about 11 steps), and the ridges carry on from the release speed on the spring, with the value counting through each step on the way. Under 200 px/s, or after a pause before letting go, it is not a flick and the wheel just settles on the nearest step. Grab it again and it stops where it is.
- Past min or max the ridges stretch against a rubber band while the value stays at the limit (`aria-valuenow` never leaves the range), and spring back on release. A flick into a limit bounces off it the same way.
- A mouse wheel or trackpad adds up its scrolling and steps once per 40px: a 100px notch is two steps, and a slow trackpad swipe is one step per 40px of travel. Keys, the wheel and `set(v)` change the value at once and the ridges follow on the spring.
- Under reduced motion nothing coasts or stretches: the ridges follow the pointer, stop at the limits, and settle on the step in place.

## Do and don't
- Do put − and + icon buttons on either side for single steps.
- Don't use it for values without a sensible range.
