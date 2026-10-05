import { jsPDF } from 'jspdf';
import 'svg2pdf.js';

/** A read-only view of the completed planner result. No calculation is repeated here. */
export interface PlannerPrintPdfInput {
  pageRoot: HTMLElement;
  onProgress?: (completedDiagrams: number, totalDiagrams: number) => void;
}

const A4_SHORT = 595.276;
const A4_LONG = 841.89;
const MARGIN = 34.016; // 1.2 cm
const FONT = 'NotoSans';
const BODY = 12;
const SVG_NS = 'http://www.w3.org/2000/svg';

interface Run {
  text: string;
  bold: boolean;
}

interface Fact {
  term: Run[];
  definition: Run[];
}

interface TextBlock {
  kind: 'text';
  runs: Run[];
  size: number;
  space: number;
  indent: number;
  heading: boolean;
  accent: boolean;
  leading?: number;
  afterMargin?: number;
  hanging?: number;
  afterDiagramTopMargin?: number;
}

type Block =
  | TextBlock
  | { kind: 'callout'; runs: Run[] }
  | { kind: 'facts'; pairs: Fact[] }
  | { kind: 'table'; headers: Run[][]; rows: Run[][][]; caption: Run[] }
  | { kind: 'summary'; enter: boolean }
  | { kind: 'spacer'; height: number }
  | { kind: 'closing-section'; children: TextBlock[]; bordered: boolean }
  | {
      kind: 'diagram';
      element: SVGSVGElement;
      title: string;
      legend: string;
      orientation?: 'portrait' | 'landscape';
    }
  | { kind: 'page' };

interface PdfFont {
  binary: string;
  supports: (codePoint: number) => boolean;
}

let fontPromise: Promise<[PdfFont, PdfFont]> | undefined;

function glyphCoverage(buffer: ArrayBuffer): (codePoint: number) => boolean {
  const data = new DataView(buffer);
  const u16 = (at: number) => data.getUint16(at, false);
  const u32 = (at: number) => data.getUint32(at, false);
  let cmap = -1;
  for (let i = 0; i < u16(4); i++) {
    const at = 12 + i * 16;
    if (u32(at) === 0x636d6170) cmap = u32(at + 8);
  }
  if (cmap < 0) throw new Error('The bundled PDF font has no character map.');
  let format12 = -1;
  let format4 = -1;
  for (let i = 0; i < u16(cmap + 2); i++) {
    const at = cmap + 4 + i * 8;
    const subtable = cmap + u32(at + 4);
    const platform = u16(at);
    if (platform !== 0 && platform !== 3) continue;
    const format = u16(subtable);
    if (format === 12) format12 = subtable;
    else if (format === 4) format4 = subtable;
  }
  if (format12 < 0 && format4 < 0)
    throw new Error(
      'The bundled PDF font has no supported Unicode character map.',
    );
  return (codePoint: number): boolean => {
    if (format12 >= 0) {
      let low = 0;
      let high = u32(format12 + 12) - 1;
      while (low <= high) {
        const mid = (low + high) >>> 1;
        const group = format12 + 16 + mid * 12;
        const first = u32(group);
        const last = u32(group + 4);
        if (codePoint < first) high = mid - 1;
        else if (codePoint > last) low = mid + 1;
        else return u32(group + 8) + codePoint - first !== 0;
      }
    }
    if (format4 >= 0 && codePoint <= 0xffff) {
      const count = u16(format4 + 6) / 2;
      const end = format4 + 14;
      const start = end + 2 * count + 2;
      const delta = start + 2 * count;
      const ranges = delta + 2 * count;
      for (let i = 0; i < count; i++) {
        if (codePoint > u16(end + i * 2)) continue;
        if (codePoint < u16(start + i * 2)) return false;
        const offset = u16(ranges + i * 2);
        const glyph = offset
          ? u16(ranges + i * 2 + offset + 2 * (codePoint - u16(start + i * 2)))
          : (codePoint + u16(delta + i * 2)) & 0xffff;
        return glyph !== 0;
      }
    }
    return false;
  };
}

