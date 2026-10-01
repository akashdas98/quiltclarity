import { describe, expect, it } from 'vitest';

import {
  planProject,
  PLANNER_PROJECT_SCHEMA_VERSION,
  toMillimetres,
  type FabricSpec,
  type PieceGroup,
  type PlannerProject,
  type ProjectPlanSuccess,
} from '../src/lib/domain';
import { createProjectCuttingPlans } from '../src/lib/presentation';

function fabric(id: string, overrides: Partial<FabricSpec> = {}): FabricSpec {
  return {
    id,
    name: `Fabric ${id.toUpperCase()}`,
    fabricWidth: toMillimetres(42, 'inch'),
    usableWidth: toMillimetres(40, 'inch'),
    directional: false,
    defaultRotationAllowed: true,
    safetyAllowancePercent: 0,
    purchaseIncrement: toMillimetres(1 / 8, 'yard'),
    ...overrides,
  };
}

function piece(
  id: string,
  quantity: number,
  widthInches: number,
  heightInches: number,
): PieceGroup {
  return {
    id,
    label: `Piece ${id.toUpperCase()}`,
    quantity,
    width: toMillimetres(widthInches, 'inch'),
    height: toMillimetres(heightInches, 'inch'),
    dimensionMode: 'cut',
  };
}

function project(
  entries: Array<{ fabric: FabricSpec; pieces: PieceGroup[] }>,
  overrides: Partial<
    Pick<PlannerProject, 'name' | 'unitSystem' | 'defaultSeamAllowance'>
  > = {},
): PlannerProject {
  return {
    id: 'project-test',
    schemaVersion: PLANNER_PROJECT_SCHEMA_VERSION,
    unitSystem: 'imperial',
    defaultSeamAllowance: 0,
    fabrics: entries.map(({ fabric: value }) => ({
      ...value,
      stockPieces: [],
    })),
    cutRequirements: entries.flatMap(({ fabric: value, pieces }) =>
      pieces.map((item) => ({
        ...item,
        fabricId: value.id,
        orientation: item.orientationConstraint ?? 'none',
        isWofStrip: item.isWofStrip ?? false,
      })),
    ),
    ...overrides,
  };
}

function expectSuccess(
  result: ReturnType<typeof planProject>,
): ProjectPlanSuccess {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result;
}

describe('multi-fabric project planner', () => {
  it('implements G19 with independent optimization and shopping results', () => {
    const input = project(
      [
        { fabric: fabric('a'), pieces: [piece('a-square', 8, 5, 5)] },
        { fabric: fabric('b'), pieces: [piece('b-square', 4, 10, 10)] },
      ],
      {
        name: 'G19 project',
        defaultSeamAllowance: toMillimetres(0.25, 'inch'),
      },
    );
    const result = expectSuccess(planProject(input));

    expect(result.fabrics).toHaveLength(2);
    expect(result.shoppingList.map((item) => item.fabricId)).toEqual([
      'a',
      'b',
    ]);
    expect(result.fabrics[0]!.optimization.placements).toHaveLength(8);
    expect(result.fabrics[1]!.optimization.placements).toHaveLength(4);
    expect(
      result.fabrics[0]!.optimization.placements.every(
        (placement) => placement.pieceGroupId === 'a-square',
      ),
    ).toBe(true);
    expect(
      result.fabrics[1]!.optimization.placements.every(
        (placement) => placement.pieceGroupId === 'b-square',
      ),
    ).toBe(true);
    expect(result.summary).toEqual(
      expect.objectContaining({
        fabricCount: 2,
        pieceGroupCount: 2,
        pieceCount: 12,
      }),
    );
    expect(result.summary.totalRecommendedLength).toBe(
      result.shoppingList.reduce(
        (sum, item) => sum + item.recommendedLength,
        0,
      ),
    );
  });

  it('retains independent fabric settings and produces one source-backed diagram each', () => {
    const input = project(
      [
        {
          fabric: fabric('a', {
            directional: true,
            defaultRotationAllowed: false,
            safetyAllowancePercent: 3,
            purchaseIncrement: 100,
          }),
          pieces: [piece('a', 2, 15, 5)],
        },
        {
          fabric: fabric('b', {
            directional: false,
            defaultRotationAllowed: true,
            safetyAllowancePercent: 9,
            purchaseIncrement: 250,
          }),
          pieces: [piece('b', 3, 8, 6)],
        },
      ],
      { unitSystem: 'metric', defaultSeamAllowance: 6.35 },
    );
    const result = expectSuccess(planProject(input));
    const diagrams = createProjectCuttingPlans(result);

    expect(result.fabrics.map(({ fabric: value }) => value)).toEqual(
      input.fabrics,
    );
    expect(diagrams).toHaveLength(2);
    for (const [index, cuttingPlan] of diagrams.entries()) {
      const optimized = result.fabrics[index]!.optimization;
      expect(cuttingPlan.fabricId).toBe(input.fabrics[index]!.id);
      expect(cuttingPlan.diagram.pieces).toHaveLength(
        optimized.placements.length,
      );
      expect(
        cuttingPlan.diagram.pieces.map((diagramPiece) => ({
          x: diagramPiece.sourceX,
          y: diagramPiece.sourceY,
          width: diagramPiece.sourceWidth,
          height: diagramPiece.sourceHeight,
        })),
      ).toEqual(
        optimized.placements.map((placement) => ({
          x: placement.x,
          y: placement.y,
          width: placement.width,
          height: placement.height,
        })),
      );
    }
  });

  it('blocks the aggregate result and scopes invalid fabric errors', () => {
    const duplicate = fabric('same');
    expect(
      planProject(
        project([
          { fabric: duplicate, pieces: [piece('a', 1, 5, 5)] },
          { fabric: duplicate, pieces: [piece('b', 1, 5, 5)] },
        ]),
      ),
    ).toEqual({
      ok: false,
      errors: [
        expect.objectContaining({
          code: 'duplicate-fabric-id',
          fabricId: 'same',
        }),
      ],
    });

    const result = planProject(
      project([
        { fabric: fabric('valid'), pieces: [piece('valid', 1, 5, 5)] },
        {
          fabric: fabric('invalid'),
          pieces: [{ ...piece('too-wide', 1, 41, 5), rotationAllowed: false }],
        },
      ]),
    );
    expect(result).toEqual({
      ok: false,
      errors: [
        expect.objectContaining({
          code: 'piece-does-not-fit',
          fabricId: 'invalid',
          pieceId: 'too-wide',
        }),
      ],
    });
  });

  it('blocks missing and unknown fabric assignments', () => {
    const input = project([{ fabric: fabric('a'), pieces: [] }]);
    input.cutRequirements = [
      {
        ...piece('missing', 1, 5, 5),
        fabricId: '',
        orientation: 'none',
        isWofStrip: false,
      },
      {
        ...piece('unknown', 1, 5, 5),
        fabricId: 'not-a-fabric',
        orientation: 'none',
        isWofStrip: false,
      },
    ];
    const result = planProject(input);
    expect(result).toEqual({
      ok: false,
      errors: [
        expect.objectContaining({ code: 'missing-fabric-assignment' }),
        expect.objectContaining({ code: 'unknown-fabric-assignment' }),
      ],
    });
  });

  it('is deterministic for identical project input', () => {
    const input = project([
      { fabric: fabric('a'), pieces: [piece('a', 6, 7, 4)] },
      { fabric: fabric('b'), pieces: [piece('b', 5, 9, 3)] },
    ]);
    expect(planProject(input)).toEqual(planProject(input));
  });
});
