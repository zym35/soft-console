# SaveBar

A save bar closes every editable unit (a settings form, a file, a draft) with the same unsaved state, Discard and primary Save.

## What you provide
```html
<div class="sc-savebar">
  <span class="sc-savebar__status"><span class="sc-led sc-led--warn"></span>Unsaved changes</span>
  <button type="button" class="sc-btn sc-btn--ghost"><span>Discard</span></button>
  <button type="submit" class="sc-btn sc-btn--primary"><span>Save changes</span></button>
</div>
```
The status shows only while there are unsaved changes, and empties when clean. Both buttons stay disabled until something changed, so a page with several save bars shows only the dirty one in accent. Name the button by what it saves when there is more than one unit on a page ("Save AGENTS.md").

## Do and don't
- Do place it directly under what it saves, at the same width.
- Do use it for every editable unit, so saving always looks the same.
- Don't use it for settings that apply immediately. Use a Switch or SegmentedControl.
