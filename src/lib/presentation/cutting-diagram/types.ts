import type { UnitSystem } from '../../domain';

export interface CuttingDiagramOptions {
  width?: number;
  padding?: number;
  unitSystem?: UnitSystem;
  idPrefix?: string;
}

export interface ProjectedRectangle {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramPiece extends ProjectedRectangle {
  pieceGroupId: string;
  instanceIndex: number;
  label: string;
  dimensionLabel: string;
  rotated: boolean;
  patternIndex: number;
}

export interface DiagramWasteRegion extends ProjectedRectangle {
  rowIndex: number;
  kind: 'row-remainder' | 'above-shorter-piece' | 'stock-leftover';
}

export interface DiagramStripBoundary {
  sourceY: number;
  y: number;
}

export interface DiagramTextRow {
  rowIndex: number;
  startLabel: string;
  heightLabel: string;
  runs: DiagramTextRun[];
  unusedWidthLabel?: string;
  text: string;
}

export interface DiagramTextRun {
  label: string;
  pieceGroupId: string;
  instanceLabel: string;
  dimensionLabel: string;
  rotated: boolean;
  startLabel: string;
  endLabel: string;
}

export interface DiagramTextPieceGroup {
  label: string;
  pieceGroupId: string;
  quantity: number;
  dimensionLabel: string;
}

export interface CuttingDiagramTextAlternative {
  title: string;
  summary: string;
  pieceSummary: string[];
  pieceGroups: DiagramTextPieceGroup[];
  rows: DiagramTextRow[];
  text: string;
  layoutMode?: 'strips' | 'placements';
}

export interface CuttingDiagramModel {
  idPrefix: string;
  width: number;
  height: number;
  padding: number;
  scale: number;
  sourceUsableWidth: number;
  sourceUsedLength: number;
  usableWidthLabel: string;
  usedLengthLabel: string;
  directional: boolean;
  lengthAxisLabel?: string;
  pieces: DiagramPiece[];
  wasteRegions: DiagramWasteRegion[];
  stripBoundaries: DiagramStripBoundary[];
  textAlternative: CuttingDiagramTextAlternative;
}
