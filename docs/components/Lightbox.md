# Lightbox

A lightbox enlarges one image or video on a floating panel over the scrim, as large as the screen allows.

## What you provide
```html
<button type="button" class="sc-frame" data-sc-dialog="#plan-box" aria-label="Open Hall B floor plan"><img src="floor.svg" alt="Floor plan of hall B"></button>

<div class="sc-scrim" id="plan-box" hidden>
  <section class="sc-lightbox sc-raised-3" role="dialog" aria-modal="true" aria-labelledby="plan-title">
    <div class="sc-lightbox__head"><h2 class="sc-lightbox__title" id="plan-title">Hall B floor plan <span>1600 × 900</span></h2>
      <button type="button" class="sc-btn sc-btn--ghost" aria-label="Close" data-sc-close><svg class="sc-ic"><use href="#sc-i-close"/></svg></button></div>
    <div class="sc-frame"><img src="floor.svg" alt="Floor plan of hall B"></div>
  </section>
</div>
```
For video, add `sc-lightbox--player` to the panel and put a MediaPlayer row under the frame. Wire the row to the lightbox's own `<video>`, and pause the inline one before you open it.

A lightbox is a Dialog. It opens from `data-sc-dialog` or `SoftConsole.dialog(scrim).open(opener)`. While it is open, focus stays inside. Escape, a click on the scrim or `[data-sc-close]` closes it, and focus returns to the opener. Closing pauses any audio or video inside. It opens and closes as a Dialog does: the scrim fades and the panel rises 10px, closing reverses it, and `sc-close` fires when closing starts.

When the opener is a `button.sc-frame`, the picture grows out of the thumbnail into the panel with the View Transitions API (the thumbnail's image and the lightbox's `.sc-frame` share a `view-transition-name` for the length of the transition and are cleaned up afterwards), and shrinks back into the thumbnail on close. From any other opener (the player's Enlarge key, `open()` from script), in a browser without View Transitions, or under reduced motion, it uses the normal dialog fade instead.

The frame shows the media whole, never cropped. The panel takes the full width or the height left over by its own chrome, whichever is smaller. For media that isn't 16:9, set the ratio twice on the panel: `--ar` as a ratio and `--ar-n` as a number, for example `style="--ar: 9 / 16; --ar-n: .5625"`. The frame inside inherits `--ar`.

## Do and don't
- Do open it from the frame itself (a button frame) or from the player's Enlarge key.
- Do title the panel, with at most one detail in the data family, such as a size or a time.
- Don't add galleries, zoom or toolbars. A lightbox shows one subject.
- Don't open a lightbox from inside another dialog.
