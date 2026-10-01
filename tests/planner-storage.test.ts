import { describe, expect, it } from 'vitest';

import {
  fabricSpecFromPlan,
  normalizePieceGroups,
  optimizeFabric,
  planProject,
  pieceGroupFromRequirement,
  PLANNER_PROJECT_SCHEMA_VERSION,
  toMillimetres,
  type PlannerProject,
} from '../src/lib/domain';
import {
  clearPlannerProject,
  migrateLegacyPlannerProject,
  PLANNER_SCHEMA_VERSION,
  PLANNER_STORAGE_KEY,
  restorePlannerProject,
  savePlannerProject,
  type LegacyPlannerProject,
  type StorageLike,
} from '../src/lib/persistence';

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const legacyStorageKey = 'quilter:planner-state';

function legacyProject(): LegacyPlannerProject {
  return {
    name: 'Saved project',
    unitSystem: 'imperial',
    seamAllowance: toMillimetres(0.25, 'inch'),
    fabrics: [
      {
        fabric: {
          id: 'fabric-a',
          name: 'Fabric A',
          fabricWidth: toMillimetres(42, 'inch'),
          usableWidth: toMillimetres(40, 'inch'),
          directional: true,
          defaultRotationAllowed: false,
          safetyAllowancePercent: 7,
          purchaseIncrement: toMillimetres(1 / 8, 'yard'),
          notes: 'Keep this setting independent',
        },
        pieces: [
          {
            id: 'piece-a',
            label: 'Piece A',
            quantity: 3,
            width: toMillimetres(5, 'inch'),
            height: toMillimetres(4, 'inch'),
            dimensionMode: 'finished',
            rotationAllowed: false,
            orientationConstraint: 'crosswise',
            notes: 'Keep this requirement note',
          },
        ],
      },
    ],
  };
}

function project(): PlannerProject {
  return {
    ...migrateLegacyPlannerProject(legacyProject()),
    id: 'saved-project',
    schemaVersion: PLANNER_PROJECT_SCHEMA_VERSION,
  };
}

