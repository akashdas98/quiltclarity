import { describe, expect, it, vi } from 'vitest';
import {
  ANALYTICS_DOM_EVENT,
  ANALYTICS_FIRST_USED_DATE_KEY,
  CALCULATOR_IDS,
  emitAnalytics,
  isReturningToolUser,
  type AnalyticsEvent,
  type AnalyticsPlannerContext,
} from '../src/lib/analytics';
import calculatorScript from '../src/scripts/calculators.ts?raw';
import plannerScript from '../src/scripts/planner.ts?raw';
import baseLayout from '../src/layouts/BaseLayout.astro?raw';
import helpScript from '../src/scripts/contextual-help.ts?raw';

const plannerContext: AnalyticsPlannerContext = {
  unit_system: 'imperial',
  fabric_bucket: '2-3',
  requirement_bucket: '6-15',
  has_stock: true,
  stock_piece_bucket: '2-3',
  has_pattern_comparison: true,
  directional_used: false,
};

const events: AnalyticsEvent[] = [
  {
    name: 'tool_viewed',
    tool: 'planner',
    toolId: 'fabric-cutting-planner',
    returning_user: false,
  },
  ...CALCULATOR_IDS.map((calculator): AnalyticsEvent => ({
    name: 'calculator_completed',
    calculator,
    unit_system: 'imperial',
  })),
  { name: 'calculator_started', calculator: 'batting' },
  {
    name: 'calculator_error',
    calculator: 'flying-geese',
    error_category: 'validation',
  },
  { name: 'calculator_result_printed', calculator: 'qst' },
  { name: 'calculator_to_project', calculator: 'pieces-from-fabric' },
  { name: 'planner_started' },
  { name: 'fabric_added' },
  { name: 'fabric_removed' },
  { name: 'stock_piece_added', stock_source: 'preset' },
  { name: 'stock_piece_removed' },
  { name: 'cut_requirement_added' },
  { name: 'cut_requirement_removed' },
  { name: 'cutlist_paste_opened' },
  {
    name: 'cutlist_paste_previewed',
    paste_rows_bucket: '6-15',
    paste_status: 'needs_attention',
  },
  { name: 'cutlist_paste_completed', paste_rows_bucket: '6-15' },
  {
    name: 'cutlist_paste_failed',
    paste_rows_bucket: '1-5',
    error_category: 'paste_mapping',
  },
  { name: 'pattern_yardage_added', has_pattern_wof: true },
  { name: 'plan_calculation_started', ...plannerContext },
  {
    name: 'plan_calculation_completed',
    ...plannerContext,
    purchase_needed: true,
    completion_status: 'additional_purchase_required',
  },
  { name: 'plan_calculation_failed', error_category: 'validation' },
  { name: 'on_hand_sufficient' },
  { name: 'purchase_shortfall_generated' },
  { name: 'stock_allocation_viewed' },
  { name: 'yardage_comparison_viewed' },
  { name: 'cutting_plan_viewed' },
  {
    name: 'optimization_completed',
    comparison_outcome: 'combined_shorter',
    savings_band: 'over_20_percent',
  },
  { name: 'advanced_settings_opened', tool: 'planner' },
  { name: 'print_result' },
  { name: 'copy_shopping_list' },
  { name: 'share_result' },
  {
    name: 'guide_started',
    guide_slug: 'getting-started',
    guide_category: 'start_here',
  },
  { name: 'guide_next_clicked', guide_slug: 'getting-started' },
  { name: 'guide_to_tool_clicked', guide_slug: 'getting-started' },
  { name: 'context_help_opened', help_key: 'usableWof' },
  { name: 'context_help_learn_more', help_key: 'usableWof' },
  { name: 'quick_start_completed', guide_slug: 'getting-started' },
];

