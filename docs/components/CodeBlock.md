# CodeBlock

A code block is a recessed mono block for JSON and logs. A quote marks an exact source quotation.

## What you provide
```html
<pre class="sc-code sc-inset-1">{ "equity": "500" }</pre>
<blockquote class="sc-quote">Exact source quotation.</blockquote>
<p>Set the limit in <code>config.json</code>.</p>
```
Code blocks scroll after 26.25rem (420px at the default text size) and wrap long lines. The top or bottom edge fades out over 1.5rem when more lines are scrolled out of sight there, and the border stays whole. A quote has a 2px `fill-muted` rule on its left. Inline `<code>` inside a `.sc-root` is set in the data font in `text-2`; code elsewhere on the page keeps its own style.

## Do and don't
- Do keep logs and payloads in a code block, not in body text.
- Don't give a quote an accent rule. Accent marks values and the main action only.
