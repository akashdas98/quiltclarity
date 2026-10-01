/* global document, getComputedStyle */
// Runs inside the browser through Playwright's page.evaluate.
export function inspectCheckboxAlignment({ forceWrap = false } = {}) {
  const issues = [];
  let checked = 0;
  let wrapped = 0;
  for (const field of document.querySelectorAll('.check-field')) {
    const input = field.querySelector('input[type="checkbox"]');
    const label = field.querySelector('.help-label');
    if (!input || !label || !input.getClientRects().length) continue;
    const originalWidth = label.style.maxInlineSize;
    const extra = forceWrap
      ? document.createTextNode(
          'A checkbox label that wraps onto several lines ',
        )
      : null;
    if (extra) {
      label.prepend(extra);
      label.style.maxInlineSize = '8rem';
    }
    // A stretched grid item measures the actual shared control track, including
    // rows made taller by another control or a wrapped checkbox label.
    const probe = document.createElement('span');
    probe.style.cssText =
      'grid-row:2;grid-column:1;align-self:stretch;pointer-events:none';
    const subgrid =
      getComputedStyle(field).gridTemplateRows.startsWith('subgrid');
    if (subgrid) field.append(probe);
    const inputRect = input.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    const trackRect = (subgrid ? probe : field).getBoundingClientRect();
    const center = (rect) => (rect.top + rect.bottom) / 2;
    const labelDifference = Math.abs(center(inputRect) - center(labelRect));
    const trackDifference = Math.abs(center(inputRect) - center(trackRect));
    const isWrapped =
      labelRect.height > parseFloat(getComputedStyle(label).lineHeight) * 1.5;
    checked++;
    if (isWrapped) wrapped++;
    if (
      labelDifference > 1 ||
      trackDifference > 1 ||
      (forceWrap && !isWrapped)
    ) {
      issues.push({
        name: input.name || input.dataset.field,
        labelDifference,
        trackDifference,
        isWrapped,
      });
    }
    probe.remove();
    extra?.remove();
    label.style.maxInlineSize = originalWidth;
  }
  return { checked, wrapped, issues };
}
