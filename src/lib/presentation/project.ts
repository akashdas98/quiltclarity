import type { ProjectPlanSuccess } from '../domain';
import { createCuttingDiagram } from './cutting-diagram';
import type {
  CuttingDiagramModel,
  CuttingDiagramOptions,
} from './cutting-diagram';

export interface ProjectCuttingPlan {
  fabricId: string;
  fabricName: string;
  diagram: CuttingDiagramModel;
}

export function createProjectCuttingPlans(
  result: ProjectPlanSuccess,
  options: Omit<CuttingDiagramOptions, 'unitSystem' | 'idPrefix'> = {},
): ProjectCuttingPlan[] {
  return result.fabrics.map(({ fabric, optimization }) => ({
    fabricId: fabric.id,
    fabricName: fabric.name,
    diagram: createCuttingDiagram(fabric, optimization, {
      ...options,
      unitSystem: result.unitSystem,
      idPrefix: `project-cutting-diagram-${fabric.id}`,
    }),
  }));
}
