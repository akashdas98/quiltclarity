import { optimizeFabric } from './optimizer';
import type { FabricOptimizationSuccess, OptimizerOptions } from './optimizer';
import type { FabricSpec, NormalizedPieceGroup } from './types';
import { type ValidationError, validatePositiveNumber } from './validation';

export interface FreshFabricScenarioSuccess {
  ok: true;
  rawLength: number;
  bufferedLength: number;
  recommendedLength: number;
  optimization: FabricOptimizationSuccess;
}

export interface FreshFabricScenarioFailure {
  ok: false;
  errors: ValidationError[];
}

export type FreshFabricScenario =
  FreshFabricScenarioSuccess | FreshFabricScenarioFailure;

export type PatternComparisonOutcome =
  'pattern_more_than_plan' | 'same_amount' | 'pattern_less_than_plan';

export interface PatternComparisonWarning {
  code: 'pattern-wof-mismatch';
  message: string;
}

export interface PatternComparisonSuccess {
  ok: true;
  patternStatedAmount: number;
  patternAssumedUsableWidth: number | null;
  currentUsableWidth: number;
  freshPlanRawLength: number;
  freshPlanBufferedLength: number;
  freshPlanRecommendedLength: number;
  deltaFromRecommended: number;
  outcome: PatternComparisonOutcome;
  warnings: PatternComparisonWarning[];
  explanation: string;
}

export interface PatternComparisonFailure {
  ok: false;
  errors: ValidationError[];
}

export type PatternComparisonResult =
  PatternComparisonSuccess | PatternComparisonFailure;

const LENGTH_TOLERANCE = 1e-9;

/** Computes the all-new-fabric basis. Stock is intentionally not accepted. */
export function freshFabricScenario(
  fabric: FabricSpec,
  pieces: readonly NormalizedPieceGroup[],
  optimizerOptions: OptimizerOptions = {},
): FreshFabricScenario {
  const optimization = optimizeFabric(fabric, pieces, optimizerOptions);
  if (!optimization.ok) {
    return { ok: false, errors: optimization.errors };
  }
  return {
    ok: true,
    rawLength: optimization.usedLength,
    bufferedLength: optimization.bufferedLength,
    recommendedLength: optimization.recommendedLength,
    optimization,
  };
}

export function comparePatternToFreshFabric(
  patternStatedAmount: number,
  patternAssumedUsableWidth: number | undefined,
  currentUsableWidth: number,
  freshScenario: FreshFabricScenarioSuccess,
): PatternComparisonResult {
  const errors = [
    ...validatePositiveNumber(patternStatedAmount, 'patternStatedAmount'),
    ...validatePositiveNumber(currentUsableWidth, 'currentUsableWidth'),
    ...(patternAssumedUsableWidth === undefined
      ? []
      : validatePositiveNumber(
          patternAssumedUsableWidth,
          'patternAssumedUsableWidth',
        )),
  ];
  if (errors.length > 0) return { ok: false, errors };

  const arithmeticDelta = patternStatedAmount - freshScenario.recommendedLength;
  const deltaFromRecommended =
    Math.abs(arithmeticDelta) <= LENGTH_TOLERANCE ? 0 : arithmeticDelta;
  const outcome =
    deltaFromRecommended > 0
      ? 'pattern_more_than_plan'
      : deltaFromRecommended < 0
        ? 'pattern_less_than_plan'
        : 'same_amount';
  const warnings: PatternComparisonWarning[] = [];
  if (
    patternAssumedUsableWidth !== undefined &&
    Math.abs(patternAssumedUsableWidth - currentUsableWidth) > LENGTH_TOLERANCE
  ) {
    warnings.push({
      code: 'pattern-wof-mismatch',
      message:
        'The pattern and current plan use different usable fabric widths, so this comparison is not like-for-like.',
    });
  }

  return {
    ok: true,
    patternStatedAmount,
    patternAssumedUsableWidth: patternAssumedUsableWidth ?? null,
    currentUsableWidth,
    freshPlanRawLength: freshScenario.rawLength,
    freshPlanBufferedLength: freshScenario.bufferedLength,
    freshPlanRecommendedLength: freshScenario.recommendedLength,
    deltaFromRecommended,
    outcome,
    warnings,
    explanation:
      'This informational comparison uses the entered cuts and current assumptions. Differences do not by themselves indicate a pattern error.',
  };
}
