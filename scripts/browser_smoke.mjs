/* global fetch, document, window, localStorage */

import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright-core';
import { SITE_ORIGIN as PUBLIC_SITE_ORIGIN } from '../src/lib/site-identity.ts';
import { inspectCheckboxAlignment } from './lib/checkbox-alignment-audit.mjs';
import { auditPlannerExport } from './lib/planner-export-audit.mjs';
import { auditPlannerPrintAction } from './lib/planner-print-action-audit.mjs';
import {
  assertCleanPrintContract,
  assertPrintContentParity,
  assertRenderedPrintContract,
  parsePrintedPdf,
} from './lib/pdf-print-audit.mjs';

const ROOT = process.cwd();
const PUBLIC_SMOKE_ORIGIN = process.env.QUILTCLARITY_SMOKE_ORIGIN;
let siteOrigin = 'http://127.0.0.1:4321';
if (PUBLIC_SMOKE_ORIGIN !== undefined) {
  const url = new URL(PUBLIC_SMOKE_ORIGIN);
  assert.ok(
    url.protocol === 'https:' &&
      url.pathname === '/' &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash,
    'QUILTCLARITY_SMOKE_ORIGIN must be an HTTPS origin without a path, query, credentials, or fragment',
  );
  siteOrigin = url.origin;
}
const SITE_ORIGIN = siteOrigin;
const CANONICAL_ORIGIN = new URL(process.env.SITE_URL ?? PUBLIC_SITE_ORIGIN)
  .origin;
const ROUTES = [
  '/',
  '/fabric-cutting-planner/',
  '/calculators/',
  '/calculators/fabric-yardage/',
  '/calculators/quilt-backing/',
  '/calculators/quilt-batting/',
  '/calculators/quilt-binding/',
  '/calculators/half-square-triangle/',
  '/calculators/quarter-square-triangle/',
  '/calculators/flying-geese/',
  '/calculators/quilt-block-count/',
  '/calculators/borders/',
  '/calculators/sashing/',
  '/calculators/pieces-from-fabric/',
  '/guides/',
  '/guides/getting-started/',
  '/guides/project-planner-tutorial/',
  '/guides/enter-a-cut-list/',
  '/guides/add-fabric-you-have/',
  '/guides/read-your-shopping-plan/',
  '/guides/read-your-cutting-plan/',
  '/guides/print-your-project-plan/',
  '/guides/turn-pattern-cut-list-into-plan/',
  '/guides/do-i-have-enough-fabric/',
  '/guides/use-remnants-before-buying/',
  '/guides/width-of-fabric/',
  '/guides/finished-vs-cut-size/',
  '/guides/quilt-seam-allowance/',
  '/guides/how-much-extra-backing/',
  '/guides/how-much-extra-batting/',
  '/guides/how-to-calculate-quilt-fabric/',
  '/guides/directional-fabric-cutting/',
  '/guides/fat-quarter-size/',
  '/guides/using-quilt-fabric-remnants/',
  '/guides/check-pattern-yardage/',
  '/how-it-works/',
  '/about/',
  '/methodology/',
  '/corrections/',
];
const ALL_PAGE_ROUTES = [
  ...ROUTES,
  '/guides/backing-overage/',
  '/guides/how-to-calculate-quilt-yardage/',
  '/404.html',
];

const WORD_SPACING_EVALUATION = `(() => {
  const glyph = (node, fromEnd) => {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const candidates = node instanceof Text ? [node] : [];
    for (let text = walker.nextNode(); text; text = walker.nextNode())
      candidates.push(text);
    if (fromEnd) candidates.reverse();
    for (const text of candidates) {
      const content = text.textContent;
      const index = fromEnd ? content.trimEnd().length - 1 : content.search(/\\S/);
      if (index < 0) continue;
      const range = document.createRange();
      range.setStart(text, index);
      range.setEnd(text, index + 1);
      const rect = range.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return rect;
    }
    return null;
  };
  const joined = (before, after) => {
    const a = glyph(before, true);
    const b = glyph(after, false);
    return a && b && Math.abs(a.top - b.top) < a.height / 2 && b.left - a.right < 2
      ? b.left - a.right : null;
  };
  const issues = [];
  let checked = 0;
  if (document.querySelector('.label-tail'))
    issues.push({ reason: 'obsolete split-word wrapper remains' });
  document.querySelectorAll('[data-context-help]').forEach((help) => {
    const mark = help.querySelector('.context-help-mark');
    if (!mark || mark.getClientRects().length === 0) return;
    const group = help.closest('.help-label, .fabric-subheading h3');
    if (!group) return;
    checked++;
    const label = group.textContent.slice(0, 80);
    if (!(help.previousSibling instanceof Text) ||
        !help.previousSibling.textContent.endsWith('\u00a0')) {
      issues.push({ label, reason: 'missing nonbreaking separator' });
      return;
    }
    if (['flex', 'inline-flex'].includes(getComputedStyle(group).display) ||
        getComputedStyle(help).display !== 'inline')
      issues.push({ label, reason: 'label or mark is outside normal inline flow' });
    for (let ancestor = help; ancestor; ancestor = ancestor.parentElement) {
      if (getComputedStyle(ancestor).clip !== 'auto') return;
    }
    const walker = document.createTreeWalker(group, NodeFilter.SHOW_TEXT);
    let last = null;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (help.contains(node)) break;
      const rect = glyph(node, true);
      if (rect) last = rect;
    }
    const markRect = mark.getBoundingClientRect();
    if (!last) {
      issues.push({ label, reason: 'no visible label text before mark' });
      return;
    }
    const gap = markRect.left - last.right;
    const centerOffset = Math.abs((markRect.top + markRect.bottom - last.top - last.bottom) / 2);
    if (gap < 0 || gap > 12 || centerOffset > 3)
      issues.push({ label, reason: 'mark detached from final word', gap, centerOffset,
        groupWidth: group.getBoundingClientRect().width,
        groupDisplay: getComputedStyle(group).display,
        parentDisplay: getComputedStyle(group.parentElement).display,
        textTop: last.top, markTop: markRect.top });
  });
  let flexJoinsChecked = 0;
  document.querySelectorAll('body *').forEach((parent) => {
    if (!['flex', 'inline-flex'].includes(getComputedStyle(parent).display)) return;
    const nodes = [...parent.childNodes];
    for (let index = 0; index < nodes.length - 1; index++) {
      const before = nodes[index];
      const after = nodes[index + 1];
      if (before instanceof Text && after instanceof Element &&
          before.textContent.trim() && /\\s$/.test(before.textContent) &&
          !after.matches('[data-context-help]')) {
        flexJoinsChecked++;
        const gap = joined(before, after);
        if (gap !== null) issues.push({ label: parent.textContent.slice(0, 80), reason: 'collapsed flex text-to-element separator', gap });
      }
      if (before instanceof Element && after instanceof Text &&
          after.textContent.trim() && /^\\s/.test(after.textContent) &&
          !before.matches('[data-context-help]')) {
        flexJoinsChecked++;
        const gap = joined(before, after);
        if (gap !== null) issues.push({ label: parent.textContent.slice(0, 80), reason: 'collapsed flex element-to-text separator', gap });
      }
    }
  });
  return { checked, flexJoinsChecked, issues };
})()`;

const browserCandidates = [
  {
    name: 'Chrome',
    executable: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  },
  {
    name: 'Edge',
    executable:
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  },
];

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitFor(check, description, timeout = 10_000) {
  const started = Date.now();
  let latestError;
  while (Date.now() - started < timeout) {
    try {
      const value = await check();
      if (value) return value;
    } catch (error) {
      latestError = error;
    }
    await delay(50);
  }
  throw new Error(
    `Timed out waiting for ${description}${latestError ? `: ${latestError.message}` : ''}`,
  );
}

async function stopChild(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise((resolve) => child.once('exit', resolve));
  child.kill();
  await Promise.race([exited, delay(3_000)]);
}

async function evaluate(client, expression) {
  const response = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (response.exceptionDetails) {
    throw new Error(
      response.exceptionDetails.exception?.description ??
        response.exceptionDetails.text,
    );
  }
  return response.result.value;
}

async function navigate(client, pathname, readySelector) {
  await client.send('Page.navigate', { url: `${SITE_ORIGIN}${pathname}` });
  await waitFor(
    async () =>
      evaluate(
        client,
        `document.readyState === 'complete' && Boolean(document.querySelector(${JSON.stringify(readySelector)}))`,
      ),
    `${pathname} to become interactive`,
  );
}

async function assertVisibleWordSpacing(client, description, minimumCount = 0) {
  const result = await evaluate(client, WORD_SPACING_EVALUATION);
  assert.ok(
    result.checked >= minimumCount,
    `${description}: expected at least ${minimumCount} grouped labels, saw ${result.checked}`,
  );
  assert.deepEqual(
    result.issues,
    [],
    `${description}: final words must retain visible separators`,
  );
}

async function runSiteWideSpacingAudit(client) {
  console.log('  Whole-site desktop/mobile word spacing checks...');
  for (const width of [1200, 390]) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: width === 390 ? 844 : 900,
      deviceScaleFactor: 1,
      mobile: width === 390,
      screenWidth: width,
      screenHeight: width === 390 ? 844 : 900,
    });
    for (const route of ALL_PAGE_ROUTES) {
      await navigate(client, route, 'h1');
      await assertVisibleWordSpacing(
        client,
        `${route} at ${width}px`,
        route === '/fabric-cutting-planner/' ? 1 : 0,
      );
    }
  }
  await client.send('Emulation.clearDeviceMetricsOverride');
}

async function runNoScriptSpacingAudit(browser) {
  console.log('  Static no-JavaScript word spacing checks...');
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  try {
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    for (const width of [1200, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      for (const route of [
        '/',
        '/fabric-cutting-planner/',
        '/calculators/fabric-yardage/',
        '/guides/getting-started/',
        '/404.html',
      ]) {
        await navigate(client, route, 'h1');
        await assertVisibleWordSpacing(
          client,
          `${route} without JavaScript at ${width}px`,
        );
      }
    }
  } finally {
    await client.detach();
    await context.close();
  }
}

async function runFormAlignmentAudit(page) {
  console.log('  Form control alignment checks...');
  let alignedPairs = 0;
  for (const width of [1200, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      '/fabric-cutting-planner/',
      ...ROUTES.filter(
        (candidate) =>
          candidate.startsWith('/calculators/') &&
          candidate !== '/calculators/',
      ),
    ]) {
      await page.goto(`${SITE_ORIGIN}${route}`, { waitUntil: 'load' });
      if (route === '/fabric-cutting-planner/') {
        await page.locator('.fabric-card').first().waitFor();
        await page.locator('#add-cut-row').click();
        await page.locator('[data-add-stock="custom"]').first().click();
        await page
          .locator('.fabric-card [data-advanced]')
          .first()
          .evaluate((node) => {
            node.open = true;
          });
        await page
          .locator('.cut-row-options [data-advanced]')
          .evaluateAll((nodes) => {
            for (const node of nodes) node.open = true;
          });
      } else {
        await page
          .locator('[data-calculator-advanced]')
          .evaluateAll((nodes) => {
            for (const node of nodes) node.open = true;
          });
      }
      for (const forceWrap of [false, true]) {
        const checkboxes = await page.evaluate(inspectCheckboxAlignment, {
          forceWrap,
        });
        assert.deepEqual(
          checkboxes.issues,
          [],
          `${route} at ${width}px: checkbox and label must center in the control track (wrapped=${forceWrap})`,
        );
      }
      const result = await page.evaluate(() => {
        const form = document.querySelector('#planner-form, .calculator-form');
        const reference = form.querySelector(
          'input:not([type="checkbox"]):not([type="hidden"]):not([type="range"])',
        );
        const referenceHeight = reference.getBoundingClientRect().height;
        const selectSizing = [...form.querySelectorAll('select')]
          .filter((select) => select.getClientRects().length)
          .map((select) => ({
            id: select.id,
            heightDifference: Math.abs(
              select.getBoundingClientRect().height - referenceHeight,
            ),
            appearance: window.getComputedStyle(select).appearance,
            hasArrow:
              window.getComputedStyle(select).backgroundImage !== 'none',
          }));
        const grids = [
          ...document.querySelectorAll('.form-grid, .cut-row-more-fields'),
        ].filter((grid) => grid.getClientRects().length);
        const inspect = () => {
          const issues = [];
          let pairs = 0;
          for (const grid of grids) {
            const fields = [...grid.children].filter(
              (child) =>
                child.classList.contains('field') &&
                child.getClientRects().length,
            );
            for (let i = 0; i < fields.length; i++) {
              const control = fields[i].querySelector(
                ':scope > input, :scope > select, :scope > textarea',
              );
              if (!control) continue;
              for (let j = i + 1; j < fields.length; j++) {
                const peer = fields[j].querySelector(
                  ':scope > input, :scope > select, :scope > textarea',
                );
                if (
                  !peer ||
                  Math.abs(
                    fields[i].getBoundingClientRect().top -
                      fields[j].getBoundingClientRect().top,
                  ) > 1
                )
                  continue;
                pairs++;
                const difference = Math.abs(
                  control.getBoundingClientRect().bottom -
                    peer.getBoundingClientRect().bottom,
                );
                if (difference > 1)
                  issues.push({
                    difference,
                    labels: [
                      fields[i].textContent.trim().slice(0, 55),
                      fields[j].textContent.trim().slice(0, 55),
                    ],
                  });
              }
            }
          }
          return { issues, pairs };
        };
        const natural = inspect();
        const firstGrid = grids.find((grid) => {
          const fields = [...grid.children].filter((child) =>
            child.classList.contains('field'),
          );
          return (
            fields.length > 1 &&
            Math.abs(
              fields[0].getBoundingClientRect().top -
                fields[1].getBoundingClientRect().top,
            ) <= 1
          );
        });
        let forced = null;
        if (firstGrid) {
          const [first, second] = firstGrid.querySelectorAll(':scope > .field');
          const label = first.querySelector('label');
          label.prepend(
            document.createTextNode(
              'A longer label that wraps over several lines in the available column ',
            ),
          );
          const firstError =
            first.querySelector('.field-error') ??
            document.createElement('small');
          firstError.className = 'field-error';
          firstError.textContent =
            'A field-specific error shown below the control.';
          if (!firstError.isConnected) first.append(firstError);
          const hint =
            second.querySelector('small:not(.field-error)') ??
            document.createElement('small');
          hint.textContent =
            'A separate explanation below this control that wraps onto another line.';
          if (!hint.isConnected) second.append(hint);
          forced = inspect();
        }
        return { natural, forced, selectSizing };
      });
      assert.ok(
        result.selectSizing.length,
        `${route}: expected a visible select`,
      );
      assert.deepEqual(
        result.selectSizing.filter(
          ({ heightDifference, appearance, hasArrow }) =>
            heightDifference > 0.1 || appearance !== 'none' || !hasArrow,
        ),
        [],
        `${route} at ${width}px: selects should share input height and show a themed arrow`,
      );
      assert.deepEqual(
        result.natural.issues,
        [],
        `${route} at ${width}px: controls in each row should align`,
      );
      if (width === 1200) {
        assert.ok(result.forced, `${route}: expected a horizontal field pair`);
        assert.deepEqual(
          result.forced.issues,
          [],
          `${route}: wrapped label, hint, and error must not shift controls`,
        );
        alignedPairs += result.natural.pairs + result.forced.pairs;
      }
      if (route === '/fabric-cutting-planner/')
        await page.evaluate(() => localStorage.clear());
    }
  }
  await page.goto(`${SITE_ORIGIN}/fabric-cutting-planner/`);
  await page.locator('#unit-system').focus();
  await page.keyboard.press('ArrowDown');
  assert.equal(
    await page.locator('#unit-system').inputValue(),
    'metric',
    'the native select should remain keyboard operable',
  );
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark';
  });
  await page.emulateMedia({ forcedColors: 'active' });
  assert.deepEqual(
    await page.locator('#unit-system').evaluate((select) => ({
      appearance: window.getComputedStyle(select).appearance,
      backgroundImage: window.getComputedStyle(select).backgroundImage,
    })),
    { appearance: 'auto', backgroundImage: 'none' },
    'forced colors should restore the native select arrow',
  );
  await page.emulateMedia({ forcedColors: 'none' });
  assert.ok(
    alignedPairs >= 12,
    `expected representative horizontal field pairs, saw ${alignedPairs}`,
  );
}

async function auditStaticRoutes() {
  for (const route of ROUTES) {
    const response = await fetch(`${SITE_ORIGIN}${route}`);
    assert.equal(response.status, 200, `${route} should return HTTP 200`);
    const html = await response.text();
    assert.match(html, /<h1[ >]/, `${route} should include an H1`);
    assert.match(
      html,
      /rel="canonical"/,
      `${route} should include a canonical`,
    );
    assert.doesNotMatch(html, /quiltclarity-verification-test/);
    assert.match(html, /property="og:site_name" content="QuiltClarity"/);
    assert.doesNotMatch(html, /\bQuilter\b|quilter\.example/);
    const canonical = html.match(/rel="canonical" href="([^"]+)"/);
    assert.ok(canonical, `${route} should provide its canonical URL`);
    assert.equal(new URL(canonical[1]).origin, CANONICAL_ORIGIN);
  }
  const sitemap = await fetch(`${SITE_ORIGIN}/sitemap.xml`);
  assert.equal(sitemap.status, 200);
  const sitemapText = await sitemap.text();
  assert.equal((sitemapText.match(/<url>/g) ?? []).length, 38);
  assert.ok(!sitemapText.includes('/corrections/'));
  assert.doesNotMatch(sitemapText, /quilter\.example/);
  for (const location of sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    assert.equal(new URL(location[1]).origin, CANONICAL_ORIGIN);
  }
  const feedbackHtml = await (
    await fetch(`${SITE_ORIGIN}/corrections/`)
  ).text();
  assert.match(feedbackHtml, /name="robots"\s+content="noindex, nofollow"/);
  const robots = await fetch(`${SITE_ORIGIN}/robots.txt`);
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Sitemap: .*\/sitemap\.xml/);
  const missing = await fetch(
    `${SITE_ORIGIN}/definitely-not-a-quiltclarity-route/`,
  );
  assert.equal(missing.status, 404);
}

