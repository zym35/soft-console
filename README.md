# Soft Console

A neumorphic design system for technical dashboards, in dark and light. Three plain files with no dependencies and nothing to build.

### ▶ [Live demo](https://zym35.github.io/soft-console/)

![Soft Console demo: a cursor flips a switch, redraws a chart, turns the jog wheel, scans the segment bars, then switches from dark to light and back](docs/images/kit.gif)

## Use it

Copy `dist/` into your project and link the files:

```html
<link rel="stylesheet" href="dist/tokens.css">
<link rel="stylesheet" href="dist/soft-console.css">
<script src="dist/soft-console.js"></script>
<script>SoftConsole.init(document.body);</script>
```

Set a palette with `data-theme` on `<html>`: `graphite-teal` (default) or `carbon-cyan`. Set `data-mode="light"` for light mode, or `data-mode="auto"` to follow the operating system; dark is the default. Add `data-density="compact"` for dense screens. From script, use `SoftConsole.setTheme`, `SoftConsole.setMode` and `SoftConsole.setDensity`.

## Docs

- [Guidelines](docs/guidelines.md): principles, color, type, motion and copy
- [Components](docs/components): markup and usage for all 35 components

## Upgrading from 1.x

2.0 adds light mode. Pages that load the kit as it is keep looking the same, apart from:

- **Basalt · Lime is gone.** `data-theme="basalt-lime"` falls back to Graphite · Teal, and `SoftConsole.setTheme('basalt-lime')` throws.
- **`tokens.json` values are nested by mode.** A themed value is now `value[theme].dark` and `value[theme].light` instead of `value[theme]`. Values that are the same everywhere are still plain strings.
- **New tokens:** `accent-mark` (focus rings and knob rings), `ok-led`, `warn-led`, `crit-led`, `info-led` (LEDs), `vfd-ink` and `vfd-glow` (live display glass), `glow` (strength of glows on the material) and `float` (the shadow of dialogs, tooltips, toasts and the select list). If you override tokens, override these alongside the old ones.
- **Overlays lose their lit-side shadow.** Dialogs, tooltips, toasts and the select list cast `float` only, in both modes.
- **The `gear` icon is now a cog**, so it can't be mistaken for the new `sun`. The kit also adds `moon` and `monitor`.

## License

[MIT](LICENSE) © 2026 King Zhou
