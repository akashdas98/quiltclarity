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

export type BackingSeamDirection = 'vertical' | 'horizontal';

export interface BackingCalculatorInput {
  quiltWidth: number;
  quiltLength: number;
  overagePerSide: number;
  usableBackingWidth: number;
  panelSeamAllowance: number;
  directional: boolean;
  safetyAllowancePercent: number;
  purchaseIncrement: number;
}

export interface BackingCandidate {
  seamDirection: BackingSeamDirection;
  panelCount: number;
  panelRunLength: number;
  coverage: number;
  rawLength: number;
  bufferedLength: number;
  recommendedLength: number;
}

export interface BackingCalculatorSuccess {
  ok: true;
  requiredWidth: number;
  requiredLength: number;
  candidates: BackingCandidate[];
  lowestYardage: BackingCandidate;
  warnings: CalculatorWarning[];
  explanation: CalculatorExplanation;
}

export type BackingCalculatorResult =
  BackingCalculatorSuccess | CalculatorFailure;

function createCandidate(
  seamDirection: BackingSeamDirection,
  coverageRequired: number,
  panelRunLength: number,
  input: BackingCalculatorInput,
): BackingCandidate {
  const joinConsumption = 2 * input.panelSeamAllowance;
  const panelCount = Math.max(
    1,
    Math.ceil(
      (coverageRequired - joinConsumption) /
        (input.usableBackingWidth - joinConsumption),
    ),
  );
  const coverage =
    panelCount * input.usableBackingWidth - (panelCount - 1) * joinConsumption;
  const rawLength = panelCount * panelRunLength;
  const purchase = calculatePurchaseRequirement(
    rawLength,
    input.safetyAllowancePercent,
    input.purchaseIncrement,
  );
  return {
    seamDirection,
    panelCount,
    panelRunLength,
    coverage,
    rawLength,
    bufferedLength: purchase.bufferedLength,
    recommendedLength: purchase.recommendedLength,
  };
}

export function calculateBacking(
  input: BackingCalculatorInput,
): BackingCalculatorResult {
  const errors = [
    ...validatePositiveNumber(input.quiltWidth, 'quiltWidth'),
    ...validatePositiveNumber(input.quiltLength, 'quiltLength'),
    ...validateNonNegativeNumber(input.overagePerSide, 'overagePerSide'),
    ...validatePositiveNumber(input.usableBackingWidth, 'usableBackingWidth'),
    ...validateNonNegativeNumber(
      input.panelSeamAllowance,
      'panelSeamAllowance',
    ),
    ...validateNonNegativeNumber(
      input.safetyAllowancePercent,
      'safetyAllowancePercent',
    ),
    ...validatePositiveNumber(input.purchaseIncrement, 'purchaseIncrement'),
  ];
  if (
    Number.isFinite(input.usableBackingWidth) &&
    Number.isFinite(input.panelSeamAllowance) &&
    input.usableBackingWidth <= 2 * input.panelSeamAllowance
  ) {
    errors.push({
      code: 'not-positive',
      field: 'usableBackingWidth',
      message:
        'Usable backing width must be greater than the fabric consumed by a panel join. Increase usable width or reduce the panel seam allowance.',
    });
  }
  if (errors.length > 0) return { ok: false, errors, warnings: [] };

  const requiredWidth = input.quiltWidth + 2 * input.overagePerSide;
  const requiredLength = input.quiltLength + 2 * input.overagePerSide;
  const candidates = [
    createCandidate('vertical', requiredWidth, requiredLength, input),
  ];
  if (!input.directional) {
    candidates.push(
      createCandidate('horizontal', requiredLength, requiredWidth, input),
    );
  }
  const lowestYardage = [...candidates].sort(
    (left, right) =>
      left.recommendedLength - right.recommendedLength ||
      left.rawLength - right.rawLength ||
      (left.seamDirection === 'vertical' ? -1 : 1),
  )[0]!;
  const warnings: CalculatorWarning[] = [
    {
      code: 'confirm-longarmer-requirements',
      message:
        'Seam orientation can also depend on print direction and your quilting setup. If using a professional longarmer, confirm their preferences.',
    },
  ];
  if (input.directional) {
    warnings.push({
      code: 'directional-horizontal-disabled',
      message:
        'The horizontal-seam candidate is disabled to preserve fabric direction.',
    });
  }
  if (input.safetyAllowancePercent === 0) {
    warnings.push({
      code: 'zero-safety-allowance',
      message: 'No safety allowance has been added to the backing requirement.',
    });
  }

  return {
    ok: true,
    requiredWidth,
    requiredLength,
    candidates,
    lowestYardage,
    warnings,
    explanation: {
      assumptions: [
        'Backing dimensions include the selected overage on every side.',
        'Each panel join consumes two seam allowances of coverage.',
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
        {
          key: 'lowestYardageLength',
          formula: 'roundUp(buffered candidate length, purchaseIncrement)',
          value: lowestYardage.recommendedLength,
        },
      ],
    },
  };
}