async function localFonts(): Promise<[PdfFont, PdfFont]> {
  if (!fontPromise) {
    fontPromise = (
      Promise.all(
        ['Regular', 'Bold'].map(async (weight) => {
          const url = new URL(
            `/fonts/NotoSans-${weight}.ttf`,
            window.location.origin,
          );
          const response = await fetch(url, { credentials: 'same-origin' });
          if (!response.ok)
            throw new Error(`Could not load the local PDF font (${weight}).`);
          const buffer = await response.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let start = 0; start < bytes.length; start += 16384) {
            binary += String.fromCharCode(
              ...bytes.subarray(start, start + 16384),
            );
          }
          return { binary, supports: glyphCoverage(buffer) };
        }),
      ) as Promise<[PdfFont, PdfFont]>
    ).catch((error: unknown) => {
      fontPromise = undefined; // a later export can recover from a transient fetch failure
      throw error;
    });
  }
  return fontPromise;
}

function verifyGlyphs(blocks: Block[], fonts: [PdfFont, PdfFont]): void {
  const missing = new Set<number>();
  const check = (value: string, bold = false): void => {
    const font = fonts[bold ? 1 : 0];
    for (const character of value) {
      const codePoint = character.codePointAt(0)!;
      if (codePoint > 31 && !font.supports(codePoint)) missing.add(codePoint);
    }
  };
  for (const block of blocks) {
    if (block.kind === 'text' || block.kind === 'callout')
      block.runs.forEach((run) => check(run.text, run.bold));
    else if (block.kind === 'facts')
      block.pairs.forEach((pair) =>
        [...pair.term, ...pair.definition].forEach((run) =>
          check(run.text, run.bold),
        ),
      );
    else if (block.kind === 'table') {
      block.caption.forEach((run) => check(run.text, run.bold));
      block.headers.flat().forEach((run) => check(run.text, run.bold));
      block.rows.flat(2).forEach((run) => check(run.text, run.bold));
    } else if (block.kind === 'diagram') {
      check(block.title, true);
      check(block.legend);
      for (const text of block.element.querySelectorAll('text'))
        check(
          text.textContent ?? '',
          text.matches('.piece-label, .waste-label'),
        );
    }
  }
  if (missing.size) {
    const characters = Array.from(missing)
      .slice(0, 6)
      .map((point) => `U+${point.toString(16).toUpperCase().padStart(4, '0')}`)
      .join(', ');
    throw new Error(
      `The bundled PDF font cannot print ${characters}. Change the affected project label before exporting.`,
    );
  }
}

const PRINT_HIDDEN =
  '.no-print, .context-help, .context-help-popover, .screen-help-label, .shopping-mobile-help, .diagram-zoom-controls, .diagram-pinch-hint, form, dialog, template, noscript, details, #action-status, [hidden]';

function printable(element: Element): boolean {
  return !element.matches(PRINT_HIDDEN);
}

/** Read visible inline content without losing emphasis across element boundaries. */
function rich(element: Element, forceBold = false): Run[] {
  const raw: Run[] = [];
  const walk = (node: Node, bold: boolean): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      raw.push({ text: node.textContent ?? '', bold });
      return;
    }
    if (!(node instanceof Element) || !printable(node) || node.matches('svg'))
      return;
    const emphasized = bold || node.matches('strong, b, em, i');
    for (const child of node.childNodes) walk(child, emphasized);
  };
  walk(element, forceBold);
  const runs: Run[] = [];
  let pendingSpace = false;
  const push = (text: string, bold: boolean): void => {
    const last = runs.at(-1);
    if (last?.bold === bold) last.text += text;
    else runs.push({ text, bold });
  };
  for (const run of raw) {
    for (const part of run.text.match(/\s+|\S+/gu) ?? []) {
      if (/^\s+$/u.test(part)) pendingSpace = true;
      else {
        if (pendingSpace && runs.length) push(' ', run.bold);
        push(part, run.bold);
        pendingSpace = false;
      }
    }
  }
  return runs;
}

function plain(runs: Run[]): string {
  return runs.map((run) => run.text).join('');
}

function appendText(
  blocks: Block[],
  runs: Run[],
  size = BODY,
  space = 4,
  indent = 0,
  heading = false,
  accent = false,
  leading?: number,
  afterMargin?: number,
  hanging?: number,
  afterDiagramTopMargin?: number,
): void {
  if (plain(runs))
    blocks.push({
      kind: 'text',
      runs,
      size,
      space,
      indent,
      heading,
      accent,
      leading,
      afterMargin,
      hanging,
      afterDiagramTopMargin,
    });
}

