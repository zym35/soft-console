# MediaPlayer

A media player is one compact row: play, a seek bar with a thin handle, the time, and mute. Audio seeks on a waveform.

## What you provide
Video, with the row under its MediaFrame:
```html
<div class="sc-frame"><video id="cam04" src="cam04.mp4" poster="cam04.jpg" preload="metadata"></video></div>
<div class="sc-player" data-sc-player="#cam04">
  <button type="button" class="sc-btn" data-sc-play aria-label="Play"></button>
  <input class="sc-seek" type="range" aria-label="Seek">
  <span class="sc-time"></span>
  <button type="button" class="sc-btn sc-btn--ghost" data-sc-mute aria-label="Mute"></button>
  <button type="button" class="sc-btn sc-btn--ghost" aria-label="Enlarge" data-sc-dialog="#cam04-box"><svg class="sc-ic"><use href="#sc-i-expand"/></svg></button>
</div>
```
Audio, with a label above it:
```html
<span class="sc-form-row__label">Handover, night shift</span>
<audio id="handover" src="handover.m4a" preload="metadata"></audio>
<div class="sc-player" data-sc-player="#handover">
  <button type="button" class="sc-btn" data-sc-play aria-label="Play"></button>
  <div class="sc-wave" data-sc-wave=".82,.95,.80,1,.97,.88,.69,.51,.33,.23,…"><input type="range" aria-label="Seek"></div>
  <span class="sc-time"></span>
  <button type="button" class="sc-btn sc-btn--ghost" data-sc-mute aria-label="Mute"></button>
</div>
```
`SoftConsole.init` wires every `data-sc-player` row to the `<audio>` or `<video>` its selector names, or call `SoftConsole.player(row, media)` yourself. It draws the play, pause, volume and muted icons. Play and mute latch pressed (`aria-pressed`) while on. The seek follows playback and seeks on drag, click and arrow keys. The time reads elapsed / total, and an em dash until the duration is known.

The seek bar is a thin recessed track with the played part in accent. Its handle is a thin vertical line in `text-1`, not a knob.

The waveform draws fixed 3px bars with 2px gaps on whole pixels, as many as the width holds, and redraws when it resizes. `data-sc-wave` takes peaks from 0 to 1, any number of them; each bar shows the loudest peak it covers. Compute the peaks once, on the server or with the Web Audio API, and store them with the clip. To draw one without a player, call `SoftConsole.wave(el, peaks, progress)` or set `data-progress` (0 to 1).

## Do and don't
- Do keep the row to play, seek, time and mute, plus Enlarge for video. A screen that needs speed, loops or captions adds them next to the row, not in it.
- Do show units of time as `mm:ss` in the data family.
- Do give every icon-only key an `aria-label`.
- Don't autoplay with sound.
- Don't lay the row over the picture.
