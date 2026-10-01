import { describe, expect, it } from 'vitest';

import {
  calculateBacking,
  calculateBinding,
  calculateBlockCount,
  calculateBorders,
  calculateFabricYardage,
  calculateHst,
  calculateJoinedWofCapacity,
  calculateRepeatedRectangleYardage,
  calculateSashing,
  toMillimetres,
  type FabricSpec,
  type PieceGroup,
} from '../src/lib/domain';

const inches = (value: number) => toMillimetres(value, 'inch');
const eighthYard = toMillimetres(1 / 8, 'yard');

function expectInches(actual: number, expectedInches: number): void {
  expect(actual).toBeCloseTo(inches(expectedInches), 8);
}

function expectSuccess<T extends { ok: boolean }>(
  result: T,
): Extract<T, { ok: true }> {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(JSON.stringify(result));
  return result as Extract<T, { ok: true }>;
}

describe('backing calculator', () => {
  it('implements G09 and compares both seam orientations', () => {
    const result = expectSuccess(
      calculateBacking({
        quiltWidth: inches(60),
        quiltLength: inches(80),
        overagePerSide: inches(4),
        usableBackingWidth: inches(40),
        panelSeamAllowance: inches(0.5),
        directional: false,
        safetyAllowancePercent: 0,
        purchaseIncrement: eighthYard,
      }),
    );

    expectInches(result.requiredWidth, 68);
    expectInches(result.requiredLength, 88);
    expect(
      result.candidates.map(({ seamDirection, panelCount }) => ({
        seamDirection,
        panelCount,
      })),
    ).toEqual([
      { seamDirection: 'vertical', panelCount: 2 },
      { seamDirection: 'horizontal', panelCount: 3 },
    ]);
    expectInches(result.candidates[0]!.coverage, 79);
    expectInches(result.candidates[0]!.rawLength, 176);
    expectInches(result.candidates[0]!.recommendedLength, 180);
    expectInches(result.candidates[1]!.coverage, 118);
    expectInches(result.candidates[1]!.rawLength, 204);
    expectInches(result.candidates[1]!.recommendedLength, 207);
    expect(result.lowestYardage.seamDirection).toBe('vertical');
    expectInches(result.lowestYardage.recommendedLength, 180);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'confirm-longarmer-requirements' }),
    );
  });

  it('implements G23 by disabling the horizontal directional candidate', () => {
    const result = expectSuccess(
      calculateBacking({
        quiltWidth: inches(60),
        quiltLength: inches(80),
        overagePerSide: inches(4),
        usableBackingWidth: inches(40),
        panelSeamAllowance: inches(0.5),
        directional: true,
        safetyAllowancePercent: 0,
        purchaseIncrement: eighthYard,
      }),
    );
    expect(
      result.candidates.map((candidate) => candidate.seamDirection),
    ).toEqual(['vertical']);
    expect(result.lowestYardage.seamDirection).toBe('vertical');
  });

  it('always returns candidates with enough joined-panel coverage', () => {
    for (const usableWidth of [inches(20), inches(40), inches(106)]) {
      const result = expectSuccess(
        calculateBacking({
          quiltWidth: inches(71),
          quiltLength: inches(93),
          overagePerSide: inches(5),
          usableBackingWidth: usableWidth,
          panelSeamAllowance: inches(0.5),
          directional: false,
          safetyAllowancePercent: 3,
          purchaseIncrement: eighthYard,
        }),
      );
      for (const candidate of result.candidates) {
        const required =
          candidate.seamDirection === 'vertical'
            ? result.requiredWidth
            : result.requiredLength;
        expect(candidate.coverage).toBeGreaterThanOrEqual(required);
        expect(candidate.bufferedLength).toBeGreaterThanOrEqual(
          candidate.rawLength,
        );
        expect(candidate.recommendedLength).toBeGreaterThanOrEqual(
          candidate.bufferedLength,
        );
      }
    }
  });
});

