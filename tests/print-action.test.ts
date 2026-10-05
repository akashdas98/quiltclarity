import { describe, expect, it } from 'vitest';
import { shouldExportPlannerPdf } from '../src/lib/printing/print-action';

describe('planner print action', () => {
  it.each([
    ['mobile client hint', { userAgentDataMobile: true }, true],
    [
      'Android tablet',
      {
        userAgent:
          'Mozilla/5.0 (Linux; Android 14; Pixel Tablet) AppleWebKit/537.36 Chrome/125 Safari/537.36',
      },
      true,
    ],
    [
      'iPhone',
      {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
      },
      true,
    ],
    [
      'iPad desktop UA',
      {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Safari/605.1.15',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      },
      true,
    ],
    [
      'iPad desktop UA without platform',
      {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Safari/605.1.15',
        maxTouchPoints: 5,
      },
      true,
    ],
    [
      'Mac desktop',
      {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Safari/605.1.15',
        platform: 'MacIntel',
        maxTouchPoints: 0,
      },
      false,
    ],
    [
      'touch Windows desktop',
      {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36',
        platform: 'Win32',
        maxTouchPoints: 10,
      },
      false,
    ],
    [
      'Firefox desktop',
      {
        userAgent:
          'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
        platform: 'Linux x86_64',
      },
      false,
    ],
    ['absent signals', {}, false],
  ] as const)('%s selects %s', (_name, signals, expected) => {
    expect(shouldExportPlannerPdf(signals)).toBe(expected);
  });
});
