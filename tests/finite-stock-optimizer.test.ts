import { describe, expect, it } from 'vitest';

import {
  allocateFiniteStock,
  generateFiniteStockCandidates,
  normalizePieceGroups,
  toMillimetres,
  type FabricSpec,
  type FiniteStockAllocationSuccess,
  type NormalizedPieceGroup,
  type PieceGroup,
  type StockPiece,
} from '../src/lib/domain';

function inches(value: number): number {
  return toMillimetres(value, 'inch');
}

function makeFabric(overrides: Partial<FabricSpec> = {}): FabricSpec {
  return {
    id: 'fabric-a',
    name: 'Fabric A',
    fabricWidth: inches(42),
    usableWidth: inches(40),
    directional: false,
    defaultRotationAllowed: true,
    safetyAllowancePercent: 0,
    purchaseIncrement: inches(4.5),
    ...overrides,
  };
}

function makeStock(overrides: Partial<StockPiece> = {}): StockPiece {
  return {
    id: 'stock-a',
    fabricId: 'fabric-a',
    label: 'Stock A',
    width: inches(20),
    length: inches(20),
    quantity: 1,
    sourceType: 'custom',
    ...overrides,
  };
}

function makePiece(overrides: Partial<PieceGroup> = {}): PieceGroup {
  return {
    id: 'piece-a',
    label: 'Piece A',
    quantity: 1,
    width: inches(10),
    height: inches(10),
    dimensionMode: 'cut',
    rotationAllowed: false,
    ...overrides,
  };
}

function normalize(
  fabric: FabricSpec,
  pieces: readonly PieceGroup[],
): NormalizedPieceGroup[] {
  return normalizePieceGroups(fabric, pieces, 0);
}

function expectSuccess(
  result: ReturnType<typeof allocateFiniteStock>,
): FiniteStockAllocationSuccess {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result;
}

function expectValidGeometry(
  result: FiniteStockAllocationSuccess,
  pieces: readonly NormalizedPieceGroup[],
): void {
  const requested = new Set(
    pieces.flatMap((piece) =>
      Array.from(
        { length: piece.quantity },
        (_, index) => `${piece.id}:${index}`,
      ),
    ),
  );
  const accounted = [
    ...result.placements.map(
      (placement) => `${placement.pieceGroupId}:${placement.instanceIndex}`,
    ),
    ...result.unallocated.map(
      (piece) => `${piece.pieceGroupId}:${piece.instanceIndex}`,
    ),
  ];
  expect(new Set(accounted)).toEqual(requested);
  expect(accounted).toHaveLength(requested.size);

  for (const binResult of result.bins) {
    for (const placement of binResult.placements) {
      expect(placement.materialBinId).toBe(binResult.bin.id);
      expect(placement.stockPieceId).toBe(binResult.bin.stockPieceId);
      expect(placement.fabricId).toBe(binResult.bin.fabricId);
      expect(placement.x).toBeGreaterThanOrEqual(0);
      expect(placement.y).toBeGreaterThanOrEqual(0);
      expect(placement.x + placement.width).toBeLessThanOrEqual(
        binResult.bin.width,
      );
      expect(placement.y + placement.height).toBeLessThanOrEqual(
        binResult.bin.length,
      );
    }
    for (
      let leftIndex = 0;
      leftIndex < binResult.placements.length;
      leftIndex += 1
    ) {
      const left = binResult.placements[leftIndex]!;
      for (
        let rightIndex = leftIndex + 1;
        rightIndex < binResult.placements.length;
        rightIndex += 1
      ) {
        const right = binResult.placements[rightIndex]!;
        expect(
          left.x < right.x + right.width &&
            left.x + left.width > right.x &&
            left.y < right.y + right.height &&
            left.y + left.height > right.y,
        ).toBe(false);
      }
    }
  }
}

