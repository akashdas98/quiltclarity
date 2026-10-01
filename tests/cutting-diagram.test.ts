import { describe, expect, it } from 'vitest';

import {
  normalizePieceGroups,
  optimizeFabric,
  toMillimetres,
  type FabricOptimizationSuccess,
  type FabricSpec,
  type PieceGroup,
} from '../src/lib/domain';
import {
  createCuttingDiagram,
  createCuttingInstructions,
  renderCuttingDiagramSvg,
} from '../src/lib/presentation';

function makeFabric(overrides: Partial<FabricSpec> = {}): FabricSpec {
  return {
    id: 'fabric-a',
    name: 'Fabric A',
    fabricWidth: toMillimetres(42, 'inch'),
    usableWidth: toMillimetres(40, 'inch'),
    directional: false,
    defaultRotationAllowed: true,
    safetyAllowancePercent: 0,
    purchaseIncrement: toMillimetres(1 / 8, 'yard'),
    ...overrides,
  };
}

function makePiece(overrides: Partial<PieceGroup>): PieceGroup {
  return {
    id: 'piece-a',
    label: 'Piece A',
    quantity: 1,
    width: toMillimetres(10, 'inch'),
    height: toMillimetres(10, 'inch'),
    dimensionMode: 'cut',
    rotationAllowed: false,
    ...overrides,
  };
}

function optimize(
  fabric: FabricSpec,
  pieces: readonly PieceGroup[],
): FabricOptimizationSuccess {
  const result = optimizeFabric(
    fabric,
    normalizePieceGroups(fabric, pieces, 0),
  );
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(`Expected success: ${JSON.stringify(result.errors)}`);
  }
  return result;
}

function makeMixedResult(fabric = makeFabric()): FabricOptimizationSuccess {
  return optimize(fabric, [
    makePiece({
      id: 'a',
      label: 'Large A',
      quantity: 2,
      width: toMillimetres(20, 'inch'),
    }),
    makePiece({ id: 'b', label: 'Small B', quantity: 4 }),
  ]);
}

