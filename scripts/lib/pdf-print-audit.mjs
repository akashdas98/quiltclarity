import assert from 'node:assert/strict';
import { createCanvas } from '@napi-rs/canvas';
import { Buffer } from 'node:buffer';
import { inflateSync } from 'node:zlib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

function decodeStream(pdfBuffer, pdfSource, objectId) {
  const objectHeader = `${objectId} 0 obj`;
  const objectMatch = new RegExp(`(?:^|[\\r\\n])${objectId} 0 obj\\b`).exec(
    pdfSource,
  );
  const objectStart = objectMatch
    ? objectMatch.index + objectMatch[0].length - objectHeader.length
    : -1;
  assert.notEqual(objectStart, -1, `PDF stream ${objectId} should exist`);
  const streamMatch = /stream\r?\n/g;
  streamMatch.lastIndex = objectStart + objectHeader.length;
  const streamStart = streamMatch.exec(pdfSource);
  assert.ok(streamStart, `PDF object ${objectId} should contain a stream`);
  const dataStart = streamStart.index + streamStart[0].length;
  const dictionary = pdfSource.slice(objectStart, streamStart.index);
  const lengthMatch = /\/Length\s+(\d+)\b/.exec(dictionary);
  let encoded;
  if (lengthMatch) {
    encoded = pdfBuffer.subarray(dataStart, dataStart + Number(lengthMatch[1]));
  } else {
    const dataEnd = pdfSource.indexOf('endstream', dataStart);
    assert.notEqual(dataEnd, -1, `PDF stream ${objectId} should terminate`);
    encoded = pdfBuffer.subarray(dataStart, dataEnd);
    while (encoded.at(-1) === 0x0a || encoded.at(-1) === 0x0d)
      encoded = encoded.subarray(0, -1);
  }
  return dictionary.includes('/FlateDecode')
    ? inflateSync(encoded).toString('latin1')
    : encoded.toString('latin1');
}

function channel(value) {
  return Math.round(Number(value) * 255);
}

function paintedRgbKeys(contents) {
  return new Set(
    [
      ...contents.matchAll(
        /(?:^|\s)(\d*\.?\d+)\s+(\d*\.?\d+)\s+(\d*\.?\d+)\s+rg\b/g,
      ),
    ].map(
      (match) =>
        `${channel(match[1])},${channel(match[2])},${channel(match[3])}`,
    ),
  );
}

export function parsePrintedPdf(pdfData) {
  const pdfBuffer = Buffer.isBuffer(pdfData)
    ? pdfData
    : Buffer.from(pdfData, 'base64');
  const pdfSource = pdfBuffer.toString('latin1');
  const pageObjects = [
    ...pdfSource.matchAll(
      /(\d+) 0 obj\s*<<(?:(?!endobj)[\s\S])*?\/Type\s*\/Page\b(?:(?!endobj)[\s\S])*?endobj/g,
    ),
  ];
  return pageObjects.map((match, index) => {
    const body = match[0];
    const contentsMatch = /\/Contents\s+(\d+)\s+0\s+R/.exec(body);
    const mediaBoxMatch =
      /\/MediaBox\s*\[\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*\]/.exec(
        body,
      );
    assert.ok(
      contentsMatch,
      `PDF page ${index + 1} should own a content stream`,
    );
    assert.ok(mediaBoxMatch, `PDF page ${index + 1} should declare its size`);
    const contents = decodeStream(
      pdfBuffer,
      pdfSource,
      Number(contentsMatch[1]),
    );
    return {
      number: index + 1,
      width: Number(mediaBoxMatch[1]),
      height: Number(mediaBoxMatch[2]),
      hasText: /(?:^|\s)BT(?:\s|$)/.test(contents),
      paintedRgbKeys: paintedRgbKeys(contents),
    };
  });
}

function pageForMarker(pages, color, label) {
  const key = color.join(',');
  const matchingPages = pages.filter(({ paintedRgbKeys }) =>
    paintedRgbKeys.has(key),
  );
  assert.equal(
    matchingPages.length,
    1,
    `${label} should be painted on exactly one rendered PDF page`,
  );
  return matchingPages[0];
}

async function extractTextPages(pdfData) {
  const source = Buffer.isBuffer(pdfData)
    ? pdfData
    : Buffer.from(pdfData, 'base64');
  const document = await getDocument({
    data: Uint8Array.from(source),
    disableWorker: true,
  }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push({
      number: pageNumber,
      items: content.items
        .filter((item) => 'str' in item && item.str.trim())
        .map((item) => ({
          text: item.str.trim(),
          x: item.transform[4],
          y: item.transform[5],
          width: item.width,
          height: item.height,
        })),
    });
  }
  return { document, pages };
}

