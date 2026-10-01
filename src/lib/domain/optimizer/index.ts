import { calculatePurchaseRequirement } from '../purchase';
import type { FabricSpec, NormalizedPieceGroup } from '../types';
import {
  type ValidationError,
  validateFabricSpec,
  validatePieceFitsFabric,
  validatePieceGroup,
} from '../validation';
import { packWithStrategy } from './packing';
import {
  comparePackedCandidates,
  DEFAULT_SCORE_WEIGHTS,
  scoreCandidate,
} from './score';
import { OPTIMIZER_STRATEGIES } from './strategies';
import type {
  FabricOptimizationResult,
  OptimizerLimits,
  OptimizerOptions,
  OptimizerScoreWeights,
  OptimizerWarning,
  PackedCandidate,
} from './types';

export * from './score';
export * from './strategies';
export * from './types';
export * from './finite-stock';

export const DEFAULT_OPTIMIZER_LIMITS: OptimizerLimits = {
  fullStrategyPlacementLimit: 400,
  maximumPlacementCount: 20_000,
};

function performanceLimitError(limit: number): ValidationError {
  return {
    code: 'performance-limit',
    field: 'pieces',
    message: `This fabric has more than ${limit} individual pieces. Reduce its quantities or split it into smaller project plans.`,
  };
}

function validateOptimizerPieces(
  pieces: readonly NormalizedPieceGroup[],
): ValidationError[] {
  if (pieces.length === 0) {
    return [
      {
        code: 'no-pieces',
        field: 'pieces',
        message:
          'Add at least one cut requirement before planning this fabric.',
      },
    ];
  }

  const seenIds = new Set<string>();
  const errors: ValidationError[] = [];
  for (const piece of pieces) {
    if (seenIds.has(piece.id)) {
      errors.push({
        code: 'duplicate-piece-id',
        field: 'id',
        pieceId: piece.id,
        message:
          'This fabric contains a duplicate cut requirement. Remove the duplicate row and try again.',
      });
    }
    seenIds.add(piece.id);
  }

  return errors;
}

function isValidCandidate(
  candidate: PackedCandidate,
  pieces: readonly NormalizedPieceGroup[],
  usableWidth: number,
): boolean {
  const groups = new Map(pieces.map((piece) => [piece.id, piece]));
  const counts = new Map(pieces.map((piece) => [piece.id, 0]));
  const instances = new Set<string>();
  const rowsByY = new Map(candidate.rows.map((row) => [row.y, row]));
  const placementsByY = new Map<number, typeof candidate.placements>();

  for (const placement of candidate.placements) {
    const piece = groups.get(placement.pieceGroupId);
    const row = rowsByY.get(placement.y);
    if (piece === undefined || row === undefined) {
      return false;
    }
    const orientation = piece.orientationConstraint ?? 'none';
    const dimensionsMatch = placement.rotated
      ? piece.rotationAllowed &&
        orientation !== 'crosswise' &&
        placement.width === piece.height &&
        placement.height === piece.width
      : orientation !== 'lengthwise' &&
        placement.width === piece.width &&
        placement.height === piece.height;
    if (
      !dimensionsMatch ||
      placement.x < 0 ||
      placement.y < 0 ||
      placement.x + placement.width > usableWidth ||
      placement.y + placement.height > candidate.usedLength ||
      placement.height > row.height
    ) {
      return false;
    }

    const instanceKey = `${placement.pieceGroupId}:${placement.instanceIndex}`;
    if (instances.has(instanceKey)) {
      return false;
    }
    instances.add(instanceKey);
    counts.set(piece.id, (counts.get(piece.id) ?? 0) + 1);
    const rowPlacements = placementsByY.get(placement.y) ?? [];
    rowPlacements.push(placement);
    placementsByY.set(placement.y, rowPlacements);
  }

  for (const piece of pieces) {
    if (counts.get(piece.id) !== piece.quantity) {
      return false;
    }
  }

  const orderedRows = [...candidate.rows].sort(
    (left, right) => left.y - right.y,
  );
  for (let index = 0; index < orderedRows.length; index += 1) {
    const row = orderedRows[index]!;
    const nextRow = orderedRows[index + 1];
    if (nextRow !== undefined && row.y + row.height > nextRow.y) {
      return false;
    }

    const rowPlacements = (placementsByY.get(row.y) ?? []).sort(
      (left, right) => left.x - right.x,
    );
    if (rowPlacements.length !== row.placementCount) {
      return false;
    }
    for (
      let placementIndex = 0;
      placementIndex < rowPlacements.length - 1;
      placementIndex += 1
    ) {
      const placement = rowPlacements[placementIndex]!;
      const nextPlacement = rowPlacements[placementIndex + 1]!;
      if (placement.x + placement.width > nextPlacement.x) {
        return false;
      }
    }
  }

  return true;
}