describe('V1.1 M8 analytics and privacy contracts', () => {
  it('migrates the date-only first-use marker with current key precedence', () => {
    const values = new Map<string, string>([
      ['quilter:analytics-first-used-date', '2026-08-21'],
    ]);
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    expect(ANALYTICS_DOM_EVENT).toBe('quiltclarity:analytics');
    expect(isReturningToolUser(storage, '2026-08-22')).toBe(true);
    expect(values.get(ANALYTICS_FIRST_USED_DATE_KEY)).toBe('2026-08-21');
    expect(isReturningToolUser(storage, '2026-08-21')).toBe(false);

    values.set(ANALYTICS_FIRST_USED_DATE_KEY, '2026-08-20');
    expect(isReturningToolUser(storage, '2026-08-21')).toBe(true);
    expect(values.get(ANALYTICS_FIRST_USED_DATE_KEY)).toBe('2026-08-20');
  });

  it('contains marker migration storage failures and does not copy invalid legacy values', () => {
    const values = new Map<string, string>([
      ['quilter:analytics-first-used-date', 'user-entered-content'],
    ]);
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    expect(isReturningToolUser(storage, '2026-08-22')).toBe(false);
    expect(values.get(ANALYTICS_FIRST_USED_DATE_KEY)).toBe('2026-08-22');

    values.delete(ANALYTICS_FIRST_USED_DATE_KEY);
    values.set('quilter:analytics-first-used-date', '2026-08-21');
    expect(
      isReturningToolUser(
        {
          getItem: storage.getItem,
          setItem: () => {
            throw new Error('write blocked');
          },
        },
        '2026-08-22',
      ),
    ).toBe(false);
    expect(values.get(ANALYTICS_FIRST_USED_DATE_KEY)).toBeUndefined();
  });

  it('keeps every event payload on the closed privacy-safe schema', () => {
    const allowedKeys = new Set([
      'name',
      'tool',
      'toolId',
      'returning_user',
      'calculator',
      'unit_system',
      'fabric_bucket',
      'requirement_bucket',
      'has_stock',
      'stock_piece_bucket',
      'has_pattern_comparison',
      'directional_used',
      'stock_source',
      'paste_rows_bucket',
      'paste_status',
      'has_pattern_wof',
      'purchase_needed',
      'completion_status',
      'error_category',
      'comparison_outcome',
      'savings_band',
      'guide_slug',
      'guide_category',
      'help_key',
    ]);
    const prohibitedKeys = [
      'projectName',
      'fabricName',
      'pieceLabel',
      'notes',
      'measurement',
      'quantity',
      'count',
      'width',
      'length',
      'patternAmount',
      'stockLabel',
      'pastedRows',
      'metadata',
      'userId',
    ];

    for (const event of events) {
      expect(Object.keys(event).every((key) => allowedKeys.has(key))).toBe(
        true,
      );
      for (const key of prohibitedKeys) expect(event).not.toHaveProperty(key);
    }
    expect(JSON.stringify(events)).not.toContain('Secret project');
  });

  it('contains sink failures instead of leaking them into product behavior', () => {
    const track = vi.fn(() => {
      throw new Error('provider unavailable');
    });
    expect(() =>
      emitAnalytics(
        { name: 'plan_calculation_started', ...plannerContext },
        { track },
      ),
    ).not.toThrow();
    expect(track).toHaveBeenCalledOnce();
  });

  it('derives repeat use from a date-only local marker and contains storage failures', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    expect(isReturningToolUser(storage, '2026-08-21')).toBe(false);
    expect([...values.values()]).toEqual(['2026-08-21']);
    expect(isReturningToolUser(storage, '2026-08-21')).toBe(false);
    expect(isReturningToolUser(storage, '2026-08-22')).toBe(true);
    expect(
      isReturningToolUser(
        {
          getItem: () => {
            throw new Error('storage unavailable');
          },
          setItem: () => undefined,
        },
        '2026-08-22',
      ),
    ).toBe(false);
  });

  it('wires the complete planner taxonomy into owned transitions', () => {
    for (const name of [
      'planner_started',
      'fabric_added',
      'fabric_removed',
      'stock_piece_added',
      'stock_piece_removed',
      'cut_requirement_added',
      'cut_requirement_removed',
      'cutlist_paste_opened',
      'cutlist_paste_previewed',
      'cutlist_paste_completed',
      'cutlist_paste_failed',
      'pattern_yardage_added',
      'plan_calculation_started',
      'plan_calculation_completed',
      'plan_calculation_failed',
      'on_hand_sufficient',
      'purchase_shortfall_generated',
      'stock_allocation_viewed',
      'yardage_comparison_viewed',
      'cutting_plan_viewed',
      'print_result',
      'copy_shopping_list',
    ])
      expect(plannerScript).toContain(`name: '${name}'`);
  });

  it('wires calculator completion, error, print, and project bridges', () => {
    for (const name of [
      'calculator_started',
      'calculator_completed',
      'calculator_error',
      'calculator_result_printed',
      'calculator_to_project',
    ])
      expect(calculatorScript).toContain(`name: '${name}'`);
    expect(calculatorScript).not.toContain("name: 'add_to_planner'");
  });

  it('wires Guides and contextual help through controlled keys only', () => {
    for (const name of [
      'guide_started',
      'guide_next_clicked',
      'guide_to_tool_clicked',
      'context_help_opened',
      'context_help_learn_more',
      'quick_start_completed',
    ])
      expect(helpScript).toContain(`name: '${name}'`);
    expect(helpScript).toContain('isHelpKey(helpKey)');
    expect(helpScript).toContain('isAnalyticsGuideSlug(slug)');
  });

  it('keeps Search Console verification optional and build-time configured', () => {
    expect(baseLayout).toContain('PUBLIC_GOOGLE_SITE_VERIFICATION');
    expect(baseLayout).toContain('google-site-verification');
    expect(baseLayout).toContain("'index, follow'");
    expect(baseLayout).toContain('PUBLIC_ROBOTS_NOINDEX');
  });
});
