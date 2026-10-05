import {
  fromMillimetres,
  compileCutListPaste,
  formatImperialInches,
  normalizePieceGroup,
  pieceGroupFromRequirement,
  reconcileProject,
  PLANNER_PROJECT_SCHEMA_VERSION,
  previewCutListPaste,
  toMillimetres,
  type CutListFabricMapping,
  type CutListPastePreview,
  type CutRequirement,
  type FabricPlan,
  type PlanningComparison,
  type PlannerProject,
  type ReconciledProjectSuccess,
  type StockPiece,
  type StockSourceType,
  type UnitSystem,
} from '../lib/domain';
import { restorePlannerProject, savePlannerProject } from '../lib/persistence';
import {
  createReconciledCuttingPlans,
  formatWasteAreaValue,
  renderCuttingDiagramSvg,
  type CuttingDiagramModel,
  type ReconciledMaterialPlan,
} from '../lib/presentation';
import { CONTEXT_HELP, type ContextHelpEntry, type HelpKey } from '../lib/help';
import {
  emitAnalytics,
  isReturningToolUser,
  type AnalyticsPasteRowsBucket,
  type AnalyticsPlannerContext,
  type AnalyticsStockSource,
} from '../lib/analytics';
import { shouldExportPlannerPdf } from '../lib/printing/print-action';

const form = required<HTMLFormElement>('planner-form');
const fabricsRoot = required<HTMLElement>('fabrics');
const fabricTemplate = required<HTMLTemplateElement>('fabric-template');
const stockPieceTemplate = required<HTMLTemplateElement>(
  'stock-piece-template',
);
const cutListRoot = required<HTMLTableSectionElement>('cut-list-rows');
const cutListTableWrap = required<HTMLElement>('cut-list-table-wrap');
const cutListEmpty = required<HTMLElement>('cut-list-empty');
const cutRowTemplate = required<HTMLTemplateElement>('cut-row-template');
const cutListUndo = required<HTMLElement>('cut-list-undo');
const pasteDialog = required<HTMLDialogElement>('paste-dialog');
const pasteSource = required<HTMLTextAreaElement>('paste-source');
const pastePreviewRoot = required<HTMLElement>('paste-preview');
const pasteStatus = required<HTMLElement>('paste-status');
const pasteConfirmActions = required<HTMLElement>('paste-confirm-actions');
const confirmPasteButton = required<HTMLButtonElement>('confirm-paste');
const errorsRoot = required<HTMLElement>('planner-errors');
const resultsRoot = required<HTMLElement>('planner-results');
const summaryRoot = required<HTMLElement>('project-summary');
const fabricResultsRoot = required<HTMLElement>('fabric-results');
const saveStatus = required<HTMLElement>('save-status');
const actionStatus = required<HTMLElement>('action-status');
const printMeta = required<HTMLElement>('print-meta');
const calculateButton = required<HTMLButtonElement>('calculate-plan');

let idCounter = 1;
let displayedUnit: UnitSystem = 'imperial';
let project = defaultProject('imperial');
let latestSummary = '';
let plannerStarted = false;
let deletedCut: { requirement: CutRequirement; index: number } | undefined;
let pasteMappings: CutListFabricMapping[] = [];
let pastePreview: CutListPastePreview | undefined;

function markPlannerStarted(): void {
  if (plannerStarted) return;
  plannerStarted = true;
  emitAnalytics({ name: 'planner_started' });
}

function countBucket(
  count: number,
  ranges: readonly [number, string][],
): string {
  return ranges.find(([maximum]) => count <= maximum)?.[1] ?? ranges.at(-1)![1];
}

function pasteRowsBucket(count: number): AnalyticsPasteRowsBucket {
  if (count === 0) return '0';
  return countBucket(count, [
    [5, '1-5'],
    [15, '6-15'],
    [30, '16-30'],
    [Number.POSITIVE_INFINITY, '31+'],
  ]) as AnalyticsPasteRowsBucket;
}

function plannerAnalyticsContext(): AnalyticsPlannerContext {
  const stockCount = project.fabrics.reduce(
    (total, fabric) =>
      total +
      fabric.stockPieces.reduce((sum, stock) => sum + stock.quantity, 0),
    0,
  );
  return {
    unit_system: project.unitSystem,
    fabric_bucket: countBucket(project.fabrics.length, [
      [1, '1'],
      [3, '2-3'],
      [Number.POSITIVE_INFINITY, '4+'],
    ]) as AnalyticsPlannerContext['fabric_bucket'],
    requirement_bucket: countBucket(project.cutRequirements.length, [
      [5, '1-5'],
      [15, '6-15'],
      [30, '16-30'],
      [Number.POSITIVE_INFINITY, '31+'],
    ]) as AnalyticsPlannerContext['requirement_bucket'],
    has_stock: stockCount > 0,
    stock_piece_bucket: countBucket(stockCount, [
      [0, '0'],
      [1, '1'],
      [3, '2-3'],
      [Number.POSITIVE_INFINITY, '4+'],
    ]) as AnalyticsPlannerContext['stock_piece_bucket'],
    has_pattern_comparison: project.fabrics.some(
      (fabric) => fabric.patternStatedAmount !== undefined,
    ),
    directional_used:
      project.fabrics.some((fabric) => fabric.directional) ||
      project.cutRequirements.some(
        (requirement) => requirement.orientation !== 'none',
      ),
  };
}

function stockSourceCategory(source: StockSourceType): AnalyticsStockSource {
  return source === 'partial-yardage'
    ? 'partial_yardage'
    : source === 'custom'
      ? 'custom'
      : 'preset';
}

