import {
  validateNonNegativeNumber,
  validatePositiveNumber,
} from '../validation';
import type { CalculatorExplanation, CalculatorFailure } from './types';

export interface BlockCountCalculatorInput {
  targetWidth: number;
  targetLength: number;
  finishedBlockWidth: number;
  finishedBlockHeight: number;
  finishedSashingWidth?: number;
}

export interface BlockCountCalculatorSuccess {
  ok: true;
  blocksAcross: number;
  blocksDown: number;
  totalBlocks: number;
  actualWidth: number;
  actualLength: number;
  widthDifference: number;
  lengthDifference: number;
  warnings: [];
  explanation: CalculatorExplanation;
}

export type BlockCountCalculatorResult =
  BlockCountCalculatorSuccess | CalculatorFailure;

export function calculateBlockCount(
  input: BlockCountCalculatorInput,
): BlockCountCalculatorResult {
  const sashing = input.finishedSashingWidth ?? 0;
  const errors = [
    ...validatePositiveNumber(input.targetWidth, 'targetWidth'),
    ...validatePositiveNumber(input.targetLength, 'targetLength'),
    ...validatePositiveNumber(input.finishedBlockWidth, 'finishedBlockWidth'),
    ...validatePositiveNumber(input.finishedBlockHeight, 'finishedBlockHeight'),
    ...validateNonNegativeNumber(sashing, 'finishedSashingWidth'),
  ];
  if (errors.length > 0) return { ok: false, errors, warnings: [] };

  const blocksAcross = Math.ceil(
    (input.targetWidth + sashing) / (input.finishedBlockWidth + sashing),
  );
  const blocksDown = Math.ceil(
    (input.targetLength + sashing) / (input.finishedBlockHeight + sashing),
  );
  const actualWidth =
    blocksAcross * input.finishedBlockWidth + (blocksAcross - 1) * sashing;
  const actualLength =
    blocksDown * input.finishedBlockHeight + (blocksDown - 1) * sashing;

  return {
    ok: true,
    blocksAcross,
    blocksDown,
    totalBlocks: blocksAcross * blocksDown,
    actualWidth,
    actualLength,
    widthDifference: actualWidth - input.targetWidth,
    lengthDifference: actualLength - input.targetLength,
    warnings: [],
    explanation: {
      assumptions: [
        'Only whole blocks are counted; partial blocks are never created.',
      ],
      steps: [
        {
          key: 'blocksAcross',
          formula: 'ceil((targetWidth + sashing) ÷ (blockWidth + sashing))',
          value: blocksAcross,
        },
        {
          key: 'blocksDown',
          formula: 'ceil((targetLength + sashing) ÷ (blockHeight + sashing))',
          value: blocksDown,
        },
        {
          key: 'totalBlocks',
          formula: 'blocksAcross × blocksDown',
          value: blocksAcross * blocksDown,
        },
      ],
    },
  };
}
