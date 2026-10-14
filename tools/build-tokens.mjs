// Soft Console token builder.
// Every color, shadow and length in the system is derived here from a few primitives per palette,
// then written to dist/tokens.json and dist/tokens.css.
// Run: npm run build:tokens   (or: node tools/build-tokens.mjs)
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = {
  json: join(ROOT, 'dist/tokens.json'),
  css: join(ROOT, 'dist/tokens.css'),
};

/* ---------- palettes: material (h s l), accent (ah as al), chart companions ---------- */
const PALETTES = [
  { id: 'graphite-teal', name: 'Graphite · Teal', h: 218, s: 9, l: 18, ah: 166, as: 68, al: 46, s2: [252, 70, 76], s3: [336, 62, 72], s4: [40, 38, 68] },
  { id: 'carbon-cyan', name: 'Carbon · Cyan', h: 210, s: 6, l: 14, ah: 189, as: 80, al: 50, s2: [258, 70, 77], s3: [336, 62, 72], s4: [40, 38, 68] },
  { id: 'basalt-lime', name: 'Basalt · Lime', h: 95, s: 6, l: 16, ah: 76, as: 70, al: 55, s2: [252, 65, 76], s3: [336, 60, 72], s4: [180, 45, 62] },
];
const DEPTH = 0.55; // Q5: subtle

/* ---------- color math ---------- */
function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map(x => Math.round(x * 255));
}
const toHex = (rgb, alpha = 1) => '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('')
  + (alpha < 1 ? Math.round(alpha * 255).toString(16).padStart(2, '0') : '');
const hex = (h, s, l, a = 1) => toHex(hslToRgb(((h % 360) + 360) % 360, s, l), a);
const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

