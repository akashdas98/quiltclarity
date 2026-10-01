import { describe, expect, it } from 'vitest';
import contextHelpComponent from '../src/components/ContextHelp.astro?raw';
import controlWithHelpComponent from '../src/components/ControlWithHelp.astro?raw';
import guideComponent from '../src/components/GuidePage.astro?raw';
import helpRegistry from '../src/lib/help/registry.ts?raw';
import helpScript from '../src/scripts/contextual-help.ts?raw';
import plannerPage from '../src/pages/fabric-cutting-planner.astro?raw';
import plannerScript from '../src/scripts/planner.ts?raw';
import calculatorField from '../src/components/Field.astro?raw';
import calculatorPage from '../src/components/CalculatorPage.astro?raw';
import calculatorScript from '../src/scripts/calculators.ts?raw';
import plannerTutorial from '../src/pages/guides/project-planner-tutorial.astro?raw';
import { CONTEXT_HELP, getCalculatorFieldHelp } from '../src/lib/help/registry';
import { ANALYTICS_HELP_KEYS } from '../src/lib/analytics';

const calculatorPages = import.meta.glob<string>(
  '../src/pages/calculators/*.astro',
  { eager: true, query: '?raw', import: 'default' },
);

const requiredAnchors = [
  'usable-wof',
  'directional-fabric',
  'purchase-safety',
  'fabric-you-have',
  'cut-vs-finished',
  'paste-cut-list',
  'pattern-yardage',
  'buy-now',
  'fresh-fabric-plan',
  'pattern-says',
  'stock-allocation',
  'cutting-plan',
  'print-plan',
];

describe('V1.1 Guides and contextual help contracts', () => {
  it('keeps contextual copy and exact destinations in one controlled registry', () => {
    for (const key of [
      'usableWof',
      'cutVsFinished',
      'purchaseSafety',
      'patternSays',
      'freshFabricPlan',
      'buyNow',
      'practicalOptimization',
    ])
      expect(helpRegistry).toContain(`${key}:`);
    for (const anchor of requiredAnchors)
      expect(plannerTutorial).toContain(`id="${anchor}"`);
  });

  it('uses real accessible controls with keyboard and predictable close behavior', () => {
    expect(contextHelpComponent).toContain('type="button"');
    expect(contextHelpComponent).toContain(
      'aria-label={`Help: ${entry.title}`}',
    );
    expect(contextHelpComponent).toContain('aria-expanded="false"');
    expect(contextHelpComponent).toContain('data-help-learn-more');
    expect(helpScript).toContain("event.key !== 'Escape'");
    expect(helpScript).toContain('closeHelp(root, true)');
    expect(helpScript).toContain("window.addEventListener('resize'");
    expect(helpScript).toContain("window.addEventListener('scroll'");
    expect(helpScript).toContain('window.innerHeight - popover.offsetHeight');
  });

  it('uses action controls themselves as compact tooltip targets', () => {
    expect(controlWithHelpComponent).toContain('data-action-help');
    expect(controlWithHelpComponent).toContain('role="tooltip"');
    expect(controlWithHelpComponent).not.toContain('ContextHelp');
    expect(controlWithHelpComponent).not.toContain('Learn more');
    expect(helpScript).toContain("document.addEventListener('pointerover'");
    expect(helpScript).toContain("document.addEventListener('focusin'");
    expect(helpScript).toContain("target.setAttribute('aria-describedby'");
  });

  it('keeps labels in inline text flow with a separate accessible help target', () => {
    expect(calculatorField).toContain('class="help-label"');
    expect(plannerScript).toContain('class="help-label"');
    expect(contextHelpComponent).toContain('&nbsp;<span class="context-help"');
    expect(contextHelpComponent).toContain(
      'class="context-help-mark" aria-hidden="true">?</span>',
    );
    expect(contextHelpComponent).toContain('data-help-trigger></button>');
    expect(plannerScript).not.toContain('label-tail');
    expect(calculatorScript).not.toContain('label-tail');
    expect(helpScript).not.toContain('MutationObserver');
  });

  it('covers important planner fields and generated results without hiding critical caveats', () => {
    for (const key of [
      'usableWof',
      'stockPreset',
      'patternSays',
      'patternWof',
      'nominalWidth',
      'directionalFabric',
      'rotation',
      'purchaseSafety',
      'purchaseIncrement',
      'stockGeometry',
      'cutVsFinished',
      'wofStrip',
    ])
      expect(plannerPage).toContain(`helpKey="${key}"`);
    for (const key of [
      'buyNow',
      'freshFabricPlan',
      'stockAllocation',
      'leftoverSummary',
      'practicalOptimization',
    ])
      expect(plannerScript).toMatch(
        new RegExp(`renderContextHelpLabel\\([^\\n]+ '${key}'\\)`),
      );
    expect(plannerScript).toContain('shopping-mobile-help');
    expect(plannerScript).toContain(
      'With ${fabric.safetyAllowancePercent}% safety',
    );
    expect(plannerPage).toContain('A difference does not necessarily mean');
    expect(plannerPage).toContain('Preset dimensions are');
  });

  it('maps calculator fields through the shared registry and preserves learning continuity', () => {
    expect(calculatorField).toContain('getCalculatorFieldHelp');
    expect(helpRegistry).toContain("'fabric-yardage':");
    expect(helpRegistry).toContain("'pieces-from-fabric':");
    expect(guideComponent).toContain('Previous:');
    expect(guideComponent).toContain('Next:');
    expect(guideComponent).toContain('Back to Guides');
    expect(guideComponent).toContain('data-guide-action="tool"');
  });

  it('provides a controlled fallback for every calculator result label', () => {
    expect(calculatorScript).toContain("return renderHelp('resultMeaning');");
    expect(calculatorScript).toContain(
      "renderLabelWithHelp('Warnings', renderHelp('warningsMeaning'))",
    );
    expect(calculatorScript).toContain(
      "renderLabelWithHelp('Assumptions used', renderHelp('assumptionsMeaning'))",
    );
  });

  it('requires help for every calculator field and every planner/calculator action', () => {
    let calculatorCount = 0;
    for (const source of Object.values(calculatorPages)) {
      const calculator = source.match(
        /<CalculatorPage\s+calculator="([^"]+)"/,
      )?.[1];
      if (!calculator) continue;
      calculatorCount += 1;
      for (const [, fieldName] of source.matchAll(/name:\s*'([^']+)'/g))
        expect(
          getCalculatorFieldHelp(calculator!, fieldName!),
          calculator + '.' + fieldName + ' needs controlled help',
        ).toBeTruthy();
    }
    expect(calculatorCount).toBe(11);

    const plannerButtons = plannerPage.match(/<button\b/g)?.length ?? 0;
    const plannerActionHelp =
      plannerPage.match(/<ControlWithHelp\b/g)?.length ?? 0;
    expect(plannerActionHelp).toBe(plannerButtons);

    const calculatorButtons = calculatorPage.match(/<button\b/g)?.length ?? 0;
    const calculatorActionHelp =
      calculatorPage.match(/<ControlWithHelp\b/g)?.length ?? 0;
    expect(calculatorActionHelp).toBe(calculatorButtons + 1);
  });

  it('keeps the help registry and analytics allow-list exactly aligned', () => {
    expect([...ANALYTICS_HELP_KEYS].sort()).toEqual(
      Object.keys(CONTEXT_HELP).sort(),
    );
  });
});
