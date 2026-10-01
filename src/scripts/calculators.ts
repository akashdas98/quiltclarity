import {
  calculateBacking,
  calculateBatting,
  calculateBinding,
  calculateBlockCount,
  calculateBorders,
  calculateFabricYardage,
  calculateFlyingGeese,
  calculateHst,
  calculatePiecesFromFabric,
  calculateQst,
  calculateSashing,
  fromMillimetres,
  PLANNER_PROJECT_SCHEMA_VERSION,
  toMillimetres,
  type CalculatorExplanation,
  type CalculatorWarning,
  type PieceGroup,
  type PlannerProject,
  type UnitSystem,
  type ValidationError,
} from '../lib/domain';
import {
  createPiecesFromFabricCuttingPlan,
  renderCuttingDiagramSvg,
} from '../lib/presentation';
import { restorePlannerProject, savePlannerProject } from '../lib/persistence';
import {
  emitAnalytics,
  isCalculatorId,
  isReturningToolUser,
  type CalculatorId,
} from '../lib/analytics';
import { CONTEXT_HELP, type ContextHelpEntry, type HelpKey } from '../lib/help';

type SuccessfulResult = {
  ok: true;
  warnings: readonly CalculatorWarning[] | readonly { message: string }[];
  explanation?: CalculatorExplanation | object;
};

interface RenderedCalculation {
  result: SuccessfulResult | { ok: false; errors: ValidationError[] };
  hero?: [string, string];
  metrics?: Array<[string, string]>;
  addPiece?: PieceGroup;
  detailHtml?: string;
}

document
  .querySelectorAll<HTMLFormElement>('.calculator-form')
  .forEach(setupCalculator);

