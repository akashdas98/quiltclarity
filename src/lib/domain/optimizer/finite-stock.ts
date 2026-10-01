import type { StockPiece, StockSourceType } from '../project-model';
import type { FabricSpec, NormalizedPieceGroup } from '../types';
import {
  type ValidationError,
  validateFabricSpec,
  validatePieceGroup,
  validatePositiveInteger,
  validatePositiveNumber,
} from '../validation';
import { orderPieceGroups } from './strategies';
import type { OptimizerStrategy, Placement } from './types';

export type FiniteStockBinStrategy =
  'smallest-useful-fit' | 'largest-first' | 'preserve-wof-capable';

export type FiniteStockSplitStrategy = 'crosswise-first' | 'lengthwise-first';

export interface MaterialBin {
  id: string;
  stockPieceId: string;
  stockInstanceIndex: number;
  fabricId: string;
  label: string;
  width: number;
  length: number;
  sourceType: StockSourceType;
  presetId?: string;
}

export interface LeftoverRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FiniteStockPlacement extends Placement {
  materialBinId: string;
  stockPieceId: string;
  stockInstanceIndex: number;
  fabricId: string;
}

export interface UnallocatedPieceInstance {
  pieceGroupId: string;
  instanceIndex: number;
  width: number;
  height: number;
  rotationAllowed: boolean;
  orientationConstraint: NormalizedPieceGroup['orientationConstraint'];
  isWofStrip: boolean;
}

export interface FiniteStockBinResult {
  bin: MaterialBin;
  placements: FiniteStockPlacement[];
  leftovers: LeftoverRectangle[];
  usedArea: number;
  unusedArea: number;
}

export interface FiniteStockStrategy {
  piece: OptimizerStrategy;
  bin: FiniteStockBinStrategy;
  split: FiniteStockSplitStrategy;
}

export interface FiniteStockCandidate {
  strategy: FiniteStockStrategy;
  strategyIndex: number;
  bins: FiniteStockBinResult[];
  placements: FiniteStockPlacement[];
  unallocated: UnallocatedPieceInstance[];
  allocatedArea: number;
  unusedStockArea: number;
  fragmentation: number;
  largestLeftoverArea: number;
}

export interface FiniteStockWarning {
  code: 'stock-safety-not-applied' | 'performance-fallback';
  message: string;
}

export interface FiniteStockAllocationSuccess {
  ok: true;
  fullyAllocated: boolean;
  bins: FiniteStockBinResult[];
  placements: FiniteStockPlacement[];
  unallocated: UnallocatedPieceInstance[];
  usedStockArea: number;
  unusedStockArea: number;
  rawAdditionalPurchase: 0 | null;
  bufferedPurchase: 0 | null;
  recommendedPurchase: 0 | null;
  strategy: FiniteStockStrategy;
  warnings: FiniteStockWarning[];
}

export interface FiniteStockAllocationFailure {
  ok: false;
  errors: ValidationError[];
  warnings: [];
}

export type FiniteStockAllocationResult =
  FiniteStockAllocationSuccess | FiniteStockAllocationFailure;

export interface FiniteStockLimits {
  fullStrategyPlacementLimit: number;
  maximumPlacementCount: number;
  maximumStockBinCount: number;
}

export interface FiniteStockOptions {
  limits?: Partial<FiniteStockLimits>;
}

export const DEFAULT_FINITE_STOCK_LIMITS: FiniteStockLimits = {
  fullStrategyPlacementLimit: 400,
  maximumPlacementCount: 20_000,
  maximumStockBinCount: 2_000,
};

const PIECE_STRATEGIES: readonly OptimizerStrategy[] = [
  'constrained-first',
  'area-descending',
  'width-descending',
  'height-descending',
  'strip-friendly-first',
];

const BIN_STRATEGIES: readonly FiniteStockBinStrategy[] = [
  'smallest-useful-fit',
  'largest-first',
  'preserve-wof-capable',
];