async function assertPagePaintInsideInset(
  document,
  pageNumber,
  insetPoints,
  label,
) {
  const page = await document.getPage(pageNumber);
  const scale = 2;
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(
    Math.ceil(viewport.width),
    Math.ceil(viewport.height),
  );
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport }).promise;
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const inset = Math.floor(insetPoints * scale);
  const tolerance = Math.ceil(scale);
  const left = inset - tolerance;
  const right = canvas.width - inset + tolerance;
  const top = inset - tolerance;
  const bottom = canvas.height - inset + tolerance;
  let paintedOutside;
  for (let y = 0; y < canvas.height && !paintedOutside; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (x >= left && x < right && y >= top && y < bottom) continue;
      const offset = (y * canvas.width + x) * 4;
      if (
        pixels[offset + 3] > 8 &&
        (pixels[offset] < 248 ||
          pixels[offset + 1] < 248 ||
          pixels[offset + 2] < 248)
      ) {
        paintedOutside = { x, y };
        break;
      }
    }
  }
  assert.equal(
    paintedOutside,
    undefined,
    `${label} must paint entirely inside the declared print-safe page box; first outside pixel: ${JSON.stringify(paintedOutside)}`,
  );
}

function diagramTextGeometry(textPage, diagram) {
  const pageText = textPage.items.map(({ text }) => text).join(' ');
  assert.ok(
    pageText.includes(diagram.label),
    `${diagram.label} heading must be printed with its diagram`,
  );
  for (const forbiddenText of [
    'Buy now',
    'Decision details',
    'Pattern comparison',
    'Cutting instructions',
    'Useful remaining regions',
    'Assumptions used',
    'Warnings and guidance',
  ]) {
    assert.ok(
      !pageText.includes(forbiddenText),
      `${diagram.label} page must not contain unrelated UI text: ${forbiddenText}`,
    );
  }
  const diagramText = textPage.items.filter(
    ({ text }) =>
      text !== diagram.label &&
      text !== 'Legend:' &&
      !text.startsWith('patterned areas are pieces;'),
  );
  const pageChrome = textPage.items.filter(
    ({ text }) =>
      text === diagram.label ||
      text === 'Legend:' ||
      text.startsWith('patterned areas are pieces;'),
  );
  assert.ok(
    diagramText.length > 0,
    `${diagram.label} must contain diagram text`,
  );
  const diagramTop = Math.max(
    ...diagramText.map(({ y, height }) => y + height),
  );
  const chromeBottom = Math.min(...pageChrome.map(({ y }) => y));
  assert.ok(
    diagramTop < chromeBottom - 1,
    `${diagram.label} geometry must not overlap its heading or legend: ${JSON.stringify({ diagramTop, chromeBottom, pageChrome, highestDiagramText: diagramText.filter(({ y, height }) => y + height === diagramTop) })}`,
  );
}

export async function assertCleanPrintContract(pdfData, contract) {
  const pages = parsePrintedPdf(pdfData);
  const { document, pages: textPages } = await extractTextPages(pdfData);
  assert.ok(
    textPages.every(({ items }) => items.length > 0),
    'every clean PDF page must contain extracted visible text',
  );
  // Completeness is independent of diagram isolation: closing information must
  // survive pagination, including repeated sections for multiple fabrics.
  const normalizeText = (text) => text.replace(/\s+/gu, '');
  const documentText = normalizeText(
    textPages.flatMap(({ items }) => items.map(({ text }) => text)).join(' '),
  );
  const requiredCounts = new Map();
  for (const text of contract.closingTexts) {
    const key = normalizeText(text);
    requiredCounts.set(key, (requiredCounts.get(key) ?? 0) + 1);
  }
  for (const [text, count] of requiredCounts) {
    assert.ok(
      documentText.split(text).length - 1 >= count,
      `closing result content must print ${count} time(s): ${text}`,
    );
  }
  const diagramPages = [];
  for (const diagram of contract.diagrams) {
    const matches = textPages.filter(({ items }) =>
      items.some(({ text }) => text === diagram.label),
    );
    assert.equal(
      matches.length,
      1,
      `${diagram.label} must appear on exactly one clean PDF page`,
    );
    const textPage = matches[0];
    const page = pages[textPage.number - 1];
    assert.equal(
      page.width > page.height ? 'landscape' : 'portrait',
      diagram.orientation,
      `${diagram.label} clean PDF page should use its selected orientation`,
    );
    diagramTextGeometry(textPage, diagram);
    await assertPagePaintInsideInset(
      document,
      page.number,
      contract.diagramSafeInsetPoints,
      diagram.label,
    );
    diagramPages.push(page.number);
  }
  assert.equal(
    new Set(diagramPages).size,
    diagramPages.length,
    'each clean PDF diagram must own a separate page',
  );
  for (const heading of contract.fabricHeadings) {
    const occurrences = textPages.flatMap((textPage) =>
      textPage.items
        .filter(({ text, height }) => text === heading && height >= 16)
        .map((item) => ({ item, textPage })),
    );
    assert.equal(occurrences.length, 1, `${heading} must print exactly once`);
    const { item, textPage } = occurrences[0];
    const page = pages[textPage.number - 1];
    const distanceFromTop = page.height - item.y - item.height;
    assert.ok(
      distanceFromTop >= contract.diagramSafeInsetPoints - 2 &&
        distanceFromTop <= contract.diagramSafeInsetPoints + 5,
      `${heading} must start at the top print-safe boundary without a large internal gap`,
    );
  }
  for (const headline of contract.buyNowHeadlines) {
    const items = textPages.flatMap(({ items }) =>
      items.filter(({ text }) => text === headline),
    );
    assert.equal(items.length, 1, `${headline} must print exactly once`);
    assert.ok(
      items[0].height <= 15.1,
      `${headline} must use the compact print headline size`,
    );
  }
  const mainHeadingItems = textPages.flatMap(({ items }) =>
    items.filter(({ text }) => text === contract.mainHeading),
  );
  assert.equal(
    mainHeadingItems.length,
    1,
    'the main print heading must appear once',
  );
  assert.ok(
    mainHeadingItems[0].height <= 19.3,
    'the main heading must use the compact print size',
  );
  return { pages };
}