function mergeWeights(
  overrides: Partial<OptimizerScoreWeights> | undefined,
): OptimizerScoreWeights {
  return { ...DEFAULT_SCORE_WEIGHTS, ...overrides };
}

function mergeLimits(
  overrides: Partial<OptimizerLimits> | undefined,
): OptimizerLimits {
  return { ...DEFAULT_OPTIMIZER_LIMITS, ...overrides };
}

export function optimizeFabric(
  fabric: FabricSpec,
  pieces: readonly NormalizedPieceGroup[],
  options: OptimizerOptions = {},
): FabricOptimizationResult {
  const errors = [
    ...validateFabricSpec(fabric),
    ...validateOptimizerPieces(pieces),
    ...pieces.flatMap((piece) => validatePieceGroup(piece)),
  ];

  if (errors.length > 0) {
    return { ok: false, errors, warnings: [] };
  }

  const fitErrors = pieces.flatMap((piece) =>
    validatePieceFitsFabric(piece, fabric.usableWidth),
  );
  if (fitErrors.length > 0) {
    return { ok: false, errors: fitErrors, warnings: [] };
  }

  const totalPlacements = pieces.reduce(
    (total, piece) => total + piece.quantity,
    0,
  );
  const limits = mergeLimits(options.limits);
  if (totalPlacements > limits.maximumPlacementCount) {
    return {
      ok: false,
      errors: [performanceLimitError(limits.maximumPlacementCount)],
      warnings: [],
    };
  }

  const fallback = totalPlacements > limits.fullStrategyPlacementLimit;
  const strategies = fallback
    ? OPTIMIZER_STRATEGIES.filter(
        (strategy) => strategy === 'strip-friendly-first',
      )
    : OPTIMIZER_STRATEGIES;
  const weights = mergeWeights(options.scoreWeights);
  const candidates: PackedCandidate[] = [];

  for (const strategy of strategies) {
    const packed = packWithStrategy(pieces, fabric.usableWidth, strategy);
    if (packed === undefined) {
      continue;
    }

    const candidateWithoutScore = {
      ...packed,
      strategy,
      strategyIndex: OPTIMIZER_STRATEGIES.indexOf(strategy),
    };
    const candidate = {
      ...candidateWithoutScore,
      candidateScore: scoreCandidate(
        candidateWithoutScore,
        fabric.usableWidth,
        weights,
      ),
    };
    if (isValidCandidate(candidate, pieces, fabric.usableWidth)) {
      candidates.push(candidate);
    }
  }

  const selected = candidates.sort(comparePackedCandidates)[0];
  if (selected === undefined) {
    return {
      ok: false,
      errors: [
        {
          code: 'optimizer-no-valid-layout',
          field: 'pieces',
          message:
            'The planner could not create a valid layout for these cuts. Check the usable width and each piece’s rotation or orientation settings.',
        },
      ],
      warnings: [],
    };
  }

  const purchase = calculatePurchaseRequirement(
    selected.usedLength,
    fabric.safetyAllowancePercent,
    fabric.purchaseIncrement,
  );
  const warnings: OptimizerWarning[] = [];
  if (fabric.safetyAllowancePercent === 0) {
    warnings.push({
      code: 'zero-safety-allowance',
      message:
        'No safety allowance has been added to the calculated plan length.',
    });
  }
  if (fallback) {
    warnings.push({
      code: 'performance-fallback',
      message:
        'A bounded grouped strip strategy was used to keep this large layout responsive.',
    });
  }

  return {
    ok: true,
    usedLength: selected.usedLength,
    bufferedLength: purchase.bufferedLength,
    recommendedLength: purchase.recommendedLength,
    wasteArea: selected.wasteArea,
    candidateScore: selected.candidateScore,
    cutComplexity: selected.cutComplexity,
    fragmentation: selected.fragmentation,
    strategy: selected.strategy,
    normalizedPieces: [...pieces],
    placements: selected.placements,
    rows: selected.rows,
    warnings,
  };
}