function required<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element: ${id}`);
  return element as T;
}

function nextId(prefix: string): string {
  const id = `${prefix}-${Date.now().toString(36)}-${idCounter}`;
  idCounter += 1;
  return id;
}

function defaultProject(unitSystem: UnitSystem): PlannerProject {
  const imperial = unitSystem === 'imperial';
  const fabricId = nextId('fabric');
  return {
    id: nextId('project'),
    schemaVersion: PLANNER_PROJECT_SCHEMA_VERSION,
    unitSystem,
    defaultSeamAllowance: toMillimetres(
      imperial ? 0.25 : 0.635,
      imperial ? 'inch' : 'centimetre',
    ),
    fabrics: [
      {
        id: fabricId,
        name: 'Fabric A',
        fabricWidth: toMillimetres(
          imperial ? 42 : 107,
          imperial ? 'inch' : 'centimetre',
        ),
        usableWidth: toMillimetres(
          imperial ? 40 : 102,
          imperial ? 'inch' : 'centimetre',
        ),
        directional: false,
        defaultRotationAllowed: true,
        safetyAllowancePercent: 5,
        purchaseIncrement: toMillimetres(
          imperial ? 0.125 : 0.1,
          imperial ? 'yard' : 'metre',
        ),
        stockPieces: [],
      },
    ],
    cutRequirements: [
      {
        id: nextId('piece'),
        fabricId,
        label: 'Piece A',
        quantity: 1,
        width: toMillimetres(
          imperial ? 5 : 12.5,
          imperial ? 'inch' : 'centimetre',
        ),
        height: toMillimetres(
          imperial ? 5 : 12.5,
          imperial ? 'inch' : 'centimetre',
        ),
        dimensionMode: 'cut',
        orientation: 'none',
        isWofStrip: false,
      },
    ],
  };
}

function displayLength(mm: number, unit = displayedUnit): number {
  return Number(
    fromMillimetres(mm, unit === 'imperial' ? 'inch' : 'centimetre').toFixed(4),
  );
}

function displayPurchase(mm: number, unit = displayedUnit): number {
  return Number(
    fromMillimetres(mm, unit === 'imperial' ? 'yard' : 'metre').toFixed(4),
  );
}

function inputValue(
  root: ParentNode,
  field: string,
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  const element = root.querySelector(`[data-field="${field}"]`);
  if (!(
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  ))
    throw new Error(`Missing field: ${field}`);
  return element;
}

function setControl(
  control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  value: string | number | boolean,
): void {
  if (control instanceof HTMLInputElement && control.type === 'checkbox')
    control.checked = Boolean(value);
  else control.value = String(value);
}

function associateLabels(root: ParentNode, prefix: string): void {
  root
    .querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >('[data-field]')
    .forEach((control) => {
      const field = control.dataset.field ?? 'field';
      control.id = `${prefix}-${field}`;
      const container = control.closest('.field, .check-field');
      const label =
        container?.querySelector('label') ??
        root.querySelector(`label[data-label-for="${CSS.escape(field)}"]`);
      if (label) label.htmlFor = control.id;
    });
}

function removeContextHelp(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-context-help]').forEach((help) => {
    const previous = help.previousSibling;
    if (previous instanceof Text)
      previous.textContent =
        previous.textContent?.replaceAll('\u2060', '') ?? '';
    help.remove();
  });
}

function renderCutRow(requirement: CutRequirement, rowIndex: number): void {
  const fragment = cutRowTemplate.content.cloneNode(true);
  if (!(fragment instanceof DocumentFragment)) return;
  const node = fragment.querySelector<HTMLTableRowElement>('.cut-list-row');
  const errors = fragment.querySelector<HTMLTableRowElement>('.cut-row-errors');
  const options =
    fragment.querySelector<HTMLTableRowElement>('.cut-row-options');
  if (!node || !errors || !options) return;
  node.dataset.requirementId = requirement.id;
  errors.dataset.requirementId = requirement.id;
  options.dataset.requirementId = requirement.id;
  const fabricSelect = inputValue(node, 'fabricId');
  project.fabrics.forEach((fabric) => {
    const option = document.createElement('option');
    option.value = fabric.id;
    option.textContent = fabric.name;
    fabricSelect.append(option);
  });
  setControl(fabricSelect, requirement.fabricId);
  setControl(inputValue(node, 'label'), requirement.label);
  setControl(inputValue(node, 'quantity'), requirement.quantity);
  setControl(inputValue(node, 'width'), displayLength(requirement.width));
  setControl(inputValue(node, 'height'), displayLength(requirement.height));
  setControl(inputValue(node, 'dimensionMode'), requirement.dimensionMode);
  setControl(
    inputValue(options, 'rotationAllowed'),
    requirement.rotationAllowed === undefined
      ? 'default'
      : String(requirement.rotationAllowed),
  );
  setControl(inputValue(options, 'orientation'), requirement.orientation);
  setControl(inputValue(options, 'isWofStrip'), requirement.isWofStrip);
  setControl(inputValue(options, 'notes'), requirement.notes ?? '');
  const preview = options.querySelector<HTMLElement>('[data-cut-size-preview]');
  if (preview) {
    if (requirement.dimensionMode === 'finished') {
      const fabric = project.fabrics.find(
        (candidate) => candidate.id === requirement.fabricId,
      );
      if (fabric) {
        const normalized = normalizePieceGroup(
          fabric,
          pieceGroupFromRequirement(requirement),
          project.defaultSeamAllowance,
        );
        preview.innerHTML = `Cut size used: <strong>${formatDimension(normalized.width)} × ${formatDimension(normalized.height)}</strong> · Based on ${formatDimension(project.defaultSeamAllowance)} seam allowance.`;
      }
    } else preview.textContent = 'Cut dimensions will be used as entered.';
  }
  if (rowIndex > 0) removeContextHelp(fragment);
  associateLabels(fragment, requirement.id);
  cutListRoot.append(fragment);
}

function renderStockPiece(
  container: HTMLElement,
  stock: StockPiece,
  showHelp: boolean,
): void {
  const node = stockPieceTemplate.content.firstElementChild?.cloneNode(true);
  if (!(node instanceof HTMLElement)) return;
  node.dataset.stockId = stock.id;
  node.dataset.sourceType = stock.sourceType;
  if (stock.presetId) node.dataset.presetId = stock.presetId;
  const title = node.querySelector<HTMLElement>('[data-stock-title]');
  if (title) title.textContent = stock.label;
  setControl(inputValue(node, 'label'), stock.label);
  setControl(inputValue(node, 'width'), displayLength(stock.width));
  setControl(inputValue(node, 'length'), displayLength(stock.length));
  setControl(inputValue(node, 'quantity'), stock.quantity);
  if (!showHelp) removeContextHelp(node);
  associateLabels(node, stock.id);
  container.append(node);
}

function renderForm(): void {
  required<HTMLInputElement>('project-name').value = project.name ?? '';
  required<HTMLSelectElement>('unit-system').value = project.unitSystem;
  required<HTMLInputElement>('seam-allowance').value = String(
    displayLength(project.defaultSeamAllowance),
  );
  document
    .querySelectorAll<HTMLElement>('[data-unit-label]')
    .forEach((item) => {
      item.textContent = project.unitSystem === 'imperial' ? 'in' : 'cm';
    });
  document
    .querySelectorAll<HTMLElement>('[data-purchase-unit]')
    .forEach((item) => {
      item.textContent = project.unitSystem === 'imperial' ? 'yd' : 'm';
    });
  fabricsRoot.replaceChildren();
  project.fabrics.forEach((fabric, fabricIndex) => {
    const node = fabricTemplate.content.firstElementChild?.cloneNode(true);
    if (!(node instanceof HTMLElement)) return;
    node.dataset.fabricId = fabric.id;
    const number = node.querySelector('[data-fabric-number]');
    if (number) number.textContent = String(fabricIndex + 1);
    const title = node.querySelector('[data-fabric-title]');
    if (title) title.textContent = fabric.name;
    const summary = node.querySelector('[data-fabric-summary]');
    if (summary)
      summary.textContent = `${formatDimension(fabric.usableWidth)} usable WOF · ${fabric.directional ? 'Directional' : 'Non-directional'} · ${fabric.stockPieces.reduce((total, stock) => total + stock.quantity, 0)} stock piece${fabric.stockPieces.reduce((total, stock) => total + stock.quantity, 0) === 1 ? '' : 's'}`;
    const advancedSummary = node.querySelector('[data-advanced-summary]');
    if (advancedSummary)
      advancedSummary.textContent = `${formatDimension(fabric.usableWidth)} usable WOF · ${formatDimension(project.defaultSeamAllowance)} seam · ${fabric.safetyAllowancePercent}% buffer · ${formatPurchase(fabric.purchaseIncrement)} rounding`;
    setControl(inputValue(node, 'name'), fabric.name);
    setControl(
      inputValue(node, 'fabricWidth'),
      displayLength(fabric.fabricWidth),
    );
    setControl(
      inputValue(node, 'usableWidth'),
      displayLength(fabric.usableWidth),
    );
    setControl(inputValue(node, 'directional'), fabric.directional);
    setControl(
      inputValue(node, 'defaultRotationAllowed'),
      fabric.defaultRotationAllowed,
    );
    setControl(
      inputValue(node, 'safetyAllowancePercent'),
      fabric.safetyAllowancePercent,
    );
    setControl(
      inputValue(node, 'purchaseIncrement'),
      displayPurchase(fabric.purchaseIncrement),
    );
    setControl(inputValue(node, 'notes'), fabric.notes ?? '');
    setControl(
      inputValue(node, 'patternStatedAmount'),
      fabric.patternStatedAmount === undefined
        ? ''
        : displayPurchase(fabric.patternStatedAmount),
    );
    setControl(
      inputValue(node, 'patternAssumedUsableWidth'),
      fabric.patternAssumedUsableWidth === undefined
        ? ''
        : displayLength(fabric.patternAssumedUsableWidth),
    );
    associateLabels(node, fabric.id);
    const stockRoot = node.querySelector<HTMLElement>('[data-stock-pieces]');
    if (stockRoot)
      fabric.stockPieces.forEach((stock, stockIndex) =>
        renderStockPiece(
          stockRoot,
          stock,
          fabricIndex === 0 && stockIndex === 0,
        ),
      );
    const removeFabric = node.querySelector<HTMLButtonElement>(
      '[data-remove-fabric]',
    );
    if (removeFabric) removeFabric.hidden = project.fabrics.length === 1;
    if (fabricIndex > 0) removeContextHelp(node);
    fabricsRoot.append(node);
  });
  cutListRoot.replaceChildren();
  project.cutRequirements.forEach(renderCutRow);
  const cutListIsEmpty = project.cutRequirements.length === 0;
  cutListTableWrap.hidden = cutListIsEmpty;
  cutListEmpty.hidden = !cutListIsEmpty;
  document
    .querySelectorAll<HTMLElement>('[data-unit-label]')
    .forEach((item) => {
      item.textContent = project.unitSystem === 'imperial' ? 'in' : 'cm';
    });
  document
    .querySelectorAll<HTMLElement>('[data-purchase-unit]')
    .forEach((item) => {
      item.textContent = project.unitSystem === 'imperial' ? 'yd' : 'm';
    });
}

function numeric(root: ParentNode, field: string): number {
  return Number(inputValue(root, field).value);
}
function readLength(root: ParentNode, field: string, unit: UnitSystem): number {
  return toMillimetres(
    numeric(root, field),
    unit === 'imperial' ? 'inch' : 'centimetre',
  );
}
function checked(root: ParentNode, field: string): boolean {
  const control = inputValue(root, field);
  return control instanceof HTMLInputElement && control.checked;
}

function optionalNumber(root: ParentNode, field: string): number | undefined {
  const value = inputValue(root, field).value.trim();
  return value === '' ? undefined : Number(value);
}

function readProject(unit: UnitSystem): PlannerProject {
  return {
    id: project.id,
    name: required<HTMLInputElement>('project-name').value.trim() || undefined,
    unitSystem: unit,
    schemaVersion: PLANNER_PROJECT_SCHEMA_VERSION,
    defaultSeamAllowance: toMillimetres(
      Number(required<HTMLInputElement>('seam-allowance').value),
      unit === 'imperial' ? 'inch' : 'centimetre',
    ),
    fabrics: [...fabricsRoot.querySelectorAll<HTMLElement>('.fabric-card')].map(
      (fabricNode): FabricPlan => ({
        id: fabricNode.dataset.fabricId ?? nextId('fabric'),
        name: inputValue(fabricNode, 'name').value.trim(),
        fabricWidth: readLength(fabricNode, 'fabricWidth', unit),
        usableWidth: readLength(fabricNode, 'usableWidth', unit),
        directional: checked(fabricNode, 'directional'),
        defaultRotationAllowed: checked(fabricNode, 'defaultRotationAllowed'),
        safetyAllowancePercent: numeric(fabricNode, 'safetyAllowancePercent'),
        purchaseIncrement: toMillimetres(
          numeric(fabricNode, 'purchaseIncrement'),
          unit === 'imperial' ? 'yard' : 'metre',
        ),
        notes: inputValue(fabricNode, 'notes').value.trim() || undefined,
        patternStatedAmount: (() => {
          const value = optionalNumber(fabricNode, 'patternStatedAmount');
          return value === undefined
            ? undefined
            : toMillimetres(value, unit === 'imperial' ? 'yard' : 'metre');
        })(),
        patternAssumedUsableWidth: (() => {
          const value = optionalNumber(fabricNode, 'patternAssumedUsableWidth');
          return value === undefined
            ? undefined
            : toMillimetres(value, unit === 'imperial' ? 'inch' : 'centimetre');
        })(),
        stockPieces: [
          ...fabricNode.querySelectorAll<HTMLElement>('.stock-piece'),
        ].map((stockNode): StockPiece => ({
          id: stockNode.dataset.stockId ?? nextId('stock'),
          fabricId: fabricNode.dataset.fabricId ?? '',
          label:
            inputValue(stockNode, 'label').value.trim() ||
            `Stock piece ${stockNode.dataset.stockId ?? ''}`.trim(),
          width: readLength(stockNode, 'width', unit),
          length: readLength(stockNode, 'length', unit),
          quantity: numeric(stockNode, 'quantity'),
          sourceType:
            (stockNode.dataset.sourceType as StockSourceType | undefined) ??
            'custom',
          ...(stockNode.dataset.presetId
            ? { presetId: stockNode.dataset.presetId }
            : {}),
        })),
      }),
    ),
    cutRequirements: [
      ...cutListRoot.querySelectorAll<HTMLElement>('.cut-list-row'),
    ].map((row, rowIndex): CutRequirement => {
      const requirementId = row.dataset.requirementId ?? nextId('piece');
      const options = cutListRoot.querySelector<HTMLElement>(
        `.cut-row-options[data-requirement-id="${CSS.escape(requirementId)}"]`,
      );
      if (!options) throw new Error('Missing cut-row options');
      const rotation = inputValue(options, 'rotationAllowed').value;
      return {
        id: requirementId,
        fabricId: inputValue(row, 'fabricId').value,
        label: inputValue(row, 'label').value.trim() || `Piece ${rowIndex + 1}`,
        quantity: numeric(row, 'quantity'),
        width: readLength(row, 'width', unit),
        height: readLength(row, 'height', unit),
        dimensionMode: inputValue(row, 'dimensionMode')
          .value as CutRequirement['dimensionMode'],
        rotationAllowed:
          rotation === 'default' ? undefined : rotation === 'true',
        orientation: inputValue(options, 'orientation')
          .value as CutRequirement['orientation'],
        isWofStrip: checked(options, 'isWofStrip'),
        notes: inputValue(options, 'notes').value.trim() || undefined,
      };
    }),
  };
}

function persist(): void {
  project = readProject(displayedUnit);
  const finite =
    Number.isFinite(project.defaultSeamAllowance) &&
    project.fabrics.every(
      (fabric) =>
        [
          fabric.fabricWidth,
          fabric.usableWidth,
          fabric.safetyAllowancePercent,
          fabric.purchaseIncrement,
          fabric.patternStatedAmount,
          fabric.patternAssumedUsableWidth,
        ]
          .filter((value) => value !== undefined)
          .every(Number.isFinite) &&
        fabric.stockPieces.every((stock) =>
          [stock.width, stock.length, stock.quantity].every(Number.isFinite),
        ),
    ) &&
    project.cutRequirements.every((requirement) =>
      [requirement.quantity, requirement.width, requirement.height].every(
        Number.isFinite,
      ),
    );
  if (!finite) {
    saveStatus.textContent =
      'Finish the numeric fields before this draft can be saved.';
    return;
  }
  const saved = savePlannerProject(localStorage, project);
  saveStatus.textContent = saved.ok
    ? 'Saved on this device.'
    : 'Your browser blocked local saving; calculation still works.';
}

function updateLivePlannerPresentation(): void {
  project.fabrics.forEach((fabric) => {
    const fabricNode = fabricsRoot.querySelector<HTMLElement>(
      `[data-fabric-id="${CSS.escape(fabric.id)}"]`,
    );
    if (!fabricNode) return;
    const title = fabricNode.querySelector<HTMLElement>('[data-fabric-title]');
    if (title) title.textContent = fabric.name || 'Fabric';
    const summary = fabricNode.querySelector<HTMLElement>(
      '[data-fabric-summary]',
    );
    if (summary)
      summary.textContent = `${formatDimension(fabric.usableWidth)} usable WOF · ${fabric.directional ? 'Directional' : 'Non-directional'} · ${fabric.stockPieces.reduce((total, stock) => total + stock.quantity, 0)} stock piece${fabric.stockPieces.reduce((total, stock) => total + stock.quantity, 0) === 1 ? '' : 's'}`;
    const advanced = fabricNode.querySelector<HTMLElement>(
      '[data-advanced-summary]',
    );
    if (advanced)
      advanced.textContent = `${formatDimension(fabric.usableWidth)} usable WOF · ${formatDimension(project.defaultSeamAllowance)} seam · ${fabric.safetyAllowancePercent}% buffer · ${formatPurchase(fabric.purchaseIncrement)} rounding`;
    cutListRoot
      .querySelectorAll<HTMLSelectElement>('[data-field="fabricId"]')
      .forEach((select) => {
        const option = [...select.options].find(
          (item) => item.value === fabric.id,
        );
        if (option) option.textContent = fabric.name || 'Fabric';
      });
  });
  project.cutRequirements.forEach((requirement) => {
    const options = cutListRoot.querySelector<HTMLElement>(
      `.cut-row-options[data-requirement-id="${CSS.escape(requirement.id)}"]`,
    );
    const preview = options?.querySelector<HTMLElement>(
      '[data-cut-size-preview]',
    );
    if (!preview) return;
    if (requirement.dimensionMode === 'cut') {
      preview.textContent = 'Cut dimensions will be used as entered.';
      return;
    }
    const fabric = project.fabrics.find(
      (candidate) => candidate.id === requirement.fabricId,
    );
    if (!fabric) return;
    const normalized = normalizePieceGroup(
      fabric,
      pieceGroupFromRequirement(requirement),
      project.defaultSeamAllowance,
    );
    preview.innerHTML = `Cut size used: <strong>${formatDimension(normalized.width)} × ${formatDimension(normalized.height)}</strong> · Based on ${formatDimension(project.defaultSeamAllowance)} seam allowance.`;
  });
}

function formatDimension(mm: number): string {
  return displayedUnit === 'imperial'
    ? formatImperialInches(mm)
    : `${displayLength(mm)} cm`;
}
function formatPurchase(mm: number): string {
  if (displayedUnit === 'metric') return `${displayPurchase(mm)} m`;
  const eighths = Math.round(displayPurchase(mm) * 8);
  const whole = Math.floor(eighths / 8);
  const remainder = eighths % 8;
  if (remainder === 0) return `${whole} yd`;
  const divisor = remainder % 2 === 0 ? 2 : 1;
  const fraction = `${remainder / divisor}/${8 / divisor}`;
  return `${whole > 0 ? `${whole} ` : ''}${fraction} yd`;
}
function escapeHtml(value: string): string {
  const span = document.createElement('span');
  span.textContent = value;
  return span.innerHTML;
}

function renderContextHelp(helpKey: HelpKey): string {
  const entry: ContextHelpEntry = CONTEXT_HELP[helpKey];
  return `&nbsp;<span class="context-help" data-context-help data-help-key="${helpKey}"><span class="context-help-mark" aria-hidden="true">?</span><button type="button" class="context-help-trigger no-print" aria-label="Help: ${escapeHtml(entry.title)}" aria-expanded="false" data-help-trigger></button><span class="context-help-popover" role="note" data-help-popover hidden><strong>${escapeHtml(entry.title)}</strong><span>${escapeHtml(entry.explanation)}</span>${entry.caveat ? `<span class="context-help-caveat">${escapeHtml(entry.caveat)}</span>` : ''}<a href="${entry.learnMoreHref}" data-help-learn-more>Learn more</a></span></span>`;
}

function renderContextHelpLabel(label: string, helpKey: HelpKey): string {
  return `<span class="print-help-label">${escapeHtml(label)}</span><span class="help-label screen-help-label">${escapeHtml(label)}${renderContextHelp(helpKey)}</span>`;
}

function renderPlanningComparison(comparison: PlanningComparison): string {
  if (comparison.comparisonOutcome === 'not_applicable') return '';

  const recommended = formatDimension(comparison.recommendedPlanLength);
  const separate = formatDimension(comparison.separateGroupBaselineLength);
  if (comparison.comparisonOutcome === 'combined_shorter') {
    if (comparison.lengthDifference <= 0) return '';
    return `<section class="planning-comparison" aria-label="Combined planning comparison"><p class="comparison-headline">Combined planning uses <strong>${formatDimension(comparison.lengthDifference)}</strong> less fabric length</p><p>Recommended plan: <strong>${recommended}</strong> · Separate piece groups: <strong>${separate}</strong></p><p><strong>${Math.round(comparison.differencePercent)}%</strong> less raw fabric length than planning each piece group separately.</p></section>`;
  }
  if (comparison.comparisonOutcome === 'same_length') {
    return `<section class="planning-comparison" aria-label="Combined planning comparison"><p class="comparison-headline">Combined planning uses the same fabric length</p><p>Recommended plan: <strong>${recommended}</strong> · Separate piece groups: <strong>${separate}</strong></p></section>`;
  }
  return `<section class="planning-comparison" aria-label="Combined planning comparison"><p class="comparison-headline">The practical plan uses <strong>${formatDimension(Math.abs(comparison.lengthDifference))}</strong> more raw fabric length</p><p>Recommended plan: <strong>${recommended}</strong> · Separate piece groups: <strong>${separate}</strong></p><p>The selected plan retains the planner's practical cutting priorities instead of optimizing this comparison number.</p></section>`;
}