async function runHomeSpacingAudit(client) {
  console.log('  Homepage spacing checks...');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1200,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: 1200,
    screenHeight: 900,
  });
  await navigate(client, '/', '.home-hero');
  const spacing = await evaluate(
    client,
    `(() => {
      const heroStyle = getComputedStyle(document.querySelector('.home-hero'));
      const headingStyle = getComputedStyle(document.querySelector('#tools-heading'));
      const expectedDesktopPadding = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      ) * 2.7;
      return {
        heroTop: parseFloat(heroStyle.paddingTop),
        heroBottom: parseFloat(heroStyle.paddingBottom),
        heroMarginBottom: parseFloat(heroStyle.marginBottom),
        expectedDesktopPadding,
        expectedMargin: parseFloat(
          getComputedStyle(document.documentElement).fontSize,
        ),
        toolsHeadingTop: parseFloat(headingStyle.marginTop),
      };
    })()`,
  );
  assert.ok(
    Math.abs(spacing.heroTop - spacing.expectedDesktopPadding) <= 0.1 &&
      Math.abs(spacing.heroBottom - spacing.expectedDesktopPadding) <= 0.1,
    'homepage hero should use the 40%-reduced desktop block padding',
  );
  assert.equal(
    spacing.heroMarginBottom,
    spacing.expectedMargin,
    'homepage hero should use a 1rem bottom margin',
  );
  assert.equal(
    spacing.toolsHeadingTop,
    0,
    'homepage tools heading should not add top margin',
  );
}

async function runGuideHelpAudit(client) {
  console.log('  Guides and contextual help checks...');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1200,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: 1200,
    screenHeight: 900,
  });
  await navigate(client, '/guides/', '#start-here-heading');
  const hub = await evaluate(
    client,
    `(() => ({
      startHere: Boolean(document.querySelector('#start-here-heading')),
      workflows: Boolean(document.querySelector('#workflow-heading')),
      reference: Boolean(document.querySelector('#reference-heading')),
      quickStart: document.querySelector('a[href="/guides/getting-started/"]') instanceof HTMLAnchorElement,
      tutorial: document.querySelector('a[href="/guides/project-planner-tutorial/"]') instanceof HTMLAnchorElement,
    }))()`,
  );
  assert.deepEqual(hub, {
    startHere: true,
    workflows: true,
    reference: true,
    quickStart: true,
    tutorial: true,
  });

  await navigate(
    client,
    '/guides/project-planner-tutorial/#usable-wof',
    '#usable-wof',
  );
  assert.equal(
    await evaluate(
      client,
      `location.hash === '#usable-wof' && document.querySelector('#usable-wof').getBoundingClientRect().top >= 0`,
    ),
    true,
    'tutorial deep links should expose the intended anchored section',
  );
  const tutorialPdf = await client.send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,
  });
  const tutorialPages = parsePrintedPdf(tutorialPdf.data);
  assert.ok(tutorialPdf.data.startsWith('JVBER'));
  assert.ok(
    tutorialPages.length > 1 && tutorialPages.every(({ hasText }) => hasText),
    'the full tutorial PDF should remain readable without blank sheets',
  );

  await navigate(client, '/fabric-cutting-planner/', '#planner-form');
  await evaluate(
    client,
    `(async () => {
      const name = document.querySelector('#project-name');
      name.value = 'Context help state check';
      name.dispatchEvent(new Event('input', { bubbles: true }));
      const help = document.querySelector('button[aria-label="Help: Usable WOF"]');
      help.scrollIntoView({ block: 'center' });
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      help.click();
    })()`,
  );
  const opened = await evaluate(
    client,
    `(() => {
      const trigger = document.querySelector('button[aria-label="Help: Usable WOF"]');
      const popover = trigger.closest('[data-context-help]').querySelector('[data-help-popover]');
      const bounds = popover.getBoundingClientRect();
      return {
        expanded: trigger.getAttribute('aria-expanded'),
        hidden: popover.hidden,
        text: popover.textContent,
        href: popover.querySelector('[data-help-learn-more]').getAttribute('href'),
        contained: bounds.left >= 0 && bounds.right <= innerWidth && bounds.top >= 0 && bounds.bottom <= innerHeight,
      };
    })()`,
  );
  assert.equal(opened.expanded, 'true');
  assert.equal(opened.hidden, false);
  assert.match(opened.text, /crosswise width available for cutting/i);
  assert.equal(opened.href, '/guides/project-planner-tutorial/#usable-wof');
  assert.equal(opened.contained, true);
  await client.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  });
  await client.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  });
  assert.equal(
    await evaluate(
      client,
      `(() => {
        const trigger = document.querySelector('button[aria-label="Help: Usable WOF"]');
        return trigger.getAttribute('aria-expanded') === 'false' && document.activeElement === trigger;
      })()`,
    ),
    true,
    'Escape should close help and preserve trigger focus',
  );

  const helpEvents = await evaluate(
    client,
    `window.dataLayer.filter((event) => event.name === 'context_help_opened')`,
  );
  assert.ok(
    helpEvents.some((event) => event.help_key === 'usableWof'),
    'opening help should emit only its controlled help key',
  );
  assert.ok(
    helpEvents.every(
      (event) =>
        !('projectName' in event) &&
        !('fieldValue' in event) &&
        !('label' in event),
    ),
    'help analytics should not include project or field content',
  );

  await evaluate(
    client,
    `(() => {
      const trigger = document.querySelector('button[aria-label="Help: Usable WOF"]');
      trigger.click();
      trigger.closest('[data-context-help]').querySelector('[data-help-learn-more]').click();
    })()`,
  );
  await waitFor(
    () =>
      evaluate(
        client,
        `location.pathname === '/guides/project-planner-tutorial/' && location.hash === '#usable-wof'`,
      ),
    'contextual Learn more navigation',
  );
  await waitFor(
    () =>
      evaluate(
        client,
        `window.dataLayer.some((event) => event.name === 'guide_started' && event.guide_slug === 'project-planner-tutorial')`,
      ),
    'direct guide visits to emit a controlled guide slug',
  );
  await evaluate(client, 'history.back()');
  await waitFor(
    () =>
      evaluate(
        client,
        `location.pathname === '/fabric-cutting-planner/' && document.querySelector('#project-name')?.value === 'Context help state check'`,
      ),
    'planner state restoration after guide navigation',
  );

  const actionTooltip = await evaluate(
    client,
    `(() => {
      const button = document.querySelector('#calculate-plan');
      button.focus();
      const root = button.closest('[data-action-help]');
      const tooltip = root.querySelector('[data-action-help-tooltip]');
      return {
        noQuestionMark: !root.querySelector('[data-help-trigger]'),
        visible: !tooltip.hidden,
        describedBy: button.getAttribute('aria-describedby') === tooltip.id,
        noLearnMore: !tooltip.querySelector('a'),
        text: tooltip.textContent.trim(),
      };
    })()`,
  );
  assert.equal(actionTooltip.noQuestionMark, true);
  assert.equal(actionTooltip.visible, true);
  assert.equal(actionTooltip.describedBy, true);
  assert.equal(actionTooltip.noLearnMore, true);
  assert.match(actionTooltip.text, /validates the current fields/i);

  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
    screenWidth: 390,
    screenHeight: 844,
  });
  await client.send('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 1,
  });
  const mobileHelp = await evaluate(
    client,
    `(async () => {
      const trigger = document.querySelector('button[aria-label="Help: Usable WOF"]');
      trigger.scrollIntoView({ block: 'end', inline: 'end' });
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      trigger.click();
      const popover = trigger.closest('[data-context-help]').querySelector('[data-help-popover]');
      const triggerBounds = trigger.getBoundingClientRect();
      const popoverBounds = popover.getBoundingClientRect();
      const labelGroup = trigger.closest('label, .help-label');
      const mark = trigger.closest('[data-context-help]').querySelector('.context-help-mark');
      const textNode = [...labelGroup.querySelectorAll('label')]
        .flatMap((label) => {
          const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
          const nodes = [];
          for (let node = walker.nextNode(); node; node = walker.nextNode())
            if (node.textContent.trim()) nodes.push(node);
          return nodes;
        }).at(-1);
      const range = document.createRange();
      const lastCharacter = textNode.textContent.trimEnd().length - 1;
      range.setStart(textNode, lastCharacter);
      range.setEnd(textNode, lastCharacter + 1);
      const textBounds = range.getBoundingClientRect();
      const markBounds = mark.getBoundingClientRect();
      const triggerStyle = getComputedStyle(trigger);
      const markStyle = getComputedStyle(mark);
      const popoverStyle = getComputedStyle(popover);
      return {
        triggerWidth: triggerBounds.width,
        triggerHeight: triggerBounds.height,
        labelWhiteSpace: getComputedStyle(labelGroup).whiteSpace,
        markAttached: markBounds.left - textBounds.right >= 0 &&
          markBounds.left - textBounds.right <= 12 &&
          Math.abs((markBounds.top + markBounds.bottom - textBounds.top - textBounds.bottom) / 2) <= 3,
        triggerBackground: triggerStyle.backgroundColor,
        markBackground: markStyle.backgroundColor,
        markBorderRadius: markStyle.borderRadius,
        popoverWhiteSpace: popoverStyle.whiteSpace,
        popoverOverflowX: popoverStyle.overflowX,
        popoverWraps: popover.scrollWidth <= popover.clientWidth,
        contained:
          popoverBounds.left >= 0 &&
          popoverBounds.right <= innerWidth &&
          popoverBounds.top >= 0 &&
          popoverBounds.bottom <= innerHeight,
      };
    })()`,
  );
  assert.ok(
    mobileHelp.triggerWidth >= 44 && mobileHelp.triggerHeight >= 44,
    'contextual help should retain a 44px touch target',
  );
  assert.equal(
    mobileHelp.markAttached,
    true,
    'a short complete label and its help mark should stay on one line',
  );
  assert.equal(
    mobileHelp.triggerBackground,
    'rgba(0, 0, 0, 0)',
    'the help trigger should have no visible button background',
  );
  assert.equal(
    mobileHelp.markBackground,
    'rgba(0, 0, 0, 0)',
    'the visible question mark should have no circular fill',
  );
  assert.equal(mobileHelp.markBorderRadius, '0px');
  assert.equal(mobileHelp.popoverWhiteSpace, 'normal');
  assert.equal(mobileHelp.popoverOverflowX, 'hidden');
  assert.equal(
    mobileHelp.popoverWraps,
    true,
    'contextual help copy should wrap without horizontal scrolling',
  );
  assert.equal(
    mobileHelp.contained,
    true,
    'contextual help should remain inside a narrow touch viewport',
  );
  await client.send('Emulation.setTouchEmulationEnabled', { enabled: false });
}

