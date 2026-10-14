# Surface

Surface classes give any element its height in the one Soft Console material: raised, pressed or recessed.

## When to use
- `.sc-raised-1` for controls (buttons, knobs, the jog wheel), `.sc-raised-2` for tiles and display bezels, `.sc-raised-3` for the device frame and top-level panels.
- `.sc-pressed` for anything that is on, selected or active.
- `.sc-inset-1` for fields, tracks, chips and sparkline wells; `.sc-inset-2` for chart plots and gauge faces.
- Leave the page and table rows flat on `surface`.

## What you provide
Any block element. The class sets `background: var(--surface)`, the hairline edge pair (`edge-hi`, `edge-lo`) and the shadow token. Add your own radius from the `radius-*` scale.

## Do and don't
- Do keep data in recesses: values, inputs and charts never sit on a raised bump.
- Do keep the hairline edges. They are what makes shapes readable on dim screens.
- Don't stack more than three heights in one view. Depth is meaning, not decoration.
- Don't change the surface color of a raised element. Everything is cut from `surface`.