function renderEfficiencySummary(
  comparison: PlanningComparison,
  usedLength: number,
  wasteArea: number,
): string {
  const waste = formatWasteAreaValue(wasteArea, displayedUnit);
  const wasteFact =
    waste === 'No unused area'
      ? '<span><strong>No unused area</strong></span>'
      : `<span>Waste area: <strong>${waste}</strong></span>`;
  return `<div class="efficiency-summary">${renderPlanningComparison(comparison)}<p class="efficiency-facts"><span>Used length: <strong>${formatDimension(usedLength)}</strong></span>${wasteFact}</p></div>`;
}

function renderDiagramTextAlternative(diagram: CuttingDiagramModel): string {
  const alternative = diagram.textAlternative;
  const placementMode = alternative.layoutMode === 'placements';
  const pieceGroups = alternative.pieceGroups
    .map(
      (piece) =>
        `<li><strong>${escapeHtml(piece.label)}</strong> (${escapeHtml(piece.pieceGroupId)}): <strong>${piece.quantity} piece${piece.quantity === 1 ? '' : 's'}</strong> at <strong>${escapeHtml(piece.dimensionLabel)}</strong> cut size</li>`,
    )
    .join('');
  const strips = alternative.rows
    .map((row) => {
      const runs = row.runs
        .map(
          (run) =>
            `<li><strong>${escapeHtml(run.label)}</strong> (${escapeHtml(run.pieceGroupId)}), <strong>${escapeHtml(run.instanceLabel)}</strong>, <strong>${escapeHtml(run.dimensionLabel)}</strong>${run.rotated ? ', <strong>rotated</strong>' : ''}, from <strong>${escapeHtml(run.startLabel)}</strong> to <strong>${escapeHtml(run.endLabel)}</strong> across the fabric</li>`,
        )
        .join('');
      const unused = placementMode
        ? ''
        : row.unusedWidthLabel
          ? `<p class="text-plan-unused">Unused width at row end: <strong>${escapeHtml(row.unusedWidthLabel)}</strong></p>`
          : '<p class="text-plan-unused"><strong>Full usable width used</strong></p>';
      return `<li class="text-plan-strip"><div class="text-plan-strip-heading"><strong>${placementMode ? 'Placement' : 'Strip'} ${row.rowIndex + 1}</strong><span>Starts <strong>${escapeHtml(row.startLabel)}</strong> down · Height <strong>${escapeHtml(row.heightLabel)}</strong></span></div><ul>${runs}</ul>${unused}</li>`;
    })
    .join('');

  return `<div class="text-plan"><h4>${renderContextHelpLabel(alternative.title, 'cuttingInstructions')}</h4><dl class="text-plan-facts"><div><dt>${renderContextHelpLabel('Usable width', 'resultMeaning')}</dt><dd><strong>${escapeHtml(diagram.usableWidthLabel)}</strong></dd></div><div><dt>${renderContextHelpLabel(diagram.lengthAxisLabel ?? 'Used length', 'resultMeaning')}</dt><dd><strong>${escapeHtml(diagram.usedLengthLabel)}</strong></dd></div><div><dt>${renderContextHelpLabel('Pieces', 'resultMeaning')}</dt><dd><strong>${diagram.pieces.length}</strong></dd></div><div><dt>${renderContextHelpLabel(placementMode ? 'Placements' : 'Strips', 'resultMeaning')}</dt><dd><strong>${alternative.rows.length}</strong></dd></div></dl>${diagram.directional ? '<p><strong>Fabric direction runs down the length.</strong></p>' : ''}<section><h4>${renderContextHelpLabel('Piece groups', 'cuttingInstructions')}</h4><ul class="text-plan-piece-groups">${pieceGroups}</ul></section><section><h4>${renderContextHelpLabel(placementMode ? 'Piece-by-piece placement' : 'Strip-by-strip placement', 'cuttingInstructions')}</h4><ol class="text-plan-strips">${strips}</ol></section></div>`;
}

function savingsBand(
  comparison: PlanningComparison,
):
  | 'none'
  | 'under_5_percent'
  | '5_to_10_percent'
  | '10_to_20_percent'
  | 'over_20_percent' {
  if (
    comparison.comparisonOutcome !== 'combined_shorter' ||
    comparison.differencePercent <= 0
  ) {
    return 'none';
  }
  if (comparison.differencePercent < 5) return 'under_5_percent';
  if (comparison.differencePercent < 10) return '5_to_10_percent';
  if (comparison.differencePercent <= 20) return '10_to_20_percent';
  return 'over_20_percent';
}

