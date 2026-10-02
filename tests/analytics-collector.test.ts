import { describe, expect, it, vi } from 'vitest';
import {
  analyticsDataPoint,
  projectAnalyticsEnvelope,
} from '../src/lib/analytics/envelope';
import { INDEXABLE_PATHS } from '../src/lib/analytics/canonical-paths';
import worker, { handleAnalyticsRequest } from '../worker/index';

const origin = 'https://quiltclarity.com';
function request(
  value: unknown,
  options: {
    path?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {},
) {
  return new Request(`${origin}${options.path ?? '/api/analytics'}`, {
    method: options.method ?? 'POST',
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body:
      options.method === 'GET'
        ? undefined
        : (options.body ?? JSON.stringify(value)),
  });
}
function bindings() {
  return {
    ANALYTICS_ENABLED: 'true',
    ANALYTICS: { writeDataPoint: vi.fn() },
    ASSETS: { fetch: vi.fn(async () => new Response('asset')) },
  };
}

describe('Cloudflare analytics collector', () => {
  it('shares exactly 38 indexable paths and projects all untrusted extras', () => {
    expect(INDEXABLE_PATHS).toHaveLength(38);
    expect(
      projectAnalyticsEnvelope({
        version: 1,
        path: '/about/',
        event: { name: 'pageview', secret: 'x' },
        secret: 'y',
      }),
    ).toEqual({ version: 1, path: '/about/', event: { name: 'pageview' } });
    const projected = projectAnalyticsEnvelope({
      version: 1,
      path: '/fabric-cutting-planner/',
      event: {
        name: 'tool_viewed',
        tool: 'planner',
        toolId: 'fabric-cutting-planner',
        returning_user: false,
        projectName: 'Secret quilt',
        metadata: { secret: 'x' },
      },
    });
    expect(projected).toEqual({
      version: 1,
      path: '/fabric-cutting-planner/',
      event: {
        name: 'tool_viewed',
        tool: 'planner',
        toolId: 'fabric-cutting-planner',
        returning_user: false,
      },
    });
    expect(analyticsDataPoint(projected!)).toEqual({
      blobs: [
        '1',
        '/fabric-cutting-planner/',
        'tool_viewed',
        '{"tool":"planner","toolId":"fabric-cutting-planner","returning_user":false}',
      ],
      indexes: ['tool_viewed'],
      doubles: [1],
    });
    for (const path of [
      '/corrections/',
      '/404/',
      '/about/?secret=1',
      '/ABOUT/',
      '//about/',
      '/guides/how-to-calculate-quilt-yardage/',
    ])
      expect(
        projectAnalyticsEnvelope({
          version: 1,
          path,
          event: { name: 'pageview' },
        }),
      ).toBeNull();
    expect(
      projectAnalyticsEnvelope({
        version: 1,
        path: '/about/',
        event: { name: 'calculator_started', calculator: 'private' },
      }),
    ).toBeNull();
  });

  it('routes assets and accepts only bounded same-origin categorical JSON', async () => {
    const env = bindings();
    expect(
      (await worker.fetch(new Request(`${origin}/about/`), env)).status,
    ).toBe(200);
    expect(env.ASSETS.fetch).toHaveBeenCalledOnce();
    expect(
      (
        await handleAnalyticsRequest(
          request({ version: 1, path: '/about/', event: { name: 'pageview' } }),
          env,
        )
      ).status,
    ).toBe(204);
    expect(env.ANALYTICS.writeDataPoint).toHaveBeenCalledWith({
      blobs: ['1', '/about/', 'pageview', '{}'],
      indexes: ['pageview'],
      doubles: [1],
    });
    expect(env.ANALYTICS.writeDataPoint).toHaveBeenCalledTimes(1);
    for (const req of [
      request({}, { method: 'GET' }),
      request({}, { path: '/api/analytics?secret=1' }),
      request({}, { headers: { Origin: 'https://evil.test' } }),
      request({}, { headers: { 'Content-Type': 'text/plain' } }),
      request({
        version: 1,
        path: '/corrections/',
        event: { name: 'pageview' },
      }),
      request({}, { body: 'x'.repeat(4097) }),
      request({}, { body: '{bad json' }),
    ])
      expect((await handleAnalyticsRequest(req, env)).status).not.toBe(204);
    expect(env.ANALYTICS.writeDataPoint).toHaveBeenCalledTimes(1);
    for (const header of ['DNT', 'Sec-GPC'])
      expect(
        (
          await handleAnalyticsRequest(
            request({}, { headers: { [header]: '1' } }),
            env,
          )
        ).status,
      ).toBe(204);
    const disabled = { ...bindings(), ANALYTICS_ENABLED: 'false' };
    expect(
      (await handleAnalyticsRequest(request({}, { body: 'invalid' }), disabled))
        .status,
    ).toBe(204);
    expect(disabled.ANALYTICS.writeDataPoint).not.toHaveBeenCalled();
    const failing = bindings();
    failing.ANALYTICS.writeDataPoint.mockImplementation(() => {
      throw new Error('binding down');
    });
    expect(
      (
        await handleAnalyticsRequest(
          request({ version: 1, path: '/', event: { name: 'pageview' } }),
          failing,
        )
      ).status,
    ).toBe(204);
  });

  it('stops reading as soon as a streaming request exceeds 4 KiB', async () => {
    let pulls = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulls += 1;
        controller.enqueue(new Uint8Array(4097));
      },
    });
    const req = new Request(`${origin}/api/analytics`, {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body,
      duplex: 'half',
    } as RequestInit & { duplex: 'half' });
    const env = bindings();
    expect((await handleAnalyticsRequest(req, env)).status).toBe(413);
    expect(pulls).toBeLessThanOrEqual(2);
    expect(env.ANALYTICS.writeDataPoint).not.toHaveBeenCalled();
  });
});
