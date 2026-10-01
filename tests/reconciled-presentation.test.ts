import { describe, expect, it } from 'vitest';
import {
  PLANNER_PROJECT_SCHEMA_VERSION,
  calculatePiecesFromFabric,
  reconcileProject,
  toMillimetres,
  type PlannerProject,
  type ReconciledProjectSuccess,
} from '../src/lib/domain';
import {
  createPiecesFromFabricCuttingPlan,
  createReconciledCuttingPlans,
  renderCuttingDiagramSvg,
} from '../src/lib/presentation';

const inches = (value: number) => toMillimetres(value, 'inch');

function reconciled(): ReconciledProjectSuccess {
  const project: PlannerProject = {
    id: 'project',
    schemaVersion: PLANNER_PROJECT_SCHEMA_VERSION,
    unitSystem: 'imperial',
    defaultSeamAllowance: 0,
    fabrics: [
      {
        id: 'fabric',
        name: 'Blue',
        fabricWidth: inches(42),
        usableWidth: inches(40),
        directional: false,
        defaultRotationAllowed: false,
        safetyAllowancePercent: 5,
        purchaseIncrement: inches(4.5),
        stockPieces: [
          {
            id: 'stock',
            fabricId: 'fabric',
            label: 'Remnant 1',
            width: inches(12),
            length: inches(10),
            quantity: 1,
            sourceType: 'custom',
          },
        ],
      },
    ],
    cutRequirements: [
      {
        id: 'square',
        fabricId: 'fabric',
        label: 'Square',
        quantity: 5,
        width: inches(5),
        height: inches(5),
        dimensionMode: 'cut',
        orientation: 'none',
        isWofStrip: false,
      },
    ],
  };
  const result = reconcileProject(project);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result;
}

describe('reconciled material presentation', () => {
  it('projects exact stock and purchase coordinates without allocating again', () => {
    const result = reconciled();
    const domain = result.fabrics[0]!.reconciliation;
    const plans = createReconciledCuttingPlans(result)[0]!;
    const stock = plans.stock[0]!;
    const purchased = plans.purchased!;

    expect(
      stock.diagram.pieces.map((piece) => ({
        id: piece.pieceGroupId,
        instance: piece.instanceIndex,
        x: piece.sourceX,
        y: piece.sourceY,
        width: piece.sourceWidth,
        height: piece.sourceHeight,
      })),
    ).toEqual(
      domain.stockBins[0]!.placements.map((placement) => ({
        id: placement.pieceGroupId,
        instance: placement.instanceIndex,
        x: placement.x,
        y: placement.y,
        width: placement.width,
        height: placement.height,
      })),
    );
    expect(
      purchased.diagram.pieces.map((piece) => ({
        id: piece.pieceGroupId,
        instance: piece.instanceIndex,
        x: piece.sourceX,
        y: piece.sourceY,
      })),
    ).toEqual(
      domain.purchasedBolt!.placements.map((placement) => ({
        id: placement.pieceGroupId,
        instance: placement.instanceIndex,
        x: placement.x,
        y: placement.y,
      })),
    );
  });

  it('projects domain leftovers and exposes a complete stock text equivalent', () => {
    const result = reconciled();
    const bin = result.fabrics[0]!.reconciliation.stockBins[0]!;
    const plan = createReconciledCuttingPlans(result)[0]!.stock[0]!;

    expect(plan.diagram.lengthAxisLabel).toBe('Stock length');
    expect(plan.diagram.textAlternative.layoutMode).toBe('placements');
    expect(plan.diagram.textAlternative.rows).toHaveLength(
      bin.placements.length,
    );
    expect(
      plan.diagram.wasteRegions.map((region) => ({
        x: region.sourceX,
        y: region.sourceY,
        width: region.sourceWidth,
        height: region.sourceHeight,
        kind: region.kind,
      })),
    ).toEqual(
      bin.leftovers.map((leftover) => ({
        ...leftover,
        kind: 'stock-leftover',
      })),
    );
    expect(
      plan.instructions.every((instruction) =>
        instruction.text.startsWith('From Remnant 1'),
      ),
    ).toBe(true);
    expect(renderCuttingDiagramSvg(plan.diagram)).toContain(
      'data-waste-kind="stock-leftover"',
    );
  });

  it('is deterministic', () => {
    const result = reconciled();
    expect(createReconciledCuttingPlans(result)).toEqual(
      createReconciledCuttingPlans(result),
    );
  });

  it('projects Pieces from Fabric from the calculator-selected placements', () => {
    const result = calculatePiecesFromFabric({
      stockWidth: inches(18),
      stockLength: inches(21),
      pieceWidth: inches(5),
      pieceHeight: inches(5),
      dimensionMode: 'cut',
      seamAllowance: 0,
      directional: false,
      rotationAllowed: true,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const plan = createPiecesFromFabricCuttingPlan(
      result,
      { width: inches(18), length: inches(21) },
      'imperial',
    );
    expect(
      plan.diagram.pieces.map((piece) => ({
        x: piece.sourceX,
        y: piece.sourceY,
        width: piece.sourceWidth,
        height: piece.sourceHeight,
      })),
    ).toEqual(
      result.placements.map((placement) => ({
        x: placement.x,
        y: placement.y,
        width: placement.width,
        height: placement.height,
      })),
    );
    expect(
      plan.diagram.wasteRegions.map((region) => ({
        x: region.sourceX,
        y: region.sourceY,
        width: region.sourceWidth,
        height: region.sourceHeight,
      })),
    ).toEqual(result.leftovers);
    expect(plan.diagram.textAlternative.layoutMode).toBe('placements');
  });
});