/** Project the existing desktop print composition, in DOM order. */
function collect(element: Element, blocks: Block[]): void {
  if (!printable(element)) return;
  if (element.matches('.diagram-print-page')) {
    const svg = element.querySelector<SVGSVGElement>('svg.cutting-diagram');
    if (!svg) throw new Error('A cutting diagram is missing from the result.');
    const orientation = element.getAttribute('data-print-orientation');
    blocks.push({
      kind: 'diagram',
      element: svg,
      title: plain(rich(element.querySelector('h5') ?? element)),
      legend: plain(rich(element.querySelector('.diagram-legend') ?? element)),
      orientation:
        orientation === 'portrait' || orientation === 'landscape'
          ? orientation
          : undefined,
    });
    return;
  }
  if (element.matches('table')) {
    blocks.push({
      kind: 'table',
      caption: rich(element.querySelector('caption') ?? element, true),
      headers: Array.from(element.querySelectorAll('thead th'), (cell) =>
        rich(cell, true),
      ),
      rows: Array.from(element.querySelectorAll('tbody tr'), (row) =>
        Array.from(row.querySelectorAll('th, td'), (cell) =>
          rich(cell, cell.matches('th')),
        ),
      ),
    });
    return;
  }
  if (element.matches('.fabric-result')) blocks.push({ kind: 'page' });
  if (element.matches('.leftover-summary, .assumptions, .warnings')) {
    const children: Block[] = [];
    for (const child of element.children) collect(child, children);
    if (children.some((block) => block.kind !== 'text'))
      throw new Error(
        'An unsupported print block appeared in a result section.',
      );
    blocks.push({
      kind: 'closing-section',
      children: children as TextBlock[],
      bordered: element.matches('.assumptions'),
    });
    blocks.push(...children);
    return;
  }
  if (element.matches('.result-summary')) {
    blocks.push({ kind: 'summary', enter: true });
    for (const child of element.children) collect(child, blocks);
    blocks.push({ kind: 'summary', enter: false });
    return;
  }
  if (element.matches('.first-use-helper')) {
    blocks.push({ kind: 'callout', runs: rich(element) });
    return;
  }
  if (element.matches('.result-hero')) {
    // Fabric h2 bottom margin, then the print hero's top padding.
    blocks.push({ kind: 'spacer', height: 7.09 + 5.67 });
    for (const child of element.children) {
      const size = child.matches('strong') ? 15 : 10.2;
      appendText(
        blocks,
        rich(child),
        size,
        child.matches('small') ? 4.2 : 0,
        0,
        false,
        false,
        child.matches('strong') ? 1.2 : 1.55,
      );
    }
    // Its bottom margin collapses with the following h3 top margin.
    blocks.push({ kind: 'spacer', height: 8.5 });
    return;
  }
  if (element.matches('.comparison-facts')) {
    blocks.push({
      kind: 'facts',
      pairs: Array.from(element.querySelectorAll(':scope > div'), (pair) => ({
        term: rich(pair.querySelector('dt') ?? pair),
        definition: rich(pair.querySelector('dd') ?? pair),
      })),
    });
    return;
  }
  if (element.matches('h1, h2, h3, h4, h5')) {
    const level = Number(element.tagName[1]);
    const size = element.matches('.hero h1')
      ? 19.2
      : element.matches('#results-heading')
        ? 18
        : [0, 19.2, 16.2, 12.6, 12, 9.96][level]!;
    const space = element.matches('.hero h1')
      ? 4.2
      : element.matches('.pattern-comparison > h3')
        ? 15
        : element.matches('#results-heading')
          ? 4.2
          : element.matches('.material-plan h4')
            ? 5.67
            : element.matches('.material-plan h5')
              ? 12
              : level < 4
                ? 9
                : 5;
    const leading = element.matches('.hero h1, .fabric-result-intro > h2')
      ? 1.15
      : element.matches('.fabric-result h3')
        ? 1.2
        : 1.18;
    appendText(
      blocks,
      rich(element, true),
      size,
      space,
      0,
      true,
      false,
      leading,
      undefined,
      undefined,
      element.matches('.fabric-result h3') ? 9.92 : undefined,
    );
    return;
  }
  if (element.matches('p')) {
    const eyebrow = element.matches('.eyebrow');
    const runs = rich(
      element,
      element.matches('.project-status, .trust-line, .eyebrow'),
    );
    if (eyebrow) runs.forEach((run) => (run.text = run.text.toUpperCase()));
    const size = eyebrow
      ? 9.6
      : element.matches('.lede, .project-status')
        ? 13.8
        : element.matches('.print-meta')
          ? 9.6
          : element.matches('.trust-line')
            ? 11.4
            : BODY;
    const space = element.matches('.material-plan-heading p')
      ? 16
      : element.matches('.lede, .trust-line')
        ? 13.8
        : element.matches('#planner-results > .eyebrow')
          ? 24
          : element.matches('.print-meta')
            ? 14.94
            : element.matches('.project-status')
              ? 0
              : element.matches('.shopping-summary-note')
                ? 9.6
                : eyebrow
                  ? 3
                  : 6;
    const ordinaryParagraph = !element.matches(
      '.eyebrow, .lede, .trust-line, .print-meta, .project-status, .shopping-summary-note',
    );
    appendText(
      blocks,
      runs,
      size,
      ordinaryParagraph && space === 6 ? 12 : space,
      0,
      false,
      eyebrow,
      undefined,
      ordinaryParagraph ? 12 : undefined,
    );
    return;
  }
  if (element.matches('ol, ul')) {
    const ordered = element.tagName.toLowerCase() === 'ol';
    let index = Number(element.getAttribute('start') ?? 1);
    const items = Array.from(element.querySelectorAll(':scope > li'));
    items.forEach((li, position) => {
      const marker = ordered ? `${index++}. ` : '• ';
      const space =
        position === 0 && element.matches('.material-plan-intro > ol')
          ? 16.6
          : position === 0
            ? 12
            : 0;
      appendText(
        blocks,
        [{ text: marker, bold: false }, ...rich(li)],
        BODY,
        space,
        15,
        false,
        false,
        undefined,
        position === items.length - 1 ? 12 : undefined,
        15,
      );
    });
    return;
  }
  for (const child of element.children) collect(child, blocks);
}