describe('finite-stock V1.1 golden fixtures', () => {
  it('implements G31: exact stock coverage keeps purchase at zero', () => {
    const fabric = makeFabric({ safetyAllowancePercent: 5 });
    const pieces = normalize(fabric, [makePiece({ quantity: 4 })]);
    const result = expectSuccess(
      allocateFiniteStock(fabric, [makeStock()], pieces),
    );

    expect(result.fullyAllocated).toBe(true);
    expect(result.placements).toHaveLength(4);
    expect(result.unallocated).toEqual([]);
    expect(result.rawAdditionalPurchase).toBe(0);
    expect(result.bufferedPurchase).toBe(0);
    expect(result.recommendedPurchase).toBe(0);
    expectValidGeometry(result, pieces);
  });

  it('implements G34: multiple physical bins retain their identities', () => {
    const fabric = makeFabric();
    const stock = [
      makeStock({ id: 'stock-a', width: inches(10), length: inches(10) }),
      makeStock({
        id: 'stock-b',
        label: 'Stock B',
        width: inches(10),
        length: inches(10),
      }),
    ];
    const pieces = normalize(fabric, [makePiece({ quantity: 2 })]);
    const result = expectSuccess(allocateFiniteStock(fabric, stock, pieces));

    expect(
      result.placements.map((placement) => placement.materialBinId),
    ).toEqual(['stock-a', 'stock-b']);
    expect(result.bins.map((bin) => bin.bin.id)).toEqual([
      'stock-a',
      'stock-b',
    ]);
    expectValidGeometry(result, pieces);
  });

  it('implements G35: equal area cannot overcome forbidden rotation', () => {
    const fabric = makeFabric();
    const stock = [makeStock({ width: inches(10), length: inches(20) })];
    const fixed = normalize(fabric, [
      makePiece({ width: inches(20), height: inches(10) }),
    ]);
    const blocked = expectSuccess(allocateFiniteStock(fabric, stock, fixed));

    expect(blocked.fullyAllocated).toBe(false);
    expect(blocked.placements).toEqual([]);
    expect(blocked.unallocated).toEqual([
      expect.objectContaining({ pieceGroupId: 'piece-a', instanceIndex: 0 }),
    ]);
    expect(blocked.rawAdditionalPurchase).toBeNull();

    const rotatable = normalize(fabric, [
      makePiece({
        width: inches(20),
        height: inches(10),
        rotationAllowed: true,
      }),
    ]);
    const fitted = expectSuccess(allocateFiniteStock(fabric, stock, rotatable));
    expect(fitted.fullyAllocated).toBe(true);
    expect(fitted.placements[0]).toEqual(
      expect.objectContaining({
        rotated: true,
        width: inches(10),
        height: inches(20),
      }),
    );
  });

  it('implements G36: a WOF strip cannot rotate into narrow stock', () => {
    const fabric = makeFabric();
    const pieces = normalize(fabric, [
      makePiece({
        id: 'wof-strip',
        width: inches(2.5),
        height: inches(2.5),
        rotationAllowed: true,
        isWofStrip: true,
      }),
    ]);
    const result = expectSuccess(
      allocateFiniteStock(
        fabric,
        [makeStock({ width: inches(20), length: inches(40) })],
        pieces,
      ),
    );

    expect(pieces[0]).toEqual(
      expect.objectContaining({
        width: fabric.usableWidth,
        rotationAllowed: false,
        isWofStrip: true,
      }),
    );
    expect(result.fullyAllocated).toBe(false);
    expect(result.placements).toEqual([]);
    expect(result.unallocated).toHaveLength(1);
  });

  it('implements G39: edited preset geometry is authoritative', () => {
    const fabric = makeFabric();
    const stock = [
      makeStock({
        sourceType: 'preset',
        presetId: 'fat-quarter',
        width: inches(18),
        length: inches(20),
      }),
    ];
    const pieces = normalize(fabric, [
      makePiece({ width: inches(18), height: inches(21) }),
    ]);
    const result = expectSuccess(allocateFiniteStock(fabric, stock, pieces));

    expect(result.bins[0]!.bin).toEqual(
      expect.objectContaining({
        presetId: 'fat-quarter',
        width: inches(18),
        length: inches(20),
      }),
    );
    expect(result.fullyAllocated).toBe(false);
  });

  it('implements G40: safety changes guidance, never exact-stock geometry', () => {
    const fabric = makeFabric({ safetyAllowancePercent: 10 });
    const stock = [makeStock({ width: inches(10), length: inches(10) })];
    const pieces = normalize(fabric, [makePiece()]);
    const result = expectSuccess(allocateFiniteStock(fabric, stock, pieces));

    expect(result.recommendedPurchase).toBe(0);
    expect(result.bins[0]!.bin).toEqual(
      expect.objectContaining({ width: inches(10), length: inches(10) }),
    );
    expect(result.warnings).toContainEqual({
      code: 'stock-safety-not-applied',
      message: expect.stringContaining('only to new purchases'),
    });
  });
});

