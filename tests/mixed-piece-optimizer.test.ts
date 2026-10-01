import { describe, expect, it } from 'vitest';

import {
  normalizePieceGroups,
  optimizeFabric,
  toMillimetres,
  type FabricOptimizationSuccess,
  type FabricSpec,
  type PieceGroup,
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

function makePiece(overrides: Partial<PieceGroup>): PieceGroup {
  return {
    id: 'piece-a',
    label: 'Piece A',
    quantity: 1,
    width: toMillimetres(10, 'inch'),
    height: toMillimetres(10, 'inch'),
    dimensionMode: 'cut',
    ...overrides,
  };
}

function optimize(
  pieces: PieceGroup[],
  fabric = makeFabric(),
  options?: Parameters<typeof optimizeFabric>[2],
) {
  return optimizeFabric(
    fabric,
    normalizePieceGroups(fabric, pieces, 0),
    options,
  );
}

function expectSuccess(
  result: ReturnType<typeof optimizeFabric>,
): FabricOptimizationSuccess {
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(`Expected success: ${JSON.stringify(result.errors)}`);
  }
  return result;
}

function expectValidPlacements(
  result: FabricOptimizationSuccess,
  fabric: FabricSpec,
  pieces: readonly PieceGroup[],
): void {
  expect(result.placements).toHaveLength(
    pieces.reduce((total, piece) => total + piece.quantity, 0),
  );

  for (const piece of pieces) {
    const placements = result.placements.filter(
      (placement) => placement.pieceGroupId === piece.id,
    );
    expect(placements).toHaveLength(piece.quantity);
    expect(
      new Set(placements.map((placement) => placement.instanceIndex)).size,
    ).toBe(piece.quantity);
    if (piece.rotationAllowed === false) {
      expect(placements.every((placement) => !placement.rotated)).toBe(true);
    }
  }

  for (const placement of result.placements) {
    expect(placement.x).toBeGreaterThanOrEqual(0);
    expect(placement.y).toBeGreaterThanOrEqual(0);
    expect(placement.x + placement.width).toBeLessThanOrEqual(
      fabric.usableWidth,
    );
    expect(placement.y + placement.height).toBeLessThanOrEqual(
      result.usedLength,
    );
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
      const overlaps =
        left.x < right.x + right.width &&
        left.x + left.width > right.x &&
        left.y < right.y + right.height &&
        left.y + left.height > right.y;
      expect(overlaps).toBe(false);
    }
  }
}

describe('multi-piece optimizer golden fixtures', () => {
  it('implements G05 by filling each 30-inch row remainder', () => {
    const pieces = [
      makePiece({
        id: 'a',
        label: 'A',
        quantity: 2,
        width: toMillimetres(30, 'inch'),
        rotationAllowed: false,
      }),
      makePiece({ id: 'b', label: 'B', quantity: 2, rotationAllowed: false }),
    ];
    const result = expectSuccess(optimize(pieces));

    expect(result.usedLength).toBe(toMillimetres(20, 'inch'));
    expect(result.rows).toHaveLength(2);
    expect(result.rows.every((row) => row.placementCount === 2)).toBe(true);
    expectValidPlacements(result, makeFabric(), pieces);
  });

  it('implements G18 with one A and two B pieces in each row', () => {
    const pieces = [
      makePiece({
        id: 'a',
        label: 'A',
        quantity: 2,
        width: toMillimetres(20, 'inch'),
        rotationAllowed: false,
      }),
      makePiece({ id: 'b', label: 'B', quantity: 4, rotationAllowed: false }),
    ];
    const result = expectSuccess(optimize(pieces));

    expect(result.usedLength).toBe(toMillimetres(20, 'inch'));
    expect(result.rows.map((row) => row.placementCount)).toEqual([3, 3]);
    expectValidPlacements(result, makeFabric(), pieces);
  });

  it('implements G25 deterministic selection and stable strategy tie-breaks', () => {
    const pieces = [
      makePiece({ id: 'a', label: 'A', quantity: 4 }),
      makePiece({ id: 'b', label: 'B', quantity: 4 }),
    ];
    const options = {
      scoreWeights: {
        usedLength: 0,
        waste: 0,
        cutComplexity: 0,
        fragmentation: 0,
      },
    };
    const first = expectSuccess(optimize(pieces, makeFabric(), options));

    expect(first.candidateScore).toBe(0);
    expect(first.strategy).toBe('constrained-first');
    for (let run = 0; run < 10; run += 1) {
      expect(optimize(pieces, makeFabric(), options)).toEqual(first);
    }
  });

  it('implements G26 with the bounded grouped fallback', () => {
    const pieces = [
      makePiece({
        id: 'small-square',
        label: 'Small square',
        quantity: 500,
        width: toMillimetres(2.5, 'inch'),
        height: toMillimetres(2.5, 'inch'),
      }),
    ];
    const result = expectSuccess(optimize(pieces));

    expect(result.placements).toHaveLength(500);
    expect(result.usedLength).toBe(toMillimetres(80, 'inch'));
    expect(result.strategy).toBe('strip-friendly-first');
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'performance-fallback' }),
    );
    expectValidPlacements(result, makeFabric(), pieces);
  });
});

