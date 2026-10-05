import type { CalculatorId } from '../analytics/analytics';

export interface ContextHelpEntry {
  title: string;
  explanation: string;
  caveat?: string;
  learnMoreHref: string;
}

export const CONTEXT_HELP = {
  usableWof: {
    title: 'Usable WOF',
    explanation:
      'The crosswise width available for cutting after the selvages you plan to remove.',
    caveat:
      'Packing uses usable width, not the wider nominal bolt description.',
    learnMoreHref: '/guides/project-planner-tutorial/#usable-wof',
  },
  nominalWidth: {
    title: 'Nominal fabric width',
    explanation:
      'The descriptive bolt width before selvages are removed. QuiltClarity shows it for context but does not pack cuts into it.',
    learnMoreHref: '/guides/project-planner-tutorial/#usable-wof',
  },
  cutVsFinished: {
    title: 'Cut size or finished size',
    explanation:
      'Cut size is the rectangle you cut. Finished size is the size after sewing; QuiltClarity adds seam allowance on every edge.',
    caveat:
      'Do not enter a pattern cut size as finished size, or seam allowance will be added twice.',
    learnMoreHref: '/guides/project-planner-tutorial/#cut-vs-finished',
  },
  seamAllowance: {
    title: 'Seam allowance',
    explanation:
      'The fabric taken into each seam. It changes only requirements entered as finished size.',
    learnMoreHref: '/guides/project-planner-tutorial/#cut-vs-finished',
  },
  directionalFabric: {
    title: 'Directional fabric',
    explanation:
      'A print or grain direction that must stay aligned. Directional planning prevents rotations that would turn the motif or required axis.',
    caveat:
      'Keep the visible directional setting accurate; the optimizer will not override it to save fabric.',
    learnMoreHref: '/guides/project-planner-tutorial/#directional-fabric',
  },
  rotation: {
    title: 'Piece rotation',
    explanation:
      'Allows width and height to swap when the fabric and piece constraints permit it.',
    caveat:
      'A piece-level restriction, direction constraint, or WOF strip rule still wins.',
    learnMoreHref: '/guides/project-planner-tutorial/#directional-fabric',
  },
  purchaseSafety: {
    title: 'Purchase safety allowance',
    explanation:
      'Adds a percentage to newly purchased bolt length before purchase rounding.',
    caveat:
      'It never enlarges fabric you already own, and it cannot create a purchase when stock fully covers the cuts.',
    learnMoreHref: '/guides/project-planner-tutorial/#purchase-safety',
  },
  purchaseIncrement: {
    title: 'Purchase increment',
    explanation:
      'The amount your shop sells fabric in. QuiltClarity always rounds the buffered purchase upward to this increment.',
    learnMoreHref: '/guides/project-planner-tutorial/#purchase-safety',
  },
  stockGeometry: {
    title: 'Fabric you already have',
    explanation:
      'Each entry is one physical rectangle for this project. Width runs across the fabric; length runs lengthwise.',
    caveat:
      'Separate remnants stay separate and are never treated as one joined area.',
    learnMoreHref: '/guides/project-planner-tutorial/#fabric-you-have',
  },
  stockPreset: {
    title: 'Editable stock preset',
    explanation:
      'A preset fills common starting dimensions for a physical fabric piece.',
    caveat:
      'Measure your actual fabric and edit the dimensions; your edited rectangle is authoritative.',
    learnMoreHref: '/guides/project-planner-tutorial/#fabric-you-have',
  },
  wofStrip: {
    title: 'Width-of-fabric strip',
    explanation:
      'A strip that must span the full usable crosswise width. Its strip width consumes length down the bolt.',
    caveat:
      'A narrow remnant cannot satisfy a WOF strip just because its other dimension is long enough.',
    learnMoreHref: '/guides/project-planner-tutorial/#wof-strips',
  },
  patternSays: {
    title: 'Pattern says',
    explanation:
      'The yardage stated by your pattern, kept as an external reference for comparison.',
    caveat: 'A difference does not automatically mean the pattern is wrong.',
    learnMoreHref: '/guides/project-planner-tutorial/#pattern-says',
  },
  patternWof: {
    title: 'Pattern usable WOF',
    explanation:
      'The usable fabric width assumed by the pattern, when it is known.',
    caveat:
      'If it differs from your current usable WOF, the yardage amounts are not directly like-for-like.',
    learnMoreHref: '/guides/project-planner-tutorial/#pattern-yardage',
  },
  freshFabricPlan: {
    title: 'Fresh-fabric plan',
    explanation:
      'What all entered cuts would require if this fabric were purchased new under the current assumptions.',
    caveat:
      'It deliberately ignores fabric you already own, so it is not the same as Buy now.',
    learnMoreHref: '/guides/project-planner-tutorial/#fresh-fabric-plan',
  },
  buyNow: {
    title: 'Buy now',
    explanation:
      'The additional purchase remaining after QuiltClarity allocates the fabric you entered as already owned.',
    caveat: 'It may differ from both Pattern says and the Fresh-fabric plan.',
    learnMoreHref: '/guides/project-planner-tutorial/#buy-now',
  },
  stockAllocation: {
    title: 'Existing-stock allocation',
    explanation:
      'The exact cuts placed into each physical stock piece, with each remnant kept identifiable.',
    learnMoreHref: '/guides/project-planner-tutorial/#stock-allocation',
  },
  practicalOptimization: {
    title: 'Practical optimized plan',
    explanation:
      'A deterministic, validated cutting layout selected for practical cutting and low fabric use.',
    caveat:
      'It is a bounded heuristic, not a mathematically proven global optimum.',
    learnMoreHref: '/guides/project-planner-tutorial/#cutting-plan',
  },
  leftoverSummary: {
    title: 'Useful leftover regions',
    explanation:
      'Practical rectangular regions left by the selected placement geometry.',
    caveat: 'Separate regions are not promised to form one contiguous piece.',
    learnMoreHref: '/guides/project-planner-tutorial/#leftovers',
  },
  backingOverage: {
    title: 'Backing overage',
    explanation:
      'Extra backing beyond every quilt-top edge for loading, quilting, and squaring.',
    caveat:
      'The 4-inch default is editable; confirm the requirement with your quilting setup or longarmer.',
    learnMoreHref: '/guides/how-much-extra-backing/',
  },
  backingLeastFabric: {
    title: 'Uses least fabric',
    explanation:
      'The valid displayed backing orientation with the lowest calculated yardage.',
    caveat:
      'Seam placement, print direction, or equipment may make another orientation preferable.',
    learnMoreHref: '/guides/how-much-extra-backing/',
  },
  panelJoin: {
    title: 'Panel join seam allowance',
    explanation:
      'Fabric consumed on both joined panel edges. It reduces the finished coverage of joined WOF panels.',
    learnMoreHref: '/guides/how-much-extra-backing/',
  },
  battingOverage: {
    title: 'Batting overage',
    explanation:
      'Extra batting beyond every quilt-top edge for quilting and trimming.',
    caveat:
      'The 4-inch default is a convenience; check your own setup or longarmer.',
    learnMoreHref: '/guides/how-much-extra-batting/',
  },
  battingRoll: {
    title: 'Batting roll width',
    explanation:
      'The fixed width of the roll or precut. QuiltClarity checks which required quilt dimension can fit across it.',
    caveat: 'This calculator does not plan pieced batting.',
    learnMoreHref: '/guides/how-much-extra-batting/',
  },
  bindingStrip: {
    title: 'Binding strip width',
    explanation:
      'The width of each straight, cross-grain double-fold binding strip before folding and attaching.',
    learnMoreHref: '/guides/quilt-seam-allowance/',
  },
  bindingAllowance: {
    title: 'Joining and finishing allowance',
    explanation:
      'Extra binding length for joining strip ends, turning corners, and completing the final join.',
    learnMoreHref: '/guides/quilt-seam-allowance/',
  },
  sizingMode: {
    title: 'Standard or Trim-friendly',
    explanation:
      'Standard uses the governed starting-cut formula. Trim-friendly adds material so the unit can be trimmed accurately after sewing.',
    caveat: 'Trim-friendly is the default convenience, not a universal rule.',
    learnMoreHref: '/guides/finished-vs-cut-size/',
  },
  batchYield: {
    title: 'Batch yield',
    explanation:
      'How many units one construction batch produces. QuiltClarity rounds batches upward so produced units cover the requested count.',
    learnMoreHref: '/guides/finished-vs-cut-size/',
  },
  borderScope: {
    title: 'Border planning scope',
    explanation:
      'Plans straight, non-mitered, cross-grain borders with side borders first and seam-loss-aware WOF joins.',
    caveat:
      'Measure the assembled top through its center before final border cuts.',
    learnMoreHref: '/guides/quilt-seam-allowance/',
  },
  sashingScope: {
    title: 'Sashing planning scope',
    explanation:
      'Plans row-wise internal sashing with no cornerstones and no outer sashing.',
    learnMoreHref: '/guides/quilt-seam-allowance/',
  },
  fitMode: {
    title: 'Stock-fit question',
    explanation:
      'How many fit finds practical capacity. Can I cut this many checks a requested quantity against the same finite-stock geometry.',
    learnMoreHref: '/guides/use-remnants-before-buying/',
  },
  measurementUnits: {
    title: 'Measurement units',
    explanation:
      'Controls whether this tool displays and accepts imperial or metric measurements. Internal calculations remain exact in millimetres.',
    learnMoreHref: '/guides/getting-started/',
  },
  projectName: {
    title: 'Project name',
    explanation:
      'An optional local label that helps you recognize this saved and printed plan. It does not affect any calculation.',
    learnMoreHref: '/guides/project-planner-tutorial/#project-and-units',
  },
  fabricName: {
    title: 'Fabric label',
    explanation:
      'The name used to keep this fabric, its stock, requirements, shopping amount, and cutting plan together.',
    learnMoreHref: '/guides/project-planner-tutorial/#fabrics',
  },
  freeformNotes: {
    title: 'Notes',
    explanation:
      'Optional local reminders for the project, fabric, or cut row. Notes do not change calculations or optimizer constraints.',
    learnMoreHref: '/guides/project-planner-tutorial/#special-cases',
  },
  pieceLabel: {
    title: 'Piece label',
    explanation:
      'A short name that identifies this required rectangle in cutting instructions, diagrams, and text alternatives.',
    learnMoreHref: '/guides/project-planner-tutorial/#piece-label',
  },
  pieceQuantity: {
    title: 'Required quantity',
    explanation:
      'The whole number of identical pieces or units required. Batch calculators may round production upward to cover it.',
    learnMoreHref: '/guides/project-planner-tutorial/#quantity',
  },
  pieceDimensions: {
    title: 'Piece dimensions',
    explanation:
      'The width and height of one repeated rectangle in the selected units. Cut-versus-finished settings determine whether seam allowance is added.',
    learnMoreHref: '/guides/project-planner-tutorial/#width-height',
  },
  quiltDimensions: {
    title: 'Quilt dimensions',
    explanation:
      'The current or target quilt width and length used by this focused calculator.',
    learnMoreHref: '/guides/how-to-calculate-quilt-fabric/',
  },
  finishedDimensions: {
    title: 'Finished dimensions',
    explanation:
      'The size after sewing. The calculator derives any required cut size using its visible construction assumptions.',
    learnMoreHref: '/guides/finished-vs-cut-size/',
  },
  gridCounts: {
    title: 'Rows and columns',
    explanation:
      'The whole-number layout counts used to determine how many blocks, sashing pieces, or related units are required.',
    learnMoreHref: '/guides/how-to-calculate-quilt-fabric/',
  },
  constructionMethod: {
    title: 'Construction method',
    explanation:
      'Selects the governed formula and batch yield for the sewing method you intend to use.',
    learnMoreHref: '/guides/finished-vs-cut-size/',
  },
  handlingBuffer: {
    title: 'Handling and cutting buffer',
    explanation:
      'Extra length added to joined strips so they can be handled and trimmed before final assembly.',
    learnMoreHref: '/guides/quilt-seam-allowance/',
  },
  borderLayers: {
    title: 'Border layers',
    explanation:
      'The number of equal-width straight border rounds applied around the quilt top.',
    learnMoreHref: '/guides/quilt-seam-allowance/',
  },
  resultMeaning: {
    title: 'Calculated result',
    explanation:
      'A value derived from the same validated inputs, assumptions, and calculation contract shown on this page.',
    learnMoreHref: '/guides/read-your-shopping-plan/',
  },
  shoppingPlan: {
    title: 'Shopping plan',
    explanation:
      'The per-fabric purchase summary after existing stock allocation, purchase safety, and upward shop-increment rounding.',
    learnMoreHref: '/guides/read-your-shopping-plan/',
  },
  warningsMeaning: {
    title: 'Warnings and guidance',
    explanation:
      'Non-blocking conditions or assumptions that may affect how you use an otherwise valid result.',
    learnMoreHref: '/guides/project-planner-tutorial/#warnings',
  },
  assumptionsMeaning: {
    title: 'Assumptions used',
    explanation:
      'The visible defaults and constraints applied to produce this result. Change them and recalculate when they do not match your project.',
    learnMoreHref: '/guides/project-planner-tutorial/#purchase-safety',
  },
  cuttingInstructions: {
    title: 'Cutting instructions',
    explanation:
      'The executable text and diagram projected from the selected optimizer placements. Repeated steps are explained by their section header.',
    learnMoreHref: '/guides/read-your-cutting-plan/',
  },
  diagramZoom: {
    title: 'Diagram zoom',
    explanation:
      'Changes only the on-screen viewing scale. It does not alter piece dimensions, placements, calculations, or print geometry.',
    learnMoreHref: '/guides/read-your-cutting-plan/',
  },
  actionAdd: {
    title: 'Add item',
    explanation:
      'Adds another editable project item using visible defaults. Review its values before calculating.',
    learnMoreHref: '/guides/project-planner-tutorial/',
  },
  actionImport: {
    title: 'Paste cut list',
    explanation:
      'Opens the deterministic tabular import flow. Nothing is added until preview issues are resolved and import is confirmed.',
    learnMoreHref: '/guides/enter-a-cut-list/',
  },
  actionUndo: {
    title: 'Undo deletion',
    explanation: 'Restores the most recently deleted cut row to this project.',
    learnMoreHref: '/guides/enter-a-cut-list/',
  },
  actionCalculate: {
    title: 'Calculate or recalculate',
    explanation:
      'Validates the current fields and produces a new result. Editing afterward keeps the prior result visible until you recalculate.',
    learnMoreHref: '/guides/project-planner-tutorial/#calculate',
  },
  actionPreview: {
    title: 'Preview import',
    explanation:
      'Parses the pasted table and shows field-level issues without changing the project.',
    learnMoreHref: '/guides/project-planner-tutorial/#paste-cut-list',
  },
  actionCancel: {
    title: 'Cancel this action',
    explanation: 'Closes the current optional action without applying it.',
    learnMoreHref: '/guides/project-planner-tutorial/',
  },
  actionConfirm: {
    title: 'Confirm import',
    explanation:
      'Adds only the validated preview rows to the project after required fabric mappings are resolved.',
    learnMoreHref: '/guides/project-planner-tutorial/#paste-cut-list',
  },
  actionPrint: {
    title: 'Print result',
    explanation:
      'Opens the browser print flow using the dedicated readable plan layout.',
    learnMoreHref: '/guides/print-your-project-plan/',
  },
  actionExportPdf: {
    title: 'Export PDF for print',
    explanation:
      'Downloads a print-ready PDF of the current plan. Open the file to print or save it.',
    learnMoreHref: '/guides/print-your-project-plan/',
  },
  actionCopy: {
    title: 'Copy summary',
    explanation:
      'Copies a concise text summary of the current result when browser clipboard access is available.',
    learnMoreHref: '/guides/read-your-shopping-plan/',
  },
  actionShare: {
    title: 'Share summary',
    explanation:
      'Opens the browser or device share sheet when available. Project data is not sent by QuiltClarity itself.',
    learnMoreHref: '/guides/read-your-shopping-plan/',
  },
  actionEdit: {
    title: 'Edit assumptions',
    explanation:
      'Returns focus to the editable inputs. Recalculate after changes to replace the current result.',
    learnMoreHref: '/guides/project-planner-tutorial/#calculate',
  },
  actionReset: {
    title: 'Reset defaults',
    explanation:
      'Restores the affected advanced fields to their documented defaults without changing unrelated items.',
    learnMoreHref: '/guides/project-planner-tutorial/#common-errors',
  },
  actionRemove: {
    title: 'Remove item',
    explanation:
      'Removes this editable item subject to project safeguards. Review dependent assignments before removing a fabric.',
    learnMoreHref: '/guides/project-planner-tutorial/#common-errors',
  },
  actionDuplicate: {
    title: 'Duplicate cut row',
    explanation: 'Creates a separate editable copy of this cut requirement.',
    learnMoreHref: '/guides/enter-a-cut-list/',
  },
  actionTransfer: {
    title: 'Add to planner',
    explanation:
      'Transfers the compatible calculated cut requirement into the locally saved project for joint planning.',
    learnMoreHref: '/guides/turn-pattern-cut-list-into-plan/',
  },
} as const satisfies Record<string, ContextHelpEntry>;

