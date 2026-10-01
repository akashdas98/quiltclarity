import { calculatePurchaseRequirement } from '../purchase';
import {
  validateNonNegativeNumber,
  validatePositiveInteger,
  validatePositiveNumber,
} from '../validation';
import {
  calculateJoinedWofCapacity,
  validateJoinedWofCapacityInput,
} from './joined-wof';
import type {
  CalculatorExplanation,
  CalculatorFailure,
  CalculatorWarning,
} from './types';

export interface SashingCalculatorInput {
  columns: number;
  rows: number;
  finishedBlockWidth: number;
  finishedBlockHeight: number;
  finishedSashingWidth: number;
  seamAllowance: number;
  usableWidth: number;
  handlingBuffer: number;
  joinSeamAllowance: number;
  safetyAllowancePercent: number;
  purchaseIncrement: number;
}

export interface SashingCalculatorSuccess {
  ok: true;
  cutSashingWidth: number;
  blockCutWidth: number;
  blockCutHeight: number;
  verticalPieceCount: number;
  verticalPieceWidth: number;
  verticalPieceLength: number;
  finishedRowWidth: number;
  horizontalStripCutLength: number;
  horizontalStripCount: number;
  verticalDemand: number;
  horizontalDemand: number;
  requiredJoinedLength: number;
  effectiveJoinedLength: number;
  joinLoss: number;
  stripCount: number;
  rawFabricLength: number;
  bufferedLength: number;
  recommendedLength: number;
  finishedQuiltWidth: number;
  finishedQuiltLength: number;
  horizontalStripsRequirePiecing: boolean;
  warnings: CalculatorWarning[];
  explanation: CalculatorExplanation;
}

export type SashingCalculatorResult =
  SashingCalculatorSuccess | CalculatorFailure;

export function calculateSashing(
  input: SashingCalculatorInput,
): SashingCalculatorResult {
  const errors = [
    ...validatePositiveInteger(input.columns, 'columns'),
    ...validatePositiveInteger(input.rows, 'rows'),
    ...validatePositiveNumber(input.finishedBlockWidth, 'finishedBlockWidth'),
    ...validatePositiveNumber(input.finishedBlockHeight, 'finishedBlockHeight'),
    ...validatePositiveNumber(
      input.finishedSashingWidth,
      'finishedSashingWidth',
    ),
    ...validateNonNegativeNumber(input.seamAllowance, 'seamAllowance'),
    ...validateJoinedWofCapacityInput({
      usableWidth: input.usableWidth,
      requiredLinearLength: 0,
      handlingBuffer: input.handlingBuffer,
      joinSeamAllowance: input.joinSeamAllowance,
    }),
    ...validateNonNegativeNumber(
      input.safetyAllowancePercent,
      'safetyAllowancePercent',
    ),
    ...validatePositiveNumber(input.purchaseIncrement, 'purchaseIncrement'),
  ];
  if (errors.length > 0) return { ok: false, errors, warnings: [] };

  const cutSashingWidth = input.finishedSashingWidth + 2 * input.seamAllowance;
  const blockCutWidth = input.finishedBlockWidth + 2 * input.seamAllowance;
  const blockCutHeight = input.finishedBlockHeight + 2 * input.seamAllowance;
  const verticalPieceCount = input.rows * (input.columns - 1);
  const finishedRowWidth =
    input.columns * input.finishedBlockWidth +
    (input.columns - 1) * input.finishedSashingWidth;
  const horizontalStripCutLength = finishedRowWidth + 2 * input.seamAllowance;
  const horizontalStripCount = input.rows - 1;
  const verticalDemand = verticalPieceCount * blockCutHeight;
  const horizontalDemand = horizontalStripCount * horizontalStripCutLength;
  const joinedCapacity = calculateJoinedWofCapacity({
    usableWidth: input.usableWidth,
    requiredLinearLength: verticalDemand + horizontalDemand,
    handlingBuffer: input.handlingBuffer,
    joinSeamAllowance: input.joinSeamAllowance,
  });
  const rawFabricLength = joinedCapacity.stripCount * cutSashingWidth;
  const purchase = calculatePurchaseRequirement(
    rawFabricLength,
    input.safetyAllowancePercent,
    input.purchaseIncrement,
  );
  const horizontalStripsRequirePiecing =
    horizontalStripCount > 0 && horizontalStripCutLength > input.usableWidth;
  const warnings: CalculatorWarning[] = [];
  if (horizontalStripsRequirePiecing) {
    warnings.push({
      code: 'horizontal-sashing-requires-piecing',
      message:
        'Each horizontal sashing row must be pieced because its cut length exceeds usable WOF.',
    });
  }
  if (input.safetyAllowancePercent === 0) {
    warnings.push({
      code: 'zero-safety-allowance',
      message: 'No safety allowance has been added to the sashing requirement.',
    });
  }

  return {
    ok: true,
    cutSashingWidth,
    blockCutWidth,
    blockCutHeight,
    verticalPieceCount,
    verticalPieceWidth: cutSashingWidth,
    verticalPieceLength: blockCutHeight,
    finishedRowWidth,
    horizontalStripCutLength,
    horizontalStripCount,
    verticalDemand,
    horizontalDemand,
    requiredJoinedLength: joinedCapacity.requiredJoinedLength,
    effectiveJoinedLength: joinedCapacity.effectiveJoinedLength,
    joinLoss: joinedCapacity.joinLoss,
    stripCount: joinedCapacity.stripCount,
    rawFabricLength,
    bufferedLength: purchase.bufferedLength,
    recommendedLength: purchase.recommendedLength,
    finishedQuiltWidth: finishedRowWidth,
    finishedQuiltLength:
      input.rows * input.finishedBlockHeight +
      (input.rows - 1) * input.finishedSashingWidth,
    horizontalStripsRequirePiecing,
    warnings,
    explanation: {
      assumptions: [
        'Row-wise sashing · No cornerstones · No outer sashing.',
        'Yardage includes the fabric consumed by joins between WOF strips.',
      ],
      steps: [
        {
          key: 'cutSashingWidth',
          formula: 'finishedSashingWidth + 2 × seamAllowance',
          value: cutSashingWidth,
        },
        {
          key: 'verticalDemand',
          formula: 'verticalPieceCount × blockCutHeight',
          value: verticalDemand,
        },
        {
          key: 'horizontalDemand',
          formula: 'horizontalStripCount × horizontalStripCutLength',
          value: horizontalDemand,
        },
        {
          key: 'requiredJoinedLength',
          formula: 'verticalDemand + horizontalDemand + handlingBuffer',
          value: joinedCapacity.requiredJoinedLength,
        },
        {
          key: 'stripCount',
          formula:
            'smallest n where n × usableWidth - (n - 1) × 2 × joinSeamAllowance >= requiredJoinedLength',
          value: joinedCapacity.stripCount,
        },
      ],
    },
  };
}
