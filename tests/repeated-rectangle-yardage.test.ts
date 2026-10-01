import { describe, expect, it } from 'vitest';

import {
  calculateRepeatedRectangleYardage,
  fromMillimetres,
  toMillimetres,
  type FabricSpec,
  type PieceGroup,
  type RepeatedRectangleYardageSuccess,
} from '../src/lib/domain';

function makeFabric(overrides: Partial<FabricSpec> = {}): FabricSpec {
  return {
    id: 'fabric-a',
    name: 'Fabric A',
    fabricWidth: toMillimetres(42, 'inch'),
    usableWidth: toMillimetres(40, 'inch'),
    directional: false,
    defaultRotationAllowed: true,
    safetyAllowancePercent: 0,
    purchaseIncrement: toMillimetres(1 / 8, 'yard'),
    ...overrides,
  };
}

function makePiece(overrides: Partial<PieceGroup> = {}): PieceGroup {
  return {
    id: 'piece-a',
    label: 'Piece A',
    quantity: 20,
    width: toMillimetres(4.5, 'inch'),
    height: toMillimetres(4.5, 'inch'),
    dimensionMode: 'cut',
    ...overrides,
  };
}

function expectSuccess(
  result: ReturnType<typeof calculateRepeatedRectangleYardage>,
): RepeatedRectangleYardageSuccess {
  expect(result.ok).toBe(true);

  if (!result.ok) {
    throw new Error(
      `Expected success, received: ${JSON.stringify(result.errors)}`,
    );
  }

  return result;
}

