import {
  fabricSpecFromPlan,
  formatImperialInches,
  fromMillimetres,
  type FabricOptimizationSuccess,
  type FiniteStockBinResult,
  type NormalizedPieceGroup,
  type Placement,
  type PiecesFromFabricCalculatorSuccess,
  type ReconciledProjectFabric,
  type ReconciledProjectSuccess,
  type UnitSystem,
} from '../domain';
import {
  createCuttingDiagram,
  type CuttingDiagramModel,
  type CuttingDiagramOptions,
  type DiagramTextRow,
} from './cutting-diagram';
import {
  createCuttingInstructions,
  type CuttingInstruction,
} from './cutting-instructions';

export interface ReconciledMaterialPlan {
  materialBinId: string;
  materialLabel: string;
  kind: 'stock' | 'purchased';
  diagram: CuttingDiagramModel;
  instructions: CuttingInstruction[];
}

export interface ReconciledFabricCuttingPlans {
  fabricId: string;
  stock: ReconciledMaterialPlan[];
  purchased: ReconciledMaterialPlan | null;
}

export interface FiniteStockDiagramInput {
  width: number;
  length: number;
  label?: string;
  directional?: boolean;
}

function formatLength(value: number, unitSystem: UnitSystem): string {
  return unitSystem === 'imperial'
    ? formatImperialInches(value)
    : `${Number(fromMillimetres(value, 'centimetre').toFixed(1))} cm`;
}

function groupsForPlacements(
  groups: readonly NormalizedPieceGroup[],
  placements: readonly Placement[],
): NormalizedPieceGroup[] {
  const counts = new Map<string, number>();
  for (const placement of placements) {
    counts.set(
      placement.pieceGroupId,
      (counts.get(placement.pieceGroupId) ?? 0) + 1,
    );
  }
  return groups
    .filter((group) => counts.has(group.id))
    .map((group) => ({ ...group, quantity: counts.get(group.id)! }));
}

function optimizationProjection(
  groups: readonly NormalizedPieceGroup[],
  placements: readonly Placement[],
  usedLength: number,
  rows: FabricOptimizationSuccess['rows'],
  source: Partial<FabricOptimizationSuccess> = {},
): FabricOptimizationSuccess {
  return {
    ok: true,
    usedLength,
    bufferedLength: source.bufferedLength ?? usedLength,
    recommendedLength: source.recommendedLength ?? usedLength,
    wasteArea: source.wasteArea ?? 0,
    candidateScore: source.candidateScore ?? 0,
    cutComplexity: source.cutComplexity ?? placements.length,
    fragmentation: source.fragmentation ?? 0,
    strategy: source.strategy ?? 'constrained-first',
    normalizedPieces: groupsForPlacements(groups, placements),
    placements: placements.map((placement) => ({ ...placement })),
    rows: rows.map((row) => ({ ...row })),
    warnings: source.warnings ? [...source.warnings] : [],
  };
}

function stockTextRows(
  placements: readonly Placement[],
  groups: readonly NormalizedPieceGroup[],
  unitSystem: UnitSystem,
): DiagramTextRow[] {
  const labels = new Map(groups.map((group) => [group.id, group.label]));
  return [...placements]
    .sort((left, right) => left.y - right.y || left.x - right.x)
    .map((placement, rowIndex) => ({
      rowIndex,
      startLabel: formatLength(placement.y, unitSystem),
      heightLabel: formatLength(placement.height, unitSystem),
      runs: [
        {
          label: labels.get(placement.pieceGroupId) ?? placement.pieceGroupId,
          pieceGroupId: placement.pieceGroupId,
          instanceLabel: `instance ${placement.instanceIndex + 1}`,
          dimensionLabel: `${formatLength(placement.width, unitSystem)} × ${formatLength(placement.height, unitSystem)}`,
          rotated: placement.rotated,
          startLabel: formatLength(placement.x, unitSystem),
          endLabel: formatLength(placement.x + placement.width, unitSystem),
        },
      ],
      text: `${labels.get(placement.pieceGroupId) ?? placement.pieceGroupId}, instance ${placement.instanceIndex + 1}, at ${formatLength(placement.x, unitSystem)} across and ${formatLength(placement.y, unitSystem)} down.`,
    }));
}

