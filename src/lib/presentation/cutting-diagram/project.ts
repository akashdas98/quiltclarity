import {
  formatImperialInches,
  fromMillimetres,
  type FabricOptimizationSuccess,
  type FabricSpec,
  type OptimizerRow,
  type Placement,
  type UnitSystem,
} from '../../domain';
import type {
  CuttingDiagramModel,
  CuttingDiagramOptions,
  CuttingDiagramTextAlternative,
  DiagramPiece,
  DiagramTextRun,
  DiagramTextRow,
  DiagramWasteRegion,
  ProjectedRectangle,
} from './types';

const DEFAULT_WIDTH = 800;
const DEFAULT_PADDING = 56;

function formatDecimal(value: number, maximumDecimals: number): string {
  const rounded = Number(value.toFixed(maximumDecimals));
  return String(rounded);
}

function formatLength(millimetres: number, unitSystem: UnitSystem): string {
  if (unitSystem === 'imperial') {
    return formatImperialInches(millimetres);
  }

  return `${formatDecimal(fromMillimetres(millimetres, 'centimetre'), 1)} cm`;
}

function safeIdPrefix(value: string): string {
  const safe = value.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-');
  return safe === '' ? 'cutting-diagram' : safe;
}

function projectRectangle(
  sourceX: number,
  sourceY: number,
  sourceWidth: number,
  sourceHeight: number,
  padding: number,
  scale: number,
): ProjectedRectangle {
  return {
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x: padding + sourceX * scale,
    y: padding + sourceY * scale,
    width: sourceWidth * scale,
    height: sourceHeight * scale,
  };
}

function buildPieces(
  result: FabricOptimizationSuccess,
  padding: number,
  scale: number,
  unitSystem: UnitSystem,
): DiagramPiece[] {
  const groups = new Map(
    result.normalizedPieces.map((piece, index) => [
      piece.id,
      { piece, patternIndex: index },
    ]),
  );

  return result.placements.map((placement) => {
    const group = groups.get(placement.pieceGroupId);
    if (group === undefined) {
      throw new Error(
        `Placement references unknown piece group: ${placement.pieceGroupId}`,
      );
    }
    const projected = projectRectangle(
      placement.x,
      placement.y,
      placement.width,
      placement.height,
      padding,
      scale,
    );

    return {
      ...projected,
      pieceGroupId: placement.pieceGroupId,
      instanceIndex: placement.instanceIndex,
      label: group.piece.label,
      dimensionLabel: `${formatLength(placement.width, unitSystem)} × ${formatLength(placement.height, unitSystem)}`,
      rotated: placement.rotated,
      patternIndex: group.patternIndex,
    };
  });
}

function buildWasteRegions(
  result: FabricOptimizationSuccess,
  usableWidth: number,
  padding: number,
  scale: number,
): DiagramWasteRegion[] {
  const regions: DiagramWasteRegion[] = [];
  const placementsByY = new Map<number, Placement[]>();
  for (const placement of result.placements) {
    const rowPlacements = placementsByY.get(placement.y) ?? [];
    rowPlacements.push(placement);
    placementsByY.set(placement.y, rowPlacements);
  }

  result.rows.forEach((row, rowIndex) => {
    if (row.usedWidth < 0 || row.usedWidth > usableWidth) {
      throw new Error('Optimizer row contains invalid used-width geometry.');
    }

    const rowPlacements = placementsByY.get(row.y) ?? [];
    for (const placement of rowPlacements) {
      if (placement.height < row.height) {
        regions.push({
          ...projectRectangle(
            placement.x,
            placement.y + placement.height,
            placement.width,
            row.height - placement.height,
            padding,
            scale,
          ),
          rowIndex,
          kind: 'above-shorter-piece',
        });
      }
    }

    if (row.usedWidth < usableWidth) {
      regions.push({
        ...projectRectangle(
          row.usedWidth,
          row.y,
          usableWidth - row.usedWidth,
          row.height,
          padding,
          scale,
        ),
        rowIndex,
        kind: 'row-remainder',
      });
    }
  });

  return regions;
}

interface TextRun {
  pieceGroupId: string;
  label: string;
  rotated: boolean;
  width: number;
  height: number;
  startX: number;
  endX: number;
  instanceIndexes: number[];
}

function buildTextRuns(
  placements: readonly Placement[],
  labels: ReadonlyMap<string, string>,
): TextRun[] {
  const runs: TextRun[] = [];

  for (const placement of [...placements].sort(
    (left, right) => left.x - right.x,
  )) {
    const previous = runs.at(-1);
    if (
      previous !== undefined &&
      previous.pieceGroupId === placement.pieceGroupId &&
      previous.rotated === placement.rotated &&
      previous.width === placement.width &&
      previous.height === placement.height &&
      previous.endX === placement.x
    ) {
      previous.endX = placement.x + placement.width;
      previous.instanceIndexes.push(placement.instanceIndex);
      continue;
    }

    runs.push({
      pieceGroupId: placement.pieceGroupId,
      label: labels.get(placement.pieceGroupId) ?? placement.pieceGroupId,
      rotated: placement.rotated,
      width: placement.width,
      height: placement.height,
      startX: placement.x,
      endX: placement.x + placement.width,
      instanceIndexes: [placement.instanceIndex],
    });
  }

  return runs;
}

