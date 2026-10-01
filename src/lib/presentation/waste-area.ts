import type { UnitSystem } from '../domain';

const SQUARE_MILLIMETRES_PER_SQUARE_INCH = 25.4 ** 2;
const SQUARE_MILLIMETRES_PER_SQUARE_CENTIMETRE = 100;

export function formatWasteArea(
  squareMillimetres: number,
  unitSystem: UnitSystem,
): string {
  const value = formatWasteAreaValue(squareMillimetres, unitSystem);
  return value === 'No unused area' ? value : `Waste area: ${value}`;
}

export function formatWasteAreaValue(
  squareMillimetres: number,
  unitSystem: UnitSystem,
): string {
  if (Math.abs(squareMillimetres) < 1e-6) return 'No unused area';

  const divisor =
    unitSystem === 'imperial'
      ? SQUARE_MILLIMETRES_PER_SQUARE_INCH
      : SQUARE_MILLIMETRES_PER_SQUARE_CENTIMETRE;
  const unit = unitSystem === 'imperial' ? 'in²' : 'cm²';
  const value = Number((squareMillimetres / divisor).toFixed(1));
  return `${value} ${unit}`;
}