// The native print is the content reference, including page introduction and
// result headings. Selected closing-text assertions alone cannot prove parity.
async function removeUnpaintedMarginText(document, pages, inset) {
  for (const textPage of pages) {
    const page = await document.getPage(textPage.number);
    const viewport = page.getViewport({ scale: 2 });
    const height = viewport.height / 2;
    const candidates = textPage.items.filter(
      ({ y }) => y < inset - 2 || y > height - inset + 2,
    );
    if (!candidates.length) continue;
    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height),
    );
    const context = canvas.getContext('2d');
    await page.render({ canvasContext: context, viewport }).promise;
    const unpainted = new Set();
    for (const item of candidates) {
      const left = Math.max(0, Math.floor((item.x - 2) * 2));
      const top = Math.max(
        0,
        Math.floor((height - item.y - item.height - 2) * 2),
      );
      const right = Math.min(
        canvas.width,
        Math.ceil((item.x + item.width + 2) * 2),
      );
      const bottom = Math.min(
        canvas.height,
        Math.ceil((height - item.y + 2) * 2),
      );
      const pixels = context.getImageData(
        left,
        top,
        Math.max(1, right - left),
        Math.max(1, bottom - top),
      ).data;
      let ink = false;
      for (let at = 0; at < pixels.length; at += 4) {
        if (
          pixels[at + 3] > 0 &&
          (pixels[at] < 245 || pixels[at + 1] < 245 || pixels[at + 2] < 245)
        ) {
          ink = true;
          break;
        }
      }
      if (!ink) unpainted.add(item);
    }
    // PDF.js extracts text even when Chromium clips it at a page transition.
    // Ignore only margin fragments proven to have no ink in the actual render.
    textPage.items = textPage.items.filter((item) => !unpainted.has(item));
  }
}