function setupCalculator(form: HTMLFormElement): void {
  const calculator = form.dataset.calculator;
  if (!calculator || !isCalculatorId(calculator)) return;
  emitAnalytics({
    name: 'tool_viewed',
    tool: 'calculator',
    toolId: calculator,
    returning_user: isReturningToolUser(localStorage),
  });
  let started = false;
  const markStarted = (): void => {
    if (started) return;
    started = true;
    emitAnalytics({ name: 'calculator_started', calculator });
  };
  const unitSelect = form.elements.namedItem('unitSystem') as HTMLSelectElement;
  let displayedUnit = unitSelect.value as UnitSystem;
  let summary = '';
  let addPiece: PieceGroup | undefined;
  const resultRoot =
    form.parentElement?.querySelector<HTMLElement>('.calculator-result');
  const errorsRoot = form.querySelector<HTMLElement>('.calculator-errors');
  if (!resultRoot || !errorsRoot) return;
  const content = resultRoot.querySelector<HTMLElement>(
    '[data-result-content]',
  );
  const copyButton = resultRoot.querySelector<HTMLButtonElement>('[data-copy]');
  const printButton =
    resultRoot.querySelector<HTMLButtonElement>('[data-print]');
  const addButton = resultRoot.querySelector<HTMLButtonElement>(
    '[data-add-to-planner]',
  );
  const status = resultRoot.querySelector<HTMLElement>('[data-action-status]');
  if (!content || !copyButton || !printButton || !addButton || !status) return;

  form.addEventListener('input', () => {
    markStarted();
    updatePiecesMode(form);
    updateAdvancedSummary(form);
  });
  form.addEventListener(
    'toggle',
    (event) => {
      if (event.target instanceof HTMLDetailsElement && event.target.open) {
        markStarted();
        emitAnalytics({
          name: 'advanced_settings_opened',
          tool: 'calculator',
        });
      }
    },
    true,
  );
  form
    .querySelector<HTMLButtonElement>('[data-reset-advanced]')
    ?.addEventListener('click', () => {
      form
        .querySelectorAll<HTMLInputElement | HTMLSelectElement>(
          '[data-calculator-advanced] input, [data-calculator-advanced] select',
        )
        .forEach((control) => {
          if (
            control instanceof HTMLInputElement &&
            control.type === 'checkbox'
          )
            control.checked = control.defaultChecked;
          else if (control instanceof HTMLInputElement)
            control.value = control.defaultValue;
          else
            control.value =
              control.querySelector<HTMLOptionElement>('option[selected]')
                ?.value ??
              control.options[0]?.value ??
              '';
        });
      markStarted();
      updateAdvancedSummary(form);
    });

  unitSelect.addEventListener('change', () => {
    const nextUnit = unitSelect.value as UnitSystem;
    form
      .querySelectorAll<HTMLInputElement>('[data-measure]')
      .forEach((input) => {
        const value = Number(input.value);
        if (!Number.isFinite(value)) return;
        const measure = input.dataset.measure;
        const mm = toMillimetres(
          value,
          measure === 'purchase'
            ? displayedUnit === 'imperial'
              ? 'yard'
              : 'metre'
            : displayedUnit === 'imperial'
              ? 'inch'
              : 'centimetre',
        );
        input.value = String(
          Number(
            fromMillimetres(
              mm,
              measure === 'purchase'
                ? nextUnit === 'imperial'
                  ? 'yard'
                  : 'metre'
                : nextUnit === 'imperial'
                  ? 'inch'
                  : 'centimetre',
            ).toFixed(4),
          ),
        );
      });
    displayedUnit = nextUnit;
    updateUnitLabels(form, displayedUnit);
    updateAdvancedSummary(form);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    markStarted();
    const calculation = calculate(calculator, form, displayedUnit);
    if (!calculation.result.ok) {
      emitAnalytics({
        name: 'calculator_error',
        calculator,
        error_category: 'validation',
      });
      resultRoot.hidden = true;
      showErrors(form, errorsRoot, calculation.result.errors);
      return;
    }
    errorsRoot.hidden = true;
    addPiece = calculation.addPiece;
    addButton.hidden = !addPiece;
    summary = `${document.querySelector('h1')?.textContent ?? 'Quilting calculation'}\n${calculation.hero ? `${calculation.hero[0]}: ${calculation.hero[1]}\n` : ''}${(calculation.metrics ?? []).map(([label, value]) => `${label}: ${value}`).join('\n')}`;
    content.innerHTML = renderSuccess(
      calculator,
      calculation.result,
      calculation.hero,
      calculation.metrics ?? [],
      calculation.detailHtml,
    );
    resultRoot.hidden = false;
    resultRoot.focus({ preventScroll: true });
    resultRoot.scrollIntoView({ behavior: 'smooth', block: 'start' });
    emitAnalytics({
      name: 'calculator_completed',
      calculator,
      unit_system: displayedUnit,
    });
  });

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(summary);
      status.textContent = 'Summary copied.';
    } catch {
      status.textContent = 'Copy was blocked by your browser.';
    }
  });
  printButton.addEventListener('click', () => {
    emitAnalytics({ name: 'calculator_result_printed', calculator });
    window.print();
  });
  addButton.addEventListener('click', () => {
    if (!addPiece) return;
    const outcome = addPieceToPlanner(addPiece, displayedUnit);
    if (outcome) emitAnalytics({ name: 'calculator_to_project', calculator });
    status.innerHTML = outcome
      ? 'Added to your saved project. <a href="/fabric-cutting-planner/">Open planner</a>.'
      : 'Your browser blocked local saving.';
  });
  updateAdvancedSummary(form);
  updatePiecesMode(form);
}

function field(
  form: HTMLFormElement,
  name: string,
): HTMLInputElement | HTMLSelectElement {
  return form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement;
}
function number(form: HTMLFormElement, name: string): number {
  return Number(field(form, name).value);
}
function bool(form: HTMLFormElement, name: string): boolean {
  return (field(form, name) as HTMLInputElement).checked;
}
function mm(form: HTMLFormElement, name: string, unit: UnitSystem): number {
  return toMillimetres(
    number(form, name),
    unit === 'imperial' ? 'inch' : 'centimetre',
  );
}
function optionalMm(
  form: HTMLFormElement,
  name: string,
  unit: UnitSystem,
): number | undefined {
  const value = field(form, name).value.trim();
  return value === '' ? undefined : mm(form, name, unit);
}
function purchaseMm(
  form: HTMLFormElement,
  name: string,
  unit: UnitSystem,
): number {
  return toMillimetres(
    number(form, name),
    unit === 'imperial' ? 'yard' : 'metre',
  );
}
function lengthLabel(value: number, unit: UnitSystem): string {
  return `${Number(fromMillimetres(value, unit === 'imperial' ? 'inch' : 'centimetre').toFixed(3))} ${unit === 'imperial' ? 'in' : 'cm'}`;
}
function purchaseLabel(value: number, unit: UnitSystem): string {
  return `${Number(fromMillimetres(value, unit === 'imperial' ? 'yard' : 'metre').toFixed(3))} ${unit === 'imperial' ? 'yd' : 'm'}`;
}