describe('multi-piece optimizer invariants', () => {
  it('enforces crosswise and lengthwise orientation constraints', () => {
    const selectedFabric = makeFabric();
    const crosswise = makePiece({
      id: 'oriented',
      quantity: 2,
      width: toMillimetres(30, 'inch'),
      height: toMillimetres(10, 'inch'),
      rotationAllowed: true,
      orientationConstraint: 'crosswise',
    });
    const lengthwise = {
      ...crosswise,
      orientationConstraint: 'lengthwise' as const,
    };

    const crosswiseResult = expectSuccess(optimize([crosswise]));
    const lengthwiseResult = expectSuccess(optimize([lengthwise]));
    expect(crosswiseResult.placements.every((item) => !item.rotated)).toBe(
      true,
    );
    expect(crosswiseResult.usedLength).toBe(toMillimetres(20, 'inch'));
    expect(lengthwiseResult.placements.every((item) => item.rotated)).toBe(
      true,
    );
    expect(lengthwiseResult.usedLength).toBe(toMillimetres(30, 'inch'));

    const blocked = optimizeFabric(
      selectedFabric,
      normalizePieceGroups(
        selectedFabric,
        [{ ...lengthwise, rotationAllowed: false }],
        0,
      ),
    );
    expect(blocked).toEqual({
      ok: false,
      errors: [expect.objectContaining({ code: 'piece-does-not-fit' })],
      warnings: [],
    });
  });

  it('resolves WOF strip width from usable fabric width', () => {
    const selectedFabric = makeFabric();
    const input = makePiece({
      id: 'wof',
      quantity: 2,
      width: toMillimetres(5, 'inch'),
      height: toMillimetres(2.5, 'inch'),
      rotationAllowed: true,
      isWofStrip: true,
    });
    const normalized = normalizePieceGroups(selectedFabric, [input], 0);
    const result = expectSuccess(optimizeFabric(selectedFabric, normalized));

    expect(normalized[0]).toEqual(
      expect.objectContaining({
        width: selectedFabric.usableWidth,
        height: toMillimetres(2.5, 'inch'),
        rotationAllowed: false,
        orientationConstraint: 'none',
        isWofStrip: true,
      }),
    );
    expect(result.usedLength).toBe(toMillimetres(5, 'inch'));
    expect(
      result.placements.every(
        (placement) =>
          placement.x === 0 &&
          placement.width === selectedFabric.usableWidth &&
          !placement.rotated,
      ),
    ).toBe(true);
  });

  it('places mixed legal orientations exactly once without overlap', () => {
    const pieces = [
      makePiece({
        id: 'wide',
        label: 'Wide',
        quantity: 3,
        width: toMillimetres(25, 'inch'),
        height: toMillimetres(7, 'inch'),
      }),
      makePiece({
        id: 'fixed',
        label: 'Fixed',
        quantity: 7,
        width: toMillimetres(6, 'inch'),
        height: toMillimetres(4, 'inch'),
        rotationAllowed: false,
      }),
      makePiece({
        id: 'tall',
        label: 'Tall',
        quantity: 2,
        width: toMillimetres(43, 'inch'),
        height: toMillimetres(5, 'inch'),
        rotationAllowed: true,
      }),
    ];
    const fabric = makeFabric();
    const result = expectSuccess(optimize(pieces, fabric));

    expectValidPlacements(result, fabric, pieces);
    expect(result.bufferedLength).toBeGreaterThanOrEqual(result.usedLength);
    expect(result.recommendedLength).toBeGreaterThanOrEqual(
      result.bufferedLength,
    );
  });

  it('blocks impossible and structurally invalid optimizer input', () => {
    const impossible = optimize([
      makePiece({
        width: toMillimetres(41, 'inch'),
        height: toMillimetres(5, 'inch'),
        rotationAllowed: false,
      }),
    ]);
    expect(impossible).toEqual({
      ok: false,
      errors: [expect.objectContaining({ code: 'piece-does-not-fit' })],
      warnings: [],
    });

    const fabric = makeFabric();
    expect(optimizeFabric(fabric, [])).toEqual({
      ok: false,
      errors: [expect.objectContaining({ code: 'no-pieces' })],
      warnings: [],
    });
  });
});
