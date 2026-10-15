# ListRow

List rows are flat, rule-separated rows that each open something: a service, a job, a record.

## What you provide
```html
<ul class="sc-list">
  <li><button type="button" class="sc-list__row">
    <span class="sc-list__lead sc-raised-1"><svg class="sc-ic"><use href="#sc-i-server"/></svg></span>
    <span class="sc-list__body"><b>Knowledge agent</b><span>Knowledge and evidence</span></span>
    <span class="sc-chip sc-inset-1"><span class="sc-led sc-led--ok"></span>Running</span>
    <svg class="sc-ic" aria-hidden="true"><use href="#sc-i-chevron-right"/></svg>
  </button></li>
</ul>
```
Each whole row is one button. On hover it darkens to `surface-down`, like a table row. Without a lead tile, add `.sc-list__row--plain`. When the list is empty, show a `.sc-list__empty` line instead.

## Do and don't
- Do use it when every row opens a detail view. Use a DataTable to compare columns, and an AlertList for open alerts.
- Don't put other buttons inside a row.