function calculate(
  kind: CalculatorId,
  form: HTMLFormElement,
  unit: UnitSystem,
): RenderedCalculation {
  if (kind === 'fabric-yardage') {
    const piece: PieceGroup = {
      id: 'calculator-piece',
      label: 'Calculated piece',
      quantity: number(form, 'quantity'),
      width: mm(form, 'width', unit),
      height: mm(form, 'height', unit),
      dimensionMode: field(form, 'dimensionMode').value as 'cut' | 'finished',
      rotationAllowed: bool(form, 'rotationAllowed'),
    };
    const fabric = {
      id: 'calculator-fabric',
      name: 'Fabric',
      fabricWidth: mm(form, 'usableWidth', unit),
      usableWidth: mm(form, 'usableWidth', unit),
      directional: bool(form, 'directional'),
      defaultRotationAllowed: bool(form, 'rotationAllowed'),
      safetyAllowancePercent: number(form, 'safetyAllowancePercent'),
      purchaseIncrement: purchaseMm(form, 'purchaseIncrement', unit),
    };
    const result = calculateFabricYardage(
      fabric,
      piece,
      mm(form, 'seamAllowance', unit),
    );
    if (!result.ok) return { result };
    return {
      result,
      hero: [
        'Recommended purchase',
        purchaseLabel(result.explanation.recommendedLength, unit),
      ],
      addPiece: {
        ...piece,
        width: result.normalizedPiece.width,
        height: result.normalizedPiece.height,
        dimensionMode: 'cut',
      },
      metrics: [
        ['Pieces per row', String(result.explanation.piecesPerRow)],
        ['Rows required', String(result.explanation.rowsRequired)],
        [
          'Calculated plan length',
          lengthLabel(result.explanation.rawLength, unit),
        ],
        [
          'Recommended purchase',
          purchaseLabel(result.explanation.recommendedLength, unit),
        ],
      ],
    };
  }
  if (kind === 'backing') {
    const result = calculateBacking({
      quiltWidth: mm(form, 'quiltWidth', unit),
      quiltLength: mm(form, 'quiltLength', unit),
      overagePerSide: mm(form, 'overagePerSide', unit),
      usableBackingWidth: mm(form, 'usableBackingWidth', unit),
      panelSeamAllowance: mm(form, 'panelSeamAllowance', unit),
      directional: bool(form, 'directional'),
      safetyAllowancePercent: number(form, 'safetyAllowancePercent'),
      purchaseIncrement: purchaseMm(form, 'purchaseIncrement', unit),
    });
    if (!result.ok) return { result };
    const candidate = result.lowestYardage;
    return {
      result,
      hero: [
        'Recommended',
        `${purchaseLabel(candidate.recommendedLength, unit)} · ${candidate.seamDirection} seam · ${candidate.panelCount} panel${candidate.panelCount === 1 ? '' : 's'}`,
      ],
      addPiece: {
        id: 'backing-panels',
        label: 'Backing panel',
        quantity: candidate.panelCount,
        width: mm(form, 'usableBackingWidth', unit),
        height: candidate.panelRunLength,
        dimensionMode: 'cut',
        rotationAllowed: false,
      },
      metrics: [
        [
          'Backing size',
          `${lengthLabel(result.requiredWidth, unit)} × ${lengthLabel(result.requiredLength, unit)}`,
        ],
        ['Lowest-yardage option', candidate.seamDirection],
        ['Panels', String(candidate.panelCount)],
        [
          'Lowest-yardage purchase',
          purchaseLabel(candidate.recommendedLength, unit),
        ],
        ...result.candidates.map(
          (option) =>
            [
              `${option.seamDirection} candidate`,
              `${option.panelCount} panel${option.panelCount === 1 ? '' : 's'} · ${purchaseLabel(option.recommendedLength, unit)}`,
            ] as [string, string],
        ),
      ],
    };
  }
  if (kind === 'batting') {
    const result = calculateBatting({
      quiltWidth: mm(form, 'quiltWidth', unit),
      quiltLength: mm(form, 'quiltLength', unit),
      overagePerSide: mm(form, 'overagePerSide', unit),
      rollWidth: optionalMm(form, 'rollWidth', unit),
      rotationAllowed: bool(form, 'rotationAllowed'),
    });
    if (!result.ok) return { result };
    const selected = result.lowestLinearLength;
    return {
      result,
      hero: selected
        ? [
            'Cut from the supplied roll',
            `${lengthLabel(selected.requiredLinearLength, unit)} from a ${lengthLabel(result.rollWidth!, unit)} roll`,
          ]
        : [
            'Batting size',
            `${lengthLabel(result.requiredWidth, unit)} × ${lengthLabel(result.requiredLength, unit)}`,
          ],
      metrics: [
        [
          'Required batting size',
          `${lengthLabel(result.requiredWidth, unit)} × ${lengthLabel(result.requiredLength, unit)}`,
        ],
        ...(selected
          ? [
              [
                'Selected orientation',
                selected.orientation === 'required-width-across-roll'
                  ? 'Quilt width across roll'
                  : 'Quilt length across roll',
              ] as [string, string],
              [
                'Linear length to cut',
                lengthLabel(selected.requiredLinearLength, unit),
              ] as [string, string],
            ]
          : []),
      ],
    };
  }
  if (kind === 'binding') {
    const stripWidth = mm(form, 'stripWidth', unit);
    const usableWidth = mm(form, 'usableWidth', unit);
    const result = calculateBinding({
      quiltWidth: mm(form, 'quiltWidth', unit),
      quiltLength: mm(form, 'quiltLength', unit),
      stripWidth,
      usableWidth,
      joiningAllowance: mm(form, 'joiningAllowance', unit),
      safetyAllowancePercent: number(form, 'safetyAllowancePercent'),
      purchaseIncrement: purchaseMm(form, 'purchaseIncrement', unit),
    });
    if (!result.ok) return { result };
    return {
      result,
      hero: [
        'Binding to cut',
        `${result.stripCount} strips · Buy ${purchaseLabel(result.recommendedLength, unit)}`,
      ],
      addPiece: {
        id: 'binding-strips',
        label: 'Binding strip',
        quantity: result.stripCount,
        width: usableWidth,
        height: stripWidth,
        dimensionMode: 'cut',
        isWofStrip: true,
        rotationAllowed: false,
      },
      metrics: [
        ['Binding needed', lengthLabel(result.requiredBindingLength, unit)],
        ['WOF strips', String(result.stripCount)],
        ['Recommended purchase', purchaseLabel(result.recommendedLength, unit)],
      ],
    };
  }
  if (kind === 'hst') {
    const result = calculateHst({
      finishedSize: mm(form, 'finishedSize', unit),
      quantity: number(form, 'quantity'),
      method: field(form, 'method').value as
        'two-at-a-time' | 'four-at-a-time' | 'eight-at-a-time',
      sizingMode: field(form, 'sizingMode').value as
        'standard' | 'trim-friendly',
      seamAllowance: mm(form, 'seamAllowance', unit),
    });
    if (!result.ok) return { result };
    return {
      result,
      hero: [
        'Starting squares',
        `Cut ${lengthLabel(result.selectedStartingSquare, unit)} squares`,
      ],
      addPiece: {
        id: 'hst-starting-squares',
        label: 'HST starting square',
        quantity: result.totalStartingSquares,
        width: result.selectedStartingSquare,
        height: result.selectedStartingSquare,
        dimensionMode: 'cut',
      },
      metrics: [
        ['Starting square', lengthLabel(result.selectedStartingSquare, unit)],
        ['Squares per fabric', String(result.startingSquaresPerFabric)],
        ['Total starting squares', String(result.totalStartingSquares)],
        ['HSTs produced', `${result.produced} (${result.excess} extra)`],
      ],
    };
  }
  if (kind === 'qst') {
    const result = calculateQst({
      finishedSize: mm(form, 'finishedSize', unit),
      quantity: number(form, 'quantity'),
      sizingMode: field(form, 'sizingMode').value as
        'standard' | 'trim-friendly',
    });
    if (!result.ok) return { result };
    return {
      result,
      hero: [
        'Starting squares',
        `Cut ${lengthLabel(result.selectedStartingSquare, unit)} squares`,
      ],
      metrics: [
        ['Finished size', lengthLabel(result.finishedSize, unit)],
        ['Unfinished/trim size', lengthLabel(result.unfinishedSize, unit)],
        ['Starting square', lengthLabel(result.selectedStartingSquare, unit)],
        ['Batch yield', `${result.yieldPerBatch} QSTs`],
        ['Batches', String(result.batches)],
        [
          'Starting squares per fabric',
          String(result.startingSquaresPerFabric),
        ],
        ['Requested', String(number(form, 'quantity'))],
        ['Produced', String(result.produced)],
        ['Excess', String(result.excess)],
      ],
    };
  }
  if (kind === 'flying-geese') {
    const result = calculateFlyingGeese({
      finishedWidth: mm(form, 'finishedWidth', unit),
      finishedHeight: mm(form, 'finishedHeight', unit),
      quantity: number(form, 'quantity'),
      method: field(form, 'method').value as 'one-at-a-time' | 'four-at-a-time',
      sizingMode: field(form, 'sizingMode').value as
        'standard' | 'trim-friendly',
    });
    if (!result.ok) return { result };
    return {
      result,
      hero: [
        'Starting cuts',
        `${lengthLabel(result.selected.bodyWidth, unit)} × ${lengthLabel(result.selected.bodyHeight, unit)} body`,
      ],
      metrics: [
        [
          'Finished size',
          `${lengthLabel(result.finishedWidth, unit)} × ${lengthLabel(result.finishedHeight, unit)}`,
        ],
        [
          'Unfinished/trim size',
          `${lengthLabel(result.unfinishedWidth, unit)} × ${lengthLabel(result.unfinishedHeight, unit)}`,
        ],
        [
          'Body cut',
          `${lengthLabel(result.selected.bodyWidth, unit)} × ${lengthLabel(result.selected.bodyHeight, unit)}`,
        ],
        [
          'Background square',
          lengthLabel(result.selected.backgroundSquare, unit),
        ],
        ['Batch yield', String(result.yieldPerBatch)],
        ['Batches', String(result.batches)],
        ['Body pieces', String(result.bodyPieceCount)],
        ['Background squares', String(result.backgroundSquareCount)],
        ['Requested', String(number(form, 'quantity'))],
        ['Produced', String(result.produced)],
        ['Excess', String(result.excess)],
      ],
    };
  }
  if (kind === 'pieces-from-fabric') {
    const stockWidth = mm(form, 'stockWidth', unit);
    const stockLength = mm(form, 'stockLength', unit);
    const requestedMode = field(form, 'fitMode').value === 'requested';
    const result = calculatePiecesFromFabric({
      stockWidth,
      stockLength,
      pieceWidth: mm(form, 'pieceWidth', unit),
      pieceHeight: mm(form, 'pieceHeight', unit),
      quantity: requestedMode ? number(form, 'quantity') : undefined,
      dimensionMode: field(form, 'dimensionMode').value as 'cut' | 'finished',
      seamAllowance: mm(form, 'seamAllowance', unit),
      directional: bool(form, 'directional'),
      rotationAllowed: bool(form, 'rotationAllowed'),
    });
    if (!result.ok) return { result };
    const plan = createPiecesFromFabricCuttingPlan(
      result,
      {
        width: stockWidth,
        length: stockLength,
        directional: bool(form, 'directional'),
      },
      unit,
    );
    return {
      result,
      hero: requestedMode
        ? [
            result.requestedFits
              ? 'Requested pieces fit'
              : 'Requested pieces do not all fit',
            `${result.placedQuantity} placed · practical capacity ${result.maximumPracticalYield}`,
          ]
        : ['Practical capacity', `${result.maximumPracticalYield} pieces`],
      addPiece: {
        id: 'pieces-from-fabric-piece',
        label: 'Repeated piece',
        quantity: requestedMode
          ? number(form, 'quantity')
          : result.maximumPracticalYield,
        width: result.cutPieceWidth,
        height: result.cutPieceHeight,
        dimensionMode: 'cut',
        rotationAllowed: bool(form, 'rotationAllowed'),
      },
      metrics: [
        ['Pieces that fit', String(result.maximumPracticalYield)],
        ['Pieces shown', String(result.placedQuantity)],
        [
          'Cut piece size',
          `${lengthLabel(result.cutPieceWidth, unit)} × ${lengthLabel(result.cutPieceHeight, unit)}`,
        ],
        ['Useful leftover regions', String(result.leftovers.length)],
      ],
      detailHtml: `<section class="calculator-diagram"><h3>${renderLabelWithHelp('Visual layout', renderHelp('cuttingInstructions'))}</h3><div class="diagram-wrap">${renderCuttingDiagramSvg(plan.diagram)}</div><details class="text-plan"><summary>${renderLabelWithHelp('Text version of this layout', renderHelp('cuttingInstructions'))}</summary><p>${escapeHtml(plan.diagram.textAlternative.summary)}</p><ol>${plan.instructions.map((instruction) => `<li>${escapeHtml(instruction.text)}</li>`).join('')}</ol></details></section>`,
    };
  }
  if (kind === 'block-count') {
    const result = calculateBlockCount({
      targetWidth: mm(form, 'targetWidth', unit),
      targetLength: mm(form, 'targetLength', unit),
      finishedBlockWidth: mm(form, 'finishedBlockWidth', unit),
      finishedBlockHeight: mm(form, 'finishedBlockHeight', unit),
      finishedSashingWidth: mm(form, 'finishedSashingWidth', unit),
    });
    if (!result.ok) return { result };
    return {
      result,
      hero: [
        'Block layout',
        `${result.blocksAcross} × ${result.blocksDown} blocks = ${result.totalBlocks} blocks`,
      ],
      metrics: [
        ['Blocks across', String(result.blocksAcross)],
        ['Blocks down', String(result.blocksDown)],
        ['Total blocks', String(result.totalBlocks)],
        [
          'Actual quilt size',
          `${lengthLabel(result.actualWidth, unit)} × ${lengthLabel(result.actualLength, unit)}`,
        ],
        [
          'Difference from target',
          `${lengthLabel(result.widthDifference, unit)} wider · ${lengthLabel(result.lengthDifference, unit)} longer`,
        ],
      ],
    };
  }
  if (kind === 'borders') {
    const usableWidth = mm(form, 'usableWidth', unit);
    const result = calculateBorders({
      quiltWidth: mm(form, 'quiltWidth', unit),
      quiltLength: mm(form, 'quiltLength', unit),
      finishedBorderWidth: mm(form, 'finishedBorderWidth', unit),
      layers: number(form, 'layers'),
      seamAllowance: mm(form, 'seamAllowance', unit),
      usableWidth,
      handlingBuffer: mm(form, 'handlingBuffer', unit),
      joinSeamAllowance: mm(form, 'joinSeamAllowance', unit),
      safetyAllowancePercent: number(form, 'safetyAllowancePercent'),
      purchaseIncrement: purchaseMm(form, 'purchaseIncrement', unit),
    });
    if (!result.ok) return { result };
    return {
      result,
      hero: [
        'Planning purchase',
        `Buy ${purchaseLabel(result.recommendedLength, unit)}`,
      ],
      addPiece: {
        id: 'border-strips',
        label: 'Border strip',
        quantity: result.stripCount,
        width: usableWidth,
        height: result.cutBorderWidth,
        dimensionMode: 'cut',
        isWofStrip: true,
        rotationAllowed: false,
      },
      metrics: [
        ['Cut strip width', lengthLabel(result.cutBorderWidth, unit)],
        [
          'Nominal side-border length',
          result.layerResults
            .map((layer) => lengthLabel(layer.sideBorderFinishedLength, unit))
            .join(' · '),
        ],
        [
          'Nominal top/bottom-border length',
          result.layerResults
            .map((layer) => lengthLabel(layer.topBottomFinishedLength, unit))
            .join(' · '),
        ],
        ['WOF strips', String(result.stripCount)],
        ['Planning yardage', purchaseLabel(result.recommendedLength, unit)],
        [
          'Final quilt size',
          `${lengthLabel(result.finalWidth, unit)} × ${lengthLabel(result.finalLength, unit)}`,
        ],
      ],
    };
  }
  const usableWidth = mm(form, 'usableWidth', unit);
  const result = calculateSashing({
    columns: number(form, 'columns'),
    rows: number(form, 'rows'),
    finishedBlockWidth: mm(form, 'finishedBlockWidth', unit),
    finishedBlockHeight: mm(form, 'finishedBlockHeight', unit),
    finishedSashingWidth: mm(form, 'finishedSashingWidth', unit),
    seamAllowance: mm(form, 'seamAllowance', unit),
    usableWidth,
    handlingBuffer: mm(form, 'handlingBuffer', unit),
    joinSeamAllowance: mm(form, 'joinSeamAllowance', unit),
    safetyAllowancePercent: number(form, 'safetyAllowancePercent'),
    purchaseIncrement: purchaseMm(form, 'purchaseIncrement', unit),
  });
  if (!result.ok) return { result };
  return {
    result,
    hero: [
      'Recommended purchase',
      `Buy ${purchaseLabel(result.recommendedLength, unit)}`,
    ],
    addPiece: {
      id: 'sashing-strips',
      label: 'Sashing strip',
      quantity: result.stripCount,
      width: usableWidth,
      height: result.cutSashingWidth,
      dimensionMode: 'cut',
      isWofStrip: true,
      rotationAllowed: false,
    },
    metrics: [
      ['Cut strip width', lengthLabel(result.cutSashingWidth, unit)],
      ['Vertical pieces', String(result.verticalPieceCount)],
      ['Horizontal rows', String(result.horizontalStripCount)],
      ['WOF strips', String(result.stripCount)],
      ['Recommended purchase', purchaseLabel(result.recommendedLength, unit)],
    ],
  };
}

