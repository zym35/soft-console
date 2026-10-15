# Button

Buttons are raised controls that press into the surface when clicked and stay pressed while toggled on.

## Variants
- `.sc-btn--primary`: the one main action of a view (Deploy, Save). Accent fill with `accent-ink` text. One per view.
- `.sc-btn`: every other action.
- `.sc-btn--danger`: destructive or high-risk actions (Stop service, Cancel order, Enable live trading). The label is set in `crit` and the button glows faintly in crit on hover; the underline is crit when toggled. It never takes a fill, so the accent primary stays the loudest control.
- `.sc-btn[data-sc-toggle][aria-pressed]`: an on/off action (Pause). Pressed, `accent-text`, and the accent underline when on.
- `.sc-btn--ghost`: cancel and low-priority actions.
- `disabled`: flattens into the surface in `text-off`. A disabled primary or danger button loses its fill and glow too.
- `.sc-btn--sm`: inside dense rows and cards.

## What you provide
```html
<button type="button" class="sc-btn sc-btn--primary"><svg class="sc-ic"><use href="#sc-i-bolt"/></svg><span>Deploy</span></button>
<button type="button" class="sc-btn sc-btn--danger"><span>Stop service…</span></button>
```
Wrap the label in a `<span>` so it can travel with the press. Height follows density (`ctl-h`).

## Do and don't
- Do label with a verb that says what happens: Deploy, Restart, Pause.
- Do confirm every danger action in a Dialog before it runs.
- Don't use the primary fill for a second action in the same view.
- Don't color a button with a signal color, with one exception: `crit` on the label of a destructive or high-risk action (`.sc-btn--danger`). Never as a fill.
- Don't use the danger variant for safety actions such as Pause, which reduce risk.
