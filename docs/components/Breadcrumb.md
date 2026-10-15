# Breadcrumb

A breadcrumb shows the trail to a nested page.

## What you provide
```html
<nav class="sc-crumbs" aria-label="Breadcrumb">
  <a href="#home">Home</a><svg class="sc-ic" aria-hidden="true"><use href="#sc-i-chevron-right"/></svg><span aria-current="page">Knowledge agent</span>
</nav>
```
Links are `text-3`, the separator is `text-off`, and the current page is `text-1`.

## Do and don't
- Do keep the trail short. Two or three levels is typical.
- Don't make the current page a link.
