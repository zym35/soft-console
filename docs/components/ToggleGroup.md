# ToggleGroup

A toggle group is a segmented control in which each option turns on or off on its own.

## What you provide
```html
<div class="sc-togglegroup sc-raised-1" role="group" aria-label="Days of the week">
  <button type="button" data-sc-toggle aria-pressed="true">Mon</button>
  <button type="button" data-sc-toggle aria-pressed="false">Tue</button>
</div>
```
It uses the SegmentedControl's metrics, pressed state and accent underline, and wraps to a new line when space runs out. With `data-sc-toggle` on each button, `SoftConsole.init` flips `aria-pressed` on click.

## Do and don't
- Do use it for up to about seven short options.
- Don't use it to pick one of many. Use a SegmentedControl for that.