function projectStatusText(result: ReconciledProjectSuccess): string {
  if (result.summary.status === 'covered-by-stock')
    return 'You have enough fabric for every planned cut.';
  if (result.summary.status === 'additional-purchase-required') {
    const purchaseFabricCount = result.fabrics.filter(
      ({ reconciliation }) => (reconciliation.rawAdditionalPurchase ?? 0) > 0,
    ).length;
    return `You need additional fabric for ${purchaseFabricCount} of ${result.summary.fabricCount} fabrics.`;
  }
  return 'Some planned cuts remain uncovered.';
}

function buildSummary(result: ReconciledProjectSuccess): string {
  return `${result.projectName ? `${result.projectName}\n` : ''}${projectStatusText(result)}\n${result.shoppingList.map((item) => `${item.fabricName}: ${item.recommendedPurchase === 0 ? 'No additional purchase' : item.recommendedPurchase === null ? 'Requirements remain uncovered' : `${formatPurchase(item.recommendedPurchase)} to buy`} (${item.rawAdditionalPurchase === null ? 'no purchase plan' : `${formatDimension(item.rawAdditionalPurchase)} raw additional length`})`).join('\n')}\n${result.summary.pieceCount} pieces across ${result.summary.fabricCount} fabric${result.summary.fabricCount === 1 ? '' : 's'}.`;
}

const CSS_PIXELS_PER_PDF_POINT = 96 / 72;
const PDF_POINTS_PER_CENTIMETRE = 72 / 2.54;
const PRINT_GRAPHIC_INSET = 5;
const A4_SHORT_EDGE_PDF_POINTS = 594.96;
const A4_LONG_EDGE_PDF_POINTS = 841.92;
const PRINT_PAGE_MARGIN_CENTIMETRES = 1.2;
// Chromium's CSS-to-PDF transform needs eight inward PDF points for paint to
// remain inside the nominal A4 box; seven points demonstrably crosses it. Keep
// this exact point-grid boundary covered by the rasterized PDF regression.
const PRINT_PAINT_INSET_QUANTUM_POINTS = 8;
const MINIMUM_DIAGRAM_ZOOM_LEVEL = 0;
const MAXIMUM_DIAGRAM_ZOOM_LEVEL = 10;
const DEFAULT_DIAGRAM_ZOOM_LEVEL = 0;
const SMALL_SCREEN_DEFAULT_DIAGRAM_ZOOM_LEVEL = 10 * Math.log10(2);
let disposeDiagramZoom: (() => void) | undefined;

function touchDistance(first: Touch, second: Touch): number {
  return Math.hypot(
    second.clientX - first.clientX,
    second.clientY - first.clientY,
  );
}

function initializeDiagramZoom(): void {
  disposeDiagramZoom?.();
  const cleanups: (() => void)[] = [];
  const smallDiagram = window.matchMedia('(max-width: 649px)');
  fabricResultsRoot
    .querySelectorAll<HTMLElement>('.diagram-print-page')
    .forEach((diagramPage) => {
      const wrapper = diagramPage.querySelector<HTMLElement>('.diagram-wrap');
      const diagram = wrapper?.querySelector<SVGSVGElement>('.cutting-diagram');
      const slider = diagramPage.querySelector<HTMLInputElement>(
        '[data-diagram-zoom-slider]',
      );
      const output = diagramPage.querySelector<HTMLOutputElement>(
        '[data-diagram-zoom-output]',
      );
      if (!wrapper || !diagram || !slider || !output) return;

      const defaultZoomLevel = (): number =>
        smallDiagram.matches
          ? SMALL_SCREEN_DEFAULT_DIAGRAM_ZOOM_LEVEL
          : DEFAULT_DIAGRAM_ZOOM_LEVEL;
      let zoomLevel = defaultZoomLevel();
      let pinchStartDistance = 0;
      let pinchStartZoomLevel = zoomLevel;
      let pinchContentX = 0;
      let pinchContentY = 0;

      const fittedWidth = (): number => {
        const style = getComputedStyle(wrapper);
        const availableWidth =
          wrapper.clientWidth -
          Number.parseFloat(style.paddingLeft) -
          Number.parseFloat(style.paddingRight);
        const availableHeight =
          wrapper.clientHeight -
          Number.parseFloat(style.paddingTop) -
          Number.parseFloat(style.paddingBottom);
        const viewBox = diagram.viewBox.baseVal;
        const aspectRatio = viewBox.width / viewBox.height;
        return Math.max(
          1,
          Math.min(availableWidth, availableHeight * aspectRatio),
        );
      };
      const applyZoom = (nextZoomLevel: number): void => {
        zoomLevel = Math.min(
          MAXIMUM_DIAGRAM_ZOOM_LEVEL,
          Math.max(MINIMUM_DIAGRAM_ZOOM_LEVEL, nextZoomLevel),
        );
        const scale = 10 ** (zoomLevel / 10);
        diagram.style.setProperty(
          '--diagram-screen-width',
          `${(fittedWidth() * scale).toFixed(2)}px`,
        );
        slider.value = zoomLevel.toFixed(2);
        output.value =
          Math.abs(zoomLevel) < 0.01
            ? 'Fit'
            : `${scale < 1 ? scale.toFixed(2) : scale.toFixed(1)}×`;
        output.textContent = output.value;
      };
      const onSliderInput = (): void => applyZoom(Number(slider.value));
      const onTouchStart = (event: TouchEvent): void => {
        if (event.touches.length !== 2) return;
        const [first, second] = [event.touches[0]!, event.touches[1]!];
        pinchStartDistance = touchDistance(first, second);
        pinchStartZoomLevel = zoomLevel;
        const bounds = wrapper.getBoundingClientRect();
        const diagramBounds = diagram.getBoundingClientRect();
        const midpointX = (first.clientX + second.clientX) / 2 - bounds.left;
        const midpointY = (first.clientY + second.clientY) / 2 - bounds.top;
        pinchContentX =
          (wrapper.scrollLeft +
            midpointX -
            (diagramBounds.left - bounds.left)) /
          diagramBounds.width;
        pinchContentY =
          (wrapper.scrollTop + midpointY - (diagramBounds.top - bounds.top)) /
          diagramBounds.height;
      };
      const onTouchMove = (event: TouchEvent): void => {
        if (event.touches.length !== 2 || pinchStartDistance <= 0) return;
        event.preventDefault();
        const [first, second] = [event.touches[0]!, event.touches[1]!];
        const bounds = wrapper.getBoundingClientRect();
        const midpointX = (first.clientX + second.clientX) / 2 - bounds.left;
        const midpointY = (first.clientY + second.clientY) / 2 - bounds.top;
        const pinchScale = touchDistance(first, second) / pinchStartDistance;
        applyZoom(pinchStartZoomLevel + 10 * Math.log10(pinchScale));
        const diagramBounds = diagram.getBoundingClientRect();
        const diagramContentX =
          diagramBounds.left - bounds.left + wrapper.scrollLeft;
        const diagramContentY =
          diagramBounds.top - bounds.top + wrapper.scrollTop;
        wrapper.scrollLeft =
          diagramContentX + pinchContentX * diagramBounds.width - midpointX;
        wrapper.scrollTop =
          diagramContentY + pinchContentY * diagramBounds.height - midpointY;
      };
      const onTouchEnd = (event: TouchEvent): void => {
        if (event.touches.length < 2) pinchStartDistance = 0;
      };
      const resizeObserver = new ResizeObserver(() => applyZoom(zoomLevel));
      const onSmallScreenChange = (): void => {
        applyZoom(defaultZoomLevel());
      };

      slider.addEventListener('input', onSliderInput);
      wrapper.addEventListener('touchstart', onTouchStart, { passive: true });
      wrapper.addEventListener('touchmove', onTouchMove, { passive: false });
      wrapper.addEventListener('touchend', onTouchEnd, { passive: true });
      wrapper.addEventListener('touchcancel', onTouchEnd, { passive: true });
      smallDiagram.addEventListener('change', onSmallScreenChange);
      resizeObserver.observe(wrapper);
      applyZoom(defaultZoomLevel());

      cleanups.push(() => {
        slider.removeEventListener('input', onSliderInput);
        wrapper.removeEventListener('touchstart', onTouchStart);
        wrapper.removeEventListener('touchmove', onTouchMove);
        wrapper.removeEventListener('touchend', onTouchEnd);
        wrapper.removeEventListener('touchcancel', onTouchEnd);
        smallDiagram.removeEventListener('change', onSmallScreenChange);
        resizeObserver.disconnect();
      });
    });

  disposeDiagramZoom = () => cleanups.forEach((cleanup) => cleanup());
}

function fitPrintDiagrams(): void {
  fabricResultsRoot
    .querySelectorAll<HTMLElement>('.diagram-print-page')
    .forEach((diagramPage) => {
      const diagram =
        diagramPage.querySelector<SVGSVGElement>('.cutting-diagram');
      const heading = diagramPage.querySelector('h3, h4, h5');
      const legend = diagramPage.querySelector('.diagram-legend');
      if (!diagram || !heading || !legend) return;

      if (!diagram.dataset.screenViewBox) {
        diagram.dataset.screenViewBox = diagram.getAttribute('viewBox') ?? '';
      }
      const graphicBounds = diagram.getBBox();
      if (graphicBounds.width <= 0 || graphicBounds.height <= 0) return;
      diagram.setAttribute(
        'viewBox',
        [
          graphicBounds.x - PRINT_GRAPHIC_INSET,
          graphicBounds.y - PRINT_GRAPHIC_INSET,
          graphicBounds.width + 2 * PRINT_GRAPHIC_INSET,
          graphicBounds.height + 2 * PRINT_GRAPHIC_INSET,
        ].join(' '),
      );

      const viewBox = diagram.viewBox.baseVal;
      if (viewBox.width <= 0 || viewBox.height <= 0) return;

      const landscape = diagramPage.dataset.printOrientation === 'landscape';
      const printMarginPoints =
        PRINT_PAGE_MARGIN_CENTIMETRES * PDF_POINTS_PER_CENTIMETRE;
      const printableShortEdgePoints =
        A4_SHORT_EDGE_PDF_POINTS - 2 * printMarginPoints;
      const printableLongEdgePoints =
        A4_LONG_EDGE_PDF_POINTS - 2 * printMarginPoints;
      const printableWidthPoints = Math.floor(
        landscape ? printableLongEdgePoints : printableShortEdgePoints,
      );
      const printableHeightPoints = Math.floor(
        landscape ? printableShortEdgePoints : printableLongEdgePoints,
      );
      const printableWidth = printableWidthPoints * CSS_PIXELS_PER_PDF_POINT;
      const printableHeight =
        (printableHeightPoints - PRINT_PAINT_INSET_QUANTUM_POINTS) *
        CSS_PIXELS_PER_PDF_POINT;

      diagramPage.style.setProperty(
        '--print-page-width',
        `${printableWidth.toFixed(2)}px`,
      );
      // Collapse the SVG while measuring so the wrapper's rendered top captures
      // every real heading/legend line, margin, and collapsed-margin effect.
      diagram.style.setProperty('--print-diagram-width', '0px');
      const pageBounds = diagramPage.getBoundingClientRect();
      const wrapper = diagram.closest<HTMLElement>('.diagram-wrap');
      if (!wrapper) return;
      const wrapperBounds = wrapper.getBoundingClientRect();
      const diagramTop = Math.max(0, wrapperBounds.top - pageBounds.top);
      const availableHeight = Math.max(0, printableHeight - diagramTop);
      const availableWidth = Math.min(printableWidth, wrapper.clientWidth);
      const scale = Math.min(
        availableWidth / viewBox.width,
        availableHeight / viewBox.height,
      );
      const fittedWidth =
        Math.floor(Math.max(0, viewBox.width * scale) * 100) / 100;

      diagram.style.setProperty(
        '--print-diagram-width',
        `${fittedWidth.toFixed(2)}px`,
      );
      diagram.style.setProperty(
        '--print-diagram-max-height',
        `${availableHeight.toFixed(2)}px`,
      );
    });
}