function renderSuccess(
  calculator: CalculatorId,
  result: SuccessfulResult,
  hero: [string, string] | undefined,
  metrics: Array<[string, string]>,
  detailHtml = '',
): string {
  const warnings = result.warnings.length
    ? `<div class="warnings"><h3>${renderLabelWithHelp('Warnings', renderHelp('warningsMeaning'))}</h3><ul>${result.warnings.map((warning) => `<li>${escapeHtml(warning.message)}</li>`).join('')}</ul></div>`
    : '';
  const assumptions =
    result.explanation && 'assumptions' in result.explanation
      ? (result.explanation.assumptions as string[])
      : [];
  const steps =
    result.explanation && 'steps' in result.explanation
      ? (result.explanation.steps as Array<{ formula: string }>)
      : [];
  return `${hero ? `<p class="result-hero"><span>${renderResultLabel(calculator, hero[0])}</span><strong>${escapeHtml(hero[1])}</strong></p>` : ''}<div class="result-summary">${metrics.map(([label, value]) => `<p class="metric"><span>${renderResultLabel(calculator, label)}</span><strong>${escapeHtml(value)}</strong></p>`).join('')}</div>${warnings}${detailHtml}<section class="assumptions"><h3>${renderLabelWithHelp('Assumptions used', renderHelp('assumptionsMeaning'))}</h3><ul>${assumptions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section><section><h3>${renderLabelWithHelp('Why this answer?', renderHelp('practicalOptimization'))}</h3>${steps.length > 0 ? `<ol>${steps.map((step) => `<li>${escapeHtml(step.formula)}</li>`).join('')}</ol>` : '<p>The calculator applied the visible inputs and assumptions using its test-backed formula.</p>'}</section>`;
}

