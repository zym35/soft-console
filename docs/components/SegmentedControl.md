# SegmentedControl

A segmented control picks one value from two to five short options, such as a time range or a view.

## What you provide
```html
<div class="sc-segmented sc-raised-1" data-sc-single role="group" aria-label="Time range">
  <button type="button" aria-pressed="false">1h</button>
  <button type="button" aria-pressed="true">24h</button>
  <button type="button" aria-pressed="false">7d</button>
</div>
```
A segment presses in on pointer down. The selected segment stays pressed, turns `accent-text` and gets the accent underline. The group fires `sc-change` with the chosen label.

## Do and don't
- Do keep labels to one short word or a unit (1h, 24h, Nodes).
- Don't use it for more than five options; use a select field.
- Don't use it to trigger actions. It only selects.
