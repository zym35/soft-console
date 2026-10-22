/* @ds-bundle: {"format":4,"namespace":"SoftConsole","components":[{"name":"Surface"},{"name":"Panel"},{"name":"Button"},{"name":"IconButton"},{"name":"SegmentedControl"},{"name":"Switch"},{"name":"Check"},{"name":"Slider"},{"name":"Field"},{"name":"JogWheel"},{"name":"StatusChip"},{"name":"AlertList"},{"name":"SegmentDisplay"},{"name":"DialGauge"},{"name":"Meter"},{"name":"KpiTile"},{"name":"LineChart"},{"name":"DataTable"},{"name":"SideNav"},{"name":"Breadcrumb"},{"name":"Avatar"},{"name":"ListRow"},{"name":"FormRow"},{"name":"ToggleGroup"},{"name":"TextArea"},{"name":"FileField"},{"name":"SaveBar"},{"name":"Callout"},{"name":"Tooltip"},{"name":"Dialog"},{"name":"Toast"},{"name":"Disclosure"},{"name":"Readouts"},{"name":"CodeBlock"},{"name":"SegmentBars"},{"name":"MediaFrame"},{"name":"MediaPlayer"},{"name":"Lightbox"}]} */
/* Soft Console helpers. Plain script, no dependencies. Exposes window.SoftConsole.
   Markup and styling live in bundle.css; this file draws the instruments and wires interactions. */
