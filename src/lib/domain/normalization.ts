import type { FabricSpec, NormalizedPieceGroup, PieceGroup } from './types';

export function resolveRotationAllowed(
  fabric: FabricSpec,
  piece: PieceGroup,
): boolean {
  if (
    piece.isWofStrip === true ||
    piece.orientationConstraint === 'crosswise'
  ) {
    return false;
  }

  return piece.rotationAllowed ?? fabric.defaultRotationAllowed;
}

export function normalizePieceGroup(
  fabric: FabricSpec,
  piece: PieceGroup,
  seamAllowance: number,
): NormalizedPieceGroup {
  const seamAddition =
    piece.dimensionMode === 'finished' ? 2 * seamAllowance : 0;
  const cutWidth = piece.width + seamAddition;
  const cutHeight = piece.height + seamAddition;

  return {
    ...piece,
    width: piece.isWofStrip === true ? fabric.usableWidth : cutWidth,
    height: cutHeight,
    dimensionMode: 'cut',
    sourceDimensionMode: piece.dimensionMode,
    rotationAllowed: resolveRotationAllowed(fabric, piece),
    orientationConstraint: piece.orientationConstraint ?? 'none',
    isWofStrip: piece.isWofStrip ?? false,
  };
}

export function normalizePieceGroups(
  fabric: FabricSpec,
  pieces: readonly PieceGroup[],
  seamAllowance: number,
): NormalizedPieceGroup[] {
  return pieces.map((piece) =>
    normalizePieceGroup(fabric, piece, seamAllowance),
  );
}
