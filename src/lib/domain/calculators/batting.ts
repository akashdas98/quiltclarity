import {
  validateNonNegativeNumber,
  validatePositiveNumber,
} from '../validation';
import type {
  CalculatorExplanation,
  CalculatorFailure,
  CalculatorWarning,
} from './types';

export type BattingOrientation =
  'required-width-across-roll' | 'required-length-across-roll';

export interface BattingCalculatorInput {
  quiltWidth: number;
  quiltLength: number;
  overagePerSide: number;
  rollWidth?: number;
  rotationAllowed: boolean;
}

export interface BattingRollCandidate {
  orientation: BattingOrientation;
  acrossRoll: number;
  requiredLinearLength: number;
}

export interface BattingCalculatorSuccess {
  ok: true;
  requiredWidth: number;
  requiredLength: number;
  rollWidth: number | null;
  fitsSuppliedRoll: boolean | null;
  candidates: BattingRollCandidate[];
  lowestLinearLength: BattingRollCandidate | null;
  warnings: CalculatorWarning[];
  explanation: CalculatorExplanation;
}

export type BattingCalculatorResult =
  BattingCalculatorSuccess | CalculatorFailure;

export function calculateBatting(
  input: BattingCalculatorInput,
): BattingCalculatorResult {
  const errors = [
    ...validatePositiveNumber(input.quiltWidth, 'quiltWidth'),
    ...validatePositiveNumber(input.quiltLength, 'quiltLength'),
    ...validateNonNegativeNumber(input.overagePerSide, 'overagePerSide'),
    ...(input.rollWidth === undefined
      ? []
      : validatePositiveNumber(input.rollWidth, 'rollWidth')),
  ];
  if (errors.length > 0) return { ok: false, errors, warnings: [] };

  const requiredWidth = input.quiltWidth + 2 * input.overagePerSide;
  const requiredLength = input.quiltLength + 2 * input.overagePerSide;
  const candidates: BattingRollCandidate[] = [];
  if (input.rollWidth !== undefined) {
    if (requiredWidth <= input.rollWidth) {
      candidates.push({
        orientation: 'required-width-across-roll',
        acrossRoll: requiredWidth,
        requiredLinearLength: requiredLength,
      });
    }
    if (input.rotationAllowed && requiredLength <= input.rollWidth) {
      candidates.push({
        orientation: 'required-length-across-roll',
        acrossRoll: requiredLength,
        requiredLinearLength: requiredWidth,
      });
    }
  }
  const lowestLinearLength =
    [...candidates].sort(
      (left, right) =>
        left.requiredLinearLength - right.requiredLinearLength ||
        (left.orientation === 'required-width-across-roll' ? -1 : 1),
    )[0] ?? null;
  const warnings: CalculatorWarning[] = [
    {
      code: 'confirm-batting-overage',
      message:
        'Batting overage needs vary by quilting method and provider; confirm the requirement for your project.',
    },
  ];
  if (input.rollWidth !== undefined && candidates.length === 0) {
    warnings.push({
      code: 'batting-width-too-narrow',
      message:
        'Choose a wider batting width or precut, or piece batting separately; piecing is not calculated here.',
    });
  }

  return {
    ok: true,
    requiredWidth,
    requiredLength,
    rollWidth: input.rollWidth ?? null,
    fitsSuppliedRoll:
      input.rollWidth === undefined ? null : candidates.length > 0,
    candidates,
    lowestLinearLength,
    warnings,
    explanation: {
      assumptions: [
        'The entered overage is applied independently to all four sides.',
        'This calculator does not calculate pieced batting.',
      ],
      steps: [
        {
          key: 'requiredWidth',
          formula: 'quiltWidth + 2 × overagePerSide',
          value: requiredWidth,
        },
        {
          key: 'requiredLength',
          formula: 'quiltLength + 2 × overagePerSide',
          value: requiredLength,
        },
        ...(lowestLinearLength === null
          ? []
          : [
              {
                key: 'requiredLinearLength',
                formula: 'length along roll for selected valid orientation',
                value: lowestLinearLength.requiredLinearLength,
              },
            ]),
      ],
    },
  };
}