export type HelpKey = keyof typeof CONTEXT_HELP;

const COMMON_CALCULATOR_FIELD_HELP: Record<string, HelpKey> = {
  quantity: 'pieceQuantity',
  width: 'pieceDimensions',
  height: 'pieceDimensions',
  pieceWidth: 'pieceDimensions',
  pieceHeight: 'pieceDimensions',
  quiltWidth: 'quiltDimensions',
  quiltLength: 'quiltDimensions',
  targetWidth: 'quiltDimensions',
  targetLength: 'quiltDimensions',
  finishedSize: 'finishedDimensions',
  finishedWidth: 'finishedDimensions',
  finishedHeight: 'finishedDimensions',
  finishedBlockWidth: 'finishedDimensions',
  finishedBlockHeight: 'finishedDimensions',
  finishedSashingWidth: 'finishedDimensions',
  finishedBorderWidth: 'finishedDimensions',
  columns: 'gridCounts',
  rows: 'gridCounts',
  method: 'constructionMethod',
  sizingMode: 'sizingMode',
  dimensionMode: 'cutVsFinished',
  seamAllowance: 'seamAllowance',
  usableWidth: 'usableWof',
  usableBackingWidth: 'usableWof',
  safetyAllowancePercent: 'purchaseSafety',
  purchaseIncrement: 'purchaseIncrement',
  directional: 'directionalFabric',
  rotationAllowed: 'rotation',
  overagePerSide: 'backingOverage',
  rollWidth: 'battingRoll',
  stripWidth: 'bindingStrip',
  joiningAllowance: 'bindingAllowance',
  panelSeamAllowance: 'panelJoin',
  joinSeamAllowance: 'panelJoin',
  handlingBuffer: 'handlingBuffer',
  layers: 'borderLayers',
  fitMode: 'fitMode',
  stockWidth: 'stockGeometry',
  stockLength: 'stockGeometry',
};

