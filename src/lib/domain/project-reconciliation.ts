import { normalizePieceGroups } from './normalization';
import {
  compareJointPlanningToSeparateGroups,
  type PlanningComparison,
} from './planning-comparison';
import {
  comparePatternToFreshFabric,
  freshFabricScenario,
  type FreshFabricScenarioSuccess,
  type PatternComparisonSuccess,
} from './pattern-comparison';
import {
  fabricSpecFromPlan,
  pieceGroupFromRequirement,
  type FabricPlan,
  type PlannerProject,
} from './project-model';
import {
  scopeProjectErrors,
  validateProjectModel,
  type ProjectValidationError,
} from './project-validation';
import {
  reconcileFabric,
  type FabricReconciliationSuccess,
  type ReconcileFabricOptions,
  type ReconciliationWarning,
} from './reconciliation';

export type ProjectReconciliationStatus =
  | 'covered-by-stock'
  | 'additional-purchase-required'
  | 'requirements-uncovered';

export interface ReconciledProjectFabric {
  fabric: FabricPlan;
  freshFabricScenario: FreshFabricScenarioSuccess;
  planningComparison: PlanningComparison;
  patternComparison: PatternComparisonSuccess | null;
  reconciliation: FabricReconciliationSuccess;
}

export interface ReconciledShoppingItem {
  fabricId: string;
  fabricName: string;
  rawAdditionalPurchase: number | null;
  bufferedPurchase: number | null;
  recommendedPurchase: number | null;
  purchaseIncrement: number;
  warnings: ReconciliationWarning[];
}

export interface ReconciledProjectSummary {
  status: ProjectReconciliationStatus;
  fabricCount: number;
  pieceGroupCount: number;
  pieceCount: number;
  stockPlacementCount: number;
  purchasedPlacementCount: number;
  unallocatedPieceCount: number;
  totalRawAdditionalPurchase: number | null;
  totalBufferedPurchase: number | null;
  totalRecommendedPurchase: number | null;
}

export interface ReconciledProjectSuccess {
  ok: true;
  projectName?: string;
  unitSystem: PlannerProject['unitSystem'];
  fabrics: ReconciledProjectFabric[];
  shoppingList: ReconciledShoppingItem[];
  summary: ReconciledProjectSummary;
}

export interface ReconciledProjectFailure {
  ok: false;
  errors: ProjectValidationError[];
}

export type ReconciledProjectResult =
  ReconciledProjectSuccess | ReconciledProjectFailure;

export type ReconcileProjectOptions = ReconcileFabricOptions;

function nullableSum(values: readonly (number | null)[]): number | null {
  return values.some((value) => value === null)
    ? null
    : values.reduce<number>((total, value) => total + (value ?? 0), 0);
}

function projectStatus(
  fabrics: readonly ReconciledProjectFabric[],
): ProjectReconciliationStatus {
  if (fabrics.some(({ reconciliation }) => !reconciliation.fullyAllocated)) {
    return 'requirements-uncovered';
  }
  return fabrics.some(
    ({ reconciliation }) => (reconciliation.rawAdditionalPurchase ?? 0) > 0,
  )
    ? 'additional-purchase-required'
    : 'covered-by-stock';
}

export function reconcileProject(
  project: PlannerProject,
  options: ReconcileProjectOptions = {},
): ReconciledProjectResult {
  const projectErrors = validateProjectModel(project);
  if (projectErrors.length > 0) return { ok: false, errors: projectErrors };

  const fabrics: ReconciledProjectFabric[] = [];
  const errors: ProjectValidationError[] = [];
  for (const fabricPlan of project.fabrics) {
    const fabric = fabricSpecFromPlan(fabricPlan);
    const pieces = normalizePieceGroups(
      fabric,
      project.cutRequirements
        .filter((requirement) => requirement.fabricId === fabric.id)
        .map(pieceGroupFromRequirement),
      project.defaultSeamAllowance,
    );
    const fresh = freshFabricScenario(fabric, pieces, options.optimizerOptions);
    if (!fresh.ok) {
      errors.push(...scopeProjectErrors(fabric.id, fresh.errors));
      continue;
    }
    const reconciliation = reconcileFabric(
      fabric,
      fabricPlan.stockPieces,
      pieces,
      options,
    );
    if (!reconciliation.ok) {
      errors.push(...scopeProjectErrors(fabric.id, reconciliation.errors));
      continue;
    }

    let patternComparison: PatternComparisonSuccess | null = null;
    if (fabricPlan.patternStatedAmount !== undefined) {
      const comparison = comparePatternToFreshFabric(
        fabricPlan.patternStatedAmount,
        fabricPlan.patternAssumedUsableWidth,
        fabric.usableWidth,
        fresh,
      );
      if (!comparison.ok) {
        errors.push(...scopeProjectErrors(fabric.id, comparison.errors));
        continue;
      }
      patternComparison = comparison;
    }
    fabrics.push({
      fabric: {
        ...fabricPlan,
        stockPieces: fabricPlan.stockPieces.map((stock) => ({ ...stock })),
      },
      freshFabricScenario: fresh,
      planningComparison: compareJointPlanningToSeparateGroups(
        fabric,
        fresh.optimization.normalizedPieces,
        fresh.optimization,
        options.optimizerOptions,
      ),
      patternComparison,
      reconciliation,
    });
  }
  if (errors.length > 0) return { ok: false, errors };

  const shoppingList = fabrics.map(({ fabric, reconciliation }) => ({
    fabricId: fabric.id,
    fabricName: fabric.name,
    rawAdditionalPurchase: reconciliation.rawAdditionalPurchase,
    bufferedPurchase: reconciliation.bufferedPurchase,
    recommendedPurchase: reconciliation.recommendedPurchase,
    purchaseIncrement: fabric.purchaseIncrement,
    warnings: [...reconciliation.warnings],
  }));
  const rawPurchases = shoppingList.map((item) => item.rawAdditionalPurchase);
  const bufferedPurchases = shoppingList.map((item) => item.bufferedPurchase);
  const recommendedPurchases = shoppingList.map(
    (item) => item.recommendedPurchase,
  );
  return {
    ok: true,
    projectName: project.name,
    unitSystem: project.unitSystem,
    fabrics,
    shoppingList,
    summary: {
      status: projectStatus(fabrics),
      fabricCount: fabrics.length,
      pieceGroupCount: project.cutRequirements.length,
      pieceCount: project.cutRequirements.reduce(
        (total, requirement) => total + requirement.quantity,
        0,
      ),
      stockPlacementCount: fabrics.reduce(
        (total, item) => total + item.reconciliation.stockPlacements.length,
        0,
      ),
      purchasedPlacementCount: fabrics.reduce(
        (total, item) =>
          total + (item.reconciliation.purchasedBolt?.placements.length ?? 0),
        0,
      ),
      unallocatedPieceCount: fabrics.reduce(
        (total, item) => total + item.reconciliation.unallocated.length,
        0,
      ),
      totalRawAdditionalPurchase: nullableSum(rawPurchases),
      totalBufferedPurchase: nullableSum(bufferedPurchases),
      totalRecommendedPurchase: nullableSum(recommendedPurchases),
    },
  };
}