describe('repeated identical rectangle golden fixtures', () => {
  it('implements G01 finished-to-cut conversion in the engine', () => {
    const result = expectSuccess(
      calculateRepeatedRectangleYardage(
        makeFabric(),
        makePiece({
          quantity: 1,
          width: toMillimetres(4, 'inch'),
          height: toMillimetres(4, 'inch'),
          dimensionMode: 'finished',
        }),
        toMillimetres(1 / 4, 'inch'),
      ),
    );

    expect(result.explanation.cutWidth).toBe(toMillimetres(4.5, 'inch'));
    expect(result.explanation.cutHeight).toBe(toMillimetres(4.5, 'inch'));
  });

  it('implements G02 strip packing, safety, and purchase rounding', () => {
    const unbuffered = expectSuccess(
      calculateRepeatedRectangleYardage(makeFabric(), makePiece(), 0),
    );

    expect(unbuffered.explanation).toMatchObject({
      rotated: false,
      piecesPerRow: 8,
      rowsRequired: 3,
      unusedSlotsInFinalRow: 4,
      rawLength: toMillimetres(13.5, 'inch'),
    });

    const buffered = expectSuccess(
      calculateRepeatedRectangleYardage(
        makeFabric({ safetyAllowancePercent: 5 }),
        makePiece(),
        0,
      ),
    );

    expect(
      fromMillimetres(buffered.explanation.bufferedLength, 'inch'),
    ).toBeCloseTo(14.175);
    expect(buffered.explanation.recommendedLength).toBe(
      toMillimetres(18, 'inch'),
    );
  });

  it('implements G03 rotation when it materially saves fabric', () => {
    const result = expectSuccess(
      calculateRepeatedRectangleYardage(
        makeFabric(),
        makePiece({
          quantity: 6,
          width: toMillimetres(21, 'inch'),
          height: toMillimetres(6, 'inch'),
          rotationAllowed: true,
        }),
        0,
      ),
    );

    expect(result.explanation).toMatchObject({
      rotated: true,
      piecesPerRow: 6,
      rowsRequired: 1,
      rawLength: toMillimetres(21, 'inch'),
    });
  });

  it('implements G04 directional no-rotation behavior', () => {
    const result = expectSuccess(
      calculateRepeatedRectangleYardage(
        makeFabric({ directional: true, defaultRotationAllowed: false }),
        makePiece({
          quantity: 6,
          width: toMillimetres(21, 'inch'),
          height: toMillimetres(6, 'inch'),
        }),
        0,
      ),
    );

    expect(result.explanation).toMatchObject({
      rotated: false,
      piecesPerRow: 1,
      rowsRequired: 6,
    });
    expect(result.explanation.rawLength).toBeCloseTo(toMillimetres(36, 'inch'));
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'directional-fabric-increases-length' }),
    );
  });

  it('implements G06 as a blocking error with no result', () => {
    const result = calculateRepeatedRectangleYardage(
      makeFabric(),
      makePiece({
        quantity: 1,
        width: toMillimetres(41, 'inch'),
        height: toMillimetres(5, 'inch'),
        rotationAllowed: false,
      }),
      0,
    );

    expect(result).toEqual({
      ok: false,
      errors: [expect.objectContaining({ code: 'piece-does-not-fit' })],
      warnings: [],
    });
    expect('explanation' in result).toBe(false);
  });

  it('implements G07 by rotating an otherwise oversized piece', () => {
    const result = expectSuccess(
      calculateRepeatedRectangleYardage(
        makeFabric(),
        makePiece({
          quantity: 1,
          width: toMillimetres(41, 'inch'),
          height: toMillimetres(5, 'inch'),
          rotationAllowed: true,
        }),
        0,
      ),
    );

    expect(result.explanation).toMatchObject({
      rotated: true,
      piecesPerRow: 8,
      rowsRequired: 1,
      rawLength: toMillimetres(41, 'inch'),
    });
  });

  it('implements G08 metric equivalence without imperial display rounding', () => {
    const result = expectSuccess(
      calculateRepeatedRectangleYardage(
        makeFabric({
          fabricWidth: toMillimetres(107, 'centimetre'),
          usableWidth: toMillimetres(101.6, 'centimetre'),
          purchaseIncrement: toMillimetres(0.1, 'metre'),
        }),
        makePiece({
          width: toMillimetres(11.43, 'centimetre'),
          height: toMillimetres(11.43, 'centimetre'),
        }),
        0,
      ),
    );

    expect(result.explanation).toMatchObject({
      piecesPerRow: 8,
      rowsRequired: 3,
      rawLength: toMillimetres(34.29, 'centimetre'),
      recommendedLength: toMillimetres(0.4, 'metre'),
    });
  });

  it('implements G20-G21 and G24 through the shared purchase boundary', () => {
    const imperialBoundary = expectSuccess(
      calculateRepeatedRectangleYardage(
        makeFabric(),
        makePiece({
          quantity: 1,
          width: toMillimetres(1, 'inch'),
          height: toMillimetres(36.01, 'inch'),
          rotationAllowed: false,
        }),
        0,
      ),
    );
    const imperialExact = expectSuccess(
      calculateRepeatedRectangleYardage(
        makeFabric(),
        makePiece({
          quantity: 1,
          width: toMillimetres(1, 'inch'),
          height: toMillimetres(36, 'inch'),
          rotationAllowed: false,
        }),
        0,
      ),
    );
    const metricBoundary = expectSuccess(
      calculateRepeatedRectangleYardage(
        makeFabric({
          usableWidth: toMillimetres(1, 'metre'),
          purchaseIncrement: toMillimetres(0.1, 'metre'),
        }),
        makePiece({
          quantity: 1,
          width: toMillimetres(0.1, 'metre'),
          height: toMillimetres(0.401, 'metre'),
          rotationAllowed: false,
        }),
        0,
      ),
    );

    expect(imperialBoundary.explanation.recommendedLength).toBe(
      toMillimetres(40.5, 'inch'),
    );
    expect(imperialExact.explanation.recommendedLength).toBe(
      toMillimetres(36, 'inch'),
    );
    expect(metricBoundary.explanation.recommendedLength).toBe(
      toMillimetres(0.5, 'metre'),
    );
  });

  it('implements G22 using usable width rather than nominal width', () => {
    const result = expectSuccess(
      calculateRepeatedRectangleYardage(
        makeFabric({ usableWidth: toMillimetres(36, 'inch') }),
        makePiece({
          quantity: 8,
          width: toMillimetres(9, 'inch'),
          height: toMillimetres(9, 'inch'),
        }),
        0,
      ),
    );

    expect(result.explanation).toMatchObject({
      usableWidth: toMillimetres(36, 'inch'),
      piecesPerRow: 4,
      rowsRequired: 2,
      rawLength: toMillimetres(18, 'inch'),
    });
  });

  it('implements G27 piece-level rotation restriction', () => {
    const result = expectSuccess(
      calculateRepeatedRectangleYardage(
        makeFabric({ defaultRotationAllowed: true }),
        makePiece({
          quantity: 6,
          width: toMillimetres(21, 'inch'),
          height: toMillimetres(6, 'inch'),
          rotationAllowed: false,
        }),
        0,
      ),
    );

    expect(result.explanation.rotated).toBe(false);
    expect(result.explanation.rawLength).toBeCloseTo(toMillimetres(36, 'inch'));
  });

  it('enforces explicit crosswise and lengthwise orientation', () => {
    const selectedFabric = makeFabric();
    const base = makePiece({
      width: toMillimetres(30, 'inch'),
      height: toMillimetres(10, 'inch'),
      quantity: 2,
      rotationAllowed: true,
    });
    const crosswise = expectSuccess(
      calculateRepeatedRectangleYardage(
        selectedFabric,
        { ...base, orientationConstraint: 'crosswise' },
        0,
      ),
    );
    const lengthwise = expectSuccess(
      calculateRepeatedRectangleYardage(
        selectedFabric,
        { ...base, orientationConstraint: 'lengthwise' },
        0,
      ),
    );

    expect(crosswise.explanation.rotated).toBe(false);
    expect(crosswise.explanation.rawLength).toBe(toMillimetres(20, 'inch'));
    expect(lengthwise.explanation.rotated).toBe(true);
    expect(lengthwise.explanation.rawLength).toBe(toMillimetres(30, 'inch'));
  });

  it('keeps WOF strips crosswise instead of auto-rotating them', () => {
    const result = expectSuccess(
      calculateRepeatedRectangleYardage(
        makeFabric(),
        makePiece({
          quantity: 2,
          width: toMillimetres(40, 'inch'),
          height: toMillimetres(2.5, 'inch'),
          isWofStrip: true,
          rotationAllowed: true,
        }),
        0,
      ),
    );

    expect(result.explanation).toMatchObject({
      rotated: false,
      piecesPerRow: 1,
      rowsRequired: 2,
      rawLength: toMillimetres(5, 'inch'),
    });
  });
});