describe('cutting diagram projection', () => {
  it('projects actionable strip instructions from the selected optimizer rows', () => {
    const fabric = makeFabric();
    const result = makeMixedResult(fabric);
    const instructions = createCuttingInstructions(result, 'imperial');

    expect(instructions).toHaveLength(result.rows.length);
    expect(instructions[0]?.text).toContain('× WOF strip');
    expect(instructions.map((item) => item.text).join(' ')).toContain(
      'Large A',
    );
    expect(instructions.map((item) => item.text).join(' ')).toContain(
      'Small B',
    );
    expect(instructions.every((item) => !item.text.includes('x='))).toBe(true);
  });

  it('projects optimizer placements with one uniform scale and no geometry changes', () => {
    const fabric = makeFabric();
    const result = makeMixedResult(fabric);
    const diagram = createCuttingDiagram(fabric, result, {
      width: 1_000,
      padding: 50,
    });

    expect(diagram.pieces).toHaveLength(result.placements.length);
    expect(diagram.sourceUsableWidth).toBe(fabric.usableWidth);
    expect(diagram.sourceUsedLength).toBe(result.usedLength);
    expect(diagram.scale).toBe(900 / fabric.usableWidth);

    result.placements.forEach((placement, index) => {
      const projected = diagram.pieces[index]!;
      expect(projected).toMatchObject({
        sourceX: placement.x,
        sourceY: placement.y,
        sourceWidth: placement.width,
        sourceHeight: placement.height,
        pieceGroupId: placement.pieceGroupId,
        instanceIndex: placement.instanceIndex,
        rotated: placement.rotated,
      });
      expect(projected.x).toBe(50 + placement.x * diagram.scale);
      expect(projected.y).toBe(50 + placement.y * diagram.scale);
      expect(projected.width).toBe(placement.width * diagram.scale);
      expect(projected.height).toBe(placement.height * diagram.scale);
    });

    expect(diagram.stripBoundaries.map((boundary) => boundary.sourceY)).toEqual(
      result.rows.slice(1).map((row) => row.y),
    );
  });

  it('projects all optimizer waste, including gaps above shorter pieces', () => {
    const fabric = makeFabric();
    const result = optimize(fabric, [
      makePiece({
        id: 'large',
        label: 'Large',
        width: toMillimetres(30, 'inch'),
      }),
      makePiece({
        id: 'short',
        label: 'Short',
        width: toMillimetres(10, 'inch'),
        height: toMillimetres(5, 'inch'),
      }),
    ]);
    const diagram = createCuttingDiagram(fabric, result);
    const projectedWasteArea = diagram.wasteRegions.reduce(
      (total, region) => total + region.sourceWidth * region.sourceHeight,
      0,
    );

    expect(diagram.wasteRegions).toContainEqual(
      expect.objectContaining({ kind: 'above-shorter-piece' }),
    );
    expect(projectedWasteArea).toBeCloseTo(result.wasteArea);
  });

  it('creates a complete row-based textual equivalent', () => {
    const fabric = makeFabric();
    const result = makeMixedResult(fabric);
    const alternative = createCuttingDiagram(fabric, result).textAlternative;

    expect(alternative.title).toBe('Fabric A cutting plan');
    expect(alternative.summary).toContain('6 pieces in 2 strips');
    expect(alternative.pieceSummary).toHaveLength(2);
    expect(alternative.pieceGroups).toEqual([
      expect.objectContaining({
        label: 'Large A',
        pieceGroupId: 'a',
        quantity: 2,
      }),
      expect.objectContaining({
        label: 'Small B',
        pieceGroupId: 'b',
        quantity: 4,
      }),
    ]);
    expect(alternative.rows).toHaveLength(result.rows.length);
    expect(alternative.rows[0]).toEqual(
      expect.objectContaining({
        startLabel: '0″',
        heightLabel: '10″',
        runs: expect.arrayContaining([
          expect.objectContaining({
            label: 'Large A',
            dimensionLabel: '20″ × 10″',
          }),
        ]),
      }),
    );
    expect(alternative.rows[0]!.text).toContain('Large A (a)');
    expect(alternative.rows[0]!.text).toContain('Small B (b), instances 1–2');
    expect(alternative.text).toContain(alternative.rows[1]!.text);
  });
});

