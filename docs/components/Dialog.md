# Dialog

A dialog is a raised panel floating over a shade scrim, for confirmations and short details.

## What you provide
```html
<button type="button" class="sc-btn sc-btn--danger" data-sc-dialog="#stop"><span>Stop service…</span></button>

<div class="sc-scrim" id="stop" hidden>
  <section class="sc-dialog sc-raised-3" role="dialog" aria-modal="true" aria-labelledby="stop-title">
    <div class="sc-dialog__head"><h2 class="sc-dialog__title" id="stop-title">Stop service?</h2>
      <button type="button" class="sc-btn sc-ibtn sc-btn--sm sc-btn--ghost" aria-label="Close" data-sc-close><svg class="sc-ic"><use href="#sc-i-close"/></svg></button></div>
    <p>Monitoring stops. Existing broker orders and positions persist.</p>
    <div class="sc-dialog__actions">
      <button type="button" class="sc-btn sc-btn--ghost" data-sc-close><span>Cancel</span></button>
      <button type="button" class="sc-btn sc-btn--danger"><span>Stop service</span></button>
    </div>
  </section>
</div>
```
The scrim starts `hidden`. A button with `data-sc-dialog` pointing at the scrim opens it once `SoftConsole.init` has run. Or call `SoftConsole.dialog(scrim).open(opener)` and `.close()`.

While open, focus stays inside the dialog: Tab and Shift+Tab wrap around. Focus starts on the element with `autofocus`, or the first focusable one. Escape, a click on the scrim, or any `[data-sc-close]` element closes it, and focus returns to the opener. Closing fires `sc-close` on the scrim when closing starts, not when the fade ends. Run the action from its own click handler, then call `.close()`.

The dialog opens on transitions (`SoftConsole.dialog` puts `is-open` on the scrim): the scrim fades in over `dur-ui` and the box rises 10px into place on the spring easing. Closing sinks the box back down the same path and fades the scrim, then sets `hidden`. Interrupt it either way, closing halfway through opening or reopening halfway through closing, and it reverses from where it is. Focus returns to the opener at once when closing starts, and the Tab trap is released then. `isOpen` is true from the moment `open()` is called until `close()` is. Under reduced motion there is no rise or sink: the scrim and box fade over `dur-fade`.

Under `prefers-reduced-transparency: reduce` the scrim drops its blur and covers the page almost solid (94% `slot`).

The dialog keeps the `raised-3` panel and its hairline edges but casts only `float`, the dark half of the shadow: it floats over the page rather than rising out of it, so nothing lights up around it.

## Do and don't
- Do use it to confirm destructive actions, as the Button guidelines ask.
- Do put Cancel before the action.
- Do name the action button by what it does ("Stop service"), not "OK".
- Don't open a dialog from inside another dialog.
