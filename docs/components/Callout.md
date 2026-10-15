# Callout

A callout is one inline message: a save error, a notice or an import result.

## What you provide
```html
<div class="sc-callout sc-callout--crit sc-inset-1" role="alert"><span class="sc-led sc-led--crit"></span>
  <div><b>Not saved</b><p>Configuration changed on the server. Reload to see the current values.</p></div></div>
```
Tone modifiers are `--ok`, `--warn`, `--crit` and `--info`. Each colors the title and matches the LED; the body stays `text-2`. Use `role="alert"` for errors and `role="status"` for confirmations. A small button can follow the text.

## Do and don't
- Do keep titles short and say what happened.
- Don't fill the box with a signal color.
- Don't stack more than two; use an AlertList for many.