function createStockPlan(
  item: ReconciledProjectFabric,
  binResult: FiniteStockBinResult,
  unitSystem: UnitSystem,
  options: Omit<CuttingDiagramOptions, 'unitSystem' | 'idPrefix'>,
): ReconciledMaterialPlan {
  const materialLabel = binResult.bin.id.includes('#')
    ? `${binResult.bin.label} ${binResult.bin.stockInstanceIndex + 1}`
    : binResult.bin.label;
  const groups = item.freshFabricScenario.optimization.normalizedPieces;
  const optimization = optimizationProjection(
    groups,
    binResult.placements,
    binResult.bin.length,
    [],
    {
      wasteArea: binResult.unusedArea,
      fragmentation: binResult.leftovers.length,
      strategy: item.reconciliation.selectedStockStrategy.piece,
    },
  );
  const materialFabric = {
    ...fabricSpecFromPlan(item.fabric),
    id: binResult.bin.id,
    name: materialLabel,
    fabricWidth: binResult.bin.width,
    usableWidth: binResult.bin.width,
  };
  const diagram = createCuttingDiagram(materialFabric, optimization, {
    ...options,
    unitSystem,
    idPrefix: `stock-cutting-diagram-${binResult.bin.id}`,
  });
  diagram.lengthAxisLabel = 'Stock length';
  diagram.wasteRegions = binResult.leftovers.map((leftover, rowIndex) => ({
    sourceX: leftover.x,
    sourceY: leftover.y,
    sourceWidth: leftover.width,
    sourceHeight: leftover.height,
    x: diagram.padding + leftover.x * diagram.scale,
    y: diagram.padding + leftover.y * diagram.scale,
    width: leftover.width * diagram.scale,
    height: leftover.height * diagram.scale,
    rowIndex,
    kind: 'stock-leftover',
  }));
  diagram.textAlternative.layoutMode = 'placements';
  diagram.textAlternative.title = `${materialLabel} stock allocation`;
  diagram.textAlternative.summary = `${binResult.placements.length} pieces allocated within ${formatLength(binResult.bin.width, unitSystem)} × ${formatLength(binResult.bin.length, unitSystem)} of existing stock.`;
  diagram.textAlternative.rows = stockTextRows(
    binResult.placements,
    groups,
    unitSystem,
  );
  diagram.textAlternative.text = [
    diagram.textAlternative.title,
    diagram.textAlternative.summary,
    ...diagram.textAlternative.rows.map((row) => row.text),
  ].join('\n');
  const instructions = diagram.textAlternative.rows.map((row, index) => ({
    stripNumber: index + 1,
    text: `From ${materialLabel}, cut ${row.runs[0]!.label} (${row.runs[0]!.instanceLabel}) at ${row.runs[0]!.dimensionLabel}${row.runs[0]!.rotated ? ', rotated' : ''}.`,
  }));
  return {
    materialBinId: binResult.bin.id,
    materialLabel,
    kind: 'stock',
    diagram,
    instructions,
  };
}

