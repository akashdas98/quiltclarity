import type {
  FabricSpec,
  OrientationConstraint,
  PieceGroup,
  UnitSystem,
} from './types';

export const PLANNER_PROJECT_SCHEMA_VERSION = 2 as const;

export type StockSourceType = 'preset' | 'custom' | 'partial-yardage';

/** Project-local physical fabric geometry. All dimensions are millimetres. */
export interface StockPiece {
  id: string;
  fabricId: string;
  label: string;
  width: number;
  length: number;
  quantity: number;
  sourceType: StockSourceType;
  presetId?: string;
}

/** Fabric purchasing assumptions plus optional project-local stock/reference data. */
export interface FabricPlan extends FabricSpec {
  patternStatedAmount?: number;
  patternAssumedUsableWidth?: number;
  stockPieces: StockPiece[];
}

/** A normalized project-level requirement assigned to exactly one fabric. */
export interface CutRequirement extends Omit<
  PieceGroup,
  'orientationConstraint' | 'isWofStrip'
> {
  fabricId: string;
  orientation: OrientationConstraint;
  isWofStrip: boolean;
}

/** The persisted V1.1 project model. All length fields are millimetres. */
export interface PlannerProject {
  id: string;
  schemaVersion: typeof PLANNER_PROJECT_SCHEMA_VERSION;
  name?: string;
  unitSystem: UnitSystem;
  defaultSeamAllowance: number;
  fabrics: FabricPlan[];
  cutRequirements: CutRequirement[];
  createdAt?: string;
  updatedAt?: string;
}

export function fabricSpecFromPlan(fabric: FabricPlan): FabricSpec {
  return {
    id: fabric.id,
    name: fabric.name,
    fabricWidth: fabric.fabricWidth,
    usableWidth: fabric.usableWidth,
    directional: fabric.directional,
    defaultRotationAllowed: fabric.defaultRotationAllowed,
    safetyAllowancePercent: fabric.safetyAllowancePercent,
    purchaseIncrement: fabric.purchaseIncrement,
    notes: fabric.notes,
  };
}

export function pieceGroupFromRequirement(
  requirement: CutRequirement,
): PieceGroup {
  return {
    id: requirement.id,
    label: requirement.label,
    quantity: requirement.quantity,
    width: requirement.width,
    height: requirement.height,
    dimensionMode: requirement.dimensionMode,
    rotationAllowed: requirement.rotationAllowed,
    orientationConstraint: requirement.orientation,
    isWofStrip: requirement.isWofStrip,
    notes: requirement.notes,
  };
}
