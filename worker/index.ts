import {
  analyticsDataPoint,
  projectAnalyticsEnvelope,
} from '../src/lib/analytics/envelope';

const ORIGIN = 'https://quiltclarity.com';
const ENDPOINT = '/api/analytics';
const MAX_BODY_BYTES = 4096;

interface WorkerEnvironment {
  ANALYTICS_ENABLED?: string;
  quiltclarity_analytics_engine?: {
    writeDataPoint(point: {
      blobs: string[];
      indexes: string[];
      doubles: number[];
    }): void;
  };
  ASSETS: { fetch(request: Request): Promise<Response> };
}

async function readBoundedBody(request: Request): Promise<string | null> {
  if (!request.body) return null;
  const declared = request.headers.get('Content-Length');
  if (declared !== null && Number(declared) > MAX_BODY_BYTES) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    const joined = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      joined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new TextDecoder('utf-8', { fatal: true }).decode(joined);
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export async function handleAnalyticsRequest(
  request: Request,
  env: WorkerEnvironment,
): Promise<Response> {
  const url = new URL(request.url);
  if (request.method !== 'POST') return new Response(null, { status: 405 });
  if (url.search || url.hash) return new Response(null, { status: 404 });
  if (url.origin !== ORIGIN || request.headers.get('Origin') !== ORIGIN) {
    return new Response(null, { status: 403 });
  }
  if (
    request.headers.get('DNT') === '1' ||
    request.headers.get('Sec-GPC') === '1'
  ) {
    return new Response(null, { status: 204 });
  }
  if (
    !request.headers
      .get('Content-Type')
      ?.match(/^application\/json(?:\s*;\s*charset=utf-8)?$/i)
  ) {
    return new Response(null, { status: 415 });
  }
  if (env.ANALYTICS_ENABLED !== 'true' || !env.quiltclarity_analytics_engine) {
    return new Response(null, { status: 204 });
  }
  const body = await readBoundedBody(request);
  if (body === null) return new Response(null, { status: 413 });
  let raw: unknown;
  try {
    raw = JSON.parse(body);
  } catch {
    return new Response(null, { status: 400 });
  }
  const envelope = projectAnalyticsEnvelope(raw);
  if (!envelope) return new Response(null, { status: 400 });
  try {
    // Analytics Engine queues a point; 204 is not a durable storage receipt.
    env.quiltclarity_analytics_engine.writeDataPoint(
      analyticsDataPoint(envelope),
    );
  } catch {
    // Measurement must not affect the static product.
  }
  return new Response(null, { status: 204 });
}

export default {
  fetch(request: Request, env: WorkerEnvironment): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === ENDPOINT) return handleAnalyticsRequest(request, env);
    return env.ASSETS.fetch(request);
  },
};
