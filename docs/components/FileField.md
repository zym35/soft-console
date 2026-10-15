# FileField

A file field is a file picker drawn as a recessed well, with a small raised Choose file button.

## What you provide
```html
<label class="sc-file sc-inset-1"><span class="sc-file__name">No file chosen</span>
  <input type="file" accept=".zip"><span class="sc-btn sc-btn--sm" aria-hidden="true"><span>Choose file</span></span></label>
```
The native input stays in the page and focusable but is invisible, and the focus ring moves to the well. Update `.sc-file__name` after a file is chosen.

## Do and don't
- Do state accepted types and size limits in a hint.