function projectTextRun(run: TextRun, unitSystem: UnitSystem): DiagramTextRun {
  const instanceNumbers = run.instanceIndexes.map((index) => index + 1);
  const instanceLabel =
    instanceNumbers.length === 1
      ? `instance ${instanceNumbers[0]}`
      : `instances ${instanceNumbers[0]}–${instanceNumbers.at(-1)}`;

  return {
    label: run.label,
    pieceGroupId: run.pieceGroupId,
    instanceLabel,
    dimensionLabel: `${formatLength(run.width, unitSystem)} × ${formatLength(run.height, unitSystem)}`,
    rotated: run.rotated,
    startLabel: formatLength(run.startX, unitSystem),
    endLabel: formatLength(run.endX, unitSystem),
  };
}

function describeRun(run: DiagramTextRun): string {
  const rotation = run.rotated ? ', rotated' : '';
  return `${run.label} (${run.pieceGroupId}), ${run.instanceLabel}, ${run.dimensionLabel}${rotation}, from ${run.startLabel} to ${run.endLabel} across the fabric`;
}

function buildTextAlternative(
  fabric: FabricSpec,
  result: FabricOptimizationSuccess,
  unitSystem: UnitSystem,
): CuttingDiagramTextAlternative {
  const labels = new Map(
    result.normalizedPieces.map((piece) => [piece.id, piece.label]),
  );
  const title = `${fabric.name} cutting plan`;
  const summary = `Usable fabric width ${formatLength(fabric.usableWidth, unitSystem)}; used fabric length ${formatLength(result.usedLength, unitSystem)}; ${result.placements.length} pieces in ${result.rows.length} strips.${fabric.directional ? ' Fabric direction runs down the length.' : ''}`;
  const pieceGroups = result.normalizedPieces.map((piece) => ({
    label: piece.label,
    pieceGroupId: piece.id,
    quantity: piece.quantity,
    dimensionLabel: `${formatLength(piece.width, unitSystem)} × ${formatLength(piece.height, unitSystem)}`,
  }));
  const pieceSummary = pieceGroups.map(
    (piece) =>
      `${piece.label} (${piece.pieceGroupId}): ${piece.quantity} pieces at ${piece.dimensionLabel} cut size.`,
  );
  const placementsByY = new Map<number, Placement[]>();
  for (const placement of result.placements) {
    const rowPlacements = placementsByY.get(placement.y) ?? [];
    rowPlacements.push(placement);
    placementsByY.set(placement.y, rowPlacements);
  }
  const rows: DiagramTextRow[] = result.rows.map((row, rowIndex) => {
    const rowPlacements = placementsByY.get(row.y) ?? [];
    const runs = buildTextRuns(rowPlacements, labels).map((run) =>
      projectTextRun(run, unitSystem),
    );
    const contents = runs.map(describeRun).join('; ');
    const unusedWidth = fabric.usableWidth - row.usedWidth;
    const unusedWidthLabel =
      unusedWidth > 0 ? formatLength(unusedWidth, unitSystem) : undefined;
    const unused =
      unusedWidthLabel !== undefined
        ? ` Unused width at row end: ${unusedWidthLabel}.`
        : '';
    const startLabel = formatLength(row.y, unitSystem);
    const heightLabel = formatLength(row.height, unitSystem);

    return {
      rowIndex,
      startLabel,
      heightLabel,
      runs,
      unusedWidthLabel,
      text: `Strip ${rowIndex + 1}: starts ${startLabel} down the fabric, height ${heightLabel}; ${contents}.${unused}`,
    };
  });
  const text = [
    title,
    summary,
    ...pieceSummary,
    ...rows.map((row) => row.text),
  ].join('\n');

  return { title, summary, pieceSummary, pieceGroups, rows, text };
}

export function createCuttingDiagram(
  fabric: FabricSpec,
  result: FabricOptimizationSuccess,
  options: CuttingDiagramOptions = {},
): CuttingDiagramModel {
  const width = options.width ?? DEFAULT_WIDTH;
  const padding = options.padding ?? DEFAULT_PADDING;
  const unitSystem = options.unitSystem ?? 'imperial';

  if (
    width <= 2 * padding ||
    result.usedLength <= 0 ||
    fabric.usableWidth <= 0
  ) {
    throw new RangeError(
      'Diagram dimensions must produce a positive drawing area.',
    );
  }
  if (
    result.placements.some(
      (placement) =>
        placement.x < 0 ||
        placement.y < 0 ||
        placement.x + placement.width > fabric.usableWidth ||
        placement.y + placement.height > result.usedLength,
    )
  ) {
    throw new RangeError(
      'Optimizer placements must fit the supplied fabric and used length.',
    );
  }
  const scale = (width - 2 * padding) / fabric.usableWidth;
  const pieces = buildPieces(result, padding, scale, unitSystem);

  return {
    idPrefix: safeIdPrefix(options.idPrefix ?? `cutting-diagram-${fabric.id}`),
    width,
    height: result.usedLength * scale + 2 * padding,
    padding,
    scale,
    sourceUsableWidth: fabric.usableWidth,
    sourceUsedLength: result.usedLength,
    usableWidthLabel: formatLength(fabric.usableWidth, unitSystem),
    usedLengthLabel: formatLength(result.usedLength, unitSystem),
    directional: fabric.directional,
    pieces,
    wasteRegions: buildWasteRegions(result, fabric.usableWidth, padding, scale),
    stripBoundaries: result.rows.slice(1).map((row: OptimizerRow) => ({
      sourceY: row.y,
      y: padding + row.y * scale,
    })),
    textAlternative: buildTextAlternative(fabric, result, unitSystem),
  };
}