describe('binding calculator', () => {
  it('implements G10 with strict upward purchase rounding', () => {
    const result = expectSuccess(
      calculateBinding({
        quiltWidth: inches(60),
        quiltLength: inches(80),
        stripWidth: inches(2.5),
        usableWidth: inches(40),
        joiningAllowance: inches(12),
        safetyAllowancePercent: 0,
        purchaseIncrement: eighthYard,
      }),
    );
    expectInches(result.perimeter, 280);
    expectInches(result.requiredBindingLength, 292);
    expect(result.stripCount).toBe(8);
    expectInches(result.rawFabricLength, 20);
    expectInches(result.recommendedLength, 22.5);
  });
});

describe('HST calculator', () => {
  it('implements G11 two-at-a-time', () => {
    const result = expectSuccess(
      calculateHst({
        finishedSize: inches(4),
        quantity: 10,
        method: 'two-at-a-time',
        sizingMode: 'trim-friendly',
        seamAllowance: inches(0.25),
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        unfinishedSize: inches(4.5),
        standardStartingSquare: inches(4.875),
        trimFriendlyStartingSquare: inches(5),
        selectedStartingSquare: inches(5),
        batches: 5,
        produced: 10,
        excess: 0,
        startingSquaresPerFabric: 5,
        totalStartingSquares: 10,
      }),
    );
  });

  it('implements G12 four-at-a-time with upward quarter-inch rounding', () => {
    const result = expectSuccess(
      calculateHst({
        finishedSize: inches(4),
        quantity: 10,
        method: 'four-at-a-time',
        sizingMode: 'trim-friendly',
        seamAllowance: inches(0.25),
      }),
    );
    expectInches(result.unfinishedSize, 4.5);
    expectInches(result.geometricStartingSquare, 6.863961030678928);
    expectInches(result.standardStartingSquare, 7);
    expectInches(result.trimFriendlyStartingSquare, 7.25);
    expect(result).toEqual(
      expect.objectContaining({
        batches: 3,
        produced: 12,
        excess: 2,
        startingSquaresPerFabric: 3,
        totalStartingSquares: 6,
      }),
    );
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'bias-outer-edges' }),
    );
  });

  it('implements G28 for a 1-inch finished four-at-a-time HST', () => {
    const result = expectSuccess(
      calculateHst({
        finishedSize: inches(1),
        quantity: 4,
        method: 'four-at-a-time',
        sizingMode: 'standard',
        seamAllowance: inches(0.25),
      }),
    );
    expectInches(result.unfinishedSize, 1.5);
    expectInches(result.geometricStartingSquare, 2.621320343559643);
    expectInches(result.standardStartingSquare, 2.75);
    expectInches(result.trimFriendlyStartingSquare, 3);
  });

  it('implements G29 for an 8-inch finished four-at-a-time HST', () => {
    const result = expectSuccess(
      calculateHst({
        finishedSize: inches(8),
        quantity: 4,
        method: 'four-at-a-time',
        sizingMode: 'trim-friendly',
        seamAllowance: inches(0.25),
      }),
    );
    expectInches(result.unfinishedSize, 8.5);
    expectInches(result.geometricStartingSquare, 12.520815280171309);
    expectInches(result.standardStartingSquare, 12.75);
    expectInches(result.trimFriendlyStartingSquare, 13);
  });

  it('implements G13 eight-at-a-time', () => {
    const result = expectSuccess(
      calculateHst({
        finishedSize: inches(4),
        quantity: 10,
        method: 'eight-at-a-time',
        sizingMode: 'trim-friendly',
        seamAllowance: inches(0.25),
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        standardStartingSquare: inches(9.75),
        trimFriendlyStartingSquare: inches(10),
        batches: 2,
        produced: 16,
        excess: 6,
        startingSquaresPerFabric: 2,
        totalStartingSquares: 4,
      }),
    );
  });

  it('never produces fewer HSTs than requested', () => {
    const methods = [
      'two-at-a-time',
      'four-at-a-time',
      'eight-at-a-time',
    ] as const;
    for (const method of methods) {
      for (let quantity = 1; quantity <= 25; quantity += 1) {
        const result = expectSuccess(
          calculateHst({
            finishedSize: inches(3),
            quantity,
            method,
            sizingMode: 'standard',
            seamAllowance: inches(0.25),
          }),
        );
        expect(result.produced).toBeGreaterThanOrEqual(quantity);
        expect(result.excess).toBe(result.produced - quantity);
      }
    }
  });
});

