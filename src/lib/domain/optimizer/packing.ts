import type { NormalizedPieceGroup } from '../types';
import { orderPieceGroups } from './strategies';
import type { OptimizerRow, OptimizerStrategy, Placement } from './types';

interface Orientation {
  width: number;
  height: number;
  rotated: boolean;
}

interface RowPlan {
  placements: Placement[];
  height: number;
  usedWidth: number;
}

export interface PackingResult {
  placements: Placement[];
  rows: OptimizerRow[];
  usedLength: number;
  wasteArea: number;
  cutComplexity: number;
  fragmentation: number;
}

function orientations(
  piece: NormalizedPieceGroup,
  usableWidth: number,
): Orientation[] {
  const result: Orientation[] = [];
  const orientation = piece.orientationConstraint ?? 'none';

  if (orientation !== 'lengthwise' && piece.width <= usableWidth) {
    result.push({ width: piece.width, height: piece.height, rotated: false });
  }
  if (
    piece.rotationAllowed &&
    orientation !== 'crosswise' &&
    piece.height <= usableWidth &&
    (piece.width !== piece.height || orientation === 'lengthwise')
  ) {
    result.push({ width: piece.height, height: piece.width, rotated: true });
  }

  return result;
}

function compareRowPlans(left: RowPlan, right: RowPlan): number {
  if (left.usedWidth !== right.usedWidth) {
    return right.usedWidth - left.usedWidth;
  }
  if (left.height !== right.height) {
    return left.height - right.height;
  }

  const leftRotations = left.placements.filter(
    (placement) => placement.rotated,
  ).length;
  const rightRotations = right.placements.filter(
    (placement) => placement.rotated,
  ).length;
  return leftRotations - rightRotations;
}

function buildRowPlan(
  orderedPieces: readonly NormalizedPieceGroup[],
  remaining: ReadonlyMap<string, number>,
  nextIndexes: ReadonlyMap<string, number>,
  usableWidth: number,
  anchor: NormalizedPieceGroup,
  anchorOrientation: Orientation,
): RowPlan {
  const localRemaining = new Map(remaining);
  const localIndexes = new Map(nextIndexes);
  const placements: Placement[] = [];
  let usedWidth = 0;

  const place = (
    piece: NormalizedPieceGroup,
    orientation: Orientation,
  ): void => {
    const instanceIndex = localIndexes.get(piece.id) ?? 0;
    placements.push({
      pieceGroupId: piece.id,
      instanceIndex,
      x: usedWidth,
      y: 0,
      width: orientation.width,
      height: orientation.height,
      rotated: orientation.rotated,
    });
    usedWidth += orientation.width;
    localRemaining.set(piece.id, (localRemaining.get(piece.id) ?? 0) - 1);
    localIndexes.set(piece.id, instanceIndex + 1);
  };

  place(anchor, anchorOrientation);

  while (true) {
    const availableWidth = usableWidth - usedWidth;
    let selected:
      { piece: NormalizedPieceGroup; orientation: Orientation } | undefined;

    const fillOrder = [
      ...orderedPieces.filter((piece) => piece.id !== anchor.id),
      anchor,
    ];
    for (const piece of fillOrder) {
      if ((localRemaining.get(piece.id) ?? 0) <= 0) {
        continue;
      }

      const legal = orientations(piece, usableWidth)
        .filter(
          (orientation) =>
            orientation.width <= availableWidth &&
            orientation.height <= anchorOrientation.height,
        )
        .sort((left, right) => {
          if (left.width !== right.width) {
            return right.width - left.width;
          }
          return Number(left.rotated) - Number(right.rotated);
        });

      if (legal[0] !== undefined) {
        selected = { piece, orientation: legal[0] };
        break;
      }
    }

    if (selected === undefined) {
      break;
    }
    place(selected.piece, selected.orientation);
  }

  return { placements, height: anchorOrientation.height, usedWidth };
}

export function packWithStrategy(
  pieces: readonly NormalizedPieceGroup[],
  usableWidth: number,
  strategy: OptimizerStrategy,
): PackingResult | undefined {
  const orderedPieces = orderPieceGroups(pieces, strategy);
  const remaining = new Map(pieces.map((piece) => [piece.id, piece.quantity]));
  const nextIndexes = new Map(pieces.map((piece) => [piece.id, 0]));
  const placements: Placement[] = [];
  const rows: OptimizerRow[] = [];
  let y = 0;

  while ([...remaining.values()].some((quantity) => quantity > 0)) {
    const anchor = orderedPieces.find(
      (piece) => (remaining.get(piece.id) ?? 0) > 0,
    );
    if (anchor === undefined) {
      return undefined;
    }

    const rowPlan = orientations(anchor, usableWidth)
      .map((orientation) =>
        buildRowPlan(
          orderedPieces,
          remaining,
          nextIndexes,
          usableWidth,
          anchor,
          orientation,
        ),
      )
      .sort(compareRowPlans)[0];

    if (rowPlan === undefined || rowPlan.placements.length === 0) {
      return undefined;
    }

    for (const placement of rowPlan.placements) {
      placement.y = y;
      placements.push(placement);
      remaining.set(
        placement.pieceGroupId,
        (remaining.get(placement.pieceGroupId) ?? 0) - 1,
      );
      nextIndexes.set(
        placement.pieceGroupId,
        (nextIndexes.get(placement.pieceGroupId) ?? 0) + 1,
      );
    }

    rows.push({
      y,
      height: rowPlan.height,
      usedWidth: rowPlan.usedWidth,
      placementCount: rowPlan.placements.length,
    });
    y += rowPlan.height;
  }

  const pieceArea = placements.reduce(
    (total, placement) => total + placement.width * placement.height,
    0,
  );
  const partialRows = rows.filter((row) => row.usedWidth < usableWidth).length;
  const uniqueStripWidths = new Set(rows.map((row) => row.height)).size;
  const rotations = placements.filter((placement) => placement.rotated).length;

  return {
    placements,
    rows,
    usedLength: y,
    wasteArea: usableWidth * y - pieceArea,
    cutComplexity: uniqueStripWidths + partialRows + rotations,
    fragmentation: partialRows,
  };
}
