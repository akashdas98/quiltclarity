import type { NormalizedPieceGroup } from '../types';
import type { OptimizerStrategy } from './types';

export const OPTIMIZER_STRATEGIES: readonly OptimizerStrategy[] = [
  'constrained-first',
  'area-descending',
  'width-descending',
  'height-descending',
  'quantity-descending',
  'strip-friendly-first',
];

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function descending(left: number, right: number): number {
  return right - left;
}

export function orderPieceGroups(
  pieces: readonly NormalizedPieceGroup[],
  strategy: OptimizerStrategy,
): NormalizedPieceGroup[] {
  return [...pieces].sort((left, right) => {
    let comparison = 0;

    switch (strategy) {
      case 'constrained-first':
        comparison =
          Number(left.rotationAllowed) - Number(right.rotationAllowed);
        if (comparison === 0) {
          comparison = descending(
            left.width * left.height,
            right.width * right.height,
          );
        }
        break;
      case 'area-descending':
        comparison = descending(
          left.width * left.height,
          right.width * right.height,
        );
        break;
      case 'width-descending':
        comparison = descending(left.width, right.width);
        break;
      case 'height-descending':
        comparison = descending(left.height, right.height);
        break;
      case 'quantity-descending':
        comparison = descending(left.quantity, right.quantity);
        break;
      case 'strip-friendly-first':
        comparison =
          Number(right.isWofStrip === true) - Number(left.isWofStrip === true);
        if (comparison === 0) {
          comparison = descending(left.quantity, right.quantity);
        }
        if (comparison === 0) {
          comparison = descending(left.height, right.height);
        }
        break;
    }

    if (comparison === 0) {
      comparison = descending(
        left.width * left.height,
        right.width * right.height,
      );
    }

    return comparison === 0 ? compareText(left.id, right.id) : comparison;
  });
}