function restoreScreenDiagrams(): void {
  fabricResultsRoot
    .querySelectorAll<HTMLElement>('.diagram-print-page')
    .forEach((diagramPage) => {
      diagramPage.style.removeProperty('--print-page-width');
    });
  fabricResultsRoot
    .querySelectorAll<SVGSVGElement>('.cutting-diagram')
    .forEach((diagram) => {
      if (diagram.dataset.screenViewBox !== undefined) {
        diagram.setAttribute('viewBox', diagram.dataset.screenViewBox);
        delete diagram.dataset.screenViewBox;
      }
      diagram.style.removeProperty('--print-diagram-width');
      diagram.style.removeProperty('--print-diagram-max-height');
    });
}

function renderMaterialPlan(
  plan: ReconciledMaterialPlan,
  fabricIndex: number,
  materialIndex: number,
): string {
  const diagram = plan.diagram;
  const printOrientation =
    diagram.width >= diagram.height ? 'landscape' : 'portrait';
  const zoomId = `diagram-zoom-${fabricIndex}-${materialIndex}`;
  const [firstInstruction, ...remainingInstructions] = plan.instructions;
  const firstStep = firstInstruction
    ? `<ol><li>${escapeHtml(firstInstruction.text)}</li></ol>`
    : '<p>No planned pieces are assigned to this material.</p>';
  const laterSteps = remainingInstructions.length
    ? `<ol start="2">${remainingInstructions.map((instruction) => `<li>${escapeHtml(instruction.text)}</li>`).join('')}</ol>`
    : '';
  return `<section class="material-plan" data-material-kind="${plan.kind}"><div class="material-plan-details"><div class="material-plan-intro"><div class="material-plan-heading"><h4>${renderContextHelpLabel(plan.materialLabel, 'resultMeaning')}</h4><p><strong>${diagram.pieces.length} piece${diagram.pieces.length === 1 ? '' : 's'}</strong> · ${escapeHtml(diagram.usableWidthLabel)} × ${escapeHtml(diagram.usedLengthLabel)}</p><h5>${renderContextHelpLabel('Cutting instructions', 'cuttingInstructions')}</h5></div>${firstStep}</div>${laterSteps}</div><details><summary>${renderContextHelpLabel('Text version of this allocation', 'cuttingInstructions')}</summary>${renderDiagramTextAlternative(diagram)}</details><section class="diagram-print-page print-${printOrientation}" data-print-orientation="${printOrientation}"><div class="diagram-print-content"><h5>${renderContextHelpLabel(plan.kind === 'stock' ? 'Existing-stock allocation' : 'Purchased-fabric cutting plan', 'cuttingInstructions')}</h5><div class="diagram-legend">${renderContextHelpLabel('Legend', 'cuttingInstructions')}: patterned areas are pieces; grey hatch is usable remainder; across-fabric width runs left to right.</div><p class="diagram-pinch-hint no-print">Pinch to zoom on touch devices.</p><div class="diagram-zoom-controls no-print"><span class="help-label"><label for="${zoomId}">Zoom</label>${renderContextHelp('diagramZoom')}</span><input id="${zoomId}" data-diagram-zoom-slider type="range" min="${MINIMUM_DIAGRAM_ZOOM_LEVEL}" max="${MAXIMUM_DIAGRAM_ZOOM_LEVEL}" value="${DEFAULT_DIAGRAM_ZOOM_LEVEL}" step="0.01"/><output for="${zoomId}" data-diagram-zoom-output>Fit</output></div><div class="diagram-wrap">${renderCuttingDiagramSvg(diagram)}</div></div></section></section>`;
}

function renderResult(result: ReconciledProjectSuccess): void {
  const cuttingPlans = createReconciledCuttingPlans(result);
  latestSummary = buildSummary(result);
  printMeta.textContent = `${result.projectName ?? 'Quilt project'} · Prepared ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date())}`;
  const status = projectStatusText(result);
  summaryRoot.innerHTML = `<p class="project-status"><strong>${renderContextHelpLabel(status, 'resultMeaning')}</strong></p><div class="shopping-mobile-help" aria-label="Shopping result terms"><span>${renderContextHelpLabel('Fabric', 'fabricName')}</span><span>${renderContextHelpLabel('Buy now', 'buyNow')}</span><span>${renderContextHelpLabel('Raw additional plan', 'resultMeaning')}</span><span>${renderContextHelpLabel('With safety', 'purchaseSafety')}</span></div><div class="shopping-table-wrap"><table class="shopping-table"><caption>${renderContextHelpLabel('Fabric shopping list', 'shoppingPlan')}</caption><thead><tr><th scope="col">${renderContextHelpLabel('Fabric', 'fabricName')}</th><th scope="col">${renderContextHelpLabel('Buy now', 'buyNow')}</th><th scope="col">${renderContextHelpLabel('Raw additional plan', 'resultMeaning')}</th><th scope="col">${renderContextHelpLabel('With safety', 'purchaseSafety')}</th></tr></thead><tbody>${result.shoppingList.map((item) => `<tr><th scope="row" data-label="Fabric">${escapeHtml(item.fabricName)}</th><td data-label="Buy now"><strong>${item.recommendedPurchase === 0 ? 'No additional purchase' : item.recommendedPurchase === null ? 'Uncovered' : formatPurchase(item.recommendedPurchase)}</strong></td><td data-label="Raw additional plan">${item.rawAdditionalPurchase === null ? 'Not available' : formatDimension(item.rawAdditionalPurchase)}</td><td data-label="With safety">${item.bufferedPurchase === null ? 'Not available' : formatDimension(item.bufferedPurchase)}</td></tr>`).join('')}</tbody></table></div><p class="shopping-summary-note">${result.summary.pieceCount} pieces across ${result.summary.fabricCount} fabric${result.summary.fabricCount === 1 ? '' : 's'} · ${result.summary.stockPlacementCount} from existing stock · ${result.summary.purchasedPlacementCount} from new fabric.</p>`;
  fabricResultsRoot.innerHTML = result.fabrics
    .map((item, index) => {
      const {
        fabric,
        reconciliation,
        freshFabricScenario,
        patternComparison,
        planningComparison,
      } = item;
      const shopping = result.shoppingList[index]!;
      const plans = cuttingPlans[index]!;
      const recommended = shopping.recommendedPurchase;
      const headline =
        recommended === 0
          ? 'No additional purchase needed'
          : recommended === null
            ? 'Some cuts remain uncovered'
            : `Buy ${formatPurchase(recommended)} of ${escapeHtml(fabric.name)}`;
      const stockCount = reconciliation.stockBins.length;
      const pattern = patternComparison
        ? `<section class="pattern-comparison"><h3>${renderContextHelpLabel('Pattern comparison', 'resultMeaning')}</h3><dl class="comparison-facts"><div><dt>${renderContextHelpLabel('Pattern says', 'patternSays')}</dt><dd><strong>${formatPurchase(patternComparison.patternStatedAmount)}</strong></dd></div><div><dt>${renderContextHelpLabel('Planned fresh-fabric requirement', 'freshFabricPlan')}</dt><dd><strong>${formatDimension(patternComparison.freshPlanRawLength)}</strong></dd></div><div><dt>${renderContextHelpLabel(`With ${fabric.safetyAllowancePercent}% safety`, 'purchaseSafety')}</dt><dd><strong>${formatDimension(patternComparison.freshPlanBufferedLength)}</strong></dd></div><div><dt>${renderContextHelpLabel('Recommended fresh purchase', 'purchaseSafety')}</dt><dd><strong>${formatPurchase(patternComparison.freshPlanRecommendedLength)}</strong></dd></div><div><dt>${renderContextHelpLabel('Difference', 'resultMeaning')}</dt><dd><strong>${formatPurchase(Math.abs(patternComparison.deltaFromRecommended))}</strong> ${patternComparison.outcome === 'same_amount' ? 'same amount' : patternComparison.outcome === 'pattern_more_than_plan' ? 'more in the pattern' : 'less in the pattern'}</dd></div></dl><p>${escapeHtml(patternComparison.explanation)}</p></section>`
        : '';
      const allWarnings = [
        ...reconciliation.warnings,
        ...(patternComparison?.warnings ?? []),
      ];
      const warnings = allWarnings.length
        ? `<div class="warnings"><h3>${renderContextHelpLabel('Warnings and guidance', 'warningsMeaning')}</h3><ul>${allWarnings.map((warning) => `<li>${escapeHtml(warning.message)}</li>`).join('')}</ul></div>`
        : '';
      const stockPlans = plans.stock.length
        ? plans.stock
            .map((plan, planIndex) =>
              renderMaterialPlan(plan, index, planIndex),
            )
            .join('')
        : '<p>No existing stock entered for this fabric.</p>';
      const purchasedPlan = plans.purchased
        ? renderMaterialPlan(plans.purchased, index, plans.stock.length)
        : '<p>Every planned cut is allocated to existing stock.</p>';
      const leftovers = reconciliation.stockBins.length
        ? `<ul>${reconciliation.stockBins.map((bin) => `<li><strong>${escapeHtml(bin.bin.label)}${bin.bin.id.includes('#') ? ` ${bin.bin.stockInstanceIndex + 1}` : ''}:</strong> ${bin.leftovers.length ? bin.leftovers.map((leftover) => `${formatDimension(leftover.width)} × ${formatDimension(leftover.height)}`).join(', ') : 'No rectangular usable remainder recorded.'}</li>`).join('')}</ul>`
        : '<p>No existing-stock leftovers to report.</p>';
      return `<article class="card fabric-result"><div class="fabric-result-intro"><h2>${renderContextHelpLabel(fabric.name, 'fabricName')}</h2><p class="result-hero"><span>${renderContextHelpLabel('Buy now', 'buyNow')}</span><strong>${headline}</strong><small>Your entered stock covers ${reconciliation.stockPlacements.length} of ${reconciliation.placements.length} pieces.${reconciliation.rawAdditionalPurchase && reconciliation.rawAdditionalPurchase > 0 ? ` The remaining ${reconciliation.purchasedBolt?.placements.length ?? 0} use a ${formatDimension(reconciliation.rawAdditionalPurchase)} raw bolt-length plan.` : ''}</small></p></div><section class="fabric-decision"><h3>${renderContextHelpLabel('Decision details', 'resultMeaning')}</h3><dl class="comparison-facts"><div><dt>${renderContextHelpLabel('You entered on hand', 'stockGeometry')}</dt><dd><strong>${stockCount} physical stock piece${stockCount === 1 ? '' : 's'}</strong></dd></div><div><dt>${renderContextHelpLabel('Fresh-fabric plan', 'freshFabricPlan')}</dt><dd><strong>${formatPurchase(freshFabricScenario.recommendedLength)}</strong> recommended</dd></div><div><dt>${renderContextHelpLabel('Buy now', 'buyNow')}</dt><dd><strong>${recommended === 0 ? 'No additional purchase' : recommended === null ? 'Uncovered' : formatPurchase(recommended)}</strong></dd></div></dl></section>${pattern}<section class="stock-allocations"><h3>${renderContextHelpLabel('Existing-stock allocations', 'stockAllocation')}</h3>${stockPlans}</section><section class="purchased-allocation"><h3>${renderContextHelpLabel('Purchased fabric', 'cuttingInstructions')}</h3>${purchasedPlan}</section><section class="leftover-summary"><h3>${renderContextHelpLabel('Useful remaining regions', 'leftoverSummary')}</h3>${leftovers}</section><section class="assumptions"><h3>${renderContextHelpLabel('Assumptions used', 'assumptionsMeaning')}</h3><p>${formatDimension(fabric.usableWidth)} usable WOF · ${formatDimension(project.defaultSeamAllowance)} seam · ${fabric.safetyAllowancePercent}% purchase buffer · rotation ${fabric.defaultRotationAllowed ? 'allowed' : 'not allowed'}</p></section>${warnings}<details><summary>${renderContextHelpLabel('Efficiency and method details', 'practicalOptimization')}</summary>${renderEfficiencySummary(planningComparison, freshFabricScenario.rawLength, freshFabricScenario.optimization.wasteArea)}<h3>${renderContextHelpLabel('Why this result?', 'practicalOptimization')}</h3><p>The planner jointly evaluated exact physical stock and the remaining bolt layout, selected lower raw additional purchase first, then applied safety and upward rounding only to new fabric. This is a practical optimized plan, not a mathematically proven global optimum.</p></details></article>`;
    })
    .join('');
  fabricResultsRoot
    .querySelectorAll<HTMLElement>('.fabric-result')
    .forEach((fabricResult, fabricIndex) => {
      if (fabricIndex > 0) {
        removeContextHelp(fabricResult);
        return;
      }
      fabricResult
        .querySelectorAll<HTMLElement>(
          '.stock-allocations .material-plan, .purchased-allocation .material-plan',
        )
        .forEach((materialPlan, planIndex) => {
          if (planIndex > 0) removeContextHelp(materialPlan);
        });
    });
  resultsRoot.hidden = false;
  initializeDiagramZoom();
  calculateButton.textContent = 'Recalculate Plan';
  resultsRoot.focus({ preventScroll: true });
  resultsRoot.scrollIntoView({ behavior: 'smooth', block: 'start' });
  for (const { planningComparison } of result.fabrics) {
    emitAnalytics({
      name: 'optimization_completed',
      comparison_outcome: planningComparison.comparisonOutcome,
      savings_band: savingsBand(planningComparison),
    });
  }
  if (result.summary.stockPlacementCount > 0)
    emitAnalytics({ name: 'stock_allocation_viewed' });
  if (result.fabrics.some((fabric) => fabric.patternComparison !== null))
    emitAnalytics({ name: 'yardage_comparison_viewed' });
  emitAnalytics({ name: 'cutting_plan_viewed' });
}