async function runPlannerAudit(client) {
  console.log('  Planner interaction and keyboard checks...');
  // Exercise the tablet PDF path at desktop geometry. Device selection must
  // remain independent of the viewport used by the layout/print regressions.
  const mobileSignals = await client.send(
    'Page.addScriptToEvaluateOnNewDocument',
    {
      source:
        "Object.defineProperty(navigator, 'userAgentData', { configurable: true, value: { mobile: true } });",
    },
  );
  // This fixture uses imperial inputs; earlier native-select/help audits persist
  // their own drafts in this shared browser context.
  await evaluate(
    client,
    `localStorage.removeItem('quiltclarity:planner-state')`,
  );
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1200,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: 1200,
    screenHeight: 900,
  });
  await navigate(client, '/fabric-cutting-planner/', '#planner-form');

  await client.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Tab',
    code: 'Tab',
    windowsVirtualKeyCode: 9,
  });
  await client.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'Tab',
    code: 'Tab',
    windowsVirtualKeyCode: 9,
  });
  assert.equal(
    await evaluate(
      client,
      `document.activeElement?.classList.contains('skip-link')`,
    ),
    true,
    'the first keyboard stop should be the skip link',
  );

  const result = await evaluate(
    client,
    `(async () => {
      const wait = async (predicate) => {
        const started = performance.now();
        while (!predicate()) {
          if (performance.now() - started > 5000) throw new Error('UI wait timed out');
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
      };
      const input = (element, value) => {
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const form = document.querySelector('#planner-form');
      input(document.querySelector('#project-name'), 'Release secret project');
      const firstFabric = document.querySelector('.fabric-card');
      input(firstFabric.querySelector('[data-field="name"]'), 'Private blue fabric');
      input(firstFabric.querySelector('[data-field="notes"]'), 'Do not transmit this note');
      const firstPiece = document.querySelector('.cut-list-row');
      input(firstPiece.querySelector('[data-field="label"]'), 'Secret star piece');
      input(firstPiece.nextElementSibling.nextElementSibling.querySelector('[data-field="notes"]'), 'Private piece note');
      document.querySelector('.cut-row-options [data-remove-cut]').click();
      await wait(() => document.querySelectorAll('.cut-list-row').length === 0);
      const lastRowDeleteAllowsEmpty =
        !document.querySelector('#cut-list-empty').hidden &&
        document.querySelector('#cut-list-table-wrap').hidden;
      document.querySelector('#undo-cut-row').click();
      await wait(() => document.querySelectorAll('.cut-list-row').length === 1);
      const lastRowUndoRestoresContent =
        document.querySelector('.cut-list-row [data-field="label"]').value ===
          'Secret star piece' &&
        document.querySelector('.cut-row-options [data-field="notes"]').value ===
          'Private piece note';
      const restoredFirstFabric = document.querySelector('.fabric-card');
      restoredFirstFabric.querySelector('details summary').click();
      await new Promise((resolve) => setTimeout(resolve, 30));
      document.querySelector('#add-fabric').click();
      await wait(() => document.querySelectorAll('.fabric-card').length === 2);
      [...document.querySelectorAll('.cut-list-row')].at(-1).querySelector('[data-field="label"]')
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await wait(() => document.querySelectorAll('.cut-list-row').length === 2);
      document.querySelector('.cut-row-options:last-child details').open = true;
      document.querySelector('.cut-row-options:last-child [data-duplicate-cut]').click();
      await wait(() => document.querySelectorAll('.cut-list-row').length === 3);
      document.querySelector('.cut-row-options:last-child details').open = true;
      document.querySelector('.cut-row-options:last-child [data-remove-cut]').click();
      await wait(() => document.querySelectorAll('.cut-list-row').length === 2);
      document.querySelector('#undo-cut-row').click();
      await wait(() => document.querySelectorAll('.cut-list-row').length === 3);
      const undoRestoredCut = document.querySelector('#cut-list-undo').hidden;
      document.querySelector('.cut-row-options:last-child details').open = true;
      document.querySelector('.cut-row-options:last-child [data-remove-cut]').click();
      await wait(() => document.querySelectorAll('.cut-list-row').length === 2);
      document.querySelector('#open-paste-dialog').click();
      const pasteDialog = document.querySelector('#paste-dialog');
      const pasteSource = document.querySelector('#paste-source');
      const pasteSourceLabel = pasteDialog.querySelector('label[for="paste-source"]');
      const pasteDialogIsOpaque =
        getComputedStyle(pasteDialog).backgroundColor !== 'rgba(0, 0, 0, 0)';
      const pasteFieldHasLabelGap =
        pasteSource.getBoundingClientRect().top -
          pasteSourceLabel.getBoundingClientRect().bottom >=
        4;
      input(
        pasteSource,
        [
          'Fabric,Label,Qty,Width,Height,Size mode',
          'Navy Alias,"Paste-only, secret",1,5,5,Cut',
        ].join(String.fromCharCode(10)),
      );
      document.querySelector('#preview-paste').click();
      await wait(() => document.querySelector('[data-paste-fabric-row="0"]'));
      const mapping = document.querySelector('[data-paste-fabric-row="0"]');
      mapping.value = document.querySelectorAll('.fabric-card')[1].dataset.fabricId;
      mapping.dispatchEvent(new Event('change', { bubbles: true }));
      await wait(() => !document.querySelector('#confirm-paste').disabled);
      document.querySelector('#confirm-paste').click();
      await wait(() => document.querySelectorAll('.cut-list-row').length === 3);
      document.querySelector('.fabric-card [data-add-stock="custom"]').click();
      await wait(() => document.querySelectorAll('.fabric-card:first-child .stock-piece').length === 1);
      const currentFirstFabric = document.querySelector('.fabric-card');
      input(currentFirstFabric.querySelector('.stock-piece [data-field="label"]'), 'Private remnant');
      input(currentFirstFabric.querySelector('[data-field="patternStatedAmount"]'), '1');
      input(currentFirstFabric.querySelector('[data-field="patternAssumedUsableWidth"]'), '44');
      currentFirstFabric.querySelector('[data-field="patternStatedAmount"]')
        .dispatchEvent(new Event('change', { bubbles: true }));
      form.requestSubmit();
      await wait(() => !document.querySelector('#planner-results').hidden);
      const currentFirstPieceLabel = document.querySelector('.cut-list-row [data-field="label"]');
      input(currentFirstPieceLabel, currentFirstPieceLabel.value);
      const planNeedsRecalculation =
        document.querySelector('#save-status').textContent.includes('Plan needs recalculation') &&
        !document.querySelector('#planner-results').hidden &&
        document.querySelector('#calculate-plan').textContent === 'Recalculate';

      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async (text) => { window.__copiedSummary = text; } },
      });
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: undefined,
      });
      window.print = () => { window.__printRequested = true; };
      document.querySelector('#copy-result').click();
      await new Promise((resolve) => setTimeout(resolve, 30));
      const originalObjectUrl = URL.createObjectURL;
      const originalAnchorClick = HTMLAnchorElement.prototype.click;
      URL.createObjectURL = (blob) => {
        if (blob.type === 'application/pdf') {
          window.__exportedPdfPromise = blob.arrayBuffer().then((buffer) => {
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let offset = 0; offset < bytes.length; offset += 16384) {
              binary += String.fromCharCode(...bytes.subarray(offset, offset + 16384));
            }
            return btoa(binary);
          });
        }
        return originalObjectUrl.call(URL, blob);
      };
      HTMLAnchorElement.prototype.click = function () {
        if (this.download.endsWith('.pdf')) {
          window.__exportedPdfFilename = this.download;
          return;
        }
        return originalAnchorClick.call(this);
      };
      const exportButton = document.querySelector('#export-pdf-result');
      exportButton.click();
      const exportStarted = performance.now();
      while (exportButton.disabled) {
        if (performance.now() - exportStarted > 15000) throw new Error('PDF export timed out');
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      if (!window.__exportedPdfPromise) {
        throw new Error('PDF export failed: ' + document.querySelector('#action-status').textContent);
      }
      window.__exportedPdfData = await window.__exportedPdfPromise;
      URL.createObjectURL = originalObjectUrl;
      HTMLAnchorElement.prototype.click = originalAnchorClick;
      document.querySelector('#share-result').click();
      const shareFallback = document.querySelector('#action-status').textContent.includes('not available');
      document.querySelector('#edit-result').click();

      const controls = [...form.querySelectorAll('input, select, textarea')];
      const labelsAssociated = controls.every((control) =>
        control.id && form.querySelector('label[for="' + CSS.escape(control.id) + '"]')
      );
      const helpCount = (root) =>
        root
          ? [...root.querySelectorAll('[data-context-help]')].filter(
              (help) => help.getClientRects().length > 0,
            ).length
          : 0;
      const fabricCards = [...document.querySelectorAll('.fabric-card')];
      const stockPieces = [...document.querySelectorAll('.stock-piece')];
      const cutRows = [...document.querySelectorAll('.cut-list-row')];
      const cutOptions = [...document.querySelectorAll('.cut-row-options')];
      const cutHeaderHelpCount = helpCount(document.querySelector('.cut-list-table thead'));
      const repeatedFieldHelpUnique =
        cutHeaderHelpCount === 6 &&
        cutRows.every((row) => helpCount(row) === 0) &&
        cutOptions.length > 0 &&
        helpCount(cutOptions[0]) > 0 &&
        cutOptions.slice(1).every((row) => helpCount(row) === 0) &&
        fabricCards.length > 0 &&
        helpCount(fabricCards[0]) > 0 &&
        fabricCards.slice(1).every((card) => helpCount(card) === 0) &&
        (stockPieces.length === 0 ||
          (helpCount(stockPieces[0]) > 0 &&
            stockPieces.slice(1).every((piece) => helpCount(piece) === 0)));
      const toolActionButtons = [
        ...document.querySelectorAll(
          '#planner-form button:not([data-help-trigger]), #paste-dialog button:not([data-help-trigger]), #planner-results button:not([data-help-trigger])',
        ),
      ];
      const actionHelpComplete = toolActionButtons.every((button) =>
        button.closest('[data-action-help]')?.querySelector('[data-action-help-tooltip]'),
      );
      const fabricResults = [...document.querySelectorAll('.fabric-result')];
      const firstMaterialPlans = fabricResults[0]
        ? [...fabricResults[0].querySelectorAll('.material-plan')]
        : [];
      const repeatedResultHelpUnique =
        helpCount(document.querySelector('#project-summary')) > 0 &&
        fabricResults.length > 0 &&
        helpCount(fabricResults[0]) > 0 &&
        fabricResults.slice(1).every((result) => helpCount(result) === 0) &&
        firstMaterialPlans.slice(1).every((plan) => helpCount(plan) === 0);
      const detachedHelpMarks = [
        ...document.querySelectorAll('[data-context-help]'),
      ].flatMap((help) => {
        const group = help.closest('.help-label');
        const mark = help.querySelector('.context-help-mark');
        if (!group || !mark || mark.getClientRects().length === 0) return [];
        const walker = document.createTreeWalker(group, NodeFilter.SHOW_TEXT, {
          acceptNode(node) {
            return help.contains(node) || !node.textContent.trim()
              ? NodeFilter.FILTER_REJECT
              : NodeFilter.FILTER_ACCEPT;
          },
        });
        let textNode;
        for (let node = walker.nextNode(); node; node = walker.nextNode())
          textNode = node;
        if (!textNode) return [];
        const end = textNode.textContent.trimEnd().length;
        const range = document.createRange();
        range.setStart(textNode, Math.max(0, end - 1));
        range.setEnd(textNode, end);
        const textRect = range.getBoundingClientRect();
        const markRect = mark.getBoundingClientRect();
        return markRect.top < textRect.bottom && markRect.bottom > textRect.top
          ? []
          : [{
              key: help.dataset.helpKey,
              text: group.textContent.trim(),
              textTop: textRect.top,
              textBottom: textRect.bottom,
              markTop: markRect.top,
              markBottom: markRect.bottom,
            }];
      });
      const visuallyDetachedHelpMarks = [
        ...document.querySelectorAll('[data-context-help]'),
      ].flatMap((help) => {
        const group = help.closest('.help-label');
        const mark = help.querySelector('.context-help-mark');
        if (!group || !mark || mark.getClientRects().length === 0) return [];
        const label = group.querySelector(':scope > label');
        const walker = document.createTreeWalker(
          group,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode(node) {
              return help.contains(node) || !node.textContent.trim()
                ? NodeFilter.FILTER_REJECT
                : NodeFilter.FILTER_ACCEPT;
            },
          },
        );
        let textNode;
        for (let node = walker.nextNode(); node; node = walker.nextNode())
          textNode = node;
        let targetRect;
        if (textNode) {
          const end = textNode.textContent.trimEnd().length;
          const range = document.createRange();
          range.setStart(textNode, Math.max(0, end - 1));
          range.setEnd(textNode, end);
          targetRect = range.getBoundingClientRect();
        }
        if (!targetRect || targetRect.width === 0 || targetRect.height === 0)
          return [];
        const markRect = mark.getBoundingClientRect();
        const horizontalGap = markRect.left - targetRect.right;
        const centerOffset = Math.abs(
          (markRect.top + markRect.bottom) / 2 -
            (targetRect.top + targetRect.bottom) / 2,
        );
        return horizontalGap <= 12 && centerOffset <= 3
          ? []
          : [{
              key: help.dataset.helpKey,
              text: label?.textContent.trim() ?? group.textContent.trim(),
              horizontalGap,
              centerOffset,
            }];
      });
      const rgb = (value) => value.match(/[\\d.]+/g).slice(0, 3).map(Number);
      const luminance = (value) => {
        const channels = rgb(value).map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
      };
      const contrast = (foreground, background) => {
        const lighter = Math.max(luminance(foreground), luminance(background));
        const darker = Math.min(luminance(foreground), luminance(background));
        return (lighter + 0.05) / (darker + 0.05);
      };
      const rootBackground = getComputedStyle(document.documentElement).backgroundColor;
      const contrastFor = (selector, background = rootBackground) => {
        const style = getComputedStyle(document.querySelector(selector));
        return contrast(style.color, background === 'self' ? style.backgroundColor : background);
      };
      const eventJson = JSON.stringify(window.dataLayer);
      const resultText = document.querySelector('#planner-results').textContent;
      const efficiencySummary = document.querySelector('.efficiency-summary');
      const comparisonParagraphs = [...document.querySelectorAll('.planning-comparison p')];
      const textPlan = document.querySelector('.text-plan');
      const diagramWrapper = document.querySelector('.diagram-wrap');
      const diagram = diagramWrapper.querySelector('.cutting-diagram');
      const diagramSlider = document.querySelector('[data-diagram-zoom-slider]');
      const diagramOutput = document.querySelector('[data-diagram-zoom-output]');
      const summary = document.querySelector('#project-summary');
      const shoppingWrap = summary.querySelector('.shopping-table-wrap');
      const summaryStyle = getComputedStyle(summary);
      const summaryContentWidth = summary.clientWidth -
        parseFloat(summaryStyle.paddingLeft) - parseFloat(summaryStyle.paddingRight);
      const shoppingCellWidths = [...shoppingWrap.querySelectorAll('tbody th, tbody td')]
        .map((cell) => cell.getBoundingClientRect().width);
      const cutOptionRows = [...document.querySelectorAll('.cut-row-options')];
      const cutErrorRows = [...document.querySelectorAll('.cut-row-errors')];
      const cutFieldLabelsAboveControls = [
        ...document.querySelectorAll('.cut-list-row td'),
      ].every((cell) => {
        const label = cell.querySelector('.cut-field-label');
        const control = cell.querySelector('input, select');
        return label && control &&
          label.getBoundingClientRect().width > 0 &&
          label.getBoundingClientRect().height > 0 &&
          getComputedStyle(label).visibility !== 'hidden' &&
          getComputedStyle(label).position !== 'absolute' &&
          label.getBoundingClientRect().bottom <=
            control.getBoundingClientRect().top + 1;
      });
      const firstCutOptions = cutOptionRows[0];
      const firstCutDetails = firstCutOptions.querySelector('details');
      const firstCutMainCell = firstCutOptions.previousElementSibling.previousElementSibling
        .querySelector('td');
      const firstCutOptionsCell = firstCutOptions.querySelector('td');
      const firstCutMainCellStyle = getComputedStyle(firstCutMainCell);
      const firstCutOptionsCellStyle = getComputedStyle(firstCutOptionsCell);
      const firstCutDetailsStyle = getComputedStyle(firstCutDetails);
      firstCutDetails.open = false;
      const cutOptionButtons = [...firstCutOptions.querySelectorAll('.cut-row-more-actions button')];
      const cutOptionActionsRemainVisible = cutOptionButtons.every((button) => {
        const style = getComputedStyle(button);
        return style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          button.getClientRects().length > 0 &&
          button.getBoundingClientRect().height >= 44;
      });
      firstCutDetails.open = true;
      const cutOptionPanel = firstCutOptions.querySelector('.cut-row-more');
      const advancedSelect = firstCutOptions.querySelector('[data-field="rotationAllowed"]');
      const orientationSelect = firstCutOptions.querySelector('[data-field="orientation"]');
      const notesField = firstCutOptions.querySelector('[data-field="notes"]');
      const wofCheck = firstCutOptions.querySelector('[data-field="isWofStrip"]');
      const headingHint = document.querySelector('.cut-list-heading .hint');
      const pasteButton = document.querySelector('#open-paste-dialog');
      const fabricResetButton = document.querySelector('[data-reset-fabric-advanced]');
      const initialDiagramWidth = diagram.getBoundingClientRect().width;
      const initialDiagramHeight = diagram.getBoundingClientRect().height;
      const initialWrapperBounds = diagramWrapper.getBoundingClientRect();
      const initialDiagramBounds = diagram.getBoundingClientRect();
      const wrapperStyle = getComputedStyle(diagramWrapper);
      const resultHeading = document.querySelector('#results-heading');
      const zeroMarginResultSections = [
        '.fabric-decision',
        '.stock-allocations',
        '.purchased-allocation',
        '.leftover-summary',
      ].map((selector) => document.querySelector(selector));
      const plannerPage = document.querySelector('.page');
      const plannerPageBounds = plannerPage.getBoundingClientRect();
      const plannerHeroBounds = plannerPage
        .querySelector(':scope > .hero')
        .getBoundingClientRect();
      const plannerHelperBounds = plannerPage
        .querySelector(':scope > .first-use-helper')
        .getBoundingClientRect();
      const plannerFormBounds = document
        .querySelector('#planner-form')
        .getBoundingClientRect();
      const rootFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const desktopWideSectionsUsePageFrame = [
        '.page > #planner-results',
        '.page > .content-section',
      ].every((selector) => {
        const bounds = document.querySelector(selector).getBoundingClientRect();
        return (
          Math.abs(bounds.left - plannerPageBounds.left) <= 1 &&
          Math.abs(bounds.right - plannerPageBounds.right) <= 1
        );
      });
      const availableDiagramWidth = diagramWrapper.clientWidth - parseFloat(wrapperStyle.paddingLeft) - parseFloat(wrapperStyle.paddingRight);
      const availableDiagramHeight = diagramWrapper.clientHeight - parseFloat(wrapperStyle.paddingTop) - parseFloat(wrapperStyle.paddingBottom);
      diagramSlider.value = '10';
      diagramSlider.dispatchEvent(new Event('input', { bubbles: true }));
      const sliderDiagramWidth = diagram.getBoundingClientRect().width;
      const makeTouch = (identifier, clientX, clientY) =>
        new Touch({ identifier, target: diagramWrapper, clientX, clientY });
      diagramWrapper.dispatchEvent(new TouchEvent('touchstart', {
        bubbles: true,
        touches: [makeTouch(1, 100, 100), makeTouch(2, 200, 100)]
      }));
      diagramWrapper.dispatchEvent(new TouchEvent('touchmove', {
        bubbles: true,
        cancelable: true,
        touches: [makeTouch(1, 125, 100), makeTouch(2, 175, 100)]
      }));
      return {
        fabricCount: document.querySelectorAll('.fabric-card').length,
        cutRowCount: document.querySelectorAll('.cut-list-row').length,
        firstFabricCutCount: [...document.querySelectorAll('.cut-list-row [data-field="fabricId"]')]
          .filter((select) => select.value === restoredFirstFabric.dataset.fabricId).length,
        lastRowDeleteAllowsEmpty,
        lastRowUndoRestoresContent,
        pasteDialogClosed: !document.querySelector('#paste-dialog').open,
        pasteImported: [...document.querySelectorAll('.cut-list-row [data-field="label"]')]
          .some((field) => field.value === 'Paste-only, secret'),
        pasteDialogIsOpaque,
        pasteFieldHasLabelGap,
        repeatedFieldHelpUnique,
        actionHelpComplete,
        repeatedResultHelpUnique,
        detachedHelpMarks,
        visuallyDetachedHelpMarks,
        undoRestoredCut,
        stockPieceCount: document.querySelectorAll('.stock-piece').length,
        planNeedsRecalculation,
        stockAllocationVisible: resultText.includes('Existing-stock allocations') &&
          resultText.includes('Private remnant'),
        noPurchaseForStockFabric: document.querySelector('.fabric-result')
          .textContent.includes('No additional purchase needed'),
        stockSafetyGuidance: resultText.includes(
          'Safety allowance applies only to new purchases',
        ),
        patternComparisonVisible: resultText.includes('Pattern says') &&
          resultText.includes('Planned fresh-fabric requirement') &&
          resultText.includes('not like-for-like'),
        hasStockAndPurchasePlans:
          Boolean(document.querySelector('[data-material-kind="stock"]')) &&
          Boolean(document.querySelector('[data-material-kind="purchased"]')),
        shoppingSummaryUsesFullWidth:
          Math.abs(shoppingWrap.getBoundingClientRect().width - summaryContentWidth) <= 1,
        shoppingColumnsRemainReadable:
          shoppingCellWidths.every((width) => width >= 140),
        cutOptionsUseSeparateRows:
          cutOptionRows.length === document.querySelectorAll('.cut-list-row').length &&
          cutErrorRows.length === cutOptionRows.length &&
          cutErrorRows.every((row) => row.firstElementChild?.getAttribute('colspan') === '6') &&
          cutOptionRows.every((row) =>
            row.firstElementChild?.getAttribute('colspan') === '6'
          ),
        cutFieldLabelsAboveControls,
        cutRowPairHasNoInternalDivider:
          firstCutMainCellStyle.borderBottomWidth === '0px',
        cutOptionsCellHasEvenVerticalPadding:
          firstCutOptionsCellStyle.paddingTop ===
          firstCutOptionsCellStyle.paddingBottom,
        cutOptionsDetailsHasNoTopMargin:
          firstCutDetailsStyle.marginTop === '0px',
        cutOptionsStayInFlow:
          getComputedStyle(cutOptionPanel).position === 'static' &&
          getComputedStyle(cutOptionPanel).boxShadow === 'none',
        cutOptionActionsRemainVisible,
        desktopPageUsesSharedFrame:
          Math.abs(
            plannerPageBounds.width -
              Math.min(76 * rootFontSize, document.documentElement.clientWidth - 32),
          ) <= 1,
        desktopHeroUsesSharedMeasure:
          Math.abs(plannerHeroBounds.left - plannerPageBounds.left) <= 1 &&
          plannerHeroBounds.width <= 52 * rootFontSize + 1 &&
          plannerHeroBounds.right < plannerPageBounds.right - 1,
        desktopPlannerUsesSharedPageMeasures:
          Math.abs(plannerHelperBounds.left - plannerPageBounds.left) <= 1 &&
          plannerHelperBounds.width <= 52 * rootFontSize + 1 &&
          Math.abs(plannerFormBounds.left - plannerPageBounds.left) <= 1 &&
          Math.abs(plannerFormBounds.right - plannerPageBounds.right) <= 1 &&
          desktopWideSectionsUsePageFrame,
        desktopPageCentered:
          Math.abs(
            plannerPageBounds.left -
              (document.documentElement.clientWidth - plannerPageBounds.right),
          ) <= 1,
        cutOptionControlRowsAreAligned:
          [orientationSelect, notesField].every(
            (control) =>
              Math.abs(
                advancedSelect.getBoundingClientRect().bottom -
                  control.getBoundingClientRect().bottom,
              ) <= 1,
          ) &&
          Math.abs(
            (wofCheck.getBoundingClientRect().top + wofCheck.getBoundingClientRect().bottom) / 2 -
              (wofCheck.closest('.check-field').querySelector('.help-label').getBoundingClientRect().top + wofCheck.closest('.check-field').querySelector('.help-label').getBoundingClientRect().bottom) / 2,
          ) <= 1,
        cutOptionControlBounds: [advancedSelect, orientationSelect, notesField, wofCheck].map((control) => ({
          field: control.getAttribute('data-field'),
          top: control.getBoundingClientRect().top,
          bottom: control.getBoundingClientRect().bottom,
        })),
        cutListHintHasNoBottomMargin:
          parseFloat(getComputedStyle(headingHint).marginBottom) === 0,
        pasteButtonHasBottomMargin:
          parseFloat(getComputedStyle(pasteButton).marginBottom) >= 16,
        fabricResetHasTopMargin:
          parseFloat(getComputedStyle(fabricResetButton).marginTop) >= 16,
        plannerHeadingMatchesProtocol:
          document.querySelector('.hero .eyebrow').textContent.trim() ===
          'Fabric cutting planner',
        sectionHierarchyVisible:
          document.querySelector('#project-settings-heading').textContent.trim() ===
            'Set your project assumptions' &&
          document.querySelector('#fabrics-heading').textContent.trim() ===
            'Describe your project fabrics',
        resultHeadingHasNoTopMargin:
          parseFloat(getComputedStyle(resultHeading).marginTop) === 0,
        requestedResultSectionsHaveNoTopMargin:
          zeroMarginResultSections.every(
            (section) =>
              section && parseFloat(getComputedStyle(section).marginTop) === 0,
          ),
        labelsAssociated,
        hasSvg: Boolean(document.querySelector('.diagram-wrap svg')),
        hasTextPlan: resultText.includes('Text version of this allocation'),
        textPlanIsStructured:
          Boolean(textPlan?.querySelector('.text-plan-facts')) &&
          Boolean(textPlan?.querySelector('.text-plan-piece-groups')) &&
          Boolean(textPlan?.querySelector('.text-plan-strips')),
        emphasizedTextPlanValues: textPlan?.querySelectorAll('strong').length ?? 0,
        hasAssumptions: resultText.includes('Assumptions used'),
        planningComparisonCount: document.querySelectorAll('.planning-comparison').length,
        hasPositiveJointPlanningCopy: resultText.includes('Combined planning uses') && resultText.includes('less fabric length'),
        efficiencyContainsFacts:
          efficiencySummary?.textContent.includes('Used length:') &&
          efficiencySummary?.textContent.includes('Waste area:'),
        comparisonBodyFontSizesMatch:
          comparisonParagraphs.length >= 3 &&
          getComputedStyle(comparisonParagraphs[1]).fontSize ===
            getComputedStyle(comparisonParagraphs[2]).fontSize,
        usesImperialWasteArea: resultText.includes('Waste area: 150 in²'),
        efficiencyText: efficiencySummary?.textContent,
        leaksCanonicalWasteArea: resultText.includes('mm²'),
        copiedSummary: window.__copiedSummary,
        printRequested: window.__printRequested === true,
        exportedPdf: window.__exportedPdfData,
        exportedPdfFilename: window.__exportedPdfFilename,
        exportButtonLabel: document.querySelector('#export-pdf-result').innerText.replace(/\\s+/g, ' ').trim(),
        exportButtonRestored: !document.querySelector('#export-pdf-result').disabled,

        shareFallback,
        editFocusedProjectName: document.activeElement === document.querySelector('#project-name'),
        events: window.dataLayer,
        privateDataLeaked: [
          'Release secret project',
          'Private blue fabric',
          'Do not transmit this note',
          'Secret star piece',
          'Private piece note',
          'Private remnant',
          'Paste-only secret',
          'Navy Alias'
        ].some((value) => eventJson.includes(value)),
        storageContainsProject: localStorage.getItem('quiltclarity:planner-state')?.includes('Release secret project') ?? false,
        diagramZoom: {
          sliderVisible: getComputedStyle(document.querySelector('.diagram-zoom-controls')).display !== 'none',
          rangeIsOneToTen: Number(diagramSlider.min) === 0 && Number(diagramSlider.max) === 10,
          canvasIsSquare: Math.abs(initialWrapperBounds.width - initialWrapperBounds.height) <= 1,
          defaultDiagramFits:
            initialDiagramWidth <= availableDiagramWidth + 1 &&
            initialDiagramHeight <= availableDiagramHeight + 1 &&
            (Math.abs(initialDiagramWidth - availableDiagramWidth) <= 1 ||
              Math.abs(initialDiagramHeight - availableDiagramHeight) <= 1),
          defaultDiagramCentered:
            Math.abs(
              initialDiagramBounds.left + initialDiagramBounds.width / 2 -
                (initialWrapperBounds.left + initialWrapperBounds.width / 2),
            ) <= 1 &&
            Math.abs(
              initialDiagramBounds.top + initialDiagramBounds.height / 2 -
                (initialWrapperBounds.top + initialWrapperBounds.height / 2),
            ) <= 1,
          sliderScaledWidth: Math.abs(sliderDiagramWidth / initialDiagramWidth - 10) < 0.02,
          pinchSynchronizedValue: Number(diagramSlider.value),
          output: diagramOutput.value,
          touchAction: getComputedStyle(diagramWrapper).touchAction,
          allowsPageScrollChaining:
            getComputedStyle(diagramWrapper).overscrollBehaviorY === 'auto',
          darkCanvas: getComputedStyle(diagram).backgroundColor,
          darkFabric: getComputedStyle(diagram.querySelector('.fabric-outline')).fill,
          darkLabel: getComputedStyle(diagram.querySelector('.piece-label')).fill,
          darkLabelShadow: getComputedStyle(
            diagram.querySelector('feDropShadow'),
          ).floodColor,
        },
        contrastRatios: [
          contrastFor('body'),
          contrastFor('.lede'),
          contrastFor('#planner-form button[type="submit"]', 'self'),
          contrastFor('summary')
        ],
      };
    })()`,
  );

  await assertVisibleWordSpacing(client, 'generated planner result', 10);
  assert.equal(result.fabricCount, 2);
  assert.equal(result.cutRowCount, 3);
  assert.equal(result.firstFabricCutCount, 2);
  assert.equal(
    result.lastRowDeleteAllowsEmpty,
    true,
    'deleting the final cut row should reveal an actionable empty state',
  );
  assert.equal(
    result.lastRowUndoRestoresContent,
    true,
    'undo should restore the final deleted cut row without losing its values',
  );
  assert.equal(result.pasteDialogClosed, true);
  assert.equal(result.pasteImported, true);
  assert.equal(
    result.pasteDialogIsOpaque,
    true,
    'paste dialog should have an opaque surface',
  );
  assert.equal(
    result.pasteFieldHasLabelGap,
    true,
    'paste textarea should be visibly separated from its label',
  );
  assert.equal(
    result.repeatedFieldHelpUnique,
    true,
    'repeated planner fields should expose help only in their table header or first instance',
  );
  assert.equal(
    result.actionHelpComplete,
    true,
    'every planner action button should have adjacent controlled help',
  );
  assert.equal(
    result.repeatedResultHelpUnique,
    true,
    'repeated planner results should expose help only in their shared header or first instance',
  );
  assert.equal(
    result.detachedHelpMarks.length,
    0,
    `every visible question mark should share the rendered line of its target text: ${JSON.stringify(result.detachedHelpMarks)}`,
  );
  assert.equal(
    result.visuallyDetachedHelpMarks.length,
    0,
    `question marks should remain adjacent and vertically centered: ${JSON.stringify(result.visuallyDetachedHelpMarks)}`,
  );
  assert.equal(result.undoRestoredCut, true);
  assert.equal(result.stockPieceCount, 1);
  assert.equal(result.planNeedsRecalculation, true);
  assert.equal(result.stockAllocationVisible, true);
  assert.equal(result.noPurchaseForStockFabric, true);
  assert.equal(result.stockSafetyGuidance, true);
  assert.equal(result.patternComparisonVisible, true);
  assert.equal(result.hasStockAndPurchasePlans, true);
  assert.equal(
    result.shoppingSummaryUsesFullWidth,
    true,
    'desktop shopping table should span the result-summary content width',
  );
  assert.equal(
    result.shoppingColumnsRemainReadable,
    true,
    'desktop shopping columns should not collapse into narrow word stacks',
  );
  assert.equal(
    result.cutOptionsUseSeparateRows,
    true,
    'each desktop cut row should own one full-width options row',
  );
  assert.equal(
    result.cutFieldLabelsAboveControls,
    true,
    'desktop cut-row labels should remain visible directly above their controls',
  );
  assert.equal(
    result.cutRowPairHasNoInternalDivider,
    true,
    'the main cut row and its options row should not have an internal divider',
  );
  assert.equal(
    result.cutOptionsCellHasEvenVerticalPadding,
    true,
    'the cut-options cell should use even top and bottom padding',
  );
  assert.equal(
    result.cutOptionsDetailsHasNoTopMargin,
    true,
    'the More options disclosure should not add a top margin',
  );
  assert.equal(
    result.cutOptionsStayInFlow,
    true,
    'desktop cut options should remain in document flow without popup shadowing',
  );
  assert.equal(
    result.cutOptionActionsRemainVisible,
    true,
    'desktop cut-row actions should remain visible with 44px targets while options are collapsed',
  );
  assert.equal(
    result.desktopPageUsesSharedFrame,
    true,
    'the desktop planner should use the shared 76rem page frame',
  );
  assert.equal(
    result.desktopHeroUsesSharedMeasure,
    true,
    'the desktop planner hero should retain the shared constrained measure',
  );
  assert.equal(
    result.desktopPlannerUsesSharedPageMeasures,
    true,
    'the planner form, results, and supporting content should fill the shared page frame',
  );
  assert.equal(
    result.desktopPageCentered,
    true,
    'the shared desktop page frame should be centered',
  );
  assert.equal(
    result.cutOptionControlRowsAreAligned,
    true,
    `rotation, orientation and notes should bottom-align, while the WOF checkbox centers with its label: ${JSON.stringify(result.cutOptionControlBounds)}`,
  );
  assert.equal(
    result.cutListHintHasNoBottomMargin,
    true,
    'the cut-list heading hint should not add bottom margin',
  );
  assert.equal(
    result.pasteButtonHasBottomMargin,
    true,
    'the paste-from-spreadsheet button should retain bottom spacing',
  );
  assert.equal(
    result.fabricResetHasTopMargin,
    true,
    'the reset-fabric-defaults button should retain top spacing',
  );
  assert.equal(result.plannerHeadingMatchesProtocol, true);
  assert.equal(result.sectionHierarchyVisible, true);
  assert.equal(result.resultHeadingHasNoTopMargin, true);
  assert.equal(result.requestedResultSectionsHaveNoTopMargin, true);
  assert.equal(result.labelsAssociated, true);
  assert.equal(result.hasSvg, true);
  assert.equal(result.hasTextPlan, true);
  assert.equal(result.textPlanIsStructured, true);
  assert.ok(result.emphasizedTextPlanValues >= 8);
  assert.equal(result.hasAssumptions, true);
  assert.equal(result.planningComparisonCount, 1);
  assert.equal(result.hasPositiveJointPlanningCopy, true);
  assert.equal(result.efficiencyContainsFacts, true);
  assert.equal(result.comparisonBodyFontSizesMatch, true);
  assert.equal(
    result.usesImperialWasteArea,
    true,
    `Imperial waste-area fixture mismatch: ${result.efficiencyText}`,
  );
  assert.equal(result.leaksCanonicalWasteArea, false);
  assert.match(result.copiedSummary, /Release secret project/);
  assert.match(
    result.copiedSummary,
    /You need additional fabric for \d+ of \d+ fabrics\./,
  );
  assert.equal(
    result.printRequested,
    false,
    'planner export must not invoke native print',
  );
  assert.match(result.exportButtonLabel, /export PDF\s+for print/);
  assert.equal(result.exportButtonRestored, true);
  assert.match(result.exportedPdfFilename, /\.pdf$/);
  assert.ok(result.exportedPdf.startsWith('JVBER'));
  assert.equal(result.shareFallback, true);
  assert.equal(result.editFocusedProjectName, true);
  assert.equal(result.privateDataLeaked, false);
  assert.equal(result.storageContainsProject, true);
  assert.equal(result.diagramZoom.sliderVisible, true);
  assert.equal(result.diagramZoom.rangeIsOneToTen, true);
  assert.equal(result.diagramZoom.canvasIsSquare, true);
  assert.equal(result.diagramZoom.defaultDiagramFits, true);
  assert.equal(result.diagramZoom.defaultDiagramCentered, true);
  assert.equal(result.diagramZoom.sliderScaledWidth, true);
  assert.ok(Math.abs(result.diagramZoom.pinchSynchronizedValue - 6.99) < 0.02);
  assert.equal(result.diagramZoom.output, '5.0×');
  assert.equal(result.diagramZoom.touchAction, 'pan-x pan-y');
  assert.equal(result.diagramZoom.allowsPageScrollChaining, true);
  assert.equal(result.diagramZoom.darkCanvas, 'rgb(17, 22, 29)');
  assert.equal(result.diagramZoom.darkFabric, 'rgb(32, 40, 50)');
  assert.equal(result.diagramZoom.darkLabel, 'rgb(247, 249, 252)');
  assert.equal(result.diagramZoom.darkLabelShadow, 'rgb(0, 0, 0)');
  assert.ok(
    result.contrastRatios.every((ratio) => ratio >= 4.5),
    `key text contrast ratios should meet WCAG AA: ${result.contrastRatios.join(', ')}`,
  );
  const plannerEvents = result.events.map(({ name }) => name);
  for (const name of [
    'tool_viewed',
    'planner_started',
    'advanced_settings_opened',
    'fabric_added',
    'stock_piece_added',
    'cut_requirement_added',
    'cut_requirement_removed',
    'cutlist_paste_opened',
    'cutlist_paste_previewed',
    'cutlist_paste_completed',
    'pattern_yardage_added',
    'plan_calculation_started',
    'plan_calculation_completed',
    'purchase_shortfall_generated',
    'stock_allocation_viewed',
    'yardage_comparison_viewed',
    'cutting_plan_viewed',
    'optimization_completed',
    'print_result',
    'copy_shopping_list',
  ])
    assert.ok(plannerEvents.includes(name), `planner should emit ${name}`);
  const safeEventKeys = new Set([
    'name',
    'tool',
    'toolId',
    'returning_user',
    'calculator',
    'unit_system',
    'fabric_bucket',
    'requirement_bucket',
    'has_stock',
    'stock_piece_bucket',
    'has_pattern_comparison',
    'directional_used',
    'stock_source',
    'paste_rows_bucket',
    'paste_status',
    'has_pattern_wof',
    'purchase_needed',
    'completion_status',
    'error_category',
    'comparison_outcome',
    'savings_band',
  ]);
  assert.ok(
    result.events.every((event) =>
      Object.keys(event).every((key) => safeEventKeys.has(key)),
    ),
    'planner analytics should contain only allow-listed fields',
  );
  const completionEvent = result.events.find(
    ({ name }) => name === 'plan_calculation_completed',
  );
  assert.deepEqual(
    {
      unit_system: completionEvent.unit_system,
      fabric_bucket: completionEvent.fabric_bucket,
      requirement_bucket: completionEvent.requirement_bucket,
      has_stock: completionEvent.has_stock,
      stock_piece_bucket: completionEvent.stock_piece_bucket,
      has_pattern_comparison: completionEvent.has_pattern_comparison,
      purchase_needed: completionEvent.purchase_needed,
      completion_status: completionEvent.completion_status,
    },
    {
      unit_system: 'imperial',
      fabric_bucket: '2-3',
      requirement_bucket: '1-5',
      has_stock: true,
      stock_piece_bucket: '1',
      has_pattern_comparison: true,
      purchase_needed: true,
      completion_status: 'additional_purchase_required',
    },
  );
  const optimizationEvents = result.events.filter(
    ({ name }) => name === 'optimization_completed',
  );
  assert.equal(optimizationEvents.length, 2);
  assert.deepEqual(
    optimizationEvents.map(({ comparison_outcome }) => comparison_outcome),
    ['combined_shorter', 'not_applicable'],
  );
  assert.ok(
    optimizationEvents.every(({ savings_band }) =>
      [
        'none',
        'under_5_percent',
        '5_to_10_percent',
        '10_to_20_percent',
        'over_20_percent',
      ].includes(savings_band),
    ),
  );

  const accessibilityTree = await client.send('Accessibility.getFullAXTree');
  const accessibleNames = accessibilityTree.nodes
    .map((node) => node.name?.value)
    .filter(Boolean);
  assert.ok(accessibleNames.includes('Recalculate'));
  assert.ok(accessibleNames.includes('Project name (optional)'));

  console.log('  Print rendering check...');
  // Narrow screen geometry must not select mobile card styles for printed prose.
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await client.send('Emulation.setEmulatedMedia', { media: 'print' });
  const narrowPrintLayout = await evaluate(
    client,
    `(() => ({
      shoppingDisplay: getComputedStyle(document.querySelector('.shopping-table')).display,
      shoppingHeaderPosition: getComputedStyle(document.querySelector('.shopping-table thead')).position,
      shoppingBodyDisplay: getComputedStyle(document.querySelector('.shopping-table tbody')).display,
      mainMinimumHeight: getComputedStyle(document.querySelector('main')).minHeight,
      diagramMarginsReset: [...document.querySelectorAll('.diagram-print-page')].every(
        (page) => getComputedStyle(page).marginTop === '0px',
      ),
    }))()`,
  );
  assert.equal(narrowPrintLayout.shoppingDisplay, 'table');
  assert.equal(narrowPrintLayout.shoppingHeaderPosition, 'static');
  assert.equal(narrowPrintLayout.shoppingBodyDisplay, 'table-row-group');
  assert.equal(narrowPrintLayout.mainMinimumHeight, '0px');
  assert.equal(narrowPrintLayout.diagramMarginsReset, true);
  await client.send('Emulation.setEmulatedMedia', { media: 'screen' });
  await client.send('Emulation.clearDeviceMetricsOverride');

  const printContract = await evaluate(
    client,
    `(() => {
      const selectors = [
        '.result-summary',
        '.fabric-result .fabric-result-intro > h2',
        '.fabric-result .result-hero',
        '.fabric-result .fabric-decision',
        '.fabric-result .pattern-comparison',
        '.fabric-result .comparison-facts > div',
        '.fabric-result .stock-allocations > h3',
        '.fabric-result .stock-allocations > p',
        '.fabric-result .purchased-allocation > h3',
        '.fabric-result .purchased-allocation > p',
        '.fabric-result .leftover-summary',
        '.fabric-result .warnings',
        '.fabric-result .assumptions',
        '.fabric-result .material-plan-intro',
        '.fabric-result .material-plan-details > ol > li',
        '.fabric-result .diagram-print-page',
      ];
      const elements = [...new Set(selectors.flatMap((selector) => [
        ...document.querySelectorAll(selector),
      ]))];
      const markerStyles = document.createElement('style');
      markerStyles.id = 'print-audit-marker-styles';
      const markers = elements.map((element, index) => {
        const id = 'print-block-' + index;
        const contentLabel =
          element.matches('.diagram-print-page')
            ? element.querySelector('h3, h4, h5')?.textContent?.trim() || id
            : element.querySelector?.(':scope > h2, :scope > h3, :scope > h4, :scope > h5')?.textContent?.trim() ||
              element.textContent?.trim().slice(0, 80) ||
              id;
        const label =
          element.tagName.toLowerCase() +
          (element.classList.length
            ? '.' + [...element.classList].join('.')
            : '') +
          ': ' +
          contentLabel;
        const startColor = [1, 40 + index, 251];
        const endColor = [253, 40 + index, 3];
        element.dataset.printAuditMarkerId = id;
        markerStyles.textContent +=
          '[data-print-audit-marker-id="' + id + '"]{' +
          'box-shadow:inset 0 2px 0 rgb(' + startColor.join(',') +
          '),inset 0 -2px 0 rgb(' + endColor.join(',') +
          ')!important;}';
        return { id, label, startColor, endColor };
      });
      document.head.append(markerStyles);
      const markerId = (element) => element?.dataset.printAuditMarkerId;
      const samePageGroups = [];
      document.querySelectorAll('.fabric-result').forEach((result, index) => {
        samePageGroups.push({
          label: 'Fabric ' + (index + 1) + ' heading and recommendation',
          markerIds: [
            markerId(result.querySelector('.fabric-result-intro > h2')),
            markerId(result.querySelector('.fabric-result-intro > .result-hero')),
          ],
        });
        result
          .querySelectorAll('.stock-allocations, .purchased-allocation')
          .forEach((allocation) => {
            const heading = allocation.querySelector(':scope > h3');
            const firstContent = allocation.querySelector(
              ':scope > .material-plan .material-plan-intro, :scope > p',
            );
            samePageGroups.push({
              label: heading.textContent.trim() + ' heading and first content',
              markerIds: [markerId(heading), markerId(firstContent)],
            });
          });
      });
      const printableText = (element) => {
        const printable = element?.cloneNode(true);
        const explicitPrintLabel = printable?.querySelector('.print-help-label');
        if (explicitPrintLabel) return explicitPrintLabel.textContent.trim();
        printable
          ?.querySelectorAll('[data-context-help]')
          .forEach((help) => help.remove());
        return printable?.textContent?.replaceAll('\u2060', '').trim() || '';
      };
      const diagrams = [...document.querySelectorAll('.diagram-print-page')].map(
        (page, index) => {
          const heading = page.querySelector('h3, h4, h5');
          return {
            markerId: markerId(page),
            label: printableText(heading) || 'Diagram ' + (index + 1),
            orientation: page.dataset.printOrientation,
          };
        },
      );
      return {
        markers,
        samePageGroups,
        diagrams,
        closingTexts: [...document.querySelectorAll(
          '.fabric-result .leftover-summary, .fabric-result .assumptions, .fabric-result .warnings',
        )].flatMap((section) => [
          printableText(section.querySelector('h3')),
          ...[...section.querySelectorAll('p, li')].map((element) => element.textContent.trim()),
        ]).filter(Boolean),
        fabricHeadings: [...document.querySelectorAll('.fabric-result-intro > h2')]
          .map((heading) => printableText(heading)),
        buyNowHeadlines: [...document.querySelectorAll('.result-hero > strong')]
          .map((headline) => headline.textContent.trim()),
        mainHeading: document.querySelector('.hero h1').textContent.trim(),
        diagramSafeInsetPoints: 1.2 * 72 / 2.54,
      };
    })()`,
  );
  await client.send('Emulation.setEmulatedMedia', { media: 'print' });
  await evaluate(
    client,
    `new Promise((resolve) => {
      window.dispatchEvent(new Event('beforeprint'));
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    })`,
  );
  const printState = await evaluate(
    client,
    `(() => {
      const result = document.querySelector('.fabric-result');
      const diagramPage = result.querySelector('.diagram-print-page');
      const wrapper = diagramPage.querySelector('.diagram-wrap');
      const diagram = wrapper.querySelector('.cutting-diagram');
      const viewBox = diagram.viewBox.baseVal;
      const orientation = diagramPage.dataset.printOrientation;
      const graphicBounds = diagram.getBBox();
      const resultStyle = getComputedStyle(result);
      const diagramPageStyle = getComputedStyle(diagramPage);
      const diagramContentStyle = getComputedStyle(
        diagramPage.querySelector('.diagram-print-content'),
      );
      const wrapperStyle = getComputedStyle(wrapper);
      const diagramBounds = diagram.getBoundingClientRect();
      const fragmentationProtected = [
        ...document.querySelectorAll(
          '.fabric-result .result-hero, .fabric-result .fabric-decision, .fabric-result .pattern-comparison, .fabric-result .comparison-facts > div, .fabric-result .leftover-summary, .fabric-result .warnings, .fabric-result .assumptions, .fabric-result .material-plan-intro, .fabric-result .material-plan-details > ol > li',
        ),
      ];
      const allDiagramPages = [
        ...document.querySelectorAll('.diagram-print-page'),
      ];
      const cssPixelsPerPdfPoint = 96 / 72;
      const marginPoints = 1.2 * 72 / 2.54;
      const shortEdgePoints = 594.96 - 2 * marginPoints;
      const longEdgePoints = 841.92 - 2 * marginPoints;
      const printableWidth = Math.floor(
        orientation === 'landscape' ? longEdgePoints : shortEdgePoints,
      ) * cssPixelsPerPdfPoint;
      const printableHeightPoints = Math.floor(
        orientation === 'landscape' ? shortEdgePoints : longEdgePoints,
      );
      const printableHeight =
        (printableHeightPoints - 8) * cssPixelsPerPdfPoint;
      const diagramPageBounds = diagramPage.getBoundingClientRect();
      const wrapperBounds = wrapper.getBoundingClientRect();
      const diagramTop = Math.max(0, wrapperBounds.top - diagramPageBounds.top);
      const availableHeight = printableHeight - diagramTop;
      const availableWidth = Math.min(
        printableWidth,
        wrapper.clientWidth,
      );
      const expectedScale = Math.min(
        availableWidth / viewBox.width,
        availableHeight / viewBox.height,
      );
      return {
        formDisplay: getComputedStyle(document.querySelector('#planner-form')).display,
        actionsDisplay: getComputedStyle(document.querySelector('.result-actions')).display,
        diagramVisible: wrapperStyle.display !== 'none',
        orientation,
        declaredOrientation: diagramPage.dataset.printOrientation,
        detailsPageName: resultStyle.page,
        diagramPageName: diagramPageStyle.page,
        resultDisplay: resultStyle.display,
        resultBreakBefore: resultStyle.breakBefore,
        diagramIsFinalPrintableChild:
          [...diagramPage.closest('.material-plan').children]
            .filter((child) => getComputedStyle(child).display !== 'none')
            .at(-1) === diagramPage,
        diagramPageDisplay: diagramPageStyle.display,
        diagramPageHeight: diagramPageStyle.height,
        diagramContentDisplay: diagramContentStyle.display,
        diagramContentBreakInside: diagramContentStyle.breakInside,
        diagramBreakBefore: diagramPageStyle.breakBefore,
        fragmentationProtected:
          fragmentationProtected.length >= 12 &&
          fragmentationProtected.every((element) =>
            getComputedStyle(element).breakInside.includes('avoid'),
          ),
        everyDiagramOwnsProtectedPage:
          allDiagramPages.length >= 2 &&
          allDiagramPages.every((page) => {
            const pageStyle = getComputedStyle(page);
            const pageDiagram = page.querySelector('.cutting-diagram');
            const pageWrapper = page.querySelector('.diagram-wrap');
            const pageBounds = pageDiagram.getBoundingClientRect();
            const pageOrientation = page.dataset.printOrientation;
            const maximumWidth =
              Math.floor(
                pageOrientation === 'landscape'
                  ? longEdgePoints
                  : shortEdgePoints,
              ) *
              cssPixelsPerPdfPoint;
            const finalPrintableChild = [
              ...page.closest('.material-plan').children,
            ]
              .filter((child) => getComputedStyle(child).display !== 'none')
              .at(-1);
            return (
              pageStyle.breakInside.includes('avoid') &&
              pageStyle.page === 'diagram-' + pageOrientation &&
              finalPrintableChild === page &&
              getComputedStyle(pageWrapper).overflow === 'visible' &&
              pageBounds.width > 0 &&
              pageBounds.width <= maximumWidth + 1
            );
          }),
        diagramWidth: diagramBounds.width,
        diagramHeight: diagramBounds.height,
        expectedDiagramWidth: viewBox.width * expectedScale,
        expectedDiagramHeight: viewBox.height * expectedScale,
        printableHeight,
        diagramWithinAtomicPage:
          diagramBounds.top >= diagramPageBounds.top - 0.01 &&
          diagramBounds.right <= diagramPageBounds.right + 0.01 &&
          diagramBounds.bottom <= diagramPageBounds.bottom + 0.01,
        graphicInsets: {
          top: graphicBounds.y - viewBox.y,
          right: viewBox.x + viewBox.width - graphicBounds.x - graphicBounds.width,
          bottom: viewBox.y + viewBox.height - graphicBounds.y - graphicBounds.height,
          left: graphicBounds.x - viewBox.x
        },
        resultBorderWidth: resultStyle.borderTopWidth,
        wrapperBorderWidth: wrapperStyle.borderTopWidth,
        wrapperPadding: wrapperStyle.paddingTop,
        zoomControlsDisplay: getComputedStyle(
          diagramPage.querySelector('.diagram-zoom-controls'),
        ).display,
        pinchHintDisplay: getComputedStyle(
          diagramPage.querySelector('.diagram-pinch-hint'),
        ).display,
        diagramBackground: getComputedStyle(diagram).backgroundColor,
        fabricFill: getComputedStyle(
          diagram.querySelector('.fabric-outline'),
        ).fill,
        printClearance: (() => {
          const style = getComputedStyle(
            diagram.querySelector('.print-label-clearance'),
          );
          return {
            display: style.display,
            fill: style.fill,
            stroke: style.stroke,
            strokeWidth: style.strokeWidth,
          };
        })(),
        diagramFitsPrintableWidth: diagramBounds.width <= printableWidth + 1
      };
    })()`,
  );
  assert.equal(printState.formDisplay, 'none');
  assert.equal(printState.actionsDisplay, 'none');
  assert.equal(printState.diagramVisible, true);
  assert.equal(printState.declaredOrientation, printState.orientation);
  assert.equal(printState.detailsPageName, 'auto');
  assert.equal(printState.diagramPageName, `diagram-${printState.orientation}`);
  assert.equal(printState.resultDisplay, 'block');
  assert.equal(printState.resultBreakBefore, 'page');
  assert.equal(printState.diagramIsFinalPrintableChild, true);
  assert.equal(printState.diagramPageDisplay, 'block');
  assert.notEqual(printState.diagramPageHeight, '0px');
  assert.equal(printState.diagramContentDisplay, 'inline-block');
  assert.ok(printState.diagramContentBreakInside.includes('avoid'));
  assert.equal(printState.diagramBreakBefore, 'page');
  assert.equal(printState.everyDiagramOwnsProtectedPage, true);
  assert.ok(printState.diagramWidth > 0);
  assert.ok(printState.diagramHeight > 0);
  assert.ok(
    Math.abs(printState.diagramWidth - printState.expectedDiagramWidth) < 1,
    `diagram width should match exact print fit: ${JSON.stringify(printState)}`,
  );
  assert.ok(
    Math.abs(printState.diagramHeight - printState.expectedDiagramHeight) < 1,
    `diagram height should match exact print fit: ${JSON.stringify(printState)}`,
  );
  assert.ok(
    Object.values(printState.graphicInsets).every(
      (inset) => inset > 0.5 && inset < 7,
    ),
    `diagram viewBox must retain a positive unclipped crop inset: ${JSON.stringify(printState.graphicInsets)}`,
  );
  assert.equal(printState.resultBorderWidth, '0px');
  assert.equal(printState.wrapperBorderWidth, '0px');
  assert.equal(printState.wrapperPadding, '0px');
  assert.equal(printState.zoomControlsDisplay, 'none');
  assert.equal(printState.pinchHintDisplay, 'none');
  assert.equal(printState.diagramBackground, 'rgb(255, 255, 255)');
  assert.equal(printState.fabricFill, 'rgb(255, 255, 255)');
  assert.deepEqual(printState.printClearance, {
    display: 'block',
    fill: 'rgb(255, 255, 255)',
    stroke: 'rgb(255, 255, 255)',
    strokeWidth: '7px',
  });
  assert.equal(printState.diagramFitsPrintableWidth, true);
  assert.equal(printState.diagramWithinAtomicPage, true);
  if (process.env.QUILTCLARITY_PRINT_DEBUG)
    console.log('  Print geometry:', printState);
  await evaluate(
    client,
    `document.querySelector('#print-audit-marker-styles').disabled = true`,
  );
  const cleanPdf = await client.send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,
  });
  await evaluate(
    client,
    `document.querySelector('#print-audit-marker-styles').disabled = false`,
  );
  if (process.env.QUILTCLARITY_PRINT_PDF_DIR) {
    await mkdir(process.env.QUILTCLARITY_PRINT_PDF_DIR, { recursive: true });
    await writeFile(
      path.join(process.env.QUILTCLARITY_PRINT_PDF_DIR, 'planner-clean.pdf'),
      Buffer.from(cleanPdf.data, 'base64'),
    );
  }
  if (process.env.QUILTCLARITY_PRINT_DEBUG)
    console.log('  Clean print pages:', parsePrintedPdf(cleanPdf.data).length);
  const cleanPrint = await assertCleanPrintContract(
    cleanPdf.data,
    printContract,
  );
  assert.equal(cleanPrint.pages.length, 7);
  const exportArtifactsDirectory = path.join(ROOT, 'tmp', 'pdfs');
  await mkdir(exportArtifactsDirectory, { recursive: true });
  await writeFile(
    path.join(exportArtifactsDirectory, 'planner-export.pdf'),
    Buffer.from(result.exportedPdf, 'base64'),
  );
  await writeFile(
    path.join(exportArtifactsDirectory, 'planner-native-multi.pdf'),
    Buffer.from(cleanPdf.data, 'base64'),
  );
  const exportedPrint = await assertCleanPrintContract(
    result.exportedPdf,
    printContract,
  );
  await assertPrintContentParity(
    result.exportedPdf,
    cleanPdf.data,
    printContract,
  );
  assert.ok(exportedPrint.pages.length >= printContract.diagrams.length + 2);
  // The same result must export identically at phone/tablet widths, including
  // after an unsupported-label error. This checks the actual PDF, not CSS.
  for (const width of [390, 820]) {
    await client.send('Emulation.setEmulatedMedia', { media: 'screen' });
    await client.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: true,
    });
    const mobileExport = await evaluate(
      client,
      `(async () => {
      const button = document.querySelector('#export-pdf-result');
      const originals = [...document.querySelectorAll('svg.cutting-diagram')]
        .map((svg) => svg.outerHTML);
      const originalUrl = URL.createObjectURL;
      const originalClick = HTMLAnchorElement.prototype.click;
      let pending;
      URL.createObjectURL = (blob) => {
        pending = blob.arrayBuffer().then((buffer) => {
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let offset = 0; offset < bytes.length; offset += 16384)
            binary += String.fromCharCode(...bytes.subarray(offset, offset + 16384));
          return btoa(binary);
        });
        return originalUrl.call(URL, blob);
      };
      HTMLAnchorElement.prototype.click = function () {
        if (!this.download.endsWith('.pdf')) return originalClick.call(this);
      };
      const run = async () => {
        button.click();
        const started = performance.now();
        while (button.disabled) {
          if (performance.now() - started > 15000) throw new Error('Export retry timed out');
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
      };
      try {
        const heading = document.querySelector('.fabric-result-intro > h2');
        const label = heading.innerHTML;
        heading.textContent = 'Unsupported \\u{1F9F5}';
        await run();
        const failureShown = document.querySelector('#action-status').textContent
          .includes('The bundled PDF font cannot print');
        heading.innerHTML = label;
        await run();
        if (!pending) throw new Error('PDF retry did not produce a file');
        return {
          data: await pending, failureShown,
          restored: !button.disabled && !button.hasAttribute('aria-busy'),
          fallbackLink: !!document.querySelector('#action-status a[download$=".pdf"]'),
          unchanged: originals.every((svg, index) => svg ===
            document.querySelectorAll('svg.cutting-diagram')[index].outerHTML),
        };
      } finally {
        URL.createObjectURL = originalUrl;
        HTMLAnchorElement.prototype.click = originalClick;
      }
    })()`,
    );
    assert.equal(mobileExport.failureShown, true);
    assert.equal(mobileExport.restored, true);
    assert.equal(mobileExport.fallbackLink, true);
    assert.equal(mobileExport.unchanged, true);
    const mobilePrint = await assertCleanPrintContract(
      mobileExport.data,
      printContract,
    );
    assert.deepEqual(
      mobilePrint.pages.map(({ width, height }) => [width, height]),
      exportedPrint.pages.map(({ width, height }) => [width, height]),
    );
  }
  await client.send('Emulation.clearDeviceMetricsOverride');
  await client.send('Emulation.setEmulatedMedia', { media: 'print' });

  // Exercise an engine that ignores named-page assignment. This is a bounded
  // fallback regression, not a substitute for physical iPhone print evidence.
  await evaluate(
    client,
    `(() => {
      const style = document.createElement('style');
      style.id = 'print-unnamed-page-audit';
      style.textContent = '@media print { .diagram-print-page { page: auto !important; } }';
      document.head.append(style);
    })()`,
  );
  const unnamedPagePdf = await client.send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,
  });
  await assertCleanPrintContract(unnamedPagePdf.data, {
    ...printContract,
    diagrams: printContract.diagrams.map((diagram) => ({
      ...diagram,
      orientation: 'portrait',
    })),
  });
  await evaluate(
    client,
    `document.querySelector('#print-unnamed-page-audit').remove()`,
  );
  const pdf = await client.send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,
  });
  assert.ok(pdf.data.startsWith('JVBER'));
  assert.ok(pdf.data.length > 10_000);
  if (process.env.QUILTCLARITY_PRINT_PDF_DIR) {
    await mkdir(process.env.QUILTCLARITY_PRINT_PDF_DIR, { recursive: true });
    await writeFile(
      path.join(
        process.env.QUILTCLARITY_PRINT_PDF_DIR,
        'planner-two-fabrics.pdf',
      ),
      Buffer.from(pdf.data, 'base64'),
    );
  }
  const renderedPrint = await assertRenderedPrintContract(
    pdf.data,
    printContract,
  );
  assert.equal(renderedPrint.pages.length, 7);
  await evaluate(
    client,
    `document.querySelectorAll('.fabric-result')[1].style.setProperty('display', 'none', 'important')`,
  );
  const oneFabricPdf = await client.send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,
  });
  if (process.env.QUILTCLARITY_PRINT_PDF_DIR) {
    await writeFile(
      path.join(
        process.env.QUILTCLARITY_PRINT_PDF_DIR,
        'planner-one-fabric.pdf',
      ),
      Buffer.from(oneFabricPdf.data, 'base64'),
    );
  }
  const oneFabricContent = await evaluate(
    client,
    `(() => {
      const fabric = document.querySelector('.fabric-result');
      const headingText = (element) =>
        element.querySelector('.print-help-label')?.textContent.trim() ||
        element.textContent.trim();
      return {
        diagramIds: [...fabric.querySelectorAll('.diagram-print-page')]
          .map((page) => page.dataset.printAuditMarkerId),
        fabricHeadings: [headingText(fabric.querySelector('.fabric-result-intro > h2'))],
        buyNowHeadlines: [fabric.querySelector('.result-hero > strong').textContent.trim()],
        closingTexts: [...fabric.querySelectorAll('.leftover-summary, .assumptions, .warnings')]
          .flatMap((section) => [
            headingText(section.querySelector('h3')),
            ...[...section.querySelectorAll('p, li')].map((element) => element.textContent.trim()),
          ]).filter(Boolean),
      };
    })()`,
  );
  await evaluate(
    client,
    `document.querySelector('#print-audit-marker-styles').disabled = true`,
  );
  const cleanOneFabricPdf = await client.send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,
  });
  await assertCleanPrintContract(cleanOneFabricPdf.data, {
    ...printContract,
    ...oneFabricContent,
    diagrams: printContract.diagrams.filter((diagram) =>
      oneFabricContent.diagramIds.includes(diagram.markerId),
    ),
  });
  const oneFabricPages = parsePrintedPdf(oneFabricPdf.data);
  assert.equal(oneFabricPages.length, 4);
  assert.ok(
    oneFabricPages.every(({ hasText }) => hasText),
    'the one-fabric PDF must not contain blank sheets',
  );
  await evaluate(
    client,
    `(() => {
      document.querySelectorAll('.fabric-result')[1].style.removeProperty('display');
      document.querySelectorAll('.print-audit-marker').forEach((marker) => marker.remove());
      document.querySelector('#print-audit-marker-styles')?.remove();
      document.querySelectorAll('[data-print-audit-marker-id]').forEach((element) =>
        element.removeAttribute('data-print-audit-marker-id'),
      );
    })()`,
  );
  await client.send('Emulation.setEmulatedMedia', { media: 'screen' });

  const fabricResultGap = await evaluate(
    client,
    `(() => {
      const results = [...document.querySelectorAll('.fabric-result')];
      const first = results[0].getBoundingClientRect();
      const second = results[1].getBoundingClientRect();
      return second.top - first.bottom;
    })()`,
  );
  assert.ok(
    fabricResultGap >= 23,
    'multiple fabric diagram sections need a visible gap',
  );

  const stockValidation = await evaluate(
    client,
    `(async () => {
      const stockWidth = document.querySelector('.stock-piece [data-field="width"]');
      stockWidth.value = '0';
      stockWidth.dispatchEvent(new Event('input', { bubbles: true }));
      window.scrollTo(0, document.documentElement.scrollHeight);
      document.querySelector('#planner-form').requestSubmit();
      await new Promise((resolve) => setTimeout(resolve, 500));
      const invalidBounds = stockWidth.getBoundingClientRect();
      const result = {
        errorVisible: !document.querySelector('#planner-errors').hidden,
        invalid: stockWidth.getAttribute('aria-invalid'),
        describedBy: stockWidth.getAttribute('aria-describedby'),
        summaryText: document.querySelector('#planner-errors').textContent,
        resultsHidden: document.querySelector('#planner-results').hidden,
        firstInvalidFocused: document.activeElement === stockWidth,
        firstInvalidVisible:
          invalidBounds.top >= 0 && invalidBounds.bottom <= innerHeight,
        failedTracked: window.dataLayer.some(
          (event) => event.name === 'plan_calculation_failed' &&
            event.error_category === 'validation'
        ),
      };
      stockWidth.value = '10';
      stockWidth.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('#planner-form').requestSubmit();
      await new Promise((resolve) => setTimeout(resolve, 30));
      return result;
    })()`,
  );
  assert.equal(stockValidation.errorVisible, true);
  assert.equal(stockValidation.invalid, 'true');
  assert.match(
    stockValidation.describedBy,
    /^planner-errors .+-error(?:-\d+)?$/,
  );
  assert.ok(
    stockValidation.summaryText.includes(
      'Private blue fabric — Private remnant: Stock width must be greater than zero.',
    ),
  );
  assert.equal(stockValidation.resultsHidden, true);
  assert.equal(stockValidation.firstInvalidFocused, true);
  assert.equal(stockValidation.firstInvalidVisible, true);
  assert.equal(stockValidation.failedTracked, true);

  const desktopCutRowValidation = await evaluate(
    client,
    `(async () => {
      const row = document.querySelector('.cut-list-row');
      const quantity = row.querySelector('[data-field="quantity"]');
      const width = row.querySelector('[data-field="width"]');
      const originalQuantity = quantity.value;
      const originalWidth = width.value;
      quantity.value = '0';
      width.value = '0';
      quantity.dispatchEvent(new Event('input', { bubbles: true }));
      width.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('#planner-form').requestSubmit();
      await new Promise((resolve) => setTimeout(resolve, 500));
      const errorRow = row.nextElementSibling;
      const messages = [...errorRow.querySelectorAll('li')].map((item) =>
        item.textContent.trim()
      );
      const inlineErrors = [...row.querySelectorAll('.cut-field-error')];
      const result = {
        rowVisible: !errorRow.hidden && getComputedStyle(errorRow).display === 'table-row',
        rowSpansWidth:
          errorRow.firstElementChild.getBoundingClientRect().width >=
            row.getBoundingClientRect().width - 1,
        messages,
        messagesVertical:
          messages.length === 2 &&
          errorRow.querySelectorAll('li')[1].getBoundingClientRect().top >
            errorRow.querySelectorAll('li')[0].getBoundingClientRect().bottom,
        inlineErrorsHidden:
          inlineErrors.length === 2 &&
          inlineErrors.every((error) => getComputedStyle(error).display === 'none'),
        bothFieldsInvalid:
          quantity.getAttribute('aria-invalid') === 'true' &&
          width.getAttribute('aria-invalid') === 'true',
        firstInvalidFocused: document.activeElement === width,
      };
      quantity.value = originalQuantity;
      width.value = originalWidth;
      quantity.dispatchEvent(new Event('input', { bubbles: true }));
      width.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('#planner-form').requestSubmit();
      await new Promise((resolve) => setTimeout(resolve, 100));
      return {
        ...result,
        correctedStateCleared:
          !document.querySelector('.dynamic-field-error') &&
          !document.querySelector('[aria-invalid="true"]') &&
          document.querySelector('#planner-errors').hidden,
        focusMovedToResults:
          document.activeElement === document.querySelector('#planner-results'),
      };
    })()`,
  );
  assert.equal(desktopCutRowValidation.rowVisible, true);
  assert.equal(desktopCutRowValidation.rowSpansWidth, true);
  assert.equal(desktopCutRowValidation.messagesVertical, true);
  assert.equal(desktopCutRowValidation.inlineErrorsHidden, true);
  assert.equal(desktopCutRowValidation.bothFieldsInvalid, true);
  assert.equal(desktopCutRowValidation.firstInvalidFocused, true);
  assert.equal(desktopCutRowValidation.correctedStateCleared, true);
  assert.equal(desktopCutRowValidation.focusMovedToResults, true);
  assert.ok(
    desktopCutRowValidation.messages.some((message) =>
      message.startsWith('Width:'),
    ),
  );
  assert.ok(
    desktopCutRowValidation.messages.some((message) =>
      message.startsWith('Quantity:'),
    ),
  );

  const unusedFabricValidation = await evaluate(
    client,
    `(async () => {
      const wait = async (predicate) => {
        const started = performance.now();
        while (!predicate()) {
          if (performance.now() - started > 5000) throw new Error('UI wait timed out');
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
      };
      document.querySelector('#add-fabric').click();
      await wait(() => document.querySelectorAll('.fabric-card').length === 3);
      const unusedFabric = [...document.querySelectorAll('.fabric-card')].at(-1);
      const name = unusedFabric.querySelector('[data-field="name"]');
      window.scrollTo(0, document.documentElement.scrollHeight);
      document.querySelector('#planner-form').requestSubmit();
      await new Promise((resolve) => setTimeout(resolve, 500));
      const bounds = name.getBoundingClientRect();
      const result = {
        message: document.querySelector('#planner-errors').textContent,
        inlineMessage: name.nextElementSibling?.textContent ?? '',
        focused: document.activeElement === name,
        visible: bounds.top >= 0 && bounds.bottom <= innerHeight,
      };
      unusedFabric.querySelector('[data-remove-fabric]').click();
      await wait(() => document.querySelectorAll('.fabric-card').length === 2);
      document.querySelector('#planner-form').requestSubmit();
      await wait(() => !document.querySelector('#planner-results').hidden);
      return result;
    })()`,
  );
  assert.ok(
    unusedFabricValidation.message.includes(
      '“Fabric C” has no cut requirements. Assign at least one cut row to this fabric or remove it.',
    ),
  );
  assert.equal(
    unusedFabricValidation.inlineMessage,
    '“Fabric C” has no cut requirements. Assign at least one cut row to this fabric or remove it.',
  );
  assert.equal(unusedFabricValidation.focused, true);
  assert.equal(unusedFabricValidation.visible, true);

  const validation = await evaluate(
    client,
    `(async () => {
      const usable = document.querySelector('.fabric-card [data-field="usableWidth"]');
      usable.value = '0';
      usable.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('#planner-form').requestSubmit();
      await new Promise((resolve) => setTimeout(resolve, 30));
      return {
        errorVisible: !document.querySelector('#planner-errors').hidden,
        invalid: usable.getAttribute('aria-invalid'),
        describedBy: usable.getAttribute('aria-describedby'),
        resultsHidden: document.querySelector('#planner-results').hidden,
      };
    })()`,
  );
  assert.equal(validation.errorVisible, true);
  assert.equal(validation.invalid, 'true');
  assert.match(validation.describedBy, /^planner-errors .+-error(?:-\d+)?$/);
  assert.equal(validation.resultsHidden, true);

  console.log('  Performance fallback and persistence checks...');
  const performance = await evaluate(
    client,
    `(async () => {
      const usable = document.querySelector('.fabric-card [data-field="usableWidth"]');
      usable.value = '40';
      usable.dispatchEvent(new Event('input', { bubbles: true }));
      const quantity = document.querySelector('.cut-list-row [data-field="quantity"]');
      quantity.value = '500';
      quantity.dispatchEvent(new Event('input', { bubbles: true }));
      const started = performance.now();
      document.querySelector('#planner-form').requestSubmit();
      const elapsed = performance.now() - started;
      return {
        elapsed,
        warned: ['bounded grouped strip strategy', 'bounded strip-friendly strategy set']
          .some((message) => document.querySelector('#planner-results').textContent.includes(message)),
        visible: !document.querySelector('#planner-results').hidden,
      };
    })()`,
  );
  assert.equal(performance.visible, true);
  assert.equal(performance.warned, true);
  assert.ok(
    performance.elapsed < 5_000,
    `fallback took ${performance.elapsed}ms`,
  );
  console.log(
    `  500-piece fallback rendered in ${performance.elapsed.toFixed(1)}ms.`,
  );

  await client.send('Page.reload', { ignoreCache: true });
  await waitFor(
    async () =>
      evaluate(
        client,
        `document.readyState === 'complete' && document.querySelector('#project-name')?.value === 'Release secret project'`,
      ),
    'saved planner state to restore',
  );
  await client.send('Page.removeScriptToEvaluateOnNewDocument', {
    identifier: mobileSignals.identifier,
  });
}

