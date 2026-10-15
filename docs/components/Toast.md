# Toast

A toast is a short confirmation pill at the bottom center of the screen.

## What you provide
```html
<div class="sc-toast sc-raised-2" role="status"><span class="sc-led sc-led--ok"></span>Applied to server</div>
```
It rises in on insert. Remove it after about 2.6 s. It is centered with the `translate` property, so the rise keyframe never shifts it sideways.

## Do and don't
- Do show one at a time.
- Do say what happened in a few words: "Applied to server".
- Don't use it for errors that need action. Use a Callout.
