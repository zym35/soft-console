# TextArea

A text area is a multi-line recessed field for documents and JSON.

## What you provide
```html
<div class="sc-textarea sc-inset-1">
  <textarea aria-label="AGENTS.md"></textarea>
  <div class="sc-textarea__foot">1,284 / 24,576 bytes</div>
</div>
```
Text is set in the data font at 13px and resizes vertically only. The optional footer holds counts and limits in mono `text-3`.

## Do and don't
- Do show a size limit in the footer when one exists.
- Don't use it for single-line values. Use a Field.
