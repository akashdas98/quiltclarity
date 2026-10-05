/* global window, navigator, document */
import assert from 'node:assert/strict';

/** Routing emulation verifies policy, not physical Safari rendering. */
export async function auditPlannerPrintAction(browser, origin) {
  const cases = [
    ['desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Win32', 0, false],
    [
      'touch PC',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Win32',
      10,
      false,
    ],
    [
      'Mac',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      'MacIntel',
      0,
      false,
    ],
    [
      'iPhone',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) Mobile/15E148',
      'iPhone',
      5,
      true,
    ],
    [
      'iPad desktop UA',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      'MacIntel',
      5,
      true,
    ],
    [
      'Android tablet',
      'Mozilla/5.0 (Linux; Android 14; Tablet) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',
      'Linux armv8l',
      5,
      true,
    ],
  ];
  for (const [name, userAgent, platform, touches, mobile] of cases) {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 900 },
      userAgent,
    });
    try {
      await context.addInitScript(
        ({ platform, touches }) => {
          Object.defineProperty(navigator, 'platform', {
            configurable: true,
            value: platform,
          });
          Object.defineProperty(navigator, 'maxTouchPoints', {
            configurable: true,
            value: touches,
          });
          Object.defineProperty(navigator, 'userAgentData', {
            configurable: true,
            value: undefined,
          });
          window.__nativePrintCalls = 0;
          window.__nativePrintFontStates = [];
          window.print = () => {
            window.__nativePrintCalls += 1;
            window.__nativePrintFontStates.push(
              [...document.fonts]
                .filter((face) => face.family.includes('QuiltClarity Print'))
                .map((face) => face.status),
            );
          };
        },
        { platform, touches },
      );
      const page = await context.newPage();
      const requests = [];
      page.on('request', (request) => requests.push(request.url()));
      let releaseFonts;
      const fontGate = new Promise((resolve) => {
        releaseFonts = resolve;
      });
      if (name === 'desktop') {
        await page.route('**/fonts/NotoSans-*.ttf', async (route) => {
          await fontGate;
          await route.continue();
        });
      }
      await page.goto(`${origin}/fabric-cutting-planner/`);
      await page.locator('.cut-list-row').waitFor();
      await page.locator('#calculate-plan').click();
      await page.locator('#planner-results').waitFor({ state: 'visible' });
      const action = page.locator('#export-pdf-result');
      for (const width of [1200, 390, 820]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(
          await action.getAttribute('aria-label'),
          mobile ? 'export PDF for print' : 'Print',
          `${name} at ${width}px`,
        );
        assert.equal(
          await action.locator('..').getAttribute('data-help-key'),
          mobile ? 'actionExportPdf' : 'actionPrint',
        );
      }
      assert.equal(
        requests.some((url) => /\/fonts\/NotoSans-.*\.ttf/.test(url)),
        false,
        `${name}: font fetch stays lazy`,
      );
      if (mobile) {
        const download = page.waitForEvent('download');
        await action.click();
        assert.equal(
          (await download).suggestedFilename(),
          'quiltclarity-plan.pdf',
        );
        await page.waitForFunction(
          () => !document.querySelector('#export-pdf-result').disabled,
        );
        assert.match(
          await page.locator('#action-status').innerText(),
          /PDF ready/,
        );
        assert.equal(await page.evaluate(() => window.__nativePrintCalls), 0);
      } else {
        await action.click();
        if (name === 'desktop') {
          await page.waitForFunction(() => {
            const faces = [...document.fonts].filter((face) =>
              face.family.includes('QuiltClarity Print'),
            );
            return (
              faces.length === 2 &&
              faces.every((face) => face.status === 'loading')
            );
          });
          assert.equal(
            await page.evaluate(() => window.__nativePrintCalls),
            0,
            'cold first click must await delayed fonts',
          );
          assert.equal(await action.isDisabled(), true);
          await action.evaluate((button) => button.click());
          releaseFonts();
        }
        await page.waitForFunction(() => window.__nativePrintCalls === 1);
        assert.equal(await page.evaluate(() => window.__nativePrintCalls), 1);
        assert.deepEqual(
          await page.evaluate(() => window.__nativePrintFontStates[0]),
          ['loaded', 'loaded'],
          `${name}: native Print must see ready fonts`,
        );
        assert.equal(await action.isDisabled(), false);
        assert.equal(await action.getAttribute('aria-busy'), null);
        assert.equal(
          requests.filter((url) => /\/fonts\/NotoSans-.*\.ttf/.test(url))
            .length,
          2,
          `${name}: prepare both native-print faces without PDF generation`,
        );
        await action.click();
        await page.waitForFunction(() => window.__nativePrintCalls === 2);
        assert.deepEqual(
          await page.evaluate(() => window.__nativePrintFontStates[1]),
          ['loaded', 'loaded'],
        );
      }
    } finally {
      await context.close();
    }
  }
  const failedFonts = await browser.newContext();
  try {
    await failedFonts.route('**/fonts/NotoSans-*.ttf', (route) =>
      route.abort(),
    );
    await failedFonts.addInitScript(() => {
      window.__nativePrintCalls = 0;
      window.print = () => {
        window.__nativePrintCalls += 1;
      };
    });
    const page = await failedFonts.newPage();
    await page.goto(`${origin}/fabric-cutting-planner/`);
    await page.locator('.cut-list-row').waitFor();
    await page.locator('#calculate-plan').click();
    const action = page.locator('#export-pdf-result');
    for (const count of [1, 2]) {
      await action.click();
      await page.waitForFunction(
        (count) => window.__nativePrintCalls === count,
        count,
      );
      assert.match(
        await page.locator('#action-status').innerText(),
        /browser fallback fonts/,
      );
      assert.equal(await action.isDisabled(), false);
      assert.equal(await action.getAttribute('aria-busy'), null);
    }
    // Browser-menu/keyboard printing also needs visible fallback text; unlike
    // the button it cannot await the controller's font preparation.
    assert.deepEqual(
      await page.evaluate(() =>
        [...document.fonts]
          .filter((face) => face.family.includes('QuiltClarity Print'))
          .map((face) => face.display),
      ),
      ['swap', 'swap'],
    );
  } finally {
    await failedFonts.close();
  }
}
