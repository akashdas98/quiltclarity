import { normalizePieceGroup } from '../normalization';
import { calculatePurchaseRequirement } from '../purchase';
import type { FabricSpec, NormalizedPieceGroup, PieceGroup } from '../types';
import {
  type ValidationError,
  validateFabricSpec,
  validatePieceFitsFabric,
  validatePieceGroup,
  validateSeamAllowance,
} from '../validation';

export type YardageWarningCode =
  'zero-safety-allowance' | 'directional-fabric-increases-length';

export interface YardageWarning {
  code: YardageWarningCode;
  message: string;
}

export interface RepeatedRectangleExplanation {
  usableWidth: number;
  cutWidth: number;
  cutHeight: number;
  quantity: number;
  rotated: boolean;
  piecesPerRow: number;
  rowsRequired: number;
  unusedSlotsInFinalRow: number;
  rawLength: number;
  safetyPercent: number;
  bufferedLength: number;
  purchaseIncrement: number;
  recommendedLength: number;
}

export interface RepeatedRectangleYardageSuccess {
  ok: true;
  normalizedPiece: NormalizedPieceGroup;
  explanation: RepeatedRectangleExplanation;
  warnings: YardageWarning[];
}

export interface RepeatedRectangleYardageFailure {
  ok: false;
  errors: ValidationError[];
  warnings: [];
}

export type RepeatedRectangleYardageResult =
  RepeatedRectangleYardageSuccess | RepeatedRectangleYardageFailure;

interface RowCandidate {
  rotated: boolean;
  acrossWidth: number;
  rowLength: number;
  piecesPerRow: number;
  rowsRequired: number;
  unusedSlotsInFinalRow: number;
  rawLength: number;
}

function buildCandidate(
  piece: NormalizedPieceGroup,
  usableWidth: number,
  rotated: boolean,
): RowCandidate | undefined {
  const acrossWidth = rotated ? piece.height : piece.width;
  const rowLength = rotated ? piece.width : piece.height;
  const piecesPerRow = Math.floor(usableWidth / acrossWidth);

  if (piecesPerRow < 1) {
    return undefined;
  }

  const rowsRequired = Math.ceil(piece.quantity / piecesPerRow);

  return {
    rotated,
    acrossWidth,
    rowLength,
    piecesPerRow,
    rowsRequired,
    unusedSlotsInFinalRow: rowsRequired * piecesPerRow - piece.quantity,
    rawLength: rowsRequired * rowLength,
  };
}

function compareCandidates(left: RowCandidate, right: RowCandidate): number {
  if (left.rawLength !== right.rawLength) {
    return left.rawLength - right.rawLength;
  }

  if (left.rotated !== right.rotated) {
    return left.rotated ? 1 : -1;
  }

  return 0;
}

function buildWarnings(
  fabric: FabricSpec,
  sourcePiece: PieceGroup,
  piece: NormalizedPieceGroup,
  selectedCandidate: RowCandidate,
): YardageWarning[] {
  const warnings: YardageWarning[] = [];

  if (fabric.safetyAllowancePercent === 0) {
    warnings.push({
      code: 'zero-safety-allowance',
      message:
        'No safety allowance has been added to the calculated plan length.',
    });
  }

  if (
    fabric.directional &&
    sourcePiece.rotationAllowed === undefined &&
    (piece.orientationConstraint ?? 'none') === 'none' &&
    !piece.rotationAllowed
  ) {
    const rotatedCandidate = buildCandidate(piece, fabric.usableWidth, true);

    if (
      rotatedCandidate !== undefined &&
      rotatedCandidate.rawLength < selectedCandidate.rawLength
    ) {
      warnings.push({
        code: 'directional-fabric-increases-length',
        message:
          'Directional fabric disables a rotation that would use less fabric.',
      });
    }
  }

  return warnings;
}

export function calculateRepeatedRectangleYardage(
  fabric: FabricSpec,
  piece: PieceGroup,
  seamAllowance: number,
): RepeatedRectangleYardageResult {
  const errors = [
    ...validateFabricSpec(fabric),
    ...validatePieceGroup(piece),
    ...validateSeamAllowance(seamAllowance),
  ];

  if (errors.length > 0) {
    return { ok: false, errors, warnings: [] };
  }

  const normalizedPiece = normalizePieceGroup(fabric, piece, seamAllowance);
  const fitErrors = validatePieceFitsFabric(
    normalizedPiece,
    fabric.usableWidth,
  );

  if (fitErrors.length > 0) {
    return { ok: false, errors: fitErrors, warnings: [] };
  }

  const orientation = normalizedPiece.orientationConstraint ?? 'none';
  const candidates = [
    orientation !== 'lengthwise'
      ? buildCandidate(normalizedPiece, fabric.usableWidth, false)
      : undefined,
    normalizedPiece.rotationAllowed && orientation !== 'crosswise'
      ? buildCandidate(normalizedPiece, fabric.usableWidth, true)
      : undefined,
  ].filter((candidate): candidate is RowCandidate => candidate !== undefined);

  const selectedCandidate = candidates.sort(compareCandidates)[0]!;

  const purchase = calculatePurchaseRequirement(
    selectedCandidate.rawLength,
    fabric.safetyAllowancePercent,
    fabric.purchaseIncrement,
  );

  return {
    ok: true,
    normalizedPiece,
    explanation: {
      usableWidth: fabric.usableWidth,
      cutWidth: normalizedPiece.width,
      cutHeight: normalizedPiece.height,
      quantity: normalizedPiece.quantity,
      rotated: selectedCandidate.rotated,
      piecesPerRow: selectedCandidate.piecesPerRow,
      rowsRequired: selectedCandidate.rowsRequired,
      unusedSlotsInFinalRow: selectedCandidate.unusedSlotsInFinalRow,
      rawLength: purchase.layoutLength,
      safetyPercent: purchase.safetyAllowancePercent,
      bufferedLength: purchase.bufferedLength,
      purchaseIncrement: purchase.purchaseIncrement,
      recommendedLength: purchase.recommendedLength,
    },
    warnings: buildWarnings(fabric, piece, normalizedPiece, selectedCandidate),
  };
}
