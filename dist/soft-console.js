/* @ds-bundle: {"format":4,"namespace":"SoftConsole","components":[{"name":"Surface"},{"name":"Panel"},{"name":"Button"},{"name":"IconButton"},{"name":"SegmentedControl"},{"name":"Switch"},{"name":"Check"},{"name":"Slider"},{"name":"Field"},{"name":"JogWheel"},{"name":"StatusChip"},{"name":"AlertList"},{"name":"SegmentDisplay"},{"name":"DialGauge"},{"name":"Meter"},{"name":"KpiTile"},{"name":"BarChart"},{"name":"LineChart"},{"name":"DataTable"}]} */
/* Soft Console helpers. Plain script, no dependencies. Exposes window.SoftConsole.
   Markup and styling live in bundle.css; this file draws the instruments and wires interactions. */
(function () {
  'use strict';

  var THEMES = ['graphite-teal', 'carbon-cyan', 'basalt-lime'];
  var reduced = function () { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var uid = 0;

  /* ---------- preferences ---------- */
  function setTheme(id) {
    if (THEMES.indexOf(id) < 0) throw new Error('Unknown Soft Console palette "' + id + '". Use one of: ' + THEMES.join(', '));
    document.documentElement.setAttribute('data-theme', id);
    return id;
  }
  function setDensity(mode) {
    if (mode !== 'comfortable' && mode !== 'compact') throw new Error('Density must be "comfortable" or "compact"');
    if (mode === 'compact') document.documentElement.setAttribute('data-density', 'compact');
    else document.documentElement.removeAttribute('data-density');
    return mode;
  }

  /* ---------- tween for value motion ---------- */
  function tween(from, to, dur, onFrame) {
    if (reduced() || !window.requestAnimationFrame) { onFrame(to); return; }
    var t0 = performance.now();
    var step = function (now) {
      var p = Math.min(1, (now - t0) / dur);
      onFrame(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function countUp(el, to, decimals) {
    var dec = decimals || 0;
    tween(0, to, 900, function (v) {
      el.textContent = v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    });
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

  /* ---------- dial gauge ---------- */
  function gauge(el, value, opts) {
    var o = opts || {};
    var min = o.min == null ? 0 : o.min, max = o.max == null ? 100 : o.max;
    var unit = o.unit == null ? '%' : o.unit, label = o.label || '';
    if (!(max > min)) throw new Error('SoftConsole.gauge: max must be greater than min');
    var C = 130, R = 72, START = 135, SWEEP = 270, N = 50, id = 'sc-glow-' + (uid++);
    var frac = Math.max(0, Math.min(1, (value - min) / (max - min)));
    var pt = function (deg, r) { var a = deg * Math.PI / 180; return [C + r * Math.cos(a), C + r * Math.sin(a)]; };
    var arc = function (from, to, r) {
      var p1 = pt(from, r), p2 = pt(to, r);
      return 'M' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + (to - from > 180 ? 1 : 0) + ' 1 ' + p2[0].toFixed(2) + ' ' + p2[1].toFixed(2);
    };
    var ticks = '', labels = '', i;
    for (i = 0; i <= N; i++) {
      var a = START + SWEEP * i / N, major = i % 10 === 0, p1 = pt(a, major ? 96 : 100), p2 = pt(a, 107);
      ticks += '<line class="tk' + (major ? ' mj' : '') + (i / N <= frac ? ' lit' : '') + '" x1="' + p1[0].toFixed(2) + '" y1="' + p1[1].toFixed(2) + '" x2="' + p2[0].toFixed(2) + '" y2="' + p2[1].toFixed(2) + '"/>';
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
      + '<path class="val" pathLength="1" d="' + arc(START, START + SWEEP * frac, R) + '" filter="url(#' + id + ')"/></svg>'
      + '<div class="sc-gauge__hub sc-raised-2" role="img" aria-label="' + label + ': ' + value + ' ' + unit + '"><b><span>' + value + '</span><small>' + unit + '</small></b><span>' + label + '</span></div>';
    countUp(el.querySelector('.sc-gauge__hub b > span'), value, o.decimals || 0);
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
  function lines(el, legendEl, series, opts) {
    var o = opts || {};
    var mode = o.mode || 'peers', max = o.max == null ? 100 : o.max, suffix = o.suffix == null ? '%' : o.suffix;
    if (series.length > 4) throw new Error('SoftConsole.lines: four series at most. Group or facet the rest.');
    var focus = o.focus == null ? (mode === 'focus' ? 0 : -1) : o.focus;
    var draw = function () {
      var colors = series.map(function (s, i) {
        if (mode === 'peers') return CATEGORICAL[i];
        return i === focus ? 'var(--accent)' : MUTES[(i > focus ? i - 1 : i) % MUTES.length];
      });
      var W = 320, H = 120, n = series[0].data.length;
      var x = function (i) { return i * W / (n - 1); };
      var y = function (v) { return H * (1 - v / max); };
      var order = series.map(function (s, i) { return i; }).sort(function (a, b) { return (a === focus) - (b === focus); });
      var grid = [0.25, 0.5, 0.75].map(function (f) { return '<line class="gl" x1="0" x2="' + W + '" y1="' + H * f + '" y2="' + H * f + '" vector-effect="non-scaling-stroke"/>'; }).join('');
      var paths = order.map(function (i) {
        var d = series[i].data.map(function (v, k) { return (k ? 'L' : 'M') + x(k).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
        return '<path class="ln' + (i === focus ? ' focus' : '') + '" style="stroke:' + colors[i] + '" vector-effect="non-scaling-stroke" d="' + d + '"/>';
      }).join('');
      var ylab = [max, max / 2, 0].map(function (v, k) { return '<span class="sc-chart__y" style="top:' + k * 50 + '%">' + +v.toFixed(1) + suffix + '</span>'; }).join('');
      el.innerHTML = '<div class="sc-chart__plot"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="' + (o.label || 'Line chart') + '">' + grid + paths + '</svg>' + ylab + '</div>';
      if (legendEl) {
        legendEl.innerHTML = series.map(function (s, i) {
          return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === focus) + '" style="--c:' + colors[i] + '"><i></i>' + s.name + ' <b>' + s.data[n - 1].toFixed(0) + suffix + '</b></button>';
        }).join('');
      }
    };
    if (legendEl && !legendEl.dataset.scBound) {
      legendEl.dataset.scBound = '1';
      legendEl.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        var i = +b.dataset.i;
        focus = mode === 'focus' ? i : (focus === i ? -1 : i);
        draw();
      });
    }
    draw();
    return el;
  }

  /* ---------- bar chart ---------- */
  function bars(el, values, opts) {
    var o = opts || {};
    var labels = o.labels || values.map(function (v, i) { return String(i + 1); });
    var names = o.names || labels, unit = o.unit || '';
    var sel = o.selected == null ? values.indexOf(Math.max.apply(null, values)) : o.selected;
    var max = o.max || 100;
    el.classList.add('sc-bars');
    el.innerHTML = values.map(function (v, i) {
      var pct = Math.max(0, Math.min(100, v / max * 100));
      return '<button type="button" class="sc-bar" aria-pressed="' + (i === sel) + '" aria-label="' + names[i] + ': ' + v + ' ' + unit + '" style="--v:' + pct + ';--i:' + i + '">'
        + '<span class="sc-bar__track sc-inset-1"><span class="sc-bar__fill"></span><span class="sc-bar__tip sc-raised-1">' + v + '</span></span>'
        + '<span class="sc-bar__label">' + labels[i] + '</span></button>';
    }).join('');
    if (!el.dataset.scBound) {
      el.dataset.scBound = '1';
      el.addEventListener('click', function (e) {
        var b = e.target.closest('.sc-bar');
        if (!b) return;
        $$('.sc-bar', el).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      });
    }
    return el;
  }

  /* ---------- jog wheel ---------- */
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
    var rot = 0, drag = null;
    var set = function (v, spin) {
      var next = Math.max(min, Math.min(max, Math.round(v)));
      rot += spin || 0;
      ridges.style.backgroundPosition = rot + 'px 0';
      if (display) segment(display, String(next), digits);
      el.setAttribute('aria-valuenow', next);
      if (o.valueText) el.setAttribute('aria-valuetext', o.valueText(next));
      if (next !== value) { value = next; el.dispatchEvent(new CustomEvent('sc-change', { detail: { value: value }, bubbles: true })); }
    };
    el.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, v: value }; el.setPointerCapture(e.pointerId); el.classList.add('is-grab'); });
    el.addEventListener('pointermove', function (e) { if (drag) set(drag.v + (e.clientX - drag.x) / pxPerStep, e.movementX || 0); });
    var end = function () { drag = null; el.classList.remove('is-grab'); };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('wheel', function (e) {
      e.preventDefault();
      var d = Math.sign(Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : -e.deltaY);
      set(value + d, d * 6);
    }, { passive: false });
    el.addEventListener('keydown', function (e) {
      var map = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 5, PageDown: -5 };
      if (e.key === 'Home') { e.preventDefault(); set(min, -20); return; }
      if (e.key === 'End') { e.preventDefault(); set(max, 20); return; }
      if (map[e.key] === undefined) return;
      e.preventDefault();
      set(value + map[e.key], map[e.key] * 6);
    });
    value = Math.max(min, Math.min(max, value));
    if (display) segment(display, String(value), digits);
    el.setAttribute('aria-valuenow', value);
    if (o.valueText) el.setAttribute('aria-valuetext', o.valueText(value));
    return { get value() { return value; }, set: function (v) { set(v, (v - value) * 6); } };
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
    function open() {
      if (trigger.disabled || !list.hidden) return;
      list.hidden = false;
      field.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      var rect = field.getBoundingClientRect(), below = window.innerHeight - rect.bottom;
      field.classList.toggle('is-up', below < Math.min(list.scrollHeight, 280) + 12 && rect.top > below);
      setActive(native.selectedIndex >= 0 ? native.selectedIndex : move(-1, 1));
      document.addEventListener('pointerdown', outside, true);
    }
    function close() {
      if (list.hidden) return;
      list.hidden = true;
      field.classList.remove('is-open', 'is-up');
      trigger.setAttribute('aria-expanded', 'false');
      setActive(-1);
      document.removeEventListener('pointerdown', outside, true);
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

    trigger.addEventListener('click', function () { if (list.hidden) open(); else close(); });
    trigger.addEventListener('keydown', function (e) {
      var isOpen = !list.hidden;
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
    native.scSelect = { open: open, close: close, refresh: function () { build(); sync(); } };
    return native.scSelect;
  }

  /* ---------- icons: outline, 24px grid, 1.8 stroke ---------- */
  var ICONS = {
    home: '<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
    chart: '<path d="M5 20v-8M10 20V5M15 20v-6M20 20V9"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
    power: '<path d="M12 3v8"/><path d="M7 6.5a7.5 7.5 0 1 0 10 0"/>',
    refresh: '<path d="M19 12a7 7 0 1 1-2.05-4.95"/><path d="M19 4v4h-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    chevron: '<path d="m7 10 5 5 5-5"/>',
    bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
    server: '<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/><path d="M8 7.5h.01M8 16.5h.01"/>',
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
  function init(root, opts) {
    var r = root || document, o = opts || {};
    mountIcons();
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
      t.addEventListener('click', function () { t.setAttribute('aria-checked', String(t.getAttribute('aria-checked') !== 'true')); });
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
    $$('.sc-field select', r).forEach(select);
    $$('[data-sc-seg]', r).forEach(function (el) { segment(el, el.getAttribute('data-sc-seg'), num(el.dataset.digits, 0)); });
    $$('[data-sc-gauge]', r).forEach(function (el) {
      gauge(el, num(el.getAttribute('data-sc-gauge'), 0), { min: num(el.dataset.min, 0), max: num(el.dataset.max, 100), unit: el.dataset.unit, label: el.dataset.label });
    });
    $$('[data-sc-spark]', r).forEach(function (el) { spark(el, list(el.getAttribute('data-sc-spark')).map(Number)); });
    $$('[data-sc-bars]', r).forEach(function (el) {
      bars(el, list(el.getAttribute('data-sc-bars')).map(Number), { labels: el.dataset.labels ? list(el.dataset.labels) : null, names: el.dataset.names ? list(el.dataset.names) : null, unit: el.dataset.unit, max: num(el.dataset.max, 100), selected: el.dataset.selected == null ? null : num(el.dataset.selected, 0) });
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
    version: '1.1.0',
    themes: THEMES.slice(),
    init: init,
    setTheme: setTheme,
    setDensity: setDensity,
    segment: segment,
    gauge: gauge,
    spark: spark,
    lines: lines,
    bars: bars,
    jog: jog,
    select: select,
    countUp: countUp,
    icon: icon,
    mountIcons: mountIcons,
  };
})();
