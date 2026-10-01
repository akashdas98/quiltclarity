import type { NormalizedPieceGroup } from '../types';
import type { ValidationError } from '../validation';

export type OptimizerStrategy =
  | 'constrained-first'
  | 'area-descending'
  | 'width-descending'
  | 'height-descending'
  | 'quantity-descending'
  | 'strip-friendly-first';

export interface Placement {
  pieceGroupId: string;
  instanceIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
}

export interface OptimizerRow {
  y: number;
  height: number;
  usedWidth: number;
  placementCount: number;
}

export interface OptimizerScoreWeights {
  usedLength: number;
  waste: number;
  cutComplexity: number;
  fragmentation: number;
}

export interface OptimizerLimits {
  fullStrategyPlacementLimit: number;
  maximumPlacementCount: number;
}

export interface OptimizerOptions {
  scoreWeights?: Partial<OptimizerScoreWeights>;
  limits?: Partial<OptimizerLimits>;
}

export type OptimizerWarningCode =
  'zero-safety-allowance' | 'performance-fallback';

export interface OptimizerWarning {
  code: OptimizerWarningCode;
  message: string;
}

export interface FabricOptimizationSuccess {
  ok: true;
  usedLength: number;
  bufferedLength: number;
  recommendedLength: number;
  wasteArea: number;
  candidateScore: number;
  cutComplexity: number;
  fragmentation: number;
  strategy: OptimizerStrategy;
  normalizedPieces: NormalizedPieceGroup[];
  placements: Placement[];
  rows: OptimizerRow[];
  warnings: OptimizerWarning[];
}

export interface FabricOptimizationFailure {
  ok: false;
  errors: ValidationError[];
  warnings: [];
}

export type FabricOptimizationResult =
  FabricOptimizationSuccess | FabricOptimizationFailure;

export interface PackedCandidate {
  strategy: OptimizerStrategy;
  strategyIndex: number;
  usedLength: number;
  wasteArea: number;
  cutComplexity: number;
  fragmentation: number;
  candidateScore: number;
  placements: Placement[];
  rows: OptimizerRow[];
}
