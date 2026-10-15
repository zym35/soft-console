# Disclosure

A disclosure is a row that opens to reveal more detail.

## What you provide
```html
<details class="sc-disclosure"><summary><svg class="sc-ic"><use href="#sc-i-chevron"/></svg>17 evidence snapshots</summary>
  <div class="sc-disclosure__body">…</div></details>
```
The chevron points right when closed and turns down in `accent-text` when open. Rows are separated by `rule` lines, and the body is indented under the summary text.

## Do and don't
- Do use it for secondary detail people open occasionally.
- Don't hide the primary action of a view inside one.
