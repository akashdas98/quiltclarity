import type { FabricSpec, NormalizedPieceGroup, PieceGroup } from './types';

export type ValidationErrorCode =
  | 'not-finite'
  | 'not-positive'
  | 'not-non-negative'
  | 'not-positive-integer'
  | 'usable-width-exceeds-fabric-width'
  | 'no-fabrics'
  | 'duplicate-fabric-id'
  | 'duplicate-piece-id'
  | 'duplicate-stock-id'
  | 'stock-fabric-mismatch'
  | 'invalid-flying-geese-ratio'
  | 'missing-fabric-assignment'
  | 'unknown-fabric-assignment'
  | 'no-pieces'
  | 'performance-limit'
  | 'optimizer-no-valid-layout'
  | 'piece-does-not-fit';

export interface ValidationError {
  code: ValidationErrorCode;
  field: string;
  message: string;
  pieceId?: string;
  stockPieceId?: string;
}

const VALIDATION_FIELD_LABELS: Readonly<Record<string, string>> = {
  columns: 'Block columns',
  fabricWidth: 'Nominal fabric width',
  finishedBlockHeight: 'Finished block height',
  finishedBlockWidth: 'Finished block width',
  finishedBorderWidth: 'Finished border width',
  finishedHeight: 'Finished height',
  finishedSashingWidth: 'Finished sashing width',
  finishedSize: 'Finished size',
  finishedWidth: 'Finished width',
  handlingBuffer: 'Handling buffer',
  height: 'Piece height',
  joinSeamAllowance: 'Join seam allowance',
  joiningAllowance: 'Joining allowance',
  layers: 'Border layers',
  overagePerSide: 'Overage per side',
  panelSeamAllowance: 'Panel seam allowance',
  patternAssumedUsableWidth: 'Pattern usable WOF',
  patternStatedAmount: 'Pattern yardage',
  pieceHeight: 'Piece height',
  pieceWidth: 'Piece width',
  purchaseIncrement: 'Purchase increment',
  quantity: 'Quantity',
  quiltLength: 'Quilt length',
  quiltWidth: 'Quilt width',
  requiredLinearLength: 'Required joined length',
  rollWidth: 'Batting roll width',
  rows: 'Block rows',
  safetyAllowancePercent: 'Safety allowance',
  seamAllowance: 'Seam allowance',
  stockLength: 'Fabric length',
  'stock.length': 'Stock length',
  'stock.quantity': 'Stock quantity',
  stockWidth: 'Fabric width',
  'stock.width': 'Stock width',
  stripWidth: 'Strip width',
  targetLength: 'Target quilt length',
  targetWidth: 'Target quilt width',
  usableBackingWidth: 'Usable backing width',
  usableWidth: 'Usable fabric width',
  currentUsableWidth: 'Current usable fabric width',
  width: 'Piece width',
};

export function validationFieldLabel(field: string): string {
  const known = VALIDATION_FIELD_LABELS[field];
  if (known) return known;
  const readable = field
    .split('.')
    .at(-1)!
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase();
  return readable.charAt(0).toUpperCase() + readable.slice(1);
}

export function validatePositiveNumber(
  value: number,
  field: string,
): ValidationError[] {
  const label = validationFieldLabel(field);
  if (!Number.isFinite(value)) {
    return [
      { code: 'not-finite', field, message: `${label} must be a number.` },
    ];
  }

  if (value <= 0) {
    return [
      {
        code: 'not-positive',
        field,
        message: `${label} must be greater than zero.`,
      },
    ];
  }

  return [];
}

export function validateNonNegativeNumber(
  value: number,
  field: string,
): ValidationError[] {
  const label = validationFieldLabel(field);
  if (!Number.isFinite(value)) {
    return [
      { code: 'not-finite', field, message: `${label} must be a number.` },
    ];
  }
  if (value < 0) {
    return [
      {
        code: 'not-non-negative',
        field,
        message: `${label} must be zero or greater.`,
      },
    ];
  }
  return [];
}

export function validatePositiveInteger(
  value: number,
  field: string,
): ValidationError[] {
  const label = validationFieldLabel(field);
  if (!Number.isFinite(value) || !Number.isInteger(value) || value <= 0) {
    return [
      {
        code: 'not-positive-integer',
        field,
        message: `${label} must be a whole number of at least 1.`,
      },
    ];
  }
  return [];
}

export function validateFabricSpec(fabric: FabricSpec): ValidationError[] {
  const errors = [
    ...validatePositiveNumber(fabric.fabricWidth, 'fabricWidth'),
    ...validatePositiveNumber(fabric.usableWidth, 'usableWidth'),
    ...validatePositiveNumber(fabric.purchaseIncrement, 'purchaseIncrement'),
    ...validateNonNegativeNumber(
      fabric.safetyAllowancePercent,
      'safetyAllowancePercent',
    ),
  ];

  if (
    Number.isFinite(fabric.usableWidth) &&
    Number.isFinite(fabric.fabricWidth) &&
    fabric.usableWidth > fabric.fabricWidth
  ) {
    errors.push({
      code: 'usable-width-exceeds-fabric-width',
      field: 'usableWidth',
      message:
        'Usable fabric width cannot be greater than nominal fabric width.',
    });
  }

  return errors;
}

export function validatePieceGroup(piece: PieceGroup): ValidationError[] {
  const errors = [
    ...validatePositiveNumber(piece.width, 'width'),
    ...validatePositiveNumber(piece.height, 'height'),
    ...validatePositiveInteger(piece.quantity, 'quantity'),
  ];

  return errors.map((error) => ({ ...error, pieceId: piece.id }));
}

export function validateSeamAllowance(
  seamAllowance: number,
): ValidationError[] {
  return validateNonNegativeNumber(seamAllowance, 'seamAllowance');
}

export function validatePieceFitsFabric(
  piece: NormalizedPieceGroup,
  usableWidth: number,
): ValidationError[] {
  const orientation = piece.orientationConstraint ?? 'none';
  const fitsUnrotated =
    orientation !== 'lengthwise' && piece.width <= usableWidth;
  const fitsRotated =
    orientation !== 'crosswise' &&
    piece.rotationAllowed &&
    piece.height <= usableWidth;

  if (fitsUnrotated || fitsRotated) {
    return [];
  }

  return [
    {
      code: 'piece-does-not-fit',
      field: 'width',
      pieceId: piece.id,
      message:
        'This piece cannot fit across the available fabric width in any allowed orientation. Reduce its size, increase usable width, or allow a valid rotation.',
    },
  ];
}