export async function assertPrintContentParity(
  pdfData,
  referenceData,
  contract,
) {
  const { pages: actual } = await extractTextPages(pdfData);
  const { document: referenceDocument, pages: reference } =
    await extractTextPages(referenceData);
  await removeUnpaintedMarginText(
    referenceDocument,
    reference,
    contract.diagramSafeInsetPoints,
  );
  const diagramLabels = new Set(contract.diagrams.map(({ label }) => label));
  const prosePages = (pages) =>
    pages.filter(
      ({ items }) => !items.some(({ text }) => diagramLabels.has(text)),
    );
  const normalize = (text) => text.replace(/\s+/gu, '');
  const actualText = normalize(
    prosePages(actual)
      .flatMap(({ items }) => items.map(({ text }) => text))
      .join(' '),
  );
  const requiredCounts = new Map();
  for (const item of prosePages(reference).flatMap(({ items }) => items)) {
    const key = normalize(item.text);
    requiredCounts.set(key, (requiredCounts.get(key) ?? 0) + 1);
  }
  for (const [text, count] of requiredCounts) {
    assert.ok(
      actualText.split(text).length - 1 >= count,
      `export must preserve native print text ${count} time(s): ${text}`,
    );
  }
  const referenceText = normalize(
    prosePages(reference)
      .flatMap(({ items }) => items.map(({ text }) => text))
      .join(' '),
  );
  // Chromium paints generated list bullets as paths; jsPDF represents them as
  // text. Compare prose wording without this renderer-specific marker encoding.
  const actualWording = actualText.replace(/•/gu, '');
  const referenceWording = referenceText.replace(/•/gu, '');
  let firstDifference = 0;
  while (
    firstDifference < Math.min(actualWording.length, referenceWording.length) &&
    actualWording[firstDifference] === referenceWording[firstDifference]
  )
    firstDifference += 1;
  assert.ok(
    actualWording === referenceWording,
    `export prose must preserve native-print wording and order; first difference at ${firstDifference}: export=${actualWording.slice(firstDifference, firstDifference + 80)}, native=${referenceWording.slice(firstDifference, firstDifference + 80)}`,
  );
  // Facts must retain their native side-by-side relationship and visual order.
  for (const pages of [actual, reference]) {
    for (const page of prosePages(pages)) {
      const terms = ['You entered on hand', 'Fresh-fabric plan', 'Buy now'].map(
        (term) => page.items.filter(({ text }) => text === term),
      );
      if (!terms[0].length || !terms[1].length) continue;
      const first = terms[0][0];
      const second = terms[1][0];
      const third = terms[2].find(
        ({ x, y }) => x > second.x && Math.abs(y - second.y) < 2,
      );
      assert.ok(
        third && second.x > first.x + 50 && Math.abs(first.y - second.y) < 2,
        'decision facts must remain three columns on a shared baseline',
      );
    }
  }
  // These visible anchors cover the introduction, summary, and fabric layout.
  // Large drift is a format regression even when every word is present.
  const anchorLabels = [
    'FABRIC CUTTING PLANNER',
    contract.mainHeading,
    'YOUR PLAN',
    'Shopping list and cutting plan',
    'Fabric shopping list',
    'Decision details',
    'Existing-stock allocations',
    'Purchased fabric',
    'Cutting instructions',
    'Useful remaining regions',
    'Assumptions used',
    'Warnings and guidance',
  ];
  for (const label of anchorLabels) {
    const find = (pages) =>
      prosePages(pages).flatMap(({ number, items }) =>
        items
          .filter(({ text }) => text === label)
          .map((item) => ({ ...item, number })),
      );
    const expected = find(reference);
    const received = find(actual);
    assert.equal(
      received.length,
      expected.length,
      `layout anchor must survive: ${label}`,
    );
    for (let index = 0; index < expected.length; index++) {
      assert.equal(
        received[index].number,
        expected[index].number,
        `${label} must retain its page`,
      );
      assert.ok(
        Math.abs(received[index].x - expected[index].x) <= 2,
        `${label} must retain its native horizontal alignment`,
      );
      assert.ok(
        Math.abs(received[index].y - expected[index].y) <= 8,
        `${label} must retain its native vertical spacing: export=${received[index].y}, native=${expected[index].y}`,
      );
      assert.ok(
        Math.abs(received[index].height - expected[index].height) <= 0.5,
        `${label} must retain its native typography size`,
      );
    }
  }
}

export async function assertRenderedPrintContract(pdfData, contract) {
  const pages = parsePrintedPdf(pdfData);
  const { pages: textPages } = await extractTextPages(pdfData);
  assert.ok(
    textPages.every(({ items }) => items.length > 0),
    'every rendered PDF page must contain extracted visible text; blank sheets are not allowed',
  );
  const markerPages = new Map();
  for (const marker of contract.markers) {
    const startPage = pageForMarker(
      pages,
      marker.startColor,
      `${marker.label} start marker`,
    );
    const endPage = pageForMarker(
      pages,
      marker.endColor,
      `${marker.label} end marker`,
    );
    assert.equal(
      startPage.number,
      endPage.number,
      `${marker.label} must not be fragmented across rendered PDF pages`,
    );
    markerPages.set(marker.id, startPage);
  }

  for (const group of contract.samePageGroups) {
    const groupPages = group.markerIds.map((id) => markerPages.get(id)?.number);
    assert.equal(
      new Set(groupPages).size,
      1,
      `${group.label} must remain together on one rendered PDF page`,
    );
  }

  const diagramPages = [];
  for (const diagram of contract.diagrams) {
    const page = markerPages.get(diagram.markerId);
    assert.ok(page, `${diagram.label} should have a rendered PDF page`);
    assert.equal(
      page.width > page.height ? 'landscape' : 'portrait',
      diagram.orientation,
      `${diagram.label} should render on its selected page orientation`,
    );
    const textPage = textPages[page.number - 1];
    diagramTextGeometry(textPage, diagram);
    diagramPages.push(page.number);
  }
  assert.equal(
    new Set(diagramPages).size,
    diagramPages.length,
    'each cutting diagram must render on its own PDF page',
  );
  return { pages, markerPages };
}
