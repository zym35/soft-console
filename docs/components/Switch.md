# Switch

A switch turns a setting on or off immediately; the knob carries a thin ring just inside its edge that turns accent when on.

## What you provide
```html
<div class="sc-switch-row">
  <label for="autoscale">Auto-scale</label>
  <button type="button" id="autoscale" class="sc-switch sc-inset-1" role="switch" aria-checked="true"></button>
</div>
```
`SoftConsole.init` flips `aria-checked` on click. Listen for `click` to save the setting.

## Do and don't
- Do use it for settings that apply at once. Use a checkbox when the change waits for a Save button.
- Do label the setting, not the state: "Auto-scale", not "Turn on auto-scale".
- Don't add glow to the knob. The ring is the only on-state mark besides the faint `accent-tint` in the track.