describe('block count calculator', () => {
  it('implements G14 exact whole-block count', () => {
    const result = expectSuccess(
      calculateBlockCount({
        targetWidth: inches(60),
        targetLength: inches(80),
        finishedBlockWidth: inches(10),
        finishedBlockHeight: inches(10),
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        blocksAcross: 6,
        blocksDown: 8,
        totalBlocks: 48,
        actualWidth: inches(60),
        actualLength: inches(80),
        widthDifference: 0,
        lengthDifference: 0,
      }),
    );
  });

  it('implements G15 without partial blocks', () => {
    const result = expectSuccess(
      calculateBlockCount({
        targetWidth: inches(62),
        targetLength: inches(82),
        finishedBlockWidth: inches(10),
        finishedBlockHeight: inches(10),
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        blocksAcross: 7,
        blocksDown: 9,
        totalBlocks: 63,
      }),
    );
    expectInches(result.actualWidth, 70);
    expectInches(result.actualLength, 90);
    expectInches(result.widthDifference, 8);
    expectInches(result.lengthDifference, 8);
  });

  it('models optional between-block sashing explicitly', () => {
    const result = expectSuccess(
      calculateBlockCount({
        targetWidth: inches(46),
        targetLength: inches(58),
        finishedBlockWidth: inches(10),
        finishedBlockHeight: inches(10),
        finishedSashingWidth: inches(2),
      }),
    );
    expect(result.blocksAcross).toBe(4);
    expect(result.blocksDown).toBe(5);
    expectInches(result.actualWidth, 46);
    expectInches(result.actualLength, 58);
  });
});

describe('border calculator', () => {
  it('implements G16 single straight side-first border', () => {
    const result = expectSuccess(
      calculateBorders({
        quiltWidth: inches(60),
        quiltLength: inches(80),
        finishedBorderWidth: inches(2.5),
        layers: 1,
        seamAllowance: inches(0.25),
        usableWidth: inches(40),
        handlingBuffer: inches(10),
        joinSeamAllowance: inches(0.25),
        safetyAllowancePercent: 0,
        purchaseIncrement: eighthYard,
      }),
    );
    expectInches(result.cutBorderWidth, 3);
    expect(result.layerResults).toHaveLength(1);
    expectInches(result.layerResults[0]!.sideBorderFinishedLength, 80);
    expectInches(result.layerResults[0]!.topBottomFinishedLength, 65);
    expectInches(result.layerResults[0]!.nominalStripLength, 290);
    expectInches(result.totalNominalStripLength, 290);
    expectInches(result.requiredJoinedLength, 300);
    expectInches(result.joinLoss, 3.5);
    expect(result.stripCount).toBe(8);
    expectInches(result.rawFabricLength, 24);
    expectInches(result.recommendedLength, 27);
    expectInches(result.finalWidth, 65);
    expectInches(result.finalLength, 85);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'measure-quilt-centre' }),
    );
  });
});

describe('joined WOF capacity', () => {
  it('implements G30 by accounting for seam loss at every join', () => {
    const result = calculateJoinedWofCapacity({
      usableWidth: inches(40),
      requiredLinearLength: inches(79.75),
      handlingBuffer: 0,
      joinSeamAllowance: inches(0.25),
    });
    expect(result.stripCount).toBe(3);
    expectInches(result.effectiveJoinedLength, 119);
  });

  it('returns the smallest adequate joined-strip count', () => {
    for (const usableWidth of [inches(20), inches(40), inches(60)]) {
      for (const requiredLinearLength of [
        inches(1),
        inches(39.75),
        inches(79.75),
        inches(205),
      ]) {
        const input = {
          usableWidth,
          requiredLinearLength,
          handlingBuffer: inches(10),
          joinSeamAllowance: inches(0.25),
        };
        const result = calculateJoinedWofCapacity(input);
        expect(result.effectiveJoinedLength).toBeGreaterThanOrEqual(
          result.requiredJoinedLength,
        );
        if (result.stripCount > 1) {
          const previousEffective =
            (result.stripCount - 1) * usableWidth -
            (result.stripCount - 2) * 2 * input.joinSeamAllowance;
          expect(previousEffective).toBeLessThan(result.requiredJoinedLength);
        }
      }
    }
  });
});

