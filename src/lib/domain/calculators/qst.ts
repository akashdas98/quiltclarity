import { toMillimetres } from '../units';
import { validatePositiveInteger, validatePositiveNumber } from '../validation';
import type { CalculatorExplanation, CalculatorFailure } from './types';

export type QstSizingMode = 'standard' | 'trim-friendly';

export interface QstCalculatorInput {
  finishedSize: number;
  quantity: number;
  sizingMode: QstSizingMode;
}

export interface QstCalculatorSuccess {
  ok: true;
  sizingMode: QstSizingMode;
  finishedSize: number;
  unfinishedSize: number;
  standardStartingSquare: number;
  trimFriendlyStartingSquare: number;
  selectedStartingSquare: number;
  yieldPerBatch: 4;
  batches: number;
  produced: number;
  excess: number;
  startingSquaresPerFabric: number;
  totalStartingSquares: number;
  warnings: [];
  explanation: CalculatorExplanation;
}

export type QstCalculatorResult = QstCalculatorSuccess | CalculatorFailure;

const HALF_INCH = toMillimetres(0.5, 'inch');
const STANDARD_ADDITION = toMillimetres(1.25, 'inch');
const TRIM_FRIENDLY_ADDITION = toMillimetres(1.5, 'inch');

export function calculateQst(input: QstCalculatorInput): QstCalculatorResult {
  const errors = [
    ...validatePositiveNumber(input.finishedSize, 'finishedSize'),
    ...validatePositiveInteger(input.quantity, 'quantity'),
  ];
  if (errors.length > 0) return { ok: false, errors, warnings: [] };

  const unfinishedSize = input.finishedSize + HALF_INCH;
  const standardStartingSquare = input.finishedSize + STANDARD_ADDITION;
  const trimFriendlyStartingSquare =
    input.finishedSize + TRIM_FRIENDLY_ADDITION;
  const batches = Math.ceil(input.quantity / 4);
  const produced = batches * 4;
  const startingSquaresPerFabric = batches * 2;
  return {
    ok: true,
    sizingMode: input.sizingMode,
    finishedSize: input.finishedSize,
    unfinishedSize,
    standardStartingSquare,
    trimFriendlyStartingSquare,
    selectedStartingSquare:
      input.sizingMode === 'trim-friendly'
        ? trimFriendlyStartingSquare
        : standardStartingSquare,
    yieldPerBatch: 4,
    batches,
    produced,
    excess: produced - input.quantity,
    startingSquaresPerFabric,
    totalStartingSquares: startingSquaresPerFabric * 2,
    warnings: [],
    explanation: {
      assumptions: [
        'This models the classic two-color QST/hourglass batch method.',
        'Each batch uses two starting squares from each of two fabrics and produces four QSTs.',
      ],
      steps: [
        {
          key: 'unfinishedSize',
          formula: 'finishedSize + 1/2 inch',
          value: unfinishedSize,
        },
        {
          key: 'selectedStartingSquare',
          formula:
            input.sizingMode === 'trim-friendly'
              ? 'finishedSize + 1 1/2 inches'
              : 'finishedSize + 1 1/4 inches',
          value:
            input.sizingMode === 'trim-friendly'
              ? trimFriendlyStartingSquare
              : standardStartingSquare,
        },
        {
          key: 'batches',
          formula: 'ceil(quantity ÷ 4)',
          value: batches,
        },
        {
          key: 'produced',
          formula: 'batches × 4',
          value: produced,
        },
      ],
    },
  };
}
