import {
  allocateFiniteStock,
  generateFiniteStockCandidates,
  optimizeFabric,
} from './optimizer';
import type {
  FiniteStockBinResult,
  FiniteStockCandidate,
  FiniteStockLimits,
  FiniteStockPlacement,
  FiniteStockStrategy,
  FiniteStockWarning,
  OptimizerOptions,
  OptimizerRow,
  OptimizerStrategy,
  OptimizerWarning,
  Placement,
  UnallocatedPieceInstance,
} from './optimizer';
import type { StockPiece } from './project-model';
import type { FabricSpec, NormalizedPieceGroup } from './types';
import type { ValidationError } from './validation';

export interface PurchasedBoltBin {
  id: string;
  fabricId: string;
  width: number;
  layoutLength: number;
}

export interface PurchasedBoltPlacement extends Placement {
  materialBinId: string;
  fabricId: string;
}

export interface PurchasedBoltResult {
  bin: PurchasedBoltBin;
  placements: PurchasedBoltPlacement[];
  rows: OptimizerRow[];
  rawLength: number;
  wasteArea: number;
  cutComplexity: number;
  fragmentation: number;
  strategy: OptimizerStrategy;
  warnings: OptimizerWarning[];
}

export type ReconciliationWarning = FiniteStockWarning | OptimizerWarning;

export interface ReconciliationCandidate {
  stock: FiniteStockCandidate;
  purchasedBolt: PurchasedBoltResult | null;
  rawAdditionalPurchase: number;
  bufferedPurchase: number;
  recommendedPurchase: number;
  purchaseCutComplexity: number;
  purchaseWasteArea: number;
}

export interface FabricReconciliationSuccess {
  ok: true;
  fabricId: string;
  purchaseEnabled: boolean;
  fullyAllocated: boolean;
  stockBins: FiniteStockBinResult[];
  stockPlacements: FiniteStockPlacement[];
  purchasedBolt: PurchasedBoltResult | null;
  placements: Array<FiniteStockPlacement | PurchasedBoltPlacement>;
  unallocated: UnallocatedPieceInstance[];
  stockUsedArea: number;
  unusedStockArea: number;
  rawAdditionalPurchase: number | null;
  bufferedPurchase: number | null;
  recommendedPurchase: number | null;
  selectedStockStrategy: FiniteStockStrategy;
  evaluatedCandidateCount: number;
  warnings: ReconciliationWarning[];
}

export interface FabricReconciliationFailure {
  ok: false;
  errors: ValidationError[];
  warnings: [];
}

export type FabricReconciliationResult =
  FabricReconciliationSuccess | FabricReconciliationFailure;

export interface ReconcileFabricOptions {
  purchaseEnabled?: boolean;
  optimizerOptions?: OptimizerOptions;
  finiteStockLimits?: Partial<FiniteStockLimits>;
}

function validationErrors<T extends object>(
  generated: readonly (T | ValidationError)[],
): generated is readonly ValidationError[] {
  return generated.length > 0 && 'code' in generated[0]!;
}

function groupUnallocatedPieces(
  pieces: readonly NormalizedPieceGroup[],
  unallocated: readonly UnallocatedPieceInstance[],
): {
  groups: NormalizedPieceGroup[];
  originalIndexes: Map<string, number[]>;
} {
  const indexes = new Map<string, number[]>();
  for (const instance of unallocated) {
    const values = indexes.get(instance.pieceGroupId) ?? [];
    values.push(instance.instanceIndex);
    indexes.set(instance.pieceGroupId, values);
  }
  for (const values of indexes.values())
    values.sort((left, right) => left - right);
  return {
    groups: pieces
      .filter((piece) => indexes.has(piece.id))
      .map((piece) => ({ ...piece, quantity: indexes.get(piece.id)!.length })),
    originalIndexes: indexes,
  };
}