function renderResultLabel(calculator: CalculatorId, label: string): string {
  return renderLabelWithHelp(label, renderResultHelp(calculator, label));
}

function renderLabelWithHelp(label: string, helpHtml: string): string {
  if (!helpHtml) return escapeHtml(label);
  return `<span class="print-help-label">${escapeHtml(label)}</span><span class="help-label screen-help-label">${escapeHtml(label)}${helpHtml}</span>`;
}

function renderResultHelp(calculator: CalculatorId, label: string): string {
  if (calculator === 'backing' && label === 'Uses least fabric')
    return renderHelp('backingLeastFabric');
  if (calculator === 'pieces-from-fabric' && /fit|capacity/i.test(label))
    return renderHelp('fitMode');
  if (/starting|batch|produced|excess/i.test(label))
    return renderHelp(
      /batch|produced|excess/i.test(label) ? 'batchYield' : 'sizingMode',
    );
  if (/recommended purchase|planning yardage|buy/i.test(label))
    return renderHelp('purchaseSafety');
  // Every distinct result label needs a point-of-use explanation. Repeated
  // list items inherit the explanation from their shared heading, but hero and
  // metric labels arrive here exactly once and must never silently omit help.
  return renderHelp('resultMeaning');
}

function renderHelp(helpKey: HelpKey): string {
  const entry: ContextHelpEntry = CONTEXT_HELP[helpKey];
  return `&nbsp;<span class="context-help" data-context-help data-help-key="${helpKey}"><span class="context-help-mark" aria-hidden="true">?</span><button type="button" class="context-help-trigger no-print" aria-label="Help: ${escapeHtml(entry.title)}" aria-expanded="false" data-help-trigger></button><span class="context-help-popover" role="note" data-help-popover hidden><strong>${escapeHtml(entry.title)}</strong><span>${escapeHtml(entry.explanation)}</span>${entry.caveat ? `<span class="context-help-caveat">${escapeHtml(entry.caveat)}</span>` : ''}<a href="${entry.learnMoreHref}" data-help-learn-more>Learn more</a></span></span>`;
}

