import { describe, expect, it } from 'vitest';

import {
  calculateBatting,
  calculateFlyingGeese,
  calculatePiecesFromFabric,
  calculateQst,
  toMillimetres,
} from '../src/lib/domain';

const inches = (value: number): number => toMillimetres(value, 'inch');

function expectInches(actual: number, expected: number): void {
  expect(actual).toBeCloseTo(inches(expected), 8);
}

function expectSuccess<T extends { ok: boolean }>(
  result: T,
): Extract<T, { ok: true }> {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(JSON.stringify(result));
  return result as Extract<T, { ok: true }>;
}

describe('V1.1 QST calculator', () => {
  it('implements G41 for the classic two-color batch method', () => {
    const result = expectSuccess(
      calculateQst({
        finishedSize: inches(4),
        quantity: 10,
        sizingMode: 'trim-friendly',
      }),
    );

    expectInches(result.unfinishedSize, 4.5);
    expectInches(result.standardStartingSquare, 5.25);
    expectInches(result.trimFriendlyStartingSquare, 5.5);
    expectInches(result.selectedStartingSquare, 5.5);
    expect(result).toEqual(
      expect.objectContaining({
        yieldPerBatch: 4,
        batches: 3,
        produced: 12,
        excess: 2,
        startingSquaresPerFabric: 6,
        totalStartingSquares: 12,
      }),
    );
  });

  it('never produces fewer QSTs than requested', () => {
    for (let quantity = 1; quantity <= 50; quantity += 1) {
      const result = expectSuccess(
        calculateQst({
          finishedSize: inches(3),
          quantity,
          sizingMode: 'standard',
        }),
      );
      expect(result.produced).toBeGreaterThanOrEqual(quantity);
      expect(result.excess).toBe(result.produced - quantity);
      expect(result.startingSquaresPerFabric).toBe(result.batches * 2);
    }
  });
});

describe('V1.1 Flying Geese calculator', () => {
  it('implements G42 one-at-a-time dimensions and counts', () => {
    const result = expectSuccess(
      calculateFlyingGeese({
        finishedWidth: inches(4),
        finishedHeight: inches(2),
        quantity: 3,
        method: 'one-at-a-time',
        sizingMode: 'trim-friendly',
      }),
    );

    expect(result.standard).toEqual({
      bodyWidth: inches(4.5),
      bodyHeight: inches(2.5),
      backgroundSquare: inches(2.5),
    });
    expect(result.trimFriendly).toEqual({
      bodyWidth: inches(4.75),
      bodyHeight: inches(2.75),
      backgroundSquare: inches(2.75),
    });
    expect(result).toEqual(
      expect.objectContaining({
        batches: 3,
        produced: 3,
        excess: 0,
        bodyPieceCount: 3,
        backgroundSquareCount: 6,
      }),
    );
  });

  it('implements G43 four-at-a-time dimensions and counts', () => {
    const result = expectSuccess(
      calculateFlyingGeese({
        finishedWidth: inches(4),
        finishedHeight: inches(2),
        quantity: 10,
        method: 'four-at-a-time',
        sizingMode: 'standard',
      }),
    );

    expect(result.standard).toEqual({
      bodyWidth: inches(5.25),
      bodyHeight: inches(5.25),
      backgroundSquare: inches(2.875),
    });
    expect(result.trimFriendly).toEqual({
      bodyWidth: inches(5.5),
      bodyHeight: inches(5.5),
      backgroundSquare: inches(3.125),
    });
    expect(result).toEqual(
      expect.objectContaining({
        batches: 3,
        produced: 12,
        excess: 2,
        bodyPieceCount: 3,
        backgroundSquareCount: 12,
      }),
    );
  });

  it('blocks non-2:1 finished proportions', () => {
    expect(
      calculateFlyingGeese({
        finishedWidth: inches(5),
        finishedHeight: inches(2),
        quantity: 4,
        method: 'four-at-a-time',
        sizingMode: 'trim-friendly',
      }),
    ).toEqual({
      ok: false,
      errors: [
        expect.objectContaining({
          code: 'invalid-flying-geese-ratio',
          field: 'finishedWidth',
        }),
      ],
      warnings: [],
    });
  });

  it('never produces fewer Flying Geese than requested', () => {
    for (const method of ['one-at-a-time', 'four-at-a-time'] as const) {
      for (let quantity = 1; quantity <= 25; quantity += 1) {
        const result = expectSuccess(
          calculateFlyingGeese({
            finishedWidth: inches(6),
            finishedHeight: inches(3),
            quantity,
            method,
            sizingMode: 'trim-friendly',
          }),
        );
        expect(result.produced).toBeGreaterThanOrEqual(quantity);
        expect(result.excess).toBe(result.produced - quantity);
      }
    }
  });
});

