import { calculatePurchaseRequirement } from '../purchase';
import {
  validateNonNegativeNumber,
  validatePositiveNumber,
} from '../validation';
import type {
  CalculatorExplanation,
  CalculatorFailure,
  CalculatorWarning,
} from './types';

export interface BindingCalculatorInput {
  quiltWidth: number;
  quiltLength: number;
  stripWidth: number;
  usableWidth: number;
  joiningAllowance: number;
  safetyAllowancePercent: number;
  purchaseIncrement: number;
}

export interface BindingCalculatorSuccess {
  ok: true;
  perimeter: number;
  requiredBindingLength: number;
  stripCount: number;
  rawFabricLength: number;
  bufferedLength: number;
  recommendedLength: number;
  warnings: CalculatorWarning[];
  explanation: CalculatorExplanation;
}

export type BindingCalculatorResult =
  BindingCalculatorSuccess | CalculatorFailure;

export function calculateBinding(
  input: BindingCalculatorInput,
): BindingCalculatorResult {
  const errors = [
    ...validatePositiveNumber(input.quiltWidth, 'quiltWidth'),
    ...validatePositiveNumber(input.quiltLength, 'quiltLength'),
    ...validatePositiveNumber(input.stripWidth, 'stripWidth'),
    ...validatePositiveNumber(input.usableWidth, 'usableWidth'),
    ...validateNonNegativeNumber(input.joiningAllowance, 'joiningAllowance'),
    ...validateNonNegativeNumber(
      input.safetyAllowancePercent,
      'safetyAllowancePercent',
    ),
    ...validatePositiveNumber(input.purchaseIncrement, 'purchaseIncrement'),
  ];
  if (errors.length > 0) return { ok: false, errors, warnings: [] };

  const perimeter = 2 * (input.quiltWidth + input.quiltLength);
  const requiredBindingLength = perimeter + input.joiningAllowance;
  const stripCount = Math.ceil(requiredBindingLength / input.usableWidth);
  const rawFabricLength = stripCount * input.stripWidth;
  const purchase = calculatePurchaseRequirement(
    rawFabricLength,
    input.safetyAllowancePercent,
    input.purchaseIncrement,
  );
  const warnings: CalculatorWarning[] = [];
  if (input.safetyAllowancePercent === 0) {
    warnings.push({
      code: 'zero-safety-allowance',
      message: 'No safety allowance has been added to the strip requirement.',
    });
  }
  return {
    ok: true,
    perimeter,
    requiredBindingLength,
    stripCount,
    rawFabricLength,
    bufferedLength: purchase.bufferedLength,
    recommendedLength: purchase.recommendedLength,
    warnings,
    explanation: {
      assumptions: [
        'Binding is straight-grain or cross-grain double-fold binding, not bias binding.',
      ],
      steps: [
        { key: 'perimeter', formula: '2 × (width + length)', value: perimeter },
        {
          key: 'requiredBindingLength',
          formula: 'perimeter + joiningAllowance',
          value: requiredBindingLength,
        },
        {
          key: 'stripCount',
          formula: 'ceil(requiredBindingLength ÷ usableWidth)',
          value: stripCount,
        },
        {
          key: 'rawFabricLength',
          formula: 'stripCount × stripWidth',
          value: rawFabricLength,
        },
      ],
    },
  };
}
