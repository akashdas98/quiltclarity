import type { PlannerProject } from './project-model';
import { validateSeamAllowance, type ValidationError } from './validation';

export interface ProjectValidationError extends ValidationError {
  fabricId?: string;
}

export function validateProjectModel(
  project: PlannerProject,
): ProjectValidationError[] {
  const errors: ProjectValidationError[] = [
    ...validateSeamAllowance(project.defaultSeamAllowance),
  ];
  if (project.fabrics.length === 0) {
    errors.push({
      code: 'no-fabrics',
      field: 'fabrics',
      message: 'Add at least one fabric before calculating.',
    });
  }

  const fabricIds = new Set<string>();
  for (const fabric of project.fabrics) {
    if (fabricIds.has(fabric.id)) {
      errors.push({
        code: 'duplicate-fabric-id',
        field: 'id',
        fabricId: fabric.id,
        message:
          'This project contains a duplicate fabric record. Remove the duplicate fabric and try again.',
      });
    }
    fabricIds.add(fabric.id);
  }

  const requirementIds = new Set<string>();
  for (const requirement of project.cutRequirements) {
    if (requirementIds.has(requirement.id)) {
      errors.push({
        code: 'duplicate-piece-id',
        field: 'id',
        fabricId: requirement.fabricId || undefined,
        pieceId: requirement.id,
        message:
          'This project contains a duplicate cut requirement. Remove the duplicate row and try again.',
      });
    }
    requirementIds.add(requirement.id);
    if (requirement.fabricId.length === 0) {
      errors.push({
        code: 'missing-fabric-assignment',
        field: 'fabricId',
        pieceId: requirement.id,
        message: 'Choose a fabric for this cut requirement.',
      });
    } else if (!fabricIds.has(requirement.fabricId)) {
      errors.push({
        code: 'unknown-fabric-assignment',
        field: 'fabricId',
        fabricId: requirement.fabricId,
        pieceId: requirement.id,
        message:
          'This cut requirement is assigned to a fabric that no longer exists. Choose an available fabric.',
      });
    }
  }
  const hasAssignmentErrors = errors.some(
    (error) =>
      error.code === 'missing-fabric-assignment' ||
      error.code === 'unknown-fabric-assignment',
  );
  if (project.fabrics.length > 0 && project.cutRequirements.length === 0) {
    errors.push({
      code: 'no-pieces',
      field: 'pieces',
      message: 'Add at least one cut requirement before calculating.',
    });
  } else if (!hasAssignmentErrors) {
    project.fabrics.forEach((fabric, index) => {
      if (
        !project.cutRequirements.some(
          (requirement) => requirement.fabricId === fabric.id,
        )
      ) {
        const name = fabric.name.trim() || `Fabric ${index + 1}`;
        errors.push({
          code: 'no-pieces',
          field: 'name',
          fabricId: fabric.id,
          message: `“${name}” has no cut requirements. Assign at least one cut row to this fabric or remove it.`,
        });
      }
    });
  }
  return errors;
}

export function scopeProjectErrors(
  fabricId: string,
  errors: readonly ValidationError[],
): ProjectValidationError[] {
  return errors.map((error) => ({ ...error, fabricId }));
}
