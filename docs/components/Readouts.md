# Readouts

Readouts show related values with the label engraved on the panel and the reading in a recessed window.

## What you provide
```html
<dl class="sc-readouts">
  <div class="sc-readout"><dt class="sc-label">Cash</dt><dd class="sc-inset-1">$500.00</dd></div>
  <div class="sc-readout"><dt class="sc-label">Broker</dt><dd class="sc-inset-1"><span class="sc-status"><span class="sc-led sc-led--ok"></span>read_connected</span></dd></div>
  <div class="sc-readout sc-readout--text"><dt class="sc-label">Account</dt><dd class="sc-inset-1">Dedicated cash account</dd></div>
</dl>
```
The label sits on the surface in `t-label`, and the value sits in an `inset-1` window set in mono 15px. Like a field or a display bezel, this follows "recessed means data". Numbers are right-aligned so digits line up. Use `.sc-readout--text` for prose values, which are left-aligned in the UI font. A trailing `<small>` holds a qualifier (unit, status word). Windows share the row and match heights within it.

## Do and don't
- Do use readouts for several related values that a KPI tile per number would make too loud.
- Do put an LED and a word inside the window for a state.
- Don't use them for one headline number. Use a KpiTile.
- Don't raise the windows. Values never sit on a bump.
