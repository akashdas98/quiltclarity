import {
  clearAnalyticsProviderQueue,
  configureAnalyticsProvider,
} from './analytics';
import { projectProviderEvent } from './provider-projection';

const ENDPOINT = 'https://queue.simpleanalyticscdn.com/events';
const HOSTNAME = 'quiltclarity.com';
const AGENT = 'QuiltClarity/1.0';
const MAX_IN_FLIGHT = 4;
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

export interface SimpleAnalyticsConfig {
  enabled: boolean;
  staging: boolean;
  canonicalPath: string;
}

/** Install only on the production apex. The caller supplies a build-time path. */
export function startSimpleAnalytics(
  config: SimpleAnalyticsConfig,
  environment: TransportEnvironment,
): boolean {
  if (started) return false;
  if (
    !config.enabled ||
    config.staging ||
    environment.origin !== `https://${HOSTNAME}` ||
    environment.doNotTrack === '1' ||
    environment.globalPrivacyControl === true ||
    !/^\/(?:[a-z0-9-]+\/)*$/.test(config.canonicalPath)
  ) {
    clearAnalyticsProviderQueue();
    configureAnalyticsProvider(() => undefined);
    return false;
  }
  started = true;

  let inFlight = 0;
  const pending: Record<string, unknown>[] = [];
  const pump = (): void => {
    while (inFlight < MAX_IN_FLIGHT && pending.length > 0) {
      const payload = pending.shift()!;
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
            mode: 'cors',
            cache: 'no-store',
            credentials: 'omit',
            referrerPolicy: 'no-referrer',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
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
  const post = (payload: Record<string, unknown>): void => {
    if (pending.length >= 32) return;
    pending.push(payload);
    pump();
  };

  const shared = {
    hostname: HOSTNAME,
    path: config.canonicalPath,
    ua: AGENT,
  };
  post({ type: 'pageview', ...shared, event: 'pageview' });
  configureAnalyticsProvider((value) => {
    const event = projectProviderEvent(value);
    if (!event) return;
    const { name, ...metadata } = event;
    post({ type: 'event', ...shared, event: name, metadata });
  });
  return true;
}
