import type { CutRequirement, FabricPlan } from './project-model';
import type { DimensionMode, UnitSystem } from './types';
import { toMillimetres, type LengthUnit } from './units';

export const CUT_LIST_PASTE_COLUMNS = [
  'Fabric',
  'Label',
  'Qty',
  'Width',
  'Height',
  'Size mode',
] as const;

type PasteColumn =
  'fabric' | 'label' | 'quantity' | 'width' | 'height' | 'dimensionMode';

export interface CutListPasteIssue {
  column: PasteColumn | 'row';
  message: string;
}

export interface CutListPasteRow {
  sourceRow: number;
  sourceFabric: string;
  label: string;
  quantity?: number;
  width?: number;
  height?: number;
  dimensionMode?: DimensionMode;
  fabricId?: string;
  issues: CutListPasteIssue[];
}

export interface CutListPastePreview {
  headerDetected: boolean;
  sourceFormat: 'spreadsheet' | 'csv';
  rows: CutListPasteRow[];
  canImport: boolean;
}

export interface CutListFabricMapping {
  sourceFabric: string;
  fabricId: string;
}

const HEADER_ALIASES: Readonly<Record<string, PasteColumn>> = {
  fabric: 'fabric',
  'fabric name': 'fabric',
  piece: 'label',
  label: 'label',
  'piece label': 'label',
  qty: 'quantity',
  quantity: 'quantity',
  width: 'width',
  height: 'height',
  'size mode': 'dimensionMode',
  mode: 'dimensionMode',
  'cut/finished': 'dimensionMode',
};

const POSITIONAL_COLUMNS: readonly PasteColumn[] = [
  'fabric',
  'label',
  'quantity',
  'width',
  'height',
  'dimensionMode',
];

interface TokenizedPasteRow {
  sourceRow: number;
  cells: string[];
  syntaxIssue?: string;
}

function detectPasteFormat(source: string): {
  delimiter: '\t' | ',';
  sourceFormat: CutListPastePreview['sourceFormat'];
} {
  const firstLine = source
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .find((line) => line.trim() !== '');
  if (!firstLine) return { delimiter: '\t', sourceFormat: 'spreadsheet' };

  let inQuotes = false;
  let tabs = 0;
  let commas = 0;
  for (let index = 0; index < firstLine.length; index += 1) {
    const character = firstLine[index]!;
    if (character === '"') {
      if (inQuotes && firstLine[index + 1] === '"') index += 1;
      else inQuotes = !inQuotes;
    } else if (!inQuotes && character === '\t') tabs += 1;
    else if (!inQuotes && character === ',') commas += 1;
  }
  return commas > tabs
    ? { delimiter: ',', sourceFormat: 'csv' }
    : { delimiter: '\t', sourceFormat: 'spreadsheet' };
}

function tokenizePaste(
  source: string,
  delimiter: '\t' | ',',
): TokenizedPasteRow[] {
  const normalized = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const rows: TokenizedPasteRow[] = [];
  let cells: string[] = [];
  let cell = '';
  let inQuotes = false;
  let sourceRow = 1;
  let currentLine = 1;
  let syntaxIssue: string | undefined;

  const finishRow = (): void => {
    cells.push(cell);
    rows.push({ sourceRow, cells, syntaxIssue });
    cells = [];
    cell = '';
    syntaxIssue = undefined;
  };

  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index]!;
    if (inQuotes) {
      if (character === '"') {
        if (normalized[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += character;
        if (character === '\n') currentLine += 1;
      }
      continue;
    }
    if (character === delimiter) {
      cells.push(cell);
      cell = '';
    } else if (character === '\n') {
      finishRow();
      currentLine += 1;
      sourceRow = currentLine;
    } else if (character === '"') {
      if (cell.trim() === '') {
        cell = '';
        inQuotes = true;
      } else {
        syntaxIssue ??= 'Quotes must wrap an entire field.';
        cell += character;
      }
    } else {
      cell += character;
    }
  }
  if (inQuotes) syntaxIssue = 'A quoted field is not closed.';
  finishRow();
  return rows.filter(({ cells: rowCells }) =>
    rowCells.some((value) => value.trim() !== ''),
  );
}