/* ---------- color tokens: [name, (p) => value, usage] ---------- */
const COLORS = [
  ['surface', p => hex(p.h, p.s, p.l), 'The one material: page background and every raised or recessed surface.'],
  ['surface-up', p => hex(p.h, p.s, p.l + 2.5), 'Lit side of convex parts (knobs, gauge hubs). Gradient start, with surface-down.'],
  ['surface-down', p => hex(p.h, p.s, p.l - 2), 'Shaded side of convex parts; table row hover.'],
  ['well', p => hex(p.h, p.s, p.l - 3), 'Recessed fills behind data when an inset shadow alone is not enough.'],
  ['slot', p => hex(p.h, p.s + 4, p.l - 7), 'Gauge arcs, meter tracks, LED sockets: the deepest cut in the material.'],
  ['rule', p => hex(p.h, p.s, p.l - 4.5), 'Hairline rules between table rows and list items.'],
  ['shade-hi', p => hex(p.h, p.s, p.l + 7, 0.7), 'Light-side shadow of every raised or inset surface. Never used alone.'],
  ['shade-lo', p => hex(p.h, p.s + 6, p.l - 11, 0.95), 'Dark-side shadow of every raised or inset surface. Never used alone.'],
  ['edge-hi', p => hex(p.h, p.s, p.l + 10, 0.5), 'Hairline edge on the lit side (top and left of raised, bottom and right of inset).'],
  ['edge-lo', p => hex(p.h, p.s, p.l - 6, 0.6), 'Hairline edge on the shaded side. With edge-hi, keeps shapes readable on dim screens.'],
  ['fill-muted', p => hex(p.h, p.s, p.l + 16), 'Unselected bar fills and other data marks that are present but not in focus.'],
  ['text-1', p => hex(p.h, 18, 91), 'Values and primary text on surface and well.'],
  ['text-2', p => hex(p.h, 10, 72), 'Secondary text and descriptions on surface and well.'],
  ['text-3', p => hex(p.h, 8, 61), 'Labels, captions and axis text on surface and well. The floor for readable text.'],
  ['text-off', p => hex(p.h, 6, 40), 'Disabled text and minor gauge ticks only. Exempt from contrast; never for content.'],
  ['accent', p => hex(p.ah, p.as, p.al), 'Primary action fill, the live value on a gauge, selected bar, switch-on ring, focus ring. One primary action per view.'],
  ['accent-2', p => hex(p.ah - 8, p.as, p.al + 9), 'Lighter end of accent gradients (primary button, bar and slider fills).'],
  ['accent-text', p => hex(p.ah, p.as, p.al + 12), 'Accent as text or icon on surface: selected tabs, setpoint labels, links.'],
  ['accent-ink', p => hex(p.ah, 60, 9), 'Text and icons on an accent fill.'],
  ['accent-glow', p => hex(p.ah, p.as, p.al, 0.45), 'Soft light around lit accent marks: primary button, gauge arc, selected bar. Not on knobs.'],
  ['accent-tint', p => hex(p.ah, p.as, p.al, 0.14), 'Faint accent wash inside an inset track when it is on (switch, checked box).'],
  ['ok', () => hex(140, 55, 56), 'Healthy status: LED, chip text, positive delta. Always beside a word.'],
  ['warn', () => hex(38, 92, 60), 'Needs attention: LED, chip text, meter over threshold. Always beside a word.'],
  ['crit', () => hex(356, 82, 70), 'Failing or offline: LED (blinking), chip text. Always beside a word.'],
  ['info', () => hex(206, 85, 66), 'Neutral notice or in-progress state: LED, chip text.'],
  ['lcd-glass', () => hex(80, 20, 73), 'Reflective segment display glass. Holds numbers a person sets (thresholds, limits).'],
  ['lcd-ink', () => hex(95, 25, 13), 'Lit segments and labels on lcd-glass.'],
  ['lcd-ghost', () => hex(95, 25, 13, 0.085), 'Unlit segments on lcd-glass.'],
  ['lcd-shade', () => hex(95, 30, 8, 0.4), 'Inner shadow at the top edge of lcd-glass.'],
  ['lcd-sheen', () => hex(80, 40, 97, 0.38), 'Glare across the top of lcd-glass.'],
  ['vfd-glass', p => hex(p.h, 22, 7), 'Backlit display glass. Holds live numbers the system reports.'],
  ['vfd-glass-2', p => hex(p.ah, 30, 11), 'Backlight bloom in the corner of vfd-glass.'],
  ['vfd-ghost', p => hex(p.ah, 40, 55, 0.075), 'Unlit segments on vfd-glass. Lit segments use accent-text.'],
  ['vfd-shade', p => hex(p.h, 30, 2, 0.7), 'Inner shadow of vfd-glass.'],
  ['series-1', () => '{accent}', 'First chart series, and the focus series in accent-led charts.'],
  ['series-2', p => hex(...p.s2), 'Second categorical series. Peers-only charts.'],
  ['series-3', p => hex(...p.s3), 'Third categorical series.'],
  ['series-4', p => hex(...p.s4), 'Fourth categorical series. Never add a fifth hue: group or facet instead.'],
  ['mute-1', p => hex(p.h, 10, 62), 'Context series in accent-led charts, nearest to focus.'],
  ['mute-2', p => hex(p.h, 8, 48), 'Context series in accent-led charts.'],
  ['mute-3', p => hex(p.h, 7, 38), 'Context series in accent-led charts, furthest back.'],
];

/* ---------- shadows (per palette, scaled by DEPTH) ---------- */
const px = v => `${+(v * DEPTH).toFixed(2)}px`;
const pair = (p, o, b, oh, bh, inset = '') => {
  const lo = hex(p.h, p.s + 6, p.l - 11, 0.95), hi = hex(p.h, p.s, p.l + 7, 0.7);
  return `${inset}${px(o)} ${px(o)} ${px(b)} ${lo}, ${inset}${px(-oh)} ${px(-oh)} ${px(bh)} ${hi}`;
};
const ZERO2 = '0 0 0 #0000, 0 0 0 #0000';
const IZERO2 = 'inset 0 0 0 #0000, inset 0 0 0 #0000';
const SHADOWS = [
  ['raised-1', p => pair(p, 3, 8, 3, 8), 'Controls: buttons, knobs, switches, the jog wheel.'],
  ['raised-2', p => pair(p, 6, 16, 5, 14), 'Tiles: KPI tiles, display bezels, panels inside a device frame.'],
  ['raised-3', p => pair(p, 12, 30, 10, 26), 'Primary containers: the device frame, top-level panels.'],
  ['inset-1', p => pair(p, 3, 7, 3, 7, 'inset '), 'Fields, tracks, chips, sparkline wells.'],
  ['inset-2', p => pair(p, 6, 14, 5, 12, 'inset '), 'Deep wells: chart plots, gauge faces.'],
  ['btn-rest', p => `${pair(p, 3, 8, 3, 8)}, ${IZERO2}`, 'Button at rest. Same 4-layer shape as btn-press so the press animates.'],
  ['btn-hover', p => `${pair(p, 4, 11, 4, 11)}, ${IZERO2}`, 'Button under the pointer: lifts slightly.'],
  ['btn-press', p => `${ZERO2}, ${pair(p, 2.5, 6, 2.5, 6, 'inset ')}`, 'Pressed, selected, on. The state of anything that is active.'],
  ['btn-flat', () => `${ZERO2}, ${IZERO2}`, 'Disabled and unselected segments: melted into the surface.'],
];

