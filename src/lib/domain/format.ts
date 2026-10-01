import { fromMillimetres } from './units';

function greatestCommonDivisor(left: number, right: number): number {
  let a = Math.abs(left);
  let b = Math.abs(right);

  while (b !== 0) {
    [a, b] = [b, a % b];
  }

  return a;
}

export function formatImperialInches(
  millimetres: number,
  denominator = 8,
): string {
  if (!Number.isInteger(denominator) || denominator <= 0) {
    throw new RangeError('Fraction denominator must be a positive integer.');
  }

  const inches = fromMillimetres(millimetres, 'inch');
  const sign = inches < 0 ? '-' : '';
  const roundedNumerator = Math.round(Math.abs(inches) * denominator);
  const whole = Math.floor(roundedNumerator / denominator);
  const numerator = roundedNumerator % denominator;

  if (numerator === 0) {
    return `${sign}${whole}\u2033`;
  }

  const divisor = greatestCommonDivisor(numerator, denominator);
  const fraction = `${numerator / divisor}/${denominator / divisor}`;
  const formatted = whole === 0 ? fraction : `${whole} ${fraction}`;

  return `${sign}${formatted}\u2033`;
}
