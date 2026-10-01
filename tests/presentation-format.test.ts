import { describe, expect, it } from 'vitest';

import { formatWasteArea, formatWasteAreaValue } from '../src/lib/presentation';

describe('waste-area presentation', () => {
  it('uses square inches for imperial results', () => {
    expect(formatWasteAreaValue(193_548, 'imperial')).toBe('300 in²');
    expect(formatWasteArea(193_548, 'imperial')).toBe('Waste area: 300 in²');
  });

  it('uses square centimetres for metric results', () => {
    expect(formatWasteAreaValue(193_548, 'metric')).toBe('1935.5 cm²');
    expect(formatWasteArea(193_548, 'metric')).toBe('Waste area: 1935.5 cm²');
  });

  it('uses beginner-friendly zero-waste copy', () => {
    expect(formatWasteArea(0, 'imperial')).toBe('No unused area');
    expect(formatWasteArea(0, 'metric')).toBe('No unused area');
  });
});