const UNICODE_FRACTIONS: Readonly<Record<string, number>> = {
  '¼': 1 / 4,
  '½': 1 / 2,
  '¾': 3 / 4,
  '⅛': 1 / 8,
  '⅜': 3 / 8,
  '⅝': 5 / 8,
  '⅞': 7 / 8,
};

function normalizedHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
}

function parseHeader(
  cells: readonly string[],
): Map<PasteColumn, number> | undefined {
  const columns = new Map<PasteColumn, number>();
  cells.forEach((cell, index) => {
    const column = HEADER_ALIASES[normalizedHeader(cell)];
    if (column !== undefined && !columns.has(column))
      columns.set(column, index);
  });
  return columns.has('fabric') &&
    columns.has('quantity') &&
    columns.has('width') &&
    columns.has('height')
    ? columns
    : undefined;
}

function parseNumberOrFraction(source: string): number | undefined {
  const value = source.trim().replace(/−/g, '-');
  const unicode = value.match(/^(\d+(?:\.\d+)?)?\s*([¼½¾⅛⅜⅝⅞])$/u);
  if (unicode) {
    return Number(unicode[1] ?? 0) + UNICODE_FRACTIONS[unicode[2]!]!;
  }
  const mixed = value.match(/^(\d+)\s*(?:-|\s)\s*(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const denominator = Number(mixed[3]);
    if (denominator === 0) return undefined;
    return Number(mixed[1]) + Number(mixed[2]) / denominator;
  }
  const fraction = value.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fraction) {
    const denominator = Number(fraction[2]);
    if (denominator === 0) return undefined;
    return Number(fraction[1]) / denominator;
  }
  if (!/^\d+(?:\.\d+)?$/.test(value)) return undefined;
  return Number(value);
}

