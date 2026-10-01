import { toMillimetres } from '../units';
import {
  validatePositiveInteger,
  validatePositiveNumber,
  type ValidationError,
} from '../validation';
import type { CalculatorExplanation, CalculatorFailure } from './types';

export type FlyingGeeseMethod = 'one-at-a-time' | 'four-at-a-time';
export type FlyingGeeseSizingMode = 'standard' | 'trim-friendly';

export interface FlyingGeeseCalculatorInput {
  finishedWidth: number;
  finishedHeight: number;
  quantity: number;
  method: FlyingGeeseMethod;
  sizingMode: FlyingGeeseSizingMode;
}

export interface FlyingGeeseCutSize {
  bodyWidth: number;
  bodyHeight: number;
  backgroundSquare: number;
}

export interface FlyingGeeseCalculatorSuccess {
  ok: true;
  method: FlyingGeeseMethod;
  sizingMode: FlyingGeeseSizingMode;
  finishedWidth: number;
  finishedHeight: number;
  unfinishedWidth: number;
  unfinishedHeight: number;
  standard: FlyingGeeseCutSize;
  trimFriendly: FlyingGeeseCutSize;
  selected: FlyingGeeseCutSize;
  yieldPerBatch: 1 | 4;
  batches: number;
  produced: number;
  excess: number;
  bodyPieceCount: number;
  backgroundSquareCount: number;
  warnings: [];
  explanation: CalculatorExplanation;
}

export type FlyingGeeseCalculatorResult =
  FlyingGeeseCalculatorSuccess | CalculatorFailure;

const HALF_INCH = toMillimetres(0.5, 'inch');
const THREE_QUARTER_INCH = toMillimetres(0.75, 'inch');
const SEVEN_EIGHTHS_INCH = toMillimetres(0.875, 'inch');
const ONE_AND_ONE_EIGHTH_INCH = toMillimetres(1.125, 'inch');
const ONE_AND_ONE_QUARTER_INCH = toMillimetres(1.25, 'inch');
const ONE_AND_ONE_HALF_INCH = toMillimetres(1.5, 'inch');
const RATIO_TOLERANCE = 1e-9;

function ratioError(input: FlyingGeeseCalculatorInput): ValidationError[] {
  if (
    Number.isFinite(input.finishedWidth) &&
    Number.isFinite(input.finishedHeight) &&
    input.finishedWidth > 0 &&
    input.finishedHeight > 0 &&
    Math.abs(input.finishedWidth - 2 * input.finishedHeight) >
      RATIO_TOLERANCE *
        Math.max(1, input.finishedWidth, 2 * input.finishedHeight)
  ) {
    return [
      {
        code: 'invalid-flying-geese-ratio',
        field: 'finishedWidth',
        message:
          'Flying Geese in this calculator require a 2:1 finished width-to-height ratio.',
      },
    ];
  }
  return [];
}

export function calculateFlyingGeese(
  input: FlyingGeeseCalculatorInput,
): FlyingGeeseCalculatorResult {
  const errors = [
    ...validatePositiveNumber(input.finishedWidth, 'finishedWidth'),
    ...validatePositiveNumber(input.finishedHeight, 'finishedHeight'),
    ...validatePositiveInteger(input.quantity, 'quantity'),
    ...ratioError(input),
  ];
  if (errors.length > 0) return { ok: false, errors, warnings: [] };

  const unfinishedWidth = input.finishedWidth + HALF_INCH;
  const unfinishedHeight = input.finishedHeight + HALF_INCH;
  let standard: FlyingGeeseCutSize;
  let trimFriendly: FlyingGeeseCutSize;
  let yieldPerBatch: 1 | 4;
  let backgroundSquaresPerBatch: number;
  if (input.method === 'one-at-a-time') {
    yieldPerBatch = 1;
    backgroundSquaresPerBatch = 2;
    standard = {
      bodyWidth: input.finishedWidth + HALF_INCH,
      bodyHeight: input.finishedHeight + HALF_INCH,
      backgroundSquare: input.finishedHeight + HALF_INCH,
    };
    trimFriendly = {
      bodyWidth: input.finishedWidth + THREE_QUARTER_INCH,
      bodyHeight: input.finishedHeight + THREE_QUARTER_INCH,
      backgroundSquare: input.finishedHeight + THREE_QUARTER_INCH,
    };
  } else {
    yieldPerBatch = 4;
    backgroundSquaresPerBatch = 4;
    standard = {
      bodyWidth: input.finishedWidth + ONE_AND_ONE_QUARTER_INCH,
      bodyHeight: input.finishedWidth + ONE_AND_ONE_QUARTER_INCH,
      backgroundSquare: input.finishedHeight + SEVEN_EIGHTHS_INCH,
    };
    trimFriendly = {
      bodyWidth: input.finishedWidth + ONE_AND_ONE_HALF_INCH,
      bodyHeight: input.finishedWidth + ONE_AND_ONE_HALF_INCH,
      backgroundSquare: input.finishedHeight + ONE_AND_ONE_EIGHTH_INCH,
    };
  }
  const batches = Math.ceil(input.quantity / yieldPerBatch);
  const produced = batches * yieldPerBatch;
  const selected =
    input.sizingMode === 'trim-friendly' ? trimFriendly : standard;
  return {
    ok: true,
    method: input.method,
    sizingMode: input.sizingMode,
    finishedWidth: input.finishedWidth,
    finishedHeight: input.finishedHeight,
    unfinishedWidth,
    unfinishedHeight,
    standard,
    trimFriendly,
    selected,
    yieldPerBatch,
    batches,
    produced,
    excess: produced - input.quantity,
    bodyPieceCount: batches,
    backgroundSquareCount: batches * backgroundSquaresPerBatch,
    warnings: [],
    explanation: {
      assumptions: [
        'This calculator models conventional Flying Geese with a 2:1 finished width-to-height ratio.',
        input.method === 'one-at-a-time'
          ? 'Each body rectangle uses two background squares and produces one unit.'
          : 'Each body square uses four background squares and produces four units.',
      ],
      steps: [
        {
          key: 'unfinishedWidth',
          formula: 'finishedWidth + 1/2 inch',
          value: unfinishedWidth,
        },
        {
          key: 'unfinishedHeight',
          formula: 'finishedHeight + 1/2 inch',
          value: unfinishedHeight,
        },
        {
          key: 'batches',
          formula: 'ceil(quantity ÷ yieldPerBatch)',
          value: batches,
        },
        {
          key: 'produced',
          formula: 'batches × yieldPerBatch',
          value: produced,
        },
      ],
    },
  };
}