async function runThemeAudit(client) {
  console.log('  Theme preference checks...');
  await client.send('Emulation.setEmulatedMedia', {
    media: 'screen',
    features: [{ name: 'prefers-color-scheme', value: 'dark' }],
  });
  await navigate(client, '/', '#theme-toggle');
  const systemDark = await evaluate(
    client,
    `(() => {
      const toggle = document.querySelector('#theme-toggle');
      const thumb = toggle.querySelector('.theme-toggle-thumb');
      return {
        theme: document.documentElement.dataset.theme,
        checked: toggle.getAttribute('aria-checked'),
        colorScheme: getComputedStyle(document.documentElement).colorScheme,
        storage: localStorage.getItem('quiltclarity:theme'),
        themeColor: document.querySelector('meta[name="theme-color"]').content,
        trackColor: getComputedStyle(toggle, '::before').backgroundColor,
        thumbColor: getComputedStyle(thumb).backgroundColor,
        trackHeight: getComputedStyle(toggle, '::before').height,
        thumbHeight: getComputedStyle(thumb).height,
        thumbShadow: getComputedStyle(thumb).boxShadow,
        thumbFilter: getComputedStyle(thumb).filter,
        thumbMask: getComputedStyle(thumb).maskImage,
        thumbRotation: (() => {
          const matrix = new DOMMatrix(getComputedStyle(thumb).transform);
          return Math.round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI);
        })(),
        rayInset: getComputedStyle(thumb, '::before').top,
        sunDisplay: getComputedStyle(thumb, '::before').display,
        diagonalRayDisplay: getComputedStyle(thumb, '::after').display,
      };
    })()`,
  );
  assert.equal(systemDark.theme, 'dark');
  assert.equal(systemDark.checked, 'true');
  assert.equal(systemDark.colorScheme, 'dark');
  assert.equal(systemDark.storage, null);
  assert.equal(systemDark.themeColor, '#131014');
  assert.equal(systemDark.trackColor, 'rgb(23, 35, 63)');
  assert.equal(systemDark.thumbColor, 'rgb(248, 251, 255)');
  assert.equal(systemDark.trackHeight, '24px');
  assert.equal(systemDark.thumbHeight, '20px');
  assert.equal(systemDark.thumbShadow, 'none');
  assert.match(systemDark.thumbFilter, /drop-shadow/);
  assert.match(systemDark.thumbMask, /radial-gradient/);
  assert.equal(systemDark.thumbRotation, 20);
  assert.equal(systemDark.rayInset, '-8px');
  assert.equal(systemDark.sunDisplay, 'none');
  assert.equal(systemDark.diagonalRayDisplay, 'none');

  const selectedLight = await evaluate(
    client,
    `(async () => {
      document.querySelector('#theme-toggle').click();
      await Promise.all(
        document
          .getAnimations({ subtree: true })
          .map((animation) => animation.finished.catch(() => undefined)),
      );
      const toggle = document.querySelector('#theme-toggle');
      const thumb = toggle.querySelector('.theme-toggle-thumb');
      return {
        theme: document.documentElement.dataset.theme,
        checked: toggle.getAttribute('aria-checked'),
        storage: localStorage.getItem('quiltclarity:theme'),
        trackColor: getComputedStyle(toggle, '::before').backgroundColor,
        thumbColor: getComputedStyle(thumb).backgroundColor,
        sunOpacity: getComputedStyle(thumb, '::before').opacity,
        diagonalRayOpacity: getComputedStyle(thumb, '::after').opacity,
      };
    })()`,
  );
  assert.deepEqual(selectedLight, {
    theme: 'light',
    checked: 'false',
    storage: 'light',
    trackColor: 'rgb(255, 248, 223)',
    thumbColor: 'rgb(255, 200, 55)',
    sunOpacity: '1',
    diagonalRayOpacity: '1',
  });

  await navigate(client, '/calculators/', '#theme-toggle');
  assert.equal(
    await evaluate(
      client,
      `document.documentElement.dataset.theme + ':' + document.querySelector('#theme-toggle').getAttribute('aria-checked')`,
    ),
    'light:false',
  );

  await evaluate(client, `document.querySelector('#theme-toggle').click()`);
  assert.equal(
    await evaluate(client, `localStorage.getItem('quiltclarity:theme')`),
    'dark',
  );

  for (const [canonical, legacy, expected] of [
    [null, 'light', 'light'],
    [null, 'dark', 'dark'],
    ['light', 'dark', 'light'],
    ['invalid', 'light', 'dark'],
    [null, 'invalid', 'dark'],
  ]) {
    await evaluate(
      client,
      `(() => {
        localStorage.removeItem('quiltclarity:theme');
        localStorage.removeItem('quilter:theme');
        const canonical = ${JSON.stringify(canonical)};
        const legacy = ${JSON.stringify(legacy)};
        if (canonical !== null) localStorage.setItem('quiltclarity:theme', canonical);
        if (legacy !== null) localStorage.setItem('quilter:theme', legacy);
      })()`,
    );
    await navigate(client, '/', '#theme-toggle');
    assert.equal(
      await evaluate(client, `document.documentElement.dataset.theme`),
      expected,
      `theme migration: canonical=${canonical}, legacy=${legacy}`,
    );
    if (canonical === null && (legacy === 'light' || legacy === 'dark')) {
      assert.equal(
        await evaluate(client, `localStorage.getItem('quiltclarity:theme')`),
        legacy,
      );
    }
  }
  await evaluate(
    client,
    `(() => {
      localStorage.removeItem('quiltclarity:theme');
      localStorage.setItem('quilter:theme', 'light');
    })()`,
  );
  const blockedThemeWrite = await client.send(
    'Page.addScriptToEvaluateOnNewDocument',
    {
      source: `(() => {
        const originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function(key, value) {
          if (key === 'quiltclarity:theme') throw new Error('Test blocked theme migration write');
          return originalSetItem.call(this, key, value);
        };
      })()`,
    },
  );
  try {
    await navigate(client, '/', '#theme-toggle');
    assert.equal(
      await evaluate(client, `document.documentElement.dataset.theme`),
      'light',
      'a failed migration write must preserve the saved legacy theme',
    );
    assert.equal(
      await evaluate(client, `localStorage.getItem('quiltclarity:theme')`),
      null,
    );
  } finally {
    await client.send('Page.removeScriptToEvaluateOnNewDocument', {
      identifier: blockedThemeWrite.identifier,
    });
  }
  await navigate(client, '/', '#theme-toggle');
  await evaluate(client, `localStorage.removeItem('quilter:theme')`);
  await evaluate(client, `localStorage.setItem('quiltclarity:theme', 'dark')`);
}

