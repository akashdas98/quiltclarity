import { describe, expect, it } from 'vitest';
import packageSource from '../package.json?raw';
import calculatorComponent from '../src/components/CalculatorPage.astro?raw';
import baseLayout from '../src/layouts/BaseLayout.astro?raw';
import backingPage from '../src/pages/calculators/quilt-backing.astro?raw';
import bindingPage from '../src/pages/calculators/quilt-binding.astro?raw';
import blockCountPage from '../src/pages/calculators/quilt-block-count.astro?raw';
import bordersPage from '../src/pages/calculators/borders.astro?raw';
import fabricYardagePage from '../src/pages/calculators/fabric-yardage.astro?raw';
import hstPage from '../src/pages/calculators/half-square-triangle.astro?raw';
import sashingPage from '../src/pages/calculators/sashing.astro?raw';
import battingPage from '../src/pages/calculators/quilt-batting.astro?raw';
import qstPage from '../src/pages/calculators/quarter-square-triangle.astro?raw';
import geesePage from '../src/pages/calculators/flying-geese.astro?raw';
import piecesPage from '../src/pages/calculators/pieces-from-fabric.astro?raw';
import plannerPage from '../src/pages/fabric-cutting-planner.astro?raw';
import plannerScript from '../src/scripts/planner.ts?raw';
import calculatorScript from '../src/scripts/calculators.ts?raw';
import homePage from '../src/pages/index.astro?raw';

