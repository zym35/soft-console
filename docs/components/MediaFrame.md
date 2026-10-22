# MediaFrame

A media frame sets a picture or video into the panel in a recessed window, so it reads as content the panel holds.

## What you provide
```html
<figure style="margin:0;display:grid;gap:10px">
  <div class="sc-frame"><img src="cam04.jpg" alt="Camera 4: the aisle of row C in hall B"></div>
  <figcaption class="sc-note">CAM 04 · hall B, row C</figcaption>
</figure>
```
The frame is 16:9 by default. Set `--ar` for any other ratio: `style="--ar: 4 / 3"`, or `style="--ar: 9 / 16"` for portrait video. The picture covers the window; a Lightbox shows it whole.

When the frame opens a Lightbox, make it the button: `<button type="button" class="sc-frame" data-sc-dialog="#…" aria-label="Open …">`. It gets a zoom-in cursor and the focus ring, and shrinks a hair (to 98.5%) while pressed.

A `<video>` goes in the same frame, without the `controls` attribute. Its controls are a MediaPlayer row under the frame.

## Do and don't
- Do write alt text that says what the picture shows. Use empty alt only for decoration.
- Do keep `--ar` close to the media's own ratio, so the cover crops little.
- Don't add borders, shadows or rounded corners to the picture inside. The window is its edge.
- Don't put controls or labels over the picture. Put them under it.
