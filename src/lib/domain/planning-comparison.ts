import { optimizeFabric } from './optimizer';
import type { FabricOptimizationSuccess, OptimizerOptions } from './optimizer';
import type { FabricSpec, NormalizedPieceGroup } from './types';

export type PlanningComparisonOutcome =
  | 'combined_shorter'
  | 'same_length'
  | 'recommended_longer_for_practicality'
  | 'not_applicable';

export interface ApplicablePlanningComparison {
  recommendedPlanLength: number;
  separateGroupBaselineLength: number;
  lengthDifference: number;
  differencePercent: number;
  comparisonOutcome: Exclude<PlanningComparisonOutcome, 'not_applicable'>;
}

export interface NotApplicablePlanningComparison {
  recommendedPlanLength: number;
  separateGroupBaselineLength: null;
  lengthDifference: null;
  differencePercent: null;
  comparisonOutcome: 'not_applicable';
}

export type PlanningComparison =
  ApplicablePlanningComparison | NotApplicablePlanningComparison;

const LENGTH_TOLERANCE = 1e-9;

/**
 * Compares the selected joint plan with the same normalized piece groups
 * optimized independently. Only raw layout lengths participate: safety and
 * purchase rounding remain outside this diagnostic calculation.
 */
export function compareJointPlanningToSeparateGroups(
  fabric: FabricSpec,
  pieces: readonly NormalizedPieceGroup[],
  recommended: FabricOptimizationSuccess,
  optimizerOptions: OptimizerOptions = {},
): PlanningComparison {
  if (pieces.length < 2) {
    return {
      recommendedPlanLength: recommended.usedLength,
      separateGroupBaselineLength: null,
      lengthDifference: null,
      differencePercent: null,
      comparisonOutcome: 'not_applicable',
    };
  }

  let separateGroupBaselineLength = 0;
  for (const piece of pieces) {
    const separate = optimizeFabric(fabric, [piece], optimizerOptions);
    if (!separate.ok) {
      return {
        recommendedPlanLength: recommended.usedLength,
        separateGroupBaselineLength: null,
        lengthDifference: null,
        differencePercent: null,
        comparisonOutcome: 'not_applicable',
      };
    }
    separateGroupBaselineLength += separate.usedLength;
  }

  const arithmeticDifference =
    separateGroupBaselineLength - recommended.usedLength;
  const lengthDifference =
    Math.abs(arithmeticDifference) <= LENGTH_TOLERANCE
      ? 0
      : arithmeticDifference;
  const comparisonOutcome =
    lengthDifference > 0
      ? 'combined_shorter'
      : lengthDifference < 0
        ? 'recommended_longer_for_practicality'
        : 'same_length';

  return {
    recommendedPlanLength: recommended.usedLength,
    separateGroupBaselineLength,
    lengthDifference,
    differencePercent:
      separateGroupBaselineLength === 0
        ? 0
        : (lengthDifference / separateGroupBaselineLength) * 100,
    comparisonOutcome,
  };
}