/* ---------- theme-independent families ---------- */
const SPACING = [
  ['space-1', '4px', 'Gap between an icon and its label.'],
  ['space-2', '8px', 'Gap inside chips and between LED and text.'],
  ['space-3', '12px', 'Gap between related controls in a row.'],
  ['space-4', '16px', 'Gap between stacked controls; panel padding (compact).'],
  ['space-5', '20px', 'Gap between control groups.'],
  ['space-6', '24px', 'Panel padding (comfortable); page gutter on small screens.'],
  ['space-7', '32px', 'Gap between panels in a loose layout.'],
  ['space-8', '48px', 'Gap between page sections.'],
  ['ctl-h', '44px', 'Control height, comfortable density (default): buttons, fields, segmented controls.'],
  ['ctl-h-compact', '36px', 'Control height, compact density.'],
  ['pad-panel', '22px', 'Panel padding, comfortable density.'],
  ['pad-panel-compact', '16px', 'Panel padding, compact density.'],
  ['gap', '28px', 'Grid gap between tiles and panels, comfortable density.'],
  ['gap-compact', '18px', 'Grid gap, compact density.'],
  ['row-py', '12px', 'Vertical padding of table rows and list items, comfortable.'],
  ['row-py-compact', '8px', 'Vertical padding of table rows and list items, compact.'],
];
const RADIUS = [
  ['radius-xs', '4px', 'Checkboxes.'],
  ['radius-sm', '6px', 'Segments inside a segmented control, small icon buttons.'],
  ['radius-md', '9px', 'Buttons, fields, icon buttons, sparkline wells.'],
  ['radius-lg', '12px', 'KPI tiles, display bezels.'],
  ['radius-xl', '16px', 'Panels and the device frame.'],
  ['radius-pill', '999px', 'Switch tracks, slider tracks, chips, meters, bars.'],
];
const DURATION = [
  ['dur-press', '220ms', 'Press travel on buttons and segments.'],
  ['dur-ui', '250ms', 'Switch knob slide, hover lift, selection marker.'],
  ['dur-value', '900ms', 'Gauge sweep, bars and meters growing in, count-ups.'],
  ['dur-enter', '520ms', 'Panels rising in on first load.'],
];
const EASING = [['ease-standard', 'cubic-bezier(.2, .7, .2, 1)', 'Every Soft Console transition and animation.']];

const TYPE = {
  fonts: [],
  families: {
    ui: '"Manrope", "Segoe UI", system-ui, sans-serif',
    data: '"IBM Plex Mono", ui-monospace, "Cascadia Mono", Consolas, monospace',
  },
  groups: [
    { name: 'Interface', family: 'ui', styles: [
      { name: 't-display', fontSize: '44px', lineHeight: '48px', fontWeight: 600, letterSpacing: '-0.66px', sample: 'Edge cluster overview', usage: 'One per screen at most: the screen title on overview pages.' },
      { name: 't-title', fontSize: '24px', lineHeight: '30px', fontWeight: 600, sample: 'Rack 04 telemetry', usage: 'Page and section titles.' },
      { name: 't-heading', fontSize: '17px', lineHeight: '24px', fontWeight: 600, sample: 'Power rails', usage: 'Panel titles.' },
      { name: 't-body', fontSize: '15px', lineHeight: '22px', fontWeight: 400, sample: 'Nodes report every 250 ms. A node that misses three reports in a row is marked offline.', usage: 'Running text and descriptions, in text-2.' },
      { name: 't-label', fontSize: '11.5px', lineHeight: '16px', fontWeight: 600, letterSpacing: '1.38px', sample: 'INLET TEMPERATURE', usage: 'Uppercase labels above values, table headers, panel meta. In text-3.' },
    ] },
    { name: 'Data', family: 'data', styles: [
      { name: 't-readout', fontSize: '40px', lineHeight: '44px', fontWeight: 500, letterSpacing: '-0.8px', sample: '12,480.6', usage: 'The one big number in a tile or hub.' },
      { name: 't-kpi', fontSize: '30px', lineHeight: '33px', fontWeight: 500, letterSpacing: '-0.6px', sample: '182 ms', usage: 'KPI tile values.' },
      { name: 't-data', fontSize: '13.5px', lineHeight: '20px', fontWeight: 400, sample: 'edge-12  88%  58.1 °C  12d 02h', usage: 'Table cells, timestamps, node names, every number in running UI.' },
    ] },
  ],
};

