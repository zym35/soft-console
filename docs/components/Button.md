# Button

Buttons are raised controls that press into the surface when clicked and stay pressed while toggled on.

## Variants
- `.sc-btn--primary`: the one main action of a view (Deploy, Save). Accent fill with `accent-ink` text. One per view.
- `.sc-btn`: every other action.
- `.sc-btn[data-sc-toggle][aria-pressed]`: an on/off action (Pause). Pressed, `accent-text`, and the accent underline when on.
- `.sc-btn--ghost`: cancel and low-priority actions.
- `disabled`: flattens into the surface in `text-off`.
- `.sc-btn--sm`: inside dense rows and cards.

## What you provide
```html
<button type="button" class="sc-btn sc-btn--primary"><svg class="sc-ic"><use href="#sc-i-bolt"/></svg><span>Deploy</span></button>
```
Wrap the label in a `<span>` so it can travel with the press. Height follows density (`ctl-h`).

## Do and don't
- Do label with a verb that says what happens: Deploy, Restart, Pause.
- Don't use the primary fill for a second action in the same view.
- Don't color a button with a signal color. Destructive actions confirm in a dialog instead.