export function createPiecesFromFabricCuttingPlan(
  result: PiecesFromFabricCalculatorSuccess,
  stock: FiniteStockDiagramInput,
  unitSystem: UnitSystem,
  options: Omit<CuttingDiagramOptions, 'unitSystem' | 'idPrefix'> = {},
): ReconciledMaterialPlan {
  const materialLabel = stock.label ?? 'Entered stock';
  const groups = [
    {
      ...result.normalizedPiece,
      quantity: result.placedQuantity,
    },
  ];
  const optimization = optimizationProjection(
    groups,
    result.placements,
    stock.length,
    [],
    {
      wasteArea: result.unusedArea,
      fragmentation: result.leftovers.length,
      strategy: 'strip-friendly-first',
    },
  );
  const diagram = createCuttingDiagram(
    {
      id: 'pieces-from-fabric-stock',
      name: materialLabel,
      fabricWidth: stock.width,
      usableWidth: stock.width,
      directional: stock.directional ?? false,
      defaultRotationAllowed: !(stock.directional ?? false),
      safetyAllowancePercent: 0,
      purchaseIncrement: 1,
    },
    optimization,
    {
      ...options,
      unitSystem,
      idPrefix: 'pieces-from-fabric-diagram',
    },
  );
  diagram.lengthAxisLabel = 'Stock length';
  diagram.wasteRegions = result.leftovers.map((leftover, rowIndex) => ({
    sourceX: leftover.x,
    sourceY: leftover.y,
    sourceWidth: leftover.width,
    sourceHeight: leftover.height,
    x: diagram.padding + leftover.x * diagram.scale,
    y: diagram.padding + leftover.y * diagram.scale,
    width: leftover.width * diagram.scale,
    height: leftover.height * diagram.scale,
    rowIndex,
    kind: 'stock-leftover',
  }));
  diagram.textAlternative.layoutMode = 'placements';
  diagram.textAlternative.title = `${materialLabel} cutting layout`;
  diagram.textAlternative.summary = `${result.placedQuantity} pieces placed within ${formatLength(stock.width, unitSystem)} × ${formatLength(stock.length, unitSystem)} of finite stock.`;
  diagram.textAlternative.rows = stockTextRows(
    result.placements,
    groups,
    unitSystem,
  );
  diagram.textAlternative.text = [
    diagram.textAlternative.title,
    diagram.textAlternative.summary,
    ...diagram.textAlternative.rows.map((row) => row.text),
  ].join('\n');
  return {
    materialBinId: 'stock',
    materialLabel,
    kind: 'stock',
    diagram,
    instructions: diagram.textAlternative.rows.map((row, index) => ({
      stripNumber: index + 1,
      text: `From ${materialLabel}, cut ${row.runs[0]!.label} (${row.runs[0]!.instanceLabel}) at ${row.runs[0]!.dimensionLabel}${row.runs[0]!.rotated ? ', rotated' : ''}.`,
    })),
  };
}

export function createReconciledCuttingPlans(
  result: ReconciledProjectSuccess,
  options: Omit<CuttingDiagramOptions, 'unitSystem' | 'idPrefix'> = {},
): ReconciledFabricCuttingPlans[] {
  return result.fabrics.map((item) => {
    const groups = item.freshFabricScenario.optimization.normalizedPieces;
    const purchased = item.reconciliation.purchasedBolt;
    let purchasedPlan: ReconciledMaterialPlan | null = null;
    if (purchased) {
      const optimization = optimizationProjection(
        groups,
        purchased.placements,
        purchased.rawLength,
        purchased.rows,
        {
          bufferedLength:
            item.reconciliation.bufferedPurchase ?? purchased.rawLength,
          recommendedLength:
            item.reconciliation.recommendedPurchase ?? purchased.rawLength,
          wasteArea: purchased.wasteArea,
          cutComplexity: purchased.cutComplexity,
          fragmentation: purchased.fragmentation,
          strategy: purchased.strategy,
          warnings: purchased.warnings,
        },
      );
      const diagram = createCuttingDiagram(
        fabricSpecFromPlan(item.fabric),
        optimization,
        {
          ...options,
          unitSystem: result.unitSystem,
          idPrefix: `purchase-cutting-diagram-${item.fabric.id}`,
        },
      );
      purchasedPlan = {
        materialBinId: purchased.bin.id,
        materialLabel: `New ${item.fabric.name} fabric`,
        kind: 'purchased',
        diagram,
        instructions: createCuttingInstructions(
          optimization,
          result.unitSystem,
        ),
      };
    }
    return {
      fabricId: item.fabric.id,
      stock: item.reconciliation.stockBins.map((bin) =>
        createStockPlan(item, bin, result.unitSystem, options),
      ),
      purchased: purchasedPlan,
    };
  });
}
