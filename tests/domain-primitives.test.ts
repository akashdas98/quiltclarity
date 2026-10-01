import { describe, expect, it } from 'vitest';

import {
  applySafetyAllowance,
  calculatePurchaseRequirement,
  ceilToIncrement,
  formatImperialInches,
  normalizePieceGroup,
  resolveRotationAllowed,
  toMillimetres,
  type FabricSpec,
  type PieceGroup,
  validateFabricSpec,
  validatePieceFitsFabric,
  validatePieceGroup,
  validateSeamAllowance,
} from '../src/lib/domain';

const fabric: FabricSpec = {
  id: 'fabric-a',
  name: 'Fabric A',
  fabricWidth: toMillimetres(42, 'inch'),
  usableWidth: toMillimetres(40, 'inch'),
  directional: false,
  defaultRotationAllowed: true,
  safetyAllowancePercent: 5,
  purchaseIncrement: toMillimetres(1 / 8, 'yard'),
};

const cutPiece: PieceGroup = {
  id: 'piece-a',
  label: 'Piece A',
  quantity: 1,
  width: toMillimetres(4.5, 'inch'),
  height: toMillimetres(4.5, 'inch'),
  dimensionMode: 'cut',
};

describe('piece normalization', () => {
  it('implements G01 finished-to-cut conversion', () => {
    const normalized = normalizePieceGroup(
      fabric,
      {
        ...cutPiece,
        width: toMillimetres(4, 'inch'),
        height: toMillimetres(4, 'inch'),
        dimensionMode: 'finished',
      },
      toMillimetres(1 / 4, 'inch'),
    );

    expect(normalized.width).toBe(toMillimetres(4.5, 'inch'));
    expect(normalized.height).toBe(toMillimetres(4.5, 'inch'));
    expect(normalized.dimensionMode).toBe('cut');
    expect(normalized.sourceDimensionMode).toBe('finished');
  });

  it('does not add seam allowance to cut dimensions', () => {
    const normalized = normalizePieceGroup(
      fabric,
      cutPiece,
      toMillimetres(1 / 4, 'inch'),
    );

    expect(normalized.width).toBe(cutPiece.width);
    expect(normalized.height).toBe(cutPiece.height);
  });
});

describe('rotation resolution', () => {
  it('defaults directional fabric to no rotation', () => {
    expect(
      resolveRotationAllowed(
        { ...fabric, directional: true, defaultRotationAllowed: false },
        cutPiece,
      ),
    ).toBe(false);
  });

  it('lets a piece-level setting override the project default (G27 primitive)', () => {
    expect(
      resolveRotationAllowed(fabric, { ...cutPiece, rotationAllowed: false }),
    ).toBe(false);
    expect(
      resolveRotationAllowed(
        { ...fabric, directional: true },
        { ...cutPiece, rotationAllowed: true },
      ),
    ).toBe(true);
  });

  it('does not rotate WOF strips automatically', () => {
    expect(
      resolveRotationAllowed(fabric, {
        ...cutPiece,
        isWofStrip: true,
        rotationAllowed: true,
      }),
    ).toBe(false);
  });
});

describe('imperial fraction formatting', () => {
  it.each([
    [0, '0\u2033'],
    [1 / 8, '1/8\u2033'],
    [1 / 4, '1/4\u2033'],
    [4.5, '4 1/2\u2033'],
    [5, '5\u2033'],
  ])('formats %f inches as %s', (inches, expected) => {
    expect(formatImperialInches(toMillimetres(inches, 'inch'))).toBe(expected);
  });

  it('rejects an invalid display denominator', () => {
    expect(() => formatImperialInches(25.4, 0)).toThrow(RangeError);
  });
});

