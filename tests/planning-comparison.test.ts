import { describe, expect, it } from 'vitest';

import {
  normalizePieceGroups,
  optimizeFabric,
  planProject,
  PLANNER_PROJECT_SCHEMA_VERSION,
  toMillimetres,
  type FabricSpec,
  type PieceGroup,
  type PlannerProject,
  type ProjectPlanSuccess,
} from '../src/lib/domain';

const inches = (value: number): number => toMillimetres(value, 'inch');

function fabric(
  id = 'fabric-a',
  overrides: Partial<FabricSpec> = {},
): FabricSpec {
  return {
    id,
    name: `Fabric ${id.toUpperCase()}`,
    fabricWidth: inches(42),
    usableWidth: inches(40),
    directional: false,
    defaultRotationAllowed: true,
    safetyAllowancePercent: 0,
    purchaseIncrement: inches(4.5),
    ...overrides,
  };
}

function piece(
  id: string,
  quantity: number,
  width: number,
  height: number,
  overrides: Partial<PieceGroup> = {},
): PieceGroup {
  return {
    id,
    label: id.toUpperCase(),
    quantity,
    width: inches(width),
    height: inches(height),
    dimensionMode: 'cut',
    ...overrides,
  };
}

function project(
  entries: Array<{ fabric: FabricSpec; pieces: PieceGroup[] }>,
  seamAllowance = 0,
): PlannerProject {
  return {
    id: 'comparison-project',
    schemaVersion: PLANNER_PROJECT_SCHEMA_VERSION,
    unitSystem: 'imperial',
    defaultSeamAllowance: seamAllowance,
    fabrics: entries.map(({ fabric }) => ({ ...fabric, stockPieces: [] })),
    cutRequirements: entries.flatMap(({ fabric, pieces }) =>
      pieces.map((item) => ({
        ...item,
        fabricId: fabric.id,
        orientation: item.orientationConstraint ?? 'none',
        isWofStrip: item.isWofStrip ?? false,
      })),
    ),
  };
}

function expectSuccess(
  result: ReturnType<typeof planProject>,
): ProjectPlanSuccess {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result;
}

describe('legacy differentiation diagnostics', () => {
  it('implements D01 with three-group exact leftover filling', () => {
    const result = expectSuccess(
      planProject(
        project([
          {
            fabric: fabric(),
            pieces: [
              piece('a', 2, 25, 10, { rotationAllowed: false }),
              piece('b', 2, 10, 10, { rotationAllowed: false }),
              piece('c', 2, 5, 10, { rotationAllowed: false }),
            ],
          },
        ]),
      ),
    );
    const planned = result.fabrics[0]!;

    expect(planned.optimization.usedLength).toBe(inches(20));
    expect(planned.optimization.rows).toHaveLength(2);
    expect(planned.optimization.rows).toEqual([
      expect.objectContaining({ usedWidth: inches(40), placementCount: 3 }),
      expect.objectContaining({ usedWidth: inches(40), placementCount: 3 }),
    ]);
    expect(planned.planningComparison).toEqual({
      recommendedPlanLength: inches(20),
      separateGroupBaselineLength: inches(40),
      lengthDifference: inches(20),
      differencePercent: 50,
      comparisonOutcome: 'combined_shorter',
    });
  });

  it('implements D02 without inventing savings for already efficient groups', () => {
    const result = expectSuccess(
      planProject(
        project([
          {
            fabric: fabric(),
            pieces: [
              piece('a', 4, 20, 10, { rotationAllowed: false }),
              piece('b', 4, 20, 10, { rotationAllowed: false }),
            ],
          },
        ]),
      ),
    ).fabrics[0]!;

    expect(result.optimization.usedLength).toBe(inches(40));
    expect(result.planningComparison).toEqual({
      recommendedPlanLength: inches(40),
      separateGroupBaselineLength: inches(40),
      lengthDifference: 0,
      differencePercent: 0,
      comparisonOutcome: 'same_length',
    });
  });

  it('implements D03 without rotating directional mixed-piece groups', () => {
    const directionalFabric = fabric('directional', {
      directional: true,
      defaultRotationAllowed: false,
    });
    const pieces = [piece('a', 2, 30, 20), piece('b', 2, 15, 10)];
    const result = expectSuccess(
      planProject(project([{ fabric: directionalFabric, pieces }])),
    ).fabrics[0]!;

    expect(result.optimization.usedLength).toBe(inches(50));
    expect(result.optimization.rows.map((row) => row.height)).toEqual([
      inches(20),
      inches(20),
      inches(10),
    ]);
    expect(result.optimization.placements.every((item) => !item.rotated)).toBe(
      true,
    );
    expect(result.planningComparison).toEqual({
      recommendedPlanLength: inches(50),
      separateGroupBaselineLength: inches(50),
      lengthDifference: 0,
      differencePercent: 0,
      comparisonOutcome: 'same_length',
    });

    const rotatablePieces = pieces.map((item) => ({
      ...item,
      rotationAllowed: item.id === 'b',
    }));
    const rotatable = optimizeFabric(
      { ...directionalFabric, directional: false },
      normalizePieceGroups(
        { ...directionalFabric, directional: false },
        rotatablePieces,
        0,
      ),
    );
    expect(rotatable.ok && rotatable.usedLength).toBe(inches(40));
  });

  it('implements D04 while preserving whole-width WOF strip semantics', () => {
    const result = expectSuccess(
      planProject(
        project([
          {
            fabric: fabric(),
            pieces: [
              piece('strip', 2, 40, 2.5, {
                isWofStrip: true,
                rotationAllowed: true,
              }),
              piece('a', 2, 30, 10, { rotationAllowed: false }),
              piece('b', 2, 10, 10, { rotationAllowed: false }),
            ],
          },
        ]),
      ),
    ).fabrics[0]!;
    const strips = result.optimization.placements.filter(
      (placement) => placement.pieceGroupId === 'strip',
    );

    expect(result.optimization.usedLength).toBe(inches(25));
    expect(
      result.optimization.rows.map((row) => row.height).sort((a, b) => a - b),
    ).toEqual([inches(2.5), inches(2.5), inches(10), inches(10)]);
    expect(strips).toHaveLength(2);
    expect(
      strips.every(
        (strip) =>
          !strip.rotated && strip.x === 0 && strip.width === inches(40),
      ),
    ).toBe(true);
    expect(result.planningComparison).toEqual({
      recommendedPlanLength: inches(25),
      separateGroupBaselineLength: inches(35),
      lengthDifference: inches(10),
      differencePercent: (10 / 35) * 100,
      comparisonOutcome: 'combined_shorter',
    });
  });

  it('implements D05 with independent per-fabric comparison state', () => {
    const result = expectSuccess(
      planProject(
        project([
          {
            fabric: fabric('a'),
            pieces: [
              piece('a-wide', 2, 30, 10, { rotationAllowed: false }),
              piece('a-fill', 2, 10, 10, { rotationAllowed: false }),
            ],
          },
          {
            fabric: fabric('b'),
            pieces: [piece('b-only', 4, 10, 10, { rotationAllowed: false })],
          },
        ]),
      ),
    );

    expect(result.fabrics[0]!.planningComparison.comparisonOutcome).toBe(
      'combined_shorter',
    );
    expect(result.fabrics[0]!.planningComparison.lengthDifference).toBe(
      inches(10),
    );
    expect(result.fabrics[1]!.planningComparison).toEqual({
      recommendedPlanLength: inches(10),
      separateGroupBaselineLength: null,
      lengthDifference: null,
      differencePercent: null,
      comparisonOutcome: 'not_applicable',
    });
  });
});

