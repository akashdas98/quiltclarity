export const CALCULATOR_IDS = [
  'fabric-yardage',
  'backing',
  'batting',
  'binding',
  'hst',
  'qst',
  'flying-geese',
  'block-count',
  'borders',
  'sashing',
  'pieces-from-fabric',
] as const;

export type CalculatorId = (typeof CALCULATOR_IDS)[number];

export type AnalyticsComparisonOutcome =
  | 'combined_shorter'
  | 'same_length'
  | 'recommended_longer_for_practicality'
  | 'not_applicable';

export type AnalyticsSavingsBand =
  | 'none'
  | 'under_5_percent'
  | '5_to_10_percent'
  | '10_to_20_percent'
  | 'over_20_percent';

export type AnalyticsUnitSystem = 'imperial' | 'metric';
export type AnalyticsFabricBucket = '1' | '2-3' | '4+';
export type AnalyticsRequirementBucket = '1-5' | '6-15' | '16-30' | '31+';
export type AnalyticsStockBucket = '0' | '1' | '2-3' | '4+';
export type AnalyticsPasteRowsBucket = '0' | '1-5' | '6-15' | '16-30' | '31+';
export type AnalyticsErrorCategory =
  | 'validation'
  | 'paste_empty'
  | 'paste_format'
  | 'paste_mapping'
  | 'calculation';
export type AnalyticsPlanStatus =
  | 'covered_by_stock'
  | 'additional_purchase_required'
  | 'requirements_uncovered';
export type AnalyticsStockSource = 'preset' | 'partial_yardage' | 'custom';
export type AnalyticsGuideCategory = 'start_here' | 'workflow' | 'reference';

export const ANALYTICS_GUIDE_SLUGS = [
  'getting-started',
  'project-planner-tutorial',
  'enter-a-cut-list',
  'add-fabric-you-have',
  'check-pattern-yardage',
  'read-your-shopping-plan',
  'read-your-cutting-plan',
  'print-your-project-plan',
  'turn-pattern-cut-list-into-plan',
  'do-i-have-enough-fabric',
  'use-remnants-before-buying',
  'width-of-fabric',
  'finished-vs-cut-size',
  'quilt-seam-allowance',
  'how-much-extra-backing',
  'how-much-extra-batting',
  'how-to-calculate-quilt-fabric',
  'directional-fabric-cutting',
  'fat-quarter-size',
] as const;

export type AnalyticsGuideSlug = (typeof ANALYTICS_GUIDE_SLUGS)[number];

export const ANALYTICS_HELP_KEYS = [
  'usableWof',
  'nominalWidth',
  'cutVsFinished',
  'seamAllowance',
  'directionalFabric',
  'rotation',
  'purchaseSafety',
  'purchaseIncrement',
  'stockGeometry',
  'stockPreset',
  'wofStrip',
  'patternSays',
  'patternWof',
  'freshFabricPlan',
  'buyNow',
  'stockAllocation',
  'practicalOptimization',
  'leftoverSummary',
  'backingOverage',
  'backingLeastFabric',
  'panelJoin',
  'battingOverage',
  'battingRoll',
  'bindingStrip',
  'bindingAllowance',
  'sizingMode',
  'batchYield',
  'borderScope',
  'sashingScope',
  'fitMode',
  'measurementUnits',
  'projectName',
  'fabricName',
  'freeformNotes',
  'pieceLabel',
  'pieceQuantity',
  'pieceDimensions',
  'quiltDimensions',
  'finishedDimensions',
  'gridCounts',
  'constructionMethod',
  'handlingBuffer',
  'borderLayers',
  'resultMeaning',
  'shoppingPlan',
  'warningsMeaning',
  'assumptionsMeaning',
  'cuttingInstructions',
  'diagramZoom',
  'actionAdd',
  'actionImport',
  'actionUndo',
  'actionCalculate',
  'actionPreview',
  'actionCancel',
  'actionConfirm',
  'actionPrint',
  'actionCopy',
  'actionShare',
  'actionEdit',
  'actionReset',
  'actionRemove',
  'actionDuplicate',
  'actionTransfer',
] as const;

export type AnalyticsHelpKey = (typeof ANALYTICS_HELP_KEYS)[number];

export interface AnalyticsPlannerContext {
  unit_system: AnalyticsUnitSystem;
  fabric_bucket: AnalyticsFabricBucket;
  requirement_bucket: AnalyticsRequirementBucket;
  has_stock: boolean;
  stock_piece_bucket: AnalyticsStockBucket;
  has_pattern_comparison: boolean;
  directional_used: boolean;
}