const CALCULATOR_FIELD_HELP: Partial<
  Record<CalculatorId, Record<string, HelpKey>>
> = {
  'fabric-yardage': {
    dimensionMode: 'cutVsFinished',
    usableWidth: 'usableWof',
    seamAllowance: 'seamAllowance',
    safetyAllowancePercent: 'purchaseSafety',
    purchaseIncrement: 'purchaseIncrement',
    directional: 'directionalFabric',
    rotationAllowed: 'rotation',
  },
  backing: {
    overagePerSide: 'backingOverage',
    usableBackingWidth: 'usableWof',
    panelSeamAllowance: 'panelJoin',
    directional: 'directionalFabric',
    safetyAllowancePercent: 'purchaseSafety',
    purchaseIncrement: 'purchaseIncrement',
  },
  batting: {
    overagePerSide: 'battingOverage',
    rollWidth: 'battingRoll',
    rotationAllowed: 'rotation',
  },
  binding: {
    stripWidth: 'bindingStrip',
    usableWidth: 'usableWof',
    joiningAllowance: 'bindingAllowance',
    safetyAllowancePercent: 'purchaseSafety',
    purchaseIncrement: 'purchaseIncrement',
  },
  hst: {
    sizingMode: 'sizingMode',
    method: 'batchYield',
    seamAllowance: 'seamAllowance',
  },
  qst: { sizingMode: 'sizingMode' },
  'flying-geese': { sizingMode: 'sizingMode', method: 'batchYield' },
  borders: {
    finishedBorderWidth: 'borderScope',
    usableWidth: 'usableWof',
    joinSeamAllowance: 'panelJoin',
    safetyAllowancePercent: 'purchaseSafety',
    purchaseIncrement: 'purchaseIncrement',
  },
  sashing: {
    finishedSashingWidth: 'sashingScope',
    usableWidth: 'usableWof',
    joinSeamAllowance: 'panelJoin',
    safetyAllowancePercent: 'purchaseSafety',
    purchaseIncrement: 'purchaseIncrement',
  },
  'pieces-from-fabric': {
    fitMode: 'fitMode',
    stockWidth: 'stockGeometry',
    stockLength: 'stockGeometry',
    dimensionMode: 'cutVsFinished',
    rotationAllowed: 'rotation',
    directional: 'directionalFabric',
    seamAllowance: 'seamAllowance',
  },
};

export function getCalculatorFieldHelp(
  calculator: string,
  fieldName: string,
): HelpKey | undefined {
  return (
    CALCULATOR_FIELD_HELP[calculator as CalculatorId]?.[fieldName] ??
    COMMON_CALCULATOR_FIELD_HELP[fieldName]
  );
}

export function isHelpKey(value: string): value is HelpKey {
  return Object.hasOwn(CONTEXT_HELP, value);
}
