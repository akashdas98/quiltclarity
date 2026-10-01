import { describe, expect, it } from 'vitest';

import {
  freshFabricScenario,
  generateReconciliationCandidates,
  normalizePieceGroups,
  planProject,
  reconcileFabric,
  reconcileProject,
  PLANNER_PROJECT_SCHEMA_VERSION,
  toMillimetres,
  type CutRequirement,
  type FabricPlan,
  type FabricReconciliationSuccess,
  type FabricSpec,
  type NormalizedPieceGroup,
  type PieceGroup,
  type PlannerProject,
  type ReconciledProjectSuccess,
  type StockPiece,
} from '../src/lib/domain';

const inches = (value: number): number => toMillimetres(value, 'inch');

function fabric(overrides: Partial<FabricPlan> = {}): FabricPlan {
  return {
    id: 'fabric-a',
    name: 'Fabric A',
    fabricWidth: inches(42),
    usableWidth: inches(40),
    directional: false,
    defaultRotationAllowed: true,
    safetyAllowancePercent: 0,
    purchaseIncrement: inches(4.5),
    stockPieces: [],
    ...overrides,
  };
}

function stock(overrides: Partial<StockPiece> = {}): StockPiece {
  return {
    id: 'stock-a',
    fabricId: 'fabric-a',
    label: 'Stock A',
    width: inches(20),
    length: inches(10),
    quantity: 1,
    sourceType: 'custom',
    ...overrides,
  };
}

function piece(overrides: Partial<PieceGroup> = {}): PieceGroup {
  return {
    id: 'piece-a',
    label: 'Piece A',
    quantity: 4,
    width: inches(10),
    height: inches(10),
    dimensionMode: 'cut',
    rotationAllowed: false,
    ...overrides,
  };
}

function requirement(
  fabricId: string,
  overrides: Partial<PieceGroup> = {},
): CutRequirement {
  const source = piece(overrides);
  return {
    ...source,
    fabricId,
    orientation: source.orientationConstraint ?? 'none',
    isWofStrip: source.isWofStrip ?? false,
  };
}

function project(
  selectedFabric: FabricPlan,
  requirements: CutRequirement[] = [requirement(selectedFabric.id)],
): PlannerProject {
  return {
    id: 'project-a',
    schemaVersion: PLANNER_PROJECT_SCHEMA_VERSION,
    unitSystem: 'imperial',
    defaultSeamAllowance: 0,
    fabrics: [selectedFabric],
    cutRequirements: requirements,
  };
}

function normalized(
  selectedFabric: FabricSpec,
  pieces: readonly PieceGroup[],
): NormalizedPieceGroup[] {
  return normalizePieceGroups(selectedFabric, pieces, 0);
}

function expectFabricSuccess(
  result: ReturnType<typeof reconcileFabric>,
): FabricReconciliationSuccess {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result;
}

function expectProjectSuccess(
  result: ReturnType<typeof reconcileProject>,
): ReconciledProjectSuccess {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result;
}

function accountedInstances(result: FabricReconciliationSuccess): string[] {
  return result.placements.map(
    (placement) => `${placement.pieceGroupId}:${placement.instanceIndex}`,
  );
}

