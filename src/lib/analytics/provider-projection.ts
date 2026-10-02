import {
  ANALYTICS_GUIDE_SLUGS,
  ANALYTICS_HELP_KEYS,
  CALCULATOR_IDS,
  type AnalyticsEvent,
} from './analytics';

type FieldRule = readonly string[] | 'boolean';
type EventRules = Record<string, FieldRule>;

const unit = ['imperial', 'metric'];
const pasteRows = ['0', '1-5', '6-15', '16-30', '31+'];
const errors = [
  'validation',
  'paste_empty',
  'paste_format',
  'paste_mapping',
  'calculation',
];
const plannerContext: EventRules = {
  unit_system: unit,
  fabric_bucket: ['1', '2-3', '4+'],
  requirement_bucket: ['1-5', '6-15', '16-30', '31+'],
  has_stock: 'boolean',
  stock_piece_bucket: ['0', '1', '2-3', '4+'],
  has_pattern_comparison: 'boolean',
  directional_used: 'boolean',
};

// Every value crossing from a DOM event into a provider is checked at runtime.
// New event fields require an explicit privacy review and a rule here.
const rules = {
  tool_viewed: {
    tool: ['planner', 'calculator'],
    toolId: ['fabric-cutting-planner', ...CALCULATOR_IDS],
    returning_user: 'boolean',
  },
  calculator_started: { calculator: CALCULATOR_IDS },
  calculator_completed: { calculator: CALCULATOR_IDS, unit_system: unit },
  calculator_error: {
    calculator: CALCULATOR_IDS,
    error_category: ['validation', 'calculation'],
  },
  calculator_result_printed: { calculator: CALCULATOR_IDS },
  calculator_to_project: { calculator: CALCULATOR_IDS },
  planner_started: {},
  fabric_added: {},
  fabric_removed: {},
  stock_piece_added: { stock_source: ['preset', 'partial_yardage', 'custom'] },
  stock_piece_removed: {},
  cut_requirement_added: {},
  cut_requirement_removed: {},
  cutlist_paste_opened: {},
  cutlist_paste_previewed: {
    paste_rows_bucket: pasteRows,
    paste_status: ['ready', 'needs_attention'],
  },
  cutlist_paste_completed: { paste_rows_bucket: pasteRows },
  cutlist_paste_failed: {
    paste_rows_bucket: pasteRows,
    error_category: errors,
  },
  pattern_yardage_added: { has_pattern_wof: 'boolean' },
  plan_calculation_started: plannerContext,
  plan_calculation_completed: {
    ...plannerContext,
    purchase_needed: 'boolean',
    completion_status: [
      'covered_by_stock',
      'additional_purchase_required',
      'requirements_uncovered',
    ],
  },
  plan_calculation_failed: { error_category: errors },
  on_hand_sufficient: {},
  purchase_shortfall_generated: {},
  stock_allocation_viewed: {},
  yardage_comparison_viewed: {},
  cutting_plan_viewed: {},
  optimization_completed: {
    comparison_outcome: [
      'combined_shorter',
      'same_length',
      'recommended_longer_for_practicality',
      'not_applicable',
    ],
    savings_band: [
      'none',
      'under_5_percent',
      '5_to_10_percent',
      '10_to_20_percent',
      'over_20_percent',
    ],
  },
  advanced_settings_opened: { tool: ['planner', 'calculator'] },
  print_result: {},
  copy_shopping_list: {},
  share_result: {},
  guide_started: {
    guide_slug: ANALYTICS_GUIDE_SLUGS,
    guide_category: ['start_here', 'workflow', 'reference'],
  },
  guide_next_clicked: { guide_slug: ANALYTICS_GUIDE_SLUGS },
  guide_to_tool_clicked: { guide_slug: ANALYTICS_GUIDE_SLUGS },
  context_help_opened: { help_key: ANALYTICS_HELP_KEYS },
  context_help_learn_more: { help_key: ANALYTICS_HELP_KEYS },
  quick_start_completed: { guide_slug: ['getting-started'] },
} satisfies Record<AnalyticsEvent['name'], EventRules>;

export function projectProviderEvent(value: unknown): AnalyticsEvent | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return null;
  try {
    const source = value as Record<string, unknown>;
    const name = source.name;
    if (typeof name !== 'string' || !Object.hasOwn(rules, name)) return null;
    const fields = rules[name as keyof typeof rules] as EventRules;
    const projected: Record<string, string | boolean> = { name };
    for (const [key, rule] of Object.entries(fields)) {
      const field = source[key];
      if (rule === 'boolean') {
        if (typeof field !== 'boolean') return null;
      } else if (typeof field !== 'string' || !rule.includes(field)) {
        return null;
      }
      projected[key] = field;
    }
    if (
      name === 'tool_viewed' &&
      ((projected.tool === 'planner' &&
        projected.toolId !== 'fabric-cutting-planner') ||
        (projected.tool === 'calculator' &&
          projected.toolId === 'fabric-cutting-planner'))
    )
      return null;
    return projected as unknown as AnalyticsEvent;
  } catch {
    return null;
  }
}