describe('planning comparison invariants', () => {
  it('is deterministic, arithmetic, and does not change optimizer selection', () => {
    const selectedFabric = fabric();
    const pieces = [
      piece('a', 2, 25, 10, { rotationAllowed: false }),
      piece('b', 2, 10, 10, { rotationAllowed: false }),
      piece('c', 2, 5, 10, { rotationAllowed: false }),
    ];
    const direct = optimizeFabric(
      selectedFabric,
      normalizePieceGroups(selectedFabric, pieces, 0),
    );
    const first = expectSuccess(
      planProject(project([{ fabric: selectedFabric, pieces }])),
    );
    const second = expectSuccess(
      planProject(project([{ fabric: selectedFabric, pieces }])),
    );
    const comparison = first.fabrics[0]!.planningComparison;

    expect(first).toEqual(second);
    expect(first.fabrics[0]!.optimization).toEqual(direct);
    expect(comparison.comparisonOutcome).not.toBe('not_applicable');
    if (comparison.comparisonOutcome !== 'not_applicable') {
      expect(comparison.lengthDifference).toBe(
        comparison.separateGroupBaselineLength -
          comparison.recommendedPlanLength,
      );
    }
  });

  it('keeps raw comparison arithmetic independent of safety and rounding', () => {
    const pieces = [
      piece('a', 2, 30, 10, { rotationAllowed: false }),
      piece('b', 2, 10, 10, { rotationAllowed: false }),
    ];
    const withoutPolicy = expectSuccess(
      planProject(project([{ fabric: fabric(), pieces }])),
    ).fabrics[0]!;
    const withPolicy = expectSuccess(
      planProject(
        project([
          {
            fabric: fabric('policy', {
              safetyAllowancePercent: 17,
              purchaseIncrement: inches(9),
            }),
            pieces,
          },
        ]),
      ),
    ).fabrics[0]!;

    expect(withPolicy.planningComparison).toEqual(
      withoutPolicy.planningComparison,
    );
    expect(withPolicy.optimization.bufferedLength).not.toBe(
      withoutPolicy.optimization.bufferedLength,
    );
    expect(withPolicy.optimization.recommendedLength).not.toBe(
      withoutPolicy.optimization.recommendedLength,
    );
  });
});
