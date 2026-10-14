# IconButton

Icon buttons are square raised controls for navigation and tool actions; the selected one presses in, lights up and gets the accent underline.

## What you provide
```html
<nav data-sc-single aria-label="Sections">
  <button type="button" class="sc-btn sc-ibtn" aria-label="Nodes" aria-pressed="true"><svg class="sc-ic"><use href="#sc-i-grid"/></svg></button>
</nav>
```
Every icon button needs an `aria-label`. Add `data-sc-single` on the group for one-of-many selection, or `data-sc-toggle` on a single button.

## Do and don't
- Do use outline icons from `SoftConsole.icon()` at 1.8 stroke.
- Don't put a text label inside. Use a regular `.sc-btn` with an icon and a label instead.
