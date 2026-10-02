/* global navigator */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

// Run against an opt-in build. Every request is fulfilled locally or aborted;
// no analytics request reaches the provider and no preview server is needed.
const origin = 'https://quiltclarity.com';
const endpoint = 'https://queue.simpleanalyticscdn.com/events';
const dist = path.resolve('dist');
const disabled = process.argv.includes('--disabled');
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
};
const browsers = [
  ['Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'],
  ['Edge', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'],
];

for (const [name, executablePath] of browsers) {
  const browser = await chromium.launch({ executablePath, headless: true });
  try {
    for (const scenario of disabled
      ? ['disabled']
      : ['enabled', 'dnt', 'gpc', 'failed', 'noindex']) {
      const context = await browser.newContext();
      const records = [];
      const unexpected = [];
      try {
        if (scenario === 'dnt' || scenario === 'gpc') {
          await context.addInitScript((mode) => {
            Object.defineProperty(
              navigator,
              mode === 'dnt' ? 'doNotTrack' : 'globalPrivacyControl',
              {
                configurable: true,
                value: mode === 'dnt' ? '1' : true,
              },
            );
          }, scenario);
        }
        await context.route('**/*', async (route) => {
          const request = route.request();
          const url = new URL(request.url());
          if (url.href === endpoint) {
            if (request.method() === 'OPTIONS') {
              await route.fulfill({
                status: 204,
                headers: {
                  'access-control-allow-origin': origin,
                  'access-control-allow-methods': 'POST, OPTIONS',
                  'access-control-allow-headers': 'Content-Type',
                },
              });
              return;
            }
            records.push({
              payload: request.postDataJSON(),
              headers: await request.allHeaders(),
            });
            if (scenario === 'failed') await route.abort('failed');
            else
              await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '{}',
                headers: { 'access-control-allow-origin': origin },
              });
            return;
          }
          if (url.origin !== origin) {
            unexpected.push(url.origin);
            await route.abort();
            return;
          }
          const requested = decodeURIComponent(url.pathname);
          const filename = path.resolve(
            dist,
            `.${requested}`,
            requested.endsWith('/') ? 'index.html' : '',
          );
          if (!filename.startsWith(dist + path.sep)) {
            await route.abort();
            return;
          }
          try {
            const body = await readFile(filename);
            await route.fulfill({
              status: 200,
              contentType:
                types[path.extname(filename)] ?? 'application/octet-stream',
              body,
            });
          } catch {
            await route.abort();
          }
        });
        const page = await context.newPage();
        const routePath =
          scenario === 'noindex'
            ? '/corrections/'
            : '/calculators/fabric-yardage/';
        await page.goto(
          `${origin}${routePath}?utm_source=SECRET_QUERY&ref=SECRET_REF#SECRET_SHARED_PROJECT`,
        );
        if (scenario !== 'noindex') {
          await page.locator('button[type="submit"]').click();
          await page
            .locator('[data-result-content]')
            .waitFor({ state: 'visible' });
        }
        await page.waitForTimeout(150);
        assert.deepEqual(
          unexpected,
          [],
          `${name}/${scenario}: unexpected external request`,
        );
        if (['disabled', 'dnt', 'gpc', 'noindex'].includes(scenario)) {
          assert.equal(
            records.length,
            0,
            `${name}/${scenario}: privacy gate sent requests`,
          );
        } else {
          assert.ok(
            records.some(({ payload }) => payload.type === 'pageview'),
            `${name}/${scenario}: pageview missing`,
          );
          assert.ok(
            records.some(({ payload }) => payload.event === 'tool_viewed'),
            `${name}/${scenario}: startup event missing`,
          );
          assert.ok(
            records.some(
              ({ payload }) => payload.event === 'calculator_completed',
            ),
            `${name}/${scenario}: completion missing`,
          );
          for (const { payload, headers } of records) {
            assert.equal(payload.hostname, 'quiltclarity.com');
            assert.equal(payload.path, routePath);
            assert.equal(payload.ua, 'QuiltClarity/1.0');
            assert.ok(
              Object.keys(payload).every((key) =>
                [
                  'type',
                  'hostname',
                  'path',
                  'ua',
                  'event',
                  'metadata',
                ].includes(key),
              ),
            );
            assert.doesNotMatch(
              JSON.stringify(payload),
              /SECRET_|utm_|referrer|session_id|page_id/,
            );
            assert.equal(headers.referer, undefined);
            assert.equal(headers.cookie, undefined);
          }
        }
        console.log(
          `${name}: ${scenario} PASS (${records.length} intercepted requests)`,
        );
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
