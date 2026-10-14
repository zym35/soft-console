# DataTable

Data tables list records on the flat surface with hairline rules, mono numbers aligned right and status as LED plus word.

## What you provide
```html
<div class="sc-table-wrap"><table class="sc-table">
  <thead><tr><th>Node</th><th>Status</th><th class="num">CPU</th></tr></thead>
  <tbody><tr><td class="key">edge-12</td><td><span class="sc-status"><span class="sc-led sc-led--warn"></span>Degraded</span></td>
    <td class="num"><span class="sc-meter sc-meter--mini sc-inset-1"><i style="--p:88%;--c:var(--warn)"></i></span>88%</td></tr></tbody>
</table></div>
```
Identifiers use `.key`, numbers `.num`. Row padding follows density (`row-py`). The wrapper scrolls sideways on narrow screens.

## Do and don't
- Do right-align numbers and always include units, in the cell or the header.
- Do show missing values as an em dash.
- Don't raise rows or cells. Tables stay flat; the panel around them is raised.
