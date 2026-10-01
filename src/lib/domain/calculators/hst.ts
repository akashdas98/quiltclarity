import { toMillimetres } from '../units';
import {
  validateNonNegativeNumber,
  validatePositiveInteger,
  validatePositiveNumber,
} from '../validation';
import type {
  CalculatorExplanation,
  CalculatorFailure,
  CalculatorWarning,
} from './types';

export type HstMethod = 'two-at-a-time' | 'four-at-a-time' | 'eight-at-a-time';
export type HstSizingMode = 'standard' | 'trim-friendly';

export interface HstCalculatorInput {
  finishedSize: number;
  quantity: number;
  method: HstMethod;
  sizingMode: HstSizingMode;
  seamAllowance: number;
}

export interface HstCalculatorSuccess {
  ok: true;
  method: HstMethod;
  sizingMode: HstSizingMode;
  finishedSize: number;
  unfinishedSize: number;
  geometricStartingSquare: number;
  standardStartingSquare: number;
  trimFriendlyStartingSquare: number;
  selectedStartingSquare: number;
  yieldPerBatch: number;
  batches: number;
  produced: number;
  excess: number;
  startingSquaresPerFabric: number;
  totalStartingSquares: number;
  warnings: CalculatorWarning[];
  explanation: CalculatorExplanation;
}

export type HstCalculatorResult = HstCalculatorSuccess | CalculatorFailure;

const HALF_INCH = toMillimetres(0.5, 'inch');
const SEVEN_EIGHTHS_INCH = toMillimetres(0.875, 'inch');
const ONE_INCH = toMillimetres(1, 'inch');
const QUARTER_INCH = toMillimetres(0.25, 'inch');

function ceilToQuarterInch(value: number): number {
  const quotient = value / QUARTER_INCH;
  const nearestInteger = Math.round(quotient);
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(quotient)) * 4;
  return (
    (Math.abs(quotient - nearestInteger) <= tolerance
      ? nearestInteger
      : Math.ceil(quotient)) * QUARTER_INCH
  );
}

export function calculateHst(input: HstCalculatorInput): HstCalculatorResult {
  const errors = [
    ...validatePositiveNumber(input.finishedSize, 'finishedSize'),
    ...validatePositiveInteger(input.quantity, 'quantity'),
    ...validateNonNegativeNumber(input.seamAllowance, 'seamAllowance'),
  ];
  if (errors.length > 0) return { ok: false, errors, warnings: [] };

  const unfinishedSize = input.finishedSize + HALF_INCH;
  let yieldPerBatch: number;
  let geometricStartingSquare: number;
  let standardStartingSquare: number;
  let trimFriendlyStartingSquare: number;
  let formula: string;
  const warnings: CalculatorWarning[] = [];

  switch (input.method) {
    case 'two-at-a-time':
      yieldPerBatch = 2;
      geometricStartingSquare = input.finishedSize + SEVEN_EIGHTHS_INCH;
      standardStartingSquare = geometricStartingSquare;
      trimFriendlyStartingSquare = input.finishedSize + ONE_INCH;
      formula = 'finishedSize + 7/8 inch';
      break;
    case 'four-at-a-time':
      yieldPerBatch = 4;
      geometricStartingSquare =
        unfinishedSize * Math.SQRT2 + 2 * input.seamAllowance;
      standardStartingSquare = ceilToQuarterInch(geometricStartingSquare);
      trimFriendlyStartingSquare = standardStartingSquare + QUARTER_INCH;
      formula =
        'ceilToQuarterInch(unfinishedSize × sqrt(2) + 2 × seamAllowance)';
      warnings.push({
        code: 'bias-outer-edges',
        message: 'Four-at-a-time HSTs have bias outer edges; handle carefully.',
      });
      break;
    case 'eight-at-a-time':
      yieldPerBatch = 8;
      geometricStartingSquare = 2 * (input.finishedSize + SEVEN_EIGHTHS_INCH);
      standardStartingSquare = geometricStartingSquare;
      trimFriendlyStartingSquare = 2 * (input.finishedSize + ONE_INCH);
      formula = '2 × (finishedSize + 7/8 inch)';
      break;
  }

  const batches = Math.ceil(input.quantity / yieldPerBatch);
  const produced = batches * yieldPerBatch;
  const selectedStartingSquare =
    input.sizingMode === 'trim-friendly'
      ? trimFriendlyStartingSquare
      : standardStartingSquare;

  return {
    ok: true,
    method: input.method,
    sizingMode: input.sizingMode,
    finishedSize: input.finishedSize,
    unfinishedSize,
    geometricStartingSquare,
    standardStartingSquare,
    trimFriendlyStartingSquare,
    selectedStartingSquare,
    yieldPerBatch,
    batches,
    produced,
    excess: produced - input.quantity,
    startingSquaresPerFabric: batches,
    totalStartingSquares: 2 * batches,
    warnings,
    explanation: {
      assumptions: [
        'Each batch uses two starting squares, normally one from each of two fabrics.',
        ...(input.method === 'four-at-a-time'
          ? [
              'Four-at-a-time sizing includes the entered perimeter seam allowance.',
            ]
          : []),
      ],
      steps: [
        {
          key: 'unfinishedSize',
          formula: 'finishedSize + 1/2 inch',
          value: unfinishedSize,
        },
        {
          key: 'standardStartingSquare',
          formula,
          value: standardStartingSquare,
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
