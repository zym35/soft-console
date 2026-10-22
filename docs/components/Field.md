# Field

Fields are recessed inputs for text, numbers with units, and selects.

## What you provide
```html
<div class="sc-field sc-inset-1"><svg class="sc-ic"><use href="#sc-i-search"/></svg><input type="search" placeholder="Search nodes" aria-label="Search nodes"></div>
<div class="sc-field sc-inset-1"><input class="sc-mono" inputmode="decimal" value="78.0" aria-label="Temperature limit"><span class="sc-field__unit">°C</span></div>
```
Every input needs a visible label or an `aria-label`. Numbers go in `.sc-mono` with the unit as `.sc-field__unit`.

## Selects
Put a native `<select>` in a field. `SoftConsole.init` replaces its option list with a Soft Console listbox: a raised panel where the selected option presses in with a check mark, and any option presses in on pointer down.
```html
<div class="sc-field sc-inset-1"><select aria-label="Region"><option>eu-central · Frankfurt</option><option>us-east · Virginia</option></select></div>
```
The native select stays in the page, so forms submit it and it fires `change` as usual. The list opens with a click, Enter, Space or the arrow keys. Arrows, Home and End move through it, typing jumps to a matching option, Enter picks, and Escape closes. The list grows out of the field's edge, below it or, near the bottom of the screen, above it, and closing reverses the pop back into the field. Close it halfway through opening, or open it halfway through closing, and it turns around from where it is. Under reduced motion it fades over `dur-fade`. Disabled options and `<optgroup>` labels carry over. A list taller than 17.5rem scrolls, and its top or bottom fades out where more options are hidden. If you change the options later, call `SoftConsole.select(selectEl).refresh()`.

## Do and don't
- Do show units inside the field, after the value.
- Do use placeholders only as examples, never as the label.
- Don't put a field on a raised surface without its inset. Input always lives in a recess.
