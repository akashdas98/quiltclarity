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

export interface BorderCalculatorInput {
  quiltWidth: number;
  quiltLength: number;
  finishedBorderWidth: number;
  layers: number;
  seamAllowance: number;
  usableWidth: number;
  handlingBuffer: number;
  joinSeamAllowance: number;
  safetyAllowancePercent: number;
  purchaseIncrement: number;
}

export interface BorderLayerResult {
  layer: number;
  currentWidth: number;
  currentLength: number;
  sideBorderFinishedLength: number;
  topBottomFinishedLength: number;
  nominalStripLength: number;
}

export interface BorderCalculatorSuccess {
  ok: true;
  cutBorderWidth: number;
  layerResults: BorderLayerResult[];
  totalNominalStripLength: number;
  requiredJoinedLength: number;
  effectiveJoinedLength: number;
  joinLoss: number;
  stripCount: number;
  rawFabricLength: number;
  bufferedLength: number;
  recommendedLength: number;
  finalWidth: number;
  finalLength: number;
  warnings: CalculatorWarning[];
  explanation: CalculatorExplanation;
}

export type BorderCalculatorResult =
  BorderCalculatorSuccess | CalculatorFailure;

export function calculateBorders(
  input: BorderCalculatorInput,
): BorderCalculatorResult {
  const errors = [
    ...validatePositiveNumber(input.quiltWidth, 'quiltWidth'),
    ...validatePositiveNumber(input.quiltLength, 'quiltLength'),
    ...validatePositiveNumber(input.finishedBorderWidth, 'finishedBorderWidth'),
    ...validatePositiveInteger(input.layers, 'layers'),
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

  const cutBorderWidth = input.finishedBorderWidth + 2 * input.seamAllowance;
  const layerResults: BorderLayerResult[] = [];
  for (let layer = 1; layer <= input.layers; layer += 1) {
    const currentWidth =
      input.quiltWidth + 2 * input.finishedBorderWidth * (layer - 1);
    const currentLength =
      input.quiltLength + 2 * input.finishedBorderWidth * (layer - 1);
    const sideBorderFinishedLength = currentLength;
    const topBottomFinishedLength =
      currentWidth + 2 * input.finishedBorderWidth;
    layerResults.push({
      layer,
      currentWidth,
      currentLength,
      sideBorderFinishedLength,
      topBottomFinishedLength,
      nominalStripLength:
        2 * sideBorderFinishedLength + 2 * topBottomFinishedLength,
    });
  }
  const totalNominalStripLength = layerResults.reduce(
    (total, layer) => total + layer.nominalStripLength,
    0,
  );
  const joinedCapacity = calculateJoinedWofCapacity({
    usableWidth: input.usableWidth,
    requiredLinearLength: totalNominalStripLength,
    handlingBuffer: input.handlingBuffer,
    joinSeamAllowance: input.joinSeamAllowance,
  });
  const rawFabricLength = joinedCapacity.stripCount * cutBorderWidth;
  const purchase = calculatePurchaseRequirement(
    rawFabricLength,
    input.safetyAllowancePercent,
    input.purchaseIncrement,
  );
  const warnings: CalculatorWarning[] = [
    {
      code: 'measure-quilt-centre',
      message:
        'Before cutting the final border lengths, measure the assembled quilt top through the center in multiple places and use the chosen measured/averaged length.',
    },
  ];
  if (input.safetyAllowancePercent === 0) {
    warnings.push({
      code: 'zero-safety-allowance',
      message: 'No safety allowance has been added to the border requirement.',
    });
  }
  return {
    ok: true,
    cutBorderWidth,
    layerResults,
    totalNominalStripLength,
    requiredJoinedLength: joinedCapacity.requiredJoinedLength,
    effectiveJoinedLength: joinedCapacity.effectiveJoinedLength,
    joinLoss: joinedCapacity.joinLoss,
    stripCount: joinedCapacity.stripCount,
    rawFabricLength,
    bufferedLength: purchase.bufferedLength,
    recommendedLength: purchase.recommendedLength,
    finalWidth: input.quiltWidth + 2 * input.finishedBorderWidth * input.layers,
    finalLength:
      input.quiltLength + 2 * input.finishedBorderWidth * input.layers,
    warnings,
    explanation: {
      assumptions: [
        'Straight, non-mitered borders · WOF/cross-grain strips · side borders first.',
        'Quilt width and length are planning/current quilt-top dimensions; final border cuts use actual measurements.',
      ],
      steps: [
        {
          key: 'cutBorderWidth',
          formula: 'finishedBorderWidth + 2 × seamAllowance',
          value: cutBorderWidth,
        },
        {
          key: 'requiredJoinedLength',
          formula: 'sum(layer nominal lengths) + handlingBuffer',
          value: joinedCapacity.requiredJoinedLength,
        },
        {
          key: 'stripCount',
          formula:
            'smallest n where n × usableWidth - (n - 1) × 2 × joinSeamAllowance >= requiredJoinedLength',
          value: joinedCapacity.stripCount,
        },
        {
          key: 'rawFabricLength',
          formula: 'stripCount × cutBorderWidth',
          value: rawFabricLength,
        },
      ],
    },
  };
}
