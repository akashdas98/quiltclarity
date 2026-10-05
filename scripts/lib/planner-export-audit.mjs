/* global window, btoa, HTMLAnchorElement, navigator */
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
  assertCleanPrintContract,
  assertPrintContentParity,
} from './pdf-print-audit.mjs';

export async function auditPlannerExport(browser, origin, artifactsDirectory) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'userAgentData', {
      configurable: true,
      value: { mobile: true },
    });
  });
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/fabric-cutting-planner/`);
    await page.locator('.cut-list-row').waitFor();
    await page.locator('#project-name').fill('Étoile ½ — résumé');
    await page.locator('.fabric-card [data-field="name"]').fill('Étoile ½');
    const row = page.locator('.cut-list-row').first();
    await row.locator('[data-field="label"]').fill('Pièce ¼');
    await page.evaluate(() => {
      window.print = () => {
        throw new Error('Export must not invoke native print');
      };
      const originalUrl = URL.createObjectURL;
      URL.createObjectURL = (blob) => {
        window.__variantPdf = blob.arrayBuffer().then((buffer) => {
          let binary = '';
          const bytes = new Uint8Array(buffer);
          for (let start = 0; start < bytes.length; start += 16384)
            binary += String.fromCharCode(
              ...bytes.subarray(start, start + 16384),
            );
          return btoa(binary);
        });
        return originalUrl.call(URL, blob);
      };
      const originalClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        if (!this.download.endsWith('.pdf')) return originalClick.call(this);
      };
    });
    const requests = [];
    page.on('request', (request) => requests.push(request));
    for (const [name, quantity, height, orientation] of [
      ['short', '8', '5', 'landscape'],
      ['tall', '16', '40', 'portrait'],
      ['long', '16', '40', 'portrait'],
    ]) {
      if (name === 'long') {
        await page
          .locator('.fabric-card [data-field="name"]')
          .fill('Étoile ½ — blue cream patchwork fabric for the quilt');
        await page
          .locator('#project-name')
          .fill('Étoile ½ — résumé '.repeat(12));
      }
      await row.locator('[data-field="quantity"]').fill(quantity);
      await row.locator('[data-field="height"]').fill(height);
      await page.locator('#calculate-plan').click();
      await page.locator('#planner-results').waitFor({ state: 'visible' });
      const contract = await page.evaluate(() => {
        const text = (element) => {
          const clone = element.cloneNode(true);
          clone
            .querySelectorAll('.context-help, .screen-help-label, .no-print')
            .forEach((node) => node.remove());
          return clone.textContent.replace(/\s+/gu, ' ').trim();
        };
        return {
          diagrams: [...document.querySelectorAll('.diagram-print-page')].map(
            (item) => ({
              label: text(item.querySelector('h5')),
              orientation: item.dataset.printOrientation,
            }),
          ),
          closingTexts: [
            ...document.querySelectorAll(
              '.leftover-summary, .assumptions, .warnings',
            ),
          ].flatMap((section) =>
            [...section.querySelectorAll('h3, p, li')].map(text),
          ),
          fabricHeadings: [
            text(document.querySelector('.fabric-result-intro > h2')),
          ],
          buyNowHeadlines: [
            text(document.querySelector('.result-hero > strong')),
          ],
          mainHeading: text(document.querySelector('.hero h1')),
          diagramSafeInsetPoints: (1.2 * 72) / 2.54,
        };
      });
      assert.equal(contract.diagrams.length, 1);
      assert.equal(contract.diagrams[0].orientation, orientation);
      const button = page.locator('#export-pdf-result');
      if (name === 'short') {
        await page.route('**/fonts/NotoSans-Regular.ttf', (route) =>
          route.abort(),
        );
        await button.click();
        await page.waitForFunction(
          () => !document.querySelector('#export-pdf-result').disabled,
        );
        assert.match(
          await page.locator('#action-status').innerText(),
          /Could not prepare the PDF/,
        );
        await page.unroute('**/fonts/NotoSans-Regular.ttf');
      }
      const firstRequest = requests.length;
      await button.click();
      await page.waitForFunction(
        () => !document.querySelector('#export-pdf-result').disabled,
      );
      assert.match(
        await page.locator('#action-status').innerText(),
        /PDF ready/,
      );
      const data = await page.evaluate(() => window.__variantPdf);
      assert.equal(
        typeof data,
        'string',
        'export must produce a captured PDF file',
      );
      const exported = await assertCleanPrintContract(data, contract);
      assert.equal(
        exported.pages.length,
        4,
        'summary, fabric, diagram and final regions must survive',
      );
      await page.emulateMedia({ media: 'print' });
      await page.evaluate(() => document.fonts.ready);
      const native = await page.pdf({
        preferCSSPageSize: true,
        printBackground: true,
      });
      await writeFile(
        path.join(artifactsDirectory, `planner-native-${name}.pdf`),
        native,
      );
      await writeFile(
        path.join(artifactsDirectory, `planner-export-${name}.pdf`),
        Buffer.from(data, 'base64'),
      );
      await assertPrintContentParity(data, native, contract);
      await page.emulateMedia({ media: 'screen' });
      const loadingTask = getDocument({
        data: new Uint8Array(Buffer.from(data, 'base64')),
      });
      const document = await loadingTask.promise;
      let allText = '';
      for (let number = 1; number <= document.numPages; number++) {
        const content = await (await document.getPage(number)).getTextContent();
        allText += content.items.map((item) => item.str).join(' ');
      }
      await loadingTask.destroy();
      assert.ok(allText.includes('Étoile ½'));
      assert.ok(allText.includes('Pièce ¼'));
      for (const request of requests.slice(firstRequest)) {
        assert.equal(new URL(request.url()).origin, new URL(origin).origin);
        assert.equal(request.method(), 'GET');
        assert.equal(request.postData(), null);
      }
    }
  } finally {
    await context.close();
  }
}