describe('V1.1 purchase-shortfall golden fixtures', () => {
  it('implements G32 with a precise stock shortfall and upward purchase rounding', () => {
    const selectedFabric = fabric({ stockPieces: [stock()] });
    const result = expectProjectSuccess(
      reconcileProject(project(selectedFabric)),
    );
    const planned = result.fabrics[0]!.reconciliation;

    expect(planned.stockPlacements).toHaveLength(2);
    expect(planned.purchasedBolt?.placements).toHaveLength(2);
    expect(planned.rawAdditionalPurchase).toBe(inches(10));
    expect(planned.bufferedPurchase).toBe(inches(10));
    expect(planned.recommendedPurchase).toBe(inches(13.5));
    expect(planned.purchasedBolt?.bin).toEqual({
      id: 'purchase:fabric-a',
      fabricId: 'fabric-a',
      width: inches(40),
      layoutLength: inches(10),
    });
    expect(result.summary.status).toBe('additional-purchase-required');
    expect(result.summary.totalRecommendedPurchase).toBe(inches(13.5));
    expect(new Set(accountedInstances(planned))).toEqual(
      new Set(['piece-a:0', 'piece-a:1', 'piece-a:2', 'piece-a:3']),
    );
  });

  it('implements G33 by applying safety only to purchased bolt length', () => {
    const selectedFabric = fabric({
      safetyAllowancePercent: 10,
      stockPieces: [stock()],
    });
    const result = expectProjectSuccess(
      reconcileProject(project(selectedFabric)),
    ).fabrics[0]!.reconciliation;

    expect(result.stockBins[0]!.bin).toEqual(
      expect.objectContaining({ width: inches(20), length: inches(10) }),
    );
    expect(result.rawAdditionalPurchase).toBe(inches(10));
    expect(result.bufferedPurchase).toBeCloseTo(inches(11));
    expect(result.recommendedPurchase).toBe(inches(13.5));
  });
});

describe('V1.1 pattern-comparison golden fixtures', () => {
  it('implements G37 with a fresh scenario independent of full stock coverage', () => {
    const selectedFabric = fabric({
      patternStatedAmount: inches(36),
      stockPieces: [stock({ width: inches(20), length: inches(20) })],
    });
    const result = expectProjectSuccess(
      reconcileProject(project(selectedFabric)),
    );
    const planned = result.fabrics[0]!;

    expect(planned.reconciliation.recommendedPurchase).toBe(0);
    expect(planned.reconciliation.purchasedBolt).toBeNull();
    expect(planned.freshFabricScenario.rawLength).toBe(inches(10));
    expect(planned.freshFabricScenario.recommendedLength).toBe(inches(13.5));
    expect(planned.patternComparison).toEqual(
      expect.objectContaining({
        patternStatedAmount: inches(36),
        freshPlanRawLength: inches(10),
        freshPlanRecommendedLength: inches(13.5),
        deltaFromRecommended: inches(22.5),
        outcome: 'pattern_more_than_plan',
      }),
    );
    expect(planned.patternComparison?.explanation).toContain(
      'do not by themselves indicate a pattern error',
    );
  });

  it('implements G38 with an explicit non-like-for-like WOF warning', () => {
    const selectedFabric = fabric({
      patternStatedAmount: inches(36),
      patternAssumedUsableWidth: inches(44),
      stockPieces: [stock({ width: inches(20), length: inches(20) })],
    });
    const comparison = expectProjectSuccess(
      reconcileProject(project(selectedFabric)),
    ).fabrics[0]!.patternComparison;

    expect(comparison?.warnings).toEqual([
      {
        code: 'pattern-wof-mismatch',
        message: expect.stringContaining('not like-for-like'),
      },
    ]);
    expect(comparison?.currentUsableWidth).toBe(inches(40));
    expect(comparison?.patternAssumedUsableWidth).toBe(inches(44));
  });
});