async function runCalculatorAudit(client) {
  console.log('  Calculator-to-planner check...');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1001,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: 1001,
    screenHeight: 900,
  });
  await navigate(client, '/calculators/fabric-yardage/', '.calculator-form');
  const result = await evaluate(
    client,
    `(async () => {
      const form = document.querySelector('.calculator-form');
      const quantity = form.querySelector('[name="quantity"]');
      quantity.value = '20';
      quantity.dispatchEvent(new Event('input', { bubbles: true }));
      form.requestSubmit();
      await new Promise((resolve) => setTimeout(resolve, 30));
      const add = document.querySelector('[data-add-to-planner]');
      const resultVisible = !document.querySelector('.calculator-result').hidden;
      const formWidth = form.getBoundingClientRect().width;
      const shellColumns = getComputedStyle(document.querySelector('.calculator-shell'))
        .gridTemplateColumns.trim()
        .split(/\\s+/).length;
      const fieldColumns = getComputedStyle(form.querySelector('.form-grid'))
        .gridTemplateColumns.trim()
        .split(/\\s+/).length;
      const toolControls = [
        ...form.querySelectorAll('input, select, textarea'),
      ];
      const fieldHelpComplete = toolControls.every((control) =>
        [...control.labels].some((label) =>
          label.closest('.help-label')?.querySelector('.context-help'),
        ),
      );
      const actionButtons = [
        ...document.querySelectorAll(
          '.calculator-form button:not(.context-help-trigger), .calculator-result button:not(.context-help-trigger)',
        ),
      ];
      const actionHelpComplete = actionButtons.every((button) =>
        button.closest('[data-action-help]')?.querySelector('[data-action-help-tooltip]'),
      );
      const resultConceptLabels = [
        ...document.querySelectorAll(
          '.calculator-result h2, .calculator-result h3, .calculator-result .result-hero > span, .calculator-result .metric > span, .calculator-result .calculator-diagram summary',
        ),
      ];
      const resultHelpComplete = resultConceptLabels.every((label) =>
        label.querySelector('.context-help'),
      );
      add.click();
      window.print = () => { window.__calculatorPrintRequested = true; };
      document.querySelector('[data-print]').click();
      await new Promise((resolve) => setTimeout(resolve, 20));
      const saved = JSON.parse(localStorage.getItem('quiltclarity:planner-state'));
      return {
        resultVisible,
        addVisible: !add.hidden,
        formWidth,
        shellColumns,
        fieldColumns,
        fieldHelpComplete,
        actionHelpComplete,
        resultHelpComplete,
        events: window.dataLayer,
        printRequested: window.__calculatorPrintRequested === true,
        savedSchemaVersion: saved.schemaVersion,
        projectSchemaVersion: saved.project.schemaVersion,
        savedPieceCount: saved.project.cutRequirements.length,
      };
    })()`,
  );
  await assertVisibleWordSpacing(client, 'generated calculator result', 1);
  assert.equal(result.resultVisible, true);
  assert.equal(result.addVisible, true);
  assert.equal(result.shellColumns, 2);
  assert.ok(result.formWidth >= 520 && result.formWidth <= 720);
  assert.equal(result.fieldColumns, 2);
  assert.equal(result.fieldHelpComplete, true);
  assert.equal(result.actionHelpComplete, true);
  assert.equal(result.resultHelpComplete, true);
  assert.equal(result.savedSchemaVersion, 2);
  assert.equal(result.projectSchemaVersion, 2);
  assert.ok(result.savedPieceCount >= 3);
  assert.equal(result.printRequested, true);
  const eventNames = result.events.map(({ name }) => name);
  for (const name of [
    'tool_viewed',
    'calculator_started',
    'calculator_completed',
    'calculator_result_printed',
    'calculator_to_project',
  ])
    assert.ok(eventNames.includes(name), `calculator should emit ${name}`);

  console.log('  Remediated domain calculator checks...');
  await navigate(
    client,
    '/calculators/half-square-triangle/',
    '.calculator-form',
  );
  const hst = await evaluate(
    client,
    `(() => {
      const form = document.querySelector('.calculator-form');
      form.querySelector('[name="finishedSize"]').value = '4';
      form.querySelector('[name="quantity"]').value = '10';
      form.querySelector('[name="method"]').value = 'four-at-a-time';
      form.querySelector('[name="sizingMode"]').value = 'trim-friendly';
      form.requestSubmit();
      return document.querySelector('.calculator-result').textContent;
    })()`,
  );
  assert.ok(
    hst.includes('7.25 in'),
    'HST trim-friendly result should be 7.25 inches',
  );
  assert.ok(hst.includes('bias outer edges'));

  await navigate(client, '/calculators/quilt-batting/', '.calculator-form');
  const batting = await evaluate(
    client,
    `(() => {
      document.querySelector('.calculator-form').requestSubmit();
      return document.querySelector('.calculator-result').textContent;
    })()`,
  );
  assert.ok(batting.includes('68 in × 88 in'));
  assert.ok(batting.includes('88 in from a 72 in roll'));

  await navigate(
    client,
    '/calculators/quarter-square-triangle/',
    '.calculator-form',
  );
  const qst = await evaluate(
    client,
    `(() => {
      document.querySelector('.calculator-form').requestSubmit();
      return document.querySelector('.calculator-result').textContent;
    })()`,
  );
  assert.ok(qst.includes('5.5 in'));
  assert.ok(qst.includes('Starting squares per fabric'));

  await navigate(client, '/calculators/flying-geese/', '.calculator-form');
  const geese = await evaluate(
    client,
    `(() => {
      const form = document.querySelector('.calculator-form');
      form.requestSubmit();
      const width = form.querySelector('[name="finishedWidth"]');
      width.value = '5';
      form.requestSubmit();
      return {
        result: document.querySelector('.calculator-result').textContent,
        invalid: width.getAttribute('aria-invalid'),
        errors: document.querySelector('.calculator-errors').textContent,
        errorTracked: window.dataLayer.some(
          (event) => event.name === 'calculator_error' &&
            event.error_category === 'validation'
        ),
      };
    })()`,
  );
  assert.equal(geese.invalid, 'true');
  assert.ok(geese.errors.includes('2:1 finished width-to-height ratio'));
  assert.equal(geese.errorTracked, true);

  await navigate(
    client,
    '/calculators/pieces-from-fabric/',
    '.calculator-form',
  );
  const piecesFromFabric = await evaluate(
    client,
    `(() => {
      const form = document.querySelector('.calculator-form');
      form.requestSubmit();
      return {
        text: document.querySelector('.calculator-result').textContent,
        hasDiagram: Boolean(document.querySelector('.calculator-result svg')),
        hasTextPlan: Boolean(document.querySelector('.calculator-result .text-plan')),
        quantityHidden: form.querySelector('[name="quantity"]').closest('.field').hidden,
      };
    })()`,
  );
  assert.ok(piecesFromFabric.text.includes('Practical capacity'));
  assert.ok(piecesFromFabric.text.includes('12 pieces'));
  assert.equal(piecesFromFabric.hasDiagram, true);
  assert.equal(piecesFromFabric.hasTextPlan, true);
  assert.equal(piecesFromFabric.quantityHidden, true);

  await navigate(client, '/calculators/quilt-backing/', '.calculator-form');
  const backing = await evaluate(
    client,
    `(() => {
      document.querySelector('.calculator-form').requestSubmit();
      return document.querySelector('.calculator-result').textContent;
    })()`,
  );
  assert.ok(backing.includes('Lowest-yardage option'));
  assert.ok(backing.includes('vertical candidate'));
  assert.ok(backing.includes('horizontal candidate'));
  assert.ok(backing.includes('confirm their preferences'));

  await navigate(client, '/calculators/borders/', '.calculator-form');
  const borders = await evaluate(
    client,
    `(() => {
      document.querySelector('.calculator-form').requestSubmit();
      return document.querySelector('.calculator-result').textContent;
    })()`,
  );
  assert.ok(borders.includes('Nominal side-border length'));
  assert.ok(borders.includes('Nominal top/bottom-border length'));
  assert.ok(borders.includes('Planning yardage'));
  assert.ok(
    borders.includes('measure the assembled quilt top through the center'),
  );

  await navigate(client, '/calculators/sashing/', '.calculator-form');
  const sashing = await evaluate(
    client,
    `(() => {
      document.querySelector('.calculator-form').requestSubmit();
      return document.querySelector('.calculator-result').textContent;
    })()`,
  );
  assert.ok(sashing.includes('Row-wise sashing'));
  assert.ok(sashing.includes('No cornerstones'));
  assert.ok(sashing.includes('Yardage includes the fabric consumed by joins'));

  console.log('  Calculator breakpoint checks...');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1000,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: 1000,
    screenHeight: 900,
  });
  await navigate(client, '/calculators/fabric-yardage/', '.calculator-shell');
  const thousandPixelLayout = await evaluate(
    client,
    `(() => ({
      shellColumns: getComputedStyle(document.querySelector('.calculator-shell'))
        .gridTemplateColumns.trim().split(/\\s+/).length,
      fieldColumns: getComputedStyle(document.querySelector('.calculator-form .form-grid'))
        .gridTemplateColumns.trim().split(/\\s+/).length,
    }))()`,
  );
  assert.equal(thousandPixelLayout.shellColumns, 1);
  assert.equal(thousandPixelLayout.fieldColumns, 2);

  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 800,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: 800,
    screenHeight: 900,
  });
  const eightHundredPixelLayout = await evaluate(
    client,
    `(() => ({
      fieldColumns: getComputedStyle(document.querySelector('.calculator-form .form-grid'))
        .gridTemplateColumns.trim().split(/\\s+/).length,
      noPageOverflow: document.documentElement.scrollWidth <= innerWidth,
    }))()`,
  );
  assert.equal(eightHundredPixelLayout.fieldColumns, 1);
  assert.equal(eightHundredPixelLayout.noPageOverflow, true);

  await navigate(client, '/fabric-cutting-planner/', '#planner-form');
  await evaluate(
    client,
    `localStorage.removeItem('quiltclarity:planner-state')`,
  );
  await navigate(client, '/fabric-cutting-planner/', '#planner-form');
  await assertMultipleCutRowLabels(client);
  const intermediateCutErrorLayout = await evaluate(
    client,
    `(async () => {
      const cutOptions = document.querySelector('.cut-row-options');
      cutOptions.querySelector('details').open = true;
      const rotation = cutOptions.querySelector('[data-field="rotationAllowed"]');
      const orientation = cutOptions.querySelector('[data-field="orientation"]');
      const wof = cutOptions
        .querySelector('[data-field="isWofStrip"]');
      const notes = cutOptions.querySelector('.cut-row-notes');
      const quantity = document.querySelector('.cut-list-row [data-field="quantity"]');
      quantity.value = '0';
      quantity.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('#planner-form').requestSubmit();
      await new Promise((resolve) => setTimeout(resolve, 500));
      const cell = quantity.closest('td');
      const label = cell.querySelector('.cut-field-label');
      const error = cell.querySelector('.cut-field-error');
      const labelBounds = label.getBoundingClientRect();
      const fieldBounds = quantity.getBoundingClientRect();
      const errorBounds = error.getBoundingClientRect();
      const errorPrefix = error.querySelector('.cut-field-error-prefix');
      return {
        twoColumnField:
          getComputedStyle(cell).gridTemplateColumns.trim().split(/\\s+/).length === 2 &&
          fieldBounds.left > labelBounds.left,
        errorSitsBelowField:
          errorBounds.left >= fieldBounds.left - 1 &&
          errorBounds.right >= fieldBounds.right - 1 &&
          errorBounds.top >= fieldBounds.bottom,
        redundantFieldNameHidden:
          getComputedStyle(errorPrefix).display === 'none' &&
          !error.innerText.trim().startsWith('Quantity:'),
        rowSummaryHidden:
          getComputedStyle(document.querySelector('.cut-row-errors')).display === 'none',
        fieldFocused: document.activeElement === quantity,
        cutOptionPrimaryControlsAligned: [orientation].every(
          (control) =>
            Math.abs(
              rotation.getBoundingClientRect().bottom -
                control.getBoundingClientRect().bottom,
            ) <= 1,
        ) && Math.abs(
          (wof.getBoundingClientRect().top + wof.getBoundingClientRect().bottom) / 2 -
          (wof.closest('.check-field').querySelector('.help-label').getBoundingClientRect().top +
           wof.closest('.check-field').querySelector('.help-label').getBoundingClientRect().bottom) / 2
        ) <= 1,
        cutOptionNotesUsesWideRow:
          notes.getBoundingClientRect().width >=
          rotation.getBoundingClientRect().width * 2,
        noPageOverflow: document.documentElement.scrollWidth <= innerWidth,
        bounds: {
          label: { left: labelBounds.left, right: labelBounds.right, bottom: labelBounds.bottom },
          field: { left: fieldBounds.left, right: fieldBounds.right, bottom: fieldBounds.bottom },
          error: { left: errorBounds.left, right: errorBounds.right, top: errorBounds.top },
        },
      };
    })()`,
  );
  assert.equal(intermediateCutErrorLayout.twoColumnField, true);
  assert.equal(
    intermediateCutErrorLayout.errorSitsBelowField,
    true,
    JSON.stringify(intermediateCutErrorLayout),
  );
  assert.equal(intermediateCutErrorLayout.rowSummaryHidden, true);
  assert.equal(intermediateCutErrorLayout.redundantFieldNameHidden, true);
  assert.equal(intermediateCutErrorLayout.fieldFocused, true);
  assert.equal(
    intermediateCutErrorLayout.cutOptionPrimaryControlsAligned,
    true,
    'at 800px, selects should bottom-align and WOF should center with its label',
  );
  assert.equal(
    intermediateCutErrorLayout.cutOptionNotesUsesWideRow,
    true,
    'at 800px, Notes should use at least two available grid tracks',
  );
  assert.equal(intermediateCutErrorLayout.noPageOverflow, true);

  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: 390,
    screenHeight: 844,
  });
  await navigate(client, '/fabric-cutting-planner/', '#planner-form');
  const classicScrollbarLayout = await evaluate(
    client,
    `(() => {
      const viewportWidth = document.documentElement.clientWidth;
      return {
        innerWidth,
        viewportWidth,
        scrollWidth: document.documentElement.scrollWidth,
        noPageOverflow: document.documentElement.scrollWidth <= viewportWidth,
        offenders: [...document.querySelectorAll('body *')]
          .map((element) => {
            const bounds = element.getBoundingClientRect();
            return {
              tag: element.tagName,
              id: element.id,
              className: typeof element.className === 'string' ? element.className : '',
              left: bounds.left,
              right: bounds.right,
              width: bounds.width,
            };
          })
          .filter(
            ({ className, left, right }) =>
              className !== 'skip-link' &&
              (left < -0.5 || right > viewportWidth + 0.5),
          ),
      };
    })()`,
  );
  assert.equal(
    classicScrollbarLayout.noPageOverflow,
    true,
    JSON.stringify(classicScrollbarLayout),
  );
  assert.deepEqual(classicScrollbarLayout.offenders, []);
}