(function () {
  'use strict';

  var THEMES = ['graphite-teal', 'carbon-cyan'];
  var MODES = ['dark', 'light', 'auto'];
  var reduced = function () { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var uid = 0;

  /* ---------- preferences ---------- */
  function setTheme(id) {
    if (THEMES.indexOf(id) < 0) throw new Error('Unknown Soft Console palette "' + id + '". Use one of: ' + THEMES.join(', '));
    document.documentElement.setAttribute('data-theme', id);
    return id;
  }
  /* dark is the default; auto follows the OS in CSS alone. Switching crossfades where View Transitions exist,
   reduced motion included: the crossfade is opacity only, and it spares an abrupt dark/light jump. */
  function setMode(mode) {
    if (MODES.indexOf(mode) < 0) throw new Error('Unknown Soft Console mode "' + mode + '". Use one of: ' + MODES.join(', '));
    var html = document.documentElement;
    if (html.getAttribute('data-mode') === mode) return mode;
    var apply = function () { html.setAttribute('data-mode', mode); };
    if (document.startViewTransition) document.startViewTransition(apply);
    else apply();
    return mode;
  }
  function setDensity(mode) {
    if (mode !== 'comfortable' && mode !== 'compact') throw new Error('Density must be "comfortable" or "compact"');
    if (mode === 'compact') document.documentElement.setAttribute('data-density', 'compact');
    else document.documentElement.removeAttribute('data-density');
    return mode;
  }

  /* ---------- spring: motion that starts where the value is and keeps its velocity ----------
     A critically damped spring (damping ratio 1: no overshoot), set by `response` in seconds, the period of the undamped spring.
     SPRING_UI matches --ease-spring in tokens.css; SPRING_VALUE is slower, so gauges and counts still read like hardware.
     spring(from, response, eps, onFrame) -> { value, velocity, target, eps, to(target, velocity), snap(value) }
     to() re-targets: the current value and velocity carry on. A velocity passed to a spring that is at rest sets its
     starting speed, which is how a flick hands its release speed to the spring. One rAF loop steps every moving spring.
     Under reduced motion to() jumps to the target. The step is analytic, so it is exact at any frame time.
     SoftConsole.timeScale (default 1) slows every spring by that factor, for reviewing motion: set it to 10 and they run ten times slower. */
  var timeScale = function () { var t = window.SoftConsole && +window.SoftConsole.timeScale; return t > 0 ? t : 1; };
  var SPRING_UI = 0.4, SPRING_VALUE = 0.6;
  var moving = [], loopId = 0, afters = [], stepping = false;
  function afterFrame(fn) { // run fn once at the end of this frame's step (or now, outside the loop)
    if (!stepping) { fn(); return; }
    if (afters.indexOf(fn) < 0) afters.push(fn);
  }
  function loop() {
    loopId = 0;
    var now = performance.now(), batch = moving;
    moving = [];
    stepping = true;
    batch.forEach(function (s) { if (s.step(now)) moving.push(s); });
    stepping = false;
    var queued = afters;
    afters = [];
    queued.forEach(function (fn) { fn(); });
    if (moving.length && !loopId) loopId = requestAnimationFrame(loop);
  }
  function spring(from, response, eps, onFrame) {
    var w = 2 * Math.PI / response, last = 0, on = false;
    var s = { value: from, velocity: 0, target: from, eps: eps };
    s.snap = function (v) { s.value = s.target = v; s.velocity = 0; on = false; onFrame(v); };
    s.to = function (t, v0) {
      if (reduced() || !window.requestAnimationFrame) { s.snap(t); return; }
      s.target = t;
      if (on) return;
      if (v0) s.velocity = v0;
      on = true;
      last = performance.now();
      moving.push(s);
      if (!loopId && !stepping) loopId = requestAnimationFrame(loop);
    };
    s.step = function (now) {
      var dt = Math.max(0, (now - last) / 1000) / timeScale(), x0 = s.value - s.target, v0 = s.velocity, k = v0 + w * x0, e = Math.exp(-w * dt);
      last = now;
      s.value = s.target + (x0 + k * dt) * e;
      s.velocity = (v0 - w * k * dt) * e;
      if (Math.abs(s.value - s.target) < s.eps && Math.abs(s.velocity) < s.eps * 10) { s.value = s.target; s.velocity = 0; on = false; }
      var live = on;
      onFrame(s.value);
      return live;
    };
    return s;
  }
  /* gesture maths. project: where a release at speed v (px/s) comes to rest with a deceleration rate d per ms (Apple's
     scroll formula). rubberband: the distance a drag moves past a limit, resisted, never more than dimension (px). */
  var project = function (v, d) { return (v / 1000) * d / (1 - d); };
  var rubberband = function (over, dim, c) { return (over * dim * c) / (dim + c * Math.abs(over)); };
  var fmtNum = function (v, dec) { return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
  /* countUp(el, to, dec): the first call counts from 0. A later call on the same element carries on from the number on screen. */
  function countUp(el, to, decimals) {
    var st = el.scCount;
    if (!st) {
      st = el.scCount = { dec: 0 };
      st.spring = spring(0, SPRING_VALUE, 0.01, function (v) { el.textContent = fmtNum(v, st.dec); });
    }
    st.dec = decimals || 0;
    st.spring.eps = 0.2 * Math.pow(10, -st.dec);
    st.spring.to(to);
  }

  /* ---------- seven-segment display ---------- */
  var SEG_MAP = { '0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg', '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg', '-': 'g', ' ': '', 'E': 'adefg', 'r': 'eg', 'o': 'cdeg', 'n': 'ceg', 'H': 'bcefg', 'L': 'def', 'P': 'abefg', 'C': 'adef' };
  var SW = 22, SH = 40, ST = 4.6, SG = 0.9, SGAP = 8;
  var SEG_POLY = (function () {
    var t = ST / 2;
    var hz = function (x1, x2, y) { return [x1, y, x1 + t, y - t, x2 - t, y - t, x2, y, x2 - t, y + t, x1 + t, y + t].join(' '); };
    var vt = function (x, y1, y2) { return [x, y1, x + t, y1 + t, x + t, y2 - t, x, y2, x - t, y2 - t, x - t, y1 + t].join(' '); };
    var L = t, R = SW - t, T = t, M = SH / 2, B = SH - t;
    return { a: hz(L + SG, R - SG, T), b: vt(R, T + SG, M - SG), c: vt(R, M + SG, B - SG), d: hz(L + SG, R - SG, B), e: vt(L, M + SG, B - SG), f: vt(L, T + SG, M - SG), g: hz(L + SG, R - SG, M) };
  })();
  function segment(el, text, digits) {
    var cells = [];
    String(text).split('').forEach(function (ch) {
      if (ch === '.' && cells.length) cells[cells.length - 1].dp = true;
      else cells.push({ ch: ch, dp: false });
    });
    while (cells.length < (digits || 0)) cells.unshift({ ch: ' ', dp: false });
    var step = SW + SGAP, w = cells.length * step - SGAP;
    var parts = cells.map(function (c, i) {
      var on = SEG_MAP[c.ch] || '';
      var polys = 'abcdefg'.split('').map(function (k) { return '<polygon points="' + SEG_POLY[k] + '" class="' + (on.indexOf(k) >= 0 ? 'on' : 'off') + '"/>'; }).join('');
      return '<g transform="translate(' + i * step + ' 0)">' + polys + '<circle cx="' + (SW + SGAP / 2 - 1) + '" cy="' + (SH - ST / 2) + '" r="2.4" class="' + (c.dp ? 'on' : 'off') + '"/></g>';
    }).join('');
    el.classList.add('sc-seg7');
    el.innerHTML = '<svg viewBox="-6 -1 ' + (w + 12) + ' ' + (SH + 2) + '" role="img" aria-label="' + String(text).trim() + '"><g transform="skewX(-6)">' + parts + '</g></svg>';
    return el;
  }

  /* ---------- segment bars: a bar graph on the segment display's glass ----------
     glass: a .sc-display__glass. values: numbers. opts:
       format(v) -> { text, unit }  text uses seven-segment characters (0-9 . -); unit sits beside it
       labels, names                 short x labels and full names (readout and accessible label)
       levels (10), digits (5), max (nice max of values), maxLabels (8), label, totalLabel, stateLabel
     Pointer (hover, or press and drag, for touch too) or keyboard (arrows, Home, End, Escape) moves a cursor that drives the readout. */
  function niceMax(v) {
    if (!(v > 0)) return 1;
    var p = Math.pow(10, Math.floor(Math.log(v) / Math.LN10)), n = v / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  }
  function segbars(glass, values, opts) {
    var o = opts || {};
    if (!values || !values.length) throw new Error('SoftConsole.segbars needs at least one value');
    var levels = o.levels || 10, digits = o.digits || 5;
    var fmt = o.format || function (v) { return { text: String(+v.toFixed(2)), unit: '' }; };
    var max = o.max || niceMax(Math.max.apply(null, values));
    var labels = o.labels || values.map(function (v, i) { return String(i + 1); });
    var names = o.names || labels, last = values.length - 1;
    var every = Math.max(1, Math.ceil(values.length / (o.maxLabels || 8)));
    var total = values.reduce(function (a, b) { return a + b; }, 0);
    var cursor = -1;
    glass.innerHTML =
      '<div class="sc-display__top"><span data-part="what"></span><span data-part="state"></span></div>'
      + '<div class="sc-segbars">'
      + '<div class="sc-segbars__head"><div class="sc-display__row"><div data-part="digits"></div><span class="sc-segbars__unit" data-part="unit"></span></div></div>'
      + '<div class="sc-segbars__body"><div class="sc-segbars__scale" aria-hidden="true"><span>' + esc(fmt(max).text) + '</span><span>' + esc(fmt(max / 2).text) + '</span><span>0</span></div>'
      + '<div class="sc-segbars__graph" tabindex="0" role="img"><div class="sc-segbars__cols"></div><div class="sc-segbars__x" aria-hidden="true"></div></div></div></div>';
    var part = function (n) { return glass.querySelector('[data-part="' + n + '"]'); };
    var graph = glass.querySelector('.sc-segbars__graph'), colsEl = glass.querySelector('.sc-segbars__cols'), xEl = glass.querySelector('.sc-segbars__x');
    xEl.classList.toggle('sc-segbars__x--sparse', every > 1);
    graph.style.setProperty('--col-gap', values.length > 14 ? '3px' : '8px');
    graph.setAttribute('aria-label', (o.label || 'Bar graph') + ': ' + values.map(function (v, i) { var f = fmt(v); return names[i] + ' ' + f.text + (f.unit ? ' ' + f.unit : ''); }).join(', '));
    colsEl.innerHTML = values.map(function (v, c) {
      var lit = v > 0 ? Math.max(1, Math.round(v / max * levels)) : 0, segs = '';
      for (var k = 0; k < levels; k++) segs += '<i' + (k < lit ? ' class="on" style="--k:' + k + ';--c:' + c + '"' : '') + '></i>';
      return '<div class="sc-segbars__col' + (c === last ? ' is-now' : '') + '" data-i="' + c + '">' + segs + '</div>';
    }).join('');
    xEl.innerHTML = labels.map(function (l, i) {
      var shown = i === last || (i % every === 0 && last - i >= every);
      return '<span class="' + (i === last ? 'is-now' : '') + '">' + (shown ? esc(l) : '') + '</span>';
    }).join('');
    function show(i) {
      cursor = i;
      $$('.is-cursor', glass).forEach(function (e) { e.classList.remove('is-cursor'); });
      graph.classList.toggle('has-cursor', i >= 0);
      var f = fmt(i >= 0 ? values[i] : total);
      part('what').textContent = i >= 0 ? names[i] : (o.totalLabel || 'Total');
      part('state').textContent = i >= 0 ? (i === last ? 'Latest' : 'Day') : (o.stateLabel || 'Live');
      part('unit').textContent = f.unit || '';
      segment(part('digits'), f.text, digits);
      if (i >= 0) { colsEl.children[i].classList.add('is-cursor'); xEl.children[i].classList.add('is-cursor'); }
    }
    colsEl.addEventListener('pointerover', function (e) { var col = !scrub && e.target.closest('.sc-segbars__col'); if (col) show(+col.dataset.i); });
    colsEl.addEventListener('pointerleave', function () { if (!scrub && document.activeElement !== graph) show(-1); });
    /* press and drag scrubs: the pointer is captured, so the column comes from its x, not from the event target */
    var scrub = null;
    var at = function (x) {
      var best = 0, gap = Infinity;
      scrub.mids.forEach(function (m, i) { if (Math.abs(x - m) < gap) { gap = Math.abs(x - m); best = i; } });
      return best;
    };
    colsEl.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      scrub = { id: e.pointerId, mids: Array.prototype.map.call(colsEl.children, function (c) { var r = c.getBoundingClientRect(); return r.left + r.width / 2; }) };
      colsEl.setPointerCapture(e.pointerId);
      show(at(e.clientX));
    });
    colsEl.addEventListener('pointermove', function (e) { if (scrub && e.pointerId === scrub.id) { var i = at(e.clientX); if (i !== cursor) show(i); } });
    var release = function (e) {
      if (!scrub || e.pointerId !== scrub.id) return;
      scrub = null;
      if (e.pointerType !== 'mouse' && document.activeElement !== graph) show(-1); // a finger that lifts leaves nothing to hover; a mouse is still over the column
    };
    colsEl.addEventListener('pointerup', release);
    colsEl.addEventListener('pointercancel', release);
    graph.addEventListener('keydown', function (e) {
      var step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (e.key === 'Home') { e.preventDefault(); show(0); }
      else if (e.key === 'End') { e.preventDefault(); show(last); }
      else if (e.key === 'Escape') { show(-1); }
      else if (step) { e.preventDefault(); show(Math.max(0, Math.min(last, cursor < 0 ? last : cursor + step))); }
    });
    graph.addEventListener('focusout', function () { show(-1); });
    show(-1);
    return glass;
  }

  /* ---------- dial gauge ----------
     gauge(el, value, opts): draws once; the first draw sweeps up from min on a spring. Call it again on the same element
     (or el.scGauge.set(value)) and the arc, lit ticks and hub number move from where they are on screen, keeping their
     velocity, with no rebuild. A changed range, unit, label or decimals rebuilds instead. el.scGauge = { set(value), value }. */
  function gauge(el, value, opts) {
    var prev = el.scGauge ? el.scGauge.opts : {}, o = {};
    ['min', 'max', 'unit', 'label', 'decimals'].forEach(function (k) { o[k] = opts && opts[k] != null ? opts[k] : prev[k]; });
    var min = o.min == null ? 0 : o.min, max = o.max == null ? 100 : o.max;
    var unit = o.unit == null ? '%' : o.unit, label = o.label || '', dec = o.decimals || 0;
    if (!(max > min)) throw new Error('SoftConsole.gauge: max must be greater than min');
    var key = [min, max, unit, label, dec].join('|');
    if (el.scGauge && el.scGauge.key === key && el.contains(el.scGauge.hub)) { el.scGauge.set(value); return el; }
    var C = 130, R = 72, START = 135, SWEEP = 270, N = 50, id = 'sc-glow-' + (uid++);
    var pt = function (deg, r) { var a = deg * Math.PI / 180; return [C + r * Math.cos(a), C + r * Math.sin(a)]; };
    var arc = function (from, to, r) {
      var p1 = pt(from, r), p2 = pt(to, r);
      return 'M' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + (to - from > 180 ? 1 : 0) + ' 1 ' + p2[0].toFixed(2) + ' ' + p2[1].toFixed(2);
    };
    var ticks = '', labels = '', i;
    for (i = 0; i <= N; i++) {
      var a = START + SWEEP * i / N, major = i % 10 === 0, p1 = pt(a, major ? 96 : 100), p2 = pt(a, 107);
      ticks += '<line class="tk' + (major ? ' mj' : '') + '" x1="' + p1[0].toFixed(2) + '" y1="' + p1[1].toFixed(2) + '" x2="' + p2[0].toFixed(2) + '" y2="' + p2[1].toFixed(2) + '"/>';
    }
    for (i = 0; i <= 5; i++) {
      var lp = pt(START + SWEEP * i / 5, 86), lv = min + (max - min) * i / 5;
      labels += '<text class="tl" x="' + lp[0].toFixed(1) + '" y="' + lp[1].toFixed(1) + '" text-anchor="middle" dominant-baseline="central">' + +lv.toFixed(1) + '</text>';
    }
    el.classList.add('sc-gauge');
    el.innerHTML = '<div class="sc-gauge__face sc-inset-2"></div>'
      + '<svg viewBox="0 0 260 260" aria-hidden="true"><defs><filter id="' + id + '" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'
      + ticks + labels
      + '<path class="trk" d="' + arc(START, START + SWEEP, R) + '"/>'
      + '<path class="val" pathLength="1" d="' + arc(START, START + SWEEP, R) + '" filter="url(#' + id + ')"/></svg>'
      + '<div class="sc-gauge__hub sc-raised-2" role="img"><b><span></span><small>' + unit + '</small></b><span>' + label + '</span></div>';
    var tickEls = $$('.tk', el), val = el.querySelector('.val'), hub = el.querySelector('.sc-gauge__hub'), num = el.querySelector('.sc-gauge__hub b > span');
    /* the arc is the full sweep, trimmed by its dash offset; ticks up to the fraction light; the hub shows the number */
    var draw = function (v) {
      var f = Math.max(0, Math.min(1, (v - min) / (max - min)));
      val.setAttribute('stroke-dashoffset', (1 - f).toFixed(4));
      tickEls.forEach(function (t, k) { t.classList.toggle('lit', k / N <= f); });
      num.textContent = fmtNum(v, dec);
    };
    var sp = spring(min, SPRING_VALUE, Math.min((max - min) * 1e-4, 0.2 * Math.pow(10, -dec)), draw);
    var api = el.scGauge = {
      opts: { min: min, max: max, unit: unit, label: label, decimals: dec }, key: key, hub: hub,
      set: function (v) {
        hub.setAttribute('aria-label', label + ': ' + v + ' ' + unit);
        sp.to(v);
      },
      get value() { return sp.target; },
    };
    draw(min);
    api.set(value);
    return el;
  }

  /* ---------- sparkline ---------- */
  function spark(el, data) {
    if (!data || data.length < 2) throw new Error('SoftConsole.spark needs at least two values');
    var W = 240, H = 48, P = 4, id = 'sc-sg-' + (uid++);
    var mn = Math.min.apply(null, data), mx = Math.max.apply(null, data), span = (mx - mn) || 1;
    var x = function (i) { return i * W / (data.length - 1); };
    var y = function (v) { return P + (H - 2 * P) * (1 - (v - mn) / span); };
    var line = data.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
    el.innerHTML = '<div class="sc-spark__plot"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">'
      + '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s0"/><stop offset="1" class="s1"/></linearGradient></defs>'
      + '<line class="gl" x1="0" x2="' + W + '" y1="' + H / 2 + '" y2="' + H / 2 + '" vector-effect="non-scaling-stroke"/>'
      + '<path d="' + line + ' L' + W + ' ' + H + ' L0 ' + H + ' Z" fill="url(#' + id + ')"/>'
      + '<path class="sl" d="' + line + '" vector-effect="non-scaling-stroke"/></svg>'
      + '<span class="sc-spark__dot" style="top:' + (y(data[data.length - 1]) / H * 100).toFixed(1) + '%"></span></div>';
    return el;
  }

  /* ---------- multi-series line chart ---------- */
  var CATEGORICAL = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)'];
  var MUTES = ['var(--mute-1)', 'var(--mute-2)', 'var(--mute-3)'];
  /* lines(el, legendEl, series, opts) draws the chart once. Call it again on the same element with the same number of
     series and points (new data) and the lines morph from where they are on a spring, the legend values update in place,
     and the reveal does not replay. Options you leave out keep their last value; focus and mode keep the legend's
     current choice unless you pass them. el.scLines holds the live state. */
  function lines(el, legendEl, series, opts) {
    var o = opts || {}, st = el.scLines;
    if (series.length > 4) throw new Error('SoftConsole.lines: four series at most. Group or facet the rest.');
    var n = series[0].data.length;
    var inPlace = !!(st && st.svg && el.contains(st.svg) && st.paths.length === series.length && st.n === n);
    var keep = function (k, def) { return o[k] != null ? o[k] : (inPlace && st[k] != null ? st[k] : def); };
    var mode = keep('mode', 'peers'), max = keep('max', 100), suffix = keep('suffix', '%'), fmt = o.format || (inPlace ? st.fmt : undefined), label = keep('label', 'Line chart');
    var focus = o.focus != null ? o.focus : (inPlace && mode === st.mode ? st.focus : (mode === 'focus' ? 0 : -1));
    var W = 320, H = 120;
    var x = function (i) { return i * W / (n - 1); };
    var y = function (v) { return H * (1 - v / max); };
    var pathOf = function (data) { return data.map(function (v, k) { return (k ? 'L' : 'M') + x(k).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' '); };
    var legendText = function (s) { return fmt ? fmt(s.data[n - 1]) : s.data[n - 1].toFixed(0) + suffix; };
    var yText = function (v) { return fmt ? fmt(v) : +v.toFixed(1) + suffix; };
    if (!inPlace) {
      /* first draw: build the plot and legend once, so the reveal plays once */
      var grid = [0.25, 0.5, 0.75].map(function (f) { return '<line class="gl" x1="0" x2="' + W + '" y1="' + H * f + '" y2="' + H * f + '" vector-effect="non-scaling-stroke"/>'; }).join('');
      var strokes = series.map(function (s) { return '<path class="ln" vector-effect="non-scaling-stroke" d="' + pathOf(s.data) + '"/>'; }).join('');
      var ylab = [max, max / 2, 0].map(function (v, k) { return '<span class="sc-chart__y" style="top:' + k * 50 + '%">' + yText(v) + '</span>'; }).join('');
      el.innerHTML = '<div class="sc-chart__plot"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img">' + grid + strokes + '</svg>' + ylab + '</div>';
      if (st) st.dead = true; // a rebuild retires the old chart's springs
      st = { svg: el.querySelector('svg'), n: n, sp: null, dead: false, quiet: false };
      st.paths = $$('path.ln', st.svg);
      st.ylabs = $$('.sc-chart__y', el);
      st.shown = series.map(function (s) { return s.data.slice(); });
      el.scLines = st;
      if (legendEl) {
        legendEl.innerHTML = series.map(function (s, i) { return '<button type="button" data-i="' + i + '"><i></i>' + s.name + ' <b>' + legendText(s) + '</b></button>'; }).join('');
      }
    } else {
      st.ylabs.forEach(function (e, k) { e.textContent = yText(k === 0 ? max : k === 1 ? max / 2 : 0); });
      if (legendEl) {
        $$('button', legendEl).forEach(function (b, i) {
          b.childNodes[1].textContent = series[i].name + ' ';
          b.querySelector('b').textContent = legendText(series[i]);
        });
      }
    }
    st.svg.setAttribute('aria-label', label);
    st.mode = mode; st.max = max; st.suffix = suffix; st.fmt = fmt; st.label = label; st.focus = focus; st.series = series; st.legendEl = legendEl;
    /* data: each point is its own spring, so a new set arriving mid-morph carries the velocity of every point */
    var paint = function () { st.paths.forEach(function (p, i) { p.setAttribute('d', pathOf(st.shown[i])); }); };
    st.paint = paint;
    if (inPlace) {
      if (reduced() || !window.requestAnimationFrame) {
        st.quiet = true;
        if (st.sp) series.forEach(function (s, i) { s.data.forEach(function (v, k) { st.sp[i][k].snap(v); }); });
        else st.shown = series.map(function (s) { return s.data.slice(); });
        st.quiet = false;
        paint();
      } else {
        if (!st.sp) {
          st.sp = st.shown.map(function (row, i) {
            return row.map(function (v, k) { return spring(v, SPRING_VALUE, max * 5e-4, function (nv) { if (st.dead) return; st.shown[i][k] = nv; if (!st.quiet) afterFrame(st.paint); }); });
          });
        }
        series.forEach(function (s, i) { s.data.forEach(function (v, k) { st.sp[i][k].to(v); }); });
      }
    }
    /* every draw: restack the lines (focus on top) and restyle them and the legend in place */
    st.draw = function () {
      var order = st.series.map(function (s, i) { return i; }).sort(function (a, b) { return (a === st.focus) - (b === st.focus); });
      order.forEach(function (i) {
        st.paths[i].setAttribute('class', 'ln' + (i === st.focus ? ' focus' : ''));
        st.paths[i].style.stroke = colorOf(st.mode, st.focus, i);
        st.svg.appendChild(st.paths[i]);
      });
      if (st.legendEl) {
        $$('button', st.legendEl).forEach(function (b, i) {
          b.setAttribute('aria-pressed', String(i === st.focus));
          b.style.setProperty('--c', colorOf(st.mode, st.focus, i));
        });
      }
    };
    if (legendEl) {
      legendEl.scLines = st; // one handler per legend, reading the live state, so a later call never leaves a stale closure bound
      if (!legendEl.dataset.scBound) {
        legendEl.dataset.scBound = '1';
        legendEl.addEventListener('click', function (e) {
          var b = e.target.closest('button'), live = legendEl.scLines;
          if (!b || !live) return;
          var i = +b.dataset.i;
          live.focus = live.mode === 'focus' ? i : (live.focus === i ? -1 : i);
          live.draw();
        });
      }
    }
    st.draw();
    return el;
  }
  var colorOf = function (mode, focus, i) {
    if (mode === 'peers') return CATEGORICAL[i];
    return i === focus ? 'var(--accent)' : MUTES[(i > focus ? i - 1 : i) % MUTES.length];
  };

  /* ---------- jog wheel ----------
     Dragging tracks the pointer 1:1 from where it was grabbed. Past min or max the ridges stretch against a rubber band
     while the value stays at the limit. Letting go with speed throws the wheel: the release speed over the last 100 ms is
     projected to a resting step and a spring carries the ridges there, so the value counts through each step on the way.
     Grabbing it again stops it where it is. Keys, the wheel and set() move the value at once and the ridges follow on the spring.
     Under reduced motion nothing coasts or stretches: the ridges follow the pointer and settle on the step in place. */
  var RIDGE = 8;          // px period of the ridge pattern (.sc-jog__ridges)
  var JOG_WINDOW = 100;   // ms of pointer history that sets the release speed
  var JOG_FLICK = 200;    // px/s below which a release is not a flick
  var JOG_DECEL = 0.99;   // deceleration per ms for project(): snappy, for a stepped control
  var JOG_BAND = 0.55;    // rubber band stiffness
  var JOG_WHEEL = 40;     // wheel px that make one step; a 100px mouse notch is two steps
  function jog(el, opts) {
    var o = opts || {};
    var min = o.min == null ? 0 : o.min, max = o.max == null ? 100 : o.max, value = o.value == null ? min : o.value;
    var display = o.display || null, digits = o.digits || 3, pxPerStep = o.pxPerStep || 9;
    var ridges = el.querySelector('.sc-jog__ridges');
    if (!ridges) { ridges = document.createElement('div'); ridges.className = 'sc-jog__ridges'; el.appendChild(ridges); }
    el.classList.add('sc-jog');
    el.setAttribute('role', 'slider');
    el.tabIndex = 0;
    el.setAttribute('aria-valuemin', min);
    el.setAttribute('aria-valuemax', max);
    var clamp = function (v) { return Math.max(min, Math.min(max, v)); };
    value = clamp(value);
    /* pos is where the ridges are, in steps: it leaves [min, max] only while stretched. value is the committed step. */
    var pos = value, follow = false, anim = false, drag = null, wheelAcc = 0, wheelAt = 0;
    var paint = function () { ridges.style.backgroundPosition = (((pos * pxPerStep) % RIDGE) + RIDGE) % RIDGE + 'px 0'; };
    var commit = function (next) {
      if (next === value) return;
      value = next;
      if (display) segment(display, String(next), digits);
      el.setAttribute('aria-valuenow', next);
      if (o.valueText) el.setAttribute('aria-valuetext', o.valueText(next));
      el.dispatchEvent(new CustomEvent('sc-change', { detail: { value: value }, bubbles: true }));
    };
    var sp = spring(pos, SPRING_UI, 0.004, function (p) {
      if (!anim) return; // a spring that was stopped by a grab may still deliver one stale frame
      pos = p;
      paint();
      if (follow) commit(clamp(Math.round(p)));
    });
    var animateTo = function (target, v0) {
      if (!anim) { sp.value = pos; sp.velocity = 0; }
      anim = true;
      sp.to(target, v0);
    };
    /* a drag past a limit moves the ridges by the rubber-banded overshoot; unresist is its inverse, for grabbing mid-stretch */
    var dim = function () { return el.clientWidth || 200; };
    var resist = function (raw) {
      if (raw > max) return max + rubberband((raw - max) * pxPerStep, dim(), JOG_BAND) / pxPerStep;
      if (raw < min) return min - rubberband((min - raw) * pxPerStep, dim(), JOG_BAND) / pxPerStep;
      return raw;
    };
    var unresist = function (p) {
      var over = p > max ? p - max : p < min ? min - p : 0;
      if (!over) return p;
      var d = dim(), r = Math.min(over * pxPerStep, d - 1), raw = r * d / (JOG_BAND * (d - r)) / pxPerStep;
      return p > max ? max + raw : min - raw;
    };
    var goto = function (v) {
      follow = false;
      commit(clamp(Math.round(v)));
      animateTo(value);
    };
    var speed = function (pts, at) { // px/s over the last JOG_WINDOW ms, 0 if the pointer had stopped before release
      var a = pts[0], b = pts[pts.length - 1];
      if (pts.length < 2 || at - b.t > 80 || b.t - a.t < 8) return 0;
      return (b.x - a.x) / (b.t - a.t) * 1000;
    };
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      anim = false; // grabbing stops any coasting where it is
      sp.snap(pos);
      if (!follow) { pos = value; paint(); }
      follow = true;
      drag = { id: e.pointerId, x: e.clientX, base: unresist(pos), pts: [{ x: e.clientX, t: e.timeStamp }] };
      el.setPointerCapture(e.pointerId);
      el.classList.add('is-grab');
    });
    el.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var raw = drag.base + (e.clientX - drag.x) / pxPerStep;
      pos = reduced() ? clamp(raw) : resist(raw);
      paint();
      commit(clamp(Math.round(pos)));
      drag.pts.push({ x: e.clientX, t: e.timeStamp });
      while (drag.pts.length > 1 && e.timeStamp - drag.pts[0].t > JOG_WINDOW) drag.pts.shift();
    });
    var end = function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var v = e.type === 'pointerup' && !reduced() ? speed(drag.pts, e.timeStamp) : 0;
      drag = null;
      el.classList.remove('is-grab');
      var flick = Math.abs(v) >= JOG_FLICK;
      var v0 = flick ? v / pxPerStep : 0; // steps/s
      if ((pos > max && v0 > 0) || (pos < min && v0 < 0)) v0 = 0; // already stretched: spring back from where it is
      follow = true;
      animateTo(clamp(Math.round(pos + (flick ? project(v, JOG_DECEL) / pxPerStep : 0))), v0);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('wheel', function (e) {
      e.preventDefault();
      if (drag) return;
      var unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? 320 : 1; // lines and pages to px
      var d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : -e.deltaY) * unit;
      if (e.timeStamp - wheelAt > 250 || d * wheelAcc < 0) wheelAcc = 0; // a pause or a turn around starts over
      wheelAt = e.timeStamp;
      wheelAcc += d;
      var n = (wheelAcc / JOG_WHEEL) | 0;
      if (!n) return;
      wheelAcc -= n * JOG_WHEEL;
      goto(value + n);
    }, { passive: false });
    el.addEventListener('keydown', function (e) {
      var map = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 5, PageDown: -5 };
      if (e.key === 'Home') { e.preventDefault(); goto(min); return; }
      if (e.key === 'End') { e.preventDefault(); goto(max); return; }
      if (map[e.key] === undefined) return;
      e.preventDefault();
      goto(value + map[e.key]);
    });
    if (display) segment(display, String(value), digits);
    el.setAttribute('aria-valuenow', value);
    if (o.valueText) el.setAttribute('aria-valuetext', o.valueText(value));
    paint();
    return { get value() { return value; }, set: function (v) { goto(v); } };
  }

  /* ---------- scroll edge fades: where CSS scroll-driven animations exist (soft-console.css) they fade the edges alone;
     elsewhere a scroll listener marks the edges that have content out of sight. Returns its measure function, or null. ---------- */
  var SCROLL_FADE = !(window.CSS && CSS.supports && CSS.supports('animation-timeline', 'scroll()'));
  function edgeFade(el, vertical) {
    if (!SCROLL_FADE) return null;
    if (el.scEdgeFade) return el.scEdgeFade;
    var measure = function () {
      var at = vertical ? el.scrollTop : el.scrollLeft, room = vertical ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;
      el.classList.toggle('has-fade-start', at > 1);
      el.classList.toggle('has-fade-end', room - at > 1);
    };
    el.addEventListener('scroll', measure, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(measure).observe(el); else window.addEventListener('resize', measure);
    measure();
    return (el.scEdgeFade = measure);
  }

  /* ---------- select: a styled listbox over a native <select> ---------- */
  var selectSeq = 0;
  function select(native) {
    if (!native || native.tagName !== 'SELECT') throw new Error('SoftConsole.select needs a <select> element');
    if (native.dataset.scBound) return native.scSelect;
    native.dataset.scBound = '1';
    var field = native.closest('.sc-field') || native.parentNode;
    var id = 'sc-select-' + (selectSeq++);
    var label = native.getAttribute('aria-label') || (native.labels && native.labels[0] ? native.labels[0].textContent.trim() : '');
    field.classList.add('sc-select');
    native.classList.add('sc-select__native');
    native.tabIndex = -1;
    $$('[data-sc-icon="chevron"]', field).forEach(function (el) { el.remove(); });

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'sc-select__trigger';
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', id);
    trigger.disabled = native.disabled;
    trigger.innerHTML = '<span class="sc-select__value"></span><svg class="sc-ic sc-select__chev" aria-hidden="true"><use href="#sc-i-chevron"/></svg>';
    var list = document.createElement('ul');
    list.className = 'sc-select__list';
    list.id = id;
    list.setAttribute('role', 'listbox');
    if (label) list.setAttribute('aria-label', label);
    list.hidden = true;
    field.insertBefore(trigger, native);
    field.appendChild(list);
    var fade = edgeFade(list, true);

    var opts = [], active = -1, typed = '', typedAt = 0;
    function add(o) {
      var li = document.createElement('li');
      li.className = 'sc-select__option';
      li.id = id + '-' + opts.length;
      li.setAttribute('role', 'option');
      li.dataset.index = opts.length;
      li.textContent = o.textContent;
      if (o.disabled) li.setAttribute('aria-disabled', 'true');
      list.appendChild(li);
      opts.push({ el: li, opt: o });
    }
    function build() {
      list.innerHTML = '';
      opts = [];
      Array.prototype.forEach.call(native.children, function (child) {
        if (child.tagName !== 'OPTGROUP') { add(child); return; }
        var g = document.createElement('li');
        g.className = 'sc-select__group';
        g.setAttribute('role', 'presentation');
        g.textContent = child.label;
        list.appendChild(g);
        Array.prototype.forEach.call(child.children, add);
      });
    }
    function sync() {
      var sel = native.selectedIndex;
      opts.forEach(function (x, i) { x.el.setAttribute('aria-selected', String(i === sel)); });
      var text = sel >= 0 ? native.options[sel].textContent : '';
      trigger.firstChild.textContent = text;
      trigger.setAttribute('aria-label', (label ? label + ': ' : '') + text);
      trigger.disabled = native.disabled;
    }
    function setActive(i) {
      if (opts[active]) opts[active].el.classList.remove('is-active');
      active = i;
      if (!opts[i]) { trigger.removeAttribute('aria-activedescendant'); return; }
      var el = opts[i].el;
      el.classList.add('is-active');
      trigger.setAttribute('aria-activedescendant', el.id);
      if (el.offsetTop < list.scrollTop) list.scrollTop = el.offsetTop - 5;
      else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight + 5;
    }
    function move(from, step) {
      for (var i = from + step; i >= 0 && i < opts.length; i += step) { if (!opts[i].opt.disabled) return i; }
      return from;
    }
    function outside(e) { if (!field.contains(e.target)) close(); }
    /* is-open is the open state: the list pops out of the field on a transition, and closing reverses it from
       wherever it is. The list stays unhidden until the way back has finished (is-up stays too, so it sinks toward the field). */
    var opened = function () { return field.classList.contains('is-open'); }, hideTimer = 0;
    function settle() {
      clearTimeout(hideTimer);
      if (opened()) return;
      list.hidden = true;
      field.classList.remove('is-up');
    }
    list.addEventListener('transitionend', function (e) { if (e.target === list && e.propertyName === 'opacity') settle(); });
    function open() {
      if (trigger.disabled || opened()) return;
      clearTimeout(hideTimer);
      if (list.hidden) {
        list.hidden = false;
        if (fade) fade();
        var rect = field.getBoundingClientRect(), below = window.innerHeight - rect.bottom, cap = parseFloat(getComputedStyle(list).maxHeight) || 280; // max-height is in rem
        field.classList.toggle('is-up', below < Math.min(list.scrollHeight, cap) + 12 && rect.top > below);
        void list.offsetWidth; // the closed state must be on screen once, so the pop has somewhere to start
      }
      field.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      setActive(native.selectedIndex >= 0 ? native.selectedIndex : move(-1, 1));
      document.addEventListener('pointerdown', outside, true);
    }
    function close() {
      if (!opened()) return;
      field.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      setActive(-1);
      document.removeEventListener('pointerdown', outside, true);
      if (fadeIdle(list)) settle();
      else hideTimer = setTimeout(settle, 400 * timeScale()); // transitionend normally hides it; this is the net
    }
    function choose(i) {
      if (!opts[i] || opts[i].opt.disabled) return;
      var changed = native.selectedIndex !== i;
      native.selectedIndex = i;
      sync();
      close();
      trigger.focus();
      if (changed) native.dispatchEvent(new Event('change', { bubbles: true }));
    }
    function typeahead(key, isOpen) {
      var now = Date.now();
      typed = (now - typedAt > 600 ? '' : typed) + key.toLowerCase();
      typedAt = now;
      var start = isOpen ? active : native.selectedIndex, n = opts.length;
      for (var k = 0; k < n; k++) {
        var i = ((start < 0 ? 0 : start) + k + (typed.length > 1 ? 0 : 1)) % n;
        if (!opts[i].opt.disabled && opts[i].el.textContent.toLowerCase().indexOf(typed) === 0) {
          if (isOpen) setActive(i); else choose(i);
          return;
        }
      }
    }

    trigger.addEventListener('click', function () { if (opened()) close(); else open(); });
    trigger.addEventListener('keydown', function (e) {
      var isOpen = field.classList.contains('is-open');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) open(); else setActive(move(active, e.key === 'ArrowDown' ? 1 : -1));
      } else if ((e.key === 'Home' || e.key === 'End') && isOpen) {
        e.preventDefault();
        setActive(e.key === 'Home' ? move(-1, 1) : move(opts.length, -1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isOpen) choose(active); else open();
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      } else if (e.key === 'Tab' && isOpen) {
        choose(active);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        typeahead(e.key, isOpen);
      }
    });
    list.addEventListener('pointerdown', function (e) { e.preventDefault(); });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('.sc-select__option');
      if (li) choose(+li.dataset.index);
    });
    list.addEventListener('pointermove', function (e) {
      var li = e.target.closest('.sc-select__option');
      if (li && +li.dataset.index !== active && li.getAttribute('aria-disabled') !== 'true') setActive(+li.dataset.index);
    });
    native.addEventListener('focus', function () { trigger.focus(); });
    native.addEventListener('change', sync);

    build();
    sync();
    native.scSelect = { open: open, close: close, refresh: function () { build(); sync(); if (fade) fade(); } };
    return native.scSelect;
  }

  /* ---------- media: waveform and player ----------
     wave(el, peaks, progress): draws an audio clip in a .sc-wave as fixed 3px bars with 2px gaps on whole
     pixels, as many as the width holds, each the loudest of the peaks (0 to 1) it covers. It redraws when the
     element resizes. Returns { set(progress), peaks(list) }. */
  var WAVE_STEP = 5; // bar plus gap, in px
  function wave(el, peaks, progress) {
    if (el.scWave) { el.scWave.peaks(peaks); el.scWave.set(progress); return el.scWave; }
    var bars = el.querySelector('.sc-wave__bars'), head = el.querySelector('.sc-wave__head');
    if (!bars) { bars = document.createElement('div'); bars.className = 'sc-wave__bars'; el.insertBefore(bars, el.firstChild); }
    if (!head) { head = document.createElement('span'); head.className = 'sc-wave__head'; bars.insertAdjacentElement('afterend', head); }
    bars.setAttribute('aria-hidden', 'true');
    var data = peaks || [], p = 0, n = 0;
    function set(v) {
      p = Math.min(1, Math.max(0, +v || 0));
      Array.prototype.forEach.call(bars.children, function (b, i) { b.classList.toggle('on', (i + 0.5) / n < p); });
      head.style.left = (p * Math.max(0, n * WAVE_STEP - 2)).toFixed(1) + 'px';
    }
    function draw(force) {
      var next = Math.max(1, Math.floor((el.clientWidth + 2) / WAVE_STEP));
      if (next === n && !force) return;
      n = next;
      var html = '';
      for (var i = 0; i < n; i++) {
        var a = Math.floor(i * data.length / n), b = Math.max(a + 1, Math.floor((i + 1) * data.length / n)), v = 0;
        for (var k = a; k < b && k < data.length; k++) v = Math.max(v, +data[k] || 0);
        html += '<i style="height:' + Math.round(18 + 82 * Math.min(1, v)) + '%"></i>';
      }
      bars.innerHTML = html;
      set(p);
    }
    if (window.ResizeObserver) new ResizeObserver(function () { draw(false); }).observe(el);
    p = progress || 0;
    draw(true);
    el.scWave = { set: set, peaks: function (d) { data = d || []; draw(true); } };
    return el.scWave;
  }

  /* player(row, media): wires a .sc-player to an <audio> or <video>. The row holds a [data-sc-play] button,
     a seek (input.sc-seek, or a .sc-wave holding a range input and data-sc-wave peaks), a .sc-time and,
     optionally, a [data-sc-mute] button. Play and mute latch pressed while on. */
  var clock = function (s) {
    if (!isFinite(s)) return '—';
    var v = Math.max(0, Math.floor(s)), m = Math.floor(v / 60), x = v % 60;
    return (m < 10 ? '0' : '') + m + ':' + (x < 10 ? '0' : '') + x;
  };
  function player(row, media) {
    if (!row || !media || !('paused' in media)) throw new Error('SoftConsole.player needs a .sc-player and an <audio> or <video> element');
    if (row.scPlayer) return row.scPlayer;
    var play = row.querySelector('[data-sc-play]'), mute = row.querySelector('[data-sc-mute]'), time = row.querySelector('.sc-time');
    var waveEl = row.querySelector('.sc-wave');
    var seek = waveEl ? waveEl.querySelector('input[type="range"]') : row.querySelector('input.sc-seek');
    var w = waveEl ? wave(waveEl, list(waveEl.getAttribute('data-sc-wave')).map(Number), 0) : null;
    var dragging = false, frame = 0;
    function state() {
      if (play) { play.setAttribute('aria-pressed', String(!media.paused)); play.innerHTML = icon(media.paused ? 'play' : 'pause'); }
      if (mute) { mute.setAttribute('aria-pressed', String(media.muted)); mute.innerHTML = icon(media.muted ? 'muted' : 'volume'); }
    }
    function progress() {
      var d = media.duration, t = media.currentTime, ok = isFinite(d) && d > 0, p = ok ? t / d : 0;
      if (seek) {
        seek.max = ok ? d : 0;
        if (!dragging) seek.value = t;
        seek.setAttribute('aria-valuetext', clock(t) + ' of ' + clock(d));
        seek.style.setProperty('--pct', (p * 100) + '%');
      }
      if (w) w.set(p);
      if (time) time.innerHTML = esc(clock(t)) + ' <span>/ ' + esc(clock(d)) + '</span>';
    }
    function tick() { progress(); frame = media.paused ? 0 : requestAnimationFrame(tick); }
    if (play) play.addEventListener('click', function () {
      if (!media.paused) { media.pause(); return; }
      var started = media.play();
      // a failed start (no source, blocked autoplay) leaves the media paused; show that, and log why
      if (started && started.catch) started.catch(function (err) { state(); if (window.console) console.warn('SoftConsole.player: playback did not start', err); });
    });
    if (mute) mute.addEventListener('click', function () { media.muted = !media.muted; });
    if (seek) {
      seek.min = 0;
      seek.step = 'any';
      seek.addEventListener('pointerdown', function () { dragging = true; });
      ['pointerup', 'pointercancel', 'change'].forEach(function (ev) { seek.addEventListener(ev, function () { dragging = false; }); });
      seek.addEventListener('input', function () { media.currentTime = +seek.value; progress(); });
    }
    media.addEventListener('play', function () { state(); if (!frame) tick(); });
    ['pause', 'ended', 'volumechange'].forEach(function (ev) { media.addEventListener(ev, state); });
    ['timeupdate', 'durationchange', 'loadedmetadata', 'seeked', 'emptied'].forEach(function (ev) { media.addEventListener(ev, progress); });
    state();
    progress();
    row.scPlayer = { media: media, play: function () { return media.play(); }, pause: function () { media.pause(); } };
    return row.scPlayer;
  }

  /* true when no opacity transition is running on el: nothing will fire transitionend, so a closed overlay can hide at once */
  var fadeIdle = function (el) { return !!el.getAnimations && !el.getAnimations().some(function (a) { return a.transitionProperty === 'opacity'; }); };

  /* ---------- dialog: modal over a scrim. Traps focus, closes on Escape, a scrim click or
     [data-sc-close], and returns focus to the opener. It opens and closes on transitions (class is-open on the scrim):
     the box rises and the scrim fades in; closing sinks the box back and fades the scrim, and the scrim is hidden once
     that has finished. Open or close mid-way and it reverses from where it is. sc-close fires when closing starts.
     A lightbox opened from a button.sc-frame grows out of the thumbnail instead (View Transitions), and shrinks back into it. ---------- */
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function dialog(scrim) {
    if (!scrim || !scrim.classList.contains('sc-scrim')) throw new Error('SoftConsole.dialog needs a .sc-scrim element');
    if (scrim.scDialog) return scrim.scDialog;
    var box = scrim.querySelector('.sc-dialog, .sc-lightbox') || scrim, opener = null;
    if (!box.hasAttribute('role')) box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    if (!box.hasAttribute('tabindex')) box.tabIndex = -1;
    var focusables = function () { return $$(FOCUSABLE, box).filter(function (el) { return el.getClientRects().length > 0; }); };
    function onKey(e) {
      if (e.defaultPrevented) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables(), first = f[0], last = f[f.length - 1], at = document.activeElement;
      if (!f.length) { e.preventDefault(); box.focus(); }
      else if (e.shiftKey && (at === first || !box.contains(at) || at === box)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (at === last || !box.contains(at))) { e.preventDefault(); first.focus(); }
    }
    var opened = !scrim.hidden, hideTimer = 0, vtSeq = 0, VT = 'sc-lightbox';
    var lbFrame = box.classList.contains('sc-lightbox') ? box.querySelector('.sc-frame') : null;
    scrim.classList.add('is-fx');
    if (opened) scrim.classList.add('is-open');
    /* the thumbnail media a lightbox can grow out of: only from a button.sc-frame, only where View Transitions exist, never under reduced motion */
    function thumbOf(from) {
      if (!document.startViewTransition || reduced() || !lbFrame || !from || from.tagName !== 'BUTTON' || !from.classList.contains('sc-frame')) return null;
      return from.querySelector('img, video');
    }
    function morph(thumb, enter) {
      var seq = ++vtSeq;
      var done = function () { // only the newest transition cleans up, so an interrupted one never strips a later one's names
        if (seq !== vtSeq) return;
        thumb.style.viewTransitionName = '';
        lbFrame.style.viewTransitionName = '';
        scrim.classList.remove('is-vt');
      };
      scrim.classList.add('is-vt'); // the view transition does the fading; the CSS transitions step aside
      if (enter) thumb.style.viewTransitionName = VT; else lbFrame.style.viewTransitionName = VT;
      document.startViewTransition(function () {
        thumb.style.viewTransitionName = '';
        lbFrame.style.viewTransitionName = '';
        if (enter) {
          if (!opened) return;
          lbFrame.style.viewTransitionName = VT;
          scrim.hidden = false;
          scrim.classList.add('is-open');
          focusIn();
        } else {
          if (opened) return; // reopened before the page updated
          scrim.classList.remove('is-open');
          scrim.hidden = true;
          thumb.style.viewTransitionName = VT;
        }
      }).finished.then(done, done);
    }
    function focusIn() { (box.querySelector('[autofocus]') || focusables()[0] || box).focus(); }
    function settle() { // after the way back: hide, unless it was opened again meanwhile
      clearTimeout(hideTimer);
      if (!opened) scrim.hidden = true;
    }
    scrim.addEventListener('transitionend', function (e) { if (e.target === scrim && e.propertyName === 'opacity') settle(); });
    function open(from) {
      if (opened) return;
      opened = true;
      opener = from || document.activeElement;
      clearTimeout(hideTimer);
      document.addEventListener('keydown', onKey);
      var thumb = thumbOf(opener);
      if (thumb && scrim.hidden) { morph(thumb, true); return; }
      if (scrim.hidden) { scrim.hidden = false; void scrim.offsetWidth; } // let the closed state paint once, so the rise has somewhere to start
      scrim.classList.add('is-open');
      focusIn();
    }
    function close() {
      if (!opened) return;
      opened = false;
      $$('audio, video', box).forEach(function (m) { m.pause(); }); // a closed lightbox never keeps playing
      document.removeEventListener('keydown', onKey);
      if (opener && opener.focus) opener.focus();
      var thumb = scrim.hidden ? null : thumbOf(opener);
      if (thumb) morph(thumb, false);
      else {
        scrim.classList.remove('is-open');
        if (fadeIdle(scrim)) settle(); // it never got going (closed in the frame it opened): no fade to wait for
        else hideTimer = setTimeout(settle, 400 * timeScale()); // transitionend normally hides it; this is the net
      }
      scrim.dispatchEvent(new CustomEvent('sc-close', { bubbles: true }));
    }
    scrim.addEventListener('click', function (e) { if (e.target === scrim || e.target.closest('[data-sc-close]')) close(); });
    scrim.scDialog = { open: open, close: close, get isOpen() { return opened; } };
    return scrim.scDialog;
  }

  /* ---------- toast: a transient confirmation, bottom center ----------
     toast(message, opts) -> { dismiss() }. One toast at a time: a new call while one shows swaps its content in place and restarts the timer.
     opts: action { label, onAction } (one ghost button, e.g. Undo: it runs onAction, then dismisses),
           duration (ms; default 4000, 6000 with an action), led ('ok' default, 'warn', 'crit', 'info', or false for none).
     The toast is a polite live region. It waits while the pointer is over it or focus is inside it; Escape inside it dismisses.
     It enters and leaves on transitions (is-open), so dismissing or replacing it mid-motion reverses from where it is. */
  var TOAST_LEDS = ['ok', 'warn', 'crit', 'info'], toastCur = null;
  function toastArm(t) { // (re)start the dismiss timer, unless the pointer or focus is on the toast
    clearTimeout(t.timer);
    t.running = false;
    if (t.hover || t.focus || !t.open) return;
    t.running = true;
    t.at = performance.now();
    t.timer = setTimeout(function () { toastClose(t); }, t.left);
  }
  function toastHold(t) { // pause, keeping what is left (at least 1.5 s once it resumes)
    if (!t.running) return;
    clearTimeout(t.timer);
    t.running = false;
    t.left = Math.max(1500, t.left - (performance.now() - t.at));
  }
  function toastRemove(t) {
    if (t.open) return;
    clearTimeout(t.rm);
    t.el.remove();
    if (toastCur === t) toastCur = null;
  }
  function toastClose(t) {
    if (!t.open) { if (!t.shown) { t.seq++; toastRemove(t); } return; } // already leaving, or dismissed before it was ever filled
    t.seq++;
    t.open = false;
    clearTimeout(t.timer);
    t.running = false;
    if (t.el.contains(document.activeElement) && t.back && t.back.isConnected) t.back.focus(); // focus goes back to where it came from
    t.el.classList.remove('is-open');
    if (fadeIdle(t.el)) toastRemove(t);
    else t.rm = setTimeout(function () { toastRemove(t); }, 600 * timeScale()); // transitionend normally removes it; this is the net
  }
  function toastMake() {
    var el = document.createElement('div'), t = { el: el, seq: 0, open: false, shown: false, hover: false, focus: false, running: false, left: 0, at: 0, timer: 0, rm: 0, back: null };
    el.className = 'sc-toast sc-raised-2 is-fx';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    el.addEventListener('mouseenter', function () { t.hover = true; toastHold(t); });
    el.addEventListener('mouseleave', function () { t.hover = false; toastArm(t); });
    el.addEventListener('focusin', function (e) {
      if (e.relatedTarget && !el.contains(e.relatedTarget)) t.back = e.relatedTarget;
      t.focus = true;
      toastHold(t);
    });
    el.addEventListener('focusout', function (e) {
      if (e.relatedTarget && el.contains(e.relatedTarget)) return;
      t.focus = false;
      toastArm(t);
    });
    el.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); toastClose(t); } });
    el.addEventListener('transitionend', function (e) { if (e.target === el && e.propertyName === 'opacity') toastRemove(t); });
    document.body.appendChild(el);
    return t;
  }
  function toast(message, opts) {
    var o = opts || {}, act = o.action && o.action.label ? o.action : null, led = o.led === undefined ? 'ok' : o.led;
    if (led && TOAST_LEDS.indexOf(led) < 0) throw new Error('Unknown toast led "' + led + '". Use one of: ' + TOAST_LEDS.join(', ') + ', or false for none');
    var t = toastCur, fresh = !t;
    if (!t) t = toastCur = toastMake();
    var seq = ++t.seq;
    clearTimeout(t.rm);
    clearTimeout(t.timer);
    t.running = false;
    t.left = o.duration > 0 ? o.duration : act ? 6000 : 4000;
    var fill = function () {
      if (t.seq !== seq) return; // dismissed or replaced meanwhile
      var had = t.el.contains(document.activeElement);
      t.el.innerHTML = (led ? '<span class="sc-led sc-led--' + led + '"></span>' : '') + '<span class="sc-toast__text">' + esc(message) + '</span>';
      t.el.classList.toggle('sc-toast--action', !!act);
      var b = null;
      if (act) {
        b = document.createElement('button');
        b.type = 'button';
        b.className = 'sc-btn sc-btn--sm sc-btn--ghost';
        b.innerHTML = '<span>' + esc(act.label) + '</span>';
        b.addEventListener('click', function () {
          if (t.seq !== seq) return;
          try { if (act.onAction) act.onAction(); } finally { if (t.seq === seq) toastClose(t); } // onAction may show a toast of its own: that one stays
        });
        t.el.appendChild(b);
      }
      if (had && b) b.focus();
      else if (had && t.back && t.back.isConnected) t.back.focus();
      t.open = t.shown = true;
      t.el.classList.add('is-open');
      toastArm(t);
    };
    if (fresh) setTimeout(fill, 30); // the live region exists empty first, so assistive tech announces what is put into it
    else fill();
    return { dismiss: function () { if (t.seq === seq) toastClose(t); } };
  }

  /* ---------- icons: outline, 24px grid, 1.8 stroke ---------- */
  var ICONS = {
    home: '<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
    chart: '<path d="M5 20v-8M10 20V5M15 20v-6M20 20V9"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    gear: '<path d="M9.95 5.31L10.53 2.72L13.47 2.72L14.05 5.31L15.29 5.82L17.53 4.4L19.6 6.47L18.18 8.71L18.69 9.95L21.28 10.53L21.28 13.47L18.69 14.05L18.18 15.29L19.6 17.53L17.53 19.6L15.29 18.18L14.05 18.69L13.47 21.28L10.53 21.28L9.95 18.69L8.71 18.18L6.47 19.6L4.4 17.53L5.82 15.29L5.31 14.05L2.72 13.47L2.72 10.53L5.31 9.95L5.82 8.71L4.4 6.47L6.47 4.4L8.71 5.82Z"/><circle cx="12" cy="12" r="3"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
    power: '<path d="M12 3v8"/><path d="M7 6.5a7.5 7.5 0 1 0 10 0"/>',
    refresh: '<path d="M19 12a7 7 0 1 1-2.05-4.95"/><path d="M19 4v4h-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    chevron: '<path d="m7 10 5 5 5-5"/>',
    'chevron-right': '<path d="m10 7 5 5-5 5"/>',
    info: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8h.01"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
    server: '<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/><path d="M8 7.5h.01M8 16.5h.01"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    moon: '<path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a6.6 6.6 0 0 0 9.7 9.7Z"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8.5 20h7M12 16v4"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z"/>',
    pause: '<path d="M9 5.5v13M15 5.5v13"/>',
    volume: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    muted: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  };
  function mountIcons() {
    if (document.getElementById('sc-icons')) return;
    var sprite = '<svg id="sc-icons" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>'
      + Object.keys(ICONS).map(function (k) { return '<symbol id="sc-i-' + k + '" viewBox="0 0 24 24">' + ICONS[k] + '</symbol>'; }).join('')
      + '</defs></svg>';
    document.body.insertAdjacentHTML('afterbegin', sprite);
  }
  function icon(name) {
    if (!ICONS[name]) throw new Error('Unknown Soft Console icon "' + name + '"');
    return '<svg class="sc-ic" aria-hidden="true"><use href="#sc-i-' + name + '"/></svg>';
  }

  /* ---------- declarative wiring ---------- */
  var num = function (v, fallback) { var n = parseFloat(v); return isNaN(n) ? fallback : n; };
  var list = function (v) { return String(v || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean); };
  var touchWired = false;
  var SWITCH_SLOP = 6, SWITCH_FLICK = 200, SWITCH_PAD = 3, SWITCH_KNOB = 22; // px, px/s, then the knob's inset and width in soft-console.css
  function init(root, opts) {
    var r = root || document, o = opts || {};
    mountIcons();
    if (!touchWired) { touchWired = true; document.addEventListener('touchstart', function () {}, { passive: true }); } // iOS Safari applies :active only once a touchstart listener exists
    $$('[data-sc-icon]', r).forEach(function (el) { el.innerHTML = icon(el.getAttribute('data-sc-icon')); });
    $$('[data-sc-single]', r).forEach(function (group) {
      if (group.dataset.scBound) return;
      group.dataset.scBound = '1';
      group.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b || !group.contains(b)) return;
        $$('button', group).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        group.dispatchEvent(new CustomEvent('sc-change', { detail: { value: b.value || b.textContent.trim() }, bubbles: true }));
      });
    });
    $$('[data-sc-toggle]', r).forEach(function (b) {
      if (b.dataset.scBound) return;
      b.dataset.scBound = '1';
      b.addEventListener('click', function () { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); });
    });
    $$('.sc-switch', r).forEach(function (t) {
      if (t.dataset.scBound) return;
      t.dataset.scBound = '1';
      var drag = null, spent = false; // spent: a drag just ended, so the click that follows it must not toggle again
      t.addEventListener('click', function (e) {
        if (spent) { spent = false; e.stopImmediatePropagation(); e.preventDefault(); return; }
        t.setAttribute('aria-checked', String(t.getAttribute('aria-checked') !== 'true'));
      });
      /* a press stretches the knob (CSS); moving past SWITCH_SLOP drags it 1:1 along the track, and letting go picks the
         side: by release speed if it is fast, else by which half the knob is in. A drag ends in one real click, so listeners see one change. */
      t.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        spent = false;
        drag = { id: e.pointerId, x: e.clientX, on: t.getAttribute('aria-checked') === 'true', live: false, pts: [{ x: e.clientX, t: e.timeStamp }] };
      });
      t.addEventListener('pointermove', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        if (!drag.live) {
          if (Math.abs(e.clientX - drag.x) <= SWITCH_SLOP) return;
          drag.live = true;
          drag.x = e.clientX; // the knob picks up under the pointer, with no jump
          t.setPointerCapture(e.pointerId);
          t.classList.add('is-drag');
          drag.span = t.clientWidth - 2 * SWITCH_PAD - SWITCH_KNOB - (parseFloat(getComputedStyle(t).getPropertyValue('--sc-stretch')) || 0);
          drag.from = drag.on ? drag.span : 0;
        }
        drag.at = Math.max(0, Math.min(drag.span, drag.from + e.clientX - drag.x));
        t.style.setProperty('--sc-drag', drag.at + 'px');
        t.setAttribute('data-lean', drag.at > drag.span / 2 ? 'on' : 'off');
        drag.pts.push({ x: e.clientX, t: e.timeStamp });
        while (drag.pts.length > 1 && e.timeStamp - drag.pts[0].t > 100) drag.pts.shift();
      });
      var finish = function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        var d = drag;
        drag = null;
        if (!d.live) return;
        t.classList.remove('is-drag');
        t.removeAttribute('data-lean');
        t.style.removeProperty('--sc-drag');
        var a = d.pts[0], b = d.pts[d.pts.length - 1], v = d.pts.length > 1 && e.timeStamp - b.t <= 80 && b.t - a.t >= 8 ? (b.x - a.x) / (b.t - a.t) * 1000 : 0;
        var on = e.type === 'pointercancel' ? d.on : Math.abs(v) >= SWITCH_FLICK ? v > 0 : d.at > d.span / 2;
        if (on !== d.on) t.click();
        if (e.type === 'pointerup') { spent = true; setTimeout(function () { spent = false; }, 500); }
      };
      t.addEventListener('pointerup', finish);
      t.addEventListener('pointercancel', finish);
    });
    $$('input.sc-range', r).forEach(function (el) {
      var out = el.id ? r.querySelector('output[for="' + el.id + '"]') : null;
      var fmt = el.dataset.format || '{v}';
      var sync = function () {
        el.style.setProperty('--pct', ((el.value - el.min) / (el.max - el.min) * 100) + '%');
        if (out) out.textContent = fmt.replace('{v}', el.value);
      };
      if (!el.dataset.scBound) { el.dataset.scBound = '1'; el.addEventListener('input', sync); }
      sync();
    });
    $$('input.sc-seek', r).forEach(function (el) {
      if (el.closest('[data-sc-player]')) return; // a wired player keeps its own seek in sync
      el.style.setProperty('--pct', ((el.value - (el.min || 0)) / ((el.max || 100) - (el.min || 0)) * 100) + '%');
    });
    $$('.sc-wave[data-sc-wave]', r).forEach(function (el) {
      if (!el.closest('[data-sc-player]')) wave(el, list(el.getAttribute('data-sc-wave')).map(Number), num(el.dataset.progress, 0));
    });
    $$('[data-sc-player]', r).forEach(function (row) {
      var media = document.querySelector(row.getAttribute('data-sc-player'));
      if (!media) throw new Error('SoftConsole.init: no media element matches data-sc-player="' + row.getAttribute('data-sc-player') + '"');
      player(row, media);
    });
    $$('.sc-field select', r).forEach(select);
    $$('.sc-table-wrap', r).forEach(function (el) { edgeFade(el, false); });
    $$('.sc-code', r).forEach(function (el) { edgeFade(el, true); });
    $$('[data-sc-dialog]', r).forEach(function (b) {
      if (b.dataset.scBound) return;
      b.dataset.scBound = '1';
      b.addEventListener('click', function () { dialog(document.querySelector(b.getAttribute('data-sc-dialog'))).open(b); });
    });
    $$('[data-sc-seg]', r).forEach(function (el) { segment(el, el.getAttribute('data-sc-seg'), num(el.dataset.digits, 0)); });
    $$('[data-sc-gauge]', r).forEach(function (el) {
      gauge(el, num(el.getAttribute('data-sc-gauge'), 0), { min: num(el.dataset.min, 0), max: num(el.dataset.max, 100), unit: el.dataset.unit, label: el.dataset.label });
    });
    $$('[data-sc-spark]', r).forEach(function (el) { spark(el, list(el.getAttribute('data-sc-spark')).map(Number)); });
    $$('[data-sc-segbars]', r).forEach(function (el) {
      var d = el.dataset, unit = d.unit || '';
      segbars(el, list(el.getAttribute('data-sc-segbars')).map(Number), { labels: d.labels ? list(d.labels) : null, names: d.names ? list(d.names) : null, format: function (v) { return { text: String(+v.toFixed(2)), unit: unit }; }, max: num(d.max, 0), levels: num(d.levels, 0), digits: num(d.digits, 0), maxLabels: num(d.maxLabels, 0), label: d.label, totalLabel: d.totalLabel, stateLabel: d.stateLabel });
    });
    $$('[data-sc-jog]', r).forEach(function (el) {
      if (el.dataset.scBound) return;
      el.dataset.scBound = '1';
      var display = el.dataset.display ? r.querySelector(el.dataset.display) : null;
      var unit = el.dataset.unit || '';
      jog(el, { min: num(el.dataset.min, 0), max: num(el.dataset.max, 100), value: num(el.dataset.value, 0), display: display, digits: num(el.dataset.digits, 3), valueText: function (v) { return v + (unit ? ' ' + unit : ''); } });
    });
    $$('[data-sc-count]', r).forEach(function (el) { countUp(el, num(el.getAttribute('data-sc-count'), 0), num(el.dataset.dec, 0)); });
    if (o.enter && !reduced()) {
      $$('.sc-panel, .sc-kpi', r).forEach(function (el, i) { el.classList.add('sc-enter'); el.style.animationDelay = ((i % 6) * 60) + 'ms'; });
    }
    return r;
  }

  window.SoftConsole = {
    version: '2.2.0',
    themes: THEMES.slice(),
    modes: MODES.slice(),
    init: init,
    setTheme: setTheme,
    setMode: setMode,
    setDensity: setDensity,
    segment: segment,
    segbars: segbars,
    niceMax: niceMax,
    gauge: gauge,
    spark: spark,
    lines: lines,
    jog: jog,
    select: select,
    dialog: dialog,
    toast: toast,
    timeScale: 1, // motion multiplier for the spring loop: 1 is normal, 10 is ten times slower (for reviewing motion)
    wave: wave,
    player: player,
    countUp: countUp,
    icon: icon,
    mountIcons: mountIcons,
  };
})();