export type AnalyticsEvent =
  | {
      name: 'tool_viewed';
      tool: 'planner';
      toolId: 'fabric-cutting-planner';
      returning_user: boolean;
    }
  | {
      name: 'tool_viewed';
      tool: 'calculator';
      toolId: CalculatorId;
      returning_user: boolean;
    }
  | { name: 'calculator_started'; calculator: CalculatorId }
  | {
      name: 'calculator_completed';
      calculator: CalculatorId;
      unit_system: AnalyticsUnitSystem;
    }
  | {
      name: 'calculator_error';
      calculator: CalculatorId;
      error_category: 'validation' | 'calculation';
    }
  | { name: 'calculator_result_printed'; calculator: CalculatorId }
  | { name: 'calculator_to_project'; calculator: CalculatorId }
  | { name: 'planner_started' }
  | { name: 'fabric_added' }
  | { name: 'fabric_removed' }
  | { name: 'stock_piece_added'; stock_source: AnalyticsStockSource }
  | { name: 'stock_piece_removed' }
  | { name: 'cut_requirement_added' }
  | { name: 'cut_requirement_removed' }
  | { name: 'cutlist_paste_opened' }
  | {
      name: 'cutlist_paste_previewed';
      paste_rows_bucket: AnalyticsPasteRowsBucket;
      paste_status: 'ready' | 'needs_attention';
    }
  | {
      name: 'cutlist_paste_completed';
      paste_rows_bucket: AnalyticsPasteRowsBucket;
    }
  | {
      name: 'cutlist_paste_failed';
      paste_rows_bucket: AnalyticsPasteRowsBucket;
      error_category: AnalyticsErrorCategory;
    }
  | { name: 'pattern_yardage_added'; has_pattern_wof: boolean }
  | ({ name: 'plan_calculation_started' } & AnalyticsPlannerContext)
  | ({
      name: 'plan_calculation_completed';
      purchase_needed: boolean;
      completion_status: AnalyticsPlanStatus;
    } & AnalyticsPlannerContext)
  | {
      name: 'plan_calculation_failed';
      error_category: AnalyticsErrorCategory;
    }
  | { name: 'on_hand_sufficient' }
  | { name: 'purchase_shortfall_generated' }
  | { name: 'stock_allocation_viewed' }
  | { name: 'yardage_comparison_viewed' }
  | { name: 'cutting_plan_viewed' }
  | {
      name: 'optimization_completed';
      comparison_outcome: AnalyticsComparisonOutcome;
      savings_band: AnalyticsSavingsBand;
    }
  | {
      name: 'advanced_settings_opened';
      tool: 'planner' | 'calculator';
    }
  | { name: 'print_result' }
  | { name: 'copy_shopping_list' }
  | { name: 'share_result' }
  | {
      name: 'guide_started';
      guide_slug: AnalyticsGuideSlug;
      guide_category: AnalyticsGuideCategory;
    }
  | { name: 'guide_next_clicked'; guide_slug: AnalyticsGuideSlug }
  | { name: 'guide_to_tool_clicked'; guide_slug: AnalyticsGuideSlug }
  | { name: 'context_help_opened'; help_key: AnalyticsHelpKey }
  | { name: 'context_help_learn_more'; help_key: AnalyticsHelpKey }
  | { name: 'quick_start_completed'; guide_slug: 'getting-started' };

export interface AnalyticsSink {
  track(event: Readonly<AnalyticsEvent>): void;
}

export const ANALYTICS_DOM_EVENT = 'quiltclarity:analytics';
const PROVIDER_QUEUE_LIMIT = 32;
const providerQueue: AnalyticsEvent[] = [];
let providerTrack: ((event: unknown) => void) | undefined;

export function configureAnalyticsProvider(
  track: (event: unknown) => void,
): void {
  providerTrack = track;
  for (const event of providerQueue.splice(0)) {
    try {
      track(event);
    } catch {
      // A provider failure cannot affect product actions or later events.
    }
  }
}

export function clearAnalyticsProviderQueue(): void {
  providerQueue.length = 0;
}
export const ANALYTICS_FIRST_USED_DATE_KEY =
  'quiltclarity:analytics-first-used-date';
const LEGACY_ANALYTICS_FIRST_USED_DATE_KEY =
  'quilter:analytics-first-used-date';

type AnalyticsMarkerStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function isReturningToolUser(
  storage: AnalyticsMarkerStorage,
  today = new Date().toISOString().slice(0, 10),
): boolean {
  try {
    const firstUsedDate = storage.getItem(ANALYTICS_FIRST_USED_DATE_KEY);
    if (firstUsedDate === null) {
      const legacyDate = storage.getItem(LEGACY_ANALYTICS_FIRST_USED_DATE_KEY);
      if (legacyDate !== null && /^\d{4}-\d{2}-\d{2}$/.test(legacyDate)) {
        storage.setItem(ANALYTICS_FIRST_USED_DATE_KEY, legacyDate);
        return legacyDate !== today;
      }
      storage.setItem(ANALYTICS_FIRST_USED_DATE_KEY, today);
      return false;
    }
    return firstUsedDate !== today;
  } catch {
    return false;
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export const browserAnalyticsSink: AnalyticsSink = {
  track(event) {
    const safeEvent = Object.freeze({ ...event });
    try {
      window.dispatchEvent(
        new CustomEvent<Readonly<AnalyticsEvent>>(ANALYTICS_DOM_EVENT, {
          detail: safeEvent,
        }),
      );
    } catch {
      // An optional observer cannot suppress the provider or product action.
    }
    try {
      if (Array.isArray(window.dataLayer)) window.dataLayer.push(safeEvent);
    } catch {
      // An optional data layer cannot suppress the provider or product action.
    }
    if (import.meta.env.PUBLIC_CLOUDFLARE_ANALYTICS_ENABLED === 'true') {
      try {
        if (providerTrack) providerTrack(safeEvent);
        else if (providerQueue.length < PROVIDER_QUEUE_LIMIT)
          providerQueue.push(safeEvent);
      } catch {
        // Remote measurement failure must never interrupt product behavior.
      }
    }
  },
};

export function emitAnalytics(
  event: AnalyticsEvent,
  sink: AnalyticsSink = browserAnalyticsSink,
): void {
  try {
    sink.track(event);
  } catch {
    // Analytics is optional and must never interrupt a calculation or action.
  }
}

export function isCalculatorId(value: string): value is CalculatorId {
  return (CALCULATOR_IDS as readonly string[]).includes(value);
}

export function isAnalyticsGuideSlug(
  value: string,
): value is AnalyticsGuideSlug {
  return (ANALYTICS_GUIDE_SLUGS as readonly string[]).includes(value);
}
