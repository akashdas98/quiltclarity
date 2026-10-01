import type { CuttingDiagramModel } from './types';

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function number(value: number): string {
  return String(Number(value.toFixed(4)));
}

interface TextLine {
  text: string;
  fontSize: number;
  className: 'piece-label-line' | 'piece-dimension';
}

interface PieceLabelLayout {
  lines: TextLine[];
  firstBaselineY: number;
  lineHeights: number[];
  fontSize: number;
  padding: number;
  rotated: boolean;
  orientedHeight: number;
}

const LABEL_PADDING = 4;
const BASE_LABEL_FONT_SIZE = 12;
const MAXIMUM_LABEL_FONT_SIZE = 24;
const LABEL_FIT_ITERATIONS = 28;

function maximumLabelFontSize(width: number, height: number): number {
  const boxBasedSize = Math.floor(Math.min(width / 8, height / 4));
  return Math.min(
    MAXIMUM_LABEL_FONT_SIZE,
    Math.max(BASE_LABEL_FONT_SIZE, boxBasedSize),
  );
}

function estimatedTextWidth(text: string, fontSize: number): number {
  const units = [...text].reduce((total, character) => {
    if (character === ' ') return total + 0.34;
    if (/[ilI1|.,'″]/.test(character)) return total + 0.32;
    if (/[MW@%]/.test(character)) return total + 0.9;
    if (/[A-Z0-9]/.test(character)) return total + 0.64;
    return total + 0.56;
  }, 0);
  return units * fontSize;
}

function wrapText(
  text: string,
  availableWidth: number,
  fontSize: number,
): string[] {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (const token of tokens) {
    const candidate = line === '' ? token : `${line} ${token}`;
    if (
      line !== '' &&
      estimatedTextWidth(candidate, fontSize) > availableWidth
    ) {
      lines.push(line);
      line = token;
    } else {
      line = candidate;
    }
  }
  if (line !== '') lines.push(line);
  return lines;
}

function adaptiveLabelPadding(width: number, height: number): number {
  return Math.min(LABEL_PADDING, width * 0.08, height * 0.08);
}

function layoutPieceLabelAtSize(
  label: string,
  dimensionLabel: string,
  width: number,
  height: number,
  labelFontSize: number,
  rotated: boolean,
): PieceLabelLayout | undefined {
  const padding = adaptiveLabelPadding(width, height);
  const orientedWidth = rotated ? height : width;
  const orientedHeight = rotated ? width : height;
  const availableWidth = orientedWidth - 2 * padding;
  const availableHeight = orientedHeight - 2 * padding;
  if (availableWidth <= 0 || availableHeight <= 0) return undefined;

  const dimensionFontSize = labelFontSize * 0.84;
  const labelLines = wrapText(label, availableWidth, labelFontSize);
  const dimensionLines = wrapText(
    dimensionLabel,
    availableWidth,
    dimensionFontSize,
  );
  const lines: TextLine[] = [
    ...labelLines.map((text) => ({
      text,
      fontSize: labelFontSize,
      className: 'piece-label-line' as const,
    })),
    ...dimensionLines.map((text) => ({
      text,
      fontSize: dimensionFontSize,
      className: 'piece-dimension' as const,
    })),
  ];
  const lineHeights = lines.map((line) => line.fontSize * 1.15);
  const totalHeight = lineHeights.reduce((total, value) => total + value, 0);
  const widestLine = Math.max(
    0,
    ...lines.map((line) => estimatedTextWidth(line.text, line.fontSize)),
  );
  if (
    lines.length === 0 ||
    totalHeight > availableHeight ||
    widestLine > availableWidth
  ) {
    return undefined;
  }

  return {
    lines,
    firstBaselineY:
      (orientedHeight - totalHeight) / 2 + lines[0]!.fontSize * 0.82,
    lineHeights,
    fontSize: labelFontSize,
    padding,
    rotated,
    orientedHeight,
  };
}

function fitPieceLabelOrientation(
  label: string,
  dimensionLabel: string,
  width: number,
  height: number,
  startingFontSize: number,
  rotated: boolean,
): PieceLabelLayout {
  let lowerBound = 0;
  let upperBound = startingFontSize;
  let best: PieceLabelLayout | undefined;

  for (let iteration = 0; iteration < LABEL_FIT_ITERATIONS; iteration += 1) {
    const fontSize = (lowerBound + upperBound) / 2;
    const candidate = layoutPieceLabelAtSize(
      label,
      dimensionLabel,
      width,
      height,
      fontSize,
      rotated,
    );
    if (candidate === undefined) {
      upperBound = fontSize;
    } else {
      best = candidate;
      lowerBound = fontSize;
    }
  }

  if (best !== undefined) return best;

  // Positive rectangles always admit a positive text scale. This final probe
  // protects the visible-label invariant at the limits of floating-point input.
  return layoutPieceLabelAtSize(
    label,
    dimensionLabel,
    width,
    height,
    Number.EPSILON,
    rotated,
  )!;
}

function layoutPieceLabel(
  label: string,
  dimensionLabel: string,
  width: number,
  height: number,
): PieceLabelLayout {
  const intendedFontSize = maximumLabelFontSize(width, height);
  const fittingCeiling = Math.min(
    MAXIMUM_LABEL_FONT_SIZE,
    intendedFontSize * 1.25,
  );
  const horizontalAtIntendedSize = layoutPieceLabelAtSize(
    label,
    dimensionLabel,
    width,
    height,
    intendedFontSize,
    false,
  );
  const verticalAtIntendedSize = layoutPieceLabelAtSize(
    label,
    dimensionLabel,
    width,
    height,
    intendedFontSize,
    true,
  );

  if (
    horizontalAtIntendedSize !== undefined &&
    verticalAtIntendedSize !== undefined
  ) {
    return fitPieceLabelOrientation(
      label,
      dimensionLabel,
      width,
      height,
      fittingCeiling,
      verticalAtIntendedSize.lines.length <
        horizontalAtIntendedSize.lines.length,
    );
  }
  if (horizontalAtIntendedSize !== undefined) {
    return fitPieceLabelOrientation(
      label,
      dimensionLabel,
      width,
      height,
      fittingCeiling,
      false,
    );
  }
  if (verticalAtIntendedSize !== undefined) {
    return fitPieceLabelOrientation(
      label,
      dimensionLabel,
      width,
      height,
      fittingCeiling,
      true,
    );
  }

  const horizontal = fitPieceLabelOrientation(
    label,
    dimensionLabel,
    width,
    height,
    fittingCeiling,
    false,
  );
  const vertical = fitPieceLabelOrientation(
    label,
    dimensionLabel,
    width,
    height,
    fittingCeiling,
    true,
  );

  return vertical.fontSize > horizontal.fontSize ? vertical : horizontal;
}

function labelStrokeWidths(fontSize: number): {
  screen: number;
  print: number;
} {
  return {
    screen: Math.min(2.5, Math.max(0.05, fontSize * 0.2)),
    print: Math.min(7, Math.max(0.1, fontSize * 0.58)),
  };
}

export function renderCuttingDiagramSvg(model: CuttingDiagramModel): string {
  const titleId = `${model.idPrefix}-title`;
  const descriptionId = `${model.idPrefix}-description`;
  const wastePatternId = `${model.idPrefix}-waste`;
  const labelShadowId = `${model.idPrefix}-label-shadow`;
  const patternIndexes = [
    ...new Set(model.pieces.map((piece) => piece.patternIndex)),
  ];
  const patterns = patternIndexes
    .map((patternIndex) => {
      const patternId = `${model.idPrefix}-piece-${patternIndex}`;
      const spacing = 7 + (patternIndex % 4) * 3;
      const orientation = patternIndex % 2 === 0 ? 'rising' : 'falling';
      const path =
        orientation === 'rising'
          ? `M0 ${spacing} L${spacing} 0`
          : `M0 0 L${spacing} ${spacing}`;
      return `<pattern id="${patternId}" data-pattern-orientation="${orientation}" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse"><rect class="piece-pattern-background" width="100%" height="100%" fill="#fff"/><path class="piece-pattern-mark" d="${path}" stroke="#555" stroke-width="1.25"/></pattern>`;
    })
    .join('');
  const wasteLayouts = model.wasteRegions.map((region) =>
    layoutPieceLabel('Scrap', '', region.width, region.height),
  );
  const wasteClips = wasteLayouts
    .map((layout, index) => {
      const region = model.wasteRegions[index]!;
      return `<clipPath id="${model.idPrefix}-waste-label-${index}"><rect x="${number(region.x + layout.padding)}" y="${number(region.y + layout.padding)}" width="${number(region.width - 2 * layout.padding)}" height="${number(region.height - 2 * layout.padding)}"/></clipPath>`;
    })
    .join('');
  const wasteRegions = model.wasteRegions
    .map((region, regionIndex) => {
      const layout = wasteLayouts[regionIndex];
      const centerX = region.x + region.width / 2;
      const centerY = region.y + region.height / 2;
      const labelY =
        centerY - layout.orientedHeight / 2 + layout.firstBaselineY;
      const rotation = layout.rotated
        ? ` transform="rotate(-90 ${number(centerX)} ${number(centerY)})"`
        : '';
      const strokeWidths = labelStrokeWidths(layout.fontSize);
      const label = `<g class="waste-label-clip" clip-path="url(#${model.idPrefix}-waste-label-${regionIndex})"><text class="waste-label print-label-clearance" aria-hidden="true" x="${number(centerX)}" y="${number(labelY)}"${rotation} style="font-size:${number(layout.fontSize)}px;stroke-width:${number(strokeWidths.print)}px">Scrap</text><text class="waste-label" aria-hidden="true" data-waste-label-font-size="${number(layout.fontSize)}" data-label-orientation="${layout.rotated ? 'vertical' : 'horizontal'}" x="${number(centerX)}" y="${number(labelY)}"${rotation} style="font-size:${number(layout.fontSize)}px;stroke-width:${number(strokeWidths.screen)}px" filter="url(#${labelShadowId})">Scrap</text></g>`;
      return `<g class="waste-region" data-waste-kind="${region.kind}"><title>Scrap area</title><rect class="waste" x="${number(region.x)}" y="${number(region.y)}" width="${number(region.width)}" height="${number(region.height)}" fill="url(#${wastePatternId})"/>${label}</g>`;
    })
    .join('');
  const pieceLayouts = model.pieces.map((piece) =>
    layoutPieceLabel(
      piece.label,
      piece.dimensionLabel,
      piece.width,
      piece.height,
    ),
  );
  const labelClips = pieceLayouts
    .map((layout, index) => {
      const piece = model.pieces[index]!;
      return `<clipPath id="${model.idPrefix}-piece-label-${index}"><rect x="${number(piece.x + layout.padding)}" y="${number(piece.y + layout.padding)}" width="${number(piece.width - 2 * layout.padding)}" height="${number(piece.height - 2 * layout.padding)}"/></clipPath>`;
    })
    .join('');
  const pieces = model.pieces
    .map((piece, pieceIndex) => {
      const title = `${piece.label} (${piece.pieceGroupId}), instance ${piece.instanceIndex + 1}, ${piece.dimensionLabel}${piece.rotated ? ', rotated' : ''}`;
      const layout = pieceLayouts[pieceIndex];
      const centerX = piece.x + piece.width / 2;
      const centerY = piece.y + piece.height / 2;
      const labelY =
        centerY - layout.orientedHeight / 2 + layout.firstBaselineY;
      const rotation = layout.rotated
        ? ` transform="rotate(-90 ${number(centerX)} ${number(centerY)})"`
        : '';
      const strokeWidths = labelStrokeWidths(layout.fontSize);
      const labelLines = layout.lines
        .map(
          (line, lineIndex) =>
            `<tspan class="${line.className}" x="${number(centerX)}"${lineIndex === 0 ? '' : ` dy="${number(layout.lineHeights[lineIndex - 1]!)}"`} style="font-size:${number(line.fontSize)}px">${escapeXml(line.text)}</tspan>`,
        )
        .join('');
      const label = `<g class="piece-label-clip" clip-path="url(#${model.idPrefix}-piece-label-${pieceIndex})"><text class="piece-label print-label-clearance" aria-hidden="true" x="${number(centerX)}" y="${number(labelY)}"${rotation} style="stroke-width:${number(strokeWidths.print)}px">${labelLines}</text><text class="piece-label" data-label-lines="${layout.lines.length}" data-label-font-size="${number(layout.fontSize)}" data-label-orientation="${layout.rotated ? 'vertical' : 'horizontal'}" x="${number(centerX)}" y="${number(labelY)}"${rotation} style="stroke-width:${number(strokeWidths.screen)}px" filter="url(#${labelShadowId})">${labelLines}</text></g>`;
      return `<g class="piece" data-piece-group="${escapeXml(piece.pieceGroupId)}" data-instance-index="${piece.instanceIndex}" data-source-x="${number(piece.sourceX)}" data-source-y="${number(piece.sourceY)}" data-source-width="${number(piece.sourceWidth)}" data-source-height="${number(piece.sourceHeight)}"><title>${escapeXml(title)}</title><rect x="${number(piece.x)}" y="${number(piece.y)}" width="${number(piece.width)}" height="${number(piece.height)}" fill="url(#${model.idPrefix}-piece-${piece.patternIndex})"/>${label}</g>`;
    })
    .join('');
  const boundaries = model.stripBoundaries
    .map(
      (boundary) =>
        `<line class="strip-boundary" data-source-y="${number(boundary.sourceY)}" x1="${model.padding}" x2="${number(model.width - model.padding)}" y1="${number(boundary.y)}" y2="${number(boundary.y)}"/>`,
    )
    .join('');
  const directionMarker = model.directional
    ? `<g class="direction-marker" aria-label="Fabric direction runs down the length"><line x1="${number(model.width - model.padding / 2)}" y1="${model.padding}" x2="${number(model.width - model.padding / 2)}" y2="${number(model.padding + 48)}"/><path d="M${number(model.width - model.padding / 2 - 5)} ${number(model.padding + 40)} L${number(model.width - model.padding / 2)} ${number(model.padding + 48)} L${number(model.width - model.padding / 2 + 5)} ${number(model.padding + 40)}"/><text x="${number(model.width - model.padding / 2)}" y="${number(model.padding + 62)}">Direction</text></g>`
    : '';

  return `<svg id="${model.idPrefix}" class="cutting-diagram" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${number(model.width)} ${number(model.height)}" role="img" aria-labelledby="${titleId} ${descriptionId}" preserveAspectRatio="xMidYMin meet"><title id="${titleId}">${escapeXml(model.textAlternative.title)}</title><desc id="${descriptionId}">${escapeXml(model.textAlternative.summary)}</desc><defs>${patterns}${labelClips}${wasteClips}<filter id="${labelShadowId}" x="-40%" y="-40%" width="180%" height="200%" color-interpolation-filters="sRGB"><feDropShadow dx="0" dy="2.5" stdDeviation="3" flood-color="#fff" flood-opacity="1"/></filter><pattern id="${wastePatternId}" width="8" height="8" patternUnits="userSpaceOnUse"><rect class="waste-pattern-background" width="100%" height="100%" fill="#eee"/><path class="waste-pattern-mark" d="M0 8 L8 0" stroke="#aaa" stroke-width="1"/></pattern></defs><style>.cutting-diagram{display:block;max-width:none;height:auto;background:#fff}.fabric-outline,.piece rect,.waste{stroke:#111;stroke-width:1;vector-effect:non-scaling-stroke}.piece-label{font-family:system-ui,sans-serif;font-weight:600;text-anchor:middle;fill:#111}.piece-label,.waste-label{stroke:#fff;stroke-width:2.5px;stroke-linejoin:round;paint-order:stroke fill}.print-label-clearance{display:none}.piece-dimension{font-weight:400}.waste-label{font-family:system-ui,sans-serif;font-weight:650;text-anchor:middle;letter-spacing:.04em;fill:#222}.strip-boundary{stroke:#111;stroke-width:1.5;stroke-dasharray:8 4;vector-effect:non-scaling-stroke}.dimension-label,.direction-marker text{font:11px system-ui,sans-serif;fill:#111;text-anchor:middle}.direction-marker line,.direction-marker path{fill:none;stroke:#111;stroke-width:1.5;vector-effect:non-scaling-stroke}@media print{.cutting-diagram{width:100%;max-height:95vh;break-inside:avoid}.piece rect,.waste{stroke:#000}.piece-label,.waste-label,.dimension-label,.direction-marker text{fill:#000}.piece-label,.waste-label{stroke:none;filter:none}.print-label-clearance{display:block;fill:#fff;stroke:#fff;stroke-width:7px;stroke-linejoin:round;paint-order:stroke fill}}</style><rect class="fabric-outline" x="${model.padding}" y="${model.padding}" width="${number(model.width - 2 * model.padding)}" height="${number(model.height - 2 * model.padding)}" fill="#fff"/>${wasteRegions}${pieces}${boundaries}<text class="dimension-label" x="${number(model.width / 2)}" y="${number(model.padding - 18)}">Usable width ${escapeXml(model.usableWidthLabel)}</text><text class="dimension-label" transform="translate(${number(model.padding - 30)} ${number(model.height / 2)}) rotate(-90)">${escapeXml(model.lengthAxisLabel ?? 'Used length')} ${escapeXml(model.usedLengthLabel)}</text>${directionMarker}</svg>`;
}
