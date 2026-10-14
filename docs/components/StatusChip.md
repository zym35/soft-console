# StatusChip

Status chips pair an LED with a word so a state reads at a glance and never by color alone.

## What you provide
```html
<span class="sc-chip sc-inset-1"><span class="sc-led sc-led--ok"></span>Online</span>
```
LED modifiers: `--ok`, `--warn`, `--crit` (add `--blink` for an active failure), `--info`, `--off` (unlit socket for standby).

## Do and don't
- Do always include the word. The LED is a second channel, not the message.
- Do blink only for something failing right now. One blinking LED per view at most.
- Don't use signal colors for anything that is not a state.
