# Check

Checkboxes and radios are small recessed wells; checked ones show an accent check or an accent ring.

## What you provide
```html
<label class="sc-check-row" for="degraded"><input id="degraded" class="sc-check sc-inset-1" type="checkbox" checked> Include degraded nodes</label>
<label class="sc-check-row" for="avg"><input id="avg" class="sc-check sc-inset-1" type="radio" name="agg" checked> Average</label>
```
Native inputs, so forms and keyboard work as usual.

## Do and don't
- Do use checkboxes for independent options and radios for one-of-many with three or more options.
- Don't use a checkbox for a setting that applies immediately; use a Switch.