/** Parses one explicit tabular dimension; it never guesses prose or compound units. */
export function parseCutListDimension(
  source: string,
  defaultUnitSystem: UnitSystem,
): number | undefined {
  const match = source
    .trim()
    .toLowerCase()
    .match(
      /^(.*?)\s*(mm|millimetres?|millimeters?|cm|centimetres?|centimeters?|in|inches?|")?$/,
    );
  if (!match) return undefined;
  const value = parseNumberOrFraction(match[1] ?? '');
  if (value === undefined || !Number.isFinite(value) || value <= 0)
    return undefined;
  const suffix = match[2];
  let unit: LengthUnit;
  if (!suffix) unit = defaultUnitSystem === 'imperial' ? 'inch' : 'centimetre';
  else if (suffix === 'mm' || suffix.startsWith('milli')) unit = 'millimetre';
  else if (suffix === 'cm' || suffix.startsWith('centi')) unit = 'centimetre';
  else unit = 'inch';
  return toMillimetres(value, unit);
}

function parseMode(value: string): DimensionMode | undefined {
  const normalized = normalizedHeader(value);
  if (normalized === 'cut' || normalized === 'cut size') return 'cut';
  if (normalized === 'finished' || normalized === 'finished size')
    return 'finished';
  return undefined;
}

function findFabric(
  sourceFabric: string,
  fabrics: readonly Pick<FabricPlan, 'id' | 'name'>[],
  mappings: readonly CutListFabricMapping[],
): string | undefined {
  const mapped = mappings.find(
    (mapping) =>
      normalizedHeader(mapping.sourceFabric) === normalizedHeader(sourceFabric),
  );
  if (mapped && fabrics.some((fabric) => fabric.id === mapped.fabricId))
    return mapped.fabricId;
  const matches = fabrics.filter(
    (fabric) =>
      normalizedHeader(fabric.name) === normalizedHeader(sourceFabric),
  );
  return matches.length === 1 ? matches[0]!.id : undefined;
}

export function previewCutListPaste(
  source: string,
  fabrics: readonly Pick<FabricPlan, 'id' | 'name'>[],
  unitSystem: UnitSystem,
  mappings: readonly CutListFabricMapping[] = [],
): CutListPastePreview {
  const { delimiter, sourceFormat } = detectPasteFormat(source);
  const tokenized = tokenizePaste(source, delimiter);
  if (tokenized.length === 0)
    return {
      headerDetected: false,
      sourceFormat,
      rows: [],
      canImport: false,
    };

  const header = parseHeader(tokenized[0]!.cells);
  const columnIndexes =
    header ??
    new Map(POSITIONAL_COLUMNS.map((column, index) => [column, index]));
  const dataRows = header ? tokenized.slice(1) : tokenized;
  const rows = dataRows.map(
    ({ sourceRow, cells, syntaxIssue }): CutListPasteRow => {
      const cell = (column: PasteColumn): string =>
        cells[columnIndexes.get(column) ?? -1]?.trim() ?? '';
      const sourceFabric = cell('fabric');
      const label = cell('label');
      const quantitySource = cell('quantity');
      const widthSource = cell('width');
      const heightSource = cell('height');
      const modeSource = cell('dimensionMode');
      const quantity = /^\d+$/.test(quantitySource)
        ? Number(quantitySource)
        : undefined;
      const width = parseCutListDimension(widthSource, unitSystem);
      const height = parseCutListDimension(heightSource, unitSystem);
      const dimensionMode = parseMode(modeSource);
      const fabricId = findFabric(sourceFabric, fabrics, mappings);
      const issues: CutListPasteIssue[] = [];
      if (syntaxIssue) issues.push({ column: 'row', message: syntaxIssue });
      if (cells.length !== columnIndexes.size)
        issues.push({
          column: 'row',
          message:
            sourceFormat === 'csv'
              ? `Expected ${columnIndexes.size} CSV columns.`
              : `Expected ${columnIndexes.size} tab-separated columns.`,
        });
      if (!sourceFabric)
        issues.push({ column: 'fabric', message: 'Fabric is required.' });
      else if (!fabricId)
        issues.push({
          column: 'fabric',
          message: `“${sourceFabric}” does not match a project fabric. Choose a fabric before importing.`,
        });
      if (!label)
        issues.push({ column: 'label', message: 'Piece label is required.' });
      if (quantity === undefined || quantity < 1)
        issues.push({
          column: 'quantity',
          message: 'Quantity must be a whole number of at least 1.',
        });
      if (width === undefined)
        issues.push({
          column: 'width',
          message: 'Width must be one positive number or fraction.',
        });
      if (height === undefined)
        issues.push({
          column: 'height',
          message: 'Height must be one positive number or fraction.',
        });
      if (dimensionMode === undefined)
        issues.push({
          column: 'dimensionMode',
          message: 'Size mode must be Cut or Finished.',
        });
      return {
        sourceRow,
        sourceFabric,
        label,
        quantity,
        width,
        height,
        dimensionMode,
        fabricId,
        issues,
      };
    },
  );
  return {
    headerDetected: header !== undefined,
    sourceFormat,
    rows,
    canImport: rows.length > 0 && rows.every((row) => row.issues.length === 0),
  };
}

export function compileCutListPaste(
  preview: CutListPastePreview,
  createId: () => string,
): CutRequirement[] {
  if (!preview.canImport)
    throw new Error('Resolve every paste preview error before importing.');
  return preview.rows.map((row) => ({
    id: createId(),
    fabricId: row.fabricId!,
    label: row.label,
    quantity: row.quantity!,
    width: row.width!,
    height: row.height!,
    dimensionMode: row.dimensionMode!,
    orientation: 'none',
    isWofStrip: false,
  }));
}