function updatePiecesMode(form: HTMLFormElement): void {
  if (form.dataset.calculator !== 'pieces-from-fabric') return;
  const mode = field(form, 'fitMode').value;
  const quantity = field(form, 'quantity') as HTMLInputElement;
  const container = quantity.closest<HTMLElement>('.field');
  const requested = mode === 'requested';
  quantity.disabled = !requested;
  if (container) container.hidden = !requested;
}

function showErrors(
  form: HTMLFormElement,
  root: HTMLElement,
  errors: ValidationError[],
): void {
  let firstInvalidField: HTMLElement | undefined;
  form.querySelectorAll('[aria-invalid="true"]').forEach((item) => {
    item.removeAttribute('aria-invalid');
    item.removeAttribute('aria-describedby');
  });
  form.querySelectorAll<HTMLElement>('[data-field-error]').forEach((item) => {
    item.textContent = '';
  });
  root.innerHTML = `<strong>Please fix the following:</strong><ul>${errors
    .map((error) => {
      const input = form.elements.namedItem(error.field);
      if (input instanceof HTMLElement) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', root.id);
        firstInvalidField ??= input;
        const fieldError = input
          .closest('.field, .check-field')
          ?.querySelector<HTMLElement>('[data-field-error]');
        if (fieldError) {
          fieldError.id = `${input.id}-error`;
          fieldError.textContent = error.message;
          input.setAttribute('aria-describedby', `${root.id} ${fieldError.id}`);
        }
      }
      return `<li>${escapeHtml(error.message)}</li>`;
    })
    .join('')}</ul>`;
  root.hidden = false;
  const scrollTarget = firstInvalidField ?? root;
  if (firstInvalidField) firstInvalidField.focus({ preventScroll: true });
  else {
    root.tabIndex = -1;
    root.focus({ preventScroll: true });
  }
  scrollTarget.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
    block: firstInvalidField ? 'center' : 'start',
  });
}