describe('reconciliation and comparison properties', () => {
  it('selects lower raw purchase before stock fragmentation or waste', () => {
    const selectedFabric = fabric();
    const pieces = normalized(selectedFabric, [
      piece({
        id: 'large',
        quantity: 1,
        width: inches(20),
        height: inches(20),
      }),
      piece({ id: 'small', quantity: 4 }),
    ]);
    const selectedStock = [stock({ width: inches(20), length: inches(20) })];
    const candidates = generateReconciliationCandidates(
      selectedFabric,
      selectedStock,
      pieces,
    );
    expect(candidates[0]).not.toHaveProperty('code');
    const rawLengths = candidates.map((candidate) =>
      'code' in candidate
        ? Number.POSITIVE_INFINITY
        : candidate.rawAdditionalPurchase,
    );
    const result = expectFabricSuccess(
      reconcileFabric(selectedFabric, selectedStock, pieces),
    );

    expect(new Set(rawLengths)).toEqual(new Set([inches(10), inches(20)]));
    expect(result.rawAdditionalPurchase).toBe(Math.min(...rawLengths));
    expect(result.stockPlacements).toEqual([
      expect.objectContaining({ pieceGroupId: 'large' }),
    ]);
  });

  it('keeps stock-only unmet results exact when purchase is disabled', () => {
    const selectedFabric = fabric();
    const pieces = normalized(selectedFabric, [piece()]);
    const result = expectFabricSuccess(
      reconcileFabric(selectedFabric, [stock()], pieces, {
        purchaseEnabled: false,
      }),
    );

    expect(result.fullyAllocated).toBe(false);
    expect(result.purchasedBolt).toBeNull();
    expect(result.rawAdditionalPurchase).toBeNull();
    expect(result.placements).toHaveLength(2);
    expect(result.unallocated.map((item) => item.instanceIndex)).toEqual([
      2, 3,
    ]);
  });

  it('reproduces fresh-bolt behavior when no stock is supplied', () => {
    const selectedFabric = fabric({ safetyAllowancePercent: 5 });
    const pieces = normalized(selectedFabric, [piece({ quantity: 7 })]);
    const input = project(selectedFabric, [
      requirement('fabric-a', { quantity: 7 }),
    ]);
    const fresh = freshFabricScenario(selectedFabric, pieces);
    const reconciled = expectFabricSuccess(
      reconcileFabric(selectedFabric, [], pieces),
    );
    const priorProjectPlan = planProject(input);

    expect(fresh.ok).toBe(true);
    if (!fresh.ok) throw new Error(JSON.stringify(fresh.errors));
    expect(priorProjectPlan.ok).toBe(true);
    if (!priorProjectPlan.ok)
      throw new Error(JSON.stringify(priorProjectPlan.errors));
    expect(reconciled.stockPlacements).toEqual([]);
    expect(reconciled.rawAdditionalPurchase).toBe(fresh.rawLength);
    expect(reconciled.bufferedPurchase).toBe(fresh.bufferedLength);
    expect(reconciled.recommendedPurchase).toBe(fresh.recommendedLength);
    expect(reconciled.purchasedBolt?.placements).toEqual(
      fresh.optimization.placements.map((placement) => ({
        ...placement,
        materialBinId: 'purchase:fabric-a',
        fabricId: 'fabric-a',
      })),
    );
    expect(fresh.optimization).toEqual(
      priorProjectPlan.fabrics[0]!.optimization,
    );
  });

  it('keeps the fresh pattern basis unchanged when stock changes', () => {
    const withoutStock = fabric({ patternStatedAmount: inches(36) });
    const withStock = fabric({
      patternStatedAmount: inches(36),
      stockPieces: [stock({ width: inches(20), length: inches(20) })],
    });
    const first = expectProjectSuccess(reconcileProject(project(withoutStock)));
    const second = expectProjectSuccess(reconcileProject(project(withStock)));

    expect(second.fabrics[0]!.freshFabricScenario).toEqual(
      first.fabrics[0]!.freshFabricScenario,
    );
    expect(second.fabrics[0]!.patternComparison).toEqual(
      first.fabrics[0]!.patternComparison,
    );
    expect(first.shoppingList[0]!.recommendedPurchase).toBeGreaterThan(0);
    expect(second.shoppingList[0]!.recommendedPurchase).toBe(0);
  });

  it('is deterministic and keeps every purchased placement in bounds', () => {
    const selectedFabric = fabric({
      stockPieces: [stock({ width: inches(20), length: inches(15) })],
    });
    const input = project(selectedFabric, [
      requirement('fabric-a', { id: 'a', quantity: 5, width: inches(12) }),
      requirement('fabric-a', {
        id: 'b',
        quantity: 7,
        width: inches(7),
        height: inches(4),
        rotationAllowed: true,
      }),
    ]);
    const first = expectProjectSuccess(reconcileProject(input));
    const second = expectProjectSuccess(reconcileProject(input));
    const reconciliation = first.fabrics[0]!.reconciliation;

    expect(first).toEqual(second);
    expect(new Set(accountedInstances(reconciliation)).size).toBe(12);
    for (const placement of reconciliation.purchasedBolt?.placements ?? []) {
      expect(placement.x).toBeGreaterThanOrEqual(0);
      expect(placement.y).toBeGreaterThanOrEqual(0);
      expect(placement.x + placement.width).toBeLessThanOrEqual(inches(40));
      expect(placement.y + placement.height).toBeLessThanOrEqual(
        reconciliation.rawAdditionalPurchase!,
      );
    }
    expect(reconciliation.recommendedPurchase!).toBeGreaterThanOrEqual(
      reconciliation.bufferedPurchase!,
    );
    expect(reconciliation.bufferedPurchase!).toBeGreaterThanOrEqual(
      reconciliation.rawAdditionalPurchase!,
    );
  });

  it('keeps stock, purchase, and pattern state isolated per fabric', () => {
    const fabricA = fabric({
      id: 'a',
      name: 'Fabric A',
      patternStatedAmount: inches(36),
      stockPieces: [
        stock({
          id: 'a-stock',
          fabricId: 'a',
          width: inches(20),
          length: inches(20),
        }),
      ],
    });
    const fabricB = fabric({
      id: 'b',
      name: 'Fabric B',
      patternStatedAmount: undefined,
      stockPieces: [],
    });
    const input: PlannerProject = {
      id: 'multi',
      schemaVersion: PLANNER_PROJECT_SCHEMA_VERSION,
      unitSystem: 'imperial',
      defaultSeamAllowance: 0,
      fabrics: [fabricA, fabricB],
      cutRequirements: [
        requirement('a', { id: 'a-piece' }),
        requirement('b', { id: 'b-piece', quantity: 2 }),
      ],
    };
    const result = expectProjectSuccess(reconcileProject(input));

    expect(result.fabrics[0]!.reconciliation.placements).toHaveLength(4);
    expect(
      result.fabrics[0]!.reconciliation.placements.every(
        (placement) => placement.fabricId === 'a',
      ),
    ).toBe(true);
    expect(result.fabrics[0]!.reconciliation.recommendedPurchase).toBe(0);
    expect(result.fabrics[0]!.patternComparison).not.toBeNull();
    expect(
      result.fabrics[1]!.reconciliation.placements.every(
        (placement) => placement.fabricId === 'b',
      ),
    ).toBe(true);
    expect(
      result.fabrics[1]!.reconciliation.recommendedPurchase,
    ).toBeGreaterThan(0);
    expect(result.fabrics[1]!.patternComparison).toBeNull();
    expect(result.summary).toEqual(
      expect.objectContaining({
        fabricCount: 2,
        pieceCount: 6,
        stockPlacementCount: 4,
        purchasedPlacementCount: 2,
      }),
    );
  });

  it('blocks invalid pattern values with fabric-scoped errors', () => {
    const selectedFabric = fabric({ patternStatedAmount: 0 });
    expect(reconcileProject(project(selectedFabric))).toEqual({
      ok: false,
      errors: [
        expect.objectContaining({
          code: 'not-positive',
          field: 'patternStatedAmount',
          fabricId: 'fabric-a',
        }),
      ],
    });
  });

  it('reports an unused fabric at the project boundary with its name and remedy', () => {
    const used = fabric({ id: 'blue', name: 'Blue' });
    const unused = fabric({ id: 'cream', name: 'Cream' });
    const input = project(used, [requirement('blue')]);
    input.fabrics.push(unused);

    const result = reconcileProject(input);

    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: 'no-pieces',
          field: 'name',
          fabricId: 'cream',
          message:
            '“Cream” has no cut requirements. Assign at least one cut row to this fabric or remove it.',
        },
      ],
    });
    if (!result.ok) {
      expect(result.errors.map((error) => error.message)).not.toContain(
        'At least one piece group is required.',
      );
    }
    expect(planProject(input)).toEqual(result);
  });
});