async function assertMultipleCutRowLabels(client) {
  const labels = await evaluate(
    client,
    `(async () => {
      const initialCount = document.querySelectorAll('.cut-list-row').length;
      document.querySelector('[data-duplicate-cut]').click();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const rows = [...document.querySelectorAll('.cut-list-row')];
      const result = {
        rowCount: rows.length,
        expectedCount: initialCount + 1,
        everyLabelVisibleAndAssociated: rows.every((row) =>
          [...row.querySelectorAll('td')].every((cell) => {
            const label = cell.querySelector('.cut-field-label');
            const control = cell.querySelector('input, select');
            if (!label || !control || label.htmlFor !== control.id) return false;
            const bounds = label.getBoundingClientRect();
            const style = getComputedStyle(label);
            return bounds.width > 0 && bounds.height > 0 &&
              style.visibility === 'visible' && label.innerText.trim().length > 0;
          }),
        ),
      };
      document.querySelectorAll('[data-remove-cut]')[rows.length - 1].click();
      return result;
    })()`,
  );
  assert.equal(labels.rowCount, labels.expectedCount);
  assert.ok(labels.rowCount >= 2);
  assert.equal(
    labels.everyLabelVisibleAndAssociated,
    true,
    'every cut-row field needs a visible associated label, including later rows',
  );
}

