# AlertList

An alert list shows open alerts newest first, each with a severity badge, a plain-language title, its scope and its age.

## What you provide
```html
<ul class="sc-alerts">
  <li><span class="sc-sev sc-sev--crit"><span class="sc-led sc-led--crit sc-led--blink"></span>CRIT</span>
      <div><b>edge-07 unreachable</b><span class="sc-alerts__sub">3 missed heartbeats</span></div>
      <time datetime="PT4M">4m</time></li>
</ul>
```
Severity words: CRIT, WARN, INFO. Ages in the shortest unit (4m, 18m, 1h).

## Do and don't
- Do write titles as what is wrong and where: "edge-12 disk at 91%".
- Do sort by severity, then age.
- Don't show resolved alerts here; move them to history.