function updateAdvancedSummary(form: HTMLFormElement): void {
  const details = form.querySelector<HTMLDetailsElement>(
    '[data-calculator-advanced]',
  );
  const summary = details?.querySelector<HTMLElement>(
    '[data-advanced-summary]',
  );
  if (!details || !summary) return;
  summary.textContent = [
    ...details.querySelectorAll<HTMLElement>('.field, .check-field'),
  ]
    .slice(0, 4)
    .map((container) => {
      const label = container.querySelector('label')?.textContent?.trim() ?? '';
      const control = container.querySelector<
        HTMLInputElement | HTMLSelectElement
      >('input, select');
      if (!control) return label;
      const value =
        control instanceof HTMLInputElement && control.type === 'checkbox'
          ? control.checked
            ? 'yes'
            : 'no'
          : control.value;
      return `${label}: ${value}`;
    })
    .join(' · ');
}

function updateUnitLabels(root: ParentNode, unit: UnitSystem): void {
  root.querySelectorAll<HTMLElement>('[data-unit-label]').forEach((item) => {
    item.textContent = unit === 'imperial' ? 'in' : 'cm';
  });
  root.querySelectorAll<HTMLElement>('[data-purchase-unit]').forEach((item) => {
    item.textContent = unit === 'imperial' ? 'yd' : 'm';
  });
}