async function runMobileAudit(client) {
  console.log('  Narrow mobile viewport check...');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
    screenWidth: 390,
    screenHeight: 844,
  });
  await client.send('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 5,
  });

  try {
    await navigate(client, '/fabric-cutting-planner/', '#planner-form');
    await evaluate(
      client,
      `localStorage.removeItem('quiltclarity:planner-state')`,
    );
    await navigate(client, '/fabric-cutting-planner/', '#planner-form');

    await assertMultipleCutRowLabels(client);
    const planner = await evaluate(
      client,
      `(async () => {
        const wait = async (predicate) => {
          const started = performance.now();
          while (!predicate()) {
            if (performance.now() - started > 5000) throw new Error('Mobile UI wait timed out');
            await new Promise((resolve) => setTimeout(resolve, 20));
          }
        };
        const visible = (element) => {
          const style = getComputedStyle(element);
          return style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            element.getClientRects().length > 0;
        };
        const formControls = [...document.querySelectorAll(
          '#planner-form button, #planner-form input:not([type="checkbox"]), #planner-form select, #planner-form textarea',
        )].filter(visible);
        const controlsFit = formControls.every((element) => {
          const rect = element.getBoundingClientRect();
          return rect.left >= -0.5 && rect.right <= innerWidth + 0.5;
        });
        const controlsAreTallEnough = formControls.every(
          (element) => element.getBoundingClientRect().height >= 44,
        );
        const header = document.querySelector('.site-header');
        const brand = header.querySelector('.brand').getBoundingClientRect();
        const navigation = header.querySelector('nav').getBoundingClientRect();
        const projectGrid = document.querySelector('#planner-form .form-grid');
        const projectColumns = getComputedStyle(projectGrid).gridTemplateColumns
          .trim()
          .split(/\\s+/).length;

        document.querySelector('#open-paste-dialog').click();
        const pasteDialog = document.querySelector('#paste-dialog');
        const pasteSource = document.querySelector('#paste-source');
        pasteSource.value =
          'Fabric,Label,Qty,Width,Height,Size mode,This deliberately long value verifies horizontal input overflow';
        const pasteSourceStyle = getComputedStyle(pasteSource);
        const pasteSourceScrollsHorizontally =
          pasteSource.scrollWidth > pasteSource.clientWidth &&
          pasteSourceStyle.whiteSpace === 'pre' &&
          pasteSource.getAttribute('wrap') === 'off';
        const singlePasteRowDoesNotCreateVerticalOverflow =
          pasteSource.scrollHeight <= pasteSource.clientHeight + 1;
        pasteDialog.close();

        const cutRow = document.querySelector('.cut-list-row');
        const cutRowCells = [...cutRow.querySelectorAll('td')];
        const cutErrorRow = cutRow.nextElementSibling;
        const cutOptionsRow = document.querySelector('.cut-row-options');
        const cutOptionsDetails = cutOptionsRow.querySelector('details');
        cutOptionsDetails.open = false;
        const cutOptionButtons = [...cutOptionsRow.querySelectorAll(
          '.cut-row-more-actions button',
        )];
        const cutOptionActionsRemainVisible = cutOptionButtons.every(
          (button) => visible(button) && button.getBoundingClientRect().height >= 44,
        );
        cutOptionsDetails.open = true;
        const cutOptionsPanel = cutOptionsRow.querySelector('.cut-row-more');

        const mobileQuantity = document.querySelector('[data-field="quantity"]');
        mobileQuantity.value = '0';
        mobileQuantity.dispatchEvent(new Event('input', { bubbles: true }));
        document.querySelector('#planner-form').requestSubmit();
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mobileQuantityCell = mobileQuantity.closest('td');
        const mobileQuantityLabel = mobileQuantityCell.querySelector('.cut-field-label');
        const mobileQuantityError = mobileQuantityCell.querySelector('.cut-field-error');
        const mobileCellBounds = mobileQuantityCell.getBoundingClientRect();
        const mobileLabelBounds = mobileQuantityLabel.getBoundingClientRect();
        const mobileFieldBounds = mobileQuantity.getBoundingClientRect();
        const mobileErrorBounds = mobileQuantityError.getBoundingClientRect();
        const narrowFieldLayoutStacks =
          getComputedStyle(mobileQuantityCell).gridTemplateColumns.trim().split(/\\s+/).length === 1 &&
          mobileLabelBounds.bottom <= mobileFieldBounds.top + 1 &&
          mobileFieldBounds.width >= mobileCellBounds.width - 1;
        const narrowErrorUsesFullWidth =
          mobileErrorBounds.top >= mobileFieldBounds.bottom &&
          mobileErrorBounds.left <= mobileCellBounds.left + 1 &&
          mobileErrorBounds.right >= mobileCellBounds.right - 1;
        const narrowErrorHidesRedundantFieldName =
          getComputedStyle(
            mobileQuantityError.querySelector('.cut-field-error-prefix')
          ).display === 'none' &&
          !mobileQuantityError.innerText.trim().startsWith('Quantity:');
        const narrowInvalidFieldFocused = document.activeElement === mobileQuantity;

        mobileQuantity.value = '1';
        mobileQuantity.dispatchEvent(new Event('input', { bubbles: true }));
        document.querySelector('[data-field="width"]').value = '2';
        document.querySelector('[data-field="height"]').value = '12';
        document.querySelector('[data-field="rotationAllowed"]').value = 'false';
        document.querySelector('[data-field="patternStatedAmount"]').value = '0.5';
        document.querySelector('[data-field="patternAssumedUsableWidth"]').value = '44';
        document.querySelector('#planner-form').requestSubmit();
        await wait(() => !document.querySelector('#planner-results').hidden);

        const resultControls = [...document.querySelectorAll(
          '#planner-results button',
        )].filter(visible);
        const hasNoSideCardChrome = (element) => {
          const style = getComputedStyle(element);
          return (
            style.borderLeftWidth === '0px' &&
            style.borderRightWidth === '0px' &&
            parseFloat(style.paddingLeft) === 0 &&
            parseFloat(style.paddingRight) === 0
          );
        };
        const fabricResult = document.querySelector('.fabric-result');
        const fabricResultStyle = getComputedStyle(fabricResult);
        const fabricCardStyle = getComputedStyle(
          document.querySelector('.fabric-card'),
        );
        const nestedResultSections = [
          document.querySelector('.fabric-decision'),
          document.querySelector('.pattern-comparison'),
          document.querySelector('.material-plan'),
          document.querySelector('.text-plan'),
        ].filter(Boolean);
        const decisionAndPatternCards = [
          ...document.querySelectorAll(
            '.fabric-decision .comparison-facts > div, .pattern-comparison .comparison-facts > div',
          ),
        ];
        const textPlanCards = [
          ...document.querySelectorAll('.text-plan-facts > div'),
          ...document.querySelectorAll('.text-plan-strip'),
        ];
        const shoppingWrap = document.querySelector('.shopping-table-wrap');
        const shoppingRows = [...shoppingWrap.querySelectorAll('tbody tr')];
        const shoppingCells = [...shoppingWrap.querySelectorAll('tbody th, tbody td')];
        const brandBounds = document.querySelector('.brand').getBoundingClientRect();
        const themeBounds = document.querySelector('#theme-toggle').getBoundingClientRect();
        const diagramWrap = document.querySelector('.diagram-wrap');
        const diagram = diagramWrap.querySelector('.cutting-diagram');
        const pieceLabel = diagram.querySelector(
          '.piece-label:not(.print-label-clearance)',
        );
        const zoomControls = document.querySelector('.diagram-zoom-controls');
        const zoomSlider = document.querySelector('[data-diagram-zoom-slider]');
        const initialMobileDiagramWidth = diagram.getBoundingClientRect().width;
        const initialMobileDiagramHeight = diagram.getBoundingClientRect().height;
        const initialMobileDiagramBounds = diagram.getBoundingClientRect();
        const initialMobileOutput = document.querySelector('[data-diagram-zoom-output]').value;
        const initialDiagramWrapBounds = diagramWrap.getBoundingClientRect();
        const diagramWrapStyle = getComputedStyle(diagramWrap);
        const availableDiagramWidth = diagramWrap.clientWidth - parseFloat(diagramWrapStyle.paddingLeft) - parseFloat(diagramWrapStyle.paddingRight);
        const availableDiagramHeight = diagramWrap.clientHeight - parseFloat(diagramWrapStyle.paddingTop) - parseFloat(diagramWrapStyle.paddingBottom);
        const makeTouch = (identifier, clientX, clientY) =>
          new Touch({ identifier, target: diagramWrap, clientX, clientY });
        diagramWrap.dispatchEvent(new TouchEvent('touchstart', {
          bubbles: true,
          touches: [makeTouch(1, 100, 100), makeTouch(2, 200, 100)]
        }));
        diagramWrap.dispatchEvent(new TouchEvent('touchmove', {
          bubbles: true,
          cancelable: true,
          touches: [makeTouch(1, 75, 100), makeTouch(2, 225, 100)]
        }));
        return {
          width: innerWidth,
          noPageOverflow: document.documentElement.scrollWidth <= innerWidth,
          headerStacked: navigation.top >= brand.bottom - 1,
          projectColumns,
          cutListUsesCards:
            getComputedStyle(cutRow).display === 'block' &&
            cutRowCells.every((cell) => getComputedStyle(cell).display !== 'table-cell'),
          cutListLabelsPreserved: cutRowCells.every((cell) =>
            Boolean(cell.querySelector('.cut-field-label')) &&
            cell.querySelector('.cut-field-label').htmlFor ===
              cell.querySelector('input, select').id,
          ),
          cutOptionsFollowMainRow:
            cutRow.nextElementSibling === cutErrorRow &&
            cutErrorRow.nextElementSibling === cutOptionsRow &&
            getComputedStyle(cutOptionsRow).display === 'block',
          cutOptionsStayInFlow:
            getComputedStyle(cutOptionsPanel).position === 'static' &&
            cutOptionsPanel.getBoundingClientRect().width <= innerWidth,
          cutOptionActionsRemainVisible,
          nestedInputSectionsFlattened:
            hasNoSideCardChrome(cutRow) &&
            hasNoSideCardChrome(cutOptionsPanel),
          mainInputCardPreserved:
            parseFloat(fabricCardStyle.borderLeftWidth) > 0 &&
            parseFloat(fabricCardStyle.paddingLeft) > 0,
          plannerColumnCentered: (() => {
            const pageBounds = document
              .querySelector('.page')
              .getBoundingClientRect();
            const formBounds = document
              .querySelector('#planner-form')
              .getBoundingClientRect();
            const resultBounds = document
              .querySelector('#planner-results')
              .getBoundingClientRect();
            return (
              Math.abs(
                pageBounds.left -
                  (document.documentElement.clientWidth - pageBounds.right),
              ) <= 1 &&
              Math.abs(formBounds.left - pageBounds.left) <= 1 &&
              Math.abs(formBounds.right - pageBounds.right) <= 1 &&
              Math.abs(resultBounds.left - pageBounds.left) <= 1 &&
              Math.abs(resultBounds.right - pageBounds.right) <= 1
            );
          })(),
          topLevelPlannerWidthsEqual: (() => {
            const pageBounds = document
              .querySelector('.page')
              .getBoundingClientRect();
            return [
              '.page > .hero',
              '.page > .first-use-helper',
              '.page > #planner-form',
              '.page > #planner-results',
              '.page > .content-section',
            ].every((selector) => {
              const bounds = document.querySelector(selector).getBoundingClientRect();
              return (
                Math.abs(bounds.left - pageBounds.left) <= 1 &&
                Math.abs(bounds.right - pageBounds.right) <= 1
              );
            });
          })(),
          mainResultCardPreserved:
            parseFloat(fabricResultStyle.borderLeftWidth) > 0 &&
            parseFloat(fabricResultStyle.paddingLeft) > 0,
          nestedResultSectionsFlattened:
            nestedResultSections.length === 4 &&
            nestedResultSections.every(hasNoSideCardChrome) &&
            shoppingRows.every(hasNoSideCardChrome),
          decisionAndPatternCardsRestored:
            decisionAndPatternCards.length >= 8 &&
            decisionAndPatternCards.every((card) => {
              const style = getComputedStyle(card);
              return (
                parseFloat(style.borderLeftWidth) > 0 &&
                parseFloat(style.paddingLeft) > 0 &&
                style.backgroundColor !== 'rgba(0, 0, 0, 0)'
              );
            }),
          textPlanCardsRestored:
            textPlanCards.length > 4 &&
            textPlanCards.every((card) => {
              const style = getComputedStyle(card);
              return (
                parseFloat(style.borderLeftWidth) > 0 &&
                parseFloat(style.paddingLeft) > 0 &&
                style.backgroundColor !== 'rgba(0, 0, 0, 0)'
              );
            }),
          controlsFit,
          controlsAreTallEnough,
          narrowFieldLayoutStacks,
          narrowErrorUsesFullWidth,
          narrowErrorHidesRedundantFieldName,
          narrowInvalidFieldFocused,
          pasteSourceScrollsHorizontally,
          singlePasteRowDoesNotCreateVerticalOverflow,
          resultControlsAreTallEnough: resultControls.every(
            (element) => element.getBoundingClientRect().height >= 44,
          ),
          resultsVisible: !document.querySelector('#planner-results').hidden,
          shoppingRowsUseCards:
            shoppingRows.every((row) => getComputedStyle(row).display === 'block') &&
            shoppingCells.every((cell) => getComputedStyle(cell).display === 'grid'),
          shoppingLabelsPreserved: shoppingCells.every(
            (cell) => Boolean(cell.dataset.label) &&
              getComputedStyle(cell, '::before').content !== 'none',
          ),
          shoppingDoesNotScrollHorizontally:
            shoppingWrap.scrollWidth <= shoppingWrap.clientWidth + 1,
          shoppingCaptionUsesFullWidth:
            shoppingWrap.querySelector('caption').getBoundingClientRect().width >=
            shoppingWrap.clientWidth - 1,
          thinPieceLabelIsVisible:
            diagram.querySelectorAll('.piece').length ===
              diagram.querySelectorAll('.piece-label-clip').length &&
            Number(pieceLabel?.dataset.labelFontSize) > 0,
          thinPieceLabelRotatedBeforeScaling:
            pieceLabel?.dataset.labelOrientation === 'vertical' &&
            Number(pieceLabel?.dataset.labelFontSize) >= 12 &&
            Number(pieceLabel?.dataset.labelFontSize) <= 15 &&
            pieceLabel?.getAttribute('transform')?.startsWith('rotate(-90 '),
          diagramContained: [...document.querySelectorAll('.diagram-wrap')].every(
            (element) => element.getBoundingClientRect().right <= innerWidth + 0.5,
          ),
          themeOpposesBrand:
            themeBounds.left > brandBounds.right &&
            themeBounds.top < brandBounds.top &&
            themeBounds.right <= innerWidth,
          mobileZoomRange:
            Number(zoomSlider.min) === 0 && Number(zoomSlider.max) === 10,
          smallScreenDefaultIsTwoTimesFit:
            Math.abs(
              initialMobileDiagramWidth /
                Math.min(
                  availableDiagramWidth,
                  availableDiagramHeight *
                    (diagram.viewBox.baseVal.width / diagram.viewBox.baseVal.height),
                ) -
                2,
            ) < 0.02 && initialMobileOutput === '2.0×',
          wideMobileDiagramCentered:
            initialMobileDiagramWidth > availableDiagramWidth &&
            initialMobileDiagramHeight < availableDiagramHeight &&
            Math.abs(
              initialMobileDiagramBounds.top + initialMobileDiagramBounds.height / 2 -
                (initialDiagramWrapBounds.top + initialDiagramWrapBounds.height / 2),
            ) <= 1,
          mobileZoomControlsHidden: getComputedStyle(zoomControls).display === 'none',
          mobilePinchZoomed:
            Math.abs(diagram.getBoundingClientRect().width / initialMobileDiagramWidth - 1.5) < 0.02 &&
            Math.abs(Number(zoomSlider.value) - 4.77) < 0.02,
          diagramUsesSquareViewport:
            Math.abs(initialDiagramWrapBounds.height - initialDiagramWrapBounds.width) <= 1,
          noResultOverflow: document.documentElement.scrollWidth <= innerWidth,
        };
      })()`,
    );

    assert.ok(
      planner.width >= 390 && planner.width <= 393,
      `mobile layout viewport should remain near the requested 390px, received ${planner.width}px`,
    );
    assert.equal(
      planner.noPageOverflow,
      true,
      'planner should not overflow at 390px',
    );
    assert.equal(
      planner.narrowFieldLayoutStacks,
      true,
      'the narrowest cut-row breakpoint should stack each label above a full-width field',
    );
    assert.equal(
      planner.narrowErrorUsesFullWidth,
      true,
      'narrow cut-row errors should span the complete field row below the control',
    );
    assert.equal(
      planner.narrowErrorHidesRedundantFieldName,
      true,
      'narrow field errors should omit the redundant visible field name',
    );
    assert.equal(
      planner.narrowInvalidFieldFocused,
      true,
      'responsive error layout should preserve focus on the invalid field',
    );
    assert.equal(
      planner.pasteSourceScrollsHorizontally,
      true,
      'mobile paste input should keep long tabular rows on one horizontally scrollable line',
    );
    assert.equal(
      planner.singlePasteRowDoesNotCreateVerticalOverflow,
      true,
      'one long pasted row should not wrap into vertical textarea overflow',
    );
    await assertVisibleWordSpacing(
      client,
      'generated mobile planner result',
      10,
    );
    assert.equal(planner.headerStacked, true, 'mobile header should stack');
    assert.equal(
      planner.projectColumns,
      1,
      'planner fields should use one column',
    );
    assert.equal(
      planner.cutListUsesCards,
      true,
      'cut-list rows should become editable cards on mobile',
    );
    assert.equal(
      planner.cutListLabelsPreserved,
      true,
      'mobile cut-list cards should preserve every column label',
    );
    assert.equal(
      planner.cutOptionsFollowMainRow,
      true,
      'mobile cut options should follow and visually group with their input row',
    );
    assert.equal(
      planner.cutOptionsStayInFlow,
      true,
      'mobile cut options should expand in flow within the viewport',
    );
    assert.equal(
      planner.cutOptionActionsRemainVisible,
      true,
      'mobile cut-row actions should remain visible with 44px targets while options are collapsed',
    );
    assert.equal(
      planner.nestedInputSectionsFlattened,
      true,
      'nested input containers should not accumulate side borders or horizontal padding',
    );
    assert.equal(
      planner.mainInputCardPreserved,
      true,
      'the first-level fabric section should retain its card boundary and padding',
    );
    assert.equal(
      planner.plannerColumnCentered,
      true,
      'the planner form and results columns should remain centered',
    );
    assert.equal(
      planner.topLevelPlannerWidthsEqual,
      true,
      'all top-level planner sections should share one centered width',
    );
    assert.equal(
      planner.mainResultCardPreserved,
      true,
      'the top-level per-fabric result should retain its card boundary',
    );
    assert.equal(
      planner.nestedResultSectionsFlattened,
      true,
      'nested result sections should use full-width vertical separators instead of cards',
    );
    assert.equal(
      planner.decisionAndPatternCardsRestored,
      true,
      'decision and pattern facts should retain readable card grouping',
    );
    assert.equal(
      planner.textPlanCardsRestored,
      true,
      'text allocation facts and strip details should retain readable card grouping',
    );
    assert.equal(
      planner.controlsFit,
      true,
      'planner controls should fit the viewport',
    );
    assert.equal(
      planner.controlsAreTallEnough,
      true,
      'planner controls should preserve 44px touch height',
    );
    assert.equal(planner.resultsVisible, true);
    assert.equal(
      planner.shoppingRowsUseCards,
      true,
      'mobile shopping rows should become labeled result cards',
    );
    assert.equal(
      planner.shoppingLabelsPreserved,
      true,
      'mobile shopping cards should preserve each result label',
    );
    assert.equal(
      planner.shoppingDoesNotScrollHorizontally,
      true,
      'mobile shopping results should not require horizontal scrolling',
    );
    assert.equal(
      planner.shoppingCaptionUsesFullWidth,
      true,
      'mobile shopping caption should span the result card',
    );
    assert.equal(
      planner.thinPieceLabelIsVisible,
      true,
      'every thin piece should retain a positive-size visible label',
    );
    assert.equal(
      planner.thinPieceLabelRotatedBeforeScaling,
      true,
      'a thin piece should rotate its intended-size label before shrinking it',
    );
    assert.equal(
      planner.resultControlsAreTallEnough,
      true,
      'result actions should preserve 44px touch height',
    );
    assert.equal(
      planner.diagramContained,
      true,
      'diagram scrollers should be contained',
    );
    assert.equal(
      planner.themeOpposesBrand,
      true,
      'the mobile theme switch should sit above and opposite the site logo',
    );
    assert.equal(
      planner.mobileZoomRange,
      true,
      'mobile diagrams should clamp zoom to the 1x through 10x fitted range',
    );
    assert.equal(
      planner.smallScreenDefaultIsTwoTimesFit,
      true,
      'sub-650px diagrams should start at two times the fitted size',
    );
    assert.equal(
      planner.wideMobileDiagramCentered,
      true,
      'wide mobile diagrams should remain vertically centered in the square canvas',
    );
    assert.equal(
      planner.mobileZoomControlsHidden,
      true,
      'sub-800px diagrams should hide the zoom slider',
    );
    assert.equal(
      planner.mobilePinchZoomed,
      true,
      'sub-800px diagrams should support synchronized pinch zoom',
    );
    assert.equal(
      planner.diagramUsesSquareViewport,
      true,
      'diagram canvases should remain square',
    );
    assert.equal(
      planner.noResultOverflow,
      true,
      'planner results should not overflow the page',
    );

    await navigate(client, '/calculators/fabric-yardage/', '.calculator-shell');
    const calculator = await evaluate(
      client,
      `(() => {
        const shell = document.querySelector('.calculator-shell');
        return {
          columns: getComputedStyle(shell).gridTemplateColumns.trim().split(/\\s+/).length,
          noPageOverflow: document.documentElement.scrollWidth <= innerWidth,
          controlsFit: [...shell.querySelectorAll('button, input, select')].every((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left >= -0.5 && rect.right <= innerWidth + 0.5;
          }),
        };
      })()`,
    );
    assert.equal(calculator.columns, 1, 'calculator should stack at 390px');
    assert.equal(
      calculator.noPageOverflow,
      true,
      'calculator should not overflow at 390px',
    );
    assert.equal(
      calculator.controlsFit,
      true,
      'calculator controls should fit the viewport',
    );
  } finally {
    await client.send('Emulation.setTouchEmulationEnabled', { enabled: false });
    await client.send('Emulation.clearDeviceMetricsOverride');
  }
}