function createPurchasedBolt(
  fabric: FabricSpec,
  pieces: readonly NormalizedPieceGroup[],
  unallocated: readonly UnallocatedPieceInstance[],
  optimizerOptions: OptimizerOptions,
): {
  result: PurchasedBoltResult;
  buffered: number;
  recommended: number;
} | null {
  const grouped = groupUnallocatedPieces(pieces, unallocated);
  const optimization = optimizeFabric(fabric, grouped.groups, optimizerOptions);
  if (!optimization.ok) return null;

  const materialBinId = `purchase:${fabric.id}`;
  const placements: PurchasedBoltPlacement[] = optimization.placements.map(
    (placement) => ({
      ...placement,
      instanceIndex:
        grouped.originalIndexes.get(placement.pieceGroupId)?.[
          placement.instanceIndex
        ] ?? placement.instanceIndex,
      materialBinId,
      fabricId: fabric.id,
    }),
  );
  return {
    result: {
      bin: {
        id: materialBinId,
        fabricId: fabric.id,
        width: fabric.usableWidth,
        layoutLength: optimization.usedLength,
      },
      placements,
      rows: optimization.rows,
      rawLength: optimization.usedLength,
      wasteArea: optimization.wasteArea,
      cutComplexity: optimization.cutComplexity,
      fragmentation: optimization.fragmentation,
      strategy: optimization.strategy,
      warnings: optimization.warnings,
    },
    buffered: optimization.bufferedLength,
    recommended: optimization.recommendedLength,
  };
}

function validCompleteAccounting(
  candidate: ReconciliationCandidate,
  pieces: readonly NormalizedPieceGroup[],
): boolean {
  const expected = new Set(
    pieces.flatMap((piece) =>
      Array.from(
        { length: piece.quantity },
        (_, instanceIndex) => `${piece.id}:${instanceIndex}`,
      ),
    ),
  );
  const placements = [
    ...candidate.stock.placements,
    ...(candidate.purchasedBolt?.placements ?? []),
  ];
  const actual = placements.map(
    (placement) => `${placement.pieceGroupId}:${placement.instanceIndex}`,
  );
  return (
    actual.length === expected.size &&
    new Set(actual).size === expected.size &&
    actual.every((key) => expected.has(key))
  );
}

function compareReconciliationCandidates(
  left: ReconciliationCandidate,
  right: ReconciliationCandidate,
): number {
  if (left.rawAdditionalPurchase !== right.rawAdditionalPurchase) {
    return left.rawAdditionalPurchase - right.rawAdditionalPurchase;
  }
  if (left.purchaseCutComplexity !== right.purchaseCutComplexity) {
    return left.purchaseCutComplexity - right.purchaseCutComplexity;
  }
  if (left.stock.fragmentation !== right.stock.fragmentation) {
    return left.stock.fragmentation - right.stock.fragmentation;
  }
  if (left.stock.largestLeftoverArea !== right.stock.largestLeftoverArea) {
    return right.stock.largestLeftoverArea - left.stock.largestLeftoverArea;
  }
  if (left.purchaseWasteArea !== right.purchaseWasteArea) {
    return left.purchaseWasteArea - right.purchaseWasteArea;
  }
  return left.stock.strategyIndex - right.stock.strategyIndex;
}

export function generateReconciliationCandidates(
  fabric: FabricSpec,
  stockPieces: readonly StockPiece[],
  pieces: readonly NormalizedPieceGroup[],
  options: ReconcileFabricOptions = {},
): ReconciliationCandidate[] | ValidationError[] {
  const generated = generateFiniteStockCandidates(fabric, stockPieces, pieces, {
    limits: options.finiteStockLimits,
  });
  if (validationErrors(generated)) return [...generated];

  const candidates: ReconciliationCandidate[] = [];
  for (const stock of generated) {
    if (stock.unallocated.length === 0) {
      candidates.push({
        stock,
        purchasedBolt: null,
        rawAdditionalPurchase: 0,
        bufferedPurchase: 0,
        recommendedPurchase: 0,
        purchaseCutComplexity: 0,
        purchaseWasteArea: 0,
      });
      continue;
    }
    const purchase = createPurchasedBolt(
      fabric,
      pieces,
      stock.unallocated,
      options.optimizerOptions ?? {},
    );
    if (purchase === null) continue;
    const candidate: ReconciliationCandidate = {
      stock,
      purchasedBolt: purchase.result,
      rawAdditionalPurchase: purchase.result.rawLength,
      bufferedPurchase: purchase.buffered,
      recommendedPurchase: purchase.recommended,
      purchaseCutComplexity: purchase.result.cutComplexity,
      purchaseWasteArea: purchase.result.wasteArea,
    };
    if (validCompleteAccounting(candidate, pieces)) candidates.push(candidate);
  }
  return candidates.length > 0
    ? candidates
    : [
        {
          code: 'optimizer-no-valid-layout',
          field: 'pieces',
          message:
            'The planner could not account for every piece using the entered stock and purchasable fabric. Check dimensions, usable width, and rotation or orientation settings.',
        },
      ];
}

