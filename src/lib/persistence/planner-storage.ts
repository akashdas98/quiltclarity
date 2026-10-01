import {
  PLANNER_PROJECT_SCHEMA_VERSION,
  type CutRequirement,
  type FabricPlan,
  type FabricSpec,
  type PieceGroup,
  type PlannerProject,
  type StockPiece,
  type UnitSystem,
} from '../domain';

export const PLANNER_STORAGE_KEY = 'quiltclarity:planner-state';
const LEGACY_PLANNER_STORAGE_KEY = 'quilter:planner-state';
export const PLANNER_SCHEMA_VERSION = PLANNER_PROJECT_SCHEMA_VERSION;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface StoredPlannerStateV2 {
  schemaVersion: typeof PLANNER_SCHEMA_VERSION;
  project: PlannerProject;
}

export interface LegacyPlannerProject {
  name?: string;
  unitSystem: UnitSystem;
  seamAllowance: number;
  fabrics: Array<{
    fabric: FabricSpec;
    pieces: PieceGroup[];
  }>;
}

export interface StoredPlannerStateV1 {
  schemaVersion: 1;
  project: LegacyPlannerProject;
}

export interface StoredPlannerStateV0 {
  schemaVersion: 0;
  project: LegacyPlannerProject;
}

export type SavePlannerStateResult =
  { ok: true } | { ok: false; reason: 'storage-unavailable' };

export type RestorePlannerStateResult =
  | { status: 'empty' }
  | { status: 'restored'; project: PlannerProject }
  | {
      status: 'migrated';
      project: PlannerProject;
      fromVersion: 0 | 1;
      issues: string[];
    }
  | {
      status: 'recovered';
      project: PlannerProject;
      fromVersion: number;
      issues: string[];
    }
  | {
      status: 'discarded';
      reason: 'corrupt' | 'incompatible' | 'storage-unavailable';
      rawStatePreserved: boolean;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isOptionalFiniteNumber(value: unknown): boolean {
  return value === undefined || isFiniteNumber(value);
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string';
}

function isUnitSystem(value: unknown): value is UnitSystem {
  return value === 'imperial' || value === 'metric';
}

function isFabricSpec(value: unknown): value is FabricSpec {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    isFiniteNumber(value.fabricWidth) &&
    isFiniteNumber(value.usableWidth) &&
    typeof value.directional === 'boolean' &&
    typeof value.defaultRotationAllowed === 'boolean' &&
    isFiniteNumber(value.safetyAllowancePercent) &&
    isFiniteNumber(value.purchaseIncrement) &&
    isOptionalString(value.notes)
  );
}

function isStockPiece(value: unknown): value is StockPiece {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.fabricId === 'string' &&
    typeof value.label === 'string' &&
    isFiniteNumber(value.width) &&
    isFiniteNumber(value.length) &&
    isFiniteNumber(value.quantity) &&
    (value.sourceType === 'preset' ||
      value.sourceType === 'custom' ||
      value.sourceType === 'partial-yardage') &&
    isOptionalString(value.presetId)
  );
}

function isFabricPlan(value: unknown): value is FabricPlan {
  if (!isFabricSpec(value)) return false;
  const record = value as unknown as Record<string, unknown>;
  return (
    isOptionalFiniteNumber(record.patternStatedAmount) &&
    isOptionalFiniteNumber(record.patternAssumedUsableWidth) &&
    Array.isArray(record.stockPieces) &&
    record.stockPieces.every(isStockPiece)
  );
}

function isPieceGroup(value: unknown): value is PieceGroup {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.label === 'string' &&
    isFiniteNumber(value.quantity) &&
    isFiniteNumber(value.width) &&
    isFiniteNumber(value.height) &&
    (value.dimensionMode === 'cut' || value.dimensionMode === 'finished') &&
    (value.rotationAllowed === undefined ||
      typeof value.rotationAllowed === 'boolean') &&
    (value.orientationConstraint === undefined ||
      value.orientationConstraint === 'none' ||
      value.orientationConstraint === 'crosswise' ||
      value.orientationConstraint === 'lengthwise') &&
    (value.isWofStrip === undefined || typeof value.isWofStrip === 'boolean') &&
    isOptionalString(value.notes)
  );
}

function isCutRequirement(value: unknown): value is CutRequirement {
  if (!isPieceGroup(value) || !isRecord(value)) return false;
  return (
    typeof value.fabricId === 'string' &&
    (value.orientation === 'none' ||
      value.orientation === 'crosswise' ||
      value.orientation === 'lengthwise') &&
    typeof value.isWofStrip === 'boolean'
  );
}

