import type { ValidationError } from '../validation';
import {
  validateNonNegativeNumber,
  validatePositiveNumber,
} from '../validation';

export interface JoinedWofCapacityInput {
  usableWidth: number;
  requiredLinearLength: number;
  handlingBuffer: number;
  joinSeamAllowance: number;
}

export interface JoinedWofCapacity {
  stripCount: number;
  requiredJoinedLength: number;
  effectiveJoinedLength: number;
  joinLoss: number;
}

export function effectiveJoinedLength(
  stripCount: number,
  usableWidth: number,
  joinSeamAllowance: number,
): number {
  if (stripCount <= 0) return 0;
  return stripCount * usableWidth - (stripCount - 1) * 2 * joinSeamAllowance;
}

export function validateJoinedWofCapacityInput(
  input: JoinedWofCapacityInput,
): ValidationError[] {
  const errors = [
    ...validatePositiveNumber(input.usableWidth, 'usableWidth'),
    ...validateNonNegativeNumber(
      input.requiredLinearLength,
      'requiredLinearLength',
    ),
    ...validateNonNegativeNumber(input.handlingBuffer, 'handlingBuffer'),
    ...validateNonNegativeNumber(input.joinSeamAllowance, 'joinSeamAllowance'),
  ];
  if (
    Number.isFinite(input.usableWidth) &&
    Number.isFinite(input.joinSeamAllowance) &&
    input.usableWidth <= 2 * input.joinSeamAllowance
  ) {
    errors.push({
      code: 'not-positive',
      field: 'usableWidth',
      message:
        'Usable fabric width must be greater than the fabric consumed by one join. Increase usable width or reduce the join seam allowance.',
    });
  }
  return errors;
}

export function calculateJoinedWofCapacity(
  input: JoinedWofCapacityInput,
): JoinedWofCapacity {
  const requiredJoinedLength =
    input.requiredLinearLength + input.handlingBuffer;
  if (requiredJoinedLength === 0) {
    return {
      stripCount: 0,
      requiredJoinedLength,
      effectiveJoinedLength: 0,
      joinLoss: 0,
    };
  }
  const netAdditionalStripLength =
    input.usableWidth - 2 * input.joinSeamAllowance;
  const stripCount = Math.max(
    1,
    Math.ceil(
      (requiredJoinedLength - 2 * input.joinSeamAllowance) /
        netAdditionalStripLength,
    ),
  );
  const joinLoss = (stripCount - 1) * 2 * input.joinSeamAllowance;
  return {
    stripCount,
    requiredJoinedLength,
    effectiveJoinedLength: effectiveJoinedLength(
      stripCount,
      input.usableWidth,
      input.joinSeamAllowance,
    ),
    joinLoss,
  };
}