function snapshot(input: PlannerPrintPdfInput): Block[] {
  const blocks: Block[] = [];
  collect(input.pageRoot, blocks);
  if (!blocks.some((block) => block.kind === 'table'))
    throw new Error('No completed shopping result is available to export.');
  return blocks;
}

function isolateSvg(
  source: SVGSVGElement,
  serial: number,
  scale: number,
): SVGSVGElement {
  const svg = source.cloneNode(true) as SVGSVGElement;
  const prefix = `pdf-${serial}-`;
  const ids = new Map<string, string>();
  for (const item of [svg, ...Array.from(svg.querySelectorAll('*'))]) {
    if (item.id) {
      ids.set(item.id, prefix + item.id);
      item.id = prefix + item.id;
    }
  }
  for (const item of [svg, ...Array.from(svg.querySelectorAll('*'))]) {
    for (const name of item.getAttributeNames()) {
      if (name === 'id') continue;
      let value = item.getAttribute(name) ?? '';
      value = value.replace(/url\(#([^)]+)\)/gu, (whole, id: string) =>
        ids.has(id) ? `url(#${ids.get(id)})` : whole,
      );
      if (name === 'aria-labelledby')
        value = value
          .split(/\s+/u)
          .map((id) => ids.get(id) ?? id)
          .join(' ');
      item.setAttribute(name, value);
    }
  }
  svg.querySelectorAll('style, filter').forEach((node) => node.remove());
  svg.removeAttribute('style');
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('font-family', FONT);
  svg.setAttribute('fill', '#000');
  svg.setAttribute('stroke', 'none');
  for (const element of svg.querySelectorAll<SVGElement>('text')) {
    element.removeAttribute('filter');
    const clearance = element.classList.contains('print-label-clearance');
    const fontSize = element.style.fontSize;
    const clearanceWidth = element.style.strokeWidth;
    element.removeAttribute('style');
    if (fontSize) element.style.fontSize = fontSize;
    if (clearance && clearanceWidth) element.style.strokeWidth = clearanceWidth;
    element.setAttribute('display', 'inline');
    element.setAttribute('fill', clearance ? '#fff' : '#000');
    element.setAttribute('stroke', clearance ? '#fff' : 'none');
    element.setAttribute('paint-order', 'stroke fill');
    element.setAttribute('font-family', FONT);
    element.setAttribute(
      'text-anchor',
      element.matches(
        '.piece-label, .waste-label, .dimension-label, .direction-marker text',
      )
        ? 'middle'
        : 'start',
    );
    if (element.matches('.piece-label, .waste-label'))
      element.setAttribute('font-weight', 'bold');
    if (element.matches('.waste-label'))
      element.setAttribute('letter-spacing', '.04em');
    if (element.matches('.dimension-label, .direction-marker text'))
      element.setAttribute('font-size', '11');
  }
  for (const element of svg.querySelectorAll<SVGElement>('.piece-dimension'))
    element.setAttribute('font-weight', 'normal');
  for (const element of svg.querySelectorAll<SVGElement>(
    '.fabric-outline, .piece rect, .waste, .strip-boundary, .direction-marker line, .direction-marker path',
  )) {
    element.setAttribute('stroke', '#000');
    element.setAttribute(
      'stroke-width',
      element.matches(
        '.strip-boundary, .direction-marker line, .direction-marker path',
      )
        ? String(1.125 / scale)
        : String(0.75 / scale),
    );
    if (element.matches('.direction-marker line, .direction-marker path'))
      element.setAttribute('fill', 'none');
    if (element.matches('.strip-boundary'))
      element.setAttribute('stroke-dasharray', '8 4');
    // svg2pdf does not implement vector-effect; compensate after page fit.
  }
  // Presentation attributes on pattern children survive external styles and dark mode.
  for (const element of svg.querySelectorAll<SVGElement>(
    '.piece-pattern-background',
  ))
    element.setAttribute('fill', '#fff');
  for (const element of svg.querySelectorAll<SVGElement>(
    '.waste-pattern-background',
  ))
    element.setAttribute('fill', '#eee');
  for (const element of svg.querySelectorAll<SVGElement>('.piece-pattern-mark'))
    element.setAttribute('stroke', '#555');
  for (const element of svg.querySelectorAll<SVGElement>('.waste-pattern-mark'))
    element.setAttribute('stroke', '#aaa');
  return svg;
}

class Pages {
  readonly pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    compress: true,
  });
  width = A4_SHORT;
  height = A4_LONG;
  y = MARGIN;
  hasContent = false;
  afterDiagram = false;
  inset = 0;
  pendingMargin = 0;

  start(landscape = false): void {
    if (!this.hasContent) {
      this.pdf.deletePage(this.pdf.getCurrentPageInfo().pageNumber);
    }
    this.pdf.addPage('a4', landscape ? 'landscape' : 'portrait');
    this.width = landscape ? A4_LONG : A4_SHORT;
    this.height = landscape ? A4_SHORT : A4_LONG;
    this.y = MARGIN;
    this.hasContent = false;
    this.afterDiagram = false;
    this.pendingMargin = 0;
  }

  ensure(height: number): void {
    if (this.afterDiagram || this.y + height > this.height - MARGIN)
      this.start();
  }

  lines(value: string, width: number, size: number, bold: boolean): string[] {
    this.pdf.setFont(FONT, bold ? 'bold' : 'normal');
    this.pdf.setFontSize(size);
    return this.pdf.splitTextToSize(value, width) as string[];
  }

  measure(text: string, size: number, bold: boolean): number {
    this.pdf.setFont(FONT, bold ? 'bold' : 'normal');
    this.pdf.setFontSize(size);
    return this.pdf.getTextWidth(text);
  }

  wrap(runs: Run[], width: number, size: number, hanging = 0): Run[][] {
    const lines: Run[][] = [[]];
    let used = 0;
    let available = width;
    const add = (text: string, bold: boolean): void => {
      const line = lines[lines.length - 1]!;
      const last = line.at(-1);
      if (last?.bold === bold) last.text += text;
      else line.push({ text, bold });
      used += this.measure(text, size, bold);
    };
    const nextLine = (): void => {
      lines.push([]);
      used = 0;
      available = width - hanging;
    };
    for (const run of runs) {
      for (const token of run.text.match(/\s+|\S+/gu) ?? []) {
        const tokenWidth = this.measure(token, size, run.bold);
        if (/^\s+$/u.test(token)) {
          if (used > 0 && used + tokenWidth <= available) add(' ', run.bold);
          continue;
        }
        if (used > 0 && used + tokenWidth > available) nextLine();
        if (tokenWidth <= available) {
          add(token, run.bold);
          continue;
        }
        for (const character of token) {
          if (
            used > 0 &&
            used + this.measure(character, size, run.bold) > available
          )
            nextLine();
          add(character, run.bold);
        }
      }
    }
    if (!lines.at(-1)?.length && lines.length > 1) lines.pop();
    return lines;
  }

  drawLine(
    runs: Run[],
    x: number,
    y: number,
    size: number,
    accent = false,
  ): void {
    if (accent) this.pdf.setTextColor(109, 51, 79);
    else this.pdf.setTextColor(0);
    this.pdf.setCharSpace(accent ? size * 0.08 : 0);
    for (const run of runs) {
      this.pdf.setFont(FONT, run.bold ? 'bold' : 'normal');
      this.pdf.setFontSize(size);
      this.pdf.text(run.text, x, y);
      x +=
        this.pdf.getTextWidth(run.text) +
        (accent ? Math.max(0, run.text.length - 1) * size * 0.08 : 0);
    }
    this.pdf.setCharSpace(0);
  }

  write(
    value: string | Run[],
    size = BODY,
    bold = false,
    space = 4,
    indent = 0,
    heading = false,
    accent = false,
    leading = heading ? 1.18 : 1.55,
    afterMargin = 0,
    hanging = 0,
    afterDiagramTopMargin = 0,
  ): void {
    const lineHeight = size * leading;
    space = Math.max(space, this.pendingMargin);
    this.pendingMargin = 0;
    const runs = typeof value === 'string' ? [{ text: value, bold }] : value;
    const lines = this.wrap(
      runs,
      this.width - 2 * MARGIN - 2 * this.inset - indent,
      size,
      hanging,
    );
    if (!lines.some((line) => line.length)) return;
    const followsDiagram = this.afterDiagram;
    this.ensure(
      space + lineHeight * (heading ? Math.min(2, lines.length + 1) : 1),
    );
    if (this.hasContent) this.y += space;
    else if (followsDiagram) this.y += afterDiagramTopMargin;
    for (const [index, line] of lines.entries()) {
      this.ensure(lineHeight);
      this.drawLine(
        line,
        MARGIN + this.inset + indent + (index > 0 ? hanging : 0),
        this.y + size,
        size,
        accent,
      );
      this.y += lineHeight;
      this.hasContent = true;
    }
    this.pendingMargin = afterMargin;
  }

  callout(runs: Run[]): void {
    const padding = 12;
    const rule = 4.2;
    const lines = this.wrap(
      runs,
      this.width - 2 * MARGIN - 2 * padding - rule,
      BODY,
    );
    const height = lines.length * BODY * 1.55 + 2 * padding;
    this.ensure(height + 8);
    if (this.hasContent) this.y += 8;
    const top = this.y;
    lines.forEach((line, index) =>
      this.drawLine(
        line,
        MARGIN + rule + padding,
        top + padding + BODY + index * BODY * 1.55,
        BODY,
      ),
    );
    this.y = top + height;
    this.pdf.setDrawColor(0);
    this.pdf.setLineWidth(rule);
    this.pdf.line(MARGIN + rule / 2, top, MARGIN + rule / 2, this.y);
    this.hasContent = true;
  }

  facts(block: Extract<Block, { kind: 'facts' }>): void {
    const gridGap = 8.4;
    const availableWidth = this.width - 2 * MARGIN - 2 * this.inset;
    const maxColumns = Math.max(
      1,
      Math.floor((availableWidth + gridGap) / (120 + gridGap)),
    );
    const columns = Math.min(block.pairs.length, maxColumns);
    const width = (availableWidth - (columns - 1) * gridGap) / columns;
    const termSize = 10.56;
    const termHeight = termSize * 1.55;
    const definitionHeight = BODY * 1.55;
    for (let index = 0; index < block.pairs.length; index += columns) {
      const group = block.pairs.slice(index, index + columns);
      const cells = group.map((pair) => ({
        term: this.wrap(pair.term, width, termSize),
        definition: this.wrap(pair.definition, width, BODY),
      }));
      const height =
        Math.max(
          ...cells.map(
            (cell) =>
              cell.term.length * termHeight +
              2.4 +
              cell.definition.length * definitionHeight,
          ),
        ) + 5.7;
      const verticalGap = index === 0 ? 12 : gridGap;
      this.ensure(height + verticalGap);
      if (this.hasContent) this.y += verticalGap;
      const top = this.y;
      cells.forEach((cell, cellIndex) => {
        const x = MARGIN + this.inset + cellIndex * (width + gridGap);
        let y = top + 2.85;
        for (const line of cell.term) {
          this.drawLine(line, x, y + termSize, termSize);
          y += termHeight;
        }
        y += 2.4;
        for (const line of cell.definition) {
          this.drawLine(line, x, y + BODY, BODY);
          y += definitionHeight;
        }
      });
      this.y = top + height;
      this.hasContent = true;
    }
    this.pendingMargin = 12; // dl's UA bottom margin collapses with the next block.
  }

  beginClosingSection(
    block: Extract<Block, { kind: 'closing-section' }>,
  ): void {
    const followsDiagram = this.afterDiagram;
    const targetWidth = followsDiagram ? A4_SHORT : this.width;
    const targetHeight = followsDiagram ? A4_LONG : this.height;
    let pending = this.pendingMargin;
    let required = 0;
    if (block.bordered) {
      // The assumptions border prevents the preceding list margin from
      // collapsing with the heading's own top margin.
      required += pending + 0.75 + 12;
      pending = 0;
    }
    for (const child of block.children) {
      const lines = this.wrap(
        child.runs,
        targetWidth - 2 * MARGIN - child.indent,
        child.size,
        child.hanging,
      );
      required +=
        Math.max(child.space, pending) +
        lines.length *
          child.size *
          (child.leading ?? (child.heading ? 1.18 : 1.55));
      pending = child.afterMargin ?? 0;
    }
    const fitsOnePage = required <= targetHeight - 2 * MARGIN;
    if (
      followsDiagram ||
      (fitsOnePage &&
        this.hasContent &&
        this.y + required > targetHeight - MARGIN)
    ) {
      this.start();
      if (followsDiagram && !block.bordered) this.y += 9.92;
    }
    if (block.bordered) {
      if (this.hasContent) this.y += this.pendingMargin;
      this.pendingMargin = 0;
      this.pdf.setDrawColor(0);
      this.pdf.setLineWidth(0.75);
      this.pdf.line(MARGIN, this.y, this.width - MARGIN, this.y);
      this.y += 0.75 + 12;
      this.hasContent = true;
    }
  }

  table(block: Extract<Block, { kind: 'table' }>): void {
    this.write(block.caption, 15, false, 9.6, 0, true);
    this.y += 7.2; // caption's print margin-bottom: 0.6rem
    const fractions =
      block.headers.length === 4
        ? [0.28, 0.24, 0.24, 0.24]
        : block.headers.map(() => 1 / block.headers.length);
    const widths = fractions.map(
      (part) => part * (this.width - 2 * MARGIN - 2 * this.inset),
    );
    const padding = 7.8;
    const lineHeight = BODY * 1.55;
    const headerLines = block.headers.map((cell, index) =>
      this.wrap(cell, (widths[index] ?? 0) - 2 * padding, BODY),
    );
    const drawRows = (cells: Run[][], header: boolean): void => {
      const chunks = (
        header
          ? headerLines
          : cells.map((cell, index) =>
              this.wrap(cell, (widths[index] ?? 0) - 2 * padding, BODY),
            )
      ).map((lines) => [...lines]);
      while (chunks.some((lines) => lines.length)) {
        const maxLines = Math.max(...chunks.map((lines) => lines.length));
        const wholeHeight = maxLines * lineHeight + 2 * padding;
        if (
          this.hasContent &&
          this.y + wholeHeight > this.height - MARGIN &&
          wholeHeight <=
            this.height -
              2 * MARGIN -
              (header
                ? 0
                : Math.max(...headerLines.map((lines) => lines.length)) *
                    lineHeight +
                  2 * padding)
        ) {
          this.start();
          if (!header) drawRows(block.headers, true);
        }
        let capacity = Math.floor(
          (this.height - MARGIN - this.y - 2 * padding) / lineHeight,
        );
        if (capacity < 1) {
          this.start();
          if (!header) drawRows(block.headers, true);
          capacity = Math.floor(
            (this.height - MARGIN - this.y - 2 * padding) / lineHeight,
          );
        }
        const take = Math.min(capacity, maxLines);
        const rowHeight = take * lineHeight + 2 * padding;
        let x = MARGIN + this.inset;
        chunks.forEach((lines, index) => {
          lines
            .splice(0, take)
            .forEach((line, lineIndex) =>
              this.drawLine(
                line,
                x + padding,
                this.y + padding + BODY + lineIndex * lineHeight,
                BODY,
              ),
            );
          x += widths[index] ?? 0;
        });
        this.y += rowHeight;
        this.pdf.setDrawColor(0);
        this.pdf.setLineWidth(0.75);
        this.pdf.line(
          MARGIN + this.inset,
          this.y,
          this.width - MARGIN - this.inset,
          this.y,
        );
        this.hasContent = true;
        if (!header && chunks.some((lines) => lines.length)) {
          this.start();
          drawRows(block.headers, true);
        }
      }
    };
    drawRows(block.headers, true);
    for (const row of block.rows) drawRows(row, false);
  }

  async diagram(
    block: Extract<Block, { kind: 'diagram' }>,
    serial: number,
  ): Promise<void> {
    // getBBox includes the exterior dimension labels, unlike the full screen
    // viewBox's unused padding. This is the same crop used by native print.
    const bounds = block.element.getBBox();
    if (!(bounds.width > 0 && bounds.height > 0))
      throw new Error('A cutting diagram has no printable geometry.');
    const inset = 5;
    const crop = {
      x: bounds.x - inset,
      y: bounds.y - inset,
      width: bounds.width + 2 * inset,
      height: bounds.height + 2 * inset,
    };
    const fit = (width: number, height: number): number => {
      const textWidth = width - 2 * MARGIN;
      const titleHeight =
        this.lines(block.title, textWidth, 9.96, true).length * 9.96 * 1.18;
      const legendHeight =
        this.lines(block.legend, textWidth, 10.8, false).length * 10.8 * 1.5;
      return Math.min(
        textWidth / crop.width,
        (height - 2 * MARGIN - titleHeight - legendHeight - 10) / crop.height,
      );
    };
    const landscape = block.orientation
      ? block.orientation === 'landscape'
      : crop.width >= crop.height;
    if (
      fit(landscape ? A4_LONG : A4_SHORT, landscape ? A4_SHORT : A4_LONG) <= 0
    )
      throw new Error(
        'The cutting diagram heading and legend do not fit an A4 page.',
      );
    this.start(landscape);
    this.write(block.title, 9.96, true, 0, 0, true);
    this.write(block.legend, 10.8, false, 5.67);
    this.y += 7;
    const scale = Math.min(
      (this.width - 2 * MARGIN) / crop.width,
      (this.height - MARGIN - this.y) / crop.height,
    );
    const svgWidth = crop.width * scale;
    const svgHeight = crop.height * scale;
    const svg = isolateSvg(block.element, serial, scale);
    svg.setAttribute(
      'viewBox',
      `${crop.x} ${crop.y} ${crop.width} ${crop.height}`,
    );
    await this.pdf.svg(svg, {
      x: (this.width - svgWidth) / 2,
      y: this.y,
      width: svgWidth,
      height: svgHeight,
      loadImages: false,
      loadExternalStyleSheets: false,
    });
    this.y += svgHeight;
    this.hasContent = true;
    this.afterDiagram = true;
  }
}