describe('cutting diagram SVG', () => {
  it('renders accessible, scalable, pattern-coded, and print-safe SVG', () => {
    const fabric = makeFabric();
    const result = makeMixedResult(fabric);
    const diagram = createCuttingDiagram(fabric, result);
    const svg = renderCuttingDiagramSvg(diagram);

    expect(svg).toContain('role="img"');
    expect(svg).toContain('aria-labelledby=');
    expect(svg).toContain('viewBox="0 0');
    expect(svg).toContain('preserveAspectRatio="xMidYMin meet"');
    expect(svg).toContain('@media print');
    expect(svg).toContain('vector-effect:non-scaling-stroke');
    expect(svg).toContain('class="strip-boundary"');
    expect(svg).toContain('Usable width 40″');
    expect(svg).toContain('Used length 20″');
    expect(svg).toContain('fill="url(#cutting-diagram-fabric-a-piece-0)"');
    expect(svg).toContain('fill="url(#cutting-diagram-fabric-a-piece-1)"');
    expect(svg.match(/data-piece-group=/g)).toHaveLength(
      result.placements.length,
    );
  });

  it('draws every piece-group pattern through the tile interior', () => {
    const fabric = makeFabric();
    const svg = renderCuttingDiagramSvg(
      createCuttingDiagram(fabric, makeMixedResult(fabric)),
    );

    expect(svg.match(/class="piece-pattern-mark"/g)).toHaveLength(2);
    expect(svg).toContain('data-pattern-orientation="rising"');
    expect(svg).toContain('d="M0 7 L7 0"');
    expect(svg).toContain('data-pattern-orientation="falling"');
    expect(svg).toContain('d="M0 0 L10 10"');
  });

  it('marks scrap regions and gives in-box text a print-safe soft shadow', () => {
    const fabric = makeFabric();
    const result = optimize(fabric, [
      makePiece({
        id: 'large',
        label: 'Large',
        width: toMillimetres(30, 'inch'),
      }),
      makePiece({
        id: 'short',
        label: 'Short',
        width: toMillimetres(10, 'inch'),
        height: toMillimetres(5, 'inch'),
      }),
    ]);
    const diagram = createCuttingDiagram(fabric, result);
    const svg = renderCuttingDiagramSvg(diagram);

    expect(diagram.wasteRegions.length).toBeGreaterThan(0);
    expect(svg.match(/<g class="waste-region"/g)).toHaveLength(
      diagram.wasteRegions.length,
    );
    expect(svg.match(/<title>Scrap area<\/title>/g)).toHaveLength(
      diagram.wasteRegions.length,
    );
    expect(svg.match(/<g class="waste-label-clip"/g)).toHaveLength(
      diagram.wasteRegions.length,
    );
    expect(svg.match(/data-waste-label-font-size="[\d.]+"/g)).toHaveLength(
      diagram.wasteRegions.length,
    );
    expect(svg).toContain('class="waste-label"');
    expect(svg).toContain('>Scrap</text>');
    expect(svg).toContain('<feDropShadow');
    expect(svg).toContain('flood-color="#fff"');
    expect(svg).toContain('flood-opacity="1"');
    expect(svg).toContain('stdDeviation="3"');
    expect(svg).toContain(
      '.piece-label,.waste-label{stroke:#fff;stroke-width:2.5px;',
    );
    expect(svg).toContain(
      'filter="url(#cutting-diagram-fabric-a-label-shadow)"',
    );
    expect(svg).toContain('.piece-label,.waste-label');
    expect(svg).toContain('class="piece-label print-label-clearance"');
    expect(svg).toContain('class="waste-label print-label-clearance"');
    expect(svg).toContain('.print-label-clearance{display:block;fill:#fff;');
    expect(svg).toContain('stroke-width:7px');
    expect(svg).toContain('stroke:none');
  });

  it('clips vertical scrap labels before rotating the complete word', () => {
    const fabric = makeFabric();
    const result = optimize(fabric, [
      makePiece({
        label: 'Wide piece',
        width: toMillimetres(39, 'inch'),
        height: toMillimetres(10, 'inch'),
      }),
    ]);
    const svg = renderCuttingDiagramSvg(createCuttingDiagram(fabric, result));

    expect(svg).toContain('class="waste-label-clip"');
    expect(svg).toMatch(/data-waste-label-font-size="(?!0(?:\.0+)?")[\d.]+"/);
    expect(svg).toMatch(
      /<g class="waste-label-clip" clip-path="[^"]+"><text class="waste-label print-label-clearance"[^>]+transform="rotate\(-90 [^)]+\)"[^>]*>Scrap<\/text><text class="waste-label"[^>]+data-label-orientation="vertical"[^>]+transform="rotate\(-90 [^)]+\)"[^>]*>Scrap<\/text><\/g>/,
    );
  });

  it('continuously scales scrap text instead of suppressing a tiny region', () => {
    const fabric = makeFabric();
    const result = optimize(fabric, [
      makePiece({
        label: 'Nearly full width',
        width: toMillimetres(39.95, 'inch'),
        height: toMillimetres(1, 'inch'),
      }),
    ]);
    const svg = renderCuttingDiagramSvg(createCuttingDiagram(fabric, result));
    const fontSize = Number(
      svg.match(/data-waste-label-font-size="([\d.]+)"/)?.[1],
    );

    expect(svg).toContain('class="waste-label-clip"');
    expect(svg).toContain('data-label-orientation="vertical"');
    expect(fontSize).toBeGreaterThan(0);
    expect(fontSize).toBeLessThan(6);
  });

  it('shows a direction marker only for directional fabric', () => {
    const directionalFabric = makeFabric({ directional: true });
    const directionalSvg = renderCuttingDiagramSvg(
      createCuttingDiagram(
        directionalFabric,
        makeMixedResult(directionalFabric),
      ),
    );
    const regularSvg = renderCuttingDiagramSvg(
      createCuttingDiagram(makeFabric(), makeMixedResult()),
    );

    expect(directionalSvg).toContain('class="direction-marker"');
    expect(directionalSvg).toContain('Fabric direction runs down the length');
    expect(regularSvg).not.toContain('class="direction-marker"');
  });

  it('keeps a dynamically fitted visible label on every dense piece', () => {
    const fabric = makeFabric();
    const result = optimize(fabric, [
      makePiece({
        id: 'tiny',
        label: 'Tiny square',
        quantity: 16,
        width: toMillimetres(2.5, 'inch'),
        height: toMillimetres(2.5, 'inch'),
      }),
    ]);
    const diagram = createCuttingDiagram(fabric, result);
    const svg = renderCuttingDiagramSvg(diagram);

    expect(svg.match(/<g class="piece"/g)).toHaveLength(16);
    expect(svg.match(/<g class="piece-label-clip"/g)).toHaveLength(16);
    expect(svg.match(/data-label-font-size="[\d.]+"/g)).toHaveLength(16);
    expect(svg).toContain('Tiny square (tiny), instance 16');
    expect(diagram.textAlternative.rows[0]!.text).toContain('instances 1–16');
  });

  it('keeps horizontal text when the intended size already fits', () => {
    const fabric = makeFabric();
    const result = optimize(fabric, [
      makePiece({
        label: 'A',
        width: toMillimetres(4, 'inch'),
        height: toMillimetres(12, 'inch'),
      }),
    ]);
    const svg = renderCuttingDiagramSvg(createCuttingDiagram(fabric, result));
    const fontSize = Number(svg.match(/data-label-font-size="([\d.]+)"/)?.[1]);

    expect(fontSize).toBeGreaterThan(12);
    expect(fontSize).toBeLessThanOrEqual(15);
    expect(svg).toContain('data-label-orientation="horizontal"');
    expect(svg).not.toMatch(/class="piece-label"[^>]+rotate\(-90/);
  });

  it('rotates before shrinking when the intended size fits vertically', () => {
    const fabric = makeFabric();
    const result = optimize(fabric, [
      makePiece({
        label: 'Rectangle',
        width: toMillimetres(2, 'inch'),
        height: toMillimetres(12, 'inch'),
      }),
    ]);
    const svg = renderCuttingDiagramSvg(createCuttingDiagram(fabric, result));
    const fontSize = Number(svg.match(/data-label-font-size="([\d.]+)"/)?.[1]);

    expect(fontSize).toBeGreaterThan(12);
    expect(fontSize).toBeLessThanOrEqual(15);
    expect(svg).toContain('data-label-orientation="vertical"');
    expect(svg).toMatch(
      /class="piece-label"[^>]+transform="rotate\(-90 [^)]+\)"/,
    );
  });

  it('treats mid-word wrapping as a failed fit and rotates narrow boxes', () => {
    const fabric = makeFabric();
    const result = optimize(fabric, [
      makePiece({
        label: 'Rectangle block',
        width: toMillimetres(1.5, 'inch'),
        height: toMillimetres(12, 'inch'),
      }),
    ]);
    const svg = renderCuttingDiagramSvg(createCuttingDiagram(fabric, result));

    expect(svg).toContain('data-label-orientation="vertical"');
    expect(svg).toContain('>Rectangle block</tspan>');
    expect(svg).not.toMatch(/>Rect(?:a(?:n(?:g(?:l(?:e)?)?)?)?)?<\/tspan>/);
  });

  it('chooses the larger fitting scale when both orientations are tight', () => {
    const fabric = makeFabric();
    const result = optimize(fabric, [
      makePiece({
        label: 'HST starting square',
        width: toMillimetres(8, 'inch'),
        height: toMillimetres(0.75, 'inch'),
      }),
    ]);
    const svg = renderCuttingDiagramSvg(createCuttingDiagram(fabric, result));
    const fontSize = Number(svg.match(/data-label-font-size="([\d.]+)"/)?.[1]);

    expect(svg).toContain('data-label-orientation="horizontal"');
    expect(fontSize).toBeGreaterThan(0);
    expect(fontSize).toBeLessThan(12);
    expect(svg).toContain('class="piece-label-clip"');
  });

  it('wraps long labels before reducing their font size', () => {
    const fabric = makeFabric();
    const result = optimize(fabric, [
      makePiece({
        label: 'HST starting square',
        width: toMillimetres(4, 'inch'),
        height: toMillimetres(6, 'inch'),
      }),
    ]);
    const svg = renderCuttingDiagramSvg(createCuttingDiagram(fabric, result));
    const fontSize = Number(svg.match(/data-label-font-size="([\d.]+)"/)?.[1]);

    expect(fontSize).toBeGreaterThan(12);
    expect(fontSize).toBeLessThanOrEqual(15);
    expect(svg).toMatch(/data-label-lines="[3-9]"/);
    expect(svg).toContain('data-label-orientation="vertical"');
    expect(svg).toContain('class="piece-label-line"');
  });

  it('uses larger starting text when a piece box has room for it', () => {
    const fabric = makeFabric();
    const result = optimize(fabric, [
      makePiece({
        label: 'Large piece',
        width: toMillimetres(20, 'inch'),
        height: toMillimetres(10, 'inch'),
      }),
    ]);
    const svg = renderCuttingDiagramSvg(createCuttingDiagram(fabric, result));
    const fontSize = Number(svg.match(/data-label-font-size="([\d.]+)"/)?.[1]);

    expect(fontSize).toBeGreaterThan(12);
    expect(fontSize).toBeLessThanOrEqual(24);
  });

  it('shrinks and clips wrapped text to keep every visible label inside its piece', () => {
    const fabric = makeFabric();
    const result = optimize(fabric, [
      makePiece({
        label: 'HST starting square',
        width: toMillimetres(5, 'inch'),
        height: toMillimetres(2.5, 'inch'),
      }),
    ]);
    const svg = renderCuttingDiagramSvg(createCuttingDiagram(fabric, result));
    const fontSize = Number(svg.match(/data-label-font-size="([\d.]+)"/)?.[1]);

    expect(fontSize).toBeGreaterThanOrEqual(6);
    expect(fontSize).toBeLessThan(12);
    expect(svg).toContain(
      '<clipPath id="cutting-diagram-fabric-a-piece-label-0">',
    );
    expect(svg).toContain(
      'clip-path="url(#cutting-diagram-fabric-a-piece-label-0)"',
    );
  });

  it('escapes user-provided labels and identifiers in SVG markup', () => {
    const fabric = makeFabric({ id: 'fabric <unsafe>', name: 'A & B' });
    const result = optimize(fabric, [
      makePiece({ id: 'piece"unsafe', label: '<script>alert(1)</script>' }),
    ]);
    const svg = renderCuttingDiagramSvg(createCuttingDiagram(fabric, result));

    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(svg).toContain('data-piece-group="piece&quot;unsafe"');
    expect(svg).toContain(
      '<title id="cutting-diagram-fabric-unsafe--title">A &amp; B',
    );
  });

  it('rejects a display size with no positive drawing area', () => {
    const fabric = makeFabric();
    const result = makeMixedResult(fabric);

    expect(() =>
      createCuttingDiagram(fabric, result, { width: 100, padding: 50 }),
    ).toThrow(RangeError);
  });

  it('rejects optimizer geometry paired with the wrong usable width', () => {
    const fabric = makeFabric();
    const result = makeMixedResult(fabric);

    expect(() =>
      createCuttingDiagram(
        makeFabric({ usableWidth: toMillimetres(30, 'inch') }),
        result,
      ),
    ).toThrow('Optimizer placements must fit the supplied fabric');
  });
});