describe('release manual-fixture edge coverage', () => {
  it('packs rectangles that exactly fill usable WOF', () => {
    const result = expectSuccess(
      calculateRepeatedRectangleYardage(
        makeFabric(),
        makePiece({
          quantity: 3,
          width: toMillimetres(40, 'inch'),
          height: toMillimetres(6, 'inch'),
          rotationAllowed: false,
        }),
        0,
      ),
    );

    expect(result.explanation).toMatchObject({
      piecesPerRow: 1,
      rowsRequired: 3,
    });
    expect(result.explanation.rawLength).toBeCloseTo(toMillimetres(18, 'inch'));
  });

  it('keeps a near-WOF piece valid without placing two across', () => {
    const result = expectSuccess(
      calculateRepeatedRectangleYardage(
        makeFabric(),
        makePiece({
          quantity: 2,
          width: toMillimetres(39, 'inch'),
          height: toMillimetres(7, 'inch'),
          rotationAllowed: false,
        }),
        0,
      ),
    );

    expect(result.explanation).toMatchObject({
      piecesPerRow: 1,
      rowsRequired: 2,
      rawLength: toMillimetres(14, 'inch'),
    });
  });

  it('preserves raw length as buffered length with zero safety', () => {
    const result = expectSuccess(
      calculateRepeatedRectangleYardage(
        makeFabric(),
        makePiece({
          quantity: 8,
          width: toMillimetres(5, 'inch'),
          height: toMillimetres(5, 'inch'),
        }),
        0,
      ),
    );

    expect(result.explanation.rawLength).toBe(toMillimetres(5, 'inch'));
    expect(result.explanation.bufferedLength).toBe(
      result.explanation.rawLength,
    );
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'zero-safety-allowance' }),
    );
  });
});

describe('single-piece yardage invariants', () => {
  it('is deterministic for identical input', () => {
    const inputFabric = makeFabric({ safetyAllowancePercent: 5 });
    const inputPiece = makePiece({
      quantity: 17,
      width: 175,
      height: 93,
    });

    expect(
      calculateRepeatedRectangleYardage(inputFabric, inputPiece, 6.35),
    ).toEqual(calculateRepeatedRectangleYardage(inputFabric, inputPiece, 6.35));
  });

  it('prefers unrotated on an equal-length tie', () => {
    const result = expectSuccess(
      calculateRepeatedRectangleYardage(
        makeFabric(),
        makePiece({ quantity: 1, width: 100, height: 100 }),
        0,
      ),
    );

    expect(result.explanation.rotated).toBe(false);
  });

  it('accounts for every requested piece and stays within usable width', () => {
    for (const quantity of [1, 2, 7, 20, 101]) {
      const result = expectSuccess(
        calculateRepeatedRectangleYardage(
          makeFabric(),
          makePiece({ quantity, width: 137, height: 251 }),
          0,
        ),
      );
      const explanation = result.explanation;
      const acrossWidth = explanation.rotated
        ? explanation.cutHeight
        : explanation.cutWidth;
      const capacity = explanation.piecesPerRow * explanation.rowsRequired;

      expect(explanation.piecesPerRow * acrossWidth).toBeLessThanOrEqual(
        explanation.usableWidth,
      );
      expect(capacity).toBeGreaterThanOrEqual(quantity);
      expect(capacity - explanation.unusedSlotsInFinalRow).toBe(quantity);
      expect(explanation.bufferedLength).toBeGreaterThanOrEqual(
        explanation.rawLength,
      );
      expect(explanation.recommendedLength).toBeGreaterThanOrEqual(
        explanation.bufferedLength,
      );
    }
  });

  it('returns explicit input errors instead of a best-effort result', () => {
    const result = calculateRepeatedRectangleYardage(
      makeFabric({ usableWidth: 0, purchaseIncrement: 0 }),
      makePiece({ quantity: 0, width: Number.NaN }),
      -1,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.map((error) => error.field)).toEqual(
        expect.arrayContaining([
          'usableWidth',
          'purchaseIncrement',
          'quantity',
          'width',
          'seamAllowance',
        ]),
      );
    }
    expect('explanation' in result).toBe(false);
  });
});
