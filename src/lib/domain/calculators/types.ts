import type { ValidationError } from '../validation';

export interface CalculationStep {
  key: string;
  formula: string;
  value: number;
}

export interface CalculatorExplanation {
  assumptions: string[];
  steps: CalculationStep[];
}

export type CalculatorWarningCode =
  | 'zero-safety-allowance'
  | 'confirm-longarmer-requirements'
  | 'directional-horizontal-disabled'
  | 'bias-outer-edges'
  | 'measure-quilt-centre'
  | 'horizontal-sashing-requires-piecing'
  | 'confirm-batting-overage'
  | 'batting-width-too-narrow'
  | 'performance-fallback'
  | 'practical-heuristic';

export interface CalculatorWarning {
  code: CalculatorWarningCode;
  message: string;
}

export interface CalculatorFailure {
  ok: false;
  errors: ValidationError[];
  warnings: [];
}
