# SegmentDisplay

Segment displays show one important number in seven-segment digits, with unlit segments faintly visible like real glass.

## Two kinds, by role
- `.sc-display--setpoint`: reflective pale glass (`lcd-glass`, `lcd-ink`) for numbers a person sets: thresholds, limits, targets.
- `.sc-display--live`: backlit dark glass (`vfd-glass`, segments in `accent-text`) for numbers the system reports.

## What you provide
```html
<div class="sc-display sc-display--live sc-raised-2"><div class="sc-display__glass">
  <div class="sc-display__top"><span>Inlet · CH 02</span><span>Live</span></div>
  <div class="sc-display__row"><div data-sc-seg="23.4" data-digits="4"></div><span class="sc-display__unit">°C</span></div>
</div></div>
```
`data-digits` is the number of digit cells; empty leading cells show as ghost 8s. Update with `SoftConsole.segment(el, '23.6', 4)`. Digits 0–9, minus, a decimal point and the letters E r o n H L P C.

## Do and don't
- Do use at most one or two per view. They are the loudest element on screen.
- Do always put the unit next to the digits.
- Don't use them for text, IDs or long numbers. Five digit cells is the practical limit.