describe('sashing calculator', () => {
  it('implements G17 row-wise sashing without cornerstones', () => {
    const result = expectSuccess(
      calculateSashing({
        columns: 4,
        rows: 5,
        finishedBlockWidth: inches(10),
        finishedBlockHeight: inches(10),
        finishedSashingWidth: inches(2),
        seamAllowance: inches(0.25),
        usableWidth: inches(40),
        handlingBuffer: inches(10),
        joinSeamAllowance: inches(0.25),
        safetyAllowancePercent: 0,
        purchaseIncrement: eighthYard,
      }),
    );
    expectInches(result.cutSashingWidth, 2.5);
    expectInches(result.blockCutHeight, 10.5);
    expect(result.verticalPieceCount).toBe(15);
    expectInches(result.verticalPieceWidth, 2.5);
    expectInches(result.verticalPieceLength, 10.5);
    expectInches(result.finishedRowWidth, 46);
    expectInches(result.horizontalStripCutLength, 46.5);
    expect(result.horizontalStripCount).toBe(4);
    expectInches(result.verticalDemand, 157.5);
    expectInches(result.horizontalDemand, 186);
    expectInches(result.requiredJoinedLength, 353.5);
    expectInches(result.joinLoss, 4);
    expect(result.stripCount).toBe(9);
    expectInches(result.rawFabricLength, 22.5);
    expectInches(result.recommendedLength, 22.5);
    expectInches(result.finishedQuiltWidth, 46);
    expectInches(result.finishedQuiltLength, 58);
    expect(result.horizontalStripsRequirePiecing).toBe(true);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        code: 'horizontal-sashing-requires-piecing',
      }),
    );
  });
});

describe('calculator contracts', () => {
  it('aliases Fabric Yardage to the shared repeated-rectangle engine', () => {
    const fabric: FabricSpec = {
      id: 'fabric',
      name: 'Fabric',
      fabricWidth: inches(42),
      usableWidth: inches(40),
      directional: false,
      defaultRotationAllowed: true,
      safetyAllowancePercent: 5,
      purchaseIncrement: eighthYard,
    };
    const piece: PieceGroup = {
      id: 'piece',
      label: 'Piece',
      quantity: 12,
      width: inches(5),
      height: inches(7),
      dimensionMode: 'cut',
    };
    expect(calculateFabricYardage(fabric, piece, 0)).toEqual(
      calculateRepeatedRectangleYardage(fabric, piece, 0),
    );
  });

  it('returns blocking field errors rather than invalid best-effort results', () => {
    expect(
      calculateBinding({
        quiltWidth: 0,
        quiltLength: inches(80),
        stripWidth: inches(2.5),
        usableWidth: inches(40),
        joiningAllowance: inches(12),
        safetyAllowancePercent: 0,
        purchaseIncrement: eighthYard,
      }),
    ).toEqual({
      ok: false,
      errors: [expect.objectContaining({ field: 'quiltWidth' })],
      warnings: [],
    });
  });

  it('is deterministic for identical calculator inputs', () => {
    const input = {
      quiltWidth: inches(70),
      quiltLength: inches(90),
      finishedBorderWidth: inches(3),
      layers: 2,
      seamAllowance: inches(0.25),
      usableWidth: inches(40),
      handlingBuffer: inches(10),
      joinSeamAllowance: inches(0.25),
      safetyAllowancePercent: 5,
      purchaseIncrement: eighthYard,
    };
    expect(calculateBorders(input)).toEqual(calculateBorders(input));
  });
});