describe('V1.1 Batting calculator', () => {
  it('implements G44 with the only valid roll orientation', () => {
    const result = expectSuccess(
      calculateBatting({
        quiltWidth: inches(60),
        quiltLength: inches(80),
        overagePerSide: inches(4),
        rollWidth: inches(72),
        rotationAllowed: true,
      }),
    );

    expectInches(result.requiredWidth, 68);
    expectInches(result.requiredLength, 88);
    expect(result.fitsSuppliedRoll).toBe(true);
    expect(result.candidates).toEqual([
      expect.objectContaining({
        orientation: 'required-width-across-roll',
        requiredLinearLength: inches(88),
      }),
    ]);
    expectInches(result.candidates[0]!.acrossRoll, 68);
    expectInches(result.lowestLinearLength!.requiredLinearLength, 88);
  });

  it('compares both valid orientations by linear length', () => {
    const result = expectSuccess(
      calculateBatting({
        quiltWidth: inches(30),
        quiltLength: inches(40),
        overagePerSide: 0,
        rollWidth: inches(50),
        rotationAllowed: true,
      }),
    );

    expect(result.candidates).toHaveLength(2);
    expect(result.lowestLinearLength?.orientation).toBe(
      'required-length-across-roll',
    );
    expectInches(result.lowestLinearLength!.requiredLinearLength, 30);
  });

  it('reports a too-narrow roll without inventing pieced batting', () => {
    const result = expectSuccess(
      calculateBatting({
        quiltWidth: inches(60),
        quiltLength: inches(80),
        overagePerSide: inches(4),
        rollWidth: inches(60),
        rotationAllowed: true,
      }),
    );

    expect(result.fitsSuppliedRoll).toBe(false);
    expect(result.candidates).toEqual([]);
    expect(result.lowestLinearLength).toBeNull();
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'batting-width-too-narrow' }),
    );
  });
});

