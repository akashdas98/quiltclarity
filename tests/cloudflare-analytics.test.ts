import { describe, expect, it, vi } from 'vitest';
import { emitAnalytics } from '../src/lib/analytics';
import { projectProviderEvent } from '../src/lib/analytics/provider-projection';
import { startCloudflareAnalytics } from '../src/lib/analytics/cloudflare-analytics';

const config = {
  enabled: true,
  staging: false,
  canonicalPath: '/fabric-cutting-planner/',
};

function environment(fetcher = vi.fn(() => Promise.resolve(new Response()))) {
  return {
    origin: 'https://quiltclarity.com',
    doNotTrack: null,
    globalPrivacyControl: false,
    fetch: fetcher as unknown as typeof fetch,
    setTimeout: vi.fn(() => 1) as unknown as typeof setTimeout,
    clearTimeout: vi.fn(),
  };
}

describe('Cloudflare analytics privacy boundary', () => {
  it('projects valid categorical fields and removes unknown fields', () => {
    expect(
      projectProviderEvent({
        name: 'tool_viewed',
        tool: 'planner',
        toolId: 'fabric-cutting-planner',
        returning_user: false,
        projectName: 'Secret quilt',
        path: '/secret?piece=Alice',
      }),
    ).toEqual({
      name: 'tool_viewed',
      tool: 'planner',
      toolId: 'fabric-cutting-planner',
      returning_user: false,
    });
    expect(
      projectProviderEvent({ name: 'fabric_added', metadata: { secret: 'x' } }),
    ).toEqual({ name: 'fabric_added' });
  });

  it('rejects malformed event names, combinations, and category values', () => {
    for (const value of [
      { name: 'new_event', note: 'secret' },
      {
        name: 'tool_viewed',
        tool: 'planner',
        toolId: 'batting',
        returning_user: false,
      },
      { name: 'calculator_started', calculator: 'user supplied' },
      {
        name: 'guide_started',
        guide_slug: '/secret',
        guide_category: 'workflow',
      },
      { name: 'plan_calculation_failed', error_category: 'private message' },
      {
        name: 'tool_viewed',
        tool: 'planner',
        toolId: 'fabric-cutting-planner',
        returning_user: 'true',
      },
      null,
    ])
      expect(projectProviderEvent(value)).toBeNull();
  });

  it('sends nothing unless build, origin, index, and privacy gates allow it', () => {
    for (const blocked of [
      { ...config, enabled: false },
      { ...config, staging: true },
      { ...config, canonicalPath: '/planner/?secret=1' },
    ]) {
      const env = environment();
      expect(startCloudflareAnalytics(blocked, env)).toBe(false);
      expect(env.fetch).not.toHaveBeenCalled();
    }
    for (const override of [
      { origin: 'http://quiltclarity.com' },
      { origin: 'https://preview.quiltclarity.com' },
      { doNotTrack: '1' },
      { globalPrivacyControl: true },
    ]) {
      const env = { ...environment(), ...override };
      expect(startCloudflareAnalytics(config, env)).toBe(false);
      expect(env.fetch).not.toHaveBeenCalled();
    }
  });

  it('posts a fixed pageview first, drains ordinary bursts, and bounds overflow', async () => {
    const env = environment();
    vi.stubEnv('PUBLIC_CLOUDFLARE_ANALYTICS_ENABLED', 'true');
    expect(startCloudflareAnalytics(config, env)).toBe(true);
    expect(env.fetch).toHaveBeenCalledOnce();
    const [url, init] = vi.mocked(env.fetch).mock.calls[0]!;
    expect(url).toBe('/api/analytics');
    expect(init).toMatchObject({
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      keepalive: true,
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      version: 1,
      path: '/fabric-cutting-planner/',
      event: { name: 'pageview' },
    });

    vi.stubGlobal('window', {
      dispatchEvent: () => {
        throw new Error('observer failed');
      },
      dataLayer: new Proxy([], {
        get: (_target, key) =>
          key === 'push'
            ? () => {
                throw new Error('layer failed');
              }
            : undefined,
      }),
    });
    vi.stubGlobal(
      'CustomEvent',
      class {
        constructor(
          _name: string,
          public options: unknown,
        ) {}
      },
    );
    try {
      emitAnalytics({ name: 'fabric_added' });
      expect(env.fetch).toHaveBeenCalledTimes(2);
      const eventInit = vi.mocked(env.fetch).mock.calls[1]![1];
      expect(JSON.parse(String(eventInit?.body))).toEqual({
        version: 1,
        path: '/fabric-cutting-planner/',
        event: { name: 'fabric_added' },
      });
      for (let index = 0; index < 10; index += 1)
        expect(() => emitAnalytics({ name: 'fabric_added' })).not.toThrow();
      expect(env.fetch).toHaveBeenCalledTimes(4);
      const firstSignal = vi.mocked(env.fetch).mock.calls[0]![1]?.signal;
      const timeoutCallback = vi.mocked(env.setTimeout).mock.calls[0]![0];
      if (typeof timeoutCallback === 'function') timeoutCallback();
      expect(firstSignal?.aborted).toBe(true);
      expect(env.fetch).toHaveBeenCalledTimes(5);
      for (let index = 0; index < 20; index += 1) await Promise.resolve();
      expect(env.fetch).toHaveBeenCalledTimes(12);

      for (let index = 0; index < 100; index += 1)
        emitAnalytics({ name: 'fabric_added' });
      expect(env.fetch).toHaveBeenCalledTimes(16);
      for (let index = 0; index < 80; index += 1) await Promise.resolve();
      expect(env.fetch).toHaveBeenCalledTimes(48);
      vi.mocked(env.fetch).mockImplementationOnce(() => {
        throw new Error('network blocked');
      });
      expect(() => emitAnalytics({ name: 'fabric_added' })).not.toThrow();
      expect(env.fetch).toHaveBeenCalledTimes(49);
      expect(startCloudflareAnalytics(config, env)).toBe(false);
      expect(env.fetch).toHaveBeenCalledTimes(49);
    } finally {
      vi.unstubAllGlobals();
      vi.unstubAllEnvs();
    }
  });
});
