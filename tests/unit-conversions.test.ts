import { describe, expect, it } from 'vitest';

import conversionFixtures from './fixtures/unit-conversions.json';
import {
  convertLength,
  fromMillimetres,
  type LengthUnit,
  MILLIMETRES_PER_INCH,
  MILLIMETRES_PER_METRE,
  MILLIMETRES_PER_YARD,
  toMillimetres,
} from '../src/lib/domain/units';

describe('canonical unit constants', () => {
  it('matches the authoritative V1 conversion contract', () => {
    expect(MILLIMETRES_PER_INCH).toBe(25.4);
    expect(MILLIMETRES_PER_YARD).toBe(914.4);
    expect(MILLIMETRES_PER_METRE).toBe(1_000);
  });
});

describe('unit conversion fixtures', () => {
  it.each(conversionFixtures)(
    '$label converts to canonical millimetres',
    (fixture) => {
      expect(toMillimetres(fixture.value, fixture.unit as LengthUnit)).toBe(
        fixture.millimetres,
      );
    },
  );

  it('round-trips without display rounding', () => {
    const millimetres = toMillimetres(4.5, 'inch');

    expect(fromMillimetres(millimetres, 'inch')).toBe(4.5);
  });

  it('converts between supported display units through millimetres', () => {
    expect(convertLength(1, 'yard', 'inch')).toBe(36);
    expect(convertLength(1, 'metre', 'centimetre')).toBe(100);
  });
});
