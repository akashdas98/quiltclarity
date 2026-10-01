import { normalizePieceGroups } from '../normalization';
import { allocateFiniteStock } from '../optimizer';
import type { FiniteStockPlacement, LeftoverRectangle } from '../optimizer';
import type { StockPiece } from '../project-model';
import type {
  DimensionMode,
  FabricSpec,
  NormalizedPieceGroup,
  OrientationConstraint,
  PieceGroup,
} from '../types';
import {
  validateNonNegativeNumber,
  validatePositiveInteger,
  validatePositiveNumber,
} from '../validation';
import type {
  CalculatorExplanation,
  CalculatorFailure,
  CalculatorWarning,
} from './types';

export interface PiecesFromFabricCalculatorInput {
  stockWidth: number;
  stockLength: number;
  pieceWidth: number;
  pieceHeight: number;
  quantity?: number;
  dimensionMode: DimensionMode;
  seamAllowance: number;
  directional: boolean;
  rotationAllowed?: boolean;
  orientationConstraint?: OrientationConstraint;
}

export interface PiecesFromFabricCalculatorSuccess {
  ok: true;
  cutPieceWidth: number;
  cutPieceHeight: number;
  maximumPracticalYield: number;
  requestedQuantity: number | null;
  requestedFits: boolean | null;
  placedQuantity: number;
  placements: FiniteStockPlacement[];
  leftovers: LeftoverRectangle[];
  usedArea: number;
  unusedArea: number;
  normalizedPiece: NormalizedPieceGroup;
  warnings: CalculatorWarning[];
  explanation: CalculatorExplanation;
}

export type PiecesFromFabricCalculatorResult =
  PiecesFromFabricCalculatorSuccess | CalculatorFailure;

const FABRIC_ID = 'pieces-from-fabric';
const STOCK_ID = 'stock';
const PIECE_ID = 'piece';
const YIELD_TOLERANCE = 1e-9;

function floorWithTolerance(value: number): number {
  const nearest = Math.round(value);
  return Math.abs(value - nearest) <=
    YIELD_TOLERANCE * Math.max(1, Math.abs(value))
    ? nearest
    : Math.floor(value);
}

function createFabric(input: PiecesFromFabricCalculatorInput): FabricSpec {
  return {
    id: FABRIC_ID,
    name: 'Entered stock',
    fabricWidth: input.stockWidth,
    usableWidth: input.stockWidth,
    directional: input.directional,
    defaultRotationAllowed: !input.directional,
    safetyAllowancePercent: 0,
    purchaseIncrement: 1,
  };
}

function createStock(input: PiecesFromFabricCalculatorInput): StockPiece {
  return {
    id: STOCK_ID,
    fabricId: FABRIC_ID,
    label: 'Entered stock',
    width: input.stockWidth,
    length: input.stockLength,
    quantity: 1,
    sourceType: 'custom',
  };
}

function createPiece(
  input: PiecesFromFabricCalculatorInput,
  quantity: number,
): PieceGroup {
  return {
    id: PIECE_ID,
    label: 'Repeated piece',
    quantity,
    width: input.pieceWidth,
    height: input.pieceHeight,
    dimensionMode: input.dimensionMode,
    rotationAllowed: input.rotationAllowed,
    orientationConstraint: input.orientationConstraint ?? 'none',
  };
}

export function calculatePiecesFromFabric(
  input: PiecesFromFabricCalculatorInput,
): PiecesFromFabricCalculatorResult {
  const errors = [
    ...validatePositiveNumber(input.stockWidth, 'stockWidth'),
    ...validatePositiveNumber(input.stockLength, 'stockLength'),
    ...validatePositiveNumber(input.pieceWidth, 'pieceWidth'),
    ...validatePositiveNumber(input.pieceHeight, 'pieceHeight'),
    ...validateNonNegativeNumber(input.seamAllowance, 'seamAllowance'),
    ...(input.quantity === undefined
      ? []
      : validatePositiveInteger(input.quantity, 'quantity')),
  ];
  if (errors.length > 0) return { ok: false, errors, warnings: [] };

  const fabric = createFabric(input);
  const stock = createStock(input);
  const onePiece = normalizePieceGroups(
    fabric,
    [createPiece(input, 1)],
    input.seamAllowance,
  )[0]!;
  const areaUpperBound = floorWithTolerance(
    (input.stockWidth * input.stockLength) / (onePiece.width * onePiece.height),
  );
  const maximumSearchQuantity = Math.max(1, areaUpperBound);
  const maximumResult = allocateFiniteStock(
    fabric,
    [stock],
    [{ ...onePiece, quantity: maximumSearchQuantity }],
  );
  if (!maximumResult.ok) return maximumResult;
  const maximumPracticalYield = maximumResult.placements.length;

  let layout = maximumResult;
  if (
    input.quantity !== undefined &&
    input.quantity <= maximumPracticalYield &&
    input.quantity !== maximumSearchQuantity
  ) {
    const requestedLayout = allocateFiniteStock(
      fabric,
      [stock],
      [{ ...onePiece, quantity: input.quantity }],
    );
    if (!requestedLayout.ok) return requestedLayout;
    layout = requestedLayout;
  }
  const warnings: CalculatorWarning[] = [
    {
      code: 'practical-heuristic',
      message:
        'This is a practical deterministic rectangular layout, not a mathematically proven global optimum.',
    },
    ...layout.warnings
      .filter((warning) => warning.code === 'performance-fallback')
      .map((warning) => ({
        code: 'performance-fallback' as const,
        message: warning.message,
      })),
  ];
  const bin = layout.bins[0]!;
  return {
    ok: true,
    cutPieceWidth: onePiece.width,
    cutPieceHeight: onePiece.height,
    maximumPracticalYield,
    requestedQuantity: input.quantity ?? null,
    requestedFits:
      input.quantity === undefined
        ? null
        : input.quantity <= maximumPracticalYield,
    placedQuantity: layout.placements.length,
    placements: layout.placements,
    leftovers: bin.leftovers,
    usedArea: bin.usedArea,
    unusedArea: bin.unusedArea,
    normalizedPiece: {
      ...onePiece,
      quantity: input.quantity ?? maximumPracticalYield,
    },
    warnings,
    explanation: {
      assumptions: [
        'Stock width is the crosswise axis and stock length is the lengthwise axis.',
        input.dimensionMode === 'finished'
          ? 'Finished dimensions include two entered seam allowances before packing.'
          : 'Entered piece dimensions are treated as cut sizes.',
        'Returned leftover rectangles are practical regions and are not claimed to form one contiguous remnant.',
      ],
      steps: [
        {
          key: 'cutPieceWidth',
          formula:
            input.dimensionMode === 'finished'
              ? 'finishedWidth + 2 × seamAllowance'
              : 'entered cut width',
          value: onePiece.width,
        },
        {
          key: 'cutPieceHeight',
          formula:
            input.dimensionMode === 'finished'
              ? 'finishedHeight + 2 × seamAllowance'
              : 'entered cut height',
          value: onePiece.height,
        },
        {
          key: 'maximumPracticalYield',
          formula: 'placements in selected bounded finite-stock layout',
          value: maximumPracticalYield,
        },
      ],
    },
  };
}
