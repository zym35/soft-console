# SideNav

A side nav is a labeled navigation rail; the current page presses in like a selected segment.

## What you provide
```html
<nav class="sc-sidenav" aria-label="Main navigation">
  <a class="sc-nav-item" href="#home" aria-current="page"><svg class="sc-ic"><use href="#sc-i-grid"/></svg><span>Home</span></a>
  <div class="sc-nav-group">
    <a class="sc-nav-item" href="#agents/knowledge"><svg class="sc-ic"><use href="#sc-i-server"/></svg><span>Knowledge agent</span></a>
  </div>
  <a class="sc-nav-item" href="#settings"><svg class="sc-ic"><use href="#sc-i-gear"/></svg><span>Settings</span></a>
</nav>
```
Mark the current item with `aria-current="page"`. It takes `btn-press`, `accent-text` and the accent underline. Nested items go in `.sc-nav-group`, indented on a `rule` guide line at a smaller height.

## Do and don't
- Do keep to one level of nesting.
- Don't raise items at rest. The rail stays flat on `surface` until an item is current.
