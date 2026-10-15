# FormRow

A form row puts a visible label above any control, then an optional hint or error.

## What you provide
```html
<div class="sc-form">
  <label class="sc-form-row"><span class="sc-form-row__label">Monthly API budget</span>
    <div class="sc-field sc-inset-1"><input class="sc-mono" value="5"><span class="sc-field__unit">USD</span></div>
    <p class="sc-note">Applies only if API key mode is restored.</p></label>
  <fieldset class="sc-form-row"><legend class="sc-form-row__label">Days of the week</legend>…</fieldset>
</div>
```
The label is 13px semibold `text-2` in sentence case. `t-label` stays for uppercase labels above values. `.sc-form` flows rows into 240px-minimum columns when the panel is wide, with `space-5` gaps. Check rows, fieldsets and `.sc-form-row--wide` span the full width.

## Do and don't
- Do give every input a visible label.
- Don't use a placeholder as the label.
