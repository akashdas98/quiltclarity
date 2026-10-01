import { describe, expect, it } from 'vitest';
import {
  compileCutListPaste,
  parseCutListDimension,
  previewCutListPaste,
} from '../src/lib/domain';

const fabrics = [
  { id: 'blue', name: 'Blue' },
  { id: 'cream', name: 'Cream' },
];

describe('cut-list compiler', () => {
  it('parses decimals, mixed fractions, Unicode fractions, and explicit units', () => {
    expect(parseCutListDimension('3 1/2', 'imperial')).toBeCloseTo(88.9, 10);
    expect(parseCutListDimension('2½ in', 'metric')).toBe(63.5);
    expect(parseCutListDimension('12.5 cm', 'imperial')).toBe(125);
    expect(parseCutListDimension('40 mm', 'imperial')).toBe(40);
    expect(
      parseCutListDimension('about five inches', 'imperial'),
    ).toBeUndefined();
  });

  it('recognizes the recommended header and maps exact fabric names deterministically', () => {
    const source = [
      'Fabric\tLabel\tQty\tWidth\tHeight\tSize mode',
      'blue\tCorner square\t8\t3 1/2\t3 1/2\tcut',
      'Cream\tBlock\t2\t10 cm\t20 cm\tFinished',
    ].join('\n');
    const preview = previewCutListPaste(source, fabrics, 'imperial');
    expect(preview.headerDetected).toBe(true);
    expect(preview.canImport).toBe(true);
    expect(preview.rows.map((row) => row.fabricId)).toEqual(['blue', 'cream']);
    expect(previewCutListPaste(source, fabrics, 'imperial')).toEqual(preview);
  });

  it('accepts the documented positional layout without a header', () => {
    const preview = previewCutListPaste(
      'Blue\tSquare\t4\t5\t5\tCut',
      fabrics,
      'imperial',
    );
    expect(preview.headerDetected).toBe(false);
    expect(preview.canImport).toBe(true);
  });

  it('auto-detects CSV and preserves quoted commas and escaped quotes', () => {
    const source = [
      'Fabric,Label,Qty,Width,Height,Size mode',
      'Blue,"Star, ""large""",2,5,5,Cut',
      'Cream,Background,4,5,5,Finished',
    ].join('\n');
    const preview = previewCutListPaste(source, fabrics, 'imperial');
    expect(preview.sourceFormat).toBe('csv');
    expect(preview.headerDetected).toBe(true);
    expect(preview.canImport).toBe(true);
    expect(preview.rows[0]).toEqual(
      expect.objectContaining({
        fabricId: 'blue',
        label: 'Star, "large"',
        quantity: 2,
      }),
    );
  });

  it('reports malformed CSV quoting without discarding the preview row', () => {
    const preview = previewCutListPaste(
      'Blue,"Unclosed label,2,5,5,Cut',
      fabrics,
      'imperial',
    );
    expect(preview.sourceFormat).toBe('csv');
    expect(preview.canImport).toBe(false);
    expect(preview.rows[0]?.issues).toContainEqual({
      column: 'row',
      message: 'A quoted field is not closed.',
    });
  });

  it('flags malformed cells and refuses arbitrary prose', () => {
    const preview = previewCutListPaste(
      'Blue\tMystery\ttwo\tabout 5\t6 x 8\tmaybe',
      fabrics,
      'imperial',
    );
    expect(preview.canImport).toBe(false);
    expect(preview.rows[0]?.issues.map((issue) => issue.column)).toEqual([
      'quantity',
      'width',
      'height',
      'dimensionMode',
    ]);
    expect(() => compileCutListPaste(preview, () => 'piece')).toThrow(
      'Resolve every paste preview error',
    );
  });

  it('requires explicit mapping for an unmatched fabric before import', () => {
    const source = 'Navy\tStar\t6\t4\t4\tCut';
    const unresolved = previewCutListPaste(source, fabrics, 'imperial');
    expect(unresolved.canImport).toBe(false);
    expect(unresolved.rows[0]?.issues[0]?.column).toBe('fabric');

    const resolved = previewCutListPaste(source, fabrics, 'imperial', [
      { sourceFabric: 'Navy', fabricId: 'blue' },
    ]);
    let id = 0;
    expect(compileCutListPaste(resolved, () => `import-${++id}`)).toEqual([
      expect.objectContaining({
        id: 'import-1',
        fabricId: 'blue',
        label: 'Star',
        quantity: 6,
        width: 101.6,
        height: 101.6,
        dimensionMode: 'cut',
        orientation: 'none',
        isWofStrip: false,
      }),
    ]);
  });

  it('rejects missing or extra positional columns instead of shifting meanings', () => {
    expect(
      previewCutListPaste('Blue\tSquare\t4\t5\tCut', fabrics, 'imperial')
        .rows[0]?.issues[0],
    ).toEqual({ column: 'row', message: 'Expected 6 tab-separated columns.' });
    expect(
      previewCutListPaste(
        'Blue\tSquare\t4\t5\t5\tCut\textra',
        fabrics,
        'imperial',
      ).canImport,
    ).toBe(false);
    expect(
      previewCutListPaste('Blue,Square,4,5,Cut', fabrics, 'imperial').rows[0]
        ?.issues[0],
    ).toEqual({ column: 'row', message: 'Expected 6 CSV columns.' });
  });
});
