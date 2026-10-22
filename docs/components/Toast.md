# Toast

A toast is a short confirmation pill at the bottom center of the screen. Call `SoftConsole.toast` to show one, or write the markup yourself for a static toast.

## What you provide
```js
SoftConsole.toast('Applied to server');
SoftConsole.toast('Node archived', { action: { label: 'Undo', onAction: restoreNode } });
```
`toast(message, opts)` returns `{ dismiss() }`. Options:

| Option | Default | What it does |
| --- | --- | --- |
| `action` | none | `{ label, onAction }`: one ghost button inside the toast. A click runs `onAction`, then dismisses the toast. |
| `duration` | 4000 | Milliseconds before it leaves; 6000 when there is an action. |
| `led` | `'ok'` | `'ok'`, `'warn'`, `'crit'` or `'info'` for the LED beside the message, or `false` for none. |

The toast is a `role="status"` polite live region, so screen readers announce it without taking focus. It does not leave while the pointer is over it or focus is inside it; the timer pauses and, once you move away, keeps at least 1.5 s. Escape with focus inside it dismisses it and returns focus to where it came from.

## Undo
Prefer an Undo toast to a confirm dialog whenever the action can be reversed (archive, move, mute, remove from a list). The person is never interrupted, and a slip costs one click. Run the action at once, show the toast, and make `onAction` put things back.

```js
archive(node);
SoftConsole.toast('Node archived', { action: { label: 'Undo', onAction: function () { restore(node); } } });
```

Keep a confirm dialog (see Dialog) for what cannot be undone: stopping a service, deleting data, anything that leaves the system.

## Motion
The toast rises 10px into place on the spring easing and fades in; leaving sinks it back down the same path and fades it, then removes it. It moves on transitions, so it can be turned around at any moment. A new toast while one is showing replaces its content in place (no pile-up) and restarts the timer, even halfway through leaving. Under reduced motion there is no rise or sink: it fades over `dur-fade`.

## Static markup
```html
<div class="sc-toast sc-raised-2" role="status"><span class="sc-led sc-led--ok"></span>Applied to server</div>
```
Markup written by hand rises in with a keyframe when inserted; remove it yourself after about 2.6 s. It is centered with the `translate` property, so the rise never shifts it sideways. Use `SoftConsole.toast` for anything that should leave gracefully.

The toast casts `float`, the dark half of a raised shadow, like every overlay.

## Do and don't
- Do show one at a time.
- Do say what happened in a few words: "Applied to server".
- Do offer Undo for reversible actions.
- Don't put anything but a single short action in a toast.
- Don't use it for errors that need action. Use a Callout.
