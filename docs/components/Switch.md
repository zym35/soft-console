# Switch

A switch turns a setting on or off immediately; the knob carries a thin ring just inside its edge that turns `accent-mark` when on (the accent in dark, a deeper accent in light so it reaches 3:1).

## What you provide
```html
<div class="sc-switch-row">
  <label for="autoscale">Auto-scale</label>
  <button type="button" id="autoscale" class="sc-switch sc-inset-1" role="switch" aria-checked="true"></button>
</div>
```
`SoftConsole.init` flips `aria-checked` on click. Listen for `click` to save the setting.

Pressing the knob stretches it toward the side it will travel (from 22 to 28px, anchored on its current side) and letting go springs it across. The knob can also be dragged: past 6px of sideways movement it follows the pointer 1:1 along the track, and on release it goes to the side it is nearer, or the side it was thrown toward if it was moving faster than 200 px/s. A tap still toggles. A drag that changes the setting ends in one `click`, so a listener saves once; a drag that ends where it began fires none. Under reduced motion the knob does not stretch, and the drag still follows the pointer.

## Do and don't
- Do use it for settings that apply at once. Use a checkbox when the change waits for a Save button.
- Do label the setting, not the state: "Auto-scale", not "Turn on auto-scale".
- Don't add glow to the knob. The ring is the only on-state mark besides the faint `accent-tint` in the track.