function addPieceToPlanner(piece: PieceGroup, unit: UnitSystem): boolean {
  const restored = restorePlannerProject(localStorage);
  const project =
    restored.status === 'restored' ||
    restored.status === 'migrated' ||
    restored.status === 'recovered'
      ? restored.project
      : starterProject(unit);
  const copy = { ...piece, id: `calculator-${Date.now().toString(36)}` };
  const fabric = project.fabrics[0];
  if (!fabric) return false;
  const { orientationConstraint, isWofStrip, ...requirement } = copy;
  project.cutRequirements.push({
    ...requirement,
    fabricId: fabric.id,
    orientation: orientationConstraint ?? 'none',
    isWofStrip: isWofStrip ?? false,
  });
  return savePlannerProject(localStorage, project).ok;
}

function starterProject(unit: UnitSystem): PlannerProject {
  const imperial = unit === 'imperial';
  return {
    id: `calculator-project-${Date.now().toString(36)}`,
    schemaVersion: PLANNER_PROJECT_SCHEMA_VERSION,
    unitSystem: unit,
    defaultSeamAllowance: toMillimetres(
      imperial ? 0.25 : 0.635,
      imperial ? 'inch' : 'centimetre',
    ),
    fabrics: [
      {
        id: 'fabric-a',
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
    cutRequirements: [],
  };
}

function escapeHtml(value: string): string {
  const span = document.createElement('span');
  span.textContent = value;
  return span.innerHTML;
}