describe('finite-stock invariants and bounded candidates', () => {
  it('accounts for every instance exactly once without fabric mixing', () => {
    const fabric = makeFabric();
    const stock = [
      makeStock({ id: 'small', width: inches(10), length: inches(14) }),
      makeStock({
        id: 'large',
        width: inches(20),
        length: inches(20),
        quantity: 2,
      }),
    ];
    const pieces = normalize(fabric, [
      makePiece({
        id: 'fixed',
        quantity: 5,
        width: inches(8),
        height: inches(7),
      }),
      makePiece({
        id: 'rotatable',
        quantity: 3,
        width: inches(12),
        height: inches(6),
        rotationAllowed: true,
      }),
    ]);
    const result = expectSuccess(allocateFiniteStock(fabric, stock, pieces));

    expect(result.bins.map((bin) => bin.bin.id)).toEqual([
      'small',
      'large#1',
      'large#2',
    ]);
    expect(
      result.placements.every((placement) => placement.fabricId === fabric.id),
    ).toBe(true);
    expectValidGeometry(result, pieces);
  });

  it('returns the exact unmet instances and no purchased-bin placement', () => {
    const fabric = makeFabric({ safetyAllowancePercent: 25 });
    const pieces = normalize(fabric, [makePiece({ quantity: 3 })]);
    const result = expectSuccess(
      allocateFiniteStock(
        fabric,
        [makeStock({ width: inches(10), length: inches(10) })],
        pieces,
      ),
    );

    expect(result.placements).toHaveLength(1);
    expect(result.unallocated.map((piece) => piece.instanceIndex)).toEqual([
      1, 2,
    ]);
    expect(result.rawAdditionalPurchase).toBeNull();
    expect(result.bufferedPurchase).toBeNull();
    expect(result.recommendedPurchase).toBeNull();
    expect(
      result.placements.every(
        (placement) => placement.materialBinId !== 'purchase',
      ),
    ).toBe(true);
    expectValidGeometry(result, pieces);
  });

  it('generates bounded alternative assignment strategies', () => {
    const fabric = makeFabric();
    const pieces = normalize(fabric, [makePiece({ quantity: 2 })]);
    const generated = generateFiniteStockCandidates(
      fabric,
      [makeStock()],
      pieces,
    );

    expect(generated).toHaveLength(30);
    expect(generated).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          strategy: expect.objectContaining({ bin: 'smallest-useful-fit' }),
        }),
        expect.objectContaining({
          strategy: expect.objectContaining({ bin: 'largest-first' }),
        }),
        expect.objectContaining({
          strategy: expect.objectContaining({ bin: 'preserve-wof-capable' }),
        }),
      ]),
    );
  });

  it('is deterministic across candidate selection and leftover reporting', () => {
    const fabric = makeFabric();
    const stock = [
      makeStock({ id: 'a', width: inches(18), length: inches(21) }),
      makeStock({ id: 'b', width: inches(12), length: inches(16) }),
    ];
    const pieces = normalize(fabric, [
      makePiece({
        id: 'one',
        quantity: 3,
        width: inches(7),
        height: inches(5),
      }),
      makePiece({
        id: 'two',
        quantity: 2,
        width: inches(11),
        height: inches(4),
        rotationAllowed: true,
      }),
    ]);
    const first = allocateFiniteStock(fabric, stock, pieces);
    for (let run = 0; run < 10; run += 1) {
      expect(allocateFiniteStock(fabric, stock, pieces)).toEqual(first);
    }
  });

  it('uses and discloses the bounded fallback above the full-strategy threshold', () => {
    const fabric = makeFabric();
    const pieces = normalize(fabric, [
      makePiece({ quantity: 401, width: inches(1), height: inches(1) }),
    ]);
    const result = expectSuccess(
      allocateFiniteStock(
        fabric,
        [makeStock({ width: inches(20), length: inches(21) })],
        pieces,
      ),
    );
    const candidates = generateFiniteStockCandidates(
      fabric,
      [makeStock({ width: inches(20), length: inches(21) })],
      pieces,
    );

    expect(candidates).toHaveLength(6);
    expect(result.fullyAllocated).toBe(true);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'performance-fallback' }),
    );
    expectValidGeometry(result, pieces);
  });

  it('rejects invalid stock identity and caps large work', () => {
    const fabric = makeFabric();
    const pieces = normalize(fabric, [makePiece()]);
    expect(
      allocateFiniteStock(
        fabric,
        [makeStock({ fabricId: 'fabric-b' })],
        pieces,
      ),
    ).toEqual({
      ok: false,
      errors: [expect.objectContaining({ code: 'stock-fabric-mismatch' })],
      warnings: [],
    });

    expect(
      allocateFiniteStock(fabric, [makeStock()], pieces, {
        limits: { maximumPlacementCount: 0 },
      }),
    ).toEqual({
      ok: false,
      errors: [expect.objectContaining({ code: 'performance-limit' })],
      warnings: [],
    });
  });
});
