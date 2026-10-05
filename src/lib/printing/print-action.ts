export interface PrintActionSignals {
  userAgent?: string;
  platform?: string;
  maxTouchPoints?: number;
  userAgentDataMobile?: boolean;
}

/** Select the PDF path for phones and tablets, independent of viewport width. */
export function shouldExportPlannerPdf(signals: PrintActionSignals): boolean {
  if (signals.userAgentDataMobile === true) return true;

  const userAgent = signals.userAgent ?? '';
  if (/Android|iPhone|iPad|iPod|Mobile|Silk|Kindle/i.test(userAgent)) {
    return true;
  }

  // iPadOS can present a desktop Macintosh UA, identical to a Mac's. The
  // platform plus multi-touch signal distinguishes the usual iPad case;
  // spoofed UA/platform values cannot be identified with certainty.
  return (
    (/^(MacIntel|Macintosh)$/i.test(signals.platform ?? '') ||
      /Macintosh/i.test(userAgent)) &&
    (signals.maxTouchPoints ?? 0) > 1
  );
}