describe('Milestone 7 static UI contracts', () => {
  it('keeps the site static-first without a React dependency', () => {
    const packageJson = JSON.parse(packageSource) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    expect(packageJson.dependencies?.react).toBeUndefined();
    expect(packageJson.devDependencies?.react).toBeUndefined();
    expect(baseLayout).toContain('Skip to content');
  });

  it('provides an accessible, locally persisted site theme without hiding static content', () => {
    expect(baseLayout).toContain('id="theme-toggle"');
    expect(baseLayout).toContain('role="switch"');
    expect(baseLayout).toContain('aria-label="Dark mode"');
    expect(baseLayout).toContain('class="theme-toggle-thumb"');
    expect(baseLayout).not.toContain('<span>Dark mode</span>');
    expect(baseLayout).not.toContain('theme-toggle-track');
    expect(baseLayout).toContain("const storageKey = 'quiltclarity:theme'");
    expect(baseLayout).toContain('localStorage.setItem(storageKey, theme)');
    expect(baseLayout).toContain("matchMedia('(prefers-color-scheme: dark)')");
    expect(baseLayout).toContain('root.dataset.theme = theme');
  });

  it('provides a semantic planner form, accessible results, and local actions', () => {
    expect(plannerPage).toContain('<form id="planner-form"');
    expect(plannerPage).toContain('role="alert"');
    expect(plannerPage).toContain('aria-live="polite"');
    expect(plannerPage).toContain('<span>Print</span>');
    expect(plannerPage).toContain('for print');
    expect(plannerPage).toContain('Copy summary');
    expect(plannerPage).toContain('Share summary');
    expect(plannerScript).toContain('Text version of this allocation');
  });

  it('renders all eleven calculator routes with static guidance', () => {
    const pages = [
      fabricYardagePage,
      backingPage,
      bindingPage,
      hstPage,
      blockCountPage,
      bordersPage,
      sashingPage,
      battingPage,
      qstPage,
      geesePage,
      piecesPage,
    ];
    for (const page of pages) {
      expect(page).toContain('<CalculatorPage');
      expect(page).toContain('<p>');
    }
    expect(calculatorComponent).toContain('<form class="calculator-form"');
    expect(calculatorComponent).toContain('calculator-measurements-field');
    expect(calculatorComponent).toContain('calculator-advanced-grid');
    expect(calculatorComponent).toContain('Advanced assumptions');
    expect(calculatorComponent).toContain('How this calculator works');
    expect(calculatorComponent).toContain('Add to planner');
  });

  it('wires result controls for print-only content separation', () => {
    expect(baseLayout).toContain("import '../styles/global.css'");
    expect(plannerPage).toContain('result-actions no-print');
    expect(plannerPage).toContain('id="export-pdf-result"');
    expect(plannerScript).toContain('window.print()');
    expect(plannerScript).toContain('shouldExportPlannerPdf');
    expect(plannerScript).toContain('createPlannerPrintPdf');
    expect(plannerScript).toContain(
      "diagram.width >= diagram.height ? 'landscape' : 'portrait'",
    );
    expect(plannerScript).toContain('data-print-orientation');
    expect(plannerScript).toContain('class="diagram-print-page print-');
    expect(plannerScript).toContain('class="material-plan-details"');
    expect(plannerScript).toContain('class="material-plan-heading"');
    expect(plannerScript).toContain('class="material-plan-intro"');
    expect(plannerScript).toContain('class="fabric-result-intro"');
    expect(plannerScript).toContain('function fitPrintDiagrams()');
    expect(plannerScript).toContain("window.addEventListener('beforeprint'");
    expect(plannerScript).toContain("window.matchMedia('print')");
    expect(plannerScript).toContain("'--print-diagram-width'");
    expect(plannerScript).toContain("'--print-diagram-max-height'");
    expect(plannerScript).toContain("'--print-page-width'");
    expect(plannerScript).toContain('class="diagram-print-content"');
    expect(plannerScript).toContain('const PRINT_GRAPHIC_INSET = 5');
    expect(plannerScript).toContain(
      'const PRINT_PAGE_MARGIN_CENTIMETRES = 1.2',
    );
    expect(plannerScript).toContain(
      'const availableHeight = Math.max(0, printableHeight - diagramTop)',
    );
    expect(plannerScript).toContain(
      'const PRINT_PAINT_INSET_QUANTUM_POINTS = 8',
    );
    expect(plannerScript).toContain('diagram.getBBox()');
    expect(plannerScript).toContain("window.addEventListener('afterprint'");
    expect(plannerScript).toContain('data-diagram-zoom-slider');
    expect(plannerScript).toContain("wrapper.addEventListener('touchmove'");
    expect(plannerScript).toContain('event.preventDefault()');
    expect(plannerScript).toContain('const MINIMUM_DIAGRAM_ZOOM_LEVEL = 0');
    expect(plannerScript).toContain('const MAXIMUM_DIAGRAM_ZOOM_LEVEL = 10');
    expect(plannerScript).toContain(
      'const SMALL_SCREEN_DEFAULT_DIAGRAM_ZOOM_LEVEL = 10 * Math.log10(2)',
    );
    expect(plannerScript).toContain('Pinch to zoom on touch devices.');
    expect(plannerScript).toContain("? 'Fit'");
  });

  it('describes heuristic results without claiming a proven minimum', () => {
    const userFacingPlanner = `${plannerPage}\n${plannerScript}\n${calculatorScript}`;
    for (const forbidden of [
      'Calculated minimum',
      'layout minimum',
      'minimum possible',
      'exact minimum',
      'optimal minimum',
      'guaranteed least',
    ]) {
      expect(userFacingPlanner.toLowerCase()).not.toContain(
        forbidden.toLowerCase(),
      );
    }
    expect(plannerScript).toContain('raw bolt-length plan');
    expect(plannerScript).toContain(
      'This is a practical optimized plan, not a mathematically proven global optimum.',
    );
  });

  it('exposes joint-planning value only from truthful comparison states', () => {
    expect(homePage).toContain(
      'reconciles all pieces for each fabric together',
    );
    expect(plannerPage).toContain('one reconciled shopping and');
    expect(plannerPage).toContain(
      'You do not need to create a digital quilt design first.',
    );
    expect(plannerScript).toContain(
      "comparison.comparisonOutcome === 'combined_shorter'",
    );
    expect(plannerScript).toContain('comparison.lengthDifference <= 0');
    expect(plannerScript).toContain(
      'Combined planning uses <strong>${formatDimension(comparison.lengthDifference)}</strong> less fabric length',
    );
    expect(plannerScript).toContain(
      "comparison.comparisonOutcome === 'not_applicable'",
    );
    expect(plannerScript).toContain(
      'This is a practical optimized plan, not a mathematically proven global optimum.',
    );
  });

  it('formats waste area in the selected display system instead of canonical millimetres', () => {
    expect(plannerScript).toContain(
      'formatWasteAreaValue(wasteArea, displayedUnit)',
    );
    expect(plannerScript).not.toContain('optimization.wasteArea.toFixed(1)');
  });

  it('renders scannable emphasized efficiency and diagram-text details', () => {
    expect(plannerScript).toContain('class="efficiency-summary"');
    expect(plannerScript).toContain('class="efficiency-facts"');
    expect(plannerScript).toContain(
      'Recommended plan: <strong>${recommended}</strong>',
    );
    expect(plannerScript).toContain(
      '<strong>${Math.round(comparison.differencePercent)}%</strong>',
    );
    expect(plannerScript).toContain('renderDiagramTextAlternative(diagram)');
    expect(plannerScript).toContain('class="text-plan-facts"');
    expect(plannerScript).toContain('class="text-plan-piece-groups"');
    expect(plannerScript).toContain('class="text-plan-strips"');
    expect(plannerScript).not.toContain(
      'escapeHtml(diagram.textAlternative.text)',
    );
  });

  it('exposes the remediated calculator terminology and assumptions', () => {
    expect(hstPage).toContain("{ value: 'standard', label: 'Standard' }");
    expect(hstPage).not.toContain('Exact formula');
    expect(backingPage).toContain('Backing overage per side');
    expect(backingPage).toContain('longarm-oriented default');
    expect(backingPage).toContain(
      'confirm with your quilter before purchasing',
    );
    expect(bordersPage).toContain('Planning/current quilt-top width');
    expect(bordersPage).toContain(
      'measure the assembled quilt top through the center',
    );
    expect(sashingPage).toContain(
      'Row-wise sashing · No cornerstones · No outer sashing',
    );
  });

  it('implements the production first-use and result hierarchy contracts', () => {
    expect(homePage).toContain(
      'Plan the Fabric for the Quilt You’re Already Making',
    );
    expect(homePage).toContain('Plan My Project Fabric');
    expect(homePage).toContain(
      'Free · No account · Editable quilting assumptions',
    );
    expect(plannerPage).toContain('Start with one fabric');
    expect(plannerPage).toContain('Fabric cutting planner');
    expect(plannerPage).toContain('Set your project assumptions');
    expect(plannerPage).toContain('Describe your project fabrics');
    expect(plannerPage).toContain(
      'class="cut-list-heading planner-section-heading"',
    );
    expect(plannerPage).toContain('id="project-settings-heading"');
    expect(plannerPage).toContain('id="fabrics-heading"');
    expect(plannerPage).toContain('data-fabric-summary');
    expect(plannerPage).toContain('data-cut-size-preview');
    expect(plannerPage).toContain('Reset fabric defaults');
    expect(plannerPage).not.toContain('(saved only on this device)');
    expect(plannerPage).toContain('Worked example');
    expect(plannerScript).toContain('Fabric shopping list');
    expect(plannerScript).toContain('function projectStatusText(');
    expect(plannerScript).toContain(
      '${projectStatusText(result)}\\n${result.shoppingList.map',
    );
    expect(plannerScript).toContain('data-label="Raw additional plan"');
    expect(plannerScript).toContain('class="shopping-summary-note"');
    expect(plannerScript).toContain('Cutting instructions');
    expect(calculatorComponent).toContain('Reset advanced defaults');
    expect(calculatorScript).toContain('Why this answer?');
  });

  it('wires the four V1.1 calculator controllers without duplicating domain formulas', () => {
    expect(calculatorScript).toContain("kind === 'batting'");
    expect(calculatorScript).toContain("kind === 'qst'");
    expect(calculatorScript).toContain("kind === 'flying-geese'");
    expect(calculatorScript).toContain("kind === 'pieces-from-fabric'");
    expect(calculatorScript).toContain('calculateBatting({');
    expect(calculatorScript).toContain('calculateQst({');
    expect(calculatorScript).toContain('calculateFlyingGeese({');
    expect(calculatorScript).toContain('calculatePiecesFromFabric({');
    expect(calculatorScript).toContain('createPiecesFromFabricCuttingPlan(');
    expect(piecesPage).toContain('How many fit?');
    expect(piecesPage).toContain('Can I cut this many?');
  });

  it('implements the V1.1 project-level cut-list compiler and safe paste flow', () => {
    expect(plannerPage).toContain('Build your cut list');
    expect(plannerPage).toContain('Paste from spreadsheet');
    expect(plannerPage).toContain(
      'Paste CSV or tab-separated spreadsheet values.',
    );
    expect(plannerPage).toContain('wrap="off"');
    expect(plannerPage).toContain('id="paste-source-hint"');
    expect(plannerPage).toContain(
      'Fabric | Label | Qty | Width | Height | Size mode',
    );
    expect(plannerPage).toContain('<table class="cut-list-table">');
    expect(plannerPage).toMatch(
      /<th scope="col"[\s\S]*?>Cut\/Finished<ContextHelp helpKey="cutVsFinished"/,
    );
    expect(plannerPage).toContain('data-label="Fabric"');
    expect(plannerPage).toContain('class="cut-field-label"');
    expect(plannerPage).toMatch(
      /<thead>[\s\S]*?>Fabric<ContextHelp helpKey="fabricName"/,
    );
    expect(plannerPage).toMatch(
      /data-label-for="fabricId"[\s\S]*?>Fabric<\/label/,
    );
    expect(plannerPage).toContain('class="cut-row-errors"');
    expect(plannerPage).toContain('data-cut-row-errors');
    expect(plannerPage).toContain('class="cut-row-options"');
    expect(plannerPage).toContain('colspan="6"');
    expect(plannerPage).toContain('<summary>More options</summary>');
    expect(plannerPage).toContain('data-duplicate-cut');
    expect(plannerPage).not.toContain('class="cut-row-actions"');
    expect(plannerPage).toContain('id="undo-cut-row"');
    expect(plannerPage).toContain('id="cut-list-empty"');
    expect(plannerPage).toContain('No cut rows yet.');
    expect(plannerScript).not.toContain(
      "saveStatus.textContent = 'A project needs at least one cut row.'",
    );
    expect(plannerPage).not.toContain('data-pieces');
    expect(plannerPage).not.toContain('class="piece-group"');
    expect(plannerScript).toContain('previewCutListPaste(');
    expect(plannerScript).toContain('compileCutListPaste(');
    expect(plannerScript).toContain(
      "fieldError.classList.add('cut-field-error')",
    );
    expect(plannerScript).toContain(
      'rowError.append(fieldLabel, error.message)',
    );
    expect(plannerScript).toContain('project.cutRequirements');
    expect(plannerScript).not.toContain('interface PlannerDraft');
    expect(plannerScript).not.toContain('draftToProject');
  });

  it('implements V1.1 stock, pattern, and reconciled execution results', () => {
    expect(plannerPage).toContain('Fabric you already have');
    expect(plannerPage).toContain('data-add-stock="fat-quarter"');
    expect(plannerPage).toContain('data-add-stock="fat-eighth"');
    expect(plannerPage).toContain('data-add-stock="quarter-yard"');
    expect(plannerPage).toContain('data-add-stock="half-yard"');
    expect(plannerPage).toContain('data-add-stock="partial-yardage"');
    expect(plannerPage).toContain('data-add-stock="custom"');
    expect(plannerPage).toContain('Compare with pattern yardage (optional)');
    expect(plannerPage).toContain('data-field="patternStatedAmount"');
    expect(plannerPage).toContain('data-field="patternAssumedUsableWidth"');
    expect(plannerScript).toContain('reconcileProject(project)');
    expect(plannerScript).toContain('createReconciledCuttingPlans(result)');
    expect(plannerScript).toContain('Existing-stock allocations');
    expect(plannerScript).toContain('No additional purchase');
    expect(plannerScript).toContain('Useful remaining regions');
    expect(plannerScript).toContain('Plan needs recalculation.');
    expect(plannerScript).toContain(
      'firstInvalidField.focus({ preventScroll: true })',
    );
    expect(plannerScript).toContain(
      "block: firstInvalidField ? 'center' : 'start'",
    );
    expect(plannerScript).not.toContain('planProject(project)');
  });
});
