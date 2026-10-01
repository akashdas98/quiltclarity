import { normalizePieceGroups } from './normalization';
import { optimizeFabric } from './optimizer';
import type {
  FabricOptimizationSuccess,
  OptimizerOptions,
  OptimizerWarning,
} from './optimizer';
import {
  fabricSpecFromPlan,
  pieceGroupFromRequirement,
  type FabricPlan,
  type PlannerProject,
} from './project-model';
import {
  compareJointPlanningToSeparateGroups,
  type PlanningComparison,
} from './planning-comparison';
import {
  type ProjectValidationError,
  scopeProjectErrors,
  validateProjectModel,
} from './project-validation';

export type { ProjectValidationError } from './project-validation';

export interface ProjectShoppingItem {
  fabricId: string;
  fabricName: string;
  fabricWidth: number;
  usableWidth: number;
  exactLength: number;
  bufferedLength: number;
  recommendedLength: number;
  purchaseIncrement: number;
  warnings: OptimizerWarning[];
}

export interface ProjectFabricResult {
  fabric: FabricPlan;
  optimization: FabricOptimizationSuccess;
  planningComparison: PlanningComparison;
}

export interface ProjectAggregateSummary {
  fabricCount: number;
  pieceGroupCount: number;
  pieceCount: number;
  totalExactLength: number;
  totalBufferedLength: number;
  totalRecommendedLength: number;
  totalWasteArea: number;
}

export interface ProjectPlanSuccess {
  ok: true;
  projectName?: string;
  unitSystem: PlannerProject['unitSystem'];
  fabrics: ProjectFabricResult[];
  shoppingList: ProjectShoppingItem[];
  summary: ProjectAggregateSummary;
}

export interface ProjectPlanFailure {
  ok: false;
  errors: ProjectValidationError[];
}

export type ProjectPlanResult = ProjectPlanSuccess | ProjectPlanFailure;

export function planProject(
  project: PlannerProject,
  optimizerOptions: OptimizerOptions = {},
): ProjectPlanResult {
  const projectErrors = validateProjectModel(project);
  if (projectErrors.length > 0) {
    return { ok: false, errors: projectErrors };
  }

  const fabrics: ProjectFabricResult[] = [];
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
    const optimization = optimizeFabric(fabric, pieces, optimizerOptions);
    if (!optimization.ok) {
      errors.push(...scopeProjectErrors(fabric.id, optimization.errors));
      continue;
    }
    fabrics.push({
      fabric: {
        ...fabricPlan,
        stockPieces: fabricPlan.stockPieces.map((stock) => ({ ...stock })),
      },
      optimization,
      planningComparison: compareJointPlanningToSeparateGroups(
        fabric,
        pieces,
        optimization,
        optimizerOptions,
      ),
    });
  }
  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const shoppingList = fabrics.map(({ fabric, optimization }) => ({
    fabricId: fabric.id,
    fabricName: fabric.name,
    fabricWidth: fabric.fabricWidth,
    usableWidth: fabric.usableWidth,
    exactLength: optimization.usedLength,
    bufferedLength: optimization.bufferedLength,
    recommendedLength: optimization.recommendedLength,
    purchaseIncrement: fabric.purchaseIncrement,
    warnings: [...optimization.warnings],
  }));
  const summary = fabrics.reduce<ProjectAggregateSummary>(
    (aggregate, { optimization }) => ({
      fabricCount: aggregate.fabricCount + 1,
      pieceGroupCount:
        aggregate.pieceGroupCount + optimization.normalizedPieces.length,
      pieceCount: aggregate.pieceCount + optimization.placements.length,
      totalExactLength: aggregate.totalExactLength + optimization.usedLength,
      totalBufferedLength:
        aggregate.totalBufferedLength + optimization.bufferedLength,
      totalRecommendedLength:
        aggregate.totalRecommendedLength + optimization.recommendedLength,
      totalWasteArea: aggregate.totalWasteArea + optimization.wasteArea,
    }),
    {
      fabricCount: 0,
      pieceGroupCount: 0,
      pieceCount: 0,
      totalExactLength: 0,
      totalBufferedLength: 0,
      totalRecommendedLength: 0,
      totalWasteArea: 0,
    },
  );

  return {
    ok: true,
    projectName: project.name,
    unitSystem: project.unitSystem,
    fabrics,
    shoppingList,
    summary,
  };
}