/** Create a local, vector and searchable A4 print file from the rendered result. */
export async function createPlannerPrintPdf(
  input: PlannerPrintPdfInput,
): Promise<Uint8Array> {
  const blocks = snapshot(input);
  const [regular, bold] = await localFonts();
  verifyGlyphs(blocks, [regular, bold]);
  const pages = new Pages();
  pages.pdf.addFileToVFS('NotoSans-Regular.ttf', regular.binary);
  pages.pdf.addFileToVFS('NotoSans-Bold.ttf', bold.binary);
  pages.pdf.addFont('NotoSans-Regular.ttf', FONT, 'normal');
  pages.pdf.addFont('NotoSans-Bold.ttf', FONT, 'bold');
  const total = blocks.filter((block) => block.kind === 'diagram').length;
  let completed = 0;
  let serial = 0;
  for (const block of blocks) {
    switch (block.kind) {
      case 'page':
        if (pages.hasContent && !pages.afterDiagram) pages.start();
        break;
      case 'text':
        pages.write(
          block.runs,
          block.size,
          false,
          block.space,
          block.indent,
          block.heading,
          block.accent,
          block.leading,
          block.afterMargin,
          block.hanging,
          block.afterDiagramTopMargin,
        );
        break;
      case 'summary':
        pages.inset = block.enter ? 12 : 0;
        pages.y += block.enter ? 16.25 : 12; // meta margin + summary padding
        break;
      case 'closing-section':
        pages.beginClosingSection(block);
        break;
      case 'spacer':
        pages.ensure(block.height);
        pages.y += block.height;
        break;
      case 'callout':
        pages.callout(block.runs);
        break;
      case 'facts':
        pages.facts(block);
        break;
      case 'table':
        pages.table(block);
        break;
      case 'diagram':
        await pages.diagram(block, ++serial);
        input.onProgress?.(++completed, total);
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        break;
    }
  }
  return new Uint8Array(pages.pdf.output('arraybuffer'));
}