/* ---------- build ---------- */
const themes = PALETTES.map(p => ({ id: p.id, name: p.name }));
const perTheme = fn => Object.fromEntries(PALETTES.map(p => [p.id, fn(p)]));
const colorTokens = COLORS.map(([name, fn, usage]) => {
  const values = perTheme(fn);
  const first = values[PALETTES[0].id];
  const same = Object.values(values).every(v => v === first);
  return { name, value: same ? first : values, usage };
});
const shadowTokens = SHADOWS.map(([name, fn, usage]) => {
  const values = perTheme(fn);
  const first = values[PALETTES[0].id];
  return { name, value: Object.values(values).every(v => v === first) ? first : values, usage };
});
const list = rows => ({ tokens: rows.map(([name, value, usage]) => ({ name, value, usage })) });

const tokens = {
  name: 'Soft Console',
  version: 1,
  color: { themes, tokens: colorTokens },
  type: TYPE,
  spacing: list(SPACING),
  radius: list(RADIUS),
  shadow: { note: 'Subtle depth (0.55x). Every raised and inset shadow is a dark/light pair in the palette\'s own material.', tokens: shadowTokens },
  duration: list(DURATION),
  easing: list(EASING),
};

/* tokens.css, laid out like the design system page compiles it */
const cssVal = v => (/^\{(.+)\}$/.test(v) ? `var(--${v.slice(1, -1)})` : v);
const themeBlock = (theme, first) => {
  const sel = first ? `:root, [data-theme="${theme.id}"]` : `[data-theme="${theme.id}"]`;
  const lines = [...colorTokens, ...shadowTokens]
    .filter(t => first || typeof t.value === 'object' || /^\{/.test(t.value))
    .map(t => `  --${t.name}: ${cssVal(typeof t.value === 'object' ? t.value[theme.id] : t.value)};`);
  return `${sel} {\n${lines.join('\n')}\n}`;
};
const rootLines = [
  ...SPACING, ...RADIUS, ...DURATION, ...EASING,
].map(([n, v]) => `  --${n}: ${v};`)
  .concat(Object.entries(TYPE.families).map(([k, v]) => `  --font-${k}: ${v};`));
const styleClasses = TYPE.groups.flatMap(g => g.styles.map(s => `.${s.name} {\n  font-family: var(--font-${g.family});\n  font-size: ${s.fontSize};\n  line-height: ${s.lineHeight};\n  font-weight: ${s.fontWeight};${s.letterSpacing ? `\n  letter-spacing: ${s.letterSpacing};` : ''}\n}`));
const css = [
  '/* Soft Console — generated from tokens.json */',
  ...themes.map((t, i) => themeBlock(t, i === 0)),
  `:root {\n${rootLines.join('\n')}\n}`,
  ...styleClasses,
  '',
].join('\n\n');

for (const f of Object.values(OUT)) mkdirSync(dirname(f), { recursive: true });
const json = JSON.stringify(tokens, null, 2) + '\n';
writeFileSync(OUT.json, json);
writeFileSync(OUT.css, css);

/* contrast report: text tokens on surface, per palette */
for (const p of PALETTES) {
  const rgb = name => hexToRgb(COLORS.find(c => c[0] === name)[1](p));
  const base = rgb('surface');
  const report = ['text-1', 'text-2', 'text-3', 'accent-text', 'accent', 'ok', 'warn', 'crit', 'info']
    .map(n => `${n} ${contrast(rgb(n), base).toFixed(2)}`).join(' · ');
  const ink = contrast(rgb('accent-ink'), rgb('accent')).toFixed(2);
  const lcd = contrast(rgb('lcd-ink'), rgb('lcd-glass')).toFixed(2);
  console.log(`${p.id}: ${report} · accent-ink/accent ${ink} · lcd ${lcd}`);
}
function hexToRgb(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }
console.log(`wrote ${colorTokens.length} colors, ${shadowTokens.length} shadows, ${css.split('\n').length} css lines`);
