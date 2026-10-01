export interface PurchaseRequirement {
  layoutLength: number;
  safetyAllowancePercent: number;
  bufferedLength: number;
  purchaseIncrement: number;
  recommendedLength: number;
}

export function applySafetyAllowance(
  layoutLength: number,
  safetyAllowancePercent: number,
): number {
  if (!Number.isFinite(layoutLength) || layoutLength < 0) {
    throw new RangeError('Layout length must be finite and non-negative.');
  }

  if (!Number.isFinite(safetyAllowancePercent) || safetyAllowancePercent < 0) {
    throw new RangeError(
      'Safety allowance percent must be finite and non-negative.',
    );
  }

  return layoutLength * (1 + safetyAllowancePercent / 100);
}

export function ceilToIncrement(value: number, increment: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError('Value must be finite and non-negative.');
  }

  if (!Number.isFinite(increment) || increment <= 0) {
    throw new RangeError('Increment must be finite and greater than zero.');
  }

  const quotient = value / increment;
  const nearestInteger = Math.round(quotient);
  const equalityTolerance =
    Number.EPSILON * Math.max(1, Math.abs(quotient)) * 4;
  const nearestCandidate = nearestInteger * increment;
  const incrementCount =
    Math.abs(quotient - nearestInteger) <= equalityTolerance &&
    nearestCandidate >= value
      ? nearestInteger
      : Math.ceil(quotient);
  const recommendation = incrementCount * increment;

  return recommendation >= value ? recommendation : recommendation + increment;
}

export function calculatePurchaseRequirement(
  layoutLength: number,
  safetyAllowancePercent: number,
  purchaseIncrement: number,
): PurchaseRequirement {
  const bufferedLength = applySafetyAllowance(
    layoutLength,
    safetyAllowancePercent,
  );

  return {
    layoutLength,
    safetyAllowancePercent,
    bufferedLength,
    purchaseIncrement,
    recommendedLength: ceilToIncrement(bufferedLength, purchaseIncrement),
  };
}