const SPLIT_STRATEGIES: readonly FiniteStockSplitStrategy[] = [
  'crosswise-first',
  'lengthwise-first',
];

interface PieceInstance {
  group: NormalizedPieceGroup;
  instanceIndex: number;
}

interface MutableBin {
  bin: MaterialBin;
  placements: FiniteStockPlacement[];
  free: LeftoverRectangle[];
}

interface PlacementChoice {
  binIndex: number;
  freeIndex: number;
  width: number;
  height: number;
  rotated: boolean;
}

const GEOMETRY_TOLERANCE = 1e-9;

function geometryTolerance(left: number, right: number): number {
  return GEOMETRY_TOLERANCE * Math.max(1, Math.abs(left), Math.abs(right));
}

function fitsWithin(value: number, boundary: number): boolean {
  return value <= boundary + geometryTolerance(value, boundary);
}

function positiveRemainder(total: number, used: number): number {
  const remainder = total - used;
  return Math.abs(remainder) <= geometryTolerance(total, used) ? 0 : remainder;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function rectangleArea(rectangle: { width: number; height: number }): number {
  return rectangle.width * rectangle.height;
}

function binArea(bin: MaterialBin): number {
  return bin.width * bin.length;
}

function mergeLimits(
  overrides: Partial<FiniteStockLimits> | undefined,
): FiniteStockLimits {
  return { ...DEFAULT_FINITE_STOCK_LIMITS, ...overrides };
}

function performanceError(field: string, limit: number): ValidationError {
  return {
    code: 'performance-limit',
    field,
    message: `This plan exceeds the supported limit of ${limit} ${field}. Reduce quantities or split it into smaller plans.`,
  };
}

function validateInput(
  fabric: FabricSpec,
  stockPieces: readonly StockPiece[],
  pieces: readonly NormalizedPieceGroup[],
  limits: FiniteStockLimits,
): ValidationError[] {
  const errors = [
    ...validateFabricSpec(fabric),
    ...pieces.flatMap((piece) => validatePieceGroup(piece)),
  ];
  if (pieces.length === 0) {
    errors.push({
      code: 'no-pieces',
      field: 'pieces',
      message: 'Add at least one cut requirement before planning this fabric.',
    });
  }

  const pieceIds = new Set<string>();
  for (const piece of pieces) {
    if (pieceIds.has(piece.id)) {
      errors.push({
        code: 'duplicate-piece-id',
        field: 'id',
        pieceId: piece.id,
        message:
          'This fabric contains a duplicate cut requirement. Remove the duplicate row and try again.',
      });
    }
    pieceIds.add(piece.id);
  }

  const stockIds = new Set<string>();
  for (const stock of stockPieces) {
    errors.push(
      ...validatePositiveNumber(stock.width, 'stock.width').map((error) => ({
        ...error,
        stockPieceId: stock.id,
      })),
      ...validatePositiveNumber(stock.length, 'stock.length').map((error) => ({
        ...error,
        stockPieceId: stock.id,
      })),
      ...validatePositiveInteger(stock.quantity, 'stock.quantity').map(
        (error) => ({ ...error, stockPieceId: stock.id }),
      ),
    );
    if (stockIds.has(stock.id)) {
      errors.push({
        code: 'duplicate-stock-id',
        field: 'stock.id',
        stockPieceId: stock.id,
        message:
          'This fabric contains a duplicate stock piece. Remove the duplicate stock entry and try again.',
      });
    }
    stockIds.add(stock.id);
    if (stock.fabricId !== fabric.id) {
      errors.push({
        code: 'stock-fabric-mismatch',
        field: 'stock.fabricId',
        stockPieceId: stock.id,
        message:
          'This stock piece belongs to a different fabric. Remove it and add it under the correct fabric.',
      });
    }
  }

  const placementCount = pieces.reduce(
    (total, piece) => total + piece.quantity,
    0,
  );
  const binCount = stockPieces.reduce(
    (total, stock) => total + stock.quantity,
    0,
  );
  if (placementCount > limits.maximumPlacementCount) {
    errors.push(
      performanceError(
        'explicit piece placements',
        limits.maximumPlacementCount,
      ),
    );
  }
  if (binCount > limits.maximumStockBinCount) {
    errors.push(
      performanceError('physical stock bins', limits.maximumStockBinCount),
    );
  }
  return errors;
}

function expandBins(stockPieces: readonly StockPiece[]): MaterialBin[] {
  return stockPieces.flatMap((stock) =>
    Array.from({ length: stock.quantity }, (_, index) => ({
      id: stock.quantity === 1 ? stock.id : `${stock.id}#${index + 1}`,
      stockPieceId: stock.id,
      stockInstanceIndex: index,
      fabricId: stock.fabricId,
      label: stock.label,
      width: stock.width,
      length: stock.length,
      sourceType: stock.sourceType,
      ...(stock.presetId === undefined ? {} : { presetId: stock.presetId }),
    })),
  );
}

function expandPieces(
  pieces: readonly NormalizedPieceGroup[],
  strategy: OptimizerStrategy,
): PieceInstance[] {
  return orderPieceGroups(pieces, strategy).flatMap((group) =>
    Array.from({ length: group.quantity }, (_, instanceIndex) => ({
      group,
      instanceIndex,
    })),
  );
}

function allowedOrientations(
  group: NormalizedPieceGroup,
): Array<{ width: number; height: number; rotated: boolean }> {
  const orientation = group.orientationConstraint ?? 'none';
  const result: Array<{ width: number; height: number; rotated: boolean }> = [];
  if (orientation !== 'lengthwise') {
    result.push({ width: group.width, height: group.height, rotated: false });
  }
  if (
    group.rotationAllowed &&
    orientation !== 'crosswise' &&
    group.isWofStrip !== true
  ) {
    result.push({ width: group.height, height: group.width, rotated: true });
  }
  return result;
}

function compareChoices(
  left: PlacementChoice,
  right: PlacementChoice,
  bins: readonly MutableBin[],
  strategy: FiniteStockBinStrategy,
  isWofStrip: boolean,
  usableWidth: number,
): number {
  const leftBin = bins[left.binIndex]!.bin;
  const rightBin = bins[right.binIndex]!.bin;
  const leftFree = bins[left.binIndex]!.free[left.freeIndex]!;
  const rightFree = bins[right.binIndex]!.free[right.freeIndex]!;

  if (strategy === 'preserve-wof-capable' && !isWofStrip) {
    const comparison =
      Number(leftBin.width >= usableWidth) -
      Number(rightBin.width >= usableWidth);
    if (comparison !== 0) return comparison;
  }
  if (strategy === 'largest-first') {
    const comparison = binArea(rightBin) - binArea(leftBin);
    if (comparison !== 0) return comparison;
  } else {
    const comparison =
      rectangleArea(leftFree) -
      left.width * left.height -
      (rectangleArea(rightFree) - right.width * right.height);
    if (comparison !== 0) return comparison;
    const binComparison = binArea(leftBin) - binArea(rightBin);
    if (binComparison !== 0) return binComparison;
  }

  const binComparison = compareText(leftBin.id, rightBin.id);
  if (binComparison !== 0) return binComparison;
  const freeAreaComparison = rectangleArea(leftFree) - rectangleArea(rightFree);
  if (freeAreaComparison !== 0) return freeAreaComparison;
  if (leftFree.y !== rightFree.y) return leftFree.y - rightFree.y;
  if (leftFree.x !== rightFree.x) return leftFree.x - rightFree.x;
  return Number(left.rotated) - Number(right.rotated);
}

function contains(outer: LeftoverRectangle, inner: LeftoverRectangle): boolean {
  return (
    outer.x <= inner.x &&
    outer.y <= inner.y &&
    fitsWithin(inner.x + inner.width, outer.x + outer.width) &&
    fitsWithin(inner.y + inner.height, outer.y + outer.height)
  );
}

function pruneRectangles(
  rectangles: readonly LeftoverRectangle[],
): LeftoverRectangle[] {
  return rectangles
    .filter((rectangle) => rectangle.width > 0 && rectangle.height > 0)
    .filter(
      (rectangle, index, all) =>
        !all.some(
          (other, otherIndex) =>
            otherIndex !== index && contains(other, rectangle),
        ),
    )
    .sort((left, right) =>
      left.y !== right.y
        ? left.y - right.y
        : left.x !== right.x
          ? left.x - right.x
          : rectangleArea(right) - rectangleArea(left),
    );
}

function splitFreeRectangle(
  free: LeftoverRectangle,
  width: number,
  height: number,
  strategy: FiniteStockSplitStrategy,
): LeftoverRectangle[] {
  if (strategy === 'crosswise-first') {
    return [
      {
        x: free.x + width,
        y: free.y,
        width: positiveRemainder(free.width, width),
        height,
      },
      {
        x: free.x,
        y: free.y + height,
        width: free.width,
        height: positiveRemainder(free.height, height),
      },
    ];
  }
  return [
    {
      x: free.x + width,
      y: free.y,
      width: positiveRemainder(free.width, width),
      height: free.height,
    },
    {
      x: free.x,
      y: free.y + height,
      width,
      height: positiveRemainder(free.height, height),
    },
  ];
}

function packCandidate(
  fabric: FabricSpec,
  materialBins: readonly MaterialBin[],
  pieces: readonly NormalizedPieceGroup[],
  strategy: FiniteStockStrategy,
  strategyIndex: number,
): FiniteStockCandidate {
  const bins: MutableBin[] = materialBins.map((bin) => ({
    bin,
    placements: [],
    free: [{ x: 0, y: 0, width: bin.width, height: bin.length }],
  }));
  const unallocated: UnallocatedPieceInstance[] = [];

  for (const instance of expandPieces(pieces, strategy.piece)) {
    const choices: PlacementChoice[] = [];
    for (let binIndex = 0; binIndex < bins.length; binIndex += 1) {
      const mutableBin = bins[binIndex]!;
      if (
        instance.group.isWofStrip === true &&
        !fitsWithin(fabric.usableWidth, mutableBin.bin.width)
      ) {
        continue;
      }
      for (
        let freeIndex = 0;
        freeIndex < mutableBin.free.length;
        freeIndex += 1
      ) {
        const free = mutableBin.free[freeIndex]!;
        for (const orientation of allowedOrientations(instance.group)) {
          if (
            fitsWithin(orientation.width, free.width) &&
            fitsWithin(orientation.height, free.height)
          ) {
            choices.push({ binIndex, freeIndex, ...orientation });
          }
        }
      }
    }
    choices.sort((left, right) =>
      compareChoices(
        left,
        right,
        bins,
        strategy.bin,
        instance.group.isWofStrip === true,
        fabric.usableWidth,
      ),
    );
    const choice = choices[0];
    if (choice === undefined) {
      unallocated.push({
        pieceGroupId: instance.group.id,
        instanceIndex: instance.instanceIndex,
        width: instance.group.width,
        height: instance.group.height,
        rotationAllowed: instance.group.rotationAllowed,
        orientationConstraint: instance.group.orientationConstraint,
        isWofStrip: instance.group.isWofStrip === true,
      });
      continue;
    }

    const target = bins[choice.binIndex]!;
    const free = target.free[choice.freeIndex]!;
    target.placements.push({
      pieceGroupId: instance.group.id,
      instanceIndex: instance.instanceIndex,
      x: free.x,
      y: free.y,
      width: choice.width,
      height: choice.height,
      rotated: choice.rotated,
      materialBinId: target.bin.id,
      stockPieceId: target.bin.stockPieceId,
      stockInstanceIndex: target.bin.stockInstanceIndex,
      fabricId: target.bin.fabricId,
    });
    target.free.splice(
      choice.freeIndex,
      1,
      ...splitFreeRectangle(free, choice.width, choice.height, strategy.split),
    );
    target.free = pruneRectangles(target.free);
  }

  const binResults = bins.map(({ bin, placements, free }) => {
    const usedArea = placements.reduce(
      (total, placement) => total + rectangleArea(placement),
      0,
    );
    return {
      bin,
      placements,
      leftovers: free,
      usedArea,
      unusedArea: Math.max(0, positiveRemainder(binArea(bin), usedArea)),
    };
  });
  const placements = binResults.flatMap((bin) => bin.placements);
  const allocatedArea = placements.reduce(
    (total, placement) => total + rectangleArea(placement),
    0,
  );
  const totalStockArea = materialBins.reduce(
    (total, bin) => total + binArea(bin),
    0,
  );
  const leftovers = binResults.flatMap((bin) => bin.leftovers);
  return {
    strategy,
    strategyIndex,
    bins: binResults,
    placements,
    unallocated,
    allocatedArea,
    unusedStockArea: Math.max(
      0,
      positiveRemainder(totalStockArea, allocatedArea),
    ),
    fragmentation: leftovers.length,
    largestLeftoverArea: Math.max(0, ...leftovers.map(rectangleArea)),
  };
}

function compareCandidates(
  left: FiniteStockCandidate,
  right: FiniteStockCandidate,
): number {
  if (left.unallocated.length !== right.unallocated.length) {
    return left.unallocated.length - right.unallocated.length;
  }
  if (left.allocatedArea !== right.allocatedArea) {
    return right.allocatedArea - left.allocatedArea;
  }
  if (left.fragmentation !== right.fragmentation) {
    return left.fragmentation - right.fragmentation;
  }
  if (left.largestLeftoverArea !== right.largestLeftoverArea) {
    return right.largestLeftoverArea - left.largestLeftoverArea;
  }
  return left.strategyIndex - right.strategyIndex;
}

class RangeMaximumTree {
  private readonly maximum: number[];
  private readonly lazy: number[];

  constructor(private readonly size: number) {
    this.maximum = Array.from({ length: Math.max(1, size * 4) }, () => 0);
    this.lazy = Array.from({ length: Math.max(1, size * 4) }, () => 0);
  }

  add(from: number, to: number, value: number): void {
    this.update(1, 0, this.size - 1, from, to, value);
  }

  query(from: number, to: number): number {
    return this.read(1, 0, this.size - 1, from, to);
  }

  private update(
    node: number,
    left: number,
    right: number,
    from: number,
    to: number,
    value: number,
  ): void {
    if (from <= left && right <= to) {
      this.maximum[node] = (this.maximum[node] ?? 0) + value;
      this.lazy[node] = (this.lazy[node] ?? 0) + value;
      return;
    }
    const middle = Math.floor((left + right) / 2);
    if (from <= middle) this.update(node * 2, left, middle, from, to, value);
    if (to > middle)
      this.update(node * 2 + 1, middle + 1, right, from, to, value);
    this.maximum[node] =
      (this.lazy[node] ?? 0) +
      Math.max(this.maximum[node * 2] ?? 0, this.maximum[node * 2 + 1] ?? 0);
  }

  private read(
    node: number,
    left: number,
    right: number,
    from: number,
    to: number,
  ): number {
    if (from <= left && right <= to) return this.maximum[node] ?? 0;
    const middle = Math.floor((left + right) / 2);
    let result = 0;
    if (from <= middle) result = this.read(node * 2, left, middle, from, to);
    if (to > middle) {
      result = Math.max(
        result,
        this.read(node * 2 + 1, middle + 1, right, from, to),
      );
    }
    return (this.lazy[node] ?? 0) + result;
  }
}

function placementsOverlap(
  placements: readonly FiniteStockPlacement[],
): boolean {
  if (placements.length < 2) return false;
  const yCoordinates = [
    ...new Set(
      placements.flatMap((placement) => [
        placement.y,
        placement.y + placement.height,
      ]),
    ),
  ].sort((left, right) => left - right);
  const yIndexes = new Map(
    yCoordinates.map((coordinate, index) => [coordinate, index]),
  );
  const events = placements
    .flatMap((placement) => [
      {
        x: placement.x,
        delta: 1,
        from: yIndexes.get(placement.y)!,
        to: yIndexes.get(placement.y + placement.height)! - 1,
      },
      {
        x: placement.x + placement.width,
        delta: -1,
        from: yIndexes.get(placement.y)!,
        to: yIndexes.get(placement.y + placement.height)! - 1,
      },
    ])
    .sort((left, right) =>
      left.x !== right.x ? left.x - right.x : left.delta - right.delta,
    );
  const tree = new RangeMaximumTree(yCoordinates.length - 1);
  for (const event of events) {
    if (event.delta > 0 && tree.query(event.from, event.to) > 0) return true;
    tree.add(event.from, event.to, event.delta);
  }
  return false;
}

function isValidCandidate(
  candidate: FiniteStockCandidate,
  fabric: FabricSpec,
  materialBins: readonly MaterialBin[],
  pieces: readonly NormalizedPieceGroup[],
): boolean {
  const groups = new Map(pieces.map((piece) => [piece.id, piece]));
  const bins = new Map(materialBins.map((bin) => [bin.id, bin]));
  const expected = new Set(
    pieces.flatMap((piece) =>
      Array.from(
        { length: piece.quantity },
        (_, instanceIndex) => `${piece.id}:${instanceIndex}`,
      ),
    ),
  );
  const accounted = new Set<string>();

  for (const placement of candidate.placements) {
    const group = groups.get(placement.pieceGroupId);
    const bin = bins.get(placement.materialBinId);
    const key = `${placement.pieceGroupId}:${placement.instanceIndex}`;
    if (
      group === undefined ||
      bin === undefined ||
      !expected.has(key) ||
      accounted.has(key) ||
      placement.fabricId !== fabric.id ||
      placement.fabricId !== bin.fabricId ||
      placement.stockPieceId !== bin.stockPieceId ||
      placement.stockInstanceIndex !== bin.stockInstanceIndex
    ) {
      return false;
    }
    accounted.add(key);

    const orientation = group.orientationConstraint ?? 'none';
    const dimensionsMatch = placement.rotated
      ? group.rotationAllowed &&
        orientation !== 'crosswise' &&
        group.isWofStrip !== true &&
        placement.width === group.height &&
        placement.height === group.width
      : orientation !== 'lengthwise' &&
        placement.width === group.width &&
        placement.height === group.height;
    if (
      !dimensionsMatch ||
      placement.x < 0 ||
      placement.y < 0 ||
      !fitsWithin(placement.x + placement.width, bin.width) ||
      !fitsWithin(placement.y + placement.height, bin.length) ||
      (group.isWofStrip === true &&
        (!fitsWithin(fabric.usableWidth, bin.width) ||
          placement.rotated ||
          placement.width !== fabric.usableWidth))
    ) {
      return false;
    }
  }

  for (const unallocated of candidate.unallocated) {
    const group = groups.get(unallocated.pieceGroupId);
    const key = `${unallocated.pieceGroupId}:${unallocated.instanceIndex}`;
    if (
      group === undefined ||
      !expected.has(key) ||
      accounted.has(key) ||
      unallocated.width !== group.width ||
      unallocated.height !== group.height ||
      unallocated.rotationAllowed !== group.rotationAllowed ||
      unallocated.orientationConstraint !== group.orientationConstraint ||
      unallocated.isWofStrip !== (group.isWofStrip === true)
    ) {
      return false;
    }
    accounted.add(key);
  }
  if (accounted.size !== expected.size) return false;

  let nestedPlacementCount = 0;
  for (const binResult of candidate.bins) {
    const knownBin = bins.get(binResult.bin.id);
    if (
      knownBin === undefined ||
      knownBin.stockPieceId !== binResult.bin.stockPieceId ||
      binResult.placements.some(
        (placement) => placement.materialBinId !== binResult.bin.id,
      )
    ) {
      return false;
    }
    nestedPlacementCount += binResult.placements.length;
    if (placementsOverlap(binResult.placements)) return false;
  }
  return nestedPlacementCount === candidate.placements.length;
}

export function generateFiniteStockCandidates(
  fabric: FabricSpec,
  stockPieces: readonly StockPiece[],
  pieces: readonly NormalizedPieceGroup[],
  options: FiniteStockOptions = {},
): FiniteStockCandidate[] | ValidationError[] {
  const limits = mergeLimits(options.limits);
  const errors = validateInput(fabric, stockPieces, pieces, limits);
  if (errors.length > 0) return errors;

  const materialBins = expandBins(stockPieces);
  const placementCount = pieces.reduce(
    (total, piece) => total + piece.quantity,
    0,
  );
  const pieceStrategies =
    placementCount > limits.fullStrategyPlacementLimit
      ? (['strip-friendly-first'] as const)
      : PIECE_STRATEGIES;
  const candidates: FiniteStockCandidate[] = [];
  let strategyIndex = 0;
  for (const piece of pieceStrategies) {
    for (const bin of BIN_STRATEGIES) {
      for (const split of SPLIT_STRATEGIES) {
        const candidate = packCandidate(
          fabric,
          materialBins,
          pieces,
          { piece, bin, split },
          strategyIndex,
        );
        if (isValidCandidate(candidate, fabric, materialBins, pieces)) {
          candidates.push(candidate);
        }
        strategyIndex += 1;
      }
    }
  }
  return candidates.length > 0
    ? candidates
    : [
        {
          code: 'optimizer-no-valid-layout',
          field: 'pieces',
          message:
            'The planner could not create a valid layout in the entered stock. Check stock dimensions and each piece’s rotation or orientation settings.',
        },
      ];
}

export function allocateFiniteStock(
  fabric: FabricSpec,
  stockPieces: readonly StockPiece[],
  pieces: readonly NormalizedPieceGroup[],
  options: FiniteStockOptions = {},
): FiniteStockAllocationResult {
  const generated = generateFiniteStockCandidates(
    fabric,
    stockPieces,
    pieces,
    options,
  );
  if (generated.length === 0 || 'code' in generated[0]!) {
    return {
      ok: false,
      errors: generated as ValidationError[],
      warnings: [],
    };
  }
  const selected = [...(generated as FiniteStockCandidate[])].sort(
    compareCandidates,
  )[0]!;
  const fullyAllocated = selected.unallocated.length === 0;
  const warnings: FiniteStockWarning[] = [];
  if (fullyAllocated && fabric.safetyAllowancePercent > 0) {
    warnings.push({
      code: 'stock-safety-not-applied',
      message:
        'Existing stock covers every piece. Safety allowance applies only to new purchases, so no purchase is recommended.',
    });
  }
  const placementCount = pieces.reduce(
    (total, piece) => total + piece.quantity,
    0,
  );
  const limits = mergeLimits(options.limits);
  if (placementCount > limits.fullStrategyPlacementLimit) {
    warnings.push({
      code: 'performance-fallback',
      message:
        'A bounded strip-friendly strategy set was used to keep this large stock allocation responsive.',
    });
  }
  return {
    ok: true,
    fullyAllocated,
    bins: selected.bins,
    placements: selected.placements,
    unallocated: selected.unallocated,
    usedStockArea: selected.allocatedArea,
    unusedStockArea: selected.unusedStockArea,
    rawAdditionalPurchase: fullyAllocated ? 0 : null,
    bufferedPurchase: fullyAllocated ? 0 : null,
    recommendedPurchase: fullyAllocated ? 0 : null,
    strategy: selected.strategy,
    warnings,
  };
}
