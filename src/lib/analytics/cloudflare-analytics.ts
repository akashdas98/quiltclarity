import {
  clearAnalyticsProviderQueue,
  configureAnalyticsProvider,
} from './analytics';
import { projectAnalyticsEnvelope } from './envelope';

const ENDPOINT = '/api/analytics';
const PRODUCTION_ORIGIN = 'https://quiltclarity.com';
const MAX_IN_FLIGHT = 4;
const MAX_PENDING = 32;
const REQUEST_TIMEOUT_MS = 5000;
let started = false;

interface TransportEnvironment {
  origin: string;
  doNotTrack?: string | null;
  globalPrivacyControl?: boolean;
  fetch: typeof fetch;
  setTimeout: typeof setTimeout;
  clearTimeout: typeof clearTimeout;
}

export interface CloudflareAnalyticsConfig {
  enabled: boolean;
  staging: boolean;
  canonicalPath: string;
}

export function startCloudflareAnalytics(
  config: CloudflareAnalyticsConfig,
  environment: TransportEnvironment,
): boolean {
  if (started) return false;
  if (
    !config.enabled ||
    config.staging ||
    environment.origin !== PRODUCTION_ORIGIN ||
    environment.doNotTrack === '1' ||
    environment.globalPrivacyControl === true ||
    !projectAnalyticsEnvelope({
      version: 1,
      path: config.canonicalPath,
      event: { name: 'pageview' },
    })
  ) {
    clearAnalyticsProviderQueue();
    configureAnalyticsProvider(() => undefined);
    return false;
  }
  started = true;

  let inFlight = 0;
  const pending: string[] = [];
  const pump = (): void => {
    while (inFlight < MAX_IN_FLIGHT && pending.length > 0) {
      const body = pending.shift()!;
      inFlight += 1;
      const controller = new AbortController();
      let finished = false;
      const finish = (): void => {
        if (finished) return;
        finished = true;
        environment.clearTimeout(timeout);
        inFlight -= 1;
        pump();
      };
      const timeout = environment.setTimeout(() => {
        controller.abort();
        finish();
      }, REQUEST_TIMEOUT_MS);
      try {
        Promise.resolve(
          environment.fetch(ENDPOINT, {
            method: 'POST',
            cache: 'no-store',
            credentials: 'omit',
            referrerPolicy: 'no-referrer',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
            body,
            signal: controller.signal,
          }),
        )
          .catch(() => undefined)
          .finally(finish);
      } catch {
        finish();
      }
    }
  };
  const post = (event: unknown): void => {
    const envelope = projectAnalyticsEnvelope({
      version: 1,
      path: config.canonicalPath,
      event,
    });
    if (!envelope || pending.length >= MAX_PENDING) return;
    pending.push(JSON.stringify(envelope));
    pump();
  };
  post({ name: 'pageview' });
  configureAnalyticsProvider(post);
  return true;
}
