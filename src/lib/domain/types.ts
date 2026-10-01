export type UnitSystem = 'imperial' | 'metric';

export type DimensionMode = 'cut' | 'finished';

export type OrientationConstraint = 'none' | 'crosswise' | 'lengthwise';

/** All length fields are canonical millimetres. */
export interface FabricSpec {
  id: string;
  name: string;
  fabricWidth: number;
  usableWidth: number;
  directional: boolean;
  defaultRotationAllowed: boolean;
  safetyAllowancePercent: number;
  purchaseIncrement: number;
  notes?: string;
}

/** Width and height are canonical millimetres. */
export interface PieceGroup {
  id: string;
  label: string;
  quantity: number;
  width: number;
  height: number;
  dimensionMode: DimensionMode;
  rotationAllowed?: boolean;
  orientationConstraint?: OrientationConstraint;
  isWofStrip?: boolean;
  notes?: string;
}

export interface NormalizedPieceGroup extends Omit<
  PieceGroup,
  'dimensionMode' | 'rotationAllowed'
> {
  dimensionMode: 'cut';
  sourceDimensionMode: DimensionMode;
  rotationAllowed: boolean;
}
