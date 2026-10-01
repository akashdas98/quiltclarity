import {
  formatImperialInches,
  fromMillimetres,
  type FabricOptimizationSuccess,
  type UnitSystem,
} from '../domain';

export interface CuttingInstruction {
  stripNumber: number;
  text: string;
}

function formatLength(value: number, unitSystem: UnitSystem): string {
  if (unitSystem === 'imperial') return formatImperialInches(value);
  return `${Number(fromMillimetres(value, 'centimetre').toFixed(1))} cm`;
}

export function createCuttingInstructions(
  optimization: FabricOptimizationSuccess,
  unitSystem: UnitSystem,
): CuttingInstruction[] {
  const labels = new Map(
    optimization.normalizedPieces.map((piece) => [piece.id, piece.label]),
  );

  return optimization.rows.map((row, rowIndex) => {
    const groups = new Map<
      string,
      { label: string; count: number; width: number; height: number }
    >();
    for (const placement of optimization.placements.filter(
      (candidate) => candidate.y === row.y,
    )) {
      const key = `${placement.pieceGroupId}:${placement.width}:${placement.height}`;
      const current = groups.get(key);
      if (current) current.count += 1;
      else {
        groups.set(key, {
          label: labels.get(placement.pieceGroupId) ?? placement.pieceGroupId,
          count: 1,
          width: placement.width,
          height: placement.height,
        });
      }
    }
    const subcuts = [...groups.values()]
      .map(
        (group) =>
          `${group.count} ${group.label} piece${group.count === 1 ? '' : 's'} at ${formatLength(group.width, unitSystem)} × ${formatLength(group.height, unitSystem)}`,
      )
      .join('; ');
    return {
      stripNumber: rowIndex + 1,
      text: `Cut one ${formatLength(row.height, unitSystem)} × WOF strip. From that strip, cut ${subcuts}.`,
    };
  });
}