export function reconcileFabric(
  fabric: FabricSpec,
  stockPieces: readonly StockPiece[],
  pieces: readonly NormalizedPieceGroup[],
  options: ReconcileFabricOptions = {},
): FabricReconciliationResult {
  const purchaseEnabled = options.purchaseEnabled ?? true;
  if (!purchaseEnabled) {
    const stockOnly = allocateFiniteStock(fabric, stockPieces, pieces, {
      limits: options.finiteStockLimits,
    });
    if (!stockOnly.ok) return stockOnly;
    return {
      ok: true,
      fabricId: fabric.id,
      purchaseEnabled: false,
      fullyAllocated: stockOnly.fullyAllocated,
      stockBins: stockOnly.bins,
      stockPlacements: stockOnly.placements,
      purchasedBolt: null,
      placements: stockOnly.placements,
      unallocated: stockOnly.unallocated,
      stockUsedArea: stockOnly.usedStockArea,
      unusedStockArea: stockOnly.unusedStockArea,
      rawAdditionalPurchase: stockOnly.rawAdditionalPurchase,
      bufferedPurchase: stockOnly.bufferedPurchase,
      recommendedPurchase: stockOnly.recommendedPurchase,
      selectedStockStrategy: stockOnly.strategy,
      evaluatedCandidateCount: 0,
      warnings: stockOnly.warnings,
    };
  }

  const generated = generateReconciliationCandidates(
    fabric,
    stockPieces,
    pieces,
    options,
  );
  if (validationErrors(generated)) {
    return { ok: false, errors: [...generated], warnings: [] };
  }
  const selected = [...generated].sort(compareReconciliationCandidates)[0]!;
  const warnings: ReconciliationWarning[] = [
    ...(selected.purchasedBolt?.warnings ?? []),
  ];
  const placementCount = pieces.reduce(
    (total, piece) => total + piece.quantity,
    0,
  );
  const fullStrategyLimit =
    options.finiteStockLimits?.fullStrategyPlacementLimit ?? 400;
  if (
    placementCount > fullStrategyLimit &&
    !warnings.some((warning) => warning.code === 'performance-fallback')
  ) {
    warnings.push({
      code: 'performance-fallback',
      message:
        'A bounded strip-friendly strategy set was used to keep this large stock reconciliation responsive.',
    });
  }
  if (
    selected.rawAdditionalPurchase === 0 &&
    fabric.safetyAllowancePercent > 0
  ) {
    warnings.push({
      code: 'stock-safety-not-applied',
      message:
        'Existing stock covers every piece. Safety allowance applies only to new purchases, so no purchase is recommended.',
    });
  }

  return {
    ok: true,
    fabricId: fabric.id,
    purchaseEnabled: true,
    fullyAllocated: true,
    stockBins: selected.stock.bins,
    stockPlacements: selected.stock.placements,
    purchasedBolt: selected.purchasedBolt,
    placements: [
      ...selected.stock.placements,
      ...(selected.purchasedBolt?.placements ?? []),
    ],
    unallocated: [],
    stockUsedArea: selected.stock.allocatedArea,
    unusedStockArea: selected.stock.unusedStockArea,
    rawAdditionalPurchase: selected.rawAdditionalPurchase,
    bufferedPurchase: selected.bufferedPurchase,
    recommendedPurchase: selected.recommendedPurchase,
    selectedStockStrategy: selected.stock.strategy,
    evaluatedCandidateCount: generated.length,
    warnings,
  };
}