function showErrors(
  messages: readonly {
    field: string;
    fabricId?: string;
    pieceId?: string;
    stockPieceId?: string;
    message: string;
  }[],
): void {
  let firstInvalidField: HTMLElement | undefined;
  clearValidationErrors();
  const list = messages
    .map((error, index) => {
      let summaryFieldId: string | undefined;
      const scope = error.stockPieceId
        ? form.querySelector(
            `[data-stock-id="${CSS.escape(error.stockPieceId)}"]`,
          )
        : error.fabricId
          ? form.querySelector(
              `[data-fabric-id="${CSS.escape(error.fabricId)}"]`,
            )
          : form;
      const displayField = error.field.startsWith('stock.')
        ? error.field.slice('stock.'.length)
        : error.field;
      const fieldSelector = `[data-field="${CSS.escape(displayField)}"], [name="${CSS.escape(displayField)}"]`;
      const field = error.pieceId
        ? [
            ...form.querySelectorAll<HTMLElement>(
              `[data-requirement-id="${CSS.escape(error.pieceId)}"]`,
            ),
          ]
            .map((row) => row.querySelector(fieldSelector))
            .find((candidate) => candidate !== null)
        : scope?.querySelector(fieldSelector);
      if (field instanceof HTMLElement) {
        summaryFieldId = field.id || undefined;
        field.setAttribute('aria-invalid', 'true');
        const fieldError = document.createElement('small');
        fieldError.className = 'field-error dynamic-field-error';
        fieldError.id = `${field.id || `planner-field-${index}`}-error-${index}`;
        if (field.id) fieldError.dataset.errorFieldId = field.id;
        const label = field.id
          ? form.querySelector<HTMLLabelElement>(
              `label[for="${CSS.escape(field.id)}"]`,
            )
          : undefined;
        const fieldName = label?.textContent?.trim() || displayField;
        if (error.pieceId) {
          const fieldLabel = document.createElement('strong');
          fieldLabel.className = 'cut-field-error-prefix';
          fieldLabel.textContent = `${fieldName}: `;
          fieldError.append(fieldLabel, error.message);
        } else fieldError.textContent = error.message;
        field.insertAdjacentElement('afterend', fieldError);
        let describedErrorId = fieldError.id;
        if (error.pieceId) {
          fieldError.classList.add('cut-field-error');
          const errorRow = cutListRoot.querySelector<HTMLTableRowElement>(
            `.cut-row-errors[data-requirement-id="${CSS.escape(error.pieceId)}"]`,
          );
          const errorList = errorRow?.querySelector<HTMLUListElement>(
            '[data-cut-row-errors]',
          );
          if (errorRow && errorList) {
            const rowError = document.createElement('li');
            rowError.className = 'dynamic-field-error';
            rowError.id = `${field.id || `planner-field-${index}`}-row-error-${index}`;
            if (field.id) rowError.dataset.errorFieldId = field.id;
            const fieldLabel = document.createElement('strong');
            fieldLabel.textContent = `${fieldName}: `;
            rowError.append(fieldLabel, error.message);
            errorList.append(rowError);
            errorRow.hidden = false;
            if (!window.matchMedia('(max-width: 800px)').matches)
              describedErrorId = rowError.id;
          }
        }
        field.setAttribute(
          'aria-describedby',
          `planner-errors ${describedErrorId}`,
        );
        firstInvalidField ??= field;
      }
      const fabric = error.fabricId
        ? project.fabrics.find((candidate) => candidate.id === error.fabricId)
        : undefined;
      const requirement = error.pieceId
        ? project.cutRequirements.find(
            (candidate) => candidate.id === error.pieceId,
          )
        : undefined;
      const stock = error.stockPieceId
        ? project.fabrics
            .flatMap((candidate) => candidate.stockPieces)
            .find((candidate) => candidate.id === error.stockPieceId)
        : undefined;
      const scopeLabel = requirement
        ? `${fabric?.name ?? 'Fabric'} — ${requirement.label}`
        : stock
          ? `${fabric?.name ?? 'Fabric'} — ${stock.label}`
          : fabric?.name;
      const prefix =
        scopeLabel && !error.message.includes(scopeLabel)
          ? `<strong>${escapeHtml(scopeLabel)}:</strong> `
          : '';
      const fieldLink = summaryFieldId
        ? ` data-error-field-id="${escapeHtml(summaryFieldId)}"`
        : '';
      return `<li${fieldLink}>${prefix}${escapeHtml(error.message)}</li>`;
    })
    .join('');
  errorsRoot.innerHTML = `<strong>Please fix the following:</strong><ul>${list}</ul>`;
  errorsRoot.hidden = false;
  resultsRoot.hidden = true;
  const scrollTarget = firstInvalidField ?? errorsRoot;
  if (firstInvalidField) firstInvalidField.focus({ preventScroll: true });
  else {
    errorsRoot.tabIndex = -1;
    errorsRoot.focus({ preventScroll: true });
  }
  scrollTarget.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
    block: firstInvalidField ? 'center' : 'start',
  });
}

function clearValidationErrors(): void {
  form.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  });
  form
    .querySelectorAll('.dynamic-field-error')
    .forEach((item) => item.remove());
  cutListRoot
    .querySelectorAll<HTMLElement>('.cut-row-errors')
    .forEach((row) => {
      row.hidden = true;
      row.querySelector('[data-cut-row-errors]')?.replaceChildren();
    });
  errorsRoot.hidden = true;
  errorsRoot.removeAttribute('tabindex');
}

function clearEditedFieldError(target: EventTarget | null): void {
  if (!(target instanceof HTMLElement)) return;
  const describedBy = target.getAttribute('aria-describedby');
  if (target.getAttribute('aria-invalid') !== 'true' || !describedBy) return;

  for (const id of describedBy.split(/\s+/)) {
    if (id !== 'planner-errors') document.getElementById(id)?.remove();
  }
  if (target.id) {
    form
      .querySelectorAll(`[data-error-field-id="${CSS.escape(target.id)}"]`)
      .forEach((error) => error.remove());
  }
  target.removeAttribute('aria-invalid');
  target.removeAttribute('aria-describedby');

  cutListRoot
    .querySelectorAll<HTMLTableRowElement>('.cut-row-errors')
    .forEach((row) => {
      if (!row.querySelector('[data-cut-row-errors]')?.children.length)
        row.hidden = true;
    });
  if (!errorsRoot.querySelector('li')) {
    errorsRoot.hidden = true;
    errorsRoot.removeAttribute('tabindex');
  }
}