async function runBrowser(browser) {
  console.log(`Running browser smoke in ${browser.name}...`);
  const launchedBrowser = await chromium.launch({
    executablePath: browser.executable,
    headless: true,
  });
  const context = await launchedBrowser.newContext();
  const page = await context.newPage();
  let client;
  try {
    client = await context.newCDPSession(page);
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Accessibility.enable');
    await client.send('Page.addScriptToEvaluateOnNewDocument', {
      source: 'window.dataLayer = [];',
    });
    await runSiteWideSpacingAudit(client);
    await runNoScriptSpacingAudit(launchedBrowser);
    await runFormAlignmentAudit(page);
    await runHomeSpacingAudit(client);
    await runThemeAudit(client);
    await runGuideHelpAudit(client);
    await runPlannerAudit(client);
    console.log('  Device-specific planner Print/PDF action checks...');
    await auditPlannerPrintAction(launchedBrowser, SITE_ORIGIN);
    console.log('  Single-fabric portrait/landscape PDF export checks...');
    await auditPlannerExport(
      launchedBrowser,
      SITE_ORIGIN,
      path.join(ROOT, 'tmp', 'pdfs'),
    );
    await runCalculatorAudit(client);
    await runMobileAudit(client);
    return browser.name;
  } finally {
    await client?.detach();
    await launchedBrowser.close();
  }
}

async function main() {
  const server =
    PUBLIC_SMOKE_ORIGIN === undefined
      ? spawn(
          process.execPath,
          [
            path.join(ROOT, 'node_modules', 'astro', 'bin', 'astro.mjs'),
            'preview',
            '--host',
            '127.0.0.1',
            '--port',
            '4321',
          ],
          { cwd: ROOT, stdio: 'ignore' },
        )
      : undefined;
  try {
    await waitFor(
      async () => (await fetch(SITE_ORIGIN)).ok,
      PUBLIC_SMOKE_ORIGIN === undefined
        ? 'Astro preview server'
        : `public site ${SITE_ORIGIN}`,
    );
    console.log('Auditing static routes...');
    await auditStaticRoutes();
    const completed = [];
    for (const browser of browserCandidates.filter(
      ({ name }) =>
        !process.env.QUILTCLARITY_SMOKE_BROWSER ||
        name.toLowerCase() ===
          process.env.QUILTCLARITY_SMOKE_BROWSER.toLowerCase(),
    ))
      completed.push(await runBrowser(browser));
    console.log(
      `Browser smoke passed in ${completed.join(' and ')}; 38 indexable routes, crawl controls, Guides/contextual help, theme persistence, planner, calculator, persistence, analytics, accessibility, performance, narrow mobile layout, and print checks passed.`,
    );
  } finally {
    if (server) await stopChild(server);
  }
}

await main();