describe('planner local persistence', () => {
  it('prefers a present QuiltClarity state and never replaces malformed canonical data from legacy storage', () => {
    const storage = new MemoryStorage();
    const oldProject = project();
    storage.setItem(
      legacyStorageKey,
      JSON.stringify({
        schemaVersion: PLANNER_SCHEMA_VERSION,
        project: oldProject,
      }),
    );
    const currentProject = { ...oldProject, id: 'current-project' };
    storage.setItem(
      PLANNER_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: PLANNER_SCHEMA_VERSION,
        project: currentProject,
      }),
    );
    expect(restorePlannerProject(storage)).toEqual({
      status: 'restored',
      project: currentProject,
    });

    storage.setItem(PLANNER_STORAGE_KEY, '{broken');
    expect(restorePlannerProject(storage)).toEqual({
      status: 'discarded',
      reason: 'corrupt',
      rawStatePreserved: true,
    });
    expect(storage.getItem(PLANNER_STORAGE_KEY)).toBe('{broken');
  });

  it.each([0, 1, PLANNER_SCHEMA_VERSION] as const)(
    'restores legacy brand key with schema version %i and writes the current key',
    (schemaVersion) => {
      const storage = new MemoryStorage();
      const saved =
        schemaVersion === PLANNER_SCHEMA_VERSION ? project() : legacyProject();
      const raw = JSON.stringify({ schemaVersion, project: saved });
      storage.setItem(legacyStorageKey, raw);

      const result = restorePlannerProject(storage);
      const expected =
        schemaVersion === PLANNER_SCHEMA_VERSION
          ? saved
          : migrateLegacyPlannerProject(saved as LegacyPlannerProject);
      expect(result).toEqual(
        schemaVersion === PLANNER_SCHEMA_VERSION
          ? { status: 'restored', project: expected }
          : {
              status: 'migrated',
              project: expected,
              fromVersion: schemaVersion,
              issues: [],
            },
      );
      expect(JSON.parse(storage.getItem(PLANNER_STORAGE_KEY) ?? '')).toEqual({
        schemaVersion: PLANNER_SCHEMA_VERSION,
        project: expected,
      });
      expect(storage.getItem(legacyStorageKey)).toBe(raw);
      expect(restorePlannerProject(storage)).toEqual({
        status: 'restored',
        project: expected,
      });
    },
  );

  it('preserves corrupt legacy raw state and returns a valid legacy project when canonical writing fails', () => {
    const storage = new MemoryStorage();
    storage.setItem(legacyStorageKey, '{broken');
    expect(restorePlannerProject(storage)).toEqual({
      status: 'discarded',
      reason: 'corrupt',
      rawStatePreserved: true,
    });
    expect(storage.getItem(legacyStorageKey)).toBe('{broken');
    expect(storage.getItem(PLANNER_STORAGE_KEY)).toBeNull();

    const saved = project();
    storage.setItem(
      legacyStorageKey,
      JSON.stringify({ schemaVersion: PLANNER_SCHEMA_VERSION, project: saved }),
    );
    const writeBlocked: StorageLike = {
      getItem: (key) => storage.getItem(key),
      setItem: () => {
        throw new Error('write blocked');
      },
      removeItem: (key) => storage.removeItem(key),
    };
    expect(restorePlannerProject(writeBlocked)).toEqual({
      status: 'restored',
      project: saved,
    });
    expect(storage.getItem(PLANNER_STORAGE_KEY)).toBeNull();
  });

  it('clears both brand namespaces so reset cannot restore old project data', () => {
    const storage = new MemoryStorage();
    const saved = project();
    storage.setItem(
      legacyStorageKey,
      JSON.stringify({ schemaVersion: PLANNER_SCHEMA_VERSION, project: saved }),
    );
    expect(savePlannerProject(storage, saved)).toEqual({ ok: true });
    expect(clearPlannerProject(storage)).toBe(true);
    expect(storage.getItem(legacyStorageKey)).toBeNull();
    expect(storage.getItem(PLANNER_STORAGE_KEY)).toBeNull();
    expect(restorePlannerProject(storage)).toEqual({ status: 'empty' });
  });

  it('leaves the current project in place if legacy removal blocks reset', () => {
    const storage = new MemoryStorage();
    const saved = project();
    storage.setItem(
      legacyStorageKey,
      JSON.stringify({ schemaVersion: PLANNER_SCHEMA_VERSION, project: saved }),
    );
    savePlannerProject(storage, saved);
    const removeBlocked: StorageLike = {
      getItem: (key) => storage.getItem(key),
      setItem: (key, value) => storage.setItem(key, value),
      removeItem: (key) => {
        if (key === legacyStorageKey) throw new Error('remove blocked');
        storage.removeItem(key);
      },
    };
    expect(clearPlannerProject(removeBlocked)).toBe(false);
    expect(restorePlannerProject(storage)).toEqual({
      status: 'restored',
      project: saved,
    });
  });

  it('round-trips the latest V1.1 project in a versioned envelope', () => {
    const storage = new MemoryStorage();
    const saved = project();

    expect(savePlannerProject(storage, saved)).toEqual({ ok: true });
    expect(JSON.parse(storage.getItem(PLANNER_STORAGE_KEY) ?? '')).toEqual({
      schemaVersion: PLANNER_SCHEMA_VERSION,
      project: saved,
    });
    expect(restorePlannerProject(storage)).toEqual({
      status: 'restored',
      project: saved,
    });
  });

  it.each([0, 1] as const)(
    'migrates version %i without losing valid fields',
    (schemaVersion) => {
      const storage = new MemoryStorage();
      const legacy = legacyProject();
      storage.setItem(
        PLANNER_STORAGE_KEY,
        JSON.stringify({ schemaVersion, project: legacy }),
      );

      const expected = migrateLegacyPlannerProject(legacy);
      expect(restorePlannerProject(storage)).toEqual({
        status: 'migrated',
        project: expected,
        fromVersion: schemaVersion,
        issues: [],
      });
      expect(JSON.parse(storage.getItem(PLANNER_STORAGE_KEY) ?? '')).toEqual({
        schemaVersion: PLANNER_SCHEMA_VERSION,
        project: expected,
      });
      expect(expected.fabrics[0]).toEqual({
        ...legacy.fabrics[0]!.fabric,
        stockPieces: [],
      });
      expect(expected.cutRequirements[0]).toEqual({
        id: 'piece-a',
        label: 'Piece A',
        quantity: 3,
        width: toMillimetres(5, 'inch'),
        height: toMillimetres(4, 'inch'),
        dimensionMode: 'finished',
        rotationAllowed: false,
        notes: 'Keep this requirement note',
        fabricId: 'fabric-a',
        orientation: 'crosswise',
        isWofStrip: false,
      });
    },
  );

  it('preserves fresh-bolt planning output across migration', () => {
    const legacy = legacyProject();
    const migrated = migrateLegacyPlannerProject(legacy);
    const fabric = fabricSpecFromPlan(migrated.fabrics[0]!);
    const normalized = normalizePieceGroups(
      fabric,
      migrated.cutRequirements.map(pieceGroupFromRequirement),
      migrated.defaultSeamAllowance,
    );
    const baseline = optimizeFabric(fabric, normalized);
    const planned = planProject(migrated);

    expect(planned.ok).toBe(true);
    if (!planned.ok) throw new Error(JSON.stringify(planned.errors));
    expect(planned.fabrics[0]!.optimization).toEqual(baseline);
  });

  it('preserves corrupt raw state and recovers valid projects from unknown envelopes', () => {
    const storage = new MemoryStorage();
    storage.setItem(PLANNER_STORAGE_KEY, '{broken');
    expect(restorePlannerProject(storage)).toEqual({
      status: 'discarded',
      reason: 'corrupt',
      rawStatePreserved: true,
    });
    expect(storage.getItem(PLANNER_STORAGE_KEY)).toBe('{broken');

    const saved = project();
    storage.setItem(
      PLANNER_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 99, project: saved }),
    );
    expect(restorePlannerProject(storage)).toEqual({
      status: 'recovered',
      project: saved,
      fromVersion: 99,
      issues: [
        'Recovered a structurally valid project from envelope version 99.',
      ],
    });
    expect(
      JSON.parse(storage.getItem(PLANNER_STORAGE_KEY) ?? '').schemaVersion,
    ).toBe(PLANNER_SCHEMA_VERSION);
  });

  it('preserves structurally sound in-progress state and contains storage failures', () => {
    const storage = new MemoryStorage();
    const inProgress = project();
    inProgress.cutRequirements[0]!.quantity = 0;
    expect(savePlannerProject(storage, inProgress)).toEqual({ ok: true });
    expect(restorePlannerProject(storage)).toEqual({
      status: 'restored',
      project: inProgress,
    });
    expect(clearPlannerProject(storage)).toBe(true);
    expect(restorePlannerProject(storage)).toEqual({ status: 'empty' });

    const unavailable: StorageLike = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    expect(savePlannerProject(unavailable, project())).toEqual({
      ok: false,
      reason: 'storage-unavailable',
    });
    expect(restorePlannerProject(unavailable)).toEqual({
      status: 'discarded',
      reason: 'storage-unavailable',
      rawStatePreserved: true,
    });
    expect(clearPlannerProject(unavailable)).toBe(false);
  });
});