describe('V1.1 Pieces from Fabric calculator', () => {
  it('implements G45 through the shared finite-stock engine', () => {
    const result = expectSuccess(
      calculatePiecesFromFabric({
        stockWidth: inches(18),
        stockLength: inches(21),
        pieceWidth: inches(5),
        pieceHeight: inches(5),
        dimensionMode: 'cut',
        seamAllowance: 0,
        directional: false,
      }),
    );

    expect(result.maximumPracticalYield).toBe(12);
    expect(result.placedQuantity).toBe(12);
    expect(result.placements).toHaveLength(12);
    expect(result.requestedQuantity).toBeNull();
    expect(result.requestedFits).toBeNull();
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'practical-heuristic' }),
    );
  });

  it('returns requested-fit status and a requested-size layout', () => {
    const fits = expectSuccess(
      calculatePiecesFromFabric({
        stockWidth: inches(18),
        stockLength: inches(21),
        pieceWidth: inches(5),
        pieceHeight: inches(5),
        quantity: 10,
        dimensionMode: 'cut',
        seamAllowance: 0,
        directional: false,
      }),
    );
    const exceeds = expectSuccess(
      calculatePiecesFromFabric({
        stockWidth: inches(18),
        stockLength: inches(21),
        pieceWidth: inches(5),
        pieceHeight: inches(5),
        quantity: 13,
        dimensionMode: 'cut',
        seamAllowance: 0,
        directional: false,
      }),
    );

    expect(fits.maximumPracticalYield).toBe(12);
    expect(fits.requestedFits).toBe(true);
    expect(fits.placements).toHaveLength(10);
    expect(exceeds.maximumPracticalYield).toBe(12);
    expect(exceeds.requestedFits).toBe(false);
    expect(exceeds.placements).toHaveLength(12);
  });

  it('normalizes finished dimensions before finite-stock packing', () => {
    const result = expectSuccess(
      calculatePiecesFromFabric({
        stockWidth: inches(12),
        stockLength: inches(12),
        pieceWidth: inches(5),
        pieceHeight: inches(5),
        dimensionMode: 'finished',
        seamAllowance: inches(0.5),
        directional: false,
      }),
    );

    expectInches(result.cutPieceWidth, 6);
    expectInches(result.cutPieceHeight, 6);
    expect(result.maximumPracticalYield).toBe(4);
  });

  it('keeps every placement in bounds without overlap', () => {
    const result = expectSuccess(
      calculatePiecesFromFabric({
        stockWidth: inches(17),
        stockLength: inches(23),
        pieceWidth: inches(7),
        pieceHeight: inches(4),
        dimensionMode: 'cut',
        seamAllowance: 0,
        directional: false,
        rotationAllowed: true,
      }),
    );

    for (const placement of result.placements) {
      expect(placement.x).toBeGreaterThanOrEqual(0);
      expect(placement.y).toBeGreaterThanOrEqual(0);
      expect(placement.x + placement.width).toBeLessThanOrEqual(inches(17));
      expect(placement.y + placement.height).toBeLessThanOrEqual(inches(23));
    }
    for (
      let leftIndex = 0;
      leftIndex < result.placements.length;
      leftIndex += 1
    ) {
      const left = result.placements[leftIndex]!;
      for (
        let rightIndex = leftIndex + 1;
        rightIndex < result.placements.length;
        rightIndex += 1
      ) {
        const right = result.placements[rightIndex]!;
        expect(
          left.x < right.x + right.width &&
            left.x + left.width > right.x &&
            left.y < right.y + right.height &&
            left.y + left.height > right.y,
        ).toBe(false);
      }
    }
    expect(result).toEqual(
      calculatePiecesFromFabric({
        stockWidth: inches(17),
        stockLength: inches(23),
        pieceWidth: inches(7),
        pieceHeight: inches(4),
        dimensionMode: 'cut',
        seamAllowance: 0,
        directional: false,
        rotationAllowed: true,
      }),
    );
  });

  it('preserves directional rotation defaults and explicit overrides', () => {
    const base = {
      stockWidth: inches(10),
      stockLength: inches(20),
      pieceWidth: inches(20),
      pieceHeight: inches(10),
      dimensionMode: 'cut' as const,
      seamAllowance: 0,
      directional: true,
    };
    const directional = expectSuccess(calculatePiecesFromFabric(base));
    const overridden = expectSuccess(
      calculatePiecesFromFabric({ ...base, rotationAllowed: true }),
    );

    expect(directional.maximumPracticalYield).toBe(0);
    expect(directional.placements).toEqual([]);
    expect(overridden.maximumPracticalYield).toBe(1);
    expect(overridden.placements[0]).toEqual(
      expect.objectContaining({ rotated: true }),
    );
  });
});

describe('V1.1 calculator validation', () => {
  it('returns field-specific blocking errors for invalid new-calculator input', () => {
    expect(
      calculateQst({
        finishedSize: 0,
        quantity: 0,
        sizingMode: 'standard',
      }),
    ).toEqual({
      ok: false,
      errors: [
        expect.objectContaining({ field: 'finishedSize' }),
        expect.objectContaining({ field: 'quantity' }),
      ],
      warnings: [],
    });
    expect(
      calculateBatting({
        quiltWidth: inches(40),
        quiltLength: inches(60),
        overagePerSide: -1,
        rotationAllowed: false,
      }),
    ).toEqual({
      ok: false,
      errors: [expect.objectContaining({ field: 'overagePerSide' })],
      warnings: [],
    });
  });
});
