# Field

Fields are recessed inputs for text, numbers with units, and selects.

## What you provide
```html
<div class="sc-field sc-inset-1"><svg class="sc-ic"><use href="#sc-i-search"/></svg><input type="search" placeholder="Search nodes" aria-label="Search nodes"></div>
<div class="sc-field sc-inset-1"><input class="sc-mono" inputmode="decimal" value="78.0" aria-label="Temperature limit"><span class="sc-field__unit">°C</span></div>
```
Every input needs a visible label or an `aria-label`. Numbers go in `.sc-mono` with the unit as `.sc-field__unit`.

## Do and don't
- Do show units inside the field, after the value.
- Do use placeholders only as examples, never as the label.
- Don't put a field on a raised surface without its inset. Input always lives in a recess.
