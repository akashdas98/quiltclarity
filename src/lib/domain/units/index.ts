export const MILLIMETRES_PER_INCH = 25.4;
export const MILLIMETRES_PER_YARD = 914.4;
export const MILLIMETRES_PER_METRE = 1_000;
export const MILLIMETRES_PER_CENTIMETRE = 10;

export type LengthUnit =
  'millimetre' | 'centimetre' | 'inch' | 'metre' | 'yard';

const MILLIMETRES_PER_UNIT: Readonly<Record<LengthUnit, number>> = {
  millimetre: 1,
  centimetre: MILLIMETRES_PER_CENTIMETRE,
  inch: MILLIMETRES_PER_INCH,
  metre: MILLIMETRES_PER_METRE,
  yard: MILLIMETRES_PER_YARD,
};

export function toMillimetres(value: number, unit: LengthUnit): number {
  return value * MILLIMETRES_PER_UNIT[unit];
}

export function fromMillimetres(value: number, unit: LengthUnit): number {
  return value / MILLIMETRES_PER_UNIT[unit];
}

export function convertLength(
  value: number,
  from: LengthUnit,
  to: LengthUnit,
): number {
  return fromMillimetres(toMillimetres(value, from), to);
}