function isLegacyPlannerProject(value: unknown): value is LegacyPlannerProject {
  if (!isRecord(value) || !Array.isArray(value.fabrics)) return false;
  return (
    isOptionalString(value.name) &&
    isUnitSystem(value.unitSystem) &&
    isFiniteNumber(value.seamAllowance) &&
    value.fabrics.every(
      (entry) =>
        isRecord(entry) &&
        isFabricSpec(entry.fabric) &&
        Array.isArray(entry.pieces) &&
        entry.pieces.every(isPieceGroup),
    )
  );
}

function isPlannerProject(value: unknown): value is PlannerProject {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    value.schemaVersion === PLANNER_PROJECT_SCHEMA_VERSION &&
    isOptionalString(value.name) &&
    isUnitSystem(value.unitSystem) &&
    isFiniteNumber(value.defaultSeamAllowance) &&
    Array.isArray(value.fabrics) &&
    value.fabrics.every(isFabricPlan) &&
    Array.isArray(value.cutRequirements) &&
    value.cutRequirements.every(isCutRequirement) &&
    isOptionalString(value.createdAt) &&
    isOptionalString(value.updatedAt)
  );
}

export function migrateLegacyPlannerProject(
  legacy: LegacyPlannerProject,
): PlannerProject {
  return {
    id: 'migrated-project',
    schemaVersion: PLANNER_PROJECT_SCHEMA_VERSION,
    name: legacy.name,
    unitSystem: legacy.unitSystem,
    defaultSeamAllowance: legacy.seamAllowance,
    fabrics: legacy.fabrics.map(({ fabric }) => ({
      ...fabric,
      stockPieces: [],
    })),
    cutRequirements: legacy.fabrics.flatMap(({ fabric, pieces }) =>
      pieces.map((piece) => {
        const { orientationConstraint, isWofStrip, ...requirement } = piece;
        return {
          ...requirement,
          fabricId: fabric.id,
          orientation: orientationConstraint ?? 'none',
          isWofStrip: isWofStrip ?? false,
        };
      }),
    ),
  };
}

export function savePlannerProject(
  storage: StorageLike,
  project: PlannerProject,
): SavePlannerStateResult {
  try {
    const state: StoredPlannerStateV2 = {
      schemaVersion: PLANNER_SCHEMA_VERSION,
      project,
    };
    storage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch {
    return { ok: false, reason: 'storage-unavailable' };
  }
}

export function restorePlannerProject(
  storage: StorageLike,
): RestorePlannerStateResult {
  let serialized: string | null;
  let fromLegacyKey = false;
  try {
    serialized = storage.getItem(PLANNER_STORAGE_KEY);
    if (serialized === null) {
      serialized = storage.getItem(LEGACY_PLANNER_STORAGE_KEY);
      fromLegacyKey = serialized !== null;
    }
  } catch {
    return {
      status: 'discarded',
      reason: 'storage-unavailable',
      rawStatePreserved: true,
    };
  }
  if (serialized === null) return { status: 'empty' };

  let value: unknown;
  try {
    value = JSON.parse(serialized);
  } catch {
    return { status: 'discarded', reason: 'corrupt', rawStatePreserved: true };
  }
  if (!isRecord(value) || !isRecord(value.project)) {
    return {
      status: 'discarded',
      reason: 'corrupt',
      rawStatePreserved: true,
    };
  }

  if (
    value.schemaVersion === PLANNER_SCHEMA_VERSION &&
    isPlannerProject(value.project)
  ) {
    if (fromLegacyKey) savePlannerProject(storage, value.project);
    return { status: 'restored', project: value.project };
  }

  if (
    (value.schemaVersion === 0 || value.schemaVersion === 1) &&
    isLegacyPlannerProject(value.project)
  ) {
    const project = migrateLegacyPlannerProject(value.project);
    savePlannerProject(storage, project);
    return {
      status: 'migrated',
      project,
      fromVersion: value.schemaVersion,
      issues: [],
    };
  }

  if (
    typeof value.schemaVersion === 'number' &&
    isPlannerProject(value.project)
  ) {
    const project = { ...value.project };
    savePlannerProject(storage, project);
    return {
      status: 'recovered',
      project,
      fromVersion: value.schemaVersion,
      issues: [
        `Recovered a structurally valid project from envelope version ${value.schemaVersion}.`,
      ],
    };
  }

  return {
    status: 'discarded',
    reason: 'incompatible',
    rawStatePreserved: true,
  };
}

export function clearPlannerProject(storage: StorageLike): boolean {
  try {
    // Remove the fallback first so a reset cannot restore a previous project.
    storage.removeItem(LEGACY_PLANNER_STORAGE_KEY);
    storage.removeItem(PLANNER_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
