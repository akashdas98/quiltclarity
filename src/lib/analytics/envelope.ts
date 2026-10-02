import type { AnalyticsEvent } from './analytics';
import { isIndexablePath } from './canonical-paths';
import { projectProviderEvent } from './provider-projection';

export interface AnalyticsEnvelope {
  version: 1;
  path: string;
  event: AnalyticsEvent | { name: 'pageview' };
}

/** This is the only shape allowed across the browser/collector boundary. */
export function projectAnalyticsEnvelope(
  value: unknown,
): AnalyticsEnvelope | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return null;
  try {
    const source = value as Record<string, unknown>;
    if (source.version !== 1 || !isIndexablePath(source.path)) return null;
    const rawEvent = source.event;
    if (
      typeof rawEvent !== 'object' ||
      rawEvent === null ||
      Array.isArray(rawEvent)
    )
      return null;
    const event =
      (rawEvent as Record<string, unknown>).name === 'pageview'
        ? { name: 'pageview' as const }
        : projectProviderEvent(rawEvent);
    return event ? { version: 1, path: source.path, event } : null;
  } catch {
    return null;
  }
}

export function analyticsDataPoint(envelope: AnalyticsEnvelope): {
  blobs: string[];
  indexes: string[];
  doubles: number[];
} {
  const { name, ...properties } = envelope.event;
  return {
    blobs: ['1', envelope.path, name, JSON.stringify(properties)],
    indexes: [name],
    doubles: [1],
  };
}