function createCutRequirement(
  inherited = project.cutRequirements.at(-1),
): CutRequirement {
  const imperial = displayedUnit === 'imperial';
  return {
    id: nextId('piece'),
    fabricId: inherited?.fabricId ?? project.fabrics[0]!.id,
    label: `Piece ${project.cutRequirements.length + 1}`,
    quantity: 1,
    width: toMillimetres(imperial ? 5 : 12.5, imperial ? 'inch' : 'centimetre'),
    height: toMillimetres(
      imperial ? 5 : 12.5,
      imperial ? 'inch' : 'centimetre',
    ),
    dimensionMode: inherited?.dimensionMode ?? 'cut',
    orientation: 'none',
    isWofStrip: false,
  };
}

type StockPreset =
  | 'fat-quarter'
  | 'fat-eighth'
  | 'quarter-yard'
  | 'half-yard'
  | 'partial-yardage'
  | 'custom';

function createStockPiece(fabric: FabricPlan, preset: StockPreset): StockPiece {
  const labels: Record<StockPreset, string> = {
    'fat-quarter': 'Fat quarter',
    'fat-eighth': 'Fat eighth',
    'quarter-yard': 'Quarter yard',
    'half-yard': 'Half yard',
    'partial-yardage': 'Partial yardage',
    custom: 'Remnant',
  };
  const presetCount = fabric.stockPieces.filter((stock) =>
    stock.label.startsWith(labels[preset]),
  ).length;
  const inches = (value: number) => toMillimetres(value, 'inch');
  const dimensions: Record<StockPreset, { width: number; length: number }> = {
    'fat-quarter': { width: inches(21), length: inches(18) },
    'fat-eighth': { width: inches(21), length: inches(9) },
    'quarter-yard': { width: fabric.usableWidth, length: inches(9) },
    'half-yard': { width: fabric.usableWidth, length: inches(18) },
    'partial-yardage': { width: fabric.usableWidth, length: inches(18) },
    custom: {
      width: Math.min(fabric.usableWidth, inches(10)),
      length: inches(10),
    },
  };
  const sourceType: StockSourceType =
    preset === 'partial-yardage'
      ? 'partial-yardage'
      : preset === 'custom'
        ? 'custom'
        : 'preset';
  return {
    id: nextId('stock'),
    fabricId: fabric.id,
    label: `${labels[preset]} ${presetCount + 1}`,
    ...dimensions[preset],
    quantity: 1,
    sourceType,
    ...(sourceType === 'preset' ? { presetId: preset } : {}),
  };
}

function addCutRow(requirement = createCutRequirement()): void {
  markPlannerStarted();
  persist();
  project.cutRequirements.push(requirement);
  renderForm();
  persist();
  cutListRoot
    .querySelector<HTMLElement>(
      '.cut-list-row:last-child [data-field="fabricId"]',
    )
    ?.focus();
  emitAnalytics({ name: 'cut_requirement_added' });
}

