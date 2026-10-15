# Tooltip

A tooltip shows help text on a small raised bubble when a ghost icon button is hovered or focused.

## What you provide
```html
<span class="sc-tip">
  <button type="button" class="sc-btn sc-ibtn sc-btn--sm sc-btn--ghost" aria-label="Ledger estimates in UTC dates"><svg class="sc-ic"><use href="#sc-i-info"/></svg></button>
  <span class="sc-tip__bubble" role="tooltip">Ledger estimates in UTC dates</span>
</span>
```
The bubble is centered with the `translate` property and rises with `transform`. Overriding one never shifts the other. `.sc-tip--end` anchors the bubble to the button's right edge, for use near a panel's right border. It opens on hover and focus with CSS alone.

The bubble casts `float`, the dark half of a raised shadow, like every overlay.

## Do and don't
- Do repeat the bubble text in the button's `aria-label`.
- Do keep the text to a sentence or two.
- Don't put interactive content inside the bubble.