describe('safety allowance and purchase rounding', () => {
  it('applies safety after the layout length', () => {
    expect(applySafetyAllowance(toMillimetres(13.5, 'inch'), 5)).toBeCloseTo(
      toMillimetres(14.175, 'inch'),
    );
  });

  it('implements G20 strict upward purchase rounding', () => {
    expect(
      ceilToIncrement(
        toMillimetres(36.01, 'inch'),
        toMillimetres(1 / 8, 'yard'),
      ),
    ).toBe(toMillimetres(40.5, 'inch'));
  });

  it('implements G21 exact-increment preservation', () => {
    expect(
      ceilToIncrement(toMillimetres(36, 'inch'), toMillimetres(1 / 8, 'yard')),
    ).toBe(toMillimetres(36, 'inch'));
  });

  it('never treats a value just above an increment as the exact increment', () => {
    expect(ceilToIncrement(36.00000000000001, 4.5)).toBe(40.5);
  });

  it('implements G24 metric upward rounding', () => {
    expect(ceilToIncrement(toMillimetres(0.401, 'metre'), 100)).toBe(500);
  });

  it('returns each purchase boundary explicitly', () => {
    const result = calculatePurchaseRequirement(100, 5, 25);

    expect(result).toEqual({
      layoutLength: 100,
      safetyAllowancePercent: 5,
      bufferedLength: 105,
      purchaseIncrement: 25,
      recommendedLength: 125,
    });
  });

  it('rejects invalid safety and purchase inputs explicitly', () => {
    expect(() => applySafetyAllowance(-1, 5)).toThrow(RangeError);
    expect(() => applySafetyAllowance(100, -1)).toThrow(RangeError);
    expect(() => ceilToIncrement(100, 0)).toThrow(RangeError);
  });

  it('preserves upward-rounding invariants across representative values', () => {
    const increments = [0.1, 4.5, 100];
    const values = [0, 0.01, 4.5, 36, 36.01, 401, 1_000.001];

    for (const increment of increments) {
      for (const value of values) {
        const recommended = ceilToIncrement(value, increment);

        expect(recommended).toBeGreaterThanOrEqual(value);
        expect(recommended / increment).toBeCloseTo(
          Math.round(recommended / increment),
          12,
        );
      }
    }
  });

  it('preserves safety ordering across representative values', () => {
    for (const layoutLength of [0, 1, 342.9, 10_000]) {
      for (const safetyAllowancePercent of [0, 5, 10, 12.5]) {
        expect(
          applySafetyAllowance(layoutLength, safetyAllowancePercent),
        ).toBeGreaterThanOrEqual(layoutLength);
      }
    }
  });
});

describe('validation', () => {
  it('accepts valid editable settings, including zero safety', () => {
    expect(
      validateFabricSpec({ ...fabric, safetyAllowancePercent: 0 }),
    ).toEqual([]);
    expect(validatePieceGroup(cutPiece)).toEqual([]);
    expect(validateSeamAllowance(0)).toEqual([]);
  });

  it('returns explicit field errors for invalid numeric input', () => {
    expect(validateFabricSpec({ ...fabric, usableWidth: 0 })).toContainEqual({
      code: 'not-positive',
      field: 'usableWidth',
      message: 'Usable fabric width must be greater than zero.',
    });
    expect(validatePieceGroup({ ...cutPiece, quantity: 1.5 })).toContainEqual(
      expect.objectContaining({
        code: 'not-positive-integer',
        field: 'quantity',
        pieceId: cutPiece.id,
      }),
    );
    expect(validateSeamAllowance(-1)).toContainEqual(
      expect.objectContaining({
        code: 'not-non-negative',
        field: 'seamAllowance',
        message: 'Seam allowance must be zero or greater.',
      }),
    );
    expect(
      validateFabricSpec({ ...fabric, usableWidth: Number.NaN }),
    ).toContainEqual({
      code: 'not-finite',
      field: 'usableWidth',
      message: 'Usable fabric width must be a number.',
    });
  });

  it('implements the G06 blocking fit validation', () => {
    const normalized = normalizePieceGroup(
      fabric,
      {
        ...cutPiece,
        width: toMillimetres(41, 'inch'),
        height: toMillimetres(5, 'inch'),
        rotationAllowed: false,
      },
      0,
    );

    expect(validatePieceFitsFabric(normalized, fabric.usableWidth)).toEqual([
      expect.objectContaining({
        code: 'piece-does-not-fit',
        field: 'width',
        pieceId: cutPiece.id,
        message:
          'This piece cannot fit across the available fabric width in any allowed orientation. Reduce its size, increase usable width, or allow a valid rotation.',
      }),
    ]);
  });

  it('implements the G07 valid-by-rotation primitive', () => {
    const normalized = normalizePieceGroup(
      fabric,
      {
        ...cutPiece,
        width: toMillimetres(41, 'inch'),
        height: toMillimetres(5, 'inch'),
        rotationAllowed: true,
      },
      0,
    );

    expect(validatePieceFitsFabric(normalized, fabric.usableWidth)).toEqual([]);
  });
});