function renderPastePreview(): void {
  pastePreview = previewCutListPaste(
    pasteSource.value,
    project.fabrics,
    displayedUnit,
    pasteMappings,
  );
  pasteConfirmActions.hidden = pastePreview.rows.length === 0;
  confirmPasteButton.disabled = !pastePreview.canImport;
  if (pastePreview.rows.length === 0) {
    pastePreviewRoot.replaceChildren();
    pasteStatus.textContent =
      'Paste at least one CSV or tab-separated spreadsheet data row.';
    return;
  }
  const rows = pastePreview.rows
    .map((row, index) => {
      const hasIssue = (column: string) =>
        row.issues.some((issue) => issue.column === column);
      const fabricCell = hasIssue('fabric')
        ? `<span class="help-label"><label for="paste-fabric-${index}">${escapeHtml(`Map “${row.sourceFabric || 'blank fabric'}”`)}</label>${index === 0 ? renderContextHelp('fabricName') : ''}</span><select id="paste-fabric-${index}" data-paste-fabric-row="${index}"><option value="">Choose fabric</option>${project.fabrics.map((fabric) => `<option value="${escapeHtml(fabric.id)}"${row.fabricId === fabric.id ? ' selected' : ''}>${escapeHtml(fabric.name)}</option>`).join('')}`
        : escapeHtml(
            project.fabrics.find((fabric) => fabric.id === row.fabricId)
              ?.name ?? row.sourceFabric,
          );
      const cell = (column: string, value: string) =>
        `<td${hasIssue(column) ? ' class="paste-cell-error"' : ''}>${value}</td>`;
      const issues = row.issues
        .map((issue) => `<li>${escapeHtml(issue.message)}</li>`)
        .join('');
      return `<tr>${cell('fabric', fabricCell)}${cell('label', escapeHtml(row.label))}${cell('quantity', row.quantity === undefined ? '—' : String(row.quantity))}${cell('width', row.width === undefined ? '—' : escapeHtml(formatDimension(row.width)))}${cell('height', row.height === undefined ? '—' : escapeHtml(formatDimension(row.height)))}${cell('dimensionMode', row.dimensionMode ?? '—')}${cell('row', issues ? `<ul class="paste-row-errors">${issues}</ul>` : 'Ready')}</tr>`;
    })
    .join('');
  pastePreviewRoot.innerHTML = `<div class="paste-preview-scroll"><table class="paste-preview-table"><caption>${renderContextHelpLabel('Import preview', 'actionPreview')}</caption><thead><tr><th scope="col">${renderContextHelpLabel('Fabric', 'fabricName')}</th><th scope="col">${renderContextHelpLabel('Piece', 'pieceLabel')}</th><th scope="col">${renderContextHelpLabel('Qty', 'pieceQuantity')}</th><th scope="col">${renderContextHelpLabel('Width', 'pieceDimensions')}</th><th scope="col">${renderContextHelpLabel('Height', 'pieceDimensions')}</th><th scope="col">${renderContextHelpLabel('Cut/Finished', 'cutVsFinished')}</th><th scope="col">${renderContextHelpLabel('Status', 'resultMeaning')}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  pasteStatus.textContent = pastePreview.canImport
    ? `${pastePreview.rows.length} row${pastePreview.rows.length === 1 ? '' : 's'} ready to import.`
    : 'Resolve the highlighted cells before importing.';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  markPlannerStarted();
  persist();
  const analyticsContext = plannerAnalyticsContext();
  emitAnalytics({ name: 'plan_calculation_started', ...analyticsContext });
  const result = reconcileProject(project);
  if (!result.ok) {
    emitAnalytics({
      name: 'plan_calculation_failed',
      error_category: 'validation',
    });
    showErrors(result.errors);
    return;
  }
  clearValidationErrors();
  renderResult(result);
  const completionStatus = result.summary.status.replaceAll('-', '_') as
    | 'covered_by_stock'
    | 'additional_purchase_required'
    | 'requirements_uncovered';
  emitAnalytics({
    name: 'plan_calculation_completed',
    ...analyticsContext,
    purchase_needed: result.summary.status === 'additional-purchase-required',
    completion_status: completionStatus,
  });
  if (result.summary.status === 'covered-by-stock')
    emitAnalytics({ name: 'on_hand_sufficient' });
  if (result.summary.status === 'additional-purchase-required')
    emitAnalytics({ name: 'purchase_shortfall_generated' });
});

form.addEventListener('input', (event) => {
  clearEditedFieldError(event.target);
  markPlannerStarted();
  persist();
  updateLivePlannerPresentation();
  if (!resultsRoot.hidden) {
    saveStatus.textContent = 'Plan needs recalculation.';
    calculateButton.textContent = 'Recalculate';
  }
});
form.addEventListener(
  'toggle',
  (event) => {
    if (event.target instanceof HTMLDetailsElement && event.target.open) {
      markPlannerStarted();
      saveStatus.textContent = 'Advanced assumptions are editable below.';
      emitAnalytics({ name: 'advanced_settings_opened', tool: 'planner' });
    }
  },
  true,
);

required<HTMLSelectElement>('unit-system').addEventListener(
  'change',
  (event) => {
    markPlannerStarted();
    project = readProject(displayedUnit);
    displayedUnit = (event.currentTarget as HTMLSelectElement)
      .value as UnitSystem;
    project.unitSystem = displayedUnit;
    renderForm();
    persist();
  },
);

required<HTMLButtonElement>('add-fabric').addEventListener('click', () => {
  markPlannerStarted();
  persist();
  const fresh = defaultProject(displayedUnit).fabrics[0]!;
  fresh.name = `Fabric ${String.fromCharCode(65 + project.fabrics.length)}`;
  project.fabrics.push(fresh);
  renderForm();
  persist();
  emitAnalytics({ name: 'fabric_added' });
});

fabricsRoot.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const fabricNode = target.closest<HTMLElement>('.fabric-card');
  if (!fabricNode) return;
  persist();
  const fabric = project.fabrics.find(
    (entry) => entry.id === fabricNode.dataset.fabricId,
  );
  if (!fabric) return;
  if (target.closest('[data-reset-fabric-advanced]') && fabric) {
    fabric.fabricWidth = toMillimetres(
      displayedUnit === 'imperial' ? 42 : 107,
      displayedUnit === 'imperial' ? 'inch' : 'centimetre',
    );
    fabric.directional = false;
    fabric.defaultRotationAllowed = true;
    fabric.safetyAllowancePercent = 5;
    fabric.purchaseIncrement = toMillimetres(
      displayedUnit === 'imperial' ? 0.125 : 0.1,
      displayedUnit === 'imperial' ? 'yard' : 'metre',
    );
    fabric.notes = undefined;
  } else if (target.closest<HTMLElement>('[data-add-stock]')) {
    const preset = target.closest<HTMLElement>('[data-add-stock]')?.dataset
      .addStock as StockPreset | undefined;
    if (!preset) return;
    const stock = createStockPiece(fabric, preset);
    fabric.stockPieces.push(stock);
    emitAnalytics({
      name: 'stock_piece_added',
      stock_source: stockSourceCategory(stock.sourceType),
    });
  } else if (target.closest('[data-remove-stock]')) {
    const stockId =
      target.closest<HTMLElement>('.stock-piece')?.dataset.stockId;
    fabric.stockPieces = fabric.stockPieces.filter(
      (stock) => stock.id !== stockId,
    );
    emitAnalytics({ name: 'stock_piece_removed' });
  } else if (target.closest('[data-remove-fabric]')) {
    if (project.fabrics.length === 1) {
      saveStatus.textContent = 'A project needs at least one fabric.';
      return;
    }
    if (
      project.cutRequirements.some(
        (requirement) => requirement.fabricId === fabric.id,
      )
    ) {
      saveStatus.textContent =
        'Reassign this fabric’s cut rows before removing the fabric.';
      return;
    }
    project.fabrics = project.fabrics.filter((entry) => entry.id !== fabric.id);
    emitAnalytics({ name: 'fabric_removed' });
  } else return;
  renderForm();
  persist();
});

required<HTMLButtonElement>('add-cut-row').addEventListener('click', () => {
  addCutRow();
});

cutListRoot.addEventListener('keydown', (event) => {
  if (
    event.key !== 'Enter' ||
    event.target instanceof HTMLTextAreaElement ||
    event.target instanceof HTMLSelectElement ||
    event.target instanceof HTMLButtonElement
  )
    return;
  const row = (event.target as HTMLElement).closest('.cut-list-row');
  const rows = [...cutListRoot.querySelectorAll('.cut-list-row')];
  if (row !== rows.at(-1)) return;
  event.preventDefault();
  addCutRow();
});

cutListRoot.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const row = target.closest<HTMLElement>('[data-requirement-id]');
  if (!row) return;
  persist();
  const index = project.cutRequirements.findIndex(
    (requirement) => requirement.id === row.dataset.requirementId,
  );
  if (index < 0) return;
  const requirement = project.cutRequirements[index]!;
  if (target.closest('[data-reset-cut-advanced]')) {
    requirement.rotationAllowed = undefined;
    requirement.orientation = 'none';
    requirement.isWofStrip = false;
    requirement.notes = undefined;
  } else if (target.closest('[data-duplicate-cut]')) {
    project.cutRequirements.splice(index + 1, 0, {
      ...requirement,
      id: nextId('piece'),
    });
    emitAnalytics({ name: 'cut_requirement_added' });
  } else if (target.closest('[data-remove-cut]')) {
    deletedCut = { requirement: { ...requirement }, index };
    project.cutRequirements.splice(index, 1);
    cutListUndo.hidden = false;
    emitAnalytics({ name: 'cut_requirement_removed' });
  } else return;
  renderForm();
  persist();
});

required<HTMLButtonElement>('undo-cut-row').addEventListener('click', () => {
  if (!deletedCut) return;
  persist();
  project.cutRequirements.splice(deletedCut.index, 0, deletedCut.requirement);
  deletedCut = undefined;
  cutListUndo.hidden = true;
  renderForm();
  persist();
});

required<HTMLButtonElement>('open-paste-dialog').addEventListener(
  'click',
  () => {
    persist();
    pasteMappings = [];
    pastePreview = undefined;
    pasteSource.value = '';
    pastePreviewRoot.replaceChildren();
    pasteConfirmActions.hidden = true;
    pasteStatus.textContent = '';
    pasteDialog.showModal();
    pasteSource.focus();
    emitAnalytics({ name: 'cutlist_paste_opened' });
  },
);

required<HTMLButtonElement>('cancel-paste').addEventListener('click', () => {
  pasteDialog.close();
});

required<HTMLButtonElement>('preview-paste').addEventListener('click', () => {
  pasteMappings = [];
  renderPastePreview();
  emitPastePreviewOutcome();
});

pastePreviewRoot.addEventListener('change', (event) => {
  const select = event.target;
  if (!(select instanceof HTMLSelectElement)) return;
  const rowIndex = Number(select.dataset.pasteFabricRow);
  const sourceFabric = pastePreview?.rows[rowIndex]?.sourceFabric;
  if (!sourceFabric) return;
  pasteMappings = pasteMappings.filter(
    (mapping) => mapping.sourceFabric !== sourceFabric,
  );
  if (select.value)
    pasteMappings.push({ sourceFabric, fabricId: select.value });
  renderPastePreview();
  emitPastePreviewOutcome();
});

confirmPasteButton.addEventListener('click', () => {
  if (!pastePreview?.canImport) return;
  persist();
  const imported = compileCutListPaste(pastePreview, () => nextId('piece'));
  project.cutRequirements.push(...imported);
  renderForm();
  persist();
  pasteDialog.close();
  saveStatus.textContent = `${imported.length} pasted cut row${imported.length === 1 ? '' : 's'} imported.`;
  emitAnalytics({
    name: 'cutlist_paste_completed',
    paste_rows_bucket: pasteRowsBucket(imported.length),
  });
});

function emitPastePreviewOutcome(): void {
  if (!pastePreview) return;
  const bucket = pasteRowsBucket(pastePreview.rows.length);
  emitAnalytics({
    name: 'cutlist_paste_previewed',
    paste_rows_bucket: bucket,
    paste_status: pastePreview.canImport ? 'ready' : 'needs_attention',
  });
  if (pastePreview.canImport) return;
  const issues = pastePreview.rows.flatMap((row) => row.issues);
  emitAnalytics({
    name: 'cutlist_paste_failed',
    paste_rows_bucket: bucket,
    error_category:
      pastePreview.rows.length === 0
        ? 'paste_empty'
        : issues.length > 0 &&
            issues.every((issue) => issue.column === 'fabric')
          ? 'paste_mapping'
          : 'paste_format',
  });
}

fabricsRoot.addEventListener('change', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.dataset.field !== 'directional' || !target.checked) return;
  const fabricNode = target.closest<HTMLElement>('.fabric-card');
  const rotationControl = fabricNode?.querySelector<HTMLInputElement>(
    '[data-field="defaultRotationAllowed"]',
  );
  if (rotationControl) {
    rotationControl.checked = false;
    persist();
  }
});

fabricsRoot.addEventListener('change', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (
    target.dataset.field !== 'patternStatedAmount' ||
    target.value.trim() === '' ||
    target.dataset.analyticsPatternAdded === 'true'
  )
    return;
  target.dataset.analyticsPatternAdded = 'true';
  const fabricNode = target.closest<HTMLElement>('.fabric-card');
  const patternWof = fabricNode?.querySelector<HTMLInputElement>(
    '[data-field="patternAssumedUsableWidth"]',
  );
  emitAnalytics({
    name: 'pattern_yardage_added',
    has_pattern_wof: Boolean(patternWof?.value.trim()),
  });
});

const exportPdfButton = required<HTMLButtonElement>('export-pdf-result');
const exportPlannerPdf = shouldExportPlannerPdf({
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  maxTouchPoints: navigator.maxTouchPoints,
  userAgentDataMobile: (
    navigator as Navigator & { userAgentData?: { mobile?: boolean } }
  ).userAgentData?.mobile,
});
if (exportPlannerPdf) {
  exportPdfButton.setAttribute('aria-label', 'export PDF for print');
  exportPdfButton.querySelector('span')!.textContent = 'export PDF';
  exportPdfButton.querySelector('small')!.hidden = false;
  const helpRoot = exportPdfButton.closest<HTMLElement>('[data-action-help]')!;
  helpRoot.dataset.helpKey = 'actionExportPdf';
  helpRoot.querySelector<HTMLElement>(
    '[data-action-help-tooltip]',
  )!.textContent = CONTEXT_HELP.actionExportPdf.explanation;
}
let latestPdfUrl: string | undefined;

exportPdfButton.addEventListener('click', async () => {
  if (exportPdfButton.disabled) return;
  emitAnalytics({ name: 'print_result' });
  exportPdfButton.disabled = true;
  exportPdfButton.setAttribute('aria-busy', 'true');
  if (!exportPlannerPdf) {
    actionStatus.textContent = 'Preparing print…';
    try {
      // These faces are used only by print CSS, so fonts.ready alone on the
      // screen does not initiate their first load. Load both before native Print
      // enters print media and measures SVG labels/diagram geometry.
      const fonts = await Promise.allSettled([
        document.fonts.load('400 16px "QuiltClarity Print"'),
        document.fonts.load('700 16px "QuiltClarity Print"'),
      ]);
      await document.fonts.ready;
      actionStatus.textContent = fonts.some(
        (font) => font.status === 'rejected',
      )
        ? 'Print fonts could not load. Using browser fallback fonts.'
        : '';
      window.print();
    } catch {
      actionStatus.textContent = 'Could not open Print. Try Print again.';
    } finally {
      exportPdfButton.disabled = false;
      exportPdfButton.removeAttribute('aria-busy');
    }
    return;
  }
  actionStatus.textContent = 'Preparing your PDF…';
  try {
    const { createPlannerPrintPdf } =
      await import('../lib/printing/planner-pdf');
    const pdf = await createPlannerPrintPdf({
      pageRoot:
        required<HTMLElement>('planner-results').closest<HTMLElement>('.page')!,
    });
    const pdfBlob = new Blob([new Uint8Array(pdf)], {
      type: 'application/pdf',
    });
    const url = URL.createObjectURL(pdfBlob);
    if (latestPdfUrl) URL.revokeObjectURL(latestPdfUrl);
    latestPdfUrl = url;
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quiltclarity-plan.pdf';
    link.textContent = 'Open or download the PDF';
    actionStatus.replaceChildren(
      'PDF ready. If the download did not start, ',
      link,
      '.',
    );
    link.click();
  } catch (error) {
    actionStatus.textContent =
      error instanceof Error &&
      error.message.startsWith('The bundled PDF font cannot')
        ? error.message
        : 'Could not prepare the PDF. Try export PDF again.';
  } finally {
    exportPdfButton.disabled = false;
    exportPdfButton.removeAttribute('aria-busy');
  }
});

window.addEventListener('pagehide', () => {
  if (latestPdfUrl) URL.revokeObjectURL(latestPdfUrl);
});

window.addEventListener('beforeprint', fitPrintDiagrams);
window.addEventListener('afterprint', restoreScreenDiagrams);
window.matchMedia('print').addEventListener('change', (event) => {
  if (event.matches) {
    fitPrintDiagrams();
  } else {
    restoreScreenDiagrams();
  }
});
required<HTMLButtonElement>('copy-result').addEventListener(
  'click',
  async () => {
    emitAnalytics({ name: 'copy_shopping_list' });
    try {
      await navigator.clipboard.writeText(latestSummary);
      actionStatus.textContent = 'Summary copied.';
    } catch {
      actionStatus.textContent = 'Copy was blocked by your browser.';
    }
  },
);
required<HTMLButtonElement>('share-result').addEventListener(
  'click',
  async () => {
    if (!navigator.share) {
      actionStatus.textContent =
        'Sharing is not available here; use Copy summary instead.';
      return;
    }
    try {
      await navigator.share({
        title: project.name || 'QuiltClarity cutting plan',
        text: latestSummary,
      });
      actionStatus.textContent = 'Share sheet opened.';
      emitAnalytics({ name: 'share_result' });
    } catch {
      actionStatus.textContent = 'Sharing was cancelled.';
    }
  },
);
required<HTMLButtonElement>('edit-result').addEventListener('click', () => {
  form.scrollIntoView({ behavior: 'smooth' });
  required<HTMLInputElement>('project-name').focus();
});

const restored = restorePlannerProject(localStorage);
if (
  restored.status === 'restored' ||
  restored.status === 'migrated' ||
  restored.status === 'recovered'
) {
  project = restored.project;
  displayedUnit = project.unitSystem;
  saveStatus.textContent =
    restored.status === 'migrated'
      ? 'Your saved project was updated and restored.'
      : restored.status === 'recovered'
        ? `Your saved project was recovered with a format warning: ${restored.issues.join(' ')}`
        : 'Saved project restored from this device.';
} else if (restored.status === 'discarded')
  saveStatus.textContent =
    "Your saved project couldn't be restored automatically. Its original local data was preserved, and a fresh in-memory project is ready.";
renderForm();
emitAnalytics({
  name: 'tool_viewed',
  tool: 'planner',
  toolId: 'fabric-cutting-planner',
  returning_user: isReturningToolUser(localStorage),
});
