# Panel

A panel is the raised container that holds one instrument, chart or list, with a title row on top.

## What you provide
```html
<section class="sc-panel sc-raised-2">
  <div class="sc-panel__head"><h3 class="sc-panel__title">Power rails</h3><span class="sc-label">Live</span></div>
  …content…
</section>
```
Use `.sc-raised-3` for the outermost frame of a screen and `.sc-raised-2` for panels inside it. Padding and gap follow density (`pad-panel`).

## Do and don't
- Do give every panel a title in `.sc-panel__title` and put meta (units, scope, a status chip) on the right of the head.
- Don't nest panels more than one level inside the frame.
- Don't put a panel inside a well. Raised things sit on the surface, not in holes.
